from flask import Flask, render_template, Response, request
import sqlite3, json
import os
from os import  path
import numpy as np
import codecs
import pandas as pd

app = Flask(__name__)

# get the script file current directory
ROOT = path.dirname(path.realpath(__file__))

# sqlite3 database
DATABASE = 'Trinotate.sqlite'

@app.route('/')
def index():
    return render_template('getannotations.html')

@app.route('/fetchID')
def function_fetchID():
    return render_template('fetchID.html')

@app.route('/getannotations')
def function_getannotations():
    return render_template('getannotations.html')

@app.route('/getBlastResults')
def function_getIDtoexpression():
    return render_template('getBlastResults.html')

@app.route('/getHMMPfamresults')
def function_getHMMPfamresults():
    return render_template('getHMMPfamresults.html')

@app.route('/feature_report')
def function_feature_report():
    return render_template('feature_report.html')

# Get the Trinity Report Data
@app.route('/databases/trinity_report.csv')
def get_trinity_report_data():
    with open("databases/trinity_report.csv", "r") as file:
        content = file.read()
    return Response(content, mimetype='text/plain')

# Get the Samples Data
@app.route('/databases/organisms_data.csv')
def get_organisms_data():
    with open("databases/organisms_data.csv", "r") as file:
        content = file.read()
    return Response(content, mimetype='text/plain')

# Transcript annotation search tool
@app.route('/api/getannotations/<textID>')
def function_getannotations_json(textID):
    conexao = sqlite3.connect(DATABASE)
    cursor = conexao.cursor()
    cursor.execute("SELECT gene_id,transcript_id,annotation FROM Transcript where annotation like '%"+textID+"%'")
    resultado = cursor.fetchall()
    conexao.close()
    return Response(json.dumps(resultado),  mimetype='application/json')

# Blast results page based on Trinity ID and accession ID
@app.route('/api/getBlastResults/<getBlastResults>')
def function_getBlastResults_json_cp(getBlastResults):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("SELECT TrinityID,FullAccession,QueryStart,QueryEnd,QueryCoverage,HitStart,HitEnd,HitCoverage,PercentIdentity,Evalue,BitScore,DatabaseSource FROM BlastDbase where TrinityID like '%"+getBlastResults+"%'")
    resultado = cursor.fetchall()
    conexao.close()  
    return Response(json.dumps(resultado),  mimetype='application/json')

@app.route('/api/getBlastResults/<getBlastResults>/accessionID')
def function_getBlastResults_accession_json_cp(getBlastResults):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("SELECT TrinityID,FullAccession,QueryStart,QueryEnd,QueryCoverage,HitStart,HitEnd,HitCoverage,PercentIdentity,Evalue,BitScore,DatabaseSource FROM BlastDbase where FullAccession like '%"+getBlastResults+"%'")
    resultado = cursor.fetchall()
    conexao.close()  
    return Response(json.dumps(resultado),  mimetype='application/json')


# Pfam results page
@app.route('/api/getHMMPfamresults/<getHMMPfamresults>')
def function_getHMMPfamresults_trinityID(getHMMPfamresults):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("SELECT HMMERDbase.HMMERDomain as DomainID, HMMERDbase.QueryStartAlign, HMMERDbase.QueryEndAlign, HMMERDbase.PFAMStartAlign, HMMERDbase.PFAMEndAlign, pfam_accession, pfam_domainname, pfam_domaindescription, HMMERDbase.ThisDomainEvalue FROM PFAMreference INNER JOIN HMMERDbase ON HMMERDbase.QueryProtID = PFAMreference.pfam_domainname where HMMERDbase.HMMERDomain like '%"+getHMMPfamresults+"%'")
    resultado = cursor.fetchall()
    conexao.close()
    return Response(json.dumps(resultado),  mimetype='application/json')

@app.route('/api/getHMMPfamresults/pfamAC/<getHMMPfamresults>')
def function_getHMMPfamresults_pfamname(getHMMPfamresults):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("SELECT HMMERDbase.HMMERDomain as DomainID, HMMERDbase.QueryStartAlign, HMMERDbase.QueryEndAlign, HMMERDbase.PFAMStartAlign, HMMERDbase.PFAMEndAlign, pfam_accession, pfam_domainname, pfam_domaindescription, HMMERDbase.ThisDomainEvalue FROM PFAMreference INNER JOIN HMMERDbase ON HMMERDbase.QueryProtID = PFAMreference.pfam_domainname where pfam_accession like '%"+getHMMPfamresults+"%'")
    resultado = cursor.fetchall()
    conexao.close()
    return Response(json.dumps(resultado),  mimetype='application/json')


