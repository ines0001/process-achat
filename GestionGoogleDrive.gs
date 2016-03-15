// BEGIN DRIVE INTERFACE
/* fonction permettant de déplacer les fichiers(files) vers
   le dossier drive (destination). La fonction permet de créer
   le folder destination si celui-ci n'existe pas. Tous les fichiers
   sources (IDs) seront ensuite effacés de la source DRIVE du user
   files : Array ID drive file
   destination: string define the name folder destination
*/
function saveFiles(files,destination){
    var file;
    var idfile;
    var newfile;

  try {
    var folder = DriveApp.getFolderById(GOOGLEDRIVE_PROCACHAT_ID);
    var folder_dest = folder.getFoldersByName(destination);
    /* verification de l'existence du dossier destination */
    if(!folder_dest.hasNext()){
        folder_dest = folder.createFolder(destination);
    } else folder_dest = folder_dest.next();
    /* recopie de l'ensemble des fichiers dans le folder destination*/
    for(var index=0; index< files.length;index++){
      if(files[index]===undefined || typeof files[index]!='string' || files[index]=='' ) continue;
      file = DriveApp.getFileById(files[index]);
      newfile = file.makeCopy(folder_dest);
      DriveApp.removeFile(file);
    }
    idfile = getIdFromUrl(newfile.getUrl());
    return getDownloadLink(idfile);
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("saveFiles", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

//******************************************************************************************************
// Fonction qui realise la creation d'un folder associe a une DA dans le Google Drive Process'Achat
//
// [E] id : identifiant de la demande d'achat
// [S] url du repertoire de la DA dans Google Drive
//******************************************************************************************************
function createGoogleDriveFolderDA(id) {
  try {
    var folderProcessAchat = DriveApp.getFolderById(GOOGLEDRIVE_PROCACHAT_ID);
    var folder_dest = folderProcessAchat.getFoldersByName(id);

    /* Verification de l'existence du dossier destination */
    if(!folder_dest.hasNext()){
        folder_dest = folderProcessAchat.createFolder(id);
    } else folder_dest = folder_dest.next();
    // Ajout des droits d'ecriture de l'ensemble des acteurs sur le Google Drive de la DA
    folder_dest.addEditors(getListUserAuthorized());
    return folder_dest.getUrl();
  } catch(e){
    e = (typeof e === 'string') ? new Error(e) : e;
    Log_Severe("createGoogleDriveFolderDA", Utilities.formatString("%s %s (line %s, file '%s'). Stack: '%s' . While processing %s.",e.name||'',e.message||'',e.lineNumber||'',e.fileName||'', e.stack||'', e.processMessage||''));
    throw e;
  }
}

function getOAuthToken() {
  DriveApp.getRootFolder();
  return ScriptApp.getOAuthToken();
}