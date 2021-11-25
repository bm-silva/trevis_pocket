infile = "trinotate_annotation.xls"
outfile = "trinotate_annotation_limpo.xls"

delete_list = ["['|", "|']", "'|", "|'", "('", "',)"]
with open(infile) as fin, open(outfile, "w+") as fout:
    for line in fin:
        for word in delete_list:
            line = line.replace(word, "")
        fout.write(line)