######## multi-sample expression heatmap area ########
@app.route('/multiSampleHM')
def graphs_canvas():
    return render_template('multiSampleHM.html')

@app.route('/api/database/<minFC>/<maxFDR>/<featureType>')
def api_graphs(minFC, maxFDR, featureType):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("SELECT DISTINCT "+
                        "Expression.feature_name, "+                      
                        "replicate_name, "+
                        "Expression.fpkm "+
                    "FROM "+
                        "Replicates "+
                        "INNER JOIN Diff_expression ON diff_expression.feature_name = expression.feature_name "+
                        "INNER JOIN Expression ON Expression.replicate_id = Replicates.replicate_id "+
                    "WHERE Expression.feature_type ='"+featureType+"' AND abs(diff_expression.log_fold_change) > "+minFC+" AND diff_expression.fdr < "+maxFDR+" ")
    resultado = cursor.fetchall()
    linhas = resultado
    
    dicionario = {}
   
    for linha in linhas:
        if linha[0] not in dicionario:
            dicionario[linha[0]] = []
        dicionario[linha[0]].append(linha[1])

    cursor = conexao.cursor()
    cursor.execute("select distinct r.replicate_id, r.replicate_name, r.sample_id, s.sample_name from Replicates as r, Samples as s LEFT JOIN Replicates where r.sample_id = s.sample_id order by r.replicate_name")
    experiments = cursor.fetchall()

    i = int(0)
    experiments_array = []
    for i in range (0, int(len(experiments))):
        experiments_array.append(experiments[i][1]) 
        i = i + 1

    for id, list_of_rn in dicionario.items():
        for rn in experiments_array:
            if rn not in list_of_rn:
                linhas.append([id, rn, 0])

    linhas.sort(key=takeReplicate)
    linhas.sort(key=takeID)

    return Response(json.dumps(linhas),  mimetype='application/json')    

@app.route('/api/database/<minFC>/<maxFDR>/<featureType>/mostExpressed')
def get_mostExpressed(minFC, maxFDR, featureType):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("SELECT DISTINCT "+
                        "Expression.feature_name, "+                      
                        "replicate_name, "+
                        "Expression.fpkm "+
                    "FROM "+
                        "Replicates "+
                        "INNER JOIN Diff_expression ON diff_expression.feature_name = expression.feature_name "+
                        "INNER JOIN Expression ON Expression.replicate_id = Replicates.replicate_id "+
                    "WHERE Expression.feature_type ='"+featureType+"' AND abs(diff_expression.log_fold_change) > "+minFC+" AND diff_expression.fdr < "+maxFDR+" ")
    resultado = cursor.fetchall()
    
    linhas = resultado

    cursor = conexao.cursor() 
    cursor.execute("select distinct r.replicate_id, r.replicate_name, r.sample_id, s.sample_name from Replicates as r, Samples as s LEFT JOIN Replicates where r.sample_id = s.sample_id order by r.replicate_name")
    
    experiments = cursor.fetchall()
    
    conexao.close()
    
    dicionario = {}
    for linha in linhas:
        if linha[0] not in dicionario:
            dicionario[linha[0]] = []
        dicionario[linha[0]].append(linha[1])

    i = int(0)
    experiments_array = []
    for i in range (0, int(len(experiments))):
        experiments_array.append(experiments[i][1]) 
        i = i + 1

    for id, list_of_rn in dicionario.items():
        for rn in experiments_array:
            if rn not in list_of_rn:
                linhas.append((id, rn, 0)) 

    dicionario_fpkm = {}

    for linha in linhas:
        if linha[0] not in dicionario_fpkm:
            dicionario_fpkm[linha[0]] = 0
        dicionario_fpkm[linha[0]] = dicionario_fpkm[linha[0]] + linha[2]
 
    for i in range(0, len(linhas)):
        linhas[i] = linhas[i] + (dicionario_fpkm[linhas[i][0]],)
        
    linhas = sorted(linhas, key = lambda x: (x[3], x[0], x[1]), reverse=True)

    return Response(json.dumps(linhas),  mimetype='application/json') 

