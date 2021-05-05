// ------------! SMART SELL !------------
var real_sell = false;
var go_sell = false;



var smart_sell_paire = null;
var smart_sell_prix_cible = null;
var smart_sell_ecart = null;
var smart_sell_quantite = null;
//smart_sell_etat -1 en attente / 0 cible touchée / > 0 prix vendu
var smart_sell_etat = -1;
var smart_sell_prix_actuel = null;
var smart_sell_plus_bas = null;
var smart_sell_diff = null;
var smart_sell_date_debut = null;
var smart_sell_date_cible = null;
var smart_sell_date_vente = null;

var smart_sell_activated = false;

function smart_sell(real_sell_local){
  real_sell = real_sell_local;
  //recupere les infos
  smart_sell_paire = document.getElementById('smart_sell_select_paire').options[document.getElementById('smart_sell_select_paire').selectedIndex].value;
  smart_sell_prix_cible = document.getElementById("smart_sell_input_prix_cible").value;
  smart_sell_ecart = document.getElementById("smart_sell_input_ecart").value;
  smart_sell_quantite = document.getElementById("smart_sell_input_quantite").value;

  smart_sell_activated = true;

  //insert premieres infos dans tab
  document.getElementById("smart_sell_annuler_button").innerHTML = '<button type="button" onclick="cancel_smart_sell()" class="btn btn-warning">Annuler</button>';

  document.getElementById("smart_sell_paire").innerHTML = smart_sell_paire;
  document.getElementById("smart_sell_prix_cible").innerHTML = smart_sell_prix_cible;
  document.getElementById("smart_sell_ecart").innerHTML = "- "+smart_sell_ecart+" %";
  document.getElementById("smart_sell_quantite").innerHTML = smart_sell_quantite;

  document.getElementById("smart_sell_etat").innerHTML = "En attente";

  var now = new Date();
  document.getElementById("smart_sell_date_debut").innerHTML = now.getDate()+"/"+(now.getMonth() + 1) +" à "+now.getHours()+"h"+now.getMinutes()+"m"+now.getSeconds()+"s";


}

//DEBUT CYCLE HORLOGE - TOUTE LES 1 SECONDES si smart sell en cours d'operation
var rep_recu_sell=1;
setInterval(function(){ 

  if(rep_recu_sell==1 && smart_sell_activated){

    var xmlhttp_sell = new XMLHttpRequest();
    var url = "https://api.binance.com/api/v3/ticker/price?symbol="+smart_sell_paire;


    xmlhttp_sell.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var myArr = JSON.parse(this.responseText);
            smart_sell_prix_actuel = myArr.price;

            //TRAITEMENT DEBUT

            //seuil atteint
            if(smart_sell_prix_actuel >= smart_sell_prix_cible && smart_sell_etat==-1){
              smart_sell_etat=0;
              document.getElementById("smart_sell_etat").innerHTML = "Cible touchée";
              smart_sell_plus_haut=0;

              var now = new Date();
              document.getElementById("smart_sell_date_cible").innerHTML = now.getDate()+"/"+(now.getMonth() + 1) +" à "+now.getHours()+"h"+now.getMinutes()+"m"+now.getSeconds()+"s";
            }

            //si pas encore vendu depuis seuil atteint
            if(smart_sell_etat==0){

              //si nouveau top
              if(smart_sell_prix_actuel>=smart_sell_plus_haut){
                  //on suit la montée
                  smart_sell_plus_haut = smart_sell_prix_actuel;
                  document.getElementById("smart_sell_plus_haut").innerHTML = smart_sell_plus_haut;
              }
              else{
                  smart_sell_diff = 100-((smart_sell_prix_actuel/smart_sell_plus_haut)*100);
                  document.getElementById("smart_sell_diff").innerHTML = "- "+smart_sell_diff + " %";
                  //sinon si prix <= dernier top * -x %    equivalent à si smart_sell_diff <= x
                  if(smart_sell_prix_actuel<=smart_sell_plus_haut*(1-(smart_sell_ecart/100))){
                      //baise de x % par rapport au dernier top
                      //on vend.
                      go_sell = true;

                      smart_sell_etat=smart_sell_prix_actuel;
                      document.getElementById("smart_sell_etat").innerHTML = "Vendu à "+smart_sell_etat;

                      var now = new Date();
                      document.getElementById("smart_sell_date_vente").innerHTML = now.getDate()+"/"+(now.getMonth() + 1) +" à "+now.getHours()+"h"+now.getMinutes()+"m"+now.getSeconds()+"s";
                  }
              }

            }

            //TRAITEMENT FIN

            document.getElementById("smart_sell_prix_actuel").innerHTML = smart_sell_prix_actuel;
            rep_recu_sell=1;
        }
    };
    xmlhttp_sell.open("GET", url, true);
    xmlhttp_sell.send();

    rep_recu_sell=0;

  }

  if(rep_recu_sell==1 && !smart_sell_activated){
    document.getElementById("smart_sell_paire").innerHTML = "";
    document.getElementById("smart_sell_prix_cible").innerHTML = "";
    document.getElementById("smart_sell_ecart").innerHTML = "";
    document.getElementById("smart_sell_quantite").innerHTML = "";
    document.getElementById("smart_sell_etat").innerHTML = "";
    document.getElementById("smart_sell_prix_actuel").innerHTML = "";
    document.getElementById("smart_sell_plus_haut").innerHTML = "";
    document.getElementById("smart_sell_diff").innerHTML = "";
    document.getElementById("smart_sell_date_debut").innerHTML = "";
    document.getElementById("smart_sell_date_cible").innerHTML = "";
    document.getElementById("smart_sell_date_vente").innerHTML = "";
    smart_sell_paire = null;
    smart_sell_prix_cible = null;
    smart_sell_ecart = null;
    smart_sell_quantite = null;
    smart_sell_etat = -1;
    smart_sell_prix_actuel = null;
    smart_sell_plus_bas = null;
    smart_sell_diff = null;
    smart_sell_date_debut = null;
    smart_sell_date_cible = null;
    smart_sell_date_vente = null;
    smart_sell_activated = false;
    real_sell = false;
  }

}, 1000);//1000ms => 1sec ;)
//FIN CYCLE HORLOGE

function cancel_smart_sell(){
  smart_sell_activated = false;
}



// ******* ICI ON VEND VRAIMENT *************** //
//si smart sell completé

var rep_recu_go_sell=1;
setInterval(function(){ 


  if(real_sell && go_sell){


    if(rep_recu_go_sell==1){
        var xmlhttp_go_sell = new XMLHttpRequest();

        var query = "symbol="+smart_sell_paire+"&side=SELL&type=MARKET&quantity="+smart_sell_quantite+"&recvWindow=5000&timestamp="+serverTime;
        var query_signed = CryptoJS.HmacSHA256(query, secret); //crypt query avec secret de la cle api 

        var url = "https://cryptochancla.herokuapp.com/https://api.binance.com/api/v3/order";

        xmlhttp_go_sell.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var myArr = JSON.parse(this.responseText);
                console.log(myArr);

                rep_recu_go_sell=1;
                go_sell = false;
                maj_balance = true;
            }
        };

        xmlhttp_go_sell.open("POST", url, true);
        xmlhttp_go_sell.setRequestHeader("X-MBX-APIKEY", cle); // cle api
        xmlhttp_go_sell.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp_go_sell.send(query+"&signature="+query_signed);
        
        rep_recu_go_sell=0;
      }


  }  


}, 100); //100ms de retard max entre le traitement et lenvoie de lordre à bibi


// ------------! FIN SMART SELL !------------