/*
 FusionCharts JavaScript Library
 Copyright FusionCharts Technologies LLP
 License Information at <http://www.fusioncharts.com/license>
 FusionCharts JavaScript Library
 Copyright FusionCharts Technologies LLP
 License Information at <http://www.fusioncharts.com/license>
*/

/**
 * This file create a theme file for the dashboard. The cosmetics for the
 * different charts are defined here.
 *
 * More information on theming can be found at
 * http://docs.fusioncharts.com/tutorial-configuring-your-chart-theme-manager.html
 */
FusionCharts.register('theme', {
    name: 'music-player',
    theme: {
        base: {
            chart: {
                baseFont: "'HelveticaNeue', 'Helvetica Neue', Helvetica, Arial, Verdana",
                baseFontSize: "8",
                baseFontColor: "#666666",
                canvasBorderThickness: "0",
                bgAlpha: "0",
                showBorder: "0",
                showShadow: "0",
                showToolTip: "0",
                showValue: "0"
            }
        },
        bulb: {
            chart: {
                baseFont: "Helvetica Neue,Arial",
                baseFontColor: "#333333",
                caption: "",
                captionFontSize: "14",
                chartTopMargin: "-3",
                clickURL: "#",
                gaugeBorderColor: "#C8D758",
                gaugeBorderThickness: "1",
                is3D: "0",
                lowerLimit: "1",
                showGaugeBorder: "1",
                showGradient: "0",
                showShadow: "0",
                upperLimit: "0"
            }
        },
        vled: {
            chart: {
                animation: "0",
                borderAlpha: "0",
                chartBottomMargin: "0",
                chartLeftMargin: "0",
                chartRightMargin: "5",
                gaugeFillColor: "#161616",
                ledSize: "8",
                ledGap: "3",
                lowerLimit: "0",
                numberSuffix: "",
                refreshInstantly: "1",
                showGaugeBorder: "0",
                showLabel: "0",
                showTickMarks: "0",
                showTickValues: "0",
                upperLimit: "255"
            }
        }
    }
});