@app.route('/api/database/info/experiments')
def get_experiments():
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("select distinct r.replicate_id, r.replicate_name, r.sample_id, s.sample_name from Replicates as r, Samples as s LEFT JOIN Replicates where r.sample_id = s.sample_id order by r.replicate_name")
    resultado = cursor.fetchall()
    conexao.close()
    return Response(json.dumps(resultado),  mimetype='application/json')
######## end of multi-sample expression heatmap area ########



def takeReplicate(elem):
    return elem[1]

def takeID(elem):
    return elem[0]

def takeFPKM(elem):
    return elem[2]

## Cross-Samples expression data area ##
@app.route('/api/database/crosssample/<sampleA>/<sampleB>/<featureType>/MAnV')
def crosssample_MAnV(sampleA,sampleB,featureType):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    if featureType == "G":
        cursor.execute("SELECT "+ 
                            "d.sample_id_a, "+
                            "d.sample_id_b," +
                            "d.feature_name, "+
                            "d.feature_type, "+
                            "d.log_avg_expr, "+
                            "d.log_fold_change, "+
                            "d.fdr, "+
                            "t.annotation "+
                        "FROM   diff_expression d, "+ 
                            "samples s1," +
                            "samples s2, "+
                            "transcript T "+
                        "WHERE  d.sample_id_a = s1.sample_id "+
                            "AND d.sample_id_b = s2.sample_id "+
                            "AND s1.sample_name = '"+sampleA+"'"
                            "AND s2.sample_name = '"+sampleB+"'"
                            "AND d.feature_type = 'G' "+
                            "AND T.gene_id = d.feature_name ")
    else:
        cursor.execute("SELECT "+ 
                            "d.sample_id_a, "+
                            "d.sample_id_b," +
                            "d.feature_name, "+
                            "d.feature_type, "+
                            "d.log_avg_expr, "+
                            "d.log_fold_change, "+
                            "d.fdr, "+
                            "t.annotation "+
                        "FROM   diff_expression d, "+ 
                            "samples s1," +
                            "samples s2, "+
                            "transcript T "+
                        "WHERE  d.sample_id_a = s1.sample_id "+
                            "AND d.sample_id_b = s2.sample_id "+
                            "AND s1.sample_name = '"+sampleA+"'"
                            "AND s2.sample_name = '"+sampleB+"'"
                            "AND d.feature_type = 'T' "+
                            "AND T.transcript_id = d.feature_name")
    resultado = cursor.fetchall()
    conexao.close()
    return Response(json.dumps(resultado),  mimetype='application/json')    

@app.route('/crosssampleDE')
def coss_samples_DE():
    return render_template('crosssampleDE.html')

@app.route('/api/database/info/samples')
def get_samples_json():
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("select distinct s1.sample_name, s2.sample_name from Samples s1, Samples s2, Diff_expression d where s1.sample_id = d.sample_id_A and s2.sample_id = d.sample_id_B;")
    resultado = cursor.fetchall()
    conexao.close()
    return Response(json.dumps(resultado),  mimetype='application/json')

