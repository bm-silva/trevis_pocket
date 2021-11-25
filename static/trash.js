function btn_backup() {
  var geneID = document.getElementById("geneIDtextarea").value;
  if (geneID != "") {
    var table = document.getElementById("fetchuniprotID");
    var rowCount = table.rows.length;
    while (table.rows.length > 1) {
      table.deleteRow(1);
    }
    fetch("http://localhost:9090/api/fetchuniprotID/" + geneID).then(function (
      response
    ) {
      var contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json().then(function (json) {
          // process your JSON further
          if (Object.keys(json).length != 0) {
            document.getElementById("fetchuniprotID").style.display =
              "contents";
            document.getElementById("nada_geneID").style.display = "none";
            for (row in json) {
              tabela = document.getElementsByTagName("tbody")[0];
              tr = document.createElement("tr");
              for (var i = 0, len = Object.keys(json[i]).length; i < len; i++) {
                td = document.createElement("td");
                td_text = document.createTextNode(json[row][i]);
                tr.appendChild(td);
                td.appendChild(td_text);
              }
              tabela.appendChild(tr);
            }
          } else {
            document.getElementById("fetchuniprotID").style.display = "none";
            document.getElementById("nada_geneID").style.display = "contents";
          }
        });
      } else {
        console.log("Oops, we haven't got JSON!");
      }
    });
  } else {
    document.getElementById("fetchuniprotID").style.display = "none";
    document.getElementById("nada_geneID").style.display = "none";
  }
}

function btnFetchID() {
  var geneID = document.getElementById("geneIDtextarea").value;
  var stringType = document.getElementById("stringType").value;
  document.getElementById("divFetchID").style.display = "contents";
  if (geneID != "") {
    fetch("/api/fetchuniprotID/" + stringType + "/" + geneID).then(function (
      response
    ) {
      response.json().then(function (json) {
        $("#fetchID").DataTable({
          data: json,
          autoWidth: false,
          destroy: true,
          fnRowCallback: function (nRow, aData, iDisplayIndex) {
            $("td:eq(0)", nRow).html(
              '<a href="https://www.uniprot.org/uniprot/' +
                aData[0] +
                '">' +
                aData[0] +
                "</a>"
            );
            var split = aData[4].split(";");
            $("td:eq(4)", nRow).html(
              '<a href="https://www.ncbi.nlm.nih.gov/protein/' +
                split[0] +
                '">' +
                split[0] +
                "</a>"
            );
            $("td:eq(5)", nRow).html(
              '<a href="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=' +
                aData[5] +
                '">' +
                aData[5] +
                "</a>"
            );
            return nRow;
          },
        });
      });
    });
  } else {
    alert("Text field empty!");
  }
}

function btnFetchID_bak2() {
  var geneID = document.getElementById("geneIDtextarea").value;
  var stringType = document.getElementById("stringType").value;
  document.getElementById("divFetchID").style.display = "contents";
  if (geneID != "") {
    var data = fetch("/api/fetchuniprotID/" + stringType + "/" + geneID).then(
      function (response) {
        response.json().then(function (json) {
          var teste = json;
          $("#fetchID").DataTable({
            data: teste,
            deferRender: true,
            scrollY: 200,
            scrollCollapse: true,
            scroller: true,
          });
        });
      }
    );
  } else {
    alert("Text field empty!");
  }
}

function btnGetAnnotations_bak() {
  var textID = document.getElementById("idtextarea").value;
  if (textID != "") {
    document.getElementById("divgetannotations").style.display = "contents";
    fetch("/api/getannotations/" + textID).then(function (response) {
      response.json().then(function (json) {
        $("#getannotations").DataTable({
          data: json,
          destroy: true,
          columnDefs: [
            {
              //essa regiao vai fazer com que colapse a string em um determinado numero de caracteres. olhar o dataTables.plugins.js
              targets: 2,
              render: $.fn.dataTable.render.ellipsis(200),
            },
          ],
          fnRowCallback: function (nRow, aData, iDisplayIndex) {
            $("td:eq(0)", nRow).html(
              '<a href="feature_report?query=' +
                aData[0] +
                '">' +
                aData[0] +
                "</a>"
            );
            return nRow;
          },
        });
      });
    });
  } else {
    alert("Text field empty!");
  }
}

