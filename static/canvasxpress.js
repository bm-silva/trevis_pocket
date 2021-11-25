var press_count = 0; //variavel para guardar quando alguma funcao e chamada
var showMostexpressed = "";

// buttons for multi-samples data

function btnHeatMapMultiSample() {
  var eixox = 0;
  var limitID = document.getElementById("xaxislimit").value; //busca os valores dentro dos textarea e select
  var minFC = document.getElementById("minFC").value;
  var maxFDR = document.getElementById("maxFDR").value;

  // varios ifs para poder retornar um alerta caso algum campo esteja vazio
  if (minFC == 0) {
    return alert("Empty FC value");
  }
  if (maxFDR == 0) {
    return alert("Empty FDR value");
  }
  if (limitID == 0) {
    return alert("Empty LimitID value");
  }
  if (press_count == 0) {
    // faz com que a funcao rode quando o botao nao tiver sido apertado e quando tiver rodado tudo

    //funcao para poder quebrar o array em pedacos determinados
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

    // Data
    var data = {
      x: { samples: [] },
      y: {
        vars: [],
        smps: [],
        data: [],
      },
    };

    var trinityID = [];
    var experiments_replicates = [];
    var samples_names = [];

    fetch("/api/database/info/experiments")
      .then(function (response) {
        //primeiro fetch para buscar os dados de replicas e amostras
        var contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return response.json().then(function (json) {
            // process your JSON further
            for (var i = 0, len = Object.keys(json).length; i < len; i++) {
              experiments_replicates[i] = json[i][1]; // guarda o nome das replicatas
              samples_names[i] = json[i][3]; // guarda o nome das amostras
            }
            replicates_number = Object.keys(json).length; // armazena a quantidade de replicas para poder ser utilizado na hora de quebrar o array data
          });
        }
      })
      .then(function () {
        // jogar dentro do data do canvasxpress
        data.x.samples = samples_names;
        data.y.smps = experiments_replicates;
      })
      .then(function () {
        // colocado um if para poder buscar os mais expressos ou nao
        if (document.querySelector("#accept:checked") !== null) {
          showMostexpressed = "/mostExpressed";
        } else {
          showMostexpressed = "";
        }
        fetch(
          "/api/database/" +
            minFC +
            "/" +
            maxFDR +
            "/" +
            featureType.value +
            showMostexpressed
        )
          .then(function (response) {
            var contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              return response.json().then(function (json) {
                // process your JSON further
                // pega o tamanho total de resultados
                eixox = Number(json.length) / Number(replicates_number);
                console.log(Number(limitID), Number(eixox));
                if (Number(limitID) > Number(eixox)) {
                  alert(
                    "Number Max Trinity ID to Show bigger than values found"
                  );
                } else {
                  // no primeiro for, ele delimita a quantidade de ids que serao mostrados no eixo x. nesse caso, o valor do limite e multiplicado pelo valor de replicatas para nao perder nenhum dado
                  for (
                    var i = 0, len = limitID * replicates_number;
                    i < len;
                    i++
                  ) {
                    data.y.data[i] = Math.log10(json[i][2] + 1); // os valores de expressao utilziados sao de log10 de fpkm + 1 para poder evitar numeros infinitos
                  }
                  for (
                    var i = 0, len = limitID * replicates_number;
                    i < len;
                    i++
                  ) {
                    trinityID[i] = json[i][0]; // armazena todos os trinity IDs
                  }
                }
              });
            }
          })
          .then(function () {
            // quebra o array do data em pedacos relacionados ao numero de replicatas
            var result = chunkArray(data.y.data, replicates_number);
            data.y.data = result;
          })
          .then(function () {
            // funcao para poder selecionar somente os unique IDs e adicionar no data sem repeticoes
            function onlyUnique(value, index, self) {
              return self.indexOf(value) === index;
            }
            var trinityID_unique = trinityID.filter(onlyUnique);
            data.y.vars = trinityID_unique;
          })
          .then(function () {
            // Configuration
            var conf = {
              variablesClustered: true,
              graphType: "Heatmap",
              zoomSamplesDisable: true,
              smpLabelScaleFontFactor: 2,
              smpOverlays: ["samples"],
              margin: 5,
              overlaysWidth: 100,
            };

            // evento para quando ocorrer um duplo clique. ele busca os valores a ser clicado na variavel y.vars
            var events = {
              dblclick: function (o, e, t) {
                var s = "feature_report?query=" + o.y.vars[0];
                window.open(s);
              },
            };

            // Initialize object
            var cX = new CanvasXpress("canvasId", data, conf, events);
          });
      });
    press_count = press_count + 1; // adiciona um valor no press_count para mostrar que o botao foi pressionado
  } else {
    CanvasXpress.destroy("canvasId"); // quando o botao e apertado de novo, ele elemina o plot atual
    document.getElementById("CanvasXpress-ParentNode-canvasId").remove(); // limpa todos os IDs relacionados ao canvasXpress
    heatmapbox = document.getElementById("heatmapbox"); // busca o id para poder criar um novo div para plotar um novo canvas
    newdiv = document.createElement("div"); // tem que criar um div em cima de um div pq o canvasxpress deleta os divs parentais
    newcanvas = document.createElement("canvas"); // novo canvas
    newcanvas.setAttribute("id", "canvasId"); // set os atributos do canvas
    newcanvas.setAttribute("width", "800");
    newcanvas.setAttribute("height", "800");
    newdiv.appendChild(newcanvas); // coloca o canvas no div
    heatmapbox.appendChild(newdiv); // coloca no div parental que nao sera deletado pelo canvas
    press_count = 0; // volta o valor para 0 para poder rodar novamento o comando
    window.btnHeatMapMultiSample();
  }
}
// funcao para deletar os elementos de um html select
function removeOptions(selectElement) {
  var i,
    L = selectElement.options.length - 1;
  for (i = L; i >= 0; i--) {
    selectElement.remove(i);
  }
}

