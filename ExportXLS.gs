//******************************************************************************************************
// Fonction qui exporte les donnees et les transmets par email à la liste de diffusion (EVO-13)
//
// [E] /
// [S] /
//******************************************************************************************************
function getGoogleSpreadsheetAsExcel(){
  try {
    var ss = SpreadsheetApp.openById(CLSID);
    var url = "https://docs.google.com/feeds/download/spreadsheets/Export?key=" + ss.getId() + "&exportFormat=xlsx";
    var params = {
      method      : "get",
      headers     : {"Authorization": "Bearer " + ScriptApp.getOAuthToken()},
      muteHttpExceptions: true
    };
    var blob = UrlFetchApp.fetch(url, params).getBlob();
    blob.setName(ss.getName() + ".xlsx");
    MailApp.sendEmail(EMAIL_CC, 
                     "Export des données Process'Achat en date du "+Utilities.formatDate(new Date(), "GMT+1", "dd/MM/yyyy HH:mm:ss"), 
                     "Fichier joint", {attachments: [blob]});
    return true;
    
  } catch (e) {
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("getGoogleSpreadsheetAsExcel", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;    
  }
}