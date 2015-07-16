/**
 * This file creates a global variable called "musicPlayerData"
 * It is an object the groups the data based on the type of charts we will
 * be using.
 *
 * musicPlayerData = {
 *  bulb: {
 *      //data for bulb gauge
 *  },
 *  equalizer: {
 *      // data for equalizers
 *  }
 * }
 */
var musicPlayerData = {
    bulb: {
        type: "bulb",
        id: "myChart",
        width: "31",
        height: "31",
        dataFormat: "json",
        dataSource: {
            chart: {
                theme: "music-player"
            },
            colorRange: {
                color: [{
                    minValue: "0",
                    maxValue: "0",
                    code: "#EEEEEE"
                }, {
                    minValue: "1",
                    maxValue: "1",
                    code: "#A0BD00"
                }]
            },
            value: "0"
        }
    },
    equalizer: {
        type: 'vled',
        width: '66',
        height: '348',
        dataFormat: 'json',
        dataSource: {
            chart: {
                theme: "music-player"
            },
            colorRange: {
                color: [{
                    minValue: "0",
                    maxValue: "1",
                    code: "#333333"
                }, {
                    minValue: "2",
                    maxValue: "6",
                    code: "#9ACC31"
                }, {
                    minValue: "7",
                    maxValue: "13",
                    code: "#9CC530"
                }, {
                    minValue: "14",
                    maxValue: "20",
                    code: "#9FC030"
                }, {
                    minValue: "21",
                    maxValue: "27",
                    code: "#A1BB2F"
                }, {
                    minValue: "28",
                    maxValue: "34",
                    code: "#A1B52E"
                }, {
                    minValue: "35",
                    maxValue: "41",
                    code: "#A3AF2D"
                }, {
                    minValue: "42",
                    maxValue: "48",
                    code: "#A5A92C"
                }, {
                    minValue: "49",
                    maxValue: "55",
                    code: "#A7A32B"
                }, {
                    minValue: "56",
                    maxValue: "62",
                    code: "#A99D2B"
                }, {
                    minValue: "63",
                    maxValue: "69",
                    code: "#AB972A"
                }, {
                    minValue: "70",
                    maxValue: "76",
                    code: "#AC9029"
                }, {
                    minValue: "77",
                    maxValue: "83",
                    code: "#AE8B29"
                }, {
                    minValue: "84",
                    maxValue: "90",
                    code: "#B08528"
                }, {
                    minValue: "91",
                    maxValue: "97",
                    code: "#B27F27"
                }, {
                    minValue: "98",
                    maxValue: "104",
                    code: "#B47927"
                }, {
                    minValue: "105",
                    maxValue: "111",
                    code: "#B67326"
                }, {
                    minValue: "112",
                    maxValue: "118",
                    code: "#B76E26"
                }, {
                    minValue: "119",
                    maxValue: "125",
                    code: "#B96725"
                }, {
                    minValue: "126",
                    maxValue: "132",
                    code: "#BB6325"
                }, {
                    minValue: "133",
                    maxValue: "139",
                    code: "#BC6025"
                }, {
                    minValue: "140",
                    maxValue: "146",
                    code: "#BD5D25"
                }, {
                    minValue: "147",
                    maxValue: "153",
                    code: "#BF5724"
                }, {
                    minValue: "154",
                    maxValue: "160",
                    code: "#C15024"
                }, {
                    minValue: "161",
                    maxValue: "167",
                    code: "#C34B24"
                }, {
                    minValue: "168",
                    maxValue: "174",
                    code: "#C54524"
                }, {
                    minValue: "175",
                    maxValue: "181",
                    code: "#C64023"
                }, {
                    minValue: "182",
                    maxValue: "188",
                    code: "#C83A23"
                }, {
                    minValue: "189",
                    maxValue: "195",
                    code: "#CB3523"
                }, {
                    minValue: "196",
                    maxValue: "202",
                    code: "#CC2F22"
                }, {
                    minValue: "203",
                    maxValue: "209",
                    code: "#CF2923"
                }, {
                    minValue: "210",
                    maxValue: "216",
                    code: "#D02422"
                }, {
                    minValue: "217",
                    maxValue: "223",
                    code: "#D22023"
                }, {
                    minValue: "224",
                    maxValue: "230",
                    code: "#D41A22"
                }, {
                    minValue: "231",
                    maxValue: "237",
                    code: "#D61522"
                }, {
                    minValue: "238",
                    maxValue: "244",
                    code: "#D81122"
                }, {
                    minValue: "245",
                    maxValue: "255",
                    code: "#D90C22"
                }]
            },
            value: "0"
        }
    }
};