@app.route('/api/database/crosssample/<sampleA>/<sampleB>/<featureType>/<minFC>/<maxFDR>')
def cross_samples_heatmap(sampleA,sampleB,featureType,minFC,maxFDR):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor() 
    cursor.execute("SELECT DISTINCT "+
                        "Expression.feature_name, "+                      
                        "replicate_name, "+
                        "Expression.fpkm "+               
                    "FROM "+
                        "Replicates "+                       
                        "INNER JOIN Diff_expression ON diff_expression.feature_name = expression.feature_name "+
                        "INNER JOIN Expression ON Expression.replicate_id = Replicates.replicate_id "+
                        "INNER JOIN Samples ON Samples.sample_id = Replicates.sample_id "+
                    "WHERE Expression.feature_type ='"+featureType+"' AND abs(diff_expression.log_fold_change) > "+minFC+" AND diff_expression.fdr < "+maxFDR+" and sample_name IN ('"+sampleA+"','"+sampleB+"')")
    resultado = cursor.fetchall()
    linhas = resultado
    
    dicionario = {}
   
    for linha in linhas:
        if linha[0] not in dicionario:
            dicionario[linha[0]] = []
        dicionario[linha[0]].append(linha[1])

    cursor = conexao.cursor()
    cursor.execute("select distinct r.replicate_id, r.replicate_name, r.sample_id, s.sample_name from Replicates as r, Samples as s LEFT JOIN Replicates where r.sample_id = s.sample_id and sample_name IN ('"+sampleA+"','"+sampleB+"') order by r.replicate_name")
    experiments = cursor.fetchall()

    i = int(0)
    experiments_array = []
    for i in range (0, int(len(experiments))):
        experiments_array.append(experiments[i][1]) 
        i = i + 1

    for id, list_of_rn in dicionario.items():
        for rn in experiments_array:
            if rn not in list_of_rn:
                linhas.append([id, rn, 0])

    linhas.sort(key=takeReplicate)
    linhas.sort(key=takeID)
    conexao.close()
    return Response(json.dumps(linhas),  mimetype='application/json')   

@app.route('/api/database/crosssample/<sampleA>/<sampleB>/<featureType>/<minFC>/<maxFDR>/mostExpressed')
def cross_samples_heatmap_mostExpressed(sampleA,sampleB,featureType,minFC,maxFDR):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor() 
    cursor.execute("SELECT DISTINCT "+
                        "Expression.feature_name, "+                      
                        "replicate_name, "+
                        "Expression.fpkm "+               
                    "FROM "+
                        "Replicates "+                       
                        "INNER JOIN Diff_expression ON diff_expression.feature_name = expression.feature_name "+
                        "INNER JOIN Expression ON Expression.replicate_id = Replicates.replicate_id "+
                        "INNER JOIN Samples ON Samples.sample_id = Replicates.sample_id "+
                    "WHERE Expression.feature_type ='"+featureType+"' AND abs(diff_expression.log_fold_change) > "+minFC+" AND diff_expression.fdr < "+maxFDR+" and sample_name IN ('"+sampleA+"','"+sampleB+"')")
    resultado = cursor.fetchall()
    linhas = resultado
    cursor = conexao.cursor()
    cursor.execute("select distinct r.replicate_id, r.replicate_name, r.sample_id, s.sample_name from Replicates as r, Samples as s LEFT JOIN Replicates where r.sample_id = s.sample_id and sample_name IN ('"+sampleA+"','"+sampleB+"') order by r.replicate_name")
    experiments = cursor.fetchall()

    conexao.close()
    
    #linhas.sort(key=takeFPKM, reverse=True)
    
    dicionario = {}
    for linha in linhas:
        if linha[0] not in dicionario:
            dicionario[linha[0]] = []
        dicionario[linha[0]].append(linha[1])

    i = int(0)
    experiments_array = []
    for i in range (0, int(len(experiments))):
        experiments_array.append(experiments[i][1]) 
        i = i + 1

    for id, list_of_rn in dicionario.items():
        for rn in experiments_array:
            if rn not in list_of_rn:
                linhas.append((id, rn, 0)) 

    dicionario_fpkm = {}

    for linha in linhas:
        if linha[0] not in dicionario_fpkm:
            dicionario_fpkm[linha[0]] = 0
        dicionario_fpkm[linha[0]] = dicionario_fpkm[linha[0]] + linha[2]
 
    for i in range(0, len(linhas)):
        linhas[i] = linhas[i] + (dicionario_fpkm[linhas[i][0]],)
        
    linhas = sorted(linhas, key = lambda x: (x[3], x[0], x[1]), reverse=True)

    return Response(json.dumps(linhas),  mimetype='application/json') 

######### enf of cross-sample expression data ########

#### cross-sample expression data clusters ####
@app.route('/crosssampleClusters')
def coss_samples_DE_lines_HM():
    return render_template('crosssampleClusters.html')