// buttons for the cross-samples

function btnMA() {
  var sampleA = selectSampleA.value;
  var sampleB = selectSampleB.value;
  if (selectSampleA.value == selectSampleB.value) {
    return alert("Selec Different Samples");
  }

  if (press_count == 0) {
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

    // Data
    var data = {
      y: {
        vars: [],
        smps: ["log_avg_expr", "log_fold_change"],
        data: [],
      },
      z: {
        significant: [],
        annotation: [],
      },
    };

    var experiments_replicates = [];
    var samples_names = [];

    fetch(
      "/api/database/crosssample/" +
        sampleA +
        "/" +
        sampleB +
        "/" +
        featureType.value +
        "/MAnV"
    )
      .then(function (response) {
        var contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return response.json().then(function (json) {
            // process your JSON further

            for (var i = 0, len = Object.keys(json).length; i < len; i++) {
              data.y.vars[i] = json[i][2];
              data.y.data.push(json[i][4]);
              data.y.data.push(json[i][5]);
              data.z.annotation[i] = json[i][7];
              if (json[i][6] < 0.001) {
                // define o valor de significancia.
                data.z.significant[i] = "yes";
              } else {
                data.z.significant[i] = "no";
              }
            }
          });
        }
      })
      .then(function () {
        var result = chunkArray(data.y.data, 2);
        data.y.data = result;
      })
      .then(function () {
        //add click event
        var events = {
          dblclick: function (o, e, t) {
            var s = "feature_report?query=" + o.y.vars[0];
            window.open(s);
          },
        };

        // Configuration
        var conf = {
          graphType: "Scatter2D",
          colorBy: "significant",
          xAxis: ["log_avg_expr"],
          yAxis: ["log_fold_change"],
        };
        // faz a contagem de quantos id significantes tem no grafico a partir da contagem de Yes no campo de significance
        var numOfYes = 0;
        for (var i = 0; i < data.z.significant.length; i++) {
          if (data.z.significant[i] === "yes") numOfYes++;
        }
        // contagem dos IDs e feita pela quantidade de variavel no data.y.vars
        numOfVars = data.y.vars.length;
        conf.title =
          "Number of Values: " + numOfVars + " Significant Values: " + numOfYes;
        // Initialize object
        var cX = new CanvasXpress("plot_MA", data, conf, events);
      });
    //press_count = press_count + 1;
  } else {
    CanvasXpress.destroy("plot_MA");
    document.getElementById("CanvasXpress-ParentNode-plot_MA").remove();
    MAnVolcano = document.getElementById("dispersionplots");
    newdiv = document.createElement("div");
    newcanvas = document.createElement("canvas");
    newcanvas.setAttribute("id", "plot_MA");
    newcanvas.setAttribute("width", "540");
    newcanvas.setAttribute("height", "540");
    newdiv.appendChild(newcanvas);
    MAnVolcano.appendChild(newdiv);
    //press_count = 0;
    //window.btnMA();
  }
}

