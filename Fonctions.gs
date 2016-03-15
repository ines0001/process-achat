//******************************************************************************************************
// Fonction qui recupere la liste des Admins
//
// [E] /
// [S] Liste des emails de la colonne ADMIN de l'onglet Params
//******************************************************************************************************
function Get_ADMIN(){
  return enumParams(COLUMN_ADMIN).join();
}

//******************************************************************************************************
// Fonction qui recupere la liste des Admins de la fonctionnalite Gestion & Suivi DA
//
// [E] /
// [S] Liste des emails de la colonne ADMINS SUIVI de l'onglet Params
//******************************************************************************************************
function Get_ADMIN_SUIVI(){
  return enumParams(COLUMN_ADMIN_SUIVI).join();
}

//******************************************************************************************************
// Fonction qui recupere les emails recevant les demandes de contact
//
// [E] /
// [S] Liste des emails de la colonne CONTACT de l'onglet Params
//******************************************************************************************************
function GetEMAIL_CONTACT(){
  return enumParams(COLUMN_CONTACT).join();
}

//******************************************************************************************************
// Fonction qui recupere les emails recevant les emails de suivi de DA (dans le cas d'une sous-traitance)
//
// [E] /
// [S] Liste des emails de la colonne Diffusion Sous-traitance de l'onglet Params
//******************************************************************************************************
function GetEMAIL_SOUSTRAITANCE(){
  return enumParams(COLUMN_CONTACT_SOUSTRAITANCE).join();
}

//******************************************************************************************************
// Fonction qui recupere la valeur de la marge seuil
//
// [E] /
// [S] Valeur de la colonne MARGE_SEUIL de l'onglet Params
//******************************************************************************************************
function GetMargeSeuil(){
  return enumParams(COLUMN_MARGE_SEUIL).join();
}

//******************************************************************************************************
// Fonction qui recupere la valeur du montant seuil d'achat
//
// [E] /
// [S] Valeur de la colonne MONTANT_ACHAT_SEUIL de l'onglet Params
//******************************************************************************************************
function GetMontantAchatSeuil(){
  return enumParams(COLUMN_MONTANT_ACHAT_SEUIL).join();
}

//******************************************************************************************************
// Fonction qui recupere les valeurs d'emailing Creation Fournisseur
//
// [E] /
// [S] Valeur de la colonne MONTANT_ACHAT_SEUIL de l'onglet Params
//******************************************************************************************************
function GetInfoEmailingCreationFournisseur(){
  return enumParams(COLUMN_INFORMATION_CREATION_FOURNISSEUR).join();
}

//******************************************************************************************************
// Fonction qui recupere les informations utiles a la generation du BDC
//
// [E] /
// [S] Valeur de la colonne MONTANT_ACHAT_SEUIL de l'onglet Params
//******************************************************************************************************
function GetInfoGenerationBDC(){
  return enumParams(COLUMN_INFORMATION_GENERATION_BDC).join();
}

//******************************************************************************************************
// Fonction qui determine si l'application utilisee est celle de PROD
//
// [E] /
// [S] True si PROD, False sinon
//******************************************************************************************************
function IsIntegration(){
  var pModeProd = PropertiesService.getScriptProperties().getProperty('MODE_PROD');
  if (pModeProd == null) {
    Log_Severe("IsIntegration", "Property [MODE_PROD] not defined.");    
    return true;
  }
  if (pModeProd == "true") {
    return false;
  }
  return true
}

//******************************************************************************************************
// Fonction qui recupere les donnees d'une colonne de l'onglet Params et les retourne sous forme d'objet
//
// [E] header : Nom de la colonne
// [S] Objet contenant la liste des donnees de la colonne (sans le nom de la colonne)
//******************************************************************************************************
function GetRowParams(header){

  var sheet = SpreadsheetApp.openById(CLSID).getSheetByName(SHEET_PARAMS);
  var column ={pos:-1};
  var values = sheet.getDataRange()
                    .getValues();
  
  for( var i=0;i< values[0].length;i++){
    if(values[0][i]==header ) {column.pos=i+1;} 
  }
  for( var i in column){ if(column[i]==-1) throw 'no state param';}
  var params = sheet.getRange(2, column.pos, MAX_ROW, 1)
                    .getValues();
  params=  params.transpose();
  return getObjects(params, normalizeHeaders(params[0]) )[0];
}

//******************************************************************************************************
// Fonction qui recupere les donnees d'une colonne de l'onglet Params et les retourne sous forme de tableau
//
// [E] header : Nom de la colonne
// [S] Array contenant la liste des donnees de la colonne (sans le nom de la colonne)
//******************************************************************************************************
function enumParams(header){ 

  var pos = SpreadsheetApp.openById(CLSID).getSheetByName(SHEET_PARAMS)
                                      .getRange(1, 1, 1, SpreadsheetApp.openById(CLSID).getSheetByName(SHEET_PARAMS).getLastColumn() )
                                      .getValues()[0]
                                      .lastIndexOf(header)+1;
  return cleanArray(SpreadsheetApp.openById(CLSID).getSheetByName(SHEET_PARAMS)
                                         .getRange(2, pos, MAX_ROW, 1 )
                                         .getValues()
                                         .transpose()[0]);
}

//******************************************************************************************************
// Fonction de generation de la LD Type de demande (en fonction des donnees TypeDeDemande de l'onglet Params)
//
// [E] /
// [S] Code HTML du contenu de la LD Type de demande ou Erreur ou '' sinon
//******************************************************************************************************
function getHtml_TypeDeDemande(){

  var html='';
  var column ={Type2Demande:-1};
  var params = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAMS)
                         .getDataRange()
                         .getValues();

  for( var i=0;i< params[0].length;i++){
    if(params[0][i]==COLUMN_TYPE2DEMANDE ) {column.Type2Demande=i;break;}
  }
  if(column.Type2Demande==-1) {
    Log_Severe("getHtml_TypeDeDemande", Utilities.formatString("Column [%s] non defined.",COLUMN_TYPE2DEMANDE));
    throw "no params";
  }

  params = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAMS)
                         .getRange(2,column.Type2Demande+1,MAX_ROW,2)
                         .getValues();
  var key = cleanArray(params);
  for( var i=0;i<params.length;i++){
    if (params[i][1] != "") {
      html+='<option id="'+params[i][1]+'">'+params[i][0]+'</option>';
    } else {
      break;
    }
  }
  return html;
}