@app.route('/api/database/crosssample/clusters/<clusterID>/<clusterNumber>')
def get_cluster_data(clusterID, clusterNumber):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("SELECT "+
                        "Expression.feature_name AS trinity_id,"+                      
                        "Replicates.replicate_name,"+
                        "Expression.fpkm "+
                    "FROM "+
                        "Expression "+
                        "INNER JOIN ExprClusters ON Expression.feature_name = ExprClusters.feature_name "+
                        "INNER JOIN Replicates ON Expression.replicate_id = Replicates.replicate_id "+
                    "WHERE ExprClusters.cluster_analysis_id = '"+clusterID+"' AND expr_cluster_id = '"+clusterNumber+"'")
    resultado = cursor.fetchall()
    linhas = resultado
    
    dicionario = {}
   
    for linha in linhas:
        if linha[0] not in dicionario:
            dicionario[linha[0]] = []
        dicionario[linha[0]].append(linha[1])

    cursor = conexao.cursor()
    cursor.execute("select distinct r.replicate_id, r.replicate_name, r.sample_id, s.sample_name from Replicates as r, Samples as s LEFT JOIN Replicates where r.sample_id = s.sample_id order by r.replicate_name")
    experiments = cursor.fetchall()

    i = int(0)
    experiments_array = []
    for i in range (0, int(len(experiments))):
        experiments_array.append(experiments[i][1]) 
        i = i + 1

    for id, list_of_rn in dicionario.items():
        for rn in experiments_array:
            if rn not in list_of_rn:
                linhas.append([id, rn, 0])

    linhas.sort(key=takeReplicate)
    linhas.sort(key=takeID)

    return Response(json.dumps(linhas),  mimetype='application/json')

@app.route('/api/database/crosssample/clusters/info')
def clousters_info():
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("select distinct eca.cluster_analysis_id, ec.expr_cluster_id, eca.cluster_analysis_group, eca.cluster_analysis_name from ExprClusterAnalyses as eca INNER JOIN ExprClusters as ec ON eca.cluster_analysis_id = ec.cluster_analysis_id")
    resultado = cursor.fetchall()
    conexao.close()
    return Response(json.dumps(resultado),  mimetype='application/json')
#### end of cross-sample expression data clusters ####

### Feature report data ####
@app.route('/api/database/featurereport/<featureID>')
def get_features(featureID):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("select * from Transcript where transcript_id like '%"+featureID+"%'")
    resultado = cursor.fetchall()
    conexao.close()
    return Response(json.dumps(resultado),  mimetype='application/json')

@app.route('/api/database/featurereport/data/<featureID>')
def get_features_data(featureID):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("select * from Transcript where transcript_id = '"+featureID+"'")
    resultado = cursor.fetchall()
    conexao.close()
    return Response(json.dumps(resultado),  mimetype='application/json')

@app.route('/api/database/featurereport/ORFS/<featureID>')
def get_features_ORFS(featureID):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("select * from ORF where transcript_id like '%"+featureID+"%'")
    resultado = cursor.fetchall()
    conexao.close()
    return Response(json.dumps(resultado),  mimetype='application/json')

@app.route('/api/database/featurereport/ORFS/graph/<featureID>')
def get_features_ORFS_grah(featureID):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("select * from ORF where orf_id like '%"+featureID+".p%'")
    resultado = cursor.fetchall()
    conexao.close()
    return Response(json.dumps(resultado),  mimetype='application/json')

@app.route('/api/database/featurereport/expression/<featureType>/<featureID>')
def get_features_data_expression(featureType,featureID):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    if featureType == "T":
        cursor.execute("select feature_name, Replicates.replicate_name, fpkm from Expression INNER JOIN Replicates on Expression.replicate_id = Replicates.replicate_id where feature_name like '%"+featureID+"%' and feature_type = 'T'")
    else:
        cursor.execute("select feature_name, Replicates.replicate_name, fpkm from Expression INNER JOIN Replicates on Expression.replicate_id = Replicates.replicate_id where feature_name like '%"+featureID+"%' and feature_type = 'G'")
    resultado = cursor.fetchall()
    linhas = resultado
    
    dicionario = {}
   
    for linha in linhas:
        if linha[0] not in dicionario:
            dicionario[linha[0]] = []
        dicionario[linha[0]].append(linha[1])

    cursor = conexao.cursor()
    cursor.execute("select distinct r.replicate_id, r.replicate_name, r.sample_id, s.sample_name from Replicates as r, Samples as s LEFT JOIN Replicates where r.sample_id = s.sample_id order by r.replicate_name")
    experiments = cursor.fetchall()

    i = int(0)
    experiments_array = []
    for i in range (0, int(len(experiments))):
        experiments_array.append(experiments[i][1]) 
        i = i + 1

    for id, list_of_rn in dicionario.items():
        for rn in experiments_array:
            if rn not in list_of_rn:
                linhas.append([id, rn, 0])

    linhas.sort(key=takeReplicate)
    linhas.sort(key=takeID)

    conexao.close()

    return Response(json.dumps(linhas),  mimetype='application/json')

