//init cle / secret api
var cle="";
var secret="";
var maj_balance=false;
//config du modal
var myModal = new bootstrap.Modal(document.getElementById('modalCleAPI'), {
  keyboard: false,
  backdrop: 'static'
  });



//si click sur bouton commencer, ferme modal et attribut valeur cle/secret api
function saisie_cle_api() {
  cle = document.getElementById("cle").value;
  secret = document.getElementById("secret").value;
  maj_balance = true;
  myModal.hide()
}



//quand page prete
window.addEventListener('load', function () {

    var e = document.getElementById('tradingview_b0bb0');
    if(window.screen.height>=1440){
        e.style.height = 650+"px";
    }
    else{
        e.style.height = 410+"px";
    }

  //rempli le select avec coins existant sur binance
  var xmlhttp_liste_pair = new XMLHttpRequest();
    var url = "https://api.binance.com/api/v3/ticker/price";
    xmlhttp_liste_pair.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var myArr = JSON.parse(this.responseText);
            for(i = 0; i < myArr.length; i++) {
              document.getElementById("smart_buy_select_paire").options[document.getElementById("smart_buy_select_paire").length] = new Option(myArr[i].symbol, myArr[i].symbol);
              document.getElementById("smart_sell_select_paire").options[document.getElementById("smart_sell_select_paire").length] = new Option(myArr[i].symbol, myArr[i].symbol);
            }
        }
    };
    xmlhttp_liste_pair.open("GET", url, true);
    xmlhttp_liste_pair.send();
  
  //ouvre le modal
  myModal.show();
});



// SERVER TIME actualisé toutes les secondes //
var serverTime=0;

var rep_recu_time=1;
setInterval(function(){ 

  if(rep_recu_time==1){
    var xmlhttp_server_time = new XMLHttpRequest();
    var url = "https://api.binance.com/api/v3/time";
    xmlhttp_server_time.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var myArr = JSON.parse(this.responseText);
            serverTime = myArr.serverTime;
            var d = new Date(serverTime);
            document.getElementById("heure_binance").innerHTML = d.toTimeString();
            rep_recu_time=1;
        }
    };
    xmlhttp_server_time.open("GET", url, true);
    xmlhttp_server_time.send();
    rep_recu_time=0;
  }

}, 1000);



// Solde Fiat et Spot actualisé toutes les secondes //

var rep_recu_balance=1;
setInterval(function(){ 

    if(serverTime>0 && cle!="" && secret!="" && maj_balance){

        if(rep_recu_balance==1){
            var xmlhttp_balance = new XMLHttpRequest();

            var query = "timestamp="+serverTime;
            var query_signed = CryptoJS.HmacSHA256(query, secret); //crypt query avec secret de la cle api 
            
            var url = "https://cryptochancla.herokuapp.com/https://api.binance.com/api/v3/account?"+query+"&signature="+query_signed;
            xmlhttp_balance.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var myArr = JSON.parse(this.responseText).balances;
                    var str_tmp="";
                    for(i = 0; i < myArr.length; i++) {
                        if(myArr[i].free>0){
                            str_tmp+=myArr[i].asset;
                            str_tmp+=" : ";
                            str_tmp+=myArr[i].free;
                            str_tmp+="; ";
                        }
                    }
                    if(str_tmp !=""){
                        document.getElementById("balance").innerHTML = str_tmp;
                    }
                    else{
                        document.getElementById("balance").innerHTML = "Faut remplir son compte Spot mon ptit pote !";
                    }

                    maj_balance = false;
                    rep_recu_balance=1;
                }
            };
            xmlhttp_balance.open("GET", url, true);
            xmlhttp_balance.setRequestHeader("X-MBX-APIKEY", cle); // cle api
            xmlhttp_balance.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp_balance.send();
            rep_recu_balance=0;
        }

    }

}, 1000);