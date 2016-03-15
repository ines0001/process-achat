//******************************************************************************************************
// Batch de generation de Fiches DA en fonction d'un flag Updated (indiquant que la Fiche a evoluee)
// - Generation de log dans l'onglet Log Batch
// - Declenche par un trigger
//
// [E] /
// [S] /
//******************************************************************************************************
function btGenerationFicheDA() {
  var urlficheDA='';
  var infoDA='';
  var dataDA='';
  var msg='';
  var idFicheDA='';
  var fileFicheDA=null;

  generationLogBatch(BATCH_GENERATION_FICHE_DA, BATCH_NIVEAU_INFORMATION, "Declenchement du batch ...");
  try {
    // Recuperation de l'ensemble des donnees dans l'onglet Suivi DA
    dataDA = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_SUIVIDA)
                         .getDataRange()
                         .getValues();
    // Parcours de l'ensemble des DA
    for( var i=1;i< dataDA.length;i++){
      // Verifie si la DA a ete mise a jour depuis le dernier lancement du batch
      if (dataDA[i][COLUMN_DA_UPADTED-1] == true) {
        if (dataDA[i][COLUMN_DA_FICHE-1] != '') {
          // Recuperation de l'id du document
          idFicheDA = getIdFromUrl(dataDA[i][COLUMN_DA_FICHE-1]);
          // Suppression du PDF Fiche DA deja existante
          fileFicheDA = DriveApp.getFileById(idFicheDA);
          fileFicheDA.setTrashed(true);
        }
        // Generation de la fiche DA mise a jour
        infoDA = getInfoDA(dataDA[i][COLUMN_DA_ID-1]);
        urlficheDA = generationFicheDApdf(infoDA, "")
        if (urlficheDA != '') {
          // Mise a jour de l'url de la fiche DA
          setDAData(dataDA[i][COLUMN_DA_ID-1],COLUMN_DA_FICHE,urlficheDA);
          // Mise a jour du flag Updated
          setDAData(dataDA[i][COLUMN_DA_ID-1], COLUMN_DA_UPADTED, false);
          // Information de log
          msg = 'Génération de la fiche DA de la DA n° '+dataDA[i][COLUMN_DA_ID-1];
          generationLogBatch(BATCH_GENERATION_FICHE_DA, BATCH_NIVEAU_INFORMATION, msg);
        } else {
          // Erreur lors de la generation de la fiche DA
          msg = 'Erreur lors de la generation de la fiche DA de la DA n° '+dataDA[i][COLUMN_DA_ID-1];
          generationLogBatch(BATCH_GENERATION_FICHE_DA, BATCH_NIVEAU_ERROR, msg);
        }
        infoDA='';
        urlficheDA ='';
        idFicheDA='';
        fileFicheDA=null;
      }
    }
  } catch(e) {
    // Generation de la log lors d'un erreur dans l'execution du batch
    generationLogBatch(BATCH_GENERATION_FICHE_DA, BATCH_NIVEAU_ERROR, "MSG="+e.message + " - FILENAME="+e.fileName+ " - LINE="+e.lineNumber);
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("btGenerationFicheDA", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
  generationLogBatch(BATCH_GENERATION_FICHE_DA, BATCH_NIVEAU_INFORMATION, "Declenchement du batch : terminé");
}

//******************************************************************************************************
// Batch qui applique le droit EDIT sur le repertoire principale PROCESS ACHAT
//  pour les users des listes : ADMIN, ADMIN SUIVI, BU SQLI ENTREPRISE PARIS
//  BU COMPTA FOURNISSEUR et BU ASSISTANTE
// A NE DECLENCHER QUE LORSQUE LES USERS ADMIN, ADMIN SUIVI, BU ENTREPRISE PARIS, BU COMPTA FOURNISSEUR
// ou BU ASSISTANTE ont evoluees
//
// [E] /
// [S] /
//******************************************************************************************************
function btAuthorizationApplytoMasterDirectory() {
  var folderProcessAchat = null;
  var generalUserAuthorized=null;
  
  generationLogBatch(BATCH_GENERATION_AUTORISATION_REP_PRINCIPAL, BATCH_NIVEAU_INFORMATION, "Declenchement du batch ...");
  try {
    folderProcessAchat = DriveApp.getFolderById(GOOGLEDRIVE_PROCACHAT_ID);
    generalUserAuthorized = getListGeneralUserAuthorized();
    // Ajout des droits d'ecriture de l'ensemble des acteurs sur le Google Drive
    folderProcessAchat.addEditors(generalUserAuthorized);
  } catch(e) {
    // Generation de la log lors d'un erreur dans l'execution du batch
    generationLogBatch(BATCH_GENERATION_AUTORISATION_REP_PRINCIPAL, BATCH_NIVEAU_ERROR, "MSG="+e.message + " - FILENAME="+e.fileName+ " - LINE="+e.lineNumber);
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("btAuthorizationApplytoMasterDirectory", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
  generationLogBatch(BATCH_GENERATION_AUTORISATION_REP_PRINCIPAL, BATCH_NIVEAU_INFORMATION, "Declenchement du batch : terminé");
}

//******************************************************************************************************
// Batch qui purge les logs des traitement batch
//
// [E] /
// [S] /
//******************************************************************************************************
function btPurgeLogBatch() {
  var SHEET_MAX_ROWS = 1000; //sheet is cleared and starts again
  try {
    var rowCount =   SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAM_LOG_BATCH)
                         .getLastRow();
    if (rowCount > SHEET_MAX_ROWS) {
      SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAM_LOG_BATCH)
                         .deleteRows(2, rowCount-2);
    }
  } catch(e) {
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("btPurgeLogBatch", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Calcul la difference en jour entre 2 dates
//
// [E] a : date de debut de reference
// [E] b : date de fin de reference
// [S] difference en jour entre la date de debut et la date de fin
//******************************************************************************************************
function DateDiffInDays(a, b) {
  /*var _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utc2 - utc1) / _MS_PER_DAY);*/
  var dateDiff = b.getTime() - a.getTime();
  dateDiff = dateDiff / ( 1000 * 60 * 60 * 24 );  // convert ms to days
  dateDiff = Math.round(dateDiff);
  var x = 0;
  var wd = 0;
  var wk = 0;
  for (x=0;x<=parseInt(dateDiff);x++){ 
    if (a.getDay() == 0 || a.getDay() == 6){
      wk = parseInt(wk)+1
      wd = parseInt(wd)+1
        }
    else{
      wd = parseInt(wd)+1
        }
    a = new Date(a.setDate(a.getDate()+1))
      }
  var workingDays = parseInt(wd) - parseInt(wk)
  return workingDays;  
}


//******************************************************************************************************
// Formatage de l'information de duree de traitement par phase
//
// [E] num : numero de l'etape (0 à 2)
// [E] dVal : duree de traitement de la phase
// [E] strBU : libelle de la BU d'imputation
// [E] blnEnCours : = True si la phase est en cours, False sinon
// [S] Duree de traitement par phase formatee
//******************************************************************************************************
function AffichageDureeTraitement(num, dVal, strBU, blnEnCours) {
var strMessage = '';

  if (num == 0) {
    if (dVal == "-1") {
      strMessage += "Etape [Assistante] : /";
    } else {
      if (dVal < 1) {
        if (blnEnCours == true) {
          strMessage += "Etape [Assistante] EN COURS : Durée de traitement < 1j (constatée à la date du jour)";
        } else {
          strMessage += "Etape [Assistante] : Durée de traitement < 1j";
        }
      } else {
        if (blnEnCours == true) {
          strMessage += Utilities.formatString("Etape [Assistante] EN COURS : Durée de traitement = %dj (constatée à la date du jour)",dVal);
        } else {
          strMessage += Utilities.formatString("Etape [Assistante] : Durée de traitement = %dj",dVal);
        }
      }
    }
  }
  if (num == 1) {
    if (dVal == "-1") {
      strMessage += Utilities.formatString("Etape [Manager BU %s] : /",strBU);
    } else {
      if (dVal < 1) {
        if (blnEnCours == true) {
          strMessage += Utilities.formatString("Etape [Manager BU %s] EN COURS : Durée de traitement < 1j (constatée à la date du jour)",strBU);
        } else {
          strMessage += Utilities.formatString("Etape [Manager BU %s] : Durée de traitement < 1j",strBU);
        }
      } else {
        if (blnEnCours == true) {
          strMessage += Utilities.formatString("Etape [Manager BU %s] EN COURS : Durée de traitement = %dj (constatée à la date du jour)",strBU,dVal);
        } else {
          strMessage += Utilities.formatString("Etape [Manager BU %s] : Durée de traitement = %dj",strBU,dVal);
        }
      }
    }
  }
  if (num == 2) {
    if (dVal == "-1") {
      strMessage += "Etape [Direction SQLi Entreprise Paris] : /";
    } else {
      if (dVal < 1) {
        if (blnEnCours == true) {
          strMessage += "Etape [Direction SQLi Entreprise Paris] EN COURS : Durée de traitement < 1j (constatée à la date du jour)";
        } else {
          strMessage += "Etape [Direction SQLi Entreprise Paris] : Durée de traitement < 1j";
        }
      } else {
        if (blnEnCours == true) {
          strMessage += Utilities.formatString("Etape [Direction SQLi Entreprise Paris] EN COURS : Durée de traitement = %dj (constatée à la date du jour)",dVal);
        } else {
          strMessage += Utilities.formatString("Etape [Direction SQLi Entreprise Paris] : Durée de traitement = %dj",dVal);
        }
      }
    }
  }
  return strMessage;
}

//******************************************************************************************************
// Batch de generation de statistique pour les demandes d'achat qui sont dans un état anterieur a
//  celui de Valide Niv 2 (EVO-20)
//
// [E] /
// [S] /
//******************************************************************************************************
function btStatistiqueDureeDeTraitement() {
  var dataDA;
  var infoDA;
  var reg1;
  var tblInfoDA;
  var tblLigneInfoDA;
  var year;
  var month;
  var day;
  var nbJoursDureeTraitement = 0;
  var strEtat='';
  var strDateEtat='';
  var dtDateEtat;
  var dtDateInit;
  var dtDatePEC0;
  var dtDateVal0;
  var dtDatePEC1;
  var dtDateVal1;
  var dtDatePEC2;
  var dtDateVal2;
  var nbJourTraitementNiv0 = null;
  var nbJourTraitementNiv1 = null;
  var nbJourTraitementNiv2 = null;
  var strHtmlDA = [];
  var dtControle;
  var nbOperation;
  var strAffichageTraitementNiv0='';
  var strAffichageTraitementNiv1='';
  var strAffichageTraitementNiv2='';
  var blnSuite = false;
  var blnAncienneDA = false;  
  
  generationLogBatch(BATCH_STAT_DUREE_TRAITEMENT, BATCH_NIVEAU_INFORMATION, "Declenchement du batch ...");
  var html = HtmlService.createTemplateFromFile('template_email_report1');
  try {
    // Recuperation de l'ensemble des donnees dans l'onglet Suivi DA
    dataDA = SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_SUIVIDA)
                         .getDataRange()
                         .getValues();
    // Recuperation de la liste des statuts d'une demande d'achat
    var state=GetRowParams(COLUMN_STATE);
    // Parcours de l'ensemble des DA
    for( var i=1;i< dataDA.length;i++){
      /*if ((dataDA[i][COLUMN_DA_STATE-1] == state.initialise) || (dataDA[i][COLUMN_DA_STATE-1] == state.priseEnCompteNiv0) || (dataDA[i][COLUMN_DA_STATE-1] == state.valideeNiv0) || 
        (dataDA[i][COLUMN_DA_STATE-1] == state.priseEnCompteNiv1) || (dataDA[i][COLUMN_DA_STATE-1] == state.valideeNiv1) || (dataDA[i][COLUMN_DA_STATE-1] == state.priseEnCompteNiv2))*/
      if ((dataDA[i][COLUMN_DA_STATE-1] != state.invalideeNiv0) && (dataDA[i][COLUMN_DA_STATE-1] != state.invalideeNiv1) && (dataDA[i][COLUMN_DA_STATE-1] != state.invalideeNiv2) && 
          (dataDA[i][COLUMN_DA_STATE-1] != state.invalideeNiv3) && (dataDA[i][COLUMN_DA_STATE-1] != state.bdcTransmis))
      {
        infoDA = dataDA[i][COLUMN_DA_HISTORIQUE-1];
        tblInfoDA = infoDA.split("}");
        if(tblInfoDA) {
            dtDateInit = null;
            dtDatePEC0 = null;
            dtDateVal0 = null;
            dtDatePEC1 = null;
            dtDateVal1 = null;
            dtDatePEC2 = null;
            dtDateVal2 = null;
            for (var j=0; j<tblInfoDA.length-1;j++) {
              tblLigneInfoDA = tblInfoDA[j].split(";");
              if(j == 0) {
                strEtat = tblLigneInfoDA[0].replace("{","");;
                strDateEtat = tblLigneInfoDA[2];
              } else {
                strEtat = tblLigneInfoDA[1].replace("{","");
                strDateEtat = tblLigneInfoDA[3];
              }
              year = strDateEtat.substring(6, 10);
              month = strDateEtat.substring(3, 5);
              day = strDateEtat.substring(0, 2);
              dtDateEtat = new Date(year, month - 1, day);
              switch(strEtat) {
                case state.initialise : dtDateInit = dtDateEtat; break;
                case state.priseEnCompteNiv0 : dtDatePEC0 = dtDateEtat; break;
                case state.valideeNiv0 : dtDateVal0 = dtDateEtat; break;
                case state.priseEnCompteNiv1 : dtDatePEC1 = dtDateEtat; break;
                case state.valideeNiv1 : dtDateVal1 = dtDateEtat; break;
                case state.priseEnCompteNiv2 : dtDatePEC2 = dtDateEtat; break;
                case state.valideeNiv2 : dtDateVal2 = dtDateEtat; break;
              }
            }
            if (dtDateVal2 == null) {
              // La DA n'a pas depassee le statut Validation Niv 2
              // Date de controle = Date de creation + 7 j
              dtControle = new Date(dtDateInit.getTime()+7*3600000*24);
              if (dtControle <= new Date()) {
                // Si la date de controle est < a la date du jour
                // Alors le SLA de la DA sera forcement > 7 j puisque le statut Validee Niv 2 n'est pas encore atteint
                nbOperation = tblInfoDA.length-1;
                strAffichageTraitementNiv0='';
                strAffichageTraitementNiv1='';
                strAffichageTraitementNiv2='';
                blnSuite = false;
                blnAncienneDA = false;
                if (nbOperation > 1) {
                  // CALCUL de traitement du Niv 0
                  if ((dtDatePEC0 == null) && (dtDateVal0 == null)) {
                    // Cas d'une ancienne DA : pas d'existence de l'etape de validation Niv
                    strAffichageTraitementNiv0 = AffichageDureeTraitement(0, "-1", dataDA[i][COLUMN_DA_BU-1],false);
                    blnSuite = true;
                    blnAncienneDA = true;
                  } else {
                    // Cas d'une nouvelle DA : existence de l'etape de validation Niv 0
                    if (dtDateVal0 == null) {
                      // PEC Niv0 : atteint, VAL Niv0 : pas encore atteint
                      nbJourTraitementNiv0 = DateDiffInDays(dtDateInit,new Date()); 
                      strAffichageTraitementNiv0 = AffichageDureeTraitement(0, nbJourTraitementNiv0, dataDA[i][COLUMN_DA_BU-1],true);
                      blnSuite = false;
                    } else {
                      // VAL Niv 0 : atteint
                      nbJourTraitementNiv0 = DateDiffInDays(dtDateInit,dtDateVal0);
                      strAffichageTraitementNiv0 = AffichageDureeTraitement(0, nbJourTraitementNiv0, dataDA[i][COLUMN_DA_BU-1],false);
                      blnSuite = true;
                    }
                  }
                  // CALCUL de traitement du Niv 1
                  if (blnSuite == true) {
                    if ((dtDatePEC1 == null) && (dtDateVal1 == null)) {
                      // VAL Niv 0 atteint mais pas de traitement du Niv 1
                      if (blnAncienneDA == true) {
                        nbJourTraitementNiv1 = DateDiffInDays(dtDateInit,new Date());
                      } else {
                        nbJourTraitementNiv1 = DateDiffInDays(dtDateVal0,new Date());
                      }
                      strAffichageTraitementNiv1 = AffichageDureeTraitement(1, nbJourTraitementNiv1, dataDA[i][COLUMN_DA_BU-1],true);
                      blnSuite = false;
                    } else {
                      if (dtDateVal1 == null) {
                        // PEC Niv 1 : atteint, VAL Niv 1 : pas encore atteint
                        if (blnAncienneDA == true) {
                          nbJourTraitementNiv1 = DateDiffInDays(dtDateInit,new Date());
                        } else {
                          nbJourTraitementNiv1 = DateDiffInDays(dtDateVal0,new Date());
                        }
                        strAffichageTraitementNiv1 = AffichageDureeTraitement(1, nbJourTraitementNiv1, dataDA[i][COLUMN_DA_BU-1],true);
                        blnSuite = false;
                      } else {
                        // VAL Niv 1 : atteint
                        if (blnAncienneDA == true) {
                          nbJourTraitementNiv1 = DateDiffInDays(dtDateInit,dtDateVal1);
                        } else {
                          nbJourTraitementNiv1 = DateDiffInDays(dtDateVal0,dtDateVal1);
                        }
                        strAffichageTraitementNiv1 = AffichageDureeTraitement(1, nbJourTraitementNiv1, dataDA[i][COLUMN_DA_BU-1],false);
                        blnSuite = true;
                      }
                    }
                  } else {
                    strAffichageTraitementNiv1 = AffichageDureeTraitement(1, "-1", dataDA[i][COLUMN_DA_BU-1],false);
                  }
                  // CALCUL de traitement du Niv 2
                  if (blnSuite == true) {
                    if ((dtDatePEC2 == null) && (dtDateVal2 == null)) {
                      // VAL Niv 1 atteint mais pas de traitement du Niv 2
                      nbJourTraitementNiv2 = DateDiffInDays(dtDateVal1,new Date());
                      strAffichageTraitementNiv2 = AffichageDureeTraitement(2, nbJourTraitementNiv2, dataDA[i][COLUMN_DA_BU-1],true);
                    } else {
                      if (dtDateVal2 == null) {
                        // PEC Niv 2 : atteint, VAL Niv 2 : pas encore atteint
                        nbJourTraitementNiv2 = DateDiffInDays(dtDateVal1,new Date());
                        strAffichageTraitementNiv2 = AffichageDureeTraitement(2, nbJourTraitementNiv2, dataDA[i][COLUMN_DA_BU-1],true);
                      } else {
                        // VAL Niv 2 : atteint
                        nbJourTraitementNiv2 = DateDiffInDays(dtDateVal1,dtDateVal2);
                        strAffichageTraitementNiv2 = AffichageDureeTraitement(2, nbJourTraitementNiv2, dataDA[i][COLUMN_DA_BU-1],false);
                      }
                    }
                  } else {
                    strAffichageTraitementNiv2 = AffichageDureeTraitement(2, "-1", dataDA[i][COLUMN_DA_BU-1],false);
                  }
                  // Ajout des donnes Informations DA ainsi que les temps de traitements dans le tableau des data
                  strHtmlDA.push([dataDA[i][COLUMN_DA_ID-1],
                                  dataDA[i][COLUMN_DA_STATE-1],
                                  strAffichageTraitementNiv0,
                                  strAffichageTraitementNiv1,
                                  strAffichageTraitementNiv2]);                    
                } else
                {
                  // DA en etat initialise
                  nbJourTraitementNiv0 = DateDiffInDays(dtDateInit,new Date());
                  nbJourTraitementNiv1 = "-1";
                  nbJourTraitementNiv2 = "-1";
                  // Ajout des donnes Informations DA ainsi que les temps de traitements dans le tableau des data
                  strHtmlDA.push([dataDA[i][COLUMN_DA_ID-1],
                                  dataDA[i][COLUMN_DA_STATE-1],
                                  AffichageDureeTraitement(0, nbJourTraitementNiv0, dataDA[i][COLUMN_DA_BU-1],true),
                                  AffichageDureeTraitement(1, nbJourTraitementNiv1, dataDA[i][COLUMN_DA_BU-1],false),
                                  AffichageDureeTraitement(2, nbJourTraitementNiv2, dataDA[i][COLUMN_DA_BU-1],false)]);                 
                }
              }
            } else
            {
              // La DA a depassee le statut Validation Niv 2
              // Calcul de la duree de traitement : Difference en jours entre la date de l'etat Initialise (Creation de la demande) et l'etat Validee Niv 2
              nbJoursDureeTraitement = DateDiffInDays(dtDateInit,dtDateVal2);
              if (nbJoursDureeTraitement > DELAI_TRAITEMENT_MAX) {
                // Si la duree de traitement est > 7j : SLA KO
                if (dtDatePEC0 == null) {
                  // DA sans validation Niv 0
                  nbJourTraitementNiv1 = DateDiffInDays(dtDateInit,dtDateVal1);
                  nbJourTraitementNiv2 = DateDiffInDays(dtDateVal1,dtDateVal2);
                  // Ajout des donnes Informations DA ainsi que les temps de traitements dans le tableau des data
                  strHtmlDA.push([dataDA[i][COLUMN_DA_ID-1],
                                  dataDA[i][COLUMN_DA_STATE-1],
                                  AffichageDureeTraitement(0, "-1", dataDA[i][COLUMN_DA_BU-1],false),
                                  AffichageDureeTraitement(1, nbJourTraitementNiv1, dataDA[i][COLUMN_DA_BU-1],false),
                                  AffichageDureeTraitement(2, nbJourTraitementNiv2, dataDA[i][COLUMN_DA_BU-1],false)]);
                } else {
                  nbJourTraitementNiv0 = DateDiffInDays(dtDateInit,dtDateVal0);
                  nbJourTraitementNiv1 = DateDiffInDays(dtDateVal0,dtDateVal1);
                  nbJourTraitementNiv2 = DateDiffInDays(dtDateVal1,dtDateVal2);
                  // Ajout des donnes Informations DA ainsi que les temps de traitements dans le tableau des data
                  strHtmlDA.push([dataDA[i][COLUMN_DA_ID-1],
                                  dataDA[i][COLUMN_DA_STATE-1],
                                  AffichageDureeTraitement(0, nbJourTraitementNiv0, dataDA[i][COLUMN_DA_BU-1],false),
                                  AffichageDureeTraitement(1, nbJourTraitementNiv1, dataDA[i][COLUMN_DA_BU-1],false),
                                  AffichageDureeTraitement(2, nbJourTraitementNiv2, dataDA[i][COLUMN_DA_BU-1], false)]);
                }
              }
            }
        }
      }
    }
    html.data=strHtmlDA;
    var mail_to = EMAIL_CC;
    var sqliLogoUrl = "http://www.sqli-enterprise.com/files/2014/05/logo_sqli_entreprise_340x156_bg_transp1.png";
    var sqliLogoBlob = UrlFetchApp
                          .fetch(sqliLogoUrl)
                          .getBlob()
                          .setName("sqliLogoBlob");
    var objet = SUBJECT_REPORT1;
    var advancedArgs = {
                      to: mail_to,
                      subject: objet,
                      htmlBody: html.evaluate().getContent(),
                      inlineImages:{
                                     sqliLogo: sqliLogoBlob
                                   },
                     };
    Log_Info("MailingTo", Utilities.formatString("advancedArgs=%s",Utilities.jsonStringify(advancedArgs)));
    MailApp.sendEmail(advancedArgs);
    
  } catch(e) {
    // Generation de la log lors d'un erreur dans l'execution du batch
    generationLogBatch(BATCH_STAT_DUREE_TRAITEMENT, BATCH_NIVEAU_ERROR, "MSG="+e.message + " - FILENAME="+e.fileName+ " - LINE="+e.lineNumber);
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("btStatistiqueDureeDeTraitement", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
  generationLogBatch(BATCH_STAT_DUREE_TRAITEMENT, BATCH_NIVEAU_INFORMATION, "Declenchement du batch : terminé");
}