function btnVolcano() {
  var sampleA = selectSampleA.value;
  var sampleB = selectSampleB.value;
  if (selectSampleA.value == selectSampleB.value) {
    return console.log("Same sample selected");
  }
  if (press_count == 0) {
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

    // Data
    var data = {
      y: {
        vars: [],
        smps: ["log_fold_change", "-1*log10(fdr)"],
        data: [],
      },
      z: {
        significant: [],
        //annotation: [],
      },
    };

    fetch(
      "/api/database/crosssample/" +
        sampleA +
        "/" +
        sampleB +
        "/" +
        featureType.value +
        "/MAnV"
    )
      .then(function (response) {
        var contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return response.json().then(function (json) {
            // process your JSON further
            for (var i = 0, len = Object.keys(json).length; i < len; i++) {
              data.y.vars[i] = json[i][2];
              data.y.data.push(json[i][5]);
              var calc_log = Math.log10(json[i][6] + 1e-100) * -1; // e somado um valor minimo para evitar os valores infinitos
              data.y.data.push(calc_log);
              if (json[i][6] < 0.001) {
                data.z.significant[i] = "yes";
              } else {
                data.z.significant[i] = "no";
              }
            }
          });
        }
      })
      .then(function () {
        var result = chunkArray(data.y.data, 2);
        data.y.data = result;
      })
      .then(function () {
        // Configuration
        var conf = {
          graphType: "Scatter2D",
          colorBy: "significant",
          xAxis: ["log_fold_change"],
          yAxis: ["-1*log10(fdr)"],
        };

        var events = {
          dblclick: function (o, e, t) {
            var s = "feature_report?query=" + o.y.vars[0];
            window.open(s);
          },
        };
        var numOfYes = 0;
        for (var i = 0; i < data.z.significant.length; i++) {
          if (data.z.significant[i] === "yes") numOfYes++;
        }
        numOfVars = data.y.vars.length;
        conf.title =
          "Number of Values: " + numOfVars + " Significant Values: " + numOfYes;
        // Initialize object
        var cX = new CanvasXpress("plot_volcano", data, conf, events);
      });
  } else {
    CanvasXpress.destroy("plot_volcano");
    document.getElementById("CanvasXpress-ParentNode-plot_volcano").remove();
    MAnVolcano = document.getElementById("dispersionplots");
    newdiv = document.createElement("div");
    newcanvas = document.createElement("canvas");
    newcanvas.setAttribute("id", "plot_volcano");
    newcanvas.setAttribute("width", "540");
    newcanvas.setAttribute("height", "540");
    newdiv.appendChild(newcanvas);
    MAnVolcano.appendChild(newdiv);
  }
}

