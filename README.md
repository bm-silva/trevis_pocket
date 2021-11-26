# A Tool for Transcriptome REsults VISualization (TREVIS)
## Files Needed

This tool is based and inspired by [Trinotate](https://github.com/Trinotate/Trinotate.github.io/wiki). You can find all files here described in their wiki page.
To be able to use this tool, you first need to run your Trinity assembly and run your favorite package for transcript/gene count and abundance estimation (Salmon, Kallisto, RSEM). After that, the statitical calculation and data gathering must be made with Trinity edgeR tool. Unfortunately, this first first version only supports edgeR files output.

Your BlastP/X result must contain 13 columns, in a tab delimited file, is this specific order:

* 0: Trinity ID (**qseqid**);
* 1: UniprotKB-ID (**sseqid**);
* 2: Query Start (**qstart**);
* 3: Query End (**qend**);
* 4: Query Coverage (**qcovhsp**);
* 5: Hit Start (**sstart**);
* 6: Hit End (**send**);
* 7: Hit Coverage (**scovhsp**);
* 8: Percent Identity (**pident**);
* 9: e-value (**evalue**);
* 10: BitScore (**bitscore**);
* 11: Lenght (**lenght**);
* 12: Frame (**qframe**);

A `sample.txt` file is also needed. This file describe the Samples and the Replicates of your assembly. It is a tab delimited file with the first column as your sample name and the second column as replicate name. Example:

```
SampleA ReplicateA
SampleA ReplicateB
SampleB ReplicateA
SampleB ReplicateB
```

You can follow our pipeline here. You can find more information about below scripts [here](https://github.com/Trinotate/Trinotate.github.io/wiki/Software-installation-and-data-required). As a fast summary, you need to run the following Trinity scripts, after the assembly is complete:

* Run `align_and_estimate_abundance.pl` for each replicate and with your desired `--est_method`;
* Run `abundance_estimates_to_matrix.pl` - Remember to name the parent folder same as in the `samples.txt` file. Also, the columns of the `.counts.matrix` must be the same in the `samples.txt`;
* Run `run_DE_analysis.pl` in the `Trinity_trans.isoform.counts.matrix` and `Trinity_trans.gene.counts.matrix` - Set the output in two different directories (see `files_examples`);
* For each isoform and gene directory, run `analyze_diff_expr.pl`;
* For each isoform and gene directory, run `define_clusters_by_cutting_tree.pl`
* Run `TransDecoder.LongOrfs` and `TransDecoder.Predict` for ORF prediction;
* Then, run the `hmmsearch`, `blastp` and `blastx` for the annotation report.

In the `files_example` directory you can find all files needed to run the example page of this tool. In the end, you'll find the following files:

* **Trinity.fasta** - The assembled transcripts;
* **Trinity.fasta.gene_trans_map** - Transcript to gene map, also created by Trinity;
* **Trinity.fasta.transdecoder.pep** - TransDecoder output;
* **TrinotatePFAM.out**, **blastp.outfmt6**, **blastx.outfmt6** - HMMER and Blast result;
* **samples.txt** - Samples/Replicaticates descriptions;
* A directory for the Isoforms and Genes Differential Expression data by edgeR - Remember: (1) the clusters analysis files must end with `.matrix`; (2) your **run_DE_analysis.pl** output must be named `Trinity_trans.gene.counts.matrix` and `Trinity_trans.gene.TMM.EXPR.matrix`. (3) your cross-sample DE data must end with `.DE_results`.

## How to Run

* `git clone https://github.com/bm-silva/trevis_pocket.git`

Change the directory to **trevis_pocket**:

* `cd trevis_pocket`

Build your data:

* `docker run --rm -it -v <path>:/sharreddata -w /sharreddata brunomsilva/trevis_pocket:latest python3 build.py`

The `<path>` area must be changed to you directory location. E.g. `C:\Users\TREVIS\trevis_pocket`, `/home/trevis/trevis_pocket`

To run an example:

* `docker run --rm -it -v <path>:/sharreddata -w /sharreddata brunomsilva/trevis_pocket:latest python3 build.py --example`

To run the web server:
  
* `docker run --rm -it -p 9090:9090 -v <path>:/sharreddata -w /sharreddata brunomsilva/trevis_pocket:latest bash export.sh`
  
Then:
  
* Go to `http://localhost:9090/`