function btnBlastResults() {
  var searchType = searchType_selection.value; //busca o valor dentro do <select>. dependendo do valor ele realiza uma busca na api diferente
  if (searchType == "TrinityID") {
    var getBlastResults = document.getElementById("blasttextarea").value;
    if (getBlastResults != "") {
      document.getElementById("divgetBlastResults").style.display = "contents";
      document.getElementById("tableheader1").style.display = "contents";
      $("#getBlastResults").DataTable({
        data: json,
        destroy: true,
        fnRowCallback: function (nRow, aData, iDisplayIndex) {
          $("td:eq(0)", nRow).html(
            '<a href="feature_report?query=' +
              aData[0] +
              '">' +
              aData[0] +
              "</a>"
          );
          return nRow;
        },
      });
    } else {
      alert("Text field empty!");
    }
  }
  if (searchType == "AccessionID") {
    var getBlastResults = document.getElementById("blasttextarea").value;
    if (getBlastResults != "") {
      document.getElementById("divgetBlastResults").style.display = "contents";
      document.getElementById("tableheader1").style.display = "contents";
      fetch("/api/getBlastResults/" + getBlastResults + "/accessionID").then(
        function (response) {
          response.json().then(function (json) {
            $("#getBlastResults").DataTable({
              data: json,
              destroy: true,
              fnRowCallback: function (nRow, aData, iDisplayIndex) {
                $("td:eq(0)", nRow).html(
                  '<a href="feature_report?query=' +
                    aData[0] +
                    '">' +
                    aData[0] +
                    "</a>"
                );
                return nRow;
              },
            });
          });
        }
      );
    } else {
      alert("Text field empty!");
    }
  }
}

// test to see if i can fetch only phases

var fullcount = 0;
function btnFetchBlast_phase() {
  if (fullcount == 0) {
    var conf = {
      graphType: "Genome",
      useFlashIE: true,
      backgroundType: "gradient",
      backgroundGradient1Color: "rgb(0,183,217)",
      backgroundGradient2Color: "rgb(4,112,174)",
      oddColor: "rgb(220,220,220)",
      evenColor: "rgb(250,250,250)",
      missingDataColor: "rgb(220,220,220)",
      setMin: 1,
      setMax: 3569,
    };
    var tracks = [];
    var data = new Object();
    var myBlast = new Object();
    myBlast.type = "box";

    var featureID_filter =
      selectFeatureID.value.split("_")[0] +
      "_" +
      selectFeatureID.value.split("_")[1] +
      "_" +
      selectFeatureID.value.split("_")[2] +
      "_" +
      selectFeatureID.value.split("_")[3];

    fetch("/api/database/featurereport/ORFS/fetchall/" + featureID_filter).then(
      function (response) {
        var contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return response
            .json()
            .then(async function (json) {
              // process your JSON further
              for (var i = 0, len = Object.keys(json).length; i < len; i++) {
                await fetch_blastx_hit_phase(json, i, tracks);
                var myORF = new Object();
                myBlast.data = [];
                myORF.name = "ORF: " + json[i][0];
                myORF.type = "box";
                myORF.data = [{}];
                myORF.data[0].id = json[i][0];
                myORF.data[0].fill = "rgb(255,255,51)";
                myORF.data[0].outline = "rgb(0,0,0)";
                myORF.data[0].offset = 1;
                myORF.data[0].connect = true;
                myORF.data[0].data = [[json[i][4], json[i][5]]];
                myORF.data[0].start = json[i][4];
                myORF.data[0].end = json[i][5];
                tracks.push(myORF);
                myBlast.name = "BLASTP for " + json[i][0];
                var orfstart = json[i][4];
                await fetch_hit(json, i, myBlast, tracks, orfstart);
              }
              data.tracks = tracks;
            })
            .then(function () {
              fullcount = 1;
              var cX = new CanvasXpress("plot_Genome_test", data, conf);
            });
        }
      }
    );
  }
}

