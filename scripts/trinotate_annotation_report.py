import sqlite3
import csv
import argparse
from tqdm import tqdm

parser = argparse.ArgumentParser(description = 'Edit annotation trinity xls file', add_help=False)
parser.add_argument('-f', '--file', help='Add genes/transcripts map file', required=True)
parser.add_argument('-d', '--db', help='Add database file', required=True)
parser.add_argument("-h", "--help", action="help")
arguments = parser.parse_args()

con = sqlite3.connect(arguments.db)
con.text_factory = str
cur = con.cursor()

contador1 = open(arguments.file, 'r')
line_count = 0
for line in contador1:
    if line != "\n":
        line_count += 1
contador1.close()

gene_transcript_names = open(arguments.file, 'r')

output = open('temp.txt', 'w+')
writer = csv.writer(output, delimiter='\t')

print("Getting ORF information...")

for line in tqdm(gene_transcript_names, total=line_count):
    line_splited = line.split('\t')
    gene_id = line_splited[0]
    transcript_id = line_splited[1].split('\n')[0]
    for orf in cur.execute(f"select orf_id, lend, rend, strand from ORF where transcript_id = '{transcript_id}'"):
        linha = []
        linha.append(gene_id)
        linha.append(transcript_id)
        linha.append(orf[0])
        linha.append(f"{orf[1]}-{orf[2]}[{orf[3]}]")
        writer.writerow(linha)

output.close()

output2 = open('trinotate_annotation.xls', 'w+')
writer = csv.writer(output2, delimiter='\t')

header = ['#gene_id', 'transcript_id','prot_id','prot_coords', 'BlastX_results', 'BlastP_results']
writer.writerow(header)

contador2 = open('temp.txt', 'r')
line_count = 0
for line in contador2:
    if line != "\n":
        line_count += 1
contador2.close()


print("Getting Blast results and writting the report file...")

con2 = sqlite3.connect(arguments.db)
con2.text_factory = str
cur2 = con2.cursor()

def get_information(linha, id):
    for information in cur2.execute(f"select LinkId from UniprotIndex where Accession = '{id}'"):
        linha.append(information)

with open('temp.txt', 'r') as file:
    for line in tqdm(file, total=line_count):
        resultado = []
        line_split = line.split('\t')
        gene_id = line_split[0]
        transcript_id = line_split[1]
        orf = line_split[2]
        prot_id = line_split[3].split('\n')[0]
        blastx_linha = []
        for blast in cur.execute(f"select FullAccession, QueryStart, QueryEnd, HitStart, HitEnd, PercentIdentity, HitCoverage, Evalue from BlastDbase where TrinityID = '{transcript_id}'"):
            blast_result = f"|{blast[0]} Q={blast[1]}:{blast[2]} H={blast[3]}:{blast[4]} Pident={blast[5]}% SCOV={blast[6]}% Evalue={blast[7]}|"
            blastx_linha.append(blast_result)
            get_information(blastx_linha, blast[0])
        blastp_linha = []
        for blast in cur.execute(f"select FullAccession, QueryStart, QueryEnd, HitStart, HitEnd, PercentIdentity, HitCoverage, Evalue from BlastDbase where TrinityID = '{orf}'"):
            blast_result = f"|{blast[0]} Q={blast[1]}:{blast[2]} H={blast[3]}:{blast[4]} Pident={blast[5]}% SCOV={blast[6]}% Evalue={blast[7]}|"
            blastp_linha.append(blast_result)
            get_information(blastp_linha, blast[0])
        resultado.append(gene_id)
        resultado.append(transcript_id)
        resultado.append(orf)
        resultado.append(prot_id)
        resultado.append(blastx_linha)
        resultado.append(blastp_linha)
        writer.writerow(resultado)

output2.close()
con.close()
con2.close()