function btnHeatmap() {
  if (minFC == 0) {
    return alert("Empty FC value");
  }
  if (maxFDR == 0) {
    return alert("Empty FDR value");
  }
  if (limitID == 0) {
    return alert("Empty LimitID value");
  }
  var limitID = document.getElementById("xaxislimit").value;
  var minFC = document.getElementById("minFC").value;
  var maxFDR = document.getElementById("maxFDR").value;
  var sampleA = selectSampleA.value;
  var sampleB = selectSampleB.value;

  if (press_count == 0) {
    var data = {
      y: {
        vars: [],
        smps: [],
        data: [],
      },
    };
    var conf = {
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
    var replicates_number = 0;
    var trinityID = [];
    var replicates = [];
    if (document.querySelector("#accept:checked") !== null) {
      showMostexpressed = "/mostExpressed";
    } else {
      showMostexpressed = "";
    }
    fetch(
      "/api/database/crosssample/" +
        sampleA +
        "/" +
        sampleB +
        "/" +
        featureType.value +
        "/" +
        minFC +
        "/" +
        maxFDR +
        showMostexpressed
    )
      .then(function (response) {
        var contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return response.json().then(function (json) {
            // process your JSON further
            for (var i = 0, len = Object.keys(json).length; i < len; i++) {
              replicates[i] = json[i][1];
            }
            function onlyUnique(value, index, self) {
              return self.indexOf(value) === index;
            }
            var replicates_unique = replicates.filter(onlyUnique);
            data.y.smps = replicates_unique;
            replicates_number = Object.keys(data.y.smps).length;
            // pega o tamanho total de resultados
            eixox = Number(json.length) / Number(replicates_number);
            console.log(Number(limitID), Number(eixox));
            if (Number(limitID) > Number(eixox)) {
              alert("Number Max Trinity ID to Show bigger than values found");
            } else {
              for (var i = 0, len = limitID * replicates_number; i < len; i++) {
                data.y.data[i] = Math.log10(json[i][2] + 1);
                trinityID[i] = json[i][0];
              }
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
        var events = {
          dblclick: function (o, e, t) {
            var s = "feature_report?query=" + o.y.vars[0];
            window.open(s);
          },
        };

        var cX = new CanvasXpress("plot_Heatmap", data, conf, events);
      });
    press_count = press_count + 1;
  } else {
    CanvasXpress.destroy("plot_Heatmap");
    document.getElementById("CanvasXpress-ParentNode-plot_Heatmap").remove();
    MAnVolcano = document.getElementById("MAnVolcano");
    newdiv = document.createElement("div");
    newcanvas = document.createElement("canvas");
    newcanvas.setAttribute("id", "plot_Heatmap");
    newcanvas.setAttribute("width", "540");
    newcanvas.setAttribute("height", "540");
    newdiv.appendChild(newcanvas);
    MAnVolcano.appendChild(newdiv);
    press_count = 0;
    window.btnMA();
    window.btnVolcano();
    window.btnHeatmap();
  }
}

// buttons for the clusters

function btnLineGraph() {
  var clusterID = selectClusterID.value;
  var clusterNumber = selectClusterNumber.value;
  if (press_count == 0) {
    var data = {
      y: {
        vars: [],
        smps: [],
        data: [],
      },
    };
    var conf = {
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

    fetch("/api/database/info/experiments").then(function (response) {
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
              "/api/database/crosssample/clusters/" +
                clusterID +
                "/" +
                clusterNumber
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
                var cX = new CanvasXpress("plot_Line", data, conf);
              });
          });
      }
    });
  } else {
    CanvasXpress.destroy("plot_Line");
    document.getElementById("CanvasXpress-ParentNode-plot_Line").remove();
    LineAndHeatmap = document.getElementById("plots");
    newdiv = document.createElement("div");
    newcanvas = document.createElement("canvas");
    newcanvas.setAttribute("id", "plot_Line");
    newcanvas.setAttribute("width", "540");
    newcanvas.setAttribute("height", "540");
    newdiv.appendChild(newcanvas);
    LineAndHeatmap.appendChild(newdiv);
  }
}