function fetch_blastx_hit_phase(json, i, tracks) {
  return new Promise((resolve) => {
    var myBlast = new Object();
    myBlast.type = "box";
    myBlast.data = [];
    myBlast.name = "BLASTX for " + json[i][1];
    fetch("/api/getBlastResults/parts/forBlastx/" + json[i][1]).then(function (
      response
    ) {
      var contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response
          .json()
          .then(function (json_hits) {
            //process the JSON
            if (Object.keys(json_hits).length !== 0) {
              for (var j = 0, len2 = 1; j < len2; j++) {
                var myHit = new Object();
                myHit.id = json_hits[j][1];
                getPhase = Number(json_hits[j][2]) % 3;
                if (getPhase == 0) {
                  myHit.fill = "rgb(255, 153, 0)";
                }
                if (getPhase == 1) {
                  myHit.fill = "rgb(255, 0, 0)";
                }
                if (getPhase == 2) {
                  myHit.fill = "rgb(102, 0, 51)";
                }
                //myHit.fill = "rgb(255,255,51)";
                myHit.outline = "rgb(0,0,0)";
                myHit.dit = "right";
                myHit.connect = true;
                myHit.data = [
                  [Number(json_hits[j][2]), Number(json_hits[j][3])],
                ];
                myHit.start = Number(json_hits[j][2]);
                myHit.end = Number(json_hits[j][3]);
                myBlast.data.push(myHit);
              }
            } else {
              var noHit = new Object();
              myBlast.data = [];
              noHit.id = "No BLAST Hits Found";
              noHit.fill = "rgb(255,255,51)";
              noHit.outline = "rgb(0,0,0)";
              noHit.dit = "right";
              noHit.connect = true;
              noHit.data = [[0, 0]];
              noHit.start = 0;
              noHit.end = 0;
              myBlast.data.push(noHit);
            }
            tracks.push(Object.assign({}, myBlast));
          })
          .then(function () {
            resolve();
          });
      }
    });
  });
}

// buscar os resultados de blast no proteoma
function btnBlastPProtResults() {
  if (
    species.value.toString() == "Choose..." ||
    nreads.value.toString() == "Choose..."
  ) {
    console.log("No database selected");
  } else {
    var searchType = searchType_selection.value;
    if (searchType == "TrinityID") {
      var getBlastResults = document.getElementById("blasttextarea").value;
      if (getBlastResults != "") {
        document.getElementById("divgetBlastPProtResults").style.display =
          "contents";
        document.getElementById("tableheader2").style.display = "contents";
        $("#getBlastPProtResults").DataTable({
          sAjaxSource:
            "/api/" +
            species.value.toString() +
            nreads.value.toString() +
            "/getBlastPProteomeResults/" +
            getBlastResults,
          sAjaxDataProp: "",
          destroy: true,
          scrollX: true,
          fnRowCallback: function (nRow, aData, iDisplayIndex) {
            $("td:eq(0)", nRow).html(
              '<a href="feature_report?query=' +
                aData[0] +
                '">' +
                aData[0] +
                "</a>"
            );
            return nRow;
          },
        });
      } else {
        alert("Text field empty!");
      }
    }
    if (searchType == "AccessionID") {
      var getBlastResults = document.getElementById("blasttextarea").value;
      if (getBlastResults != "") {
        document.getElementById("divgetBlastPProtResults").style.display =
          "contents";
        document.getElementById("tableheader2").style.display = "contents";
        $("#getBlastPProtResults").DataTable({
          sAjaxSource:
            "/api/" +
            species.value.toString() +
            nreads.value.toString() +
            "/getBlastPProteomeResults/" +
            getBlastResults +
            "/accessionID",
          sAjaxDataProp: "",
          destroy: true,
          fnRowCallback: function (nRow, aData, iDisplayIndex) {
            $("td:eq(0)", nRow).html(
              '<a href="feature_report?query=' +
                aData[0] +
                '">' +
                aData[0] +
                "</a>"
            );
            return nRow;
          },
        });
      } else {
        alert("Text field empty!");
      }
    }
  }
}
function btnBlastXProtResults() {
  if (
    species.value.toString() == "Choose..." ||
    nreads.value.toString() == "Choose..."
  ) {
    console.log("No database selected");
  } else {
    var searchType = searchType_selection.value;
    if (searchType == "TrinityID") {
      var getBlastResults = document.getElementById("blasttextarea").value;
      if (getBlastResults != "") {
        document.getElementById("divgetBlastXProtResults").style.display =
          "contents";
        document.getElementById("tableheader3").style.display = "contents";
        $("#getBlastXProtResults").DataTable({
          sAjaxSource:
            "/api/" +
            species.value.toString() +
            nreads.value.toString() +
            "/getBlastXProteomeResults/" +
            getBlastResults,
          sAjaxDataProp: "",
          destroy: true,
          scrollX: true,
          fnRowCallback: function (nRow, aData, iDisplayIndex) {
            $("td:eq(0)", nRow).html(
              '<a href="feature_report?query=' +
                aData[0] +
                '">' +
                aData[0] +
                "</a>"
            );
            return nRow;
          },
        });
      } else {
        alert("Text field empty!");
      }
    }
    if (searchType == "AccessionID") {
      var getBlastResults = document.getElementById("blasttextarea").value;
      if (getBlastResults != "") {
        document.getElementById("divgetBlastXProtResults").style.display =
          "contents";
        document.getElementById("tableheader3").style.display = "contents";
        $("#getBlastXProtResults").DataTable({
          sAjaxSource:
            "/api/" +
            species.value.toString() +
            nreads.value.toString() +
            "/getBlastXProteomeResults/" +
            getBlastResults +
            "/accessionID",
          sAjaxDataProp: "",
          destroy: true,
          fnRowCallback: function (nRow, aData, iDisplayIndex) {
            $("td:eq(0)", nRow).html(
              '<a href="feature_report?query=' +
                aData[0] +
                '">' +
                aData[0] +
                "</a>"
            );
            return nRow;
          },
        });
      } else {
        alert("Text field empty!");
      }
    }
  }
}


