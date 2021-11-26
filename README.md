# A Tool for Transcriptome REsults VISualization (TREVIS)
## Files Needed

To be able to use this tool, you first need to run your Trinity assembly and tun your favorite package for transcript/gene count and abundance estimation (Salmon, Kallisto, RSEM). After that, the statitical calculation and data gathering must be made with Trinity edgeR tool. Unfortunately, this first first version only supports edgeR files output.

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

## How to Run

* `git clone https://github.com/bm-silva/trevis_pocket.git`

* `docker run --rm -it -v <path>:/sharreddata -w /sharreddata brunomsilva/trevis_pocket:latest python3 build.py --example`

* `docker run --rm -it -p 9090:9090 -v <path>:/sharreddata -w /sharreddata brunomsilva/trevis_pocket:latest bash export.sh`

* Go to `http://localhost:9090/`