function btnHeatmapGraph() {
  var clusterID = selectClusterID.value;
  var clusterNumber = selectClusterNumber.value;
  if (press_count == 0) {
    var data = {
      y: {
        vars: [],
        smps: [],
        data: [],
      },
    };
    var conf = {
      autoScaleFont: false,
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

    fetch("/api/database/info/experiments").then(function (response) {
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
              "/api/database/crosssample/clusters/" +
                clusterID +
                "/" +
                clusterNumber
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
                var events = {
                  dblclick: function (o, e, t) {
                    var s = "feature_report?query=" + o.y.vars[0];
                    window.open(s);
                  },
                };
                var cX = new CanvasXpress("plot_Heatmap", data, conf, events);
              });
          });
      }
    });
    press_count = press_count + 1;
  } else {
    CanvasXpress.destroy("plot_Heatmap");
    document.getElementById("CanvasXpress-ParentNode-plot_Heatmap").remove();
    LineAndHeatmap = document.getElementById("plots");
    newdiv = document.createElement("div");
    newcanvas = document.createElement("canvas");
    newcanvas.setAttribute("id", "plot_Heatmap");
    newcanvas.setAttribute("width", "900");
    newcanvas.setAttribute("height", "540");
    newdiv.appendChild(newcanvas);
    LineAndHeatmap.appendChild(newdiv);
    press_count = 0;
    window.btnLineGraph();
    window.btnHeatmapGraph();
  }
}

// button for annotation gethering