<div id="tableheader2">
  <h5>BlastP Proteome Results</h5:>
</div>
<div id="divgetBlastPProtResults">
  <table id="getBlastPProtResults" class="display">
    <thead>
      <tr>
        <th>Trinity ID</th>
        <th>Trinity ID Lenght</th>
        <th>Hit ID</th>
        <th>Hit Lenght</th>
        <th>Query Start</th>
        <th>Query End</th>
        <th>Hit Start</th>
        <th>Hit End</th>
        <th>Identity (%)</th>
        <th>Query Coverage (%)</th>
        <th>Hit Coverage (%)</th>
        <th>E-Value</th>
        <th>BitScore</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</div>
<br />
<div id="tableheader3">
  <h5>BlastX Proteome Results</h5:>
</div>
<div id="divgetBlastXProtResults">
  <table id="getBlastXProtResults" class="display">
    <thead>
      <tr>
        <th>Trinity ID</th>
        <th>Trinity ID Lenght</th>
        <th>Hit ID</th>
        <th>Hit Lenght</th>
        <th>Query Start</th>
        <th>Query End</th>
        <th>Hit Start</th>
        <th>Hit End</th>
        <th>Identity (%)</th>
        <th>Query Coverage (%)</th>
        <th>Hit Coverage (%)</th>
        <th>E-Value</th>
        <th>BitScore</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</div>


# # Blast page results based on Uniprot or subject accession ID at Complete Proteome database
# @app.route('/api/<database_id>/getBlastPProteomeResults/<getBlastResults>')
# def function_getBlastPResults_json(database_id, getBlastResults):
#     DATABASE = databases[database_id]
#     conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
#     cursor = conexao.cursor()
#     cursor.execute("SELECT * FROM proteomeblastp where qseqid like '%"+getBlastResults+"%'")
#     resultado = cursor.fetchall()
#     conexao.close()  
#     return Response(json.dumps(resultado),  mimetype='application/json')

# @app.route('/api/<database_id>/getBlastXProteomeResults/<getBlastResults>')
# def function_getBlastXResults_json(database_id, getBlastResults):
#     DATABASE = databases[database_id]
#     conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
#     cursor = conexao.cursor()
#     cursor.execute("SELECT * FROM proteomeblastx where qseqid like '%"+getBlastResults+"%'")
#     resultado = cursor.fetchall()
#     conexao.close()  
#     return Response(json.dumps(resultado),  mimetype='application/json')

# @app.route('/api/<database_id>/getBlastPProteomeResults/<getBlastResults>/accessionID')
# def function_getBlastPResults_accession_json(database_id, getBlastResults):
#     DATABASE = databases[database_id]
#     conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
#     cursor = conexao.cursor()
#     cursor.execute("SELECT * FROM proteomeblastp where sseqid like '%"+getBlastResults+"%'")
#     resultado = cursor.fetchall()
#     conexao.close()  
#     return Response(json.dumps(resultado),  mimetype='application/json')

# @app.route('/api/<database_id>/getBlastXProteomeResults/<getBlastResults>/accessionID')
# def function_getBlastXResults_accession_json(database_id, getBlastResults):
#     DATABASE = databases[database_id]
#     conexao = sqlite3.connect(os.path.join(ROOT, DATABASE))
#     cursor = conexao.cursor()
#     cursor.execute("SELECT * FROM proteomeblastx where sseqid like '%"+getBlastResults+"%'")
#     resultado = cursor.fetchall()
#     conexao.close()  
#     return Response(json.dumps(resultado),  mimetype='application/json')