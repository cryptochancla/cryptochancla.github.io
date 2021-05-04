//init cle / secret api
var cle="";
var secret="";
//config du modal
var myModal = new bootstrap.Modal(document.getElementById('modalCleAPI'), {
  keyboard: false,
  backdrop: 'static'
  });

//si click sur bouton commencer, ferme modal et attribut valeur cle/secret api
function saisie_cle_api() {
  cle = document.getElementById("cle").innerHTML;
  secret = document.getElementById("secret").innerHTML;
  console.log("clé et secret API attribués");
  myModal.hide()

  console.log("test encrypt pour la future requete signé si ordre - > HMAC SHA256 : "+CryptoJS.HmacSHA256("query", secret));
}

//quand page prete
window.addEventListener('load', function () {

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


// SERVER TIME
var serverTime;
var tmp=1;

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




            if(tmp==1){
            var query = "symbol=LTCBTC&side=BUY&type=LIMIT&timeInForce=GTC&quantity=1&price=0.1&recvWindow=5000&timestamp="+serverTime;
            var query_signed = CryptoJS.HmacSHA256(query, "0MkzEozy64jF0y9Zf4dnBsUbTIlgPjSwGMSNWOmQ78l9fbxzje6d7ivMYCUFkUML"); //crypt query avec secret de la cle api 
            
              var xmlhttp_test = new XMLHttpRequest();
                  //var url = "https://cors-escape.herokuapp.com/https://api.binance.com/api/v3/order";
                  var url = "https://cryptochancla.herokuapp.com/https://api.binance.com/api/v3/order/test";
            
            
                  xmlhttp_test.onreadystatechange = function() {
                      if (this.readyState == 4 && this.status == 200) {
                          var myArr = JSON.parse(this.responseText);
                          console.log(myArr);
                      }
                  };
                  xmlhttp_test.open("POST", url, true);
                  //xmlhttp_test.withCredentials = false; 
                  //xmlhttp_test.setRequestHeader("Access-Control-Allow-Credentials", "true");
                  //xmlhttp_test.setRequestHeader("Access-Control-Allow-Origin", "https://cryptochancla.github.io");
                  xmlhttp_test.setRequestHeader("X-MBX-APIKEY", "Hu3CLKGBt23TibLaoRMIiKmsql0hGMt4agzxaxww0lrKdOX9b0mOSX7GSPW4qYw3"); // cle api
                  xmlhttp_test.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                  xmlhttp_test.send(query+"&signature="+query_signed);
                  tmp=0;
                }








        }
    };
    xmlhttp_server_time.open("GET", url, true);
    xmlhttp_server_time.send();
    rep_recu_time=0;
  }

}, 1000);