//******************************************************************************************************
// Fonction de generation de la LD BU Imputation (en fonction des donnees BU de l'onglet Params)
//
// [E] /
// [S] Code HTML du contenu de la LD BU Imputation ou Erreur ou '' sinon
//******************************************************************************************************
function getHtml_BUImputation(){

  var html='';
  var column ={BU:-1};
  var params = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAMS)
                         .getDataRange()
                         .getValues();

  for( var i=0;i< params[0].length;i++){
    if(params[0][i]==COLUMN_BU ) {column.BU=i;break;}
  }

  if(column.BU==-1) {
    Log_Severe("getHtml_BUImputation", Utilities.formatString("Column [%s] non defined.",COLUMN_BU));
    throw "no params";
  }

  // Evolution EVO-18 : Impact de la réorganisation de SQLi Entreprise Paris
  /*params = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAMS)
                         .getRange(6,column.BU+1,MAX_ROW)
                         .getValues();
  var out = cleanArray(params);
  for( var i=0;i<out.length;i++){
    html+='<option>'+out[i]+'</option>';
  }*/
  params = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAMS)
                         .getRange(6,column.BU+1,MAX_ROW,3)
                         .getValues();  
  params.sort(compareFirstColumn);
  for( var i=0;i<params.length;i++){
    if ((params[i][0] != '') && (params[i][2] == 'O')) {
      html+='<option>'+params[i][0]+'</option>';
    }
  }
  // Evolution EVO-18 : Impact de la réorganisation de SQLi Entreprise Paris
  return html;
}

//******************************************************************************************************
// Fonction de generation de la LD Condition de reglement (en fonction des donnees Condition de reglement de l'onglet Params)
//
// [E] /
// [S] Code HTML du contenu de la LD Condition de reglement ou Erreur ou '' sinon
//******************************************************************************************************
function getHtml_ConditionReglement(){

  var html='';
  var column ={ConditionReglement:-1};
  var params = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAMS)
                         .getDataRange()
                         .getValues();

  for( var i=0;i< params[0].length;i++){
    if(params[0][i]==COLUMN_CONDITION_REGL ) {column.ConditionReglement=i;break;}
  }

  if(column.ConditionReglement==-1) {
    Log_Severe("getHtml_ConditionReglement", Utilities.formatString("Column [%s] non defined.",COLUMN_CONDITION_REGL));    
    throw "no params";
  }

  params = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAMS)
                         .getRange(2,column.ConditionReglement+1,MAX_ROW)
                         .getValues();
  var out = cleanArray(params);
  for( var i=0;i<out.length;i++){
    html+='<option>'+out[i]+'</option>';
  }
  return html;
}

//******************************************************************************************************
// Fonction de generation de la LD Fournisseur (en fonction des donnees Fournisseur de l'onglet Fournisseurs)
//
// [E] /
// [S] Code HTML du contenu de la LD Fournisseur (trie par le nom du fournisseur) ou Erreur ou '' sinon
//******************************************************************************************************
function getHtml_Fournisseur(){

  var html='';
  var params = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAM_FOURNISSEUR)
                         .getRange(2,COLUMN_FOUR_ID+1,MAX_ROW_FOURN,COLUMN_FOUR_SIGLE+1)
                         .getValues();
  params.sort(compareSecondColumn);
  for( var i=0;i<params.length;i++){
    if (params[i][0] != '') {
      html+='<option>'+params[i][COLUMN_FOUR_ID+1]+'</option>';
    }
  }
  return html;
}

function compareSecondColumn(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] < b[1]) ? -1 : 1;
    }
}

function compareFirstColumn(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}

//******************************************************************************************************
// Fonction de generation de la LD Interlocuteur Fournisseur filtre par la valeur selectionne de la LD Fournisseur
// (en fonction des donnees Fournisseurs)
//
// [E] fournisseur : Valeur selectionnee dans la LD Fournisseur
// [S] Code HTML du contenu de la LD Interlocuteur Fournisseur ou Erreur ou '' sinon
//******************************************************************************************************
function getHtml_InterlocuteurFromFournisseur(fournisseur) {
  var html='';
  var found=false;
  var params2 = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAM_FOURNISSEUR)
                         .getRange(2,COLUMN_FOUR_ID+1,MAX_ROW_FOURN,COLUMN_FOUR_CONTACT2_EMAIL+1)
                         .getValues();
  for( var i=0;i<params2.length;i++){
    if( params2[i][COLUMN_FOUR_NOM].trim() == fournisseur.trim()) {
      found=true;
      if (params2[i][COLUMN_FOUR_CONTACT1_NOM] != '') {     
        html+='<option>'+params2[i][COLUMN_FOUR_CONTACT1_NOM]+'</option>';
      }
      if (params2[i][COLUMN_FOUR_CONTACT2_NOM] != '') {
        html+='<option>'+params2[i][COLUMN_FOUR_CONTACT2_NOM]+'</option>';
      }
      break;
    }
  }
  if (found == false) {
      Log_Severe("getHtml_InterlocuteurFromFournisseur", Utilities.formatString("Value [%s] non defined in Fournisseur repository.",fournisseur));    
  }
  return html;
}

//******************************************************************************************************
// Fonction de retourne l'url de download d'un file depose dans le Google Drive DA
//
// [E] idFile : Identifiant Google d'un fichier depose sur le Google Drive DA
// [S] Lien de download du document
//******************************************************************************************************
function getDownloadLink(idFile) {
  return "https://drive.google.com/a/sqli.com/uc?export=download&id="+idFile;
}

//******************************************************************************************************
// Fonction de retourne le lien vers le PDF Fiche (de creation) d'un fournisseur depuis le Google Drive
//
// [E] /
// [S] Lien de la fiche fournisseur PDF depuis le Google Drive
//******************************************************************************************************
function getFicheFournisseurLink() {
  return getDownloadLink(FICHE_FOURNISSEUR_ID);
}

//******************************************************************************************************
// Fonction de retourne le lien vers le PDF Documentation de l'outil
//
// [E] /
// [S] Lien vers le PDF de la documentation de l'outil
//******************************************************************************************************
function getDocumentationOutil() {
  return getDownloadLink(DOCUMENTATION_OUTIL);
}

//******************************************************************************************************
// Fonction de retourne l'url vers la fonction Fiche Fournisseur
//
// [E] /
// [S] Url de la fonction Fiche Fournisseur
//******************************************************************************************************
function getFonctionFicheFournisseur() {
  return getProcessAchatUrl() + '?page=fournisseur';
}

//******************************************************************************************************
// Fonction de retourne l'url vers la fonction Release Note
//
// [E] /
// [S] Url de la fonction Release Note
//******************************************************************************************************
function getReleaseNoteLink() {
  return getProcessAchatUrl() + '?page=ReleaseNote';
}

//******************************************************************************************************
// Fonction qui retourne l'adresse email du manager de la BU d'imputation
//
// [E] bu : Valeur de la BU d'imputation
// [S] Adresse email du manager de la BU ou Erreur ou '' sinon
//******************************************************************************************************
function GetManagerBU(bu){
  if(bu===undefined ) throw 'null bu';
  
  var column ={BU:-1}, out='';
  var params = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAMS)
                         .getDataRange()
                         .getValues();
  
  for( var i=0;i< params[0].length;i++){
    if(params[0][i]==COLUMN_BU ) {column.BU=i;break;}
  } 
  if(column.BU==-1 ) {
    Log_Severe("GetManagerBU", Utilities.formatString("Column [%s] non defined.",COLUMN_BU));    
    throw "no params";
  }
  for( var i=0;i<params.length;i++){
    if( params[i][column.BU]==bu) { out = params[i][column.BU+1]; break;}
  }
  return out;
}

