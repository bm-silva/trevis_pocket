function btnCanvasPlot() {
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
      var contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json().then(function (json) {
          // process your JSON further
          for (var i = 0, len = Object.keys(json).length; i < len; i++) {
            experiments_replicates[i] = json[i][1];
            samples_names[i] = json[i][3];
          }
          replicates_number = Object.keys(json).length;
        });
      }
    })
    .then(function () {
      data.x.samples = samples_names;
      data.y.smps = experiments_replicates;
    })
    .then(function () {
      fetch("http://localhost:9090/api/graphs")
        .then(function (response) {
          var contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json().then(function (json) {
              // process your JSON further

              //json.splice(json.length - replicates_number, replicates_number);

              for (var i = 0, len = Object.keys(json).length; i < len; i++) {
                data.y.data[i] = json[i][2];
              }
              for (var i = 0, len = Object.keys(json).length; i < len; i++) {
                trinityID[i] = json[i][0];
              }
              //console.log("json");
              //console.log(json);
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

          // Initialize object
          var cX = new CanvasXpress("canvasId", data, conf);
        });
    });
}

function btnClearCanvas() {
  CanvasXpress.destroy("canvasId");
  document.getElementById("CanvasXpress-ParentNode-canvasId").remove();
  heatmapbox = document.getElementById("heatmapbox");
  newdiv = document.createElement("div");
  newcanvas = document.createElement("canvas");
  newcanvas.setAttribute("id", "canvasId");
  newcanvas.setAttribute("width", "540");
  newcanvas.setAttribute("height", "540");
  newdiv.appendChild(newcanvas);
  heatmapbox.appendChild(newdiv);
}

new CanvasXpress(
  "canvasID",
  {
    tracks: [
      {
        name: "Reference Sequence",
        type: "sequence",
        subtype: "DNA",
        data: [
          {
            id: "Reference Sequence",
            fill: "rgb(51,255,255)",
            outline: "rgb(0,0,0)",
            dir: "right",
            offset: 1,
            sequence:
              "AAAACGGCTGCCGAAAATAGGATTAAAGAAACGAATGGTGAAGAGAAGTGAGTTTTATGTGATTTCCGTCAGCAGTGATTGAAGAGTCAATTGATACCTACACCAGTCCGGATTAATCGGCTTGGATTTCGTAAGTGAGCGTGAAAATGGCCAAAAGGTGGTCCCTAACGGGTGCAGGCCCTGGCAGCAAAGAGTGCAGTGACGAGTTTGAAATTGCAGTTCTGTTGGATCGACCTACAGCGAGCTGTTCGCCAGTGCGACGAATGATTGACGACGATAGTGAAAGGGGTCGTCCGGAAACTGATTCTGTTCGTGTTGGTGGTGGTGTTGATGATTGTGATGATGATGACGAAGATGATGCTCGCTATGATTGCACTTCCGGTGGCGATCGTGATAGTGACGACGAGGAACGGATTATGATTTTCGACGAGCAGCGCCCCCTACGCGGCAAGCGACATTCGAACACGAAAGTGAAGATGTTCAAGTCGAAAAACTCCTCAGTTGATCCAGCGTCGGCGCCAATCTCGCGGGAAAATGAACAGCATTCGACAGCAGCGTTGAACCTCAACACCTCATCAGCCTCAGCAGCACTGAACAACAGCAGAAGCAGTAGCACCAACAACAGTCCAACTCCGACCCCAACCTCAAATAGCGCCAGCAACAGGATGAAGAACTCCGCCACAGCCACAGCCACCCCCAACAGTAGTAACAACAATAATCACAACAACGTCCCCACCAGTGGCAGTGGAAATAGCAACCGTGGCAAAAAGACACCCCACGGGAAGCATAAAAACCCCGACGAGGAATGCGACATCATCGGGGACCTGATAGGCGACTACGGCAAGTGGCAGTTTGTGATGACCTTCCTGCTGTCGCTGTTCCAGGTGCCCAACACGTTCCACATCTACTCGCCCACGTTTCAGGCAGCAGAAAAAAGCCACTGGTGCCGACGGCCGTCGCATCTCAACGACATCTCGGTCGATCTGTGGCGAAACGTGACCCAGCAGCGGGAAAACTGCCGGATACTGAACTACGATTGGAACTCGGTCGGATCCGAACAGACGCTGCGAAATCTGAGCATACCGGGCAATCTGTCACATGTGGGTTGCAGCTCGTGGGAGTTTGATCTCAACGATAATCTCGGCAACACGTGGGCCTCGGAGTGGAGTCTGGTGTGCGACAAGGAATACCTGAAGGATGTGGCGGAGATGTTCTTTCTGGTCGGAGTGGCCACCGGTGGAATTACCAGTGGGGTGCTGTCCGATAAATTCGGACGCAAGAAGATGCTGTTCATTTCGGCCGTTTTGCAGGCGATCTTCGGCCTTGCGTTGTATTTCGTGGATTCCTTGGAGTTCCTGTTAATTCTGCGCGCGCTACTCGGCATCGTATCCGTTTCCGTCACATATGCAGGACTGATCCTGGCCATTGAGTACGTGGACGGTAAGTGGAGAACCATCGCCGGAATGTACAACTTGTTCCCCCTGCCGGTGTCCTACATCATGATCTCGGGTCTCGCCTATCTGACGCAGGATTTCAGAAGTCTGCAGCTCTGTATCGGATTACCGGGAGTGTTTCTCTGTTTCTTGTGGTTCGTACTTCCGGAATCCCCCCGGTGGTTGCTCTGCAAAGGTCGCATAGCCGAGGTGAAGGAAATTGTGCGAAAGGCAGCCGCCTTCAACAATCGCCCGCTACCGGACAATTTGGACAAACTGCTCAAGCCCCCAACCGACGAGGAAGAGAACGTGGCCGGCGTCTGCGAGCTGTTCCGTTCCAAATATCTGCGTCTGGTCACGTTCTGCTTCCTGTGCATTTGGTTCACGATGAATCTCGTCTACTACGGACTGGTGCTCAACATGAACAGCTTCGGCGGCAACATCTACTTGAATTCGGCTCTGGCAGGTTTGGTGGAAATTCCGGCAATCGCAATGGCAATGTACATCATCAACAGAACGGGCAAGAAGTGGCTCTTCTGTGCGACATTCTTTGCAGCGGCTCTGGCGTGCTTGTGTGCAGCGGTTGTCGAGGGGAAAGAGGAATATTTATCATTGAAAATCACCTTCCTCATGATTGGTAAATTCACAATCAGTGCTGGCAACACCATAATGCCGGTTTACACGGCCGAACTGTACCCAACTGCCATCAGGAACGTTGGCGTGGGGGCTTGTAATCTCGCGGCTGGATTCGCTTTAGTGCTTACCCCTTATCTTTCCATGTTGCCAAAGATCGAGGATCATCTTCTTATGTCCCTGCTCACGGCTTGGTGTATATTTGGAGCCATTGTGATTGTATTCCTGCCGGAAACTATGCAGCATCATGACCACGAGCAACGCGAAGAAGAAAAAGAAATTGATACGCAAGTGATGGCCTAAATCGATTTTATAAAAAAAGGGGACTGATCGTCATCGCGCCAAACCATGAAGAACCGCTACTACTGCCATATCTAGAAGTTGTTCTATGTATTCTCAGATGTTGCCAACTTGATAAGTGAGATATTACGGAGCGAATGCGGAATAGGACAGGGTGCAAGAAGCAGTGAGCAAATTATTAAAAAAATGTCAATTTTTACGTAAGTATTTATAACCAAACCTGTGAATGTTTAGAGGAAAGTAGTCTTTCCCGTTCTGTATAATATGTGAGTGTTTGGTGGATTCGAATATTTAAAGAAGCATTTAAAACTCTGAGCAAGGAAAGCGAAAGGATTCAGAGAAATGTTGTCGATGCCATAACGAGCAGACATCAATAGTCATTACCAATTTTACTGTAACGATAGGAGACGCTAGCGGTGTAATTTTATTTCACACTAATGAATTTCAAAATGGAAATAACCTACGAATTTTCGATGGATTTTCTGGCTGGCCCAGAAAAGACGGTTTTTATGACACTATATTCGAATAATGATCACATGACGATTATTTACACATAGAAACAAGTACAGCTGTATACGTTGATCGCCATACAACCATACGAACGCAATAGCCATGTCAGAGAAAATAGTATTTATAAACCGGAACTTCATTGATTTTGTCACCTTTCTCATCGATCGGCTTCGTGGAGCACGCAAGCATTCAGTATTACGGGAGGTTTTAGTTTGCCATTACAAACATTCATTCAGAATAATCGTGAATGAACTATAACGAGGATGCTAGGAGTAAGGAGAATCCATTATTAGATTTTAGGCTGAAAAAAAAACACTCAGACTGGTGGAAAAGGCTAAGTTACGCGTATTATTTCCTTGTCATCGTAATTCAAAGTGCCATAATTTCGGGTGAAATTGATCATTTTTCACGGTTGTTTTGACCGTTTTCTAAAATTTTGACAATGATTAACAACTGAATGCAGGAAAACTAGTTCGAGGGTAAGCCTCGTTGGTTCATGTACCGCAATTTTCTTACAACTGTCATTTAATACTAAAAAATATTTGTAAAAAAAAAAATCGGGGTGAAATTGATCACTTGTCCATGCAATTATTGTTAGCTTTTAAAACATCTCTACATAACTAATTTGTGGTCCCTGAATCCGATTATTCTGTTTAAACTTTTAACAATATTTATGGAACGCCTAAATGTATG",
            translate: [-3, -2, -1, 1, 2, 3],
            index: 0,
            counter: 0,
            measureText: 119.86666870117188,
          },
        ],
        startY: 50,
        endY: 44,
        displayedFeatures: 1,
        totalFeatures: 1,
      },
      {
        name: "ORF:TRINITY_DN14987_c0_g1_i3.p1",
        type: "box",
        data: [
          {
            id: "TRINITY_DN14987_c0_g1_i3.p1",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[147, 2369]],
            index: 0,
            counter: 1,
            start: 147,
            end: 2369,
            measureText: 184.25,
          },
        ],
        startY: 99,
        endY: 93,
        displayedFeatures: 1,
        totalFeatures: 1,
      },
      {
        name: "BLAST for TRINITY_DN14987_c0_g1_i3.p1",
        type: "box",
        data: [
          {
            id:
              "ORCT_DROME|PerID:32.6|E:1.8e-62 RecName: Full=Organic cation transporter protein;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[368, 866]],
            index: 0,
            counter: 2,
            start: 368,
            end: 866,
            measureText: 324.54998779296875,
          },
          {
            id:
              "S22AL_MOUSE|PerID:30.6|E:4.3e-61 RecName: Full=Solute carrier family 22 member 21;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[366, 865]],
            index: 1,
            counter: 3,
            start: 366,
            end: 865,
            measureText: 319.5833435058594,
          },
          {
            id:
              "OCTL_DROME|PerID:30.1|E:2.8e-60 RecName: Full=Organic cation transporter-like protein;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[374, 865]],
            index: 2,
            counter: 4,
            start: 374,
            end: 865,
            measureText: 323.5666809082031,
          },
          {
            id:
              "S22A5_HUMAN|PerID:30.8|E:8.2e-60 RecName: Full=Solute carrier family 22 member 5;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[366, 865]],
            index: 3,
            counter: 5,
            start: 366,
            end: 865,
            measureText: 321.8833312988281,
          },
          {
            id:
              "S22A5_RAT|PerID:31|E:1.2e-58 RecName: Full=Solute carrier family 22 member 5;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[366, 865]],
            index: 4,
            counter: 6,
            start: 366,
            end: 865,
            measureText: 311.3999938964844,
          },
          {
            id:
              "S22A5_MOUSE|PerID:30.6|E:2.6e-58 RecName: Full=Solute carrier family 22 member 5;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[366, 865]],
            index: 5,
            counter: 7,
            start: 366,
            end: 865,
            measureText: 319.2833251953125,
          },
          {
            id:
              "S22A4_MOUSE|PerID:30.5|E:1.7e-57 RecName: Full=Solute carrier family 22 member 4;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[366, 865]],
            index: 6,
            counter: 8,
            start: 366,
            end: 865,
            measureText: 319.2833251953125,
          },
          {
            id:
              "S22AD_MOUSE|PerID:29.8|E:2.2e-57 RecName: Full=Solute carrier family 22 member 13;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[374, 865]],
            index: 7,
            counter: 9,
            start: 374,
            end: 865,
            measureText: 321.1000061035156,
          },
          {
            id:
              "S22AD_HUMAN|PerID:29.9|E:1.4e-56 RecName: Full=Solute carrier family 22 member 13;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[374, 865]],
            index: 8,
            counter: 10,
          },
          {
            id:
              "S22A4_RAT|PerID:30|E:5.5e-56 RecName: Full=Solute carrier family 22 member 4;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[366, 865]],
            index: 9,
            counter: 11,
          },
          {
            id:
              "S22A4_PAPAN|PerID:30.9|E:2.7e-55 RecName: Full=Solute carrier family 22 member 4;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[374, 866]],
            index: 10,
            counter: 12,
          },
          {
            id:
              "S22A4_HUMAN|PerID:29.9|E:3.6e-55 RecName: Full=Solute carrier family 22 member 4;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[366, 866]],
            index: 11,
            counter: 13,
          },
          {
            id:
              "S22AF_HUMAN|PerID:33.1|E:1.5e-50 RecName: Full=Solute carrier family 22 member 15;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[483, 866]],
            index: 12,
            counter: 14,
          },
          {
            id:
              "S22AF_MOUSE|PerID:32.8|E:7.7e-50 RecName: Full=Solute carrier family 22 member 15;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[483, 866]],
            index: 13,
            counter: 15,
          },
          {
            id:
              "S22A7_RABIT|PerID:29.2|E:2.5e-48 RecName: Full=Solute carrier family 22 member 7;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[374, 886]],
            index: 14,
            counter: 16,
          },
          {
            id:
              "S22A7_RAT|PerID:28.4|E:4.2e-48 RecName: Full=Solute carrier family 22 member 7;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[372, 877]],
            index: 15,
            counter: 17,
          },
          {
            id:
              "S22A7_PIG|PerID:28.9|E:1.8e-46 RecName: Full=Solute carrier family 22 member 7;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[372, 867]],
            index: 16,
            counter: 18,
          },
          {
            id:
              "S22A7_BOVIN|PerID:29.2|E:2.3e-46 RecName: Full=Solute carrier family 22 member 7;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[372, 867]],
            index: 17,
            counter: 19,
          },
          {
            id:
              "S22FL_XENLA|PerID:30.6|E:3e-46 RecName: Full=Solute carrier family 22 member 15-like;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[484, 865]],
            index: 18,
            counter: 20,
          },
          {
            id:
              "S22A8_PIG|PerID:28.2|E:6.7e-46 RecName: Full=Solute carrier family 22 member 8;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[372, 866]],
            index: 19,
            counter: 21,
          },
          {
            id:
              "S22AF_XENLA|PerID:30.1|E:1.5e-45 RecName: Full=Solute carrier family 22 member 15;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[484, 866]],
            index: 20,
            counter: 22,
          },
          {
            id:
              "S22FL_XENTR|PerID:29.9|E:2e-45 RecName: Full=Solute carrier family 22 member 15-like;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[484, 865]],
            index: 21,
            counter: 23,
          },
          {
            id:
              "S22A7_PONAB|PerID:29.4|E:3.3e-45 RecName: Full=Solute carrier family 22 member 7;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[374, 867]],
            index: 22,
            counter: 24,
          },
          {
            id:
              "S22A8_RABIT|PerID:27.6|E:3.3e-45 RecName: Full=Solute carrier family 22 member 8;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[372, 866]],
            index: 23,
            counter: 25,
          },
          {
            id:
              "S22AK_MOUSE|PerID:28.7|E:7.4e-45 RecName: Full=Solute carrier family 22 member 20;",
            fill: "rgb(255,255,51)",
            outline: "rgb(0,0,0)",
            dir: "right",
            connect: "true",
            data: [[372, 865]],
            index: 24,
            counter: 26,
          },
        ],
        startY: 148,
        endY: 275,
        displayedFeatures: 8,
        totalFeatures: 25,
      },
    ],
  },
  {
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
  }
);