@app.route('/api/database/featurereport/expression/<featureID>')
def get_features_data_expression_no_featuretype(featureID):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("select feature_name, Replicates.replicate_name, fpkm from Expression INNER JOIN Replicates on Expression.replicate_id = Replicates.replicate_id where feature_name like '%"+featureID+"%'")
    resultado = cursor.fetchall()
    linhas = resultado
    
    dicionario = {}
   
    for linha in linhas:
        if linha[0] not in dicionario:
            dicionario[linha[0]] = []
        dicionario[linha[0]].append(linha[1])

    cursor = conexao.cursor()
    cursor.execute("select distinct r.replicate_id, r.replicate_name, r.sample_id, s.sample_name from Replicates as r, Samples as s LEFT JOIN Replicates where r.sample_id = s.sample_id order by r.replicate_name")
    experiments = cursor.fetchall()

    i = int(0)
    experiments_array = []
    for i in range (0, int(len(experiments))):
        experiments_array.append(experiments[i][1]) 
        i = i + 1

    for id, list_of_rn in dicionario.items():
        for rn in experiments_array:
            if rn not in list_of_rn:
                linhas.append([id, rn, 0])

    linhas.sort(key=takeReplicate)
    linhas.sort(key=takeID)

    conexao.close()

    return Response(json.dumps(linhas),  mimetype='application/json')

@app.route('/api/getBlastResults/parts/<featureID>')
def function_getBlastResults_partsonly_json(featureID):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("SELECT TrinityID,FullAccession,QueryStart,QueryEnd,HitStart,HitEnd,PercentIdentity,Evalue,BitScore,DatabaseSource FROM BlastDbase_cp where TrinityID like '%"+featureID+".p%' order by BitScore DESC")
    resultado = cursor.fetchall()
    conexao.close()  
    return Response(json.dumps(resultado),  mimetype='application/json')

@app.route('/api/getBlastResults/parts/forORFS/<featureID>')
def function_getBlastResults_partsonly_forORFS(featureID):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("SELECT TrinityID,FullAccession,QueryStart,QueryEnd,HitStart,HitEnd,PercentIdentity,Evalue,BitScore,DatabaseSource FROM BlastDbase_cp where TrinityID like '%"+featureID+"%' order by BitScore DESC")
    resultado = cursor.fetchall()
    conexao.close()  
    return Response(json.dumps(resultado),  mimetype='application/json')

@app.route('/api/getBlastResults/parts/forBlastx/<featureID>')
def function_getBlastResults_partsonly_forBlastx(featureID):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("SELECT TrinityID,FullAccession,QueryStart,QueryEnd,HitStart,HitEnd,PercentIdentity,Evalue,BitScore,DatabaseSource FROM BlastDbase_cp where TrinityID = '"+featureID+"' order by BitScore DESC")
    resultado = cursor.fetchall()
    conexao.close()  
    return Response(json.dumps(resultado),  mimetype='application/json')

##############################################################

@app.route('/api/database/featurereport/ORFS/fetchall/<featureID>')
def get_features_ORFS_teste(featureID):
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    cursor.execute("select * from ORF where transcript_id like '%"+featureID+"%' order by lend")
    resultado = cursor.fetchall()
    conexao.close()
    return Response(json.dumps(resultado),  mimetype='application/json')

##############################################################

### Diamond area ###
@app.route('/diamond')
def render_blastp():
    return render_template('diamond.html')

