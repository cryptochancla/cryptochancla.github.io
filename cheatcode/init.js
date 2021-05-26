var prix=0;
var paire="BTCUSDT";



var seconds_chart=document.getElementById('seconds_chart');

var chart = LightweightCharts.createChart(seconds_chart, {
    width: 1274,
    height: 644,
    layout: {
        backgroundColor: '#151924',
        textColor: '#abaeb8'
    },
    crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
    },
    timeScale: {
        secondsVisible: true,
        tickMarkFormatter: (time, tickMarkType, locale) => {
            console.log(time, tickMarkType, locale);
            return String(new Date(time * 1000).toISOString().substr(11, 8));
        },
    },
});

var candleSeries = chart.addCandlestickSeries();

var currentTime = Math.floor(Date.now() / 1000);
var ticksInCurrentBar = 0;
var currentBar = {
    open: null,
    high: null,
    low: null,
    close: null,
    time: currentTime,
};



function mergeTickToBar(price) {
    if (currentBar.open === null) {
        currentBar.open = price;
        currentBar.high = price;
        currentBar.low = price;
        currentBar.close = price;
    } else {
        currentBar.close = price;
        currentBar.high = Math.max(currentBar.high, price);
        currentBar.low = Math.min(currentBar.low, price);
    }
    candleSeries.update(currentBar);
}



//DEBUT CYCLE HORLOGE 
var rep_recu_prix=true;
setInterval(function(){ 

  if(rep_recu_prix){

    var xmlhttp_prix = new XMLHttpRequest();
    var url = "https://api.binance.com/api/v3/ticker/price?symbol="+paire;


    xmlhttp_prix.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var myArr = JSON.parse(this.responseText);
            prix = myArr.price;

            rep_recu_prix=true;
        }
    };
    xmlhttp_prix.open("GET", url, true);
    xmlhttp_prix.send();

    rep_recu_prix=false;

  }


    if(prix>0){

        mergeTickToBar(prix);
        if (++ticksInCurrentBar === 5) {
            // move to next bar
            currentTime = Math.floor(Date.now() / 1000);
            currentBar = {
                open: null,
                high: null,
                low: null,
                close: null,
                time: currentTime,
            };
            ticksInCurrentBar = 0;
        }
        
    }


}, 200);
//FIN CYCLE HORLOGE
















