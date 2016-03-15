//******************************************************************************************************
// Fonction qui genere une information de log dans l'onglet Log Batch
//
// [E] idbatch : identifiant du batch
// [E] niveauLog : niveau de log
// [E] msgLog : message de log
// [S] /
//******************************************************************************************************
function generationLogBatch(idbatch, niveauLog, msgLog) {
  var out = [];
  var date = new Date();
  var dtLog='';

  // Format de la date de log YYMMDD-HHMMSS
  dtLog+=(String(date.getFullYear())).slice(-2)+("0"+ String(date.getMonth()+1)).slice(-2)+("0" + String(date.getDate())).slice(-2);
  dtLog+="-"
  dtLog+=("0"+String(date.getHours())).slice(-2)+("0"+ String(date.getMinutes()+1)).slice(-2)+("0" + String(date.getSeconds())).slice(-2);

  out.push(dtLog);
  out.push(idbatch);
  out.push(niveauLog);
  out.push(msgLog);
  SpreadsheetApp.openById(CLSID)
                         .getSheetByName(SHEET_PARAM_LOG_BATCH)
                         .appendRow(out);
  
}

//******************************************************************************************************
// Fonction qui genere une log de type INFO dans l'onglet Log en y incluant le user connecte, le nom de 
// la fonction et le message d'information
//
// [E] functionname : nom de la fonction
// [E] message : message a integrer dans la log
// [S] /
//******************************************************************************************************
function Log_Info(functionname, message) {
  LoggerPA.info("[%s] / %s : %s",Session.getActiveUser().getEmail(),functionname,message);
}

//******************************************************************************************************
// Fonction qui genere une log de type SEVERE dans l'onglet Log en y incluant le user connecte, le nom de 
// la fonction et le message d'information
//
// [E] functionname : nom de la fonction
// [E] message : message a integrer dans la log
// [S] /
//******************************************************************************************************
function Log_Severe(functionname, message) {
  LoggerPA.severe("[%s] / %s : %s",Session.getActiveUser().getEmail(),functionname,message);
}