var press_count_FR = 0; //variavel para guardar quando alguma funcao e chamada

// buscar os resultados de HMM e PFAM
function btnGetHMMPFAMresults() {
  var getHMMPfamresults = document.getElementById("trinityidtextarea").value; // busca o valor dentro da text area
  if (getHMMPfamresults != "") {
    // se tiver conteudo ele realiza a funcao
    document.getElementById("divgetHMMPFAMresults").style.display = "contents"; //da um display na coluna com os headers escondidos
    // da um fetch na api para buscar o json com os resultados
    //busca pelo ID da tabela para poder criar o datatables, utilizando o json da api como entrada
    $("#getHMMPFAMresults").DataTable({
      sAjaxSource: "/api/getHMMPfamresults/" + getHMMPfamresults,
      destroy: true,
      scrollX: true,
      sAjaxDataProp: "",
      fnRowCallback: function (nRow, aData, iDisplayIndex) {
        //funcao para poder colocar links dentro da tabela. o valor entre parenteses representa o local de substituicao
        $("td:eq(0)", nRow).html(
          '<a href="feature_report?query=' + aData[0] + '">' + aData[0] + "</a>"
        );
        var split = aData[5].split(".");
        $("td:eq(5)", nRow).html(
          '<a href="http://pfam.xfam.org/search/keyword?query=' +
            split[0] +
            '">' +
            split[0] +
            "</a>"
        );
        return nRow;
      },
    });
  } else {
    // se tiver vazio ele da um alerta
    alert("Text field empty!");
  }
}

