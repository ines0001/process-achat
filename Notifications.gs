//******************************************************************************************************
// Fonction qui remplace les saut de ligne dans un texte en <br>
//
// [E] /
// [S] Texte traité
//******************************************************************************************************
String.prototype.nl2br = function()
{
    return this.replace(/(\n)/g, "<br />");
}

//******************************************************************************************************
// Fonction qui execute l'envoi de l'email de contact
//
// [E] str : Contenu envoye dans le corps de l'email Contact
// [S] /
//******************************************************************************************************
function MailContact(str){
 
  try {
    MailApp.sendEmail( GetEMAIL_CONTACT(), '[ACHAT] : Questions utilisateurs', str );
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("MailContact", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Fonction qui envoi un email lors des changements de statut du workflow d'une demande
//
// [E] id : identifiant de la demande
// [E] statut : statut courant de la demande
// [E] commentaire : donnee(s) ajoutee(s) lors du changement d'etat d'une demande
// [E] mail_to : email des destinataires principaux de l'email (prochain acteur)
// [E] mail_cc : email des destinataire en copie de l'email (emetteur de la demande + ...)
// [E] option : flag pour activer l'envoi de l'email
// [S] contenu de l'email
//******************************************************************************************************
function MailingTo(id,statut,commentaire,mail_to, mail_cc, option){
  
  //if(values===undefined || typeof values!='object') throw 'no values for MailingTo';
  var html = HtmlService.createTemplateFromFile('template_email');
  var objet ='';
  var zoneAction ='';
  var url = ''
  var libelleBtn = ''
  var marge = '';
  var tblParamByStatus = '';
  var ctypedde='';
  var mail_sstraitance='';

  try {
    // Recuperation de la liste des statuts d'une demande d'achat
    var state=GetRowParams(COLUMN_STATE);
  
    switch(statut){
      case state.initialise : // Alimentation des donnees du template email
                            html.id = globalDAData.id;
                            html.bdc = "";
                            html.fournisseur = globalDAData.fournisseur;
                            html.statut = statut;
                            html.demandeur = globalDAData.emetteur;
                            html.typedemande = globalDAData.typedemande;
                            html.nature = globalDAData.nature;
                            html.contactfournisseur = globalDAData.contactfournisseur;
                            html.buimputation = globalDAData.buimputation;
                            html.codeprojet = globalDAData.codeprojet;
                            html.nomprojet = globalDAData.nomprojet;
                            html.quantite = globalDAData.quantite;
                            html.prixunitairetjmachat = globalDAData.prixtjmachat;
                            html.prixunitairetjmvendu = globalDAData.prixtjmvendu;
                            marge = globalDAData.marge;
                            if (marge != '') {
                              html.marge = Utilities.formatString("%.2f", marge);
                            } else {
                              html.marge = '';
                            }
                            html.collaborateur = globalDAData.collaborateur;
                            html.datedebutlivraison = globalDAData.datedebutlivraison;
                            html.datefinlivraison = globalDAData.datefinlivraison;
                            html.adresselivraison = globalDAData.adresselivraison;
                            html.conditionreglement = globalDAData.conditionreglement;
                            html.urldevis = globalDAData.urlDevis;
                            html.lblbdcsigne = "";
                            html.urlbdcsigne = "";
                            html.acteurcourant = globalDAData.managerBU;
                            tblParamByStatus = getParamPageByStatus(state.initialise);
                            url = (option)?getProcessAchatUrl()+'?page='+tblParamByStatus.status+'&ref='+id:'#';
                            url = encodeURI(url);
                            libelleBtn = 'Je traite la demande d\'achat';
                            zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">Commentaire attaché à la demande : '+commentaire.nl2br()+'</p>';
                            zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">';
                            zoneAction += ' <div class="text-center" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;text-align: center;color: #505050;font-family: Arial;font-size: 14px;line-height: 150%;">';
                            zoneAction += '  <a href="'+url+'" class="btn btn-outline btn-md" style="text-decoration: none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;background-color: transparent;color: #336699;display: inline-block;padding: 6px 12px;margin-bottom: 0;font-size: 14px;font-weight: normal;line-height: 1.42857143;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius: 4px;border-color: #563d7c;">'+libelleBtn+'</a>';
                            zoneAction += ' </div>';
                            zoneAction += '</p>';
                            zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            break;
    case state.invalideeNiv0 : // Alimentation des donnees du template email
                            copyData2Form(html, statut, Session.getActiveUser().getEmail());
                            // Definition de la zone d'action de l'email
                            zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            zoneAction += '<div style="text-decoration:none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;padding: 15px;margin-bottom: 20px;border: 1px solid transparent;border-radius: 4px;color: #a94442;background-color: #f2dede;border-color: #ebccd1;margin-right: 15px;margin-left: 15px;"><b>&#9432;</b>&nbsp;Demande refusée par '+html.acteurcourant;
                            zoneAction += ' <p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">Motif du refus : '+commentaire.nl2br()+'</p>';
                            zoneAction += '</div>';
                            break;
    case state.valideeNiv0 : // Alimentation des donnees du template email
                            copyData2Form(html, statut, Session.getActiveUser().getEmail());
                            // Definition de l'url de l'action et de la zone d'action de l'email
                            url = (option)?getProcessAchatUrl()+'?page='+getParamPageByStatus(state.valideeNiv0).status+'&ref='+id:'#';
                            url = encodeURI(url);
                            libelleBtn = 'Je traite la demande d\'achat';
                            zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">Commentaire attaché à la demande : '+commentaire.nl2br()+'</p>';
                            zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">';
                            zoneAction += ' <div class="text-center" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;text-align: center;color: #505050;font-family: Arial;font-size: 14px;line-height: 150%;">';
                            zoneAction += '  <a href="'+url+'" class="btn btn-outline btn-md" style="text-decoration: none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;background-color: transparent;color: #336699;display: inline-block;padding: 6px 12px;margin-bottom: 0;font-size: 14px;font-weight: normal;line-height: 1.42857143;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius: 4px;border-color: #563d7c;">'+libelleBtn+'</a>';
                            zoneAction += ' </div>';
                            zoneAction += '</p>';
                            zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            break;
    case state.invalideeNiv1 : // Alimentation des donnees du template email
                            copyData2Form(html, statut, Session.getActiveUser().getEmail());
                            // Definition de la zone d'action de l'email
                            zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            zoneAction += '<div style="text-decoration:none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;padding: 15px;margin-bottom: 20px;border: 1px solid transparent;border-radius: 4px;color: #a94442;background-color: #f2dede;border-color: #ebccd1;margin-right: 15px;margin-left: 15px;"><b>&#9432;</b>&nbsp;Demande refusée par '+html.acteurcourant;
                            zoneAction += ' <p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">Motif du refus : '+commentaire.nl2br()+'</p>';
                            zoneAction += '</div>';
                            break;
    case state.valideeNiv1 : // Alimentation des donnees du template email
                            copyData2Form(html, statut, GetManagerBU(BU_ENTREPRISE_PARIS));
                            // Definition de l'url de l'action et de la zone d'action de l'email
                            url = (option)?getProcessAchatUrl()+'?page='+getParamPageByStatus(state.valideeNiv1).status+'&ref='+id:'#';
                            url = encodeURI(url);
                            libelleBtn = 'Je traite la demande d\'achat';
                            zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">Commentaire attaché à la demande : '+commentaire.nl2br()+'</p>';
                            zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">';
                            zoneAction += ' <div class="text-center" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;text-align: center;color: #505050;font-family: Arial;font-size: 14px;line-height: 150%;">';
                            zoneAction += '  <a href="'+url+'" class="btn btn-outline btn-md" style="text-decoration: none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;background-color: transparent;color: #336699;display: inline-block;padding: 6px 12px;margin-bottom: 0;font-size: 14px;font-weight: normal;line-height: 1.42857143;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius: 4px;border-color: #563d7c;">'+libelleBtn+'</a>';
                            zoneAction += ' </div>';
                            zoneAction += '</p>';
                            zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            break;
    case state.invalideeNiv2 : // Alimentation des donnees du template email
                            copyData2Form(html, statut, Session.getActiveUser().getEmail());
                            // Definition de la zone d'action de l'email
                            zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            zoneAction += '<div style="text-decoration:none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;padding: 15px;margin-bottom: 20px;border: 1px solid transparent;border-radius: 4px;color: #a94442;background-color: #f2dede;border-color: #ebccd1;margin-right: 15px;margin-left: 15px;"><b>&#9432;</b>&nbsp;Demande refusée par '+html.acteurcourant;
                            zoneAction += ' <p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">Motif du refus : '+commentaire.nl2br()+'</p>';
                            zoneAction += '</div>';
                            break;
    case state.valideeNiv2 : // Alimentation des donnees du template email
                            copyData2Form(html, statut, Session.getActiveUser().getEmail());
                            // Definition de l'url d'action et de la zone d'action de l'email
                            url = (option)?getProcessAchatUrl()+'?page='+getParamPageByStatus(state.valideeNiv2).status+'&ref='+id:'#';
                            url = encodeURI(url);
                            libelleBtn = 'Je traite la demande d\'achat et je génère le bon de commande';
                            zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">Commentaire attaché à la demande : '+commentaire.nl2br()+'</p>';
                            zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">';
                            zoneAction += ' <div class="text-center" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;text-align: center;color: #505050;font-family: Arial;font-size: 14px;line-height: 150%;">';
                            zoneAction += '  <a href="'+url+'" class="btn btn-outline btn-md" style="text-decoration: none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;background-color: transparent;color: #336699;display: inline-block;padding: 6px 12px;margin-bottom: 0;font-size: 14px;font-weight: normal;line-height: 1.42857143;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius: 4px;border-color: #563d7c;">'+libelleBtn+'</a>';
                            zoneAction += ' </div>';
                            zoneAction += '</p>';
                            zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            break;
    case state.bdcGenere : // Alimentation des donnees du template email
                            copyData2Form(html, statut, Session.getActiveUser().getEmail());
                            // Defintion de l'url d'action et de la zone d'action de l'email
                            url = (option)?getProcessAchatUrl()+'?page='+getParamPageByStatus(state.bdcGenere).status+'&ref='+id:'#';
                            url = encodeURI(url);
                            libelleBtn = 'Je reporte la décision de la direction financière';
                            zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            zoneAction += '<div style="text-decoration:none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;padding: 15px;margin-bottom: 20px;border: 1px solid transparent;border-radius: 4px;color: #468847;background-color: #dff0d8;border-color: #d6e9c6;margin-right: 15px;margin-left: 15px;"><b>&#8618;</b>&nbsp;Impression du bon de commande provisoire n°<a href="'+globalDAData.urlBDCpdf+'">'+globalDAData.bdc+'</a>';
                            zoneAction += '</div>';
                            zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">';
                            zoneAction += ' <div class="text-center" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;text-align: center;color: #505050;font-family: Arial;font-size: 14px;line-height: 150%;">';
                            zoneAction += '  <a href="'+url+'" class="btn btn-outline btn-md" style="text-decoration: none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;background-color: transparent;color: #336699;display: inline-block;padding: 6px 12px;margin-bottom: 0;font-size: 14px;font-weight: normal;line-height: 1.42857143;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius: 4px;border-color: #563d7c;">'+libelleBtn+'</a>';
                            zoneAction += ' </div>';
                            zoneAction += '</p>';
                            break;
    case state.invalideeNiv3 : // Alimentation des donnees du template email
                            copyData2Form(html, statut, Session.getActiveUser().getEmail());
                            // Definition de la zone d'action de l'email
                            zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            zoneAction += '<div style="text-decoration:none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;padding: 15px;margin-bottom: 20px;border: 1px solid transparent;border-radius: 4px;color: #a94442;background-color: #f2dede;border-color: #ebccd1;margin-right: 15px;margin-left: 15px;"><b>&#9432;</b>&nbsp;Demande refusée par '+html.acteurcourant;
                            zoneAction += ' <p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">Motif du refus : '+commentaire.nl2br()+'</p>';
                            zoneAction += '</div>';
                            break;
    case state.valideeNiv3 : // Alimentation des donnees du template email
                            copyData2Form(html, statut, Session.getActiveUser().getEmail());
                            // Si type de demande = Interne Alors SendBDC sinon EditAPP 
                            ctypedde = getInfoDA(id).codetypedemande
                            // Evolution #2
                            
                            /*if ((ctypedde != null) && (ctypedde != 'INT')) {
                              url = (option)?getProcessAchatUrl()+'?page='+getParamPageByStatus(state.valideeNiv3).status+'&ref='+id:'#';
                              url = encodeURI(url);
                              libelleBtn = 'Je saisis le bon de commande dans APP';
                              zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">Commentaire attaché à la demande : '+commentaire.nl2br()+'</p>';
                              zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">';
                              zoneAction += ' <div class="text-center" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;text-align: center;color: #505050;font-family: Arial;font-size: 14px;line-height: 150%;">';
                              zoneAction += '  <a href="'+url+'" class="btn btn-outline btn-md" style="text-decoration: none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;background-color: transparent;color: #336699;display: inline-block;padding: 6px 12px;margin-bottom: 0;font-size: 14px;font-weight: normal;line-height: 1.42857143;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius: 4px;border-color: #563d7c;">'+libelleBtn+'</a>';
                              zoneAction += ' </div>';
                              zoneAction += '</p>';
                              zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            } else {
                              url = (option)?getProcessAchatUrl()+'?page='+getParamPageByStatus(state.appMisAJour).status+'&ref='+id:'#';
                              url = encodeURI(url);
                              libelleBtn = 'Je transmets le bon de commande au fournisseur';
                              zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">Commentaire attaché à la demande : '+commentaire.nl2br()+'</p>';
                              zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">';
                              zoneAction += ' <div class="text-center" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;text-align: center;color: #505050;font-family: Arial;font-size: 14px;line-height: 150%;">';
                              zoneAction += '  <a href="'+url+'" class="btn btn-outline btn-md" style="text-decoration: none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;background-color: transparent;color: #336699;display: inline-block;padding: 6px 12px;margin-bottom: 0;font-size: 14px;font-weight: normal;line-height: 1.42857143;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius: 4px;border-color: #563d7c;">'+libelleBtn+'</a>';
                              zoneAction += ' </div>';
                              zoneAction += '</p>';
                              zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            }*/
                            url = (option)?getProcessAchatUrl()+'?page='+getParamPageByStatus(state.valideeNiv3).status+'&ref='+id:'#';
                            url = encodeURI(url);
                            libelleBtn = 'Je valide la diffusion du bon de commande au fournisseur';
                            zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">Commentaire attaché à la demande : '+commentaire.nl2br()+'</p>';
                            zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">';
                            zoneAction += ' <div class="text-center" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;text-align: center;color: #505050;font-family: Arial;font-size: 14px;line-height: 150%;">';
                            zoneAction += '  <a href="'+url+'" class="btn btn-outline btn-md" style="text-decoration: none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;background-color: transparent;color: #336699;display: inline-block;padding: 6px 12px;margin-bottom: 0;font-size: 14px;font-weight: normal;line-height: 1.42857143;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius: 4px;border-color: #563d7c;">'+libelleBtn+'</a>';
                            zoneAction += ' </div>';
                            zoneAction += '</p>';
                            zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            // Evolution #2
                            break;
    // Evolution #2
    case state.valideeDiffusion : // Alimentation des donnees du template email
                            copyData2Form(html, statut, Session.getActiveUser().getEmail());
                            // Si type de demande = Interne Alors SendBDC sinon EditAPP 
                            ctypedde = getInfoDA(id).codetypedemande
                            if ((ctypedde != null) && (ctypedde != 'INT')) {
                              url = (option)?getProcessAchatUrl()+'?page='+getParamPageByStatus(state.valideeNivDiffusion).status+'&ref='+id:'#';
                              url = encodeURI(url);
                              libelleBtn = 'Je saisis le bon de commande dans APP';
                              zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">Commentaire attaché à la demande : '+commentaire.nl2br()+'</p>';
                              zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">';
                              zoneAction += ' <div class="text-center" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;text-align: center;color: #505050;font-family: Arial;font-size: 14px;line-height: 150%;">';
                              zoneAction += '  <a href="'+url+'" class="btn btn-outline btn-md" style="text-decoration: none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;background-color: transparent;color: #336699;display: inline-block;padding: 6px 12px;margin-bottom: 0;font-size: 14px;font-weight: normal;line-height: 1.42857143;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius: 4px;border-color: #563d7c;">'+libelleBtn+'</a>';
                              zoneAction += ' </div>';
                              zoneAction += '</p>';
                              zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            } else {
                              url = (option)?getProcessAchatUrl()+'?page='+getParamPageByStatus(state.appMisAJour).status+'&ref='+id:'#';
                              url = encodeURI(url);
                              libelleBtn = 'Je transmets le bon de commande au fournisseur';
                              zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">Commentaire attaché à la demande : '+commentaire.nl2br()+'</p>';
                              zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">';
                              zoneAction += ' <div class="text-center" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;text-align: center;color: #505050;font-family: Arial;font-size: 14px;line-height: 150%;">';
                              zoneAction += '  <a href="'+url+'" class="btn btn-outline btn-md" style="text-decoration: none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;background-color: transparent;color: #336699;display: inline-block;padding: 6px 12px;margin-bottom: 0;font-size: 14px;font-weight: normal;line-height: 1.42857143;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius: 4px;border-color: #563d7c;">'+libelleBtn+'</a>';
                              zoneAction += ' </div>';
                              zoneAction += '</p>';
                              zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            }
                            break;
    case state.invalideeDiffusion : // Alimentation des donnees du template email
                            copyData2Form(html, statut, Session.getActiveUser().getEmail());
                            // Definition de la zone d'action de l'email
                            zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            zoneAction += '<div style="text-decoration:none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;padding: 15px;margin-bottom: 20px;border: 1px solid transparent;border-radius: 4px;color: #a94442;background-color: #f2dede;border-color: #ebccd1;margin-right: 15px;margin-left: 15px;"><b>&#9432;</b>&nbsp;Demande refusée par '+html.acteurcourant;
                            zoneAction += ' <p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">Motif du refus : '+commentaire.nl2br()+'</p>';
                            zoneAction += '</div>';
                            break;
    // Evolution #2
    case state.appMisAJour :// Alimentation des donnees du template email
                            copyData2Form(html, statut, Session.getActiveUser().getEmail());
                            // Definition de l'url d'action et de la zone d'action de l'email
                            url = (option)?getProcessAchatUrl()+'?page='+getParamPageByStatus(state.appMisAJour).status+'&ref='+id:'#';
                            url = encodeURI(url);
                            libelleBtn = 'Je transmets le bon de commande au fournisseur';
                            zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">Commentaire attaché à la demande : '+commentaire.nl2br()+'</p>';
                            zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">';
                            zoneAction += ' <div class="text-center" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;text-align: center;color: #505050;font-family: Arial;font-size: 14px;line-height: 150%;">';
                            zoneAction += '  <a href="'+url+'" class="btn btn-outline btn-md" style="text-decoration: none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;background-color: transparent;color: #336699;display: inline-block;padding: 6px 12px;margin-bottom: 0;font-size: 14px;font-weight: normal;line-height: 1.42857143;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius: 4px;border-color: #563d7c;">'+libelleBtn+'</a>';
                            zoneAction += ' </div>';
                            zoneAction += '</p>';
                            zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            break;
    case state.bdcTransmis : // Alimentation des donnees du template email
                            copyData2Form(html, statut, Session.getActiveUser().getEmail());
                            // $TODO : V1
                            /*url = (option)?getProcessAchatUrl()+'?page='+getParamPageByStatus(state.bdcTransmis).status+'&ref='+id:'#';
                            url = encodeURI(url);
                            libelleBtn = 'Je receptionne la facture du fournisseur';
                            zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">Commentaire attaché à la demande : '+commentaire.nl2br()+'</p>';
                            zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">';
                            zoneAction += ' <div class="text-center" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;text-align: center;color: #505050;font-family: Arial;font-size: 14px;line-height: 150%;">';
                            zoneAction += '  <a href="'+url+'" class="btn btn-outline btn-md" style="text-decoration: none;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;background-color: transparent;color: #336699;display: inline-block;padding: 6px 12px;margin-bottom: 0;font-size: 14px;font-weight: normal;line-height: 1.42857143;text-align: center;white-space: nowrap;vertical-align: middle;-ms-touch-action: manipulation;touch-action: manipulation;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background-image: none;border: 1px solid transparent;border-radius: 4px;border-color: #563d7c;">'+libelleBtn+'</a>';
                            zoneAction += ' </div>';
                            zoneAction += '</p>';
                            zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            */
                            libelleBtn = '';
                            url='#';
                            zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">Commentaire attaché à la demande : '+commentaire.nl2br()+'</p>';
                            zoneAction += '<p style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">';
                            zoneAction += ' <div class="text-center" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;text-align: center;color: #505050;font-family: Arial;font-size: 14px;line-height: 150%;">';
                            zoneAction += ' </div>';
                            zoneAction += '</p>';
                            zoneAction += '<br style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;">';
                            break;
    case state.factureBpfReceptionnes : // Alimentation des donnees du template email
                            // $TODO : V1
                            break;
    default :               break;
    }
    // Si la DA est de type sous-traitance alors ajout de la liste de diffusion sous-traitance dans l'envoi de l'email
    if (isSousTraitance(globalDAData.codetypedemande) == true) {
      mail_sstraitance = GetEMAIL_SOUSTRAITANCE();
    }
    html.form_action='%%body_mail%%';
    // S.VIOT 01/10 Suppression du logo SQLi Entreprise : pb de performance
    var sqliLogoUrl = "http://www.sqli-enterprise.com/files/2014/05/logo_sqli_entreprise_340x156_bg_transp1.png";
    var sqliLogoBlob = UrlFetchApp
                          .fetch(sqliLogoUrl)
                          .getBlob()
                          .setName("sqliLogoBlob");
    objet = SUBJECT.replace('%%id%%',id)
                 .replace('%%fournisseur%%',globalDAData.fournisseur)
                 .replace('%%buimputation%%',globalDAData.buimputation)
                 .replace('%%statut%%',statut);
    var advancedArgs = {
                      to: mail_to,
                      cc: EMAIL_CC +','+mail_cc+','+mail_sstraitance,
                      subject: objet,
                      htmlBody: html.evaluate().getContent().replace('%%body_mail%%',zoneAction),
                      inlineImages:{
                                     sqliLogo: sqliLogoBlob
                                   },
                     };
    Log_Info("MailingTo", Utilities.formatString("advancedArgs=%s",Utilities.jsonStringify(advancedArgs)));
    if(option) MailApp.sendEmail(advancedArgs);
    return advancedArgs;
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("MailingTo", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Fonction qui envoi un email lors des echanges externe (an dehors de changement d'etat du workflow)
//
// [E] id : identifiant de la demande
// [E] lst_a : liste des emails destinataires
// [E] lst_cc : liste des emails en copie
// [E] lst_ccc : liste des emails en copie cachee
// [E] obj_email : objet du mail
// [E] message_email : corps du mail
// [E] url_bdcsigne : url du document BDC signe
// [S] /
//******************************************************************************************************
function MailingToExt(id,lst_a,lst_cc,lst_ccc,obj_email,message_email, url_bdcsigne){
  
  try {
    var file = DriveApp.getFileById(getIdFromUrl(url_bdcsigne));
    var advancedArgs = {
                      to: lst_a,
                      cc: lst_cc,
                      bcc : lst_ccc,
                      subject: obj_email,
                      htmlBody: message_email.nl2br(),
                      attachments: [file.getAs(MimeType.PDF)]
                     };
    Log_Info("MailingToExt", Utilities.formatString("advancedArgs=%s",Utilities.jsonStringify(advancedArgs)));
    MailApp.sendEmail(advancedArgs);
    return advancedArgs;
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("MailingToExt", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}


//******************************************************************************************************
// Fonction qui envoi un email correspondant a la demande de creation d'un fournisseur
//
// [E] idFile1 : Identifiant Google Drive du fichier n°1
// [E] url_bdcsigne : Identifiant Google Drive du fichier n°2
// [S] Message d'execution
//******************************************************************************************************
function MailingCreationFournisseur(idFile1, idFile2) {
  var ret = null;
  var msg='';
  var dataInfoEmail='';
  try {
    var file1 = DriveApp.getFileById(idFile1);
    var file2 = DriveApp.getFileById(idFile2);
    dataInfoEmail = GetInfoEmailingCreationFournisseur().split(",");
    var advancedArgs = {
                      to: dataInfoEmail[0],
                      cc: Session.getActiveUser().getEmail(),
                      bcc : "",
                      subject: dataInfoEmail[1],
                      htmlBody: dataInfoEmail[2].nl2br(),
                      attachments: [file1.getAs(MimeType.PDF),file2.getAs(MimeType.PDF)]
                     };
    Log_Info("MailingCreationFournisseur", Utilities.formatString("advancedArgs=%s",Utilities.jsonStringify(advancedArgs)));
    MailApp.sendEmail(advancedArgs);
    msg = "La demande de création du fournisseur a été transmise à "+dataInfoEmail[0]+" pour validation."
    ret = {message:msg};
    return ret;
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("MailingCreationFournisseur", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}


//******************************************************************************************************
// Fonction qui preformate le message envoye au fornisseur (parametre "Message Email Fournisseur" dans Params)
// et remplace les donnees dans les masques correspondants (n° BDC, ...)
//
// [E] numbdc : valeur du numero de BDC
// [S] Contenu du message preforme envoye au fournisseur
//******************************************************************************************************
function getMessagePreFormatted(numbdc) {
  var msg="";
  msg = enumParams('Message Email Fournisseur').join();
  msg = msg.replace("%%numbdc%%",numbdc);
  return msg;
  
}