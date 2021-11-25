# A Tool for Transcriptome REsults VISualization (TREVIS)
## How to Run

* `git clone https://github.com/bm-silva/trevis_pocket.git`

* `docker run --rm -it -v <path>:/sharreddata -w /sharreddata brunomsilva/trevis_pocket:latest python3 build.py --example`

* `docker run --rm -it -p 9090:9090 -v <path>:/sharreddata -w /sharreddata brunomsilva/trevis_pocket:latest bash export.sh`

* Go to `http://localhost:9090/`