function btnAnnotation() {
  //plot the Gantt graph
  var data = {
    y: {
      vars: ["Start", "End"],
      smps: [],
      data: [[], []],
    },
  };
  var conf = {
    blockContrast: "true",
    ganttEnd: "End",
    ganttStart: "Start",
    graphType: "Gantt",
    theme: "CanvasXpress",
  };

  if (press_count == 0) {
    fetch("api/database/featurereport/data/" + selectFeatureID.value)
      .then(function (response) {
        var contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return response.json().then(function (json) {
            // process your JSON further
            let a = [];
            a.push(json[0][3]);
            data.y.data[0].push(0);
            data.y.smps.push(json[0][0]);
            data.y.data[1].push(a[0].length / 3);
          });
        }
      })
      .then(function () {
        fetch("/api/getBlastResults/parts/" + selectFeatureID.value).then(
          function (response) {
            var contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              return response.json().then(function (json) {
                // process your JSON further
                for (var i = 0, len = Object.keys(json).length; i < len; i++) {
                  data.y.smps.push(json[i][1]);
                  data.y.data[0].push(json[i][2]);
                  data.y.data[1].push(json[i][3]);
                }
              });
            }
          }
        );
      })
      .then(function () {
        // Initialize object
        var cX = new CanvasXpress("plot_Gantt", data, conf);
      });
    press_count = press_count + 1;
  } else {
    console.log("botao ja foi apertado");
  }

  //get the annotation information
  fetch("/api/database/featurereport/" + selectFeatureID.value).then(function (
    response
  ) {
    var contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response
        .json()
        .then(function (json) {
          // process the JSON
          geneID = document.getElementById("geneID");
          geneID_text = document.createTextNode(json[0][0]);
          geneID.appendChild(geneID_text);
          geneID_transcriptsequence = document.getElementById(
            "geneID_transcriptsequence"
          );
          geneID_transcriptsequence_text = document.createTextNode(json[0][3]);
          geneID_transcriptsequence.appendChild(geneID_transcriptsequence_text);
          for (row in json) {
            transcript_ul = document.createElement("ul");
            transcript_text = document.createTextNode(json[row][1]);
            transcript_ul.appendChild(transcript_text);
            for (var i = 0, len = Object.keys(json[i]).length; i < len; i++) {
              annotation_ul = document.createElement("ul");
              annotation_id = document.createAttribute("class");
              annotation_id.value = "annotation";
              annotation_ul.setAttributeNode(annotation_id);
              annotation_text = document.createTextNode(json[row][2]);
              annotation_ul.appendChild(annotation_text);
              transcript_ul.appendChild(annotation_ul);
            }
            geneID.appendChild(transcript_ul);
          }
        })
        .then(function () {
          var list = document.getElementsByClassName("annotation");
          for (element of list) {
            element.innerHTML = element.innerHTML.replace(/\^/g, "<li>");
          }
        });
    }
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// button for genome graph data
function btnFetchBlast() {
  if (press_count == 0) {
    var conf = {
      graphType: "Genome",
      useFlashIE: true,
      background: "rgb(230, 230,230)",
      oddColor: "rgb(220,220,220)",
      evenColor: "rgb(250,250,250)",
      missingDataColor: "rgb(220,220,220)",
      setMin: 1,
      setMax: 3569,
    };

    var tracks = [];
    var data = new Object();

    // para pegar os dados a ser usado como referencia
    fetch(
      "/api/" +
        species.value.toString() +
        nreads.value.toString() +
        "/database/featurereport/data/" +
        selectFeatureID.value
    )
      .then(function (response) {
        var contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return response.json().then(function (json) {
            // process your JSON further
            var myReference = new Object();
            myReference.name = "Transcript: " + json[0][1];
            myReference.type = "sequence";
            myReference.subtype = "DNA";
            myReference.data = [{}];
            myReference.data[0].id = "Reference Sequence";
            myReference.data[0].fill = "rgb(51,255,255)";
            myReference.data[0].outline = "rgb(0,0,0)";
            myReference.data[0].offset = 1;
            myReference.data[0].sequence = json[0][3];
            tracks.push(myReference);
          });
        }
      })
      .then(function () {
        var myBlast = new Object();
        myBlast.type = "box";
        fetch(
          "/api/" +
            species.value.toString() +
            nreads.value.toString() +
            "/database/featurereport/ORFS/graph/" +
            selectFeatureID.value
        ).then(function (response) {
          var contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            return response
              .json()
              .then(async function (json) {
                // process your JSON further
                await fetch_blastx_hit(json, tracks);
                for (var i = 0, len = Object.keys(json).length; i < len; i++) {
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
                  if (json[i][3] == "-") {
                    myORF.data[0].data = [[json[i][4], json[i][5]]];
                    myORF.data[0].start =
                      Number(tracks[0].data[0].sequence.length) -
                      Number(json[i][5]);
                    myORF.data[0].end =
                      Number(tracks[0].data[0].sequence.length) -
                      Number(json[i][4]);
                  } else {
                    myORF.data[0].data = [[json[i][4], json[i][5]]];
                    myORF.data[0].start = json[i][4];
                    myORF.data[0].end = json[i][5];
                  }
                  tracks.push(myORF);
                  myBlast.name = "BLASTP for " + json[i][0];
                  var orfstart = json[i][4];
                  await fetch_hit(json, i, myBlast, tracks, orfstart);
                }
                data.tracks = tracks;
              })
              .then(function () {
                var cX = new CanvasXpress("plot_Genome", data, conf);
              });
          }
        });
      });
    press_count = press_count + 1;
  } else {
    CanvasXpress.destroy("plot_Genome");
    document.getElementById("CanvasXpress-ParentNode-plot_Genome").remove();
    GenomeGraph = document.getElementById("GenomeGraph");
    newdiv = document.createElement("div");
    newcanvas = document.createElement("canvas");
    newcanvas.setAttribute("id", "plot_Genome");
    newcanvas.setAttribute("width", "540");
    newcanvas.setAttribute("height", "540");
    newdiv.appendChild(newcanvas);
    GenomeGraph.appendChild(newdiv);
    press_count = 0;
    window.btnFetchBlast();
  }
}

