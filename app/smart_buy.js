// ------------! SMART BUY !------------
var real_buy = false;



var smart_buy_paire = null;
var smart_buy_prix_cible = null;
var smart_buy_ecart = null;
var smart_buy_quantite = null;
//smart_buy_etat -1 en attente / 0 cible touchée / > 0 prix vendu
var smart_buy_etat = -1;
var smart_buy_prix_actuel = null;
var smart_buy_plus_bas = null;
var smart_buy_diff = null;
var smart_buy_date_debut = null;
var smart_buy_date_cible = null;
var smart_buy_date_vente = null;

var smart_buy_activated = false;

function smart_buy(real_buy_local){
  real_buy = real_buy_local;
  //recupere les infos
  smart_buy_paire = document.getElementById('smart_buy_select_paire').options[document.getElementById('smart_buy_select_paire').selectedIndex].value;
  smart_buy_prix_cible = document.getElementById("smart_buy_input_prix_cible").value;
  smart_buy_ecart = document.getElementById("smart_buy_input_ecart").value;
  smart_buy_quantite = document.getElementById("smart_buy_input_quantite").value;

  smart_buy_activated = true;

  //insert premieres infos dans tab
  document.getElementById("smart_buy_annuler_button").innerHTML = '<button type="button" onclick="cancel_smart_buy()" class="btn btn-warning">Annuler</button>';

  document.getElementById("smart_buy_paire").innerHTML = smart_buy_paire;
  document.getElementById("smart_buy_prix_cible").innerHTML = smart_buy_prix_cible;
  document.getElementById("smart_buy_ecart").innerHTML = "+ "+smart_buy_ecart+" %";
  document.getElementById("smart_buy_quantite").innerHTML = smart_buy_quantite;

  document.getElementById("smart_buy_etat").innerHTML = "En attente";

  var now = new Date();
  document.getElementById("smart_buy_date_debut").innerHTML = now.getDate()+"/"+(now.getMonth() + 1) +" à "+now.getHours()+"h"+now.getMinutes()+"m"+now.getSeconds()+"s";


}

//DEBUT CYCLE HORLOGE - TOUTE LES 1 SECONDES si smart buy en cours d'operation
var rep_recu_buy=1;
setInterval(function(){ 

  if(rep_recu_buy==1 && smart_buy_activated){

    var xmlhttp_buy = new XMLHttpRequest();
    var url = "https://api.binance.com/api/v3/ticker/price?symbol="+smart_buy_paire;


    xmlhttp_buy.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var myArr = JSON.parse(this.responseText);
            smart_buy_prix_actuel = myArr.price;

            //TRAITEMENT DEBUT

            //seuil atteint
            if(smart_buy_prix_actuel <= smart_buy_prix_cible && smart_buy_etat==-1){
              smart_buy_etat=0;
              document.getElementById("smart_buy_etat").innerHTML = "Cible touchée";
              smart_buy_plus_bas=999999999999; //1000 milliards -1 on a de la marge bg

              var now = new Date();
              document.getElementById("smart_buy_date_cible").innerHTML = now.getDate()+"/"+(now.getMonth() + 1) +" à "+now.getHours()+"h"+now.getMinutes()+"m"+now.getSeconds()+"s";
            }

            //si pas encore vendu depuis seuil atteint
            if(smart_buy_etat==0){

              //si nouveau bas
              if(smart_buy_prix_actuel<=smart_buy_plus_bas){
                  //on suit la baisse
                  smart_buy_plus_bas = smart_buy_prix_actuel;
                  document.getElementById("smart_buy_plus_bas").innerHTML = smart_buy_plus_bas;
              }
              else{
                  smart_buy_diff = ((smart_buy_prix_actuel/smart_buy_plus_bas)*100)-100;
                  document.getElementById("smart_buy_diff").innerHTML = "+ "+smart_buy_diff + " %";
                  //sinon si prix >= dernier bas * -x %    equivalent à si smart_buy_diff >= x
                  if(smart_buy_prix_actuel>=smart_buy_plus_bas*(1+(smart_buy_ecart/100))){
                      //montée de x % par rapport au dernier bas
                      //on achete.

        
                      if(real_buy){marketbuyorderbibi();}

                      document.getElementById("smart_buy_annuler_button").innerHTML = '';

                      smart_buy_etat=smart_buy_prix_actuel;
                      document.getElementById("smart_buy_etat").innerHTML = "Acheté à "+smart_buy_etat;

                      var now = new Date();
                      document.getElementById("smart_buy_date_vente").innerHTML = now.getDate()+"/"+(now.getMonth() + 1) +" à "+now.getHours()+"h"+now.getMinutes()+"m"+now.getSeconds()+"s";
                  }
              }

            }

            //TRAITEMENT FIN

            document.getElementById("smart_buy_prix_actuel").innerHTML = smart_buy_prix_actuel;
            rep_recu_buy=1;
        }
    };
    xmlhttp_buy.open("GET", url, true);
    xmlhttp_buy.send();

    rep_recu_buy=0;

  }

  if(rep_recu_buy==1 && !smart_buy_activated){
    document.getElementById("smart_buy_paire").innerHTML = "";
    document.getElementById("smart_buy_prix_cible").innerHTML = "";
    document.getElementById("smart_buy_ecart").innerHTML = "";
    document.getElementById("smart_buy_quantite").innerHTML = "";
    document.getElementById("smart_buy_etat").innerHTML = "";
    document.getElementById("smart_buy_prix_actuel").innerHTML = "";
    document.getElementById("smart_buy_plus_bas").innerHTML = "";
    document.getElementById("smart_buy_diff").innerHTML = "";
    document.getElementById("smart_buy_date_debut").innerHTML = "";
    document.getElementById("smart_buy_date_cible").innerHTML = "";
    document.getElementById("smart_buy_date_vente").innerHTML = "";
    document.getElementById("smart_buy_annuler_button").innerHTML = '';
    smart_buy_paire = null;
    smart_buy_prix_cible = null;
    smart_buy_ecart = null;
    smart_buy_quantite = null;
    smart_buy_etat = -1;
    smart_buy_prix_actuel = null;
    smart_buy_plus_bas = null;
    smart_buy_diff = null;
    smart_buy_date_debut = null;
    smart_buy_date_cible = null;
    smart_buy_date_vente = null;
    smart_buy_activated = false;
    real_buy = false;
  }

}, 1000);//1000ms => 1sec ;) 
//FIN CYCLE HORLOGE

function cancel_smart_buy(){
  smart_buy_activated = false;
}







// ------------! FIN SMART BUY !------------

function marketbuyorderbibi(){

  var xmlhttp_go_buy = new XMLHttpRequest();

  var query = "symbol="+smart_buy_paire+"&side=BUY&type=MARKET&quantity="+smart_buy_quantite+"&recvWindow=5000&timestamp="+serverTime;
  var query_signed = CryptoJS.HmacSHA256(query, secret); //crypt query avec secret de la cle api 

  var url = proxy_cors+"https://api.binance.com/api/v3/order";

  xmlhttp_go_buy.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          var myArr = JSON.parse(this.responseText);
          console.log(myArr);

          maj_balance = true;
      }
  };

  xmlhttp_go_buy.open("POST", url, true);
  xmlhttp_go_buy.setRequestHeader("X-MBX-APIKEY", cle); // cle api
  xmlhttp_go_buy.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xmlhttp_go_buy.send(query+"&signature="+query_signed);

}