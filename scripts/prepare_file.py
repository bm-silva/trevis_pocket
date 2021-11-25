import argparse

parser = argparse.ArgumentParser(description = 'Edit annotation trinity xls file', add_help=False)
parser.add_argument('-f', '--file', help='Add file to edit', required=True)
parser.add_argument('-o', '--out', help='Add output file', required=True)
parser.add_argument("-h", "--help", action="help")

arguments = parser.parse_args()

infile = arguments.file
outfile = arguments.out

delete_list = ["['|", "|']", "'|", "|'", "('", "',)"]
with open(infile) as fin, open(outfile, "w+") as fout:
    for line in fin:
        for word in delete_list:
            line = line.replace(word, "")
        fout.write(line)