function btnFetchAllBlast() {
  if (press_count == 0) {
    var conf = {
      graphType: "Genome",
      useFlashIE: true,
      background: "rgb(230, 230,230)",
      oddColor: "rgb(220,220,220)",
      evenColor: "rgb(250,250,250)",
      missingDataColor: "rgb(220,220,220)",
      setMin: 1,
      setMax: 3569,
      subtracksMaxDefault: 50,
    };

    var tracks = [];
    var data = new Object();

    fetch(
      "/api/" +
        species.value.toString() +
        nreads.value.toString() +
        "/database/featurereport/data/" +
        selectFeatureID.value
    )
      .then(function (response) {
        var contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return response.json().then(function (json) {
            // process your JSON further
            var myReference = new Object();
            myReference.name = "Transcript: " + json[0][1];
            myReference.type = "sequence";
            myReference.subtype = "DNA";
            myReference.data = [{}];
            myReference.data[0].id = "Reference Sequence";
            myReference.data[0].fill = "rgb(51,255,255)";
            myReference.data[0].outline = "rgb(0,0,0)";
            myReference.data[0].offset = 1;
            myReference.data[0].sequence = json[0][3];
            tracks.push(myReference);
          });
        }
      })
      .then(function () {
        var myBlast = new Object();
        myBlast.type = "box";

        fetch(
          "/api/" +
            species.value.toString() +
            nreads.value.toString() +
            "/database/featurereport/ORFS/graph/" +
            selectFeatureID.value
        ).then(function (response) {
          var contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            return response
              .json()
              .then(async function (json) {
                // process your JSON further
                await fetch_all_blastx_hit(json, tracks);
                for (var i = 0, len = Object.keys(json).length; i < len; i++) {
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
                  if (json[i][3] == "-") {
                    myORF.data[0].data = [[json[i][4], json[i][5]]];
                    myORF.data[0].start =
                      Number(tracks[0].data[0].sequence.length) -
                      Number(json[i][5]);
                    myORF.data[0].end =
                      Number(tracks[0].data[0].sequence.length) -
                      Number(json[i][4]);
                  } else {
                    myORF.data[0].data = [[json[i][4], json[i][5]]];
                    myORF.data[0].start = json[i][4];
                    myORF.data[0].end = json[i][5];
                  }
                  tracks.push(myORF);
                  myBlast.name = "BLASTP for " + json[i][0];
                  if (json[i][3] == "-") {
                    var orfstart = json[i][5];
                    var isNegative = true;
                  } else {
                    var orfstart = json[i][4];
                  }

                  await fetch_all_hits(
                    json,
                    i,
                    myBlast,
                    tracks,
                    orfstart,
                    isNegative
                  );
                }
                data.tracks = tracks;
              })
              .then(function () {
                var cX = new CanvasXpress("plot_Genome", data, conf);
              });
          }
        });
      });
    press_count = press_count + 1;
  } else {
    CanvasXpress.destroy("plot_Genome");
    document.getElementById("CanvasXpress-ParentNode-plot_Genome").remove();
    GenomeGraph = document.getElementById("GenomeGraph");
    newdiv = document.createElement("div");
    newcanvas = document.createElement("canvas");
    newcanvas.setAttribute("id", "plot_Genome");
    newcanvas.setAttribute("width", "540");
    newcanvas.setAttribute("height", "540");
    newdiv.appendChild(newcanvas);
    GenomeGraph.appendChild(newdiv);
    press_count = 0;
    window.btnFetchAllBlast();
  }
}

