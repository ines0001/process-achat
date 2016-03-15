//******************************************************************************************************
// Fonction qui genere le bon de commande (au format pdf) liee a la demande d'achat via le template
// du BDC SQLi
//
// [E] idbdc : numero du bdc associe a la demande d'achat
// [S] url vers le BDC genere au format PDF
//******************************************************************************************************
function generationBDCpdf(numbdc) {
  var copyFile, copyId, copyDoc, copyBody;
  var pdfFile,pdfBDC;
  var prxunitachat=null;
  var mttBrutHT=null;
  var mttTva=null;
  var mttTotalTTC=null;
  var dtDebLiv, dtFinLiv;
  var idRowFournisseur=-1;
  var infoFourn;
  var idfile;
  var dataInfoGenerationBDC;
  var mttAchat='';
  // EVO-10
  var txTVA=null;
  // EVO-10
  
  try {
    // Generation d'une copie a partir du template du BDC SQLi dans le root du Drive de l'utilisateur courant
    copyFile = DriveApp.getFileById(TEMPLATE_ID).makeCopy();
    // Recuperation du contenu du template du BDC SQLi
    copyId = copyFile.getId();
    copyDoc = DocumentApp.openById(copyId);
    copyBody = copyDoc.getBody();
    // Recupere les donnees Fournisseur
    infoFourn = getInfoFournisseur(globalDAData.fournisseur,globalDAData.contactfournisseur);
    // Recupere les donnees de parametrage
    dataInfoGenerationBDC = GetInfoGenerationBDC().split(",");
    // Remplace les tag du template du BDC SQLi avec les donnees de la demande d'achat
    mttAchat = globalDAData.prixtjmachat*globalDAData.quantite;
    mttBrutHT = Utilities.formatString("%.2f", mttAchat);
    // EVO-10
    txTVA = globalDAData.tva;
    if (txTVA == '') {
      txTVA = dataInfoGenerationBDC[1]/100;
    } else {
      txTVA = txTVA.replace(",",".");
    }
    // EVO-10
    
    // EVO-10
    //mttTva = Utilities.formatString("%.2f", mttAchat*(dataInfoGenerationBDC[1]/100));
    //mttTotalTTC = Utilities.formatString("%.2f", mttAchat+(mttAchat*(dataInfoGenerationBDC[1]/100)));
    if (IsNumeric(txTVA)) {
      mttTva = Utilities.formatString("%.2f", mttAchat*(txTVA/100));
      mttTotalTTC = Utilities.formatString("%.2f", mttAchat+(mttAchat*(txTVA/100)));
    } else {
      mttTva = "/";
      mttTotalTTC = mttBrutHT;
    }
    // EVO-10
    prxunitachat = Utilities.formatString("%.2f", globalDAData.prixtjmachat);
    dtDebLiv = globalDAData.datedebutlivraison;
    dtFinLiv = globalDAData.datefinlivraison;
    
    copyBody.replaceText('%%TAG_NUMBDC%%',globalDAData.bdc);
    copyBody.replaceText('%%TAG_DEMANDEUR%%',globalDAData.emetteur);
    copyBody.replaceText('%%TAG_BUIMPUTATION%%',globalDAData.buimputation);
    copyBody.replaceText('%%TAG_CODEPROJET%%',globalDAData.codeprojet);
    copyBody.replaceText('%%TAG_ASSISTANTE%%',dataInfoGenerationBDC[0]);
    copyBody.replaceText('%%TAG_TYPEDEMANDE%%',globalDAData.typedemande);
    if (dtFinLiv != '') {
      copyBody.replaceText('%%TAG_PERIODE2LIVRAISON%%',"Du "+dtDebLiv+" au "+dtFinLiv);
    } else {
      copyBody.replaceText('%%TAG_PERIODE2LIVRAISON%%', dtDebLiv);
    }
    copyBody.replaceText('%%TAG_NOMFOURNISSEUR%%',globalDAData.fournisseur);
    copyBody.replaceText('%%TAG_ADRESSEFOURNISSEUR%%',infoFourn.adresse);
    if (globalDAData.telcontactfournisseur != '') {
      copyBody.replaceText('%%TAG_TELFOURNISSEUR%%',globalDAData.telcontactfournisseur.replace("'",""));
    } else {
      copyBody.replaceText('%%TAG_TELFOURNISSEUR%%',infoFourn.tel);
    }
    copyBody.replaceText('%%TAG_MAILFOURNISSEUR%%',globalDAData.emailcontactfournisseur);
    copyBody.replaceText('%%TAG_INTERLOCUTEURFOURNISSEUR%%',globalDAData.contactfournisseur);
    copyBody.replaceText('%%TAG_NATURE%%',globalDAData.nature);
    copyBody.replaceText('%%TAG_PRIXUNIHT%%', prxunitachat + " €");
    copyBody.replaceText('%%TAG_QTE%%',globalDAData.quantite);
    copyBody.replaceText('%%TAG_MTTBRUTHT%%',mttBrutHT+" €");
    // EVO-10
    //copyBody.replaceText('%%TAG_TVA%%',dataInfoGenerationBDC[1]+"%");
    //copyBody.replaceText('%%TAG_MTTTVA%%',mttTva+" €");
    //copyBody.replaceText('%%TAG_MTTTOTALTTC%%',mttTotalTTC+" €");
    if (IsNumeric(txTVA)) {
      copyBody.replaceText('%%TAG_TVA%%',txTVA+"%");
      copyBody.replaceText('%%TAG_MTTTVA%%',mttTva+" €");
      copyBody.replaceText('%%TAG_MTTTOTALTTC%%',mttTotalTTC+" €");
    } else {
      copyBody.replaceText('%%TAG_TVA%%',LIB_BDC_PASDETVA);
      copyBody.replaceText('%%TAG_MTTTVA%%',mttTva);
      copyBody.replaceText('%%TAG_MTTTOTALTTC%%',mttTotalTTC+" €");
    }
    // EVO-10
    copyBody.replaceText('%%TAG_ADRESSELIVRAISON%%',globalDAData.adresselivraison);
    copyBody.replaceText('%%TAG_CONDITIONREGLEMENT%%',globalDAData.conditionreglement);
    copyBody.replaceText('%%TAG_LIEUBDC%%',dataInfoGenerationBDC[2]);
    copyBody.replaceText('%%TAG_DATEBDC%%',Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy"));
    // Creation du PDF, nommage du fichier BDC PDF avec l'id de la demande d'achat
    // et copie du PDF dans le repertoire du Google Drive Process Achat
    copyDoc.saveAndClose();
    pdfFile = DriveApp.createFile(copyFile.getAs("application/pdf"));
    pdfBDC = pdfFile.makeCopy("BDC"+numbdc,DriveApp.getFoldersByName(globalDAData.id).next());
    // Purge des fichiers temporaires
    copyFile.setTrashed(true);
    pdfFile.setTrashed(true);
    idfile = getIdFromUrl(pdfBDC.getUrl());
    return getDownloadLink(idfile);
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("generationBDCpdf", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Fonction qui genere la fiche DA (au format pdf) liee a la demande d'achat via le template
// du BDC SQLi
//
// [E] values : donnees de la demande d'achat
// [E] commentaire : commentaire saisie lors de la creation de la DA
// [S] url vers la fiche DA genere au format PDF
//******************************************************************************************************
function generationFicheDApdf(values, commentaire) {
  var copyFile, copyId, copyDoc, copyBody, copyHeader, copyFooter;
  var pdfFile,pdfBDC;
  var prxunitachat='';
  var prxunitvendu='';
  var marge='';
  var idfile;
  var dt = new Date();
  var dtGeneration='';
  // EVO-10
  var txTVA;
  // EVO-10
  
  try {
    // Generation d'une copie a partir du template du DA SQLi dans le root du Drive de l'utilisateur courant
    copyFile = DriveApp.getFileById(TEMPLATE_DA_ID).makeCopy();
    // Recuperation du contenu du template du BDC SQLi
    copyId = copyFile.getId();
    copyDoc = DocumentApp.openById(copyId);
    copyBody = copyDoc.getBody();
    copyHeader = copyDoc.getHeader();
    copyFooter = copyDoc.getFooter();
    //*********************************************************************************
    // BODY
    //*********************************************************************************
    // Remplace les tags du template du BDC SQLi avec les donnees de la demande d'achat
    if (values.prixtjmachat != '') {
      prxunitachat = Utilities.formatString("%.2f", values.prixtjmachat);
    }
    if (values.prixtjmvendu != '') {
      prxunitvendu = Utilities.formatString("%.2f", values.prixtjmvendu);
    }
    if (values.marge != '') {
      marge = Utilities.formatString("%.2f", values.marge);
    }
    dtGeneration += ("0" + String(dt.getDate())).slice(-2);
    dtGeneration += "/"
    dtGeneration += ("0"+ String(dt.getMonth()+1)).slice(-2);
    dtGeneration += "/"
    dtGeneration += (String(dt.getFullYear())).slice(-2);
    dtGeneration += " à "
    dtGeneration += ("0"+String(dt.getHours())).slice(-2)
    dtGeneration += "h"
    dtGeneration += ("0"+ String(dt.getMinutes()+1)).slice(-2)
    dtGeneration += "m"
    dtGeneration += ("0" + String(dt.getSeconds())).slice(-2);
    dtGeneration += "s"
    
    copyBody.replaceText('%%TAG_NUMDA%%',values.id);
    copyBody.replaceText('%%TAG_STATUT%%',values.statut);
    copyBody.replaceText('%%TAG_DTGENERATION%%',dtGeneration);
   
   
    copyBody.replaceText('%%TAG_DEMANDEUR%%',values.emetteur);
    copyBody.replaceText('%%TAG_TYPEDEMANDE%%',values.typedemande);
    copyBody.replaceText('%%TAG_NATURE%%',values.nature);

    copyBody.replaceText('%%TAG_NOMFOURNISSEUR%%',values.fournisseur);
    copyBody.replaceText('%%TAG_INTERLOCUTEURFOURNISSEUR%%',values.contactfournisseur);
    
    copyBody.replaceText('%%TAG_BU%%',values.buimputation);
    copyBody.replaceText('%%TAG_CODEPROJET%%',values.codeprojet);
    copyBody.replaceText('%%TAG_NOMPROJET%%',values.nomprojet);
    
    copyBody.replaceText('%%TAG_QTE%%',values.quantite);
    copyBody.replaceText('%%TAG_TJMPXACHAT%%', prxunitachat + " €");
    copyBody.replaceText('%%TAG_TJMPXVENDU%%',prxunitvendu+" €");
    copyBody.replaceText('%%TAG_MARGE%%',marge+" %");
    // EVO-10
    txTVA = values.tva;
    if (txTVA == '') {
      var dataInfoGenerationBDC = GetInfoGenerationBDC().split(",");
      txTVA = dataInfoGenerationBDC[1];
    } else {
      txTVA = String(txTVA).replace(",",".");
    }
    if (IsNumeric(txTVA)) {
      copyBody.replaceText('%%TAG_TVA%%',txTVA+" %");
    } else {
      copyBody.replaceText('%%TAG_TVA%%',LIB_BDC_PASDETVA);
    }
    // EVO-10
    // EVO-23
    copyBody.replaceText('%%TAG_CONDREG%%',values.conditionreglement);
    // EVO-23

    copyBody.replaceText('%%TAG_IDTCOLLAB%%', values.collaborateur);
    
    copyBody.replaceText('%%TAG_DTDEBLIV%%', values.datedebutlivraison);
    copyBody.replaceText('%%TAG_DTFINLIV%%', values.datefinlivraison);
    copyBody.replaceText('%%TAG_ADRESSELIVRAISON%%',values.adresselivraison);
    
    //copyBody.replaceText('%%TAG_COMMENTAIRE%%',commentaire);
    
    //*********************************************************************************
    // HEADER
    //*********************************************************************************
    copyHeader.replaceText('%%TAG_NUMDA%%',values.id);
    
    //*********************************************************************************
    // FOOTER
    //*********************************************************************************
    copyFooter.replaceText('%%TAG_DTGENERATION%%',dtGeneration);
    
    // Creation du PDF, nommage du fichier DA PDF avec l'id de la demande d'achat
    // et copie du PDF dans le repertoire du Google Drive Process Achat
    copyDoc.saveAndClose();
    pdfFile = DriveApp.createFile(copyFile.getAs("application/pdf"));
    pdfBDC = pdfFile.makeCopy("Fiche"+values.id,DriveApp.getFoldersByName(values.id).next());
    // Purge des fichiers temporaires
    copyFile.setTrashed(true);
    pdfFile.setTrashed(true);
    idfile = getIdFromUrl(pdfBDC.getUrl());
    return getDownloadLink(idfile);
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("generationFicheDApdf", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}