@app.route('/blastp/<query>')
def function_blastp(query):
    DATABASE = 'files/Trinity.fasta.transdecoder.pep'
    outF = open("diamond/query.fasta", "w")
    outF.write(">Query")
    outF.write("\n")
    outF.write(query)
    outF.close() 

    os.system("./diamond/diamond blastp -d "+DATABASE+" -q diamond/query.fasta -v -p 3 --outfmt 6 qseqid qlen sseqid slen qstart qend sstart send pident qcovhsp scovhsp evalue bitscore -o diamond/blastp.outfmt6")
    
    raw_filepath = 'diamond/blastp.outfmt6'

    count_file = open("diamond/blastp.outfmt6", "r")
    line_count = 0
    for line in count_file:
        if line != "\n":
            line_count += 1
    count_file.close()

    if line_count >= 1:
        field_names = [
            "qseqid",
            "qlen",
            "sseqid",
            "slen",
            "qstart",
            "qend",
            "sstart",
            "send",
            "pident",
            "qcovhsp",
            "scovhsp",
            "evalue",
            "bitscore"
        ]

        data_array = np.genfromtxt(raw_filepath, delimiter="\t", dtype=None, encoding="utf-8")
        df = pd.DataFrame.from_records(data_array)
        df.columns = field_names
        result = df.to_json(orient="records")
        parsed = json.loads(result)
        out_json_path = 'diamond/blastp.json'
        jsonout = json.dumps(parsed, codecs.open(out_json_path, "w", encoding="utf-8"), sort_keys=False, indent=4)
        os.system('rm diamond/blastp.json')
        os.system('rm diamond/blastp.outfmt6')
        return Response(jsonout, mimetype='application/json')
    else:
        return Response(json.dumps(line_count), mimetype='application/json')

@app.route('/blastx/<query>')
def function_blastx(query):
    DATABASE = 'files/Trinity.fasta.transdecoder.pep'
    outF = open("diamond/query.fasta", "w")
    outF.write(">Query")
    outF.write("\n")
    outF.write(query)
    outF.close() 
    os.system("./diamond/diamond blastx -d "+DATABASE+" -q diamond/query.fasta -v -p 3 --outfmt 6 qseqid qlen sseqid slen qstart qend sstart send pident qcovhsp scovhsp evalue bitscore -o diamond/blastx.outfmt6")
    
    
    raw_filepath = 'diamond/blastx.outfmt6'

    count_file = open("diamond/blastx.outfmt6", "r")
    line_count = 0
    for line in count_file:
        if line != "\n":
            line_count += 1
    count_file.close()

    if line_count >= 1:
        field_names = [
            "qseqid",
            "qlen",
            "sseqid",
            "slen",
            "qstart",
            "qend",
            "sstart",
            "send",
            "pident",
            "qcovhsp",
            "scovhsp",
            "evalue",
            "bitscore"
        ]

        data_array = np.genfromtxt(raw_filepath, delimiter="\t", dtype=None, encoding="utf-8")
        df = pd.DataFrame.from_records(data_array)
        df.columns = field_names
        result = df.to_json(orient="records")
        parsed = json.loads(result)
        out_json_path = 'diamond/blastx.json'
        jsonout = json.dumps(parsed, codecs.open(out_json_path, "w", encoding="utf-8"), sort_keys=False, indent=4)
        os.system('rm diamond/blastx.json')
        os.system('rm diamond/blastx.outfmt6')
        return Response(jsonout, mimetype='application/json')
    else:
        return Response(json.dumps(line_count), mimetype='application/json')
### end of Diamond area ###

# Annotation results page based on UniprotAC and eggNOG ID
@app.route('/annotation_eggnog')
def function_annotation_eggnog():
    return render_template('annotation_eggnog.html')

@app.route('/api/annotation_eggnog/<stringtype>/<textid>')
def function_getAnnotationEggNOG_json(stringtype, textid):
    DATABASE = 'databases/annotation_eggnog.sqlite'
    conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
    cursor = conexao.cursor()
    if stringtype == "uniprot":
        cursor.execute("SELECT qseqid, sseqid, pident, scovhsp, round(sum_counts, 2), round(mean_tpm, 2), species, samples, eggnog, bitscore FROM uniqueprot where sseqid like '%"+textid+"%'")
    else:
        cursor.execute("SELECT qseqid, sseqid, pident, scovhsp, round(sum_counts, 2), round(mean_tpm, 2), species, samples, eggnog, bitscore FROM uniqueprot where eggnog like '%"+textid+"%'")
    resultado = cursor.fetchall()
    conexao.close()  
    return Response(json.dumps(resultado),  mimetype='application/json')
