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