//******************************************************************************************************
// Fonction qui retourne l(les)'adresse(s) email du manager de la BU d'imputation pour un affichage HTML
//
// [E] bu : Valeur de la BU d'imputation
// [S] Adresse email du manager de la BU ou Erreur ou '' sinon
//******************************************************************************************************
function GetAffichageManagerBU(bu){
  if(bu===undefined ) throw 'null bu';
  
  var column ={BU:-1}, out='', temp, len, ret='';
  var params = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAMS)
                         .getDataRange()
                         .getValues();
  
  for( var i=0;i< params[0].length;i++){
    if(params[0][i]==COLUMN_BU ) {column.BU=i;break;}
  } 
  if(column.BU==-1 ) {
    Log_Severe("GetAffichageManagerBU", Utilities.formatString("Column [%s] non defined.",COLUMN_BU));    
    throw "no params";
  }
  for( var i=0;i<params.length;i++){
    if( params[i][column.BU]==bu) { out = params[i][column.BU+1]; break;}
  }
  temp = out.split(",");
  len = temp.length;
  for(n=1;n<len+1;++n){
    ret +=temp[n-1]+"&#13";
  }  
  return ret;
}

//******************************************************************************************************
// Fonction qui genere de l'ID de la demande d'achat
//
// [E] /
// [S] ID de la demande d'achat : DA-YYMMDD-HHMMSS
//******************************************************************************************************
function genereID(){
var ref='DA-';
var date = new Date();

  // Format de l'ID de la demande d'achat DA-YYMMDD-HHMMSS
  ref+=(String(date.getFullYear())).slice(-2)+("0"+ String(date.getMonth()+1)).slice(-2)+("0" + String(date.getDate())).slice(-2);
  ref+="-"
  ref+=("0"+String(date.getHours())).slice(-2)+("0"+ String(date.getMinutes()+1)).slice(-2)+("0" + String(date.getSeconds())).slice(-2);
  return ref;
}

//******************************************************************************************************
// Fonction qui calcule la marge en fonction du prix d'achat, prix de vente et de la quantite
//
// [E] prixachat : valeur de la donnee Prix/TJM Achat
// [E] prixachat : valeur de la donnee Prix/TJM Vendu
// [E] prixachat : valeur de la donnee Quantite
// [S] Valeur calculee de la marge = (CA-Cout)/CA
//******************************************************************************************************
function calculMarge(prixachat, prixvente, quantite){
  var marge='';
  // Marge = (CA-Cout)/CA
  if (prixvente != '') {
    marge = (((Number(prixvente)*Number(quantite))-(Number(prixachat)*Number(quantite)))/(Number(prixvente)*Number(quantite)))*100 
  } else {
    marge = "";
  }
  Log_Info("calculMarge", Utilities.formatString("prixachat=%s, prixvente=%s, quantite=%s => return=%d",prixachat,prixvente,quantite,marge));
  return marge;
}

//******************************************************************************************************
// Fonction qui cree une ligne dans l'historique des demandes suite a un changement de staut
// et qui met a jour le flag Updated
//
// [E] id : id de la demande
// [E] statut : statut de la demande
// [E] acteur : acteur de la demande
// [E] commentaire : commentaire associe a la demande
// [E] urlfile : url d'un fichier a transmettre
// [S] /
//******************************************************************************************************
function createHistoryLine(id, statut, acteur, commentaire, urlfile) {
  var out = [];
  var dtDA;
  
  dtDA = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss")
  // Liste des donnees a injecter dans le Google Sheet Process Achat / Historique DA
  out.push(id);
  out.push(statut);
  out.push(acteur);
  out.push(dtDA);
  out.push(commentaire);
  out.push(concatHistoriqueDA(statut, acteur, dtDA,commentaire, urlfile));
  Log_Info("createHistoryLine", Utilities.formatString("DA=%s, out=%s",id,out));
  // Ecriture des donnes de la demande d'achat dans le Google Sheet / Historique DA associe
  SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_HISTODA)
                         .appendRow(out);
  // Mise a jour du flag Updated
  setDAData(id,COLUMN_DA_UPADTED,true);
}