// buscar os resultados de HMM e PFAM
function btnGetPfam() {
  var getHMMPfamresults = document.getElementById("pfamidtextarea").value; // busca o valor dentro da text area
  if (getHMMPfamresults != "") {
    // se tiver conteudo ele realiza a funcao
    document.getElementById("divgetHMMPFAMresults").style.display = "contents"; //da um display na coluna com os headers escondidos
    // da um fetch na api para buscar o json com os resultados
    //busca pelo ID da tabela para poder criar o datatables, utilizando o json da api como entrada
    $("#getHMMPFAMresults").DataTable({
      sAjaxSource: "/api/getHMMPfamresults/pfamAC/" + getHMMPfamresults,
      destroy: true,
      scrollX: true,
      sAjaxDataProp: "",
      fnRowCallback: function (nRow, aData, iDisplayIndex) {
        //funcao para poder colocar links dentro da tabela. o valor entre parenteses representa o local de substituicao
        $("td:eq(0)", nRow).html(
          '<a href="feature_report?query=' + aData[0] + '">' + aData[0] + "</a>"
        );
        var split = aData[5].split(".");
        $("td:eq(5)", nRow).html(
          '<a href="http://pfam.xfam.org/search/keyword?query=' +
            split[0] +
            '">' +
            split[0] +
            "</a>"
        );
        return nRow;
      },
    });
  } else {
    // se tiver vazio ele da um alerta
    alert("Text field empty!");
  }
}
// buscar os resultados de Blast
function btnBlastResults() {
  var searchType = searchType_selection.value; //busca o valor dentro do <select>. dependendo do valor ele realiza uma busca na api diferente
  if (searchType == "TrinityID") {
    var getBlastResults = document.getElementById("blasttextarea").value;
    if (getBlastResults != "") {
      document.getElementById("divgetBlastResults").style.display = "contents";
      $("#getBlastResults").DataTable({
        sAjaxSource: "/api/getBlastResults/" + getBlastResults,
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
      document.getElementById("divgetBlastResults").style.display = "contents";
      $("#getBlastResults").DataTable({
        sAjaxSource: "/api/getBlastResults/" + getBlastResults + "/accessionID",
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
}

//busca por string dentro da coluna de anotacoes
function btnGetAnnotations() {
  var textID = document.getElementById("idtextarea").value;
  if (textID != "") {
    document.getElementById("divgetannotations").style.display = "contents";
    $("#getannotations").DataTable({
      sAjaxSource: "/api/getannotations/" + textID,
      sAjaxDataProp: "",
      destroy: true,
      scrollX: true,
      columnDefs: [
        {
          //essa regiao vai fazer com que colapse a string em um determinado numero de caracteres. olhar o dataTables.plugins.js
          targets: 2,
          render: $.fn.dataTable.render.ellipsis(400),
        },
      ],
      fnRowCallback: function (nRow, aData, iDisplayIndex) {
        $("td:eq(0)", nRow).html(
          '<a href="feature_report?query=' + aData[0] + '">' + aData[0] + "</a>"
        );
        return nRow;
      },
    });
  } else {
    alert("Text field empty!");
  }
}
// funcao para utilizar a api para rodar o diamond
function btnDiamondBlast() {
  if (
    species.value.toString() == "Choose..." ||
    nreads.value.toString() == "Choose..." ||
    method.value.toString() == "Choose..."
  ) {
    alert("Specie, Number of Reads or Method type missing!");
  } else {
    document.getElementById("divdiamondBlast").style.display = "contents";
    var method_selection = document.getElementById("method").value;
    if (method_selection == "BlastP") {
      var query = document.getElementById("querytextarea").value;
      if (query != "") {
        $("#diamondBlast").DataTable({
          //nesse json, ele possui os identificadores, como se fosse um headers. por isso e necessario identificar cada coluna de acordo com o dado presente no json
          sAjaxSource:
            "/" +
            species.value.toString() +
            nreads.value.toString() +
            "/blastp/" +
            query,
          sAjaxDataProp: "",
          autoWidth: false,
          scrollX: true,
          columns: [
            { data: "sseqid" },
            { data: "qlen" },
            { data: "slen" },
            { data: "qstart" },
            { data: "qend" },
            { data: "sstart" },
            { data: "send" },
            { data: "pident" },
            { data: "qcovhsp" },
            { data: "scovhsp" },
            { data: "evalue" },
            { data: "bitscore" },
          ],
          destroy: true,
          fnRowCallback: function (nRow, aData, iDisplayIndex) {
            //aData agora e um objeto, e nao um array. desta forma a identificao da regiao e diferente
            $("td:eq(0)", nRow).html(
              '<a href="feature_report?query=' +
                aData.sseqid +
                '">' +
                aData.sseqid +
                "</a>"
            );
            return nRow;
          },
        });
      } else {
        alert("Text field empty!");
      }
    }

    if (method_selection == "BlastX") {
      var query = document.getElementById("querytextarea").value;
      if (query != "") {
        $("#diamondBlast").DataTable({
          sAjaxSource:
            "/" +
            species.value.toString() +
            nreads.value.toString() +
            "/blastx/" +
            query,
          sAjaxDataProp: "",
          autoWidth: false,
          scrollX: true,
          columns: [
            { data: "sseqid" },
            { data: "qlen" },
            { data: "slen" },
            { data: "qstart" },
            { data: "qend" },
            { data: "sstart" },
            { data: "send" },
            { data: "pident" },
            { data: "qcovhsp" },
            { data: "scovhsp" },
            { data: "evalue" },
            { data: "bitscore" },
          ],
          destroy: true,
          fnRowCallback: function (nRow, aData, iDisplayIndex) {
            $("td:eq(0)", nRow).html(
              '<a href="feature_report?query=' +
                aData.sseqid +
                '">' +
                aData.sseqid +
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

function fetchgenedata(featureID, data, trinityID) {
  fetch(
    "/api/" +
      species.value.toString() +
      nreads.value.toString() +
      "/database/featurereport/expression/G/" +
      featureID
  ).then(function (response) {
    var contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response
        .json()
        .then(function (json_gene) {
          // process your JSON further
          for (var i = 0, len = Object.keys(json_gene).length; i < len; i++) {
            data.y.data[i] = Math.log10(json_gene[i][2] + 1);
            trinityID[i] = json_gene[i][0];
          }
        })
        .then(function () {
          resolve();
        });
    }
  });
}

function btnGetFeatureReport() {
  if (press_count_FR == 0) {
    press_count_FR = 1;
    document.getElementById("blastresults").style.display = "contents";
    document.getElementById("ORFtablediv").style.display = "contents";
    const params = new URLSearchParams(document.location.search);
    const featureIDfull = params.get("query");

    var featureID =
      featureIDfull.split("_")[0] +
      "_" +
      featureIDfull.split("_")[1] +
      "_" +
      featureIDfull.split("_")[2] +
      "_" +
      featureIDfull.split("_")[3];

    //get the heatmap data and plot it
    fetch(
      "/api/" +
        species.value.toString() +
        nreads.value.toString() +
        "/database/info/experiments"
    ) //fetch para poder ter acesso aos nomes da replicatas e amostras
      .then(function (response) {
        var data = {
          //variavel contendo os dados para o grafico
          y: {
            vars: [],
            smps: [],
            data: [],
          },
        };
        var conf = {
          // configurações do grafico
          title: "Heatmap for Transcripts and Gene",
          variablesClustered: true,
          graphType: "Heatmap",
          zoomSamplesDisable: true,
          smpLabelScaleFontFactor: 2,
          margin: 5,
          overlaysWidth: 100,
        };

        function chunkArray(myArray, chunk_size) {
          var index = 0;
          var arrayLength = myArray.length;
          var tempArray = [];

          for (index = 0; index < arrayLength; index += chunk_size) {
            myChunk = myArray.slice(index, index + chunk_size);
            // Do something if you want with the group
            tempArray.push(myChunk);
          }

          return tempArray;
        }

        var replicates_number = 0; // cria a variavel para ser utilizada mais a frente
        var contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return response
            .json()
            .then(function (json) {
              // process your JSON further
              for (var i = 0, len = Object.keys(json).length; i < len; i++) {
                data.y.smps[i] = json[i][1]; // pega os nomes das replicatas e das amostras
              }
              replicates_number = Object.keys(json).length; // pega o numero de replicatas
            })
            .then(function () {
              var trinityID = []; // array para receber todos os trinity ID
              fetch(
                "/api/" +
                  species.value.toString() +
                  nreads.value.toString() +
                  "/database/featurereport/expression/" +
                  featureID
              ) //fetch nessa url retorna valor de expressao tanto de transcrito quanto de gene
                .then(function (response) {
                  var contentType = response.headers.get("content-type");
                  if (
                    contentType &&
                    contentType.indexOf("application/json") !== -1
                  ) {
                    return response.json().then(async function (json) {
                      // process your JSON further
                      for (
                        //uso do for para poder pegar todos so resultados do json dado o seu tamanho indicado na variavel len
                        var i = 0, len = Object.keys(json).length;
                        i < len;
                        i++
                      ) {
                        data.y.data[i] = Math.log10(json[i][2] + 1); // calcula o log10 de fpkm e soma 1 para nao ter valores infinitos
                        trinityID[i] = json[i][0]; // adicionar todos os ID nessa variavel para poder ser separado depois
                      }
                    });
                  }
                })
                .then(function () {
                  var result = chunkArray(data.y.data, replicates_number); // divide os dados em array de acordo com as replicatas
                  data.y.data = result;
                })
                .then(function () {
                  function onlyUnique(value, index, self) {
                    // funcao para selecionar valores unicos de um array
                    return self.indexOf(value) === index;
                  }
                  var trinityID_unique = trinityID.filter(onlyUnique); // aplica a funcao para selecionar as strings unicas
                  data.y.vars = trinityID_unique;
                  if (trinityID_unique.length == 1) {
                    conf.variablesClustered = false;
                  }
                })
                .then(function () {
                  var cX = new CanvasXpress("plot_Heatmap", data, conf); // plota o grafico
                });
            });
        } // get the data for the line graph and plot it
      })
      .then(function () {
        var data = {
          y: {
            vars: [],
            smps: [],
            data: [],
          },
        };
        var conf = {
          title: "Transcripts Line Graph",
          showLegend: false,
          graphType: "Line",
          graphOrientation: "vertical",
        };

        function chunkArray(myArray, chunk_size) {
          var index = 0;
          var arrayLength = myArray.length;
          var tempArray = [];

          for (index = 0; index < arrayLength; index += chunk_size) {
            myChunk = myArray.slice(index, index + chunk_size);
            // Do something if you want with the group
            tempArray.push(myChunk);
          }

          return tempArray;
        }
        fetch(
          "/api/" +
            species.value.toString() +
            nreads.value.toString() +
            "/database/info/experiments"
        ).then(function (response) {
          var replicates_number = 0;
          var contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            return response
              .json()
              .then(function (json) {
                // process your JSON further
                for (var i = 0, len = Object.keys(json).length; i < len; i++) {
                  data.y.smps[i] = json[i][1];
                }
                replicates_number = Object.keys(json).length;
              })
              .then(function () {
                var trinityID = [];
                fetch(
                  "/api/" +
                    species.value.toString() +
                    nreads.value.toString() +
                    "/database/featurereport/expression/T/" +
                    featureID
                )
                  .then(function (response) {
                    var contentType = response.headers.get("content-type");
                    if (
                      contentType &&
                      contentType.indexOf("application/json") !== -1
                    ) {
                      return response.json().then(function (json) {
                        // process your JSON further
                        for (
                          var i = 0, len = Object.keys(json).length;
                          i < len;
                          i++
                        ) {
                          data.y.data[i] = Math.log10(json[i][2] + 1);
                          trinityID[i] = json[i][0];
                        }
                      });
                    }
                  })
                  .then(function () {
                    var result = chunkArray(data.y.data, replicates_number);
                    data.y.data = result;
                  })
                  .then(function () {
                    function onlyUnique(value, index, self) {
                      return self.indexOf(value) === index;
                    }
                    var trinityID_unique = trinityID.filter(onlyUnique);
                    data.y.vars = trinityID_unique;
                  })
                  .then(function () {
                    var cX = new CanvasXpress("plot_LineT", data, conf);
                  });
              });
          }
        }); // get data for the line graph for the genes
      })
      .then(function () {
        var data = {
          y: {
            vars: [],
            smps: [],
            data: [],
          },
        };
        var conf = {
          title: "Gene Line Graph",
          showLegend: false,
          graphType: "Line",
          graphOrientation: "vertical",
        };

        function chunkArray(myArray, chunk_size) {
          var index = 0;
          var arrayLength = myArray.length;
          var tempArray = [];

          for (index = 0; index < arrayLength; index += chunk_size) {
            myChunk = myArray.slice(index, index + chunk_size);
            // Do something if you want with the group
            tempArray.push(myChunk);
          }

          return tempArray;
        }
        fetch(
          "/api/" +
            species.value.toString() +
            nreads.value.toString() +
            "/database/info/experiments"
        ).then(function (response) {
          var replicates_number = 0;
          var contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            return response
              .json()
              .then(function (json) {
                // process your JSON further
                for (var i = 0, len = Object.keys(json).length; i < len; i++) {
                  data.y.smps[i] = json[i][1];
                }
                replicates_number = Object.keys(json).length;
              })
              .then(function () {
                var trinityID = [];
                fetch(
                  "/api/" +
                    species.value.toString() +
                    nreads.value.toString() +
                    "/database/featurereport/expression/G/" +
                    featureID
                )
                  .then(function (response) {
                    var contentType = response.headers.get("content-type");
                    if (
                      contentType &&
                      contentType.indexOf("application/json") !== -1
                    ) {
                      return response.json().then(function (json) {
                        // process your JSON further
                        for (
                          var i = 0, len = Object.keys(json).length;
                          i < len;
                          i++
                        ) {
                          data.y.data[i] = Math.log10(json[i][2] + 1);
                          trinityID[i] = json[i][0];
                        }
                      });
                    }
                  })
                  .then(function () {
                    var result = chunkArray(data.y.data, replicates_number);
                    data.y.data = result;
                  })
                  .then(function () {
                    function onlyUnique(value, index, self) {
                      return self.indexOf(value) === index;
                    }
                    var trinityID_unique = trinityID.filter(onlyUnique);
                    data.y.vars = trinityID_unique;
                  })
                  .then(function () {
                    var cX = new CanvasXpress("plot_LineG", data, conf);
                  });
              });
          }
        });
      });

    fetch(
      "/api/" +
        species.value.toString() +
        nreads.value.toString() +
        "/database/featurereport/ORFS/" +
        featureID
    ).then(function (response) {
      response.json().then(function (json) {
        $("#ORFS").DataTable({
          data: json,
          destroy: true,
          scrollX: true,
        });
      });
    });

    fetch(
      "/api/" +
        species.value.toString() +
        nreads.value.toString() +
        "/database/featurereport/ORFS/" +
        featureID
    )
      .then(function (response) {
        var contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return response.json().then(function (json) {
            // process the JSON
            for (var i = 0, len = Object.keys(json).length; i < len; i++) {
              get_div = document.getElementById("selectFeatureID");
              new_option = document.createElement("option");
              new_option_sampleNAME = document.createTextNode(json[i][1]);
              new_option.setAttribute("value", json[i][1]);
              new_option.appendChild(new_option_sampleNAME);
              get_div.appendChild(new_option);
            }
          });
        }
      })
      .then(function () {
        // para poder deixar somente uma opcao e repetir as entradas
        var usedNames = {};
        $("select[name='selectFeatureID'] > option").each(function () {
          if (usedNames[this.text]) {
            $(this).remove();
          } else {
            usedNames[this.text] = this.value;
          }
        });
      });
  } else {
    alert("Please reload the page before new search");
  }
}
