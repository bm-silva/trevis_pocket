import os

def run_trinotate():
    # initiate the .sqlite database
    cmd = "Trinotate Trinotate.sqlite init --gene_trans_map files/Trinity.fasta.gene_trans_map \
        --transcript_fasta files/Trinity.fasta \
        --transdecoder_pep files/Trinity.fasta.transdecoder.pep"
    os.system(cmd)
    # load pfam results
    cmd = "Trinotate Trinotate.sqlite LOAD_pfam files/TrinotatePFAM.out"
    os.system(cmd)
    # create a custom table for Blast results
    cmd = "sqlite3 Trinotate.sqlite 'DROP TABLE IF EXISTS BlastDbase' \
        'CREATE TABLE BlastDbase(TrinityID TEXT, FullAccession TEXT,GINumber TEXT, UniprotSearchString TEXT, QueryStart REAL, QueryEnd REAL, QueryCoverage REAL, HitStart REAL,HitEnd REAL, HitLenght REAL, HitCoverage REAL, PercentIdentity REAL,Evalue REAL,BitScore REAL, Lenght REAL, Frame REAL, DatabaseSource)'"
    os.system(cmd)
    # load blastp results
    cmd = "Trinotate Trinotate.sqlite LOAD_custom_blast \
        --outfmt6 files/blastp.outfmt6 \
        --prog blastp --dbtype CompleteProteomes"
    os.system(cmd)
    # load blastx results
    cmd = "Trinotate Trinotate.sqlite LOAD_custom_blast \
        --outfmt6 files/blastx.outfmt6 \
        --prog blastx --dbtype CompleteProteomes"
    os.system(cmd)
    # trimm the uniprot accession code for further processing
    cmd = "bash scripts/edit_sql.sh"
    os.system(cmd)
    # execute a custom trinity report
    cmd = "python3 scripts/trinotate_annotation_report.py \
        -d Trinotate.sqlite -f files/Trinity.fasta.gene_trans_map"
    os.system(cmd)
    # edit the report file
    cmd = "python3 scripts/prepare_file.py \
        -f trinotate_annotation.xls -o trinotate_annotation_limpo.xls"
    # import the report file to the annotation column
    cmd = "import_transcript_names.pl Trinotate.sqlite trinotate_annotation_limpo.xls"
    os.system(cmd)
    # import isoform transcript clusters
    cmd = "import_transcript_clusters.pl \
        --group_name edgeR_DE_analysis \
        --analysis_name isoforms_clusters \
        --sqlite Trinotate.sqlite \
        files/isoforms_DE_data/*matrix"
    os.system(cmd)
    # import isoform DE results
    cmd = "import_expression_and_DE_results.pl --sqlite Trinotate.sqlite \
        --samples_file files/samples.txt  \
        --count_matrix files/isoforms_DE_data/Trinity_trans.isoform.counts.matrix  \
        --fpkm_matrix files/isoforms_DE_data/Trinity_trans.isoform.TMM.EXPR.matrix  \
        --DE_dir files/isoforms_DE_data/ --transcript_mode"
    os.system(cmd)
    # import gene transcript clusters
    cmd = "import_transcript_clusters.pl \
        --group_name edgeR_DE_analysis \
        --analysis_name genes_clusters \
        --sqlite Trinotate.sqlite \
        files/genes_DE_data/*matrix"
    os.system(cmd)
    # import gene DE results
    cmd = "import_expression_and_DE_results.pl --sqlite Trinotate.sqlite \
        --samples_file files/samples.txt  \
        --count_matrix files/genes_DE_data/Trinity_trans.gene.counts.matrix  \
        --fpkm_matrix files/genes_DE_data/Trinity_trans.gene.TMM.EXPR.matrix  \
        --DE_dir files/genes_DE_data/ --gene_mode"
    os.system(cmd)
    
if __name__ == '__main__':
    os.system('cp /sqlite/* .')
    run_trinotate()