//******************************************************************************************************
// Fonction qui sauvegarde les donnees de la demande d'achat dans le Google Sheet / Suivi DA & Historique DA
//
// [E] form : objet 1ere partie du formulaire de creation de la demade d'achat
// [E] mail : objet 2nde partie du formulaire (message)
// [E] filesID : liste de l'identifiant de(s) fichier(s) Devis
// [S] Valeurs : identifiant de la demande, manager de la BU d'imputation, BU d'imputation
//******************************************************************************************************
function save_form(form,mail,filesID){
  var out = [];
  var out2 =[];
  var idDA ="";
  var urlGoogleDriveDA = null;
  var mail_to = "";
  var mail_cc = "";
  var idRowDA = "";
  var strFormule = '';
  var urlFicheDA=null;
  var infoDA=null;
  var url_DevisFile='';
  var mtt='';
  
  if(form===undefined || typeof form!='object') throw 'null form';
  // Recuperation de la liste des statuts d'une demande d'achat
  var state=GetRowParams(COLUMN_STATE);
  // Calcul de la référence dossier
  idDA = genereID();
  // Liste des donnees a injecter dans le Google Sheet Process Achat / Suivi DA
  out.push(idDA);
  out.push('');
  out.push(Session.getActiveUser().getEmail());
  out.push(form.find('typedemande'));
  out.push(state.initialise);
  out.push(form.find('nature'));
  out.push(form.find('fournisseur'));
  if (form.find('interlocuteurfournisseur') != '') {
    out.push(form.find('interlocuteurfournisseur'));
    out.push(getInfoFournisseur(form.find('fournisseur'), form.find('interlocuteurfournisseur')).emailcontact);
    out.push(getInfoFournisseur(form.find('fournisseur'), form.find('interlocuteurfournisseur')).tel);
  } else {
    out.push(form.find('nomcontactfournisseur'));
    out.push(form.find('emailcontactfournisseur'));
    out.push("'"+form.find('telcontactfournisseur')+"'");
  }
  out.push(form.find('buimputation'));
  out.push(form.find('codeprojet'));
  out.push(form.find('nomprojet'));
  out.push(form.find('quantite'));
  mtt = form.find('prixtjmachat');
  out.push(mtt.replace(".",","));
  mtt = form.find('prixtjmvendu')
  out.push(mtt.replace(".",","));
  out.push(calculMarge(form.find('prixtjmachat'),form.find('prixtjmvendu'),form.find('quantite')));
  out.push(form.find('collab'));
  out.push(form.find('datedebutlivraison'));
  if (form.find('datefinlivraison') != '') {
    out.push(form.find('datefinlivraison'));
  } else {
    out.push("");
  }
  out.push(form.find('adresselivraison'));
  // EVO-21
  //out.push("");
  out.push(form.find('conditionreglement'));
  // EVO-21
  // EVO-10
  out.push(form.find('tauxtva'));
  // EVO-10
  Log_Info("save_form", Utilities.formatString("DA=%s, out=%s",idDA,out));
  // Ecriture des donnes de la demande d'achat dans le Google Sheet / Suivi DA associe
  SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_SUIVIDA)
                         .appendRow(out);
  // Recuperation du rowid de la demande d'achat
  idRowDA = onSearchDAwithID(idDA);
  // Ajout de la formule "Historique" pour la gestion de l'historique
  strFormule = FORMULE_HISTORIQUE.replace('%%idrow%%',idRowDA);
  SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_SUIVIDA)
                         .getRange(idRowDA, COLUMN_DA_HISTORIQUE)
                         .setFormula(strFormule);
  // Ajout de la formule "Accès Unit" pour la gestion des droits d'accès du dashboard
  strFormule = (FORMULE_ACCES_UNIT.replace('%%idrow%%',idRowDA)).replace('%%idrow%%',idRowDA);
  SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_SUIVIDA)
                         .getRange(idRowDA, COLUMN_DA_ACCES_UNIT)
                         .setFormula(strFormule); 
  // Ajout de la formule "Accès Entreprise" pour la gestion des droits d'accès du dashboard
  SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_SUIVIDA)
                         .getRange(idRowDA, COLUMN_DA_ACCES_ENTREPRISE)
                         .setFormula(FORMULE_ACCES_ENTREPRISE); 
  // Ajout de la formule "Accès Compta Fournisseur" pour la gestion des droits d'accès du dashboard
  SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_SUIVIDA)
                         .getRange(idRowDA, COLUMN_DA_ACCES_COMPTAFOUR)
                         .setFormula(FORMULE_ACCES_COMPTAFOURN);
  // Ajout de la formule "Accès Assistante" pour la gestion des droits d'accès du dashboard
  SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_SUIVIDA)
                         .getRange(idRowDA, COLUMN_DA_ACCES_ASSISTANTE)
                         .setFormula(FORMULE_ACCES_ASSISTANTE);
  // Ajout de la formule "Qtite x Prix achat" pour le dashboard
  strFormule = (FORMULE_MONTANT_ACHAT.replace('%%idrow%%',idRowDA)).replace('%%idrow%%',idRowDA);
  SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_SUIVIDA)
                         .getRange(idRowDA, COLUMN_DA_MONTANT_ACHAT)
                         .setFormula(strFormule);
  // Ajout de la formule "Resume DA" pour le dashboard
  strFormule = FORMULE_INFO_TIMELINE;
  for( var i=1;i< 20;i++){
    strFormule = strFormule.replace('%%idrow%%',idRowDA);
  }
  SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_SUIVIDA)
                         .getRange(idRowDA, COLUMN_DA_RESUME)
                         .setFormula(strFormule);
  // Sauvegarde des donnes de la DA dans la variable global
  setInfoDA(out, idRowDA);
  // Creation d'une ligne historique dans l'onglet Historique DA
  createHistoryLine(idDA, state.initialise, Session.getActiveUser().getEmail(), mail,"");
  // Creation du repertoire correspondant a la DA dans le Google Drive Process Achat
  urlGoogleDriveDA = createGoogleDriveFolderDA(idDA);
  setDAData(idDA,COLUMN_DA_URLDA,urlGoogleDriveDA);
  // Copie du fichier Devis dans le repertoire correspondant a la DA
  if(filesID) {
    url_DevisFile = saveFiles(filesID.split(","),idDA);
    setDAData(idDA,COLUMN_DA_DEVIS,url_DevisFile);
  } else {
    Log_Severe("save_form", Utilities.formatString("File 'Devis' not defined in DA %s.",idDA));
  }
  // Email vers le manager de la BU d'imputation
  // Evolution #2
  //mail_to = GetManagerBU(form.find('buimputation'));
  mail_to = GetManagerBU(BU_ASSISTANTE_ENTREPRISE_PARIS);
  mail_cc = Session.getActiveUser().getEmail();
  MailingTo(idDA,
            state.initialise,
            mail,
            mail_to,
            mail_cc,
            true);
  // Evolution #2
  //return {id:idDA,managerBU:mail_to,buimputation:form.find('buimputation')}; 
  return {id:idDA,assistante:GetManagerBU(BU_ASSISTANTE_ENTREPRISE_PARIS)}; 
}

//******************************************************************************************************
// Fonction qui recupere les donnes de la demande d'achat depuis le spreadsheet
//
// [E] id : identifiant de la demande d'achat
// [S] Valeurs : identifiant, emetteur, ... ou NULL si erreur
//******************************************************************************************************
function getInfoDA(id){
  var sheet =  SpreadsheetApp.openById(CLSID).getSheetByName(SHEET_SUIVIDA);
  var idrow = onSearchDAwithID(id);
  var dtDeb = '', strDtDeb='';
  var dtFin = '', strDtFin='';
  // EVO-21
  var strCondition = '';
  // EVO-21
  // EVO-10
  var strTVA = '';
  // EVO-10
  if (idrow != -1) {
    dtDeb = sheet.getRange(idrow,COLUMN_DA_DTDEBLIV).getValue();
    if (dtDeb != '') {
      strDtDeb = Utilities.formatDate(dtDeb, "GMT+6", "dd/MM/yyyy");
    }
    dtFin = sheet.getRange(idrow,COLUMN_DA_DTFINLIV).getValue();
    if (dtFin != '') {
      strDtFin = Utilities.formatDate(dtFin, "GMT+6", "dd/MM/yyyy");
    }
    // EVO-21
    if (sheet.getRange(idrow,COLUMN_DA_CONDREGL).getValue() != "") {
      strCondition = LIB_COND_REG_EMETTEUR + sheet.getRange(idrow,COLUMN_DA_CONDREGL).getValue();
    }
    // EVO-21
    // EVO-10
    if (sheet.getRange(idrow,COLUMN_DA_TVA).getValue() != "") {
      strTVA = LIB_COND_TVA_EMETTEUR + sheet.getRange(idrow,COLUMN_DA_TVA).getValue();
    }
    // EVO-10

    globalDAData= {id:id,
          idrow:idrow,
          bdc:sheet.getRange(idrow,COLUMN_DA_NUMBDC).getValue(),
          emetteur:sheet.getRange(idrow,COLUMN_DA_EMETTEUR).getValue(),
          fournisseur:sheet.getRange(idrow,COLUMN_DA_FOURNISSEUR).getValue(),
          statut:sheet.getRange(idrow,COLUMN_DA_STATE).getValue(),
          typedemande:sheet.getRange(idrow,COLUMN_DA_TYPE).getValue(),
          codetypedemande:onSearchTypeDemandeWithLabel(sheet.getRange(idrow,COLUMN_DA_TYPE).getValue()),
          nature:sheet.getRange(idrow,COLUMN_DA_NATURE).getValue(),
          contactfournisseur:sheet.getRange(idrow,COLUMN_DA_CONTACTFOURNISSEUR).getValue(),
          emailcontactfournisseur:sheet.getRange(idrow,COLUMN_DA_EMAILCONTACTFOURNISSEUR).getValue(),
          telcontactfournisseur:sheet.getRange(idrow,COLUMN_DA_TELCONTACTFOURNISSEUR).getValue(),
          buimputation:sheet.getRange(idrow,COLUMN_DA_BU).getValue(),
          codeprojet:sheet.getRange(idrow,COLUMN_DA_CDPROJET).getValue(),
          nomprojet:sheet.getRange(idrow,COLUMN_DA_NOMPROJET).getValue(),
          quantite:sheet.getRange(idrow,COLUMN_DA_QTE).getValue(),
          prixtjmachat:sheet.getRange(idrow,COLUMN_DA_PRXACHAT).getValue(),
          prixtjmvendu:sheet.getRange(idrow,COLUMN_DA_PRXVENDU).getValue(),
          marge:sheet.getRange(idrow,COLUMN_DA_MARGE).getValue(),
          collaborateur:sheet.getRange(idrow,COLUMN_DA_COLLABORATEUR).getValue(),
          datedebutlivraison:strDtDeb,
          datefinlivraison:strDtFin,
          adresselivraison:sheet.getRange(idrow,COLUMN_DA_ADRLIV).getValue(),
          conditionreglement:sheet.getRange(idrow,COLUMN_DA_CONDREGL).getValue(),
          // EVO-21
          conditionreglementemetteur:strCondition,
          // EVO-21
          // EVO-10
          tva:sheet.getRange(idrow,COLUMN_DA_TVA).getValue(),
          tvaemetteur:strTVA,
          // EVO-10
          urlDA:sheet.getRange(idrow,COLUMN_DA_URLDA).getValue(),
          urlDevis:sheet.getRange(idrow,COLUMN_DA_DEVIS).getValue(),
          urlBDCpdf:sheet.getRange(idrow,COLUMN_DA_BDCPDF).getValue(),
          urlBDCpdfsigne:sheet.getRange(idrow,COLUMN_DA_BDCPDFSIGNE).getValue(),
          urlFacture:sheet.getRange(idrow,COLUMN_DA_FACTURE).getValue(),
          urlBPF:sheet.getRange(idrow,COLUMN_DA_BPF).getValue(),
          managerBU:GetManagerBU(sheet.getRange(idrow,COLUMN_DA_BU).getValue()),
          managerEntrepriseParis:GetManagerBU(BU_ENTREPRISE_PARIS),
          acteurComptaFournisseur:GetManagerBU(BU_COMPTA_FOURNISSEUR),
          managerDirectionFinanciere:GetManagerBU(BU_DIRECTION_FINANCIERE),
          assistantes:GetManagerBU(BU_ASSISTANTE_ENTREPRISE_PARIS)
         };
    // Log des informations de la DA
    Log_Info("getInfoDA", Utilities.formatString("ret=%s",Utilities.jsonStringify(globalDAData)));
  }
  if(idrow==-1) throw 'Aucun dossier associé avec la référence suivante :'+id;
  return globalDAData;
}

//******************************************************************************************************
// Fonction qui sauvegarde les donnees d'une DA dans la variable globaleglobalDAData
//
// [E] data : data de la DA correspondant aux donnees presentes dans la ligne de la DA dans le spreadsheet
// [E] idrowDA : Numero de ligne de la DA dans le spreadsheet
// [S] /
//******************************************************************************************************
function setInfoDA(data, idrowDA) {
    globalDAData = {
          idrow:idrowDA,
          id:data[0],
          bdc:data[1],
          emetteur:data[2],
          typedemande:data[3],
          codetypedemande:onSearchTypeDemandeWithLabel(data[3]),
          statut:data[4],
          nature:data[5],
          fournisseur:data[6],
          contactfournisseur:data[7],
          emailcontactfournisseur:data[8],
          telcontactfournisseur:data[9],
          buimputation:data[10],
          codeprojet:data[11],
          nomprojet:data[12],
          quantite:data[13],
          prixtjmachat:data[14],
          prixtjmvendu:data[15],
          marge:data[16],
          collaborateur:data[17],
          datedebutlivraison:data[18],
          datefinlivraison:data[19],
          adresselivraison:data[20],
          conditionreglement:data[21],
          managerBU:GetManagerBU(data[10]),
          managerEntrepriseParis:GetManagerBU(BU_ENTREPRISE_PARIS),
          acteurComptaFournisseur:GetManagerBU(BU_COMPTA_FOURNISSEUR),
          managerDirectionFinanciere:GetManagerBU(BU_DIRECTION_FINANCIERE),
          assistantes:GetManagerBU(BU_ASSISTANTE_ENTREPRISE_PARIS)
         };
}


//******************************************************************************************************
// Fonction qui recupere les donnes d'un Fournisseur et du contact d'une demande d'achat
//
// [E] idFourn : identifiant du fournisseur
// [E] idContact : identifiant du contact (du fournisseur)
// [S] Valeurs : nom, sigle, ... ou NULL si erreur
//******************************************************************************************************
function getInfoFournisseur(idFourn, idContact){
  var ret = null;
  var sheet =  SpreadsheetApp.openById(CLSID).getSheetByName(SHEET_PARAM_FOURNISSEUR);
  var idrow = onSearchFournisseurwithID(idFourn);
  var nomc='';
  var emailc='';
  var telc='';
  if (idrow != -1) {
    if (idContact != '') {
      if (sheet.getRange(idrow,COLUMN_FOUR_CONTACT1_NOM+1).getValue() == idContact) {
        nomc = sheet.getRange(idrow,COLUMN_FOUR_CONTACT1_NOM+1).getValue();
        emailc = sheet.getRange(idrow,COLUMN_FOUR_CONTACT1_EMAIL+1).getValue();
        telc = sheet.getRange(idrow,COLUMN_FOUR_CONTACT1_TEL+1).getValue();
      }
      if (sheet.getRange(idrow,COLUMN_FOUR_CONTACT2_NOM+1).getValue() == idContact) {
        nomc = sheet.getRange(idrow,COLUMN_FOUR_CONTACT2_NOM+1).getValue();
        emailc = sheet.getRange(idrow,COLUMN_FOUR_CONTACT2_EMAIL+1).getValue();
        telc = sheet.getRange(idrow,COLUMN_FOUR_CONTACT2_TEL+1).getValue();
      }
    }
    ret= {id:idFourn,
          sigle:sheet.getRange(idrow,COLUMN_FOUR_SIGLE+1).getValue(),
          adresse:sheet.getRange(idrow,COLUMN_FOUR_ADRESSE+1).getValue(),
          tel:sheet.getRange(idrow,COLUMN_FOUR_TEL+1).getValue(),
          fax:sheet.getRange(idrow,COLUMN_FOUR_FAX+1).getValue(),
          siret:sheet.getRange(idrow,COLUMN_FOUR_SIRET+1).getValue(),
          ape:sheet.getRange(idrow,COLUMN_FOUR_APE+1).getValue(),
          nomcontact:nomc,
          telcontact:telc,
          emailcontact:emailc
         };
    // Log des informations du Fournisseur
    Log_Info("getInfoFournisseur", Utilities.formatString("ret=%s",Utilities.jsonStringify(ret)));
  }
  if(ret==null) throw 'Aucun fournisseur associé avec la référence suivante :'+idFourn;
  return ret;
}

//******************************************************************************************************
// Fonction qui recupere le n° de ligne dans l'onget Suivi DA d'une demande d'achat
//
// [E] id : identifiant de la demande d'achat
// [S] n° de la ligne dans l'onglet Suivi DA correspondant a la demande d'achat referencee ou -1 si non trouvee
//******************************************************************************************************
function onSearchDAwithID(id){
    var searchString;
    var sheet = SpreadsheetApp.openById(CLSID).getSheetByName(SHEET_SUIVIDA); 
    var column =1; //column Index   
    var columnValues = sheet.getRange(2, column, sheet.getLastRow()).getValues(); //1st is header row
    var searchResult = columnValues.findIndex(id); //Row Index - 2

    if(searchResult != -1)
    {
      searchResult = searchResult+2;
    }
    return searchResult;
}

Array.prototype.findIndex = function(search){
  if(search == "") return false;
  for (var i=0; i<this.length; i++)
    if (this[i].toString().indexOf(search) > -1 ) return i;
  return -1;
}

//******************************************************************************************************
// Fonction qui mets a jour une valeur dans l'onglet Suivi DA d'une demande d'achat 
//
// [E] id : identifiant de la demande d'achat
// [E] colonne : n° de la colonne correspondant a la donnee a mettre a jour
// [E] valeur : valeur mise a jour
// [S] /
//******************************************************************************************************
function setDAData(id, colonne, valeur) {
  var indexDA = onSearchDAwithID(id);
  var sheet = SpreadsheetApp.openById(CLSID).getSheetByName(SHEET_SUIVIDA); 
  if (indexDA != -1)
  {
    sheet.getRange(indexDA,colonne).setValue(valeur);
    switch(colonne) {
      case COLUMN_DA_NUMBDC : globalDAData.bdc = valeur; break;
      case COLUMN_DA_EMETTEUR : globalDAData.emetteur = valeur; break;
      case COLUMN_DA_TYPE : globalDAData.typedemande = valeur; break;
      case COLUMN_DA_STATE : globalDAData.statut = valeur; break;
      case COLUMN_DA_NATURE : globalDAData.nature = valeur; break;
      case COLUMN_DA_FOURNISSEUR : globalDAData.fournisseur = valeur; break;
      case COLUMN_DA_CONTACTFOURNISSEUR : globalDAData.contactfournisseur = valeur; break;
      case COLUMN_DA_EMAILCONTACTFOURNISSEUR : globalDAData.emailcontactfournisseur = valeur; break;
      case COLUMN_DA_TELCONTACTFOURNISSEUR : globalDAData.telcontactfournisseur = valeur; break;
      case COLUMN_DA_BU : globalDAData.buimputation = valeur; break;
      case COLUMN_DA_CDPROJET : globalDAData.codeprojet = valeur; break;
      case COLUMN_DA_NOMPROJET : globalDAData.nomprojet = valeur; break;
      case COLUMN_DA_QTE : globalDAData.quantite = valeur; break;
      case COLUMN_DA_PRXACHAT : globalDAData.prixtjmachat = valeur; break;
      case COLUMN_DA_PRXVENDU : globalDAData.prixtjmvendu = valeur; break;
      case COLUMN_DA_MARGE : globalDAData.marge = valeur; break;
      case COLUMN_DA_COLLABORATEUR : globalDAData.collaborateur = valeur; break;
      case COLUMN_DA_DTDEBLIV : globalDAData.datedebutlivraison = valeur; break;
      case COLUMN_DA_DTFINLIV : globalDAData.datefinlivraison = valeur; break;
      case COLUMN_DA_ADRLIV : globalDAData.adresselivraison = valeur; break;
      case COLUMN_DA_CONDREGL : globalDAData.conditionreglement = valeur; break;
      case COLUMN_DA_URLDA : globalDAData.urlDA = valeur; break;
      case COLUMN_DA_DEVIS : globalDAData.urlDevis = valeur; break;
      case COLUMN_DA_BDCPDF : globalDAData.urlBDCpdf = valeur; break;
      case COLUMN_DA_BDCPDFSIGNE : globalDAData.urlBDCpdfsigne = valeur; break;
      case COLUMN_DA_FACTURE : globalDAData.urlFacture = valeur; break;
      case COLUMN_DA_BPF : globalDAData.urlBPF = valeur; break;
      // EVO-10
      case COLUMN_DA_TVA : globalDAData.tva = valeur; break;
      // EVO-10
      /*case COLUMN_DA_FICHE : break;
      case COLUMN_DA_ISVALIDENIV2 : break;
      case COLUMN_DA_UPADTED : break;*/
    }
  } else {
    Log_Severe("setDAData", Utilities.formatString("indexDA=%s, id=%s, colonne=%s, valeur=%s",indexDA,id, colonne, valeur));
  }
}

//******************************************************************************************************
// Fonction qui retourne le code Type de demande en fonction de la valeur 
//
// [E] label : Valeur Type de demande
// [S] Code Type de demande en fonction de la valeur passee en parametre sinon vide
//******************************************************************************************************
function onSearchTypeDemandeWithLabel(label) {
  if(label===undefined ) throw 'null label';
  
  var column ={TypeDemande:-1}, out='';
  var params = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAMS)
                         .getDataRange()
                         .getValues();
  
  for( var i=0;i< params[0].length;i++){
    if(params[0][i]==COLUMN_TYPE2DEMANDE ) {column.TypeDemande=i;break;}
  } 
  if(column.TypeDemande==-1 ) {
    Log_Severe("onSearchTypeDemandeWithLabel", Utilities.formatString("Column [%s] not defined.",COLUMN_TYPE2DEMANDE));
    throw "no params";
  }
  for( var i=0;i<params.length;i++){
    if( params[i][column.TypeDemande]==label) { out = params[i][column.TypeDemande+1]; break;}
  }
  return out;
}

//******************************************************************************************************
// Fonction qui alimente un formulaire a l'aide de data 
//
// [E] form : formulaire a alimenter
// [E] statut : donnee statut
// [E] acteurcourant : donnee acteur courant
// [S] /
//******************************************************************************************************
function copyData2Form(form, statut, acteurcourant) {
  form.id = globalDAData.id;
  if (globalDAData.bdc != "") { form.bdc = "BDC n° "+globalDAData.bdc; } else {form.bdc = "";}
  form.fournisseur = globalDAData.fournisseur;
  form.statut = statut;
  form.demandeur = globalDAData.emetteur;
  form.typedemande = globalDAData.typedemande;
  form.nature = globalDAData.nature;
  form.contactfournisseur = globalDAData.contactfournisseur;
  form.buimputation = globalDAData.buimputation;
  form.codeprojet = globalDAData.codeprojet;
  form.nomprojet = globalDAData.nomprojet;
  form.quantite = globalDAData.quantite;
  if (globalDAData.prixtjmachat != '') {
    form.prixunitairetjmachat = Utilities.formatString("%.2f", globalDAData.prixtjmachat);
  } else {
    form.prixunitairetjmachat = '';
  }
  if (globalDAData.prixtjmvendu != '') {
    form.prixunitairetjmvendu = Utilities.formatString("%.2f", globalDAData.prixtjmvendu);
  } else {
    form.prixunitairetjmvendu = '';
  }
  if (globalDAData.marge != '') {
    form.marge = Utilities.formatString("%.2f", globalDAData.marge);
  } else {
    form.marge = '';
  }
  form.collaborateur = globalDAData.collaborateur;
  form.datedebutlivraison = globalDAData.datedebutlivraison;
  form.datefinlivraison = globalDAData.datefinlivraison;
  form.adresselivraison = globalDAData.adresselivraison;
  form.conditionreglement = globalDAData.conditionreglement;
  form.urldevis = globalDAData.urlDevis;
  if (globalDAData.urlBDCpdfsigne != '') {
    form.lblbdcsigne = "Lien de téléchargement";
    form.urlbdcsigne = globalDAData.urlBDCpdfsigne;
  } else {
    form.lblbdcsigne ='';
    form.urlbdcsigne='';
  }
  form.acteurcourant = acteurcourant;
}

