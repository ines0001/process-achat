//******************************************************************************************************
// Fonction execute lors que la demande passe au staut "Prise en compte Niv 1"
// Actions realisees : creation d'une entree dans Historique DA + maj du statut dans Suivi DA
//
// [S] /
//******************************************************************************************************
function onPECNiv1(id) {

  try {
    // Recuperation des donnees de la DA
    getInfoDA(id);
    // Recuperation de la liste des statuts d'une demande d'achat
    var state=GetRowParams(COLUMN_STATE);
    // Maj du statut PEC Niv 1 uniquement si la demande d'achat est initialisee
    if (globalDAData.statut == state.initialise) {
      // Creation d'une ligne d'historique
      createHistoryLine(globalDAData.id, state.priseEnCompteNiv1, Session.getActiveUser().getEmail(), "","");
      // Maj du statut de la demande d'achat
      setDAData(globalDAData.id,COLUMN_DA_STATE,state.priseEnCompteNiv1);
    }
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("onPECNiv1", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Fonction execute lors que la demande passe au staut "Invalidation Niv 1"
// Actions realisees : creation d'une entree dans Historique DA + maj du statut dans Suivi DA + envoi
// d'un email a l'emetteur de la demande et au manager de la BU
//
// [E] form : objet formulaire PEC Niv 1
// [S] /
//******************************************************************************************************
function onInvalidateNiv1(form){
  var ret = null;
  var mail_to="";
  var mail_cc="";

  try {
    if(form===undefined ) throw 'null form';
    if(form.identifiant=='' ) throw 'null form';
    // Recuperation des donnees de la DA
    getInfoDA(form.identifiant);
    // Recuperation de la liste des statuts d'une demande d'achat
    var state=GetRowParams(COLUMN_STATE);
    // Action si le statut actuel est PEC
    if(globalDAData.statut == state.priseEnCompteNiv1) {
      // Creation d'une ligne d'historique
      createHistoryLine(form.identifiant, state.invalideeNiv1, Session.getActiveUser().getEmail(), form.commentaire_manager_ko,"");
      // Maj du statut de la demande d'achat
      setDAData(form.identifiant,COLUMN_DA_STATE,state.invalideeNiv1);
      // Emailing a l'emetteur de la demande
      mail_to = globalDAData.emetteur;
      mail_cc = "";
      MailingTo(form.identifiant,state.invalideeNiv1,form.commentaire_manager_ko,mail_to, mail_cc,true)
      // Retour de la fonction : emetteur de la demande
      msg='<h1>Merci</h1>',
      msg+='<p> Votre demande a bien été complétée et son traitement est en cours.</p>';
      msg+='<p> Un mail vient d\'être  envoyé à <b>'+globalDAData.emetteur+'</b> (Emetteur de la demande).</p>';
      msg+='<p>A bientôt,</p>';
      ret = {message:msg};
    } 
    if(ret==null) throw "La demande d'achat n°<b>"+form.identifiant+"</b> a déjà été traitée.<br>A bientôt.";
    return ret;
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("onInvalidateNiv1", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Fonction execute lors que la demande passe au staut "Validation Niv 1"
// Actions realisees : creation d'une entree dans Historique DA + maj du statut dans Suivi DA + envoi
// d'un email au Directeur SQLi Entreprise Paris
//
// [E] form : objet formulaire PEC Niv 1
// [S] /
//******************************************************************************************************
function onValidateNiv1(form){
  var ret = null;
  var msg="";
  var mail_to="";
  var mail_cc="";
  var blnValNiv2 = false;

  try {
    if(form===undefined ) throw 'null form';
    if(form.identifiant=='' ) throw 'null form';
    // Recuperation des donnees de la DA
    getInfoDA(form.identifiant);
    // Recuperation de la liste des statuts d'une demande d'achat
    var state=GetRowParams(COLUMN_STATE);
    // Action si le statut actuel est PEC
    if(globalDAData.statut == state.priseEnCompteNiv1) {
      // Creation d'une ligne d'historique
      createHistoryLine(form.identifiant, state.valideeNiv1, Session.getActiveUser().getEmail(), form.commentaire_manager_ok,"");
      // Maj du statut de la demande d'achat
      setDAData(form.identifiant,COLUMN_DA_STATE,state.valideeNiv1);
      // Aiguillage Validation Niv 2 ou Non
      // Marge calcule < Marge seuil ou Montant achat total > montant seuil
      blnValNiv2 = isValidationNiv2(globalDAData.marge, globalDAData.quantite, globalDAData.prixtjmachat);
      if (blnValNiv2 == true) {
        // Maj de la donnee calculee isValidationNiv 2
        setDAData(form.identifiant,COLUMN_DA_ISVALIDENIV2,"O");
        // Emailing au Directeur SQLi Entreprise Paris
        mail_to = globalDAData.managerEntrepriseParis;
        mail_cc = globalDAData.emetteur+','+globalDAData.managerBU;
        MailingTo(form.identifiant,state.valideeNiv1,form.commentaire_manager_ok,mail_to,mail_cc,true)
        // Retour de la fonction : message d'informations
        msg='<h1>Merci</h1>',
        msg+='<p> Votre demande a bien été complétée et son traitement est en cours.</p>';
        msg+='<p> Un mail vient d\'être  envoyé à <b>'+globalDAData.managerEntrepriseParis+'</b> (Direction SQLi Entreprise Paris).</p>';
        msg+='<p>A bientôt,</p>';
      } else {
        // Maj de la donnee calculee isValidationNiv 2
        setDAData(form.identifiant,COLUMN_DA_ISVALIDENIV2,"N");
        // Emailing a la Compta Fournisseur
        var mail_to=globalDAData.acteurComptaFournisseur;
        var mail_cc=globalDAData.emetteur+','+globalDAData.managerBU;
        MailingTo(form.identifiant,state.valideeNiv2,form.commentaire_manager_ok,mail_to, mail_cc, true)
        // Retour de la fonction : message d'informations
        msg='<h1>Merci</h1>',
        msg+='<p> Votre demande a bien été complétée et son traitement est en cours.</p>';
        msg+='<p> Un mail vient d\'être  envoyé à <b>'+globalDAData.acteurComptaFournisseur+'</b> (Comptabilité Fournisseur).</p>';
        msg+='<p>A bientôt,</p>';
      }
      ret = {message:msg};
    } 
    if(ret==null) throw "La demande d'achat n°<b>"+form.identifiant+"</b> a déjà été traitée.<br>A bientôt.";
    return ret;
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("onValidateNiv1", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Fonction execute lors que la demande passe au staut "Prise en compte Niv 2"
// Actions realisees : creation d'une entree dans Historique DA + maj du statut dans Suivi DA
//
// [E] id : identifiant de la demande
// [S] /
//******************************************************************************************************
function onPECNiv2(id) {

  try {
    // Recuperation des donnees de la DA
    getInfoDA(id);
    // Recuperation de la liste des statuts d'une demande d'achat
    var state=GetRowParams(COLUMN_STATE);
    // Maj du statut PEC Niv 2 uniquement si la demande d'achat est Validee Niv 1
    if (globalDAData.statut == state.valideeNiv1) {
      // Creation d'une ligne d'historique
      createHistoryLine(globalDAData.id, state.priseEnCompteNiv2, Session.getActiveUser().getEmail(), "","");
      // Maj du statut de la demande d'achat
      setDAData(globalDAData.id,COLUMN_DA_STATE,state.priseEnCompteNiv2);
    }
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("onValidateNiv1", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Fonction execute lors que la demande passe au staut "Invalidation Niv 2"
// Actions realisees : creation d'une entree dans Historique DA + maj du statut dans Suivi DA + envoi
// d'un email a l'emetteur de la demande et au manager de la BU
//
// [E] form : objet formulaire PEC Niv 2
// [S] /
//******************************************************************************************************
function onInvalidateNiv2(form){
  var ret = null;
  var msg='';
  var mail_to="";
  var mail_cc="";

  try {
    if(form===undefined ) throw 'null form';
    if(form.identifiant=='' ) throw 'null form';
    // Recuperation des donnees de la DA
    getInfoDA(form.identifiant);
    // Recuperation de la liste des statuts d'une demande d'achat
    var state=GetRowParams(COLUMN_STATE);
    // Action si le statut actuel est PEC
    if(globalDAData.statut == state.priseEnCompteNiv2) {
      // Creation d'une ligne d'historique
      createHistoryLine(form.identifiant, state.invalideeNiv2, Session.getActiveUser().getEmail(), form.commentaire_manager_ko,"");
      // Maj du statut de la demande d'achat
      setDAData(form.identifiant,COLUMN_DA_STATE,state.invalideeNiv2);
      // Emailing a l'emetteur + manager BU
      mail_to=globalDAData.emetteur+','+globalDAData.managerBU;
      mail_cc="";
      MailingTo(form.identifiant,state.invalideeNiv2,form.commentaire_manager_ko,mail_to, mail_cc, true)
      // Retour de la fonction : message d'informations
      msg='<h1>Merci</h1>',
      msg+='<p> Votre demande a bien été complétée et son traitement est en cours.</p>';
      msg+='<p> Un mail vient d\'être  envoyé à <b>'+globalDAData.emetteur+'</b> (Emetteur de la demande) et <b>'+globalDAData.managerBU+'</b> (Manager de la BU concernée).</p>';
      msg+='<p>A bientôt,</p>';
      ret = {message:msg};
    }
    if(ret==null) throw "La demande d'achat n°<b>"+form.identifiant+"</b> a déjà été traitée.<br>A bientôt.";
    return ret;
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("onInvalidateNiv2", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Fonction execute lors que la demande passe au staut "Validation Niv 2"
// Actions realisees : creation d'une entree dans Historique DA + maj du statut dans Suivi DA + envoi
// d'un email a la Compta Fournisseur
//
// [E] form : objet formulaire PEC Niv 2
// [S] /
//******************************************************************************************************
function onValidateNiv2(form){
  var ret = null;
  var msg="";
  var mail_to="";
  var mail_cc="";

  try {
    if(form===undefined ) throw 'null form';
    if(form.identifiant=='' ) throw 'null form';
    // Recuperation des donnees de la DA
    getInfoDA(form.identifiant);
    // Recuperation de la liste des statuts d'une demande d'achat
    var state=GetRowParams(COLUMN_STATE);
    if(globalDAData.statut == state.priseEnCompteNiv2){ 
      // Creation d'une ligne d'historique
      createHistoryLine(form.identifiant, state.valideeNiv2, Session.getActiveUser().getEmail(), form.commentaire_manager_ok,"");
      // Maj du statut de la demande d'achat
      setDAData(form.identifiant,COLUMN_DA_STATE,state.valideeNiv2);
      // Emailing a la Compta Fournisseur
      var mail_to=globalDAData.acteurComptaFournisseur;
      var mail_cc=globalDAData.emetteur+','+globalDAData.managerBU;
      MailingTo(form.identifiant,state.valideeNiv2,form.commentaire_manager_ok,mail_to, mail_cc, true)
      // Retour de la fonction : message d'informations
      msg='<h1>Merci</h1>',
      msg+='<p> Votre demande a bien été complétée et son traitement est en cours.</p>';
      msg+='<p> Un mail vient d\'être  envoyé à <b>'+globalDAData.acteurComptaFournisseur+'</b> (Comptabilité Fournisseur).</p>';
      msg+='<p>A bientôt,</p>';
      ret = {message:msg};
    } 
    if(ret==null) throw "La demande d'achat n°<b>"+form.identifiant+"</b> a déjà été traitée.<br>A bientôt.";
    return ret;
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("onValidateNiv2", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Fonction execute lors que la demande passe au staut "Prise en compte Comptabilite Fournisseur"
// Actions realisees : creation d'une entree dans Historique DA + maj du statut dans Suivi DA
//
// [E] id : identifiant de la demande
// [S] /
//******************************************************************************************************
function onPECNiv3a(id) {
  var out = [];
  var stateDA;
  var dtDA;

  try {
    // Recuperation des donnees de la demande d'achat
    getInfoDA(id);
    // Recuperation de la liste des statuts d'une demande d'achat
    var state=GetRowParams(COLUMN_STATE);
    // Maj du statut PEC Niv 3 uniquement si la demande d'achat est en etat Validee Niv 2
    if (globalDAData.statut == state.valideeNiv2) {
      // Creation d'une ligne d'historique
      createHistoryLine(globalDAData.id, state.priseEnCompteComptaFournisseur, Session.getActiveUser().getEmail(), "","");
      // Maj du statut de la demande d'achat
      setDAData(globalDAData.id,COLUMN_DA_STATE,state.priseEnCompteComptaFournisseur);
    }
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("onValidateNiv2", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Fonction execute lors que la demande passe au staut "BDC genere"
// Actions realisees : creation d'une entree dans Historique DA + maj du statut dans Suivi DA + envoi
// d'un email a la Compta Fournisseur
//
// [E] form : objet formulaire PEC Niv 3a
// [S] /
//******************************************************************************************************
function onGenerationBDC(form){
  var out = [];
  var ret = null;
  var urlBDC = null;
  var msg="";
  var mail_to="";
  var mail_cc="";

  try {
    if(form===undefined ) throw 'null form';
    if(form.identifiant=='' ) throw 'null form';
    // Recuperation des donnees de la demande d'achat
    getInfoDA(form.identifiant);
    // Recuperation de la liste des statuts d'une demande d'achat
    var state=GetRowParams(COLUMN_STATE);
    // Action si le statut actuel est PEC
    if((globalDAData.statut == state.priseEnCompteComptaFournisseur) || (globalDAData.statut == state.valideeNiv1)) {
      // Creation d'une ligne d'historique
      createHistoryLine(globalDAData.id, state.bdcGenere, Session.getActiveUser().getEmail(), "","");
      // Maj du Numero du Bon de commande de la demande d'achat
      setDAData(globalDAData.id,COLUMN_DA_NUMBDC,form.idbdc);
      // Maj des conditions de reglement de la demande d'achat
      setDAData(globalDAData.id,COLUMN_DA_CONDREGL,form.conditionreglement);
      // Generation du BDC au format PDF
      urlBDC = generationBDCpdf(form.idbdc);
      // Maj de l'url du BDC au format PDF de la demande d'achat
      setDAData(globalDAData.id,COLUMN_DA_BDCPDF,urlBDC);
      // Maj du statut de la demande d'achat
      setDAData(globalDAData.id,COLUMN_DA_STATE,state.bdcGenere);
      // Emailing a la Compta Fournisseur
      var mail_to=globalDAData.acteurComptaFournisseur;
      var mail_cc=globalDAData.emetteur+','+globalDAData.managerBU+','+globalDAData.managerEntrepriseParis;
      MailingTo(globalDAData.id,state.bdcGenere,"",mail_to, mail_cc, true)
      // Retour de la fonction : message d'informations
      msg='<h1>Merci</h1>',
      msg+='<p> Votre demande a bien été complétée et son traitement est en cours.</p>';
      msg+='<p> Le bon de commande provisoire généré est accessible suivant le lien : <a target="_blank" href="'+urlBDC+'">'+form.idbdc+'</a></p>';
      msg+='<p> Un mail vient d\'être  envoyé à <b>'+mail_to+'</b> (Comptabilité Fournisseur).</p>';
      msg+='<p>A bientôt,</p>';
      ret = {message:msg};
    } 
    if(ret==null) throw "La demande d'achat n°<b>"+form.identifiant+"</b> a déjà été traitée.<br>A bientôt.";
    return ret;
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("onGenerationBDC", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Fonction execute lors que la demande passe au staut "Invalidation Niv 3"
// Actions realisees : creation d'une entree dans Historique DA + maj du statut dans Suivi DA + envoi
// d'un email a l'emetteur de la demande, au manager de la BU, a la comptabilite fournisseur
//
// [E] form : objet formulaire DEC Niv 3b
// [S] /
//******************************************************************************************************
function onInvalidateNiv3(form){
  var ret = null;
  var msg="";
  var mail_to="";
  var mail_cc="";

  try {
    if(form===undefined ) throw 'null form';
    if(form.identifiant=='' ) throw 'null form';
    // Recuperation des donnees de la demande d'achat
    getInfoDA(form.identifiant);
    // Recuperation de la liste des statuts d'une demande d'achat
    var state=GetRowParams(COLUMN_STATE);
    // Action si le statut actuel est PEC
    if(globalDAData.statut == state.bdcGenere) {
      // Creation d'une ligne d'historique
      createHistoryLine(globalDAData.id, state.invalideeNiv3, Session.getActiveUser().getEmail(), form.commentaire_manager_ko,"");
      // Maj du statut de la demande d'achat
      setDAData(globalDAData.id,COLUMN_DA_STATE,state.invalideeNiv3);
      // Emailing a l'emetteur + manager de la BU de la demande d'achat
      mail_to=globalDAData.emetteur+','+globalDAData.managerBU;
      mail_cc=globalDAData.acteurComptaFournisseur+','+globalDAData.managerEntrepriseParis;
      MailingTo(globalDAData.id,state.invalideeNiv3,form.commentaire_manager_ko,mail_to,mail_cc,true)
      // Retour de la fonction : message d'informations
      msg='<h1>Merci</h1>',
      msg+='<p> Votre demande a bien été complétée et son traitement est en cours.</p>';
      msg+='<p> Un mail vient d\'être  envoyé à <b>'+globalDAData.emetteur+'</b> (Emetteur de la demande) et <b>'+globalDAData.managerBU+'</b> (Manager de la BU '+globalDAData.buimputation+').</p>';
      msg+='<p>A bientôt,</p>';
      ret = {message:msg};
    }
    if(ret==null) throw "La demande d'achat n°<b>"+form.identifiant+"</b> a déjà été traitée.<br>A bientôt.";
    return ret;
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("onInvalidateNiv3", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Fonction execute lors que la demande passe au staut "Validation Niv 3"
// Actions realisees : creation d'une entree dans Historique DA + maj du statut dans Suivi DA + envoi
// d'un email au Assistante
//
// [E] form : objet formulaire DEC Niv 3b
// [S] /
//******************************************************************************************************
function onValidateNiv3(form){
  var ret = null;
  var msg="";
  var mail_to="";
  var mail_cc="";
  var url_bcdsigne='';

  try {
    if(form===undefined ) throw 'null form';
    if(form.identifiant=='' ) throw 'null form';
    // Recuperation des donnees de la demande d'achat
    getInfoDA(form.identifiant);
    // Recuperation de la liste des statuts d'une demande d'achat
    var state=GetRowParams(COLUMN_STATE);
    // Action si le statut actuel est PEC
    if(globalDAData.statut == state.bdcGenere) {
      // Creation d'une ligne d'historique
      createHistoryLine(globalDAData.id, state.valideeNiv3, Session.getActiveUser().getEmail(), form.commentaire_manager_ok,"");
      // Maj du statut de la demande d'achat
      setDAData(globalDAData.id,COLUMN_DA_STATE,state.valideeNiv3);
      // Gestion du BDC signe
      url_bcdsigne = saveFiles(form.drive_id_files.split(","),globalDAData.id);
      setDAData(globalDAData.id,COLUMN_DA_BDCPDFSIGNE,url_bcdsigne);
      // Emailing aux Assistantes
      mail_to=globalDAData.assistantes;
      mail_cc=globalDAData.emetteur+','+globalDAData.managerBU+','+globalDAData.managerEntrepriseParis;
      MailingTo(globalDAData.id,state.valideeNiv3,form.commentaire_manager_ok,mail_to, mail_cc, true);
      // Retour de la fonction : message d'informations
      msg='<h1>Merci</h1>',
      msg+='<p> Votre demande a bien été complétée et son traitement est en cours.</p>';
      msg+='<p> Un mail vient d\'être  envoyé à <b>'+globalDAData.assistantes+'</b> (Assistante SQLi Enterprise).</p>';
      msg+='<p>A bientôt,</p>';
      ret = {message:msg};
    } 
    if(ret==null) throw "La demande d'achat n°<b>"+form.identifiant+"</b> a déjà été traitée.<br>A bientôt.";
    return ret;
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("onValidateNiv3", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Fonction execute lors que la demande passe au staut "APP mis à jour"
// Actions realisees : creation d'une entree dans Historique DA + maj du statut dans Suivi DA + envoi
// d'un email aux Assistantes
//
// [E] form : objet formulaire EditAPP
// [S] /
//******************************************************************************************************
function onSaisieAPP(form){
  var ret = null;
  var msg="";
  var mail_to="";
  var mail_cc="";

  try {
    if(form===undefined ) throw 'null form';
    if(form.identifiant=='' ) throw 'null form';
    // Recuperation des donnees de la demande d'achat
    getInfoDA(form.identifiant);
    // Recuperation de la liste des statuts d'une demande d'achat
    var state=GetRowParams(COLUMN_STATE);
    // Action si le statut actuel est PEC
    if(globalDAData.statut == state.valideeNiv3) {
      // Creation d'une ligne d'historique
      createHistoryLine(globalDAData.id, state.appMisAJour, Session.getActiveUser().getEmail(), form.commentaire_manager_ok,"");
      // Maj du statut de la demande d'achat
      setDAData(globalDAData.id,COLUMN_DA_STATE,state.appMisAJour);
      // Emailing aux Assistantes
      var mail_to=globalDAData.assistantes;
      var mail_cc=globalDAData.emetteur+','+globalDAData.managerBU+','+globalDAData.managerEntrepriseParis;
      MailingTo(globalDAData.id,state.appMisAJour,"",mail_to, mail_cc, true)
      // Retour de la fonction : message d'informations
      msg='<h1>Merci</h1>',
      msg+='<p> Votre demande a bien été complétée et son traitement est en cours.</p>';
      msg+='<p> Un mail vient d\'être  envoyé à <b>'+mail_to+'</b> (Assistante SQLi Enterprise).</p>';
      msg+='<p>A bientôt,</p>';
      ret = {message:msg};
    } 
    if(ret==null) throw "La demande d'achat n°<b>"+form.identifiant+"</b> a déjà été traitée.<br>A bientôt.";
    return ret;
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("onSaisieAPP", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Fonction execute lors que la demande passe au staut "BDC Transmis"
// Actions realisees : creation d'une entree dans Historique DA + maj du statut dans Suivi DA + envoi
// d'un email a la Compta Fournisseur
//
// [E] form : objet formulaire SendBDC
// [S] /
//******************************************************************************************************
function onSendBDC(form){
  var ret = null;
  var msg="";
  var mail_to="";
  var mail_cc="";

  try {
    if(form===undefined ) throw 'null form';
    if(form.identifiant=='' ) throw 'null form';
    // Recuperation des donnees de la demande d'achat
    getInfoDA(form.identifiant);
    // Recuperation de la liste des statuts d'une demande d'achat
    var state=GetRowParams(COLUMN_STATE);
    // Action si le statut actuel APP MIS A JOUR ou VALIDEE NIV 3 (si DA non interne)
    if ((globalDAData.statut == state.appMisAJour) || (globalDAData.statut == state.valideeNiv3)) {
      // Creation d'une ligne d'historique
      createHistoryLine(globalDAData.id, state.bdcTransmis, Session.getActiveUser().getEmail(), saveEmailToHTML(form.destinataire,form.copie,form.copiecache,form.objetemail,form.message,globalDAData.urlBDCpdfsigne),globalDAData.urlBDCpdfsigne);
      // Maj du statut de la demande d'achat
      setDAData(globalDAData.id,COLUMN_DA_STATE,state.bdcTransmis);
      // Emailing a la Compta Fournisseur
      var mail_to=globalDAData.acteurComptaFournisseur;
      var mail_cc=globalDAData.emetteur+','+globalDAData.managerBU+','+globalDAData.managerEntrepriseParis+','+globalDAData.assistantes;
      MailingTo(globalDAData.id,state.bdcTransmis,"",mail_to, mail_cc, true);
      // Emailing au Fournisseur
      MailingToExt(globalDAData.id,form.destinataire,form.copie,form.copiecache,form.objetemail,form.message,globalDAData.urlBDCpdfsigne);
      // Retour de la fonction : message d'informations
      msg='<h1>Merci</h1>',
      msg+='<p> Votre demande a bien été complétée et son traitement est en cours.</p>';
      msg+='<p> Un mail vient d\'être  envoyé à <b>'+form.destinataire+'</b> (Fournisseur) et à la <b>'+mail_to+'</b> (Comptabilité fournisseur)</p>';
      msg+='<p>A bientôt,</p>';
      ret = {message:msg};
    } 
    if(ret==null) throw "La demande d'achat n°<b>"+form.identifiant+"</b> a déjà été traitée.<br>A bientôt.";
    return ret;
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("onSendBDC", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Fonction execute lors que la demande passe au staut "BDC Transmis"
// Actions realisees : creation d'une entree dans Historique DA + maj du statut dans Suivi DA + envoi
// d'un email a la Compta Fournisseur
//
// [E] form : objet formulaire RecepFact
// [S] /
//******************************************************************************************************
function onRecepFact(form){
  var ret = null;
  var msg="";
  var mail_to="";
  var mail_cc="";
  var url_facture='';
  var url_BPF='';
  var stateDA;
  var dtDA;

  try {
    if(form===undefined ) throw 'null form';
    if(form.identifiant=='' ) throw 'null form';
    // Recuperation des donnees de la demande d'achat
    getInfoDA(form.identifiant);
    // Recuperation de la liste des statuts d'une demande d'achat
    var state=GetRowParams(COLUMN_STATE);
    // Action si le statut actuel est BDC TRANSMIS
    if(globalDAData.statut == state.bdcTransmis) {
      // Creation d'une ligne d'historique
      createHistoryLine(globalDAData.ud, state.factureBpfReceptionnes, Session.getActiveUser().getEmail(), form.commentaire_manager_ok,"");
      // Gestion de la facture
      url_facture = saveFiles(form.drive_id_files.split(","),globalDAData.id);
      setDAData(globalDAData.id,COLUMN_DA_FACTURE,url_facture);
      // Gestion du Bon Pour Facturation
      if (form.drive_id_files2 != '') {
        url_BPF = saveFiles(form.drive_id_files2.split(","),globalDAData.id);
        setDAData(globalDAData.id,COLUMN_DA_BPF,url_BPF);
      }
      if (isSousTraitance(globalDAData.id)) {
        //*** Cas d'une demande de sous-traitance
        // Maj du statut de la demande d'achat
        setDAData(globalDAData.id,COLUMN_DA_STATE,state.factureBpfReceptionnes);
        // Emailing au Manager BU pour valider la BPF
        var mail_to=globalDAData.managerBU
        var mail_cc=globalDAData.emetteur+','+globalDAData.managerEntrepriseParis+','+globalDAData.assistantes;
        MailingTo(globalDAData.id,state.factureBpfReceptionnes,"",mail_to, mail_cc, true)
        // Retour de la fonction : message d'informations
        msg='<h1>Merci</h1>',
        msg+='<p> Votre demande a bien été complétée et son traitement est en cours.</p>';
        msg+='<p> Un mail vient d\'être  envoyé à <b>'+globalDAData.managerBU+'</b> (Manager de la BU '+globalDAData.buimputation+')</p>';
        msg+='<p>A bientôt,</p>';
      } else {
        //*** Cas d'une demande hors sous-traitance
        // $TODO
      }
      ret = {message:msg};
    } 
    if(ret==null) throw "La demande d'achat n°<b>"+form.identifiant+"</b> a déjà été traitée.<br>A bientôt.";
    return ret;
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("onRecepFact", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Fonction execute lors que la demande passe au staut "BDC Transmis"
// Actions realisees : creation d'une entree dans Historique DA + maj du statut dans Suivi DA + envoi
// d'un email à ....
//
// [E] form : objet formulaire AnalyseBPF
// [S] /
//******************************************************************************************************
function onAnalyseBPF(form){
  // $TODO
}

//******************************************************************************************************
// Fonction qui determine la valeur du parametre page (ecran de l'action suivante) selon la valeur 
// courante du statut d'une demande
//
// [E] statut : Statut de la demande d'achat
// [S] Valeur du parametre Page (correspondant a l'écran d'action(s) suivante(s)
//******************************************************************************************************
function getParamPageByStatus(statut) {
  var paramPage="";
  var html
  var state=GetRowParams(COLUMN_STATE);
  switch(statut) {
    case "INTIALISE" :
    case "initialise" :
    case state.initialise : paramPage = {status:"PECNiv1", labelBashBoard:"Validation Unit"};
                            break;
    case "PRISE EN COMPTE NIV 1" :
    case "priseEnCompteNiv1" :
    case state.priseEnCompteNiv1 : paramPage = {status:"PECNiv1", labelBashBoard:"Validation Unit"};
                                   break;
    case "VALIDEE NIV 1" :
    case "valideeNiv1" :
    case state.valideeNiv1: 
    case "PRISE EN COMPTE NIV 2" :
    case "priseEnCompteNiv2" :
    case state.priseEnCompteNiv2 : paramPage = {status:"PECNiv2", labelBashBoard:"Validation SQLi Entreprise"};
                                   break;
    case "VALIDEE NIV 2" :
    case "valideeNiv2" :
    case state.valideeNiv2 :
    case "PRISE EN COMPTE COMPTA FOURNISSEUR" : 
    case "priseEnCompteComptaFournisseur" :
    case state.priseEnCompteComptaFournisseur : paramPage = {status:"PECNiv3a", labelBashBoard:"Génération BDC provisoire"};
                                                break;
    case "BDC GENERE" :
    case "bdcGenere" :
    case state.bdcGenere : paramPage = {status:"DECNiv3b", labelBashBoard:"Décision Direction Financière"};
                           break;
    case "VALIDEE NIV 3" :
    case "valideeNiv3" :
    case state.valideeNiv3 : paramPage = {status:"EditAPP", labelBashBoard:"Mise à jour APP"};
                             break;
    case "APP MIS A JOUR" :
    case "appMisAJour" :
    case state.appMisAJour : paramPage = {status:"SendBDC", labelBashBoard:"Emailing au fournisseur"};
                             break;
    case "BDC TRANSMIS" :
    case "bdcTransmis" :
    case state.bdcTransmis : paramPage = {status:"RecepFact", labelBashBoard:"Réception de la facture fournisseur"};
                             break;
  }
  return paramPage;
}

//******************************************************************************************************
// Fonction qui genere la liste des actions possibles par statut (d'une DA) 
// et la donnee de regroupement Avancement
//
// [E] /
// [S] Tableau de liste d'actions organise par statut (d'une DA)
// {"initialise": XXX
//  "priseEnCompteNiv1": XXX,
//  "valideeNiv1":       XXX,
//  "priseEnCompteNiv2": XXX,
//  "valideeNiv2": XXX,
//  "priseEnCompteComptaFournisseur": XXX,
//  "bdcGenere" : XXX,
//  "valideeNiv3" : XXX,
//  "appMisAJour" : XXX,
//  "bdcTransmis" : XXX
// }
//******************************************************************************************************
function generateInformationByStatus() {
  var lstActionByStatus = '';
  var lstActionInitialise = '';
  var lstActionNiv1 = '';
  var lstActionNiv2 = '';
  var lstActionBDCGenere = '';
  var lstActionNiv3 = '';
  var lstActionAPPMisAJour = '';
  var lstActionBDCTransmis = '';
  var htmlAvancementUnit = '';
  var htmlAvancementUnitDirection = '';
  var htmlAvancementUnitCompta = '';
  var htmlAvancementUnitAssistante = '';
  var htmlAvancementUnitClos = '';
  var dataParam;
  
  // Liste du(des) action(s) a realiser si le statut de la demande est "Initialise" ou "Prise en compte Niv 1"
  dataParam = getParamPageByStatus("initialise");
  lstActionInitialise+='  <li>';
  lstActionInitialise+='   <a target="_blank" href="'+getProcessAchatUrl()+'?page='+dataParam.status+'&ref=%%idDA%%">';
  lstActionInitialise+='    <span class="glyphicon glyphicon-circle-arrow-right" aria-hidden="true"></span>';
  lstActionInitialise+='    &nbsp;'+dataParam.labelBashBoard;
  lstActionInitialise+='   </a>';
  lstActionInitialise+='  </li>';
  // Liste du(des) action(s) a realiser si le statut de la demande est "Prise en compte Niv 2" ou "Validee Niv 1"
  dataParam = getParamPageByStatus("valideeNiv1");
  lstActionNiv1+='  <li>';
  lstActionNiv1+='   <a target="_blank" href="'+getProcessAchatUrl()+'?page='+dataParam.status+'&ref=%%idDA%%">';
  lstActionNiv1+='    <span class="glyphicon glyphicon-circle-arrow-right" aria-hidden="true"></span>';
  lstActionNiv1+='    &nbsp;'+dataParam.labelBashBoard;
  lstActionNiv1+='   </a>';
  lstActionNiv1+='  </li>';
  // Liste du(des) action(s) a realiser si le statut de la demande est "Prise en compte Compta Fournisseur" ou "Validee Niv 2"
  dataParam = getParamPageByStatus("valideeNiv2");
  lstActionNiv2+='  <li>';
  lstActionNiv2+='   <a target="_blank" href="'+getProcessAchatUrl()+'?page='+dataParam.status+'&ref=%%idDA%%">';
  lstActionNiv2+='    <span class="glyphicon glyphicon-circle-arrow-right" aria-hidden="true"></span>';
  lstActionNiv2+='    &nbsp;'+dataParam.labelBashBoard;
  lstActionNiv2+='   </a>';
  lstActionNiv2+='  </li>';
  // Liste du(des) action(s) a realiser si le statut de la demande est "BDC Genere"
  dataParam = getParamPageByStatus("bdcGenere");
  lstActionBDCGenere+='  <li>';
  lstActionBDCGenere+='   <a target="_blank" href="'+getProcessAchatUrl()+'?page='+dataParam.status+'&ref=%%idDA%%">';
  lstActionBDCGenere+='    <span class="glyphicon glyphicon-circle-arrow-right" aria-hidden="true"></span>';
  lstActionBDCGenere+='    &nbsp;'+dataParam.labelBashBoard;
  lstActionBDCGenere+='   </a>';
  lstActionBDCGenere+='  </li>';
  // Liste du(des) action(s) a realiser si le statut de la demande est "Validee Niv 3"
  dataParam = getParamPageByStatus("valideeNiv3");
  lstActionNiv3+='  <li>';
  lstActionNiv3+='   <a target="_blank" href="'+getProcessAchatUrl()+'?page='+dataParam.status+'&ref=%%idDA%%">';
  lstActionNiv3+='    <span class="glyphicon glyphicon-circle-arrow-right" aria-hidden="true"></span>';
  lstActionNiv3+='    &nbsp;'+dataParam.labelBashBoard;
  lstActionNiv3+='   </a>';
  lstActionNiv3+='  </li>';
  // Liste du(des) action(s) a realiser si le statut de la demande est "APP Mis a jour"
  dataParam = getParamPageByStatus("appMisAJour");
  lstActionAPPMisAJour+='  <li>';
  lstActionAPPMisAJour+='   <a target="_blank" href="'+getProcessAchatUrl()+'?page='+dataParam.status+'&ref=%%idDA%%">';
  lstActionAPPMisAJour+='    <span class="glyphicon glyphicon-circle-arrow-right" aria-hidden="true"></span>';
  lstActionAPPMisAJour+='    &nbsp;'+dataParam.labelBashBoard;
  lstActionAPPMisAJour+='   </a>';
  lstActionAPPMisAJour+='  </li>';
  // Liste du(des) action(s) a realiser si le statut de la demande est "BDC Transmis"
  dataParam = getParamPageByStatus("bdcTransmis");
  lstActionBDCTransmis+='  <li>';
  lstActionBDCTransmis+='   <a target="_blank" href="'+getProcessAchatUrl()+'?page='+dataParam.status+'&ref=%%idDA%%">';
  lstActionBDCTransmis+='    <span class="glyphicon glyphicon-circle-arrow-right" aria-hidden="true"></span>';
  lstActionBDCTransmis+='    &nbsp;'+dataParam.labelBashBoard;
  lstActionBDCTransmis+='   </a>';
  lstActionBDCTransmis+='  </li>';
  // Avancement par regroupement
  htmlAvancementUnit = '<span class="label label-primary">'+REGROUPEMENT_UNIT+'</span>';
  htmlAvancementUnitDirection = '<span class="label label-success">'+REGROUPEMENT_DIRECTION+'</span>';
  htmlAvancementUnitCompta = '<span class="label label-info">'+REGROUPEMENT_COMPTA+'</span>';
  htmlAvancementUnitAssistante = '<span class="label label-warning">'+REGROUPEMENT_ASSISTANTE+'</span>';
  htmlAvancementUnitClos = '<span class="label label-danger">'+REGROUPEMENT_CLOS+'</span>';
  // Generation du tableau de retour
  lstActionByStatus= {"initialise_1": lstActionInitialise,
                      "initialise_2": htmlAvancementUnit,
                      "priseEnCompteNiv1_1": lstActionInitialise,
                      "priseEnCompteNiv1_2": htmlAvancementUnit,
                      "valideeNiv1_1": lstActionNiv1,
                      "valideeNiv1_2": htmlAvancementUnitDirection,
                      "invalideeNiv1_1": "",
                      "invalideeNiv1_2": htmlAvancementUnitClos,
                      "priseEnCompteNiv2_1": lstActionNiv1,
                      "priseEnCompteNiv2_2": htmlAvancementUnitDirection,
                      "valideeNiv2_1":  lstActionNiv2,
                      "valideeNiv2_2":  htmlAvancementUnitCompta,
                      "invalideeNiv2_1": "",
                      "invalideeNiv2_2": htmlAvancementUnitClos,
                      "priseEnCompteComptaFournisseur_1": lstActionNiv2,
                      "priseEnCompteComptaFournisseur_2": htmlAvancementUnitCompta,
                      "bdcGenere_1" : lstActionBDCGenere,
                      "bdcGenere_2" : htmlAvancementUnitCompta,
                      "valideeNiv3_1" : lstActionNiv3,
                      "valideeNiv3_2" : htmlAvancementUnitAssistante,
                      "valideeNiv3_11" : lstActionAPPMisAJour,
                      "valideeNiv3_12" : htmlAvancementUnitAssistante,
                      "invalideeNiv3_1" : "",
                      "invalideeNiv3_2" : htmlAvancementUnitClos,
                      "appMisAJour_1" : lstActionAPPMisAJour,
                      "appMisAJour_2" : htmlAvancementUnitAssistante,
                      "bdcTransmis_1" : lstActionBDCTransmis,
                      "bdcTransmis_2" : htmlAvancementUnitAssistante
                     }
  return lstActionByStatus;
}

//******************************************************************************************************
// Fonction qui determine si le user connecte tentant de realiser une action du workflow est
// autorise ou non a la realiser : calcul en fonction de l'action en cours et si celui-ci est un admin
//
// [E] idDA : identifiant de la DA
// [E] nextAction : action a realiser
// [E] connectedUser : identifiant de l'user connecte
// [S] True si autorise, False sinon
//******************************************************************************************************
function isAuthorizedAction(idDA, nextAction, connectedUser) {
  var blnAuthorizedAction = false;
  
  if (isAdminSuiviDA()) {
    blnAuthorizedAction=true;
  } else {
    var infoDA = getInfoDA(idDA);
    switch(nextAction) {
      case "PECNiv1": // Seul le manager de la BU d'imputation de la DA est autorise
                      if (InStr(1,infoDA.managerBU,connectedUser,0) > 0) {
                        blnAuthorizedAction=true;
                      }
                      break;
      case "PECNiv2": // Seul le manager de la BU SQLi Entreprise Paris de la DA est autorise
                      if (InStr(1,infoDA.managerEntrepriseParis,connectedUser,0) > 0) {
                        blnAuthorizedAction=true;
                      }
                      break;
      case "PECNiv3a" : // Seule la Compta Four est autorisee
                        if (InStr(1,infoDA.acteurComptaFournisseur,connectedUser,0) > 0) {
                         blnAuthorizedAction=true;
                        }
                        break;
      case "DECNiv3b" : // Seule la Compta Four est autorisee
                        if (InStr(1,infoDA.acteurComptaFournisseur,connectedUser,0) > 0) {
                         blnAuthorizedAction=true;
                        }
                        break;
      case "EditAPP" : // Seule les Assistantes sont autorisees
                       if (InStr(1,infoDA.assistantes,connectedUser,0) > 0) {
                        blnAuthorizedAction=true;
                       }
                       break;
      case "SendBDC" : // Seule les Assistantes sont autorisees
                       if (InStr(1,infoDA.assistantes,connectedUser,0) > 0) {
                        blnAuthorizedAction=true;
                       }
                       break;
      case "RecepFact" : // Seule la Compta Four est autorisee
                         if (InStr(1,infoDA.acteurComptaFournisseur,connectedUser,0) > 0) {
                          blnAuthorizedAction=true;
                         }
                         break;
      case "ValBPF": // Seul le manager de la BU d'imputation de la DA est autorise
                     if (InStr(1,infoDA.managerBU,connectedUser,0) > 0) {
                       blnAuthorizedAction=true;
                     }
                     break;
    }
  }
  Log_Info("isAuthorizedAction", Utilities.formatString("DA=%s, Next action=%s, User=%s, isAdmin=%s => retour=%s",idDA,nextAction,connectedUser,isAdminSuiviDA(),blnAuthorizedAction));
  return blnAuthorizedAction;
}