function fetch_hit(json, i, myBlast, tracks, orfstart, isNegative) {
  return new Promise((resolve) => {
    fetch(
      "/api/" +
        species.value.toString() +
        nreads.value.toString() +
        "/getBlastResults/parts/forORFS/" +
        json[i][0]
    ).then(function (response) {
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
                myHit.outline = "rgb(0,0,0)";
                myHit.dit = "right";
                myHit.connect = true;
                if (isNegative == true) {
                  myHit.data = [
                    [
                      Number(orfstart) - Number(json_hits[j][3] * 3),
                      Number(orfstart) - Number(json_hits[j][2] * 3),
                    ],
                  ];
                  myHit.start = Number(orfstart) - Number(json_hits[j][3] * 3);
                  myHit.end = Number(orfstart) - Number(json_hits[j][2] * 3);
                } else {
                  myHit.data = [
                    [
                      Number(orfstart) + Number(json_hits[j][2] * 3),
                      Number(orfstart) + Number(json_hits[j][3] * 3),
                    ],
                  ];
                  myHit.start = Number(orfstart) + Number(json_hits[j][2] * 3);
                  myHit.end = Number(orfstart) + Number(json_hits[j][3] * 3);
                }
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

function fetch_blastx_hit(json, tracks) {
  return new Promise((resolve) => {
    var myBlast = new Object();
    myBlast.type = "box";
    myBlast.data = [];
    myBlast.name = "BLASTX for " + json[0][1];
    fetch(
      "/api/" +
        species.value.toString() +
        nreads.value.toString() +
        "/getBlastResults/parts/forBlastx/" +
        json[0][1]
    ).then(function (response) {
      var contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response
          .json()
          .then(function (json_hits) {
            //process the JSON
            if (Object.keys(json_hits).length !== 0) {
              for (var j = 0, len2 = 1; j < len2; j++) {
                var myHit = new Object();
                // pega o id
                myHit.id = json_hits[j][1];
                // calcula a fase
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
                // pega o inicio e o fim do hit dependendo do sinal da fita
                if (json_hits[j][2] > json_hits[j][3]) {
                  myHit.data = [
                    [Number(json_hits[j][3]), Number(json_hits[j][2])],
                  ];
                  myHit.start = Number(json_hits[j][3]);
                  myHit.end = Number(json_hits[j][2]);
                } else {
                  myHit.data = [
                    [Number(json_hits[j][2]), Number(json_hits[j][3])],
                  ];
                  myHit.start = Number(json_hits[j][2]);
                  myHit.end = Number(json_hits[j][3]);
                }
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

function fetch_all_blastx_hit(json, tracks) {
  return new Promise((resolve) => {
    var myBlast = new Object();
    myBlast.type = "box";
    myBlast.data = [];
    myBlast.name = "BLASTX for " + json[0][1];
    fetch(
      "/api/" +
        species.value.toString() +
        nreads.value.toString() +
        "/getBlastResults/parts/forBlastx/" +
        json[0][1]
    ).then(function (response) {
      var contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response
          .json()
          .then(function (json_hits) {
            //process the JSON
            if (Object.keys(json_hits).length !== 0) {
              for (
                var j = 0, len2 = Object.keys(json_hits).length;
                j < len2;
                j++
              ) {
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
                if (json_hits[j][2] > json_hits[j][3]) {
                  myHit.data = [
                    [Number(json_hits[j][3]), Number(json_hits[j][2])],
                  ];
                  myHit.start = Number(json_hits[j][3]);
                  myHit.end = Number(json_hits[j][2]);
                } else {
                  myHit.data = [
                    [Number(json_hits[j][2]), Number(json_hits[j][3])],
                  ];
                  myHit.start = Number(json_hits[j][2]);
                  myHit.end = Number(json_hits[j][3]);
                }
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

function fetch_all_hits(json, i, myBlast, tracks, orfstart, isNegative) {
  return new Promise((resolve) => {
    fetch(
      "/api/" +
        species.value.toString() +
        nreads.value.toString() +
        "/getBlastResults/parts/forORFS/" +
        json[i][0]
    ).then(function (response) {
      var contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response
          .json()
          .then(function (json_hits) {
            //process the JSON
            if (Object.keys(json_hits).length !== 0) {
              for (
                var j = 0, len2 = Object.keys(json_hits).length;
                j < len2;
                j++
              ) {
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
                if (isNegative == true) {
                  myHit.data = [
                    [
                      Number(orfstart) - Number(json_hits[j][3] * 3),
                      Number(orfstart) - Number(json_hits[j][2] * 3),
                    ],
                  ];
                  myHit.start = Number(orfstart) - Number(json_hits[j][3] * 3);
                  myHit.end = Number(orfstart) - Number(json_hits[j][2] * 3);
                } else {
                  myHit.data = [
                    [
                      Number(orfstart) + Number(json_hits[j][2] * 3),
                      Number(orfstart) + Number(json_hits[j][3] * 3),
                    ],
                  ];
                  myHit.start = Number(orfstart) + Number(json_hits[j][2] * 3);
                  myHit.end = Number(orfstart) + Number(json_hits[j][3] * 3);
                }
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