//******************************************************************************************************
// Fonction qui determine si la validation Niv 2 est necessaire ou non 
// Marge calculee < Marge seuil ou Montant achat total > Montant seuil
//
// [E] marge : marge calculee de la demande d'achat
// [E] quantite : quantite de la demande d'achat
// [E] prixachat : prix d'achat de la demande d'achat
// [S] True si la validation Niv 2 est necessaire, False sinon
//******************************************************************************************************
function isValidationNiv2(marge, quantite, prixachat) {
  var blnValNiv2 = false;
  var marge_seuil='';
  var montant_achat_seuil='';
  
  // Marge calcule < Marge seuil ou Montant achat total > montant seuil
  if ((marge != '') || (marge == 0)){
    marge_seuil = GetMargeSeuil();
    if (marge_seuil != '') {
      if (marge <= marge_seuil) {
        blnValNiv2 = true;
      }
    }
  }
  if ((quantite != '') && (prixachat != '')) {
    montant_achat_seuil = GetMontantAchatSeuil();
    if (montant_achat_seuil != '') {
      if (quantite*prixachat >= montant_achat_seuil) {
        blnValNiv2 = true;
      }
    }
  }
  // Log des informations de la DA
  Log_Info("isValidationNiv2", Utilities.formatString("marge=%s, quantite=%s, prixachat=%s, marge seuil=%s, montant achat seuil=%s => return=%s",marge, quantite, prixachat,marge_seuil,montant_achat_seuil,blnValNiv2));
  return blnValNiv2;
}

//******************************************************************************************************
// Fonction qui retourne l'url de dev si l'execution est en mode DEV ou celle de PROD en mode PROD
// Utilisation de la fonction IsIntegration
//
// [E] /
// [S] Url de dev ou de prod
//******************************************************************************************************
function getProcessAchatUrl() {
  if (IsIntegration() == false) {
   return ScriptApp.getService().getUrl();
  }
  return "https://script.google.com/a/macros/sqli.com/s/AKfycbyzJ9q9ZllMMtngfL8V7RSCpFrlJFVYrqu5iWwLN2E/dev";
}

//******************************************************************************************************
// Fonction qui retourne l'identifiant d'un document en fonction de son url de telechargement
//
// [E] url : Url de telechargement du document concerne
// [S] Identifiant du document a l'aide de son url de telechargement
//******************************************************************************************************
function getIdFromUrl(url) {
  return url.match(/[-\w]{25,}/);
}

//******************************************************************************************************
// Fonction qui formate le contenu d'un email en HTML
//
// [E] id : identifiant de la demande
// [E] lst_a : liste des emails destinataires
// [E] lst_cc : liste des emails en copie
// [E] lst_ccc : liste des emails en copie cachee
// [E] obj_email : objet du mail
// [E] message_email : corps du mail
// [E] url_bdcsigne : url du document BDC signe
// [S] Contenu d'un email au format HTML
//******************************************************************************************************
function saveEmailToHTML(lst_a,lst_cc,lst_ccc,obj_email,message_email,url_bdcsigne) {
  var contenuhtml = '';
  contenuhtml += "TO:"+lst_a+"<BR>";
  contenuhtml += "CC:"+lst_cc+"<BR>";
  contenuhtml += "BCC:"+lst_ccc+"<BR>";
  contenuhtml += "OBJET:"+obj_email+"<BR>";
  contenuhtml += "MESSAGE:"+message_email+"<BR>";
  return contenuhtml
}

//******************************************************************************************************
// Fonction qui determine si la demande est de type sous-traitance ou non (Forfait ou Regie)
//
// [E] cTypeDemande : code type d'une DA
// [S] True si sous-traitance forfait ou regie, False sinon
//******************************************************************************************************
function isSousTraitance(cTypeDemande) {
  if ((cTypeDemande == 'SST-FOR') || (cTypeDemande == 'SST-REG')) {
    return true;
  }
  return false;
}

//******************************************************************************************************
// Fonction qui concatene une ligne historique d'ne DA (pour generer l'affichage de l'historique DA)
//
// [E] statut : donnee "Statut" de la ligne historique d'une DA
// [E] acteur : donnee "Acteur" de la ligne historique d'une DA
// [E] datestatut : donnee "Date du statut" de la ligne historique d'une DA
// [E] commentaire : donnee "Commentaire" de la ligne historique d'une DA
// [E] urlfile : url d'un fichier a transmettre
// [S] Chaine formatee {statut;acteur;datestatut}
//******************************************************************************************************
function concatHistoriqueDA(statut, acteur, datestatut, commentaire, urlfile) {
  return "{"+statut+";"+acteur+";"+datestatut+";"+commentaire+";"+urlfile+"}";
}

//******************************************************************************************************
// Fonction qui retourne si le user courant est admin (de la fonctionnalite Suivi & Gestion DA) ou pas
//
// [E] : - 
// [S] : True si admin False sinon
//******************************************************************************************************
function isAdminSuiviDA() {
  var ret=false;
  var users = Get_ADMIN_SUIVI();
  var current_user = Session.getActiveUser().getEmail();
  ret= users.split(',').lastIndexOf(current_user)!=-1;
  return ret;
}


//******************************************************************************************************
// Fonction qui recupere le n° de ligne dans l'onget Fournisseurs
//
// [E] id : identifiant du fornisseur (Nom)
// [S] n° de la ligne dans l'onglet Fournisseurs correspondant au nom du fournisseur d'une DA ou -1 si non trouvee
//******************************************************************************************************
function onSearchFournisseurwithID(nomfournisseur){
    var searchString;
    var sheet = SpreadsheetApp.openById(CLSID).getSheetByName(SHEET_PARAM_FOURNISSEUR); 
    var column =2; //column Index   
    var columnValues = sheet.getRange(2, column, sheet.getLastRow()).getValues(); //1st is header row
    var searchResult = columnValues.findIndex(nomfournisseur); //Row Index - 2

    if(searchResult != -1)
    {
      searchResult = searchResult+2;
    }
    return searchResult;
}

