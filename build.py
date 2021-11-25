import os
import argparse

parser = argparse.ArgumentParser(description = 'A Tool for Transcriptome REsults VISualization (TREVIS)', add_help=False)
parser.add_argument('-e', '--example', help='Run an demonstration database', action='store_true', required=False)
arguments = parser.parse_args()


def run_trevis():
    # initiate the .sqlite database
    cmd = f"Trinotate Trinotate.sqlite init --gene_trans_map {path}/Trinity.fasta.gene_trans_map \
        --transcript_fasta {path}/Trinity.fasta \
        --transdecoder_pep {path}/Trinity.fasta.transdecoder.pep"
    os.system(cmd)
    # load pfam results
    cmd = f"Trinotate Trinotate.sqlite LOAD_pfam {path}/TrinotatePFAM.out"
    os.system(cmd)
    # create a custom table for Blast results
    cmd = f"sqlite3 Trinotate.sqlite 'DROP TABLE IF EXISTS BlastDbase' \
        'CREATE TABLE BlastDbase(TrinityID TEXT, FullAccession TEXT,GINumber TEXT, UniprotSearchString TEXT, QueryStart REAL, QueryEnd REAL, QueryCoverage REAL, HitStart REAL,HitEnd REAL, HitLenght REAL, HitCoverage REAL, PercentIdentity REAL,Evalue REAL,BitScore REAL, Lenght REAL, Frame REAL, DatabaseSource)'"
    os.system(cmd)
    # load blastp results
    cmd = f"Trinotate Trinotate.sqlite LOAD_custom_blast \
        --outfmt6 {path}/blastp.outfmt6 \
        --prog blastp --dbtype CompleteProteomes"
    os.system(cmd)
    # load blastx results
    cmd = f"Trinotate Trinotate.sqlite LOAD_custom_blast \
        --outfmt6 {path}/blastx.outfmt6 \
        --prog blastx --dbtype CompleteProteomes"
    os.system(cmd)
    # trimm the uniprot accession code for further processing
    cmd = f"bash scripts/edit_sql.sh"
    os.system(cmd)
    # execute a custom trinity report
    cmd = f"python3 scripts/trinotate_annotation_report.py \
        -d Trinotate.sqlite -f {path}/Trinity.fasta.gene_trans_map"
    os.system(cmd)
    # edit the report file
    cmd = f"python3 scripts/prepare_file.py \
        -f trinotate_annotation.xls -o trinotate_annotation_limpo.xls"
    # import the report file to the annotation column
    cmd = f"import_transcript_names.pl Trinotate.sqlite trinotate_annotation_limpo.xls"
    os.system(cmd)
    # import isoform transcript clusters
    cmd = f"import_transcript_clusters.pl \
        --group_name edgeR_DE_analysis \
        --analysis_name isoforms_clusters \
        --sqlite Trinotate.sqlite \
        {path}/isoforms_DE_data/*matrix"
    os.system(cmd)
    # import isoform DE results
    cmd = f"import_expression_and_DE_results.pl --sqlite Trinotate.sqlite \
        --samples_file {path}/samples.txt  \
        --count_matrix {path}/isoforms_DE_data/Trinity_trans.isoform.counts.matrix  \
        --fpkm_matrix {path}/isoforms_DE_data/Trinity_trans.isoform.TMM.EXPR.matrix  \
        --DE_dir {path}/isoforms_DE_data/ --transcript_mode"
    os.system(cmd)
    # import gene transcript clusters
    cmd = f"import_transcript_clusters.pl \
        --group_name edgeR_DE_analysis \
        --analysis_name genes_clusters \
        --sqlite Trinotate.sqlite \
        {path}/genes_DE_data/*matrix"
    os.system(cmd)
    # import gene DE results
    cmd = f"import_expression_and_DE_results.pl --sqlite Trinotate.sqlite \
        --samples_file {path}/samples.txt  \
        --count_matrix {path}/genes_DE_data/Trinity_trans.gene.counts.matrix  \
        --fpkm_matrix {path}/genes_DE_data/Trinity_trans.gene.TMM.EXPR.matrix  \
        --DE_dir {path}/genes_DE_data/ --gene_mode"
    os.system(cmd)
    
if __name__ == '__main__':
    os.system('cp /sqlite/* .')
    if arguments.example:
        path = 'files_example'
    else:
        path = 'files'
    run_trevis()