//******************************************************************************************************
// Fonction qui liste l'ensemble des acteurs d'une demande autre que les acteurs globaux
// (pour la gestion des droits d'acces au Google Drive DA
//
// [E] id : identifiant de la DA
// [S] Tableau des utilisateurs/acteurs d'une demande (emails)
//******************************************************************************************************
function getListUserAuthorized() {
  var ListUserAuthorized = [];
  var temp;
  var len;
  var dataDA;
  
  // Recuperation de la liste des users de la BU de la DA
  temp = (globalDAData.managerBU).split(',');
  //Log_Severe("getListUserAuthorized", Utilities.formatString("globalDAData.managerBU=%s",globalDAData.managerBU));
  len = temp.length;
  //Log_Severe("getListUserAuthorized", Utilities.formatString("len=%s",len));
  for(n=1;n<len+1;++n){
    ListUserAuthorized.push(temp[n-1]);
    //Log_Severe("getListUserAuthorized", Utilities.formatString("temp[n-1]=%s",temp[n-1]));
  }
  //Log_Severe("getListUserAuthorized", ListUserAuthorized);
  return ListUserAuthorized;
}

//******************************************************************************************************
// Fonction qui liste l'ensemble des acteurs globaux d'une demande (pour la gestion des droits d'acces au
// Google Drive DA : Admin, Admin Suivi, Assistante, Compta Fournisseur, Direction SQLi Entreprise Paris
//
// [S] Tableau des utilisateurs/acteurs (emails)
//******************************************************************************************************
function getListGeneralUserAuthorized() {
  var ListGeneralUserAuthorized = [];
  var temp;
  var len=0;
  var leng=0;
  var found=false;
  
  // Recuperation de la liste des users Admin
  temp = Get_ADMIN().split(',');
  len = temp.length;
  for(n=1;n<len+1;++n){
    ListGeneralUserAuthorized.push(temp[n-1]);
  }
  // Recuperation de la liste des users Admin du Suivi
  temp = Get_ADMIN_SUIVI().split(',');
  len = temp.length;
  leng = ListGeneralUserAuthorized.length;
  for(n=1;n<len+1;++n){
    found=false;
    for (m=1;m<leng+1;++m) {
      if (ListGeneralUserAuthorized[m-1] == temp[n-1]) {
        found=true;
        break;
      }
    }
    if (found == false) {
       ListGeneralUserAuthorized.push(temp[n-1]);
    }
  }
  // Recuperation de la liste des users de la BU SQLi Entreprise Paris
  temp = (GetManagerBU(BU_ENTREPRISE_PARIS)).split(',');
  len = temp.length;
  leng = ListGeneralUserAuthorized.length;
  for(n=1;n<len+1;++n){
    found=false;
    for (m=1;m<leng+1;++m) {
      if (ListGeneralUserAuthorized[m-1] == temp[n-1]) {
        found=true;
        break;
      }
    }
    if (found == false) {
       ListGeneralUserAuthorized.push(temp[n-1]);
    }
  }  
  // Recuperation de la liste des users de la BU Compta Fournisseur
  temp = (GetManagerBU(BU_COMPTA_FOURNISSEUR)).split(',');
  len = temp.length;
  leng = ListGeneralUserAuthorized.length;
  for(n=1;n<len+1;++n){
    found=false;
    for (m=1;m<leng+1;++m) {
      if (ListGeneralUserAuthorized[m-1] == temp[n-1]) {
        found=true;
        break;
      }
    }
    if (found == false) {
       ListGeneralUserAuthorized.push(temp[n-1]);
    }
  }
  // Recuperation de la liste des users de la BU Assistante
  temp = (GetManagerBU(BU_ASSISTANTE_ENTREPRISE_PARIS)).split(',');
  len = temp.length;
  leng = ListGeneralUserAuthorized.length;
  for(n=1;n<len+1;++n){
    found=false;
    for (m=1;m<leng+1;++m) {
      if (ListGeneralUserAuthorized[m-1] == temp[n-1]) {
        found=true;
        break;
      }
    }
    if (found == false) {
       ListGeneralUserAuthorized.push(temp[n-1]);
    }
  }
  return ListGeneralUserAuthorized;
}

//******************************************************************************************************
// Fonction qui retourne si le user courant est admin ou pas
//
// [E] : - 
// [S] : true/false
//******************************************************************************************************
function isAdminSuivi() {
  var ret=false,users = Get_ADMIN_SUIVI(), current_user = Session.getActiveUser().getEmail();
  ret= users.split(',').lastIndexOf(current_user)!=-1;
  Logger.log('Logging page, current user:%s, is admin:%s',current_user,ret)
  return ret;
}

//******************************************************************************************************
// Fonction qui retourne si le user courant est admin ou pas
//
// [E] : - 
// [S] : true/false
//******************************************************************************************************
function isAdmin() {
  var ret=false,users = Get_ADMIN(), current_user = Session.getActiveUser().getEmail();

  ret= users.split(',').lastIndexOf(current_user)!=-1;
  Logger.log('Logging page, current user:%s, is admin:%s',current_user,ret)
  
  return ret;

}

//******************************************************************************************************
// Fonction de generation de la LD Taux de TVA (en fonction des donnees TauxDeTva de l'onglet Params)
// EVO-10
//
// [E] /
// [S] Code HTML du contenu de la LD Taux de TVA ou Erreur ou '' sinon
//******************************************************************************************************
function getHtml_TauxDeTVA(){
  var html='';
  var column ={Taux2Tva:-1};
  var params = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAMS)
                         .getDataRange()
                         .getValues();

  for( var i=0;i< params[0].length;i++){
    if(params[0][i]==COLUMN_TVA ) {column.Taux2Tva=i;break;}
  }
  if(column.Taux2Tva==-1) {
    Log_Severe("getHtml_TauxDeTVA", Utilities.formatString("Column [%s] non defined.",COLUMN_TVA));
    throw "no params";
  }

  params = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAMS)
                         .getRange(2,column.Taux2Tva+1,MAX_ROW,2)
                         .getValues();
  var key = cleanArray(params);
  for( var i=0;i<params.length;i++){
    if (params[i][1] != "") {
      html+='<option id="'+params[i][1]+'">'+params[i][0]+'</option>';
    } else {
      break;
    }
  }
  return html;
}

//******************************************************************************************************
// Fonction de generation de la LD Taux de TVA (en fonction des donnees TauxDeTva de l'onglet Params)
// pour la generation du bon de commande : valeur Inconnue impossible
// EVO-10
//
// [E] /
// [S] Code HTML du contenu de la LD Taux de TVA ou Erreur ou '' sinon
//******************************************************************************************************
function getHtml_TauxDeTVABDC(){
  var html='';
  var column ={Taux2Tva:-1};
  var params = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAMS)
                         .getDataRange()
                         .getValues();

  for( var i=0;i< params[0].length;i++){
    if(params[0][i]==COLUMN_TVA ) {column.Taux2Tva=i;break;}
  }
  if(column.Taux2Tva==-1) {
    Log_Severe("getHtml_TauxDeTVABDC", Utilities.formatString("Column [%s] non defined.",COLUMN_TVA));
    throw "no params";
  }

  params = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAMS)
                         .getRange(2,column.Taux2Tva+1,MAX_ROW,2)
                         .getValues();
  var key = cleanArray(params);
  for( var i=0;i<params.length;i++){
    if ((params[i][1] != "")) {
      if (params[i][1] != "INC") {
        html+='<option id="'+params[i][1]+'">'+params[i][0]+'</option>';
      }
    } else {
      break;
    }
  }
  return html;
}



