// ID du Spreadsheet Process'Achat via Script Properties
var CLSID = PropertiesService.getScriptProperties().getProperty('ID_SPREADSHEET_PA');
if (CLSID == null) {
  Log_Severe("Parametres.gs", "Property [CLSID] not defined.");
}

// ID du Google Doc Template BDC via Script Properties
var TEMPLATE_ID = PropertiesService.getScriptProperties().getProperty('ID_TEMPLATE_BDC_PA');
if (TEMPLATE_ID == null) {
  Log_Severe("Parametres.gs", "Property [ID_TEMPLATE_BDC_PA] not defined.");
}

// ID du Google Doc Template DA via Script Properties
var TEMPLATE_DA_ID = PropertiesService.getScriptProperties().getProperty('ID_TEMPLATE_DA_PA');
if (TEMPLATE_DA_ID == null) {
  Log_Severe("Parametres.gs", "Property [ID_TEMPLATE_DA_PA] not defined.");
}

// ID du Google Drive Process Achat via Script Properties
var GOOGLEDRIVE_PROCACHAT_ID = PropertiesService.getScriptProperties().getProperty('ID_GOOGLEDRIVE_PA');
if (GOOGLEDRIVE_PROCACHAT_ID == null) {
  Log_Severe("Parametres.gs", "Property [ID_GOOGLEDRIVE_PA] not defined.");
}

// ID du PDF Fiche (de creation) d'un fournisseur
var FICHE_FOURNISSEUR_ID = PropertiesService.getScriptProperties().getProperty('ID_FICHE_FOURNISSEUR_PA');
if (GOOGLEDRIVE_PROCACHAT_ID == null) {
  Log_Severe("Parametres.gs", "Property [ID_FICHE_FOURNISSEUR_PA] not defined.");
}

// ID du PDF Documentation de l'outil
var DOCUMENTATION_OUTIL = PropertiesService.getScriptProperties().getProperty('ID_DOCUMENTATION');
if (DOCUMENTATION_OUTIL == null) {
  Log_Severe("Parametres.gs", "Property [ID_DOCUMENTATION] not defined.");
}


// Niveau de log BETTERLOG & Activation du logger
var __DEBUGLEVEL__ = PropertiesService.getScriptProperties().getProperty('BETTERLOG_LEVEL');
// Activation du logger BETTERLOG et parametrage
var LoggerPA = BetterLog.useSpreadsheet(CLSID);
LoggerPA.setLevel(__DEBUGLEVEL__);


// Stockage des donnees du DA
// avec informations suivantes :
// id, idrow, bdc, emetteur
//  statut, typedemande, codetypedemande, nature
//  fournisseur, contactfournisseur, emailcontactfournisseur, telcontactfournisseur
//  buimputation, codeprojet, nomprojet
//  quantite, prixtjmachat, prixtjmvendu, marge
//  collaborateur
//  datedebutlivraison, datefinlivraison, adresselivraison
//  conditionreglement
//  urlDevis, urlBDCpdf, urlBDCpdfsigne, urlFacture, urlBPF
//  managerBU, managerEntrepriseParis, acteurComptaFournisseur, managerDirectionFinanciere, assistantes
var globalDAData=null;

// Nb max de ligne de recherche
var MAX_ROW = 50;
// Nb max de ligne de recherche Fournisseur
var MAX_ROW_FOURN = 750;
// Nb max de colonne
var MAX_COL = 26;

// Nom de la pseudo BU Direction SQLi Enterprise Paris
var BU_ENTREPRISE_PARIS = "ENTREPRISE_PARIS";
// Nom de la pseudo BU Comptabilite Fournisseur
var BU_COMPTA_FOURNISSEUR = "COMPTA_FOURNISSEUR";
// Nom de la pseudo BU Comptabilite Fournisseur
var BU_DIRECTION_FINANCIERE = "DIRECTION_FINANCIERE";
// Nom de la pseudo BU Assistante
var BU_ASSISTANTE_ENTREPRISE_PARIS = "ASSISTANTE_ENTREPRISE";

//*********************************************************************************************
// Nom des onglets du Google Sheet
//*********************************************************************************************
// Nom de l'onglet Params
var SHEET_PARAMS = 'Params';
// Nom de l'onglet Suivi DA
var SHEET_SUIVIDA = 'Suivi DA';
// Nom de l'onglet Historique DA
var SHEET_HISTODA = 'Historique DA';
// Nom de l'onglet Historique DA
var SHEET_PARAM_FOURNISSEUR = 'Fournisseurs';
// Nom de l'onglet log Batch
var SHEET_PARAM_LOG_BATCH = 'Log Batch';

//*********************************************************************************************
// Nom des colonnes de l'onglet Params
//*********************************************************************************************
// Nom de la colonne contenant la liste des emails prevue pour la diffusion des emails envoyes
var COLUMN_CC = 'Diffusion';
// Nom de la colonne contenant la liste des emails qui recevoivent les demande de contact
var COLUMN_CONTACT = 'Contact';
// Nom de la colonne contenant la liste des emails qui recevoivent les demande de contact dans le cas d'une DA de sous-traitance
var COLUMN_CONTACT_SOUSTRAITANCE = 'Diffusion Sous-Traitance';
// Nom de la colonne contenant la liste des types de demande
var COLUMN_TYPE2DEMANDE = 'TypeDeDemande';
// Nom de la colonne contenant la liste des BU
var COLUMN_BU = 'BU';
// Nom de la colonne contenant la liste des Fournisseurs
var COLUMN_FOURNISSEUR = 'Fournisseur'
// Nom de la colonne contenant la liste des Interlocuteurs des Fournisseurs
var COLUMN_INTERLOCUTEUR = 'ContactFournisseur'
// Nom de la colonne contenant la liste des etats d'une demande d'achat
var COLUMN_STATE = 'Statut'
// Nom de la colonne contenant la valeur de la marge seuil
var COLUMN_MARGE_SEUIL = 'MargeSeuil';
// Nom de la colonne contenant la valeur du montant d'achat seuil
var COLUMN_MONTANT_ACHAT_SEUIL = 'MontantAchatSeuil';
// Nom de la colonne contenant la liste des admins pour la fonction de suivi DA
var COLUMN_ADMIN_SUIVI = 'Admins Suivi';
// Nom de la colonne contenant la liste des admins
var COLUMN_ADMIN = 'Admins';
// Nom de la colonne contenant la liste des conditions de reglements
var COLUMN_CONDITION_REGL = 'ConditionDeReglement';
// Nom de la colonne contenant la valeur du montant d'achat seuil
var COLUMN_INFORMATION_CREATION_FOURNISSEUR = 'Email Creation Fournisseur';
// Nom de la colonne contenant les informations de parametrage necessaire a la generation du BDC
var COLUMN_INFORMATION_GENERATION_BDC = 'Informations BDC';

//*********************************************************************************************
// Nom des colonnes de l'onglet Suivi DA
//*********************************************************************************************
// Nom de la colonne id d'une demande d'achat
var COLUMN_DA_ID_NAME = "N° DA";
// Nom de la colonne Etat d'une demande d'achat
var COLUMN_DA_STATE_NAME = "Etat";
// Nom de la colonne Updated d'une demande d'achat (DA mis a jour pour traitement batch)
var COLUMN_DA_UPDATED = "Updated";


//*********************************************************************************************
// Numero des colonnes de la DA dans l'onglet Suivi DA
//*********************************************************************************************
// Index de la colonne id d'une demande d'achat
var COLUMN_DA_ID = 1;
// Index de la colonne Numero du BDC d'une demande d'achat
var COLUMN_DA_NUMBDC = 2;
// Index de la colonne Emetteur d'une demande d'achat
var COLUMN_DA_EMETTEUR = 3;
// Index de la colonne Type de demande d'une demande d'achat
var COLUMN_DA_TYPE = 4;
// Index de la colonne Etat d'une demande d'achat
var COLUMN_DA_STATE = 5;
// Index de la colonne Nature d'une demande d'achat
var COLUMN_DA_NATURE = 6;
// Index de la colonne Fournisseur d'une demande d'achat
var COLUMN_DA_FOURNISSEUR = 7;
// Index de la colonne Contact Fournisseur d'une demande d'achat
var COLUMN_DA_CONTACTFOURNISSEUR = 8;
// Index de la colonne Email Contact Fournisseur d'une demande d'achat
var COLUMN_DA_EMAILCONTACTFOURNISSEUR = 9;
// Index de la colonne Tel Contact Fournisseur d'une demande d'achat
var COLUMN_DA_TELCONTACTFOURNISSEUR = 10;
// Index de la colonne BU Imputation d'une demande d'achat
var COLUMN_DA_BU = 11;
// Index de la colonne Code Projet d'une demande d'achat
var COLUMN_DA_CDPROJET = 12;
// Index de la colonne Nom Projet d'une demande d'achat
var COLUMN_DA_NOMPROJET = 13;
// Index de la colonne Quantite d'une demande d'achat
var COLUMN_DA_QTE = 14;
// Index de la colonne Prix unitaire/TJM Achat d'une demande d'achat
var COLUMN_DA_PRXACHAT = 15;
// Index de la colonne Prix unitaire/TJM Vendu d'une demande d'achat
var COLUMN_DA_PRXVENDU = 16;
// Index de la colonne Marge d'une demande d'achat
var COLUMN_DA_MARGE = 17;
// Index de la colonne Identite d'un collaborateur d'une demande d'achat
var COLUMN_DA_COLLABORATEUR = 18;
// Index de la colonne Date de debut de livraison d'une demande d'achat
var COLUMN_DA_DTDEBLIV = 19;
// Index de la colonne Date de fin de livraison d'une demande d'achat
var COLUMN_DA_DTFINLIV = 20;
// Index de la colonne Adresse de livraison d'une demande d'achat
var COLUMN_DA_ADRLIV = 21;
// Index de la colonne Condition de reglement d'une demande d'achat
var COLUMN_DA_CONDREGL = 22;
// Index de la colonne URL Drive Google d'une demande d'achat
var COLUMN_DA_URLDA = 23;
// Index de la colonne URL DEVIS d'une demande d'achat
var COLUMN_DA_DEVIS = 24;
// Index de la colonne URL BDC au format PDF d'une demande d'achat
var COLUMN_DA_BDCPDF = 25;
// Index de la colonne URL BDC signe d'une demande d'achat
var COLUMN_DA_BDCPDFSIGNE = 26;
// Index de la colonne URL Facture
var COLUMN_DA_FACTURE = 27;
// Index de la colonne URL BPF
var COLUMN_DA_BPF = 28;
// Index de la colonne URL Fiche DA
var COLUMN_DA_FICHE = 29;
// Index de la colonne Historique (Fonctionnalite Historique des operations)
var COLUMN_DA_HISTORIQUE = 30;
// Index de la colonne IsValidationNvi2
var COLUMN_DA_ISVALIDENIV2 = 31;
// Index de la colonne Acces Unit (Fonctionnalite Dashboard)
var COLUMN_DA_ACCES_UNIT = 32;
// Index de la colonne Acces Entreprise (Fonctionnalite Dashboard)
var COLUMN_DA_ACCES_ENTREPRISE = 33;
// Index de la colonne Acces Compta Fournisseur (Fonctionnalite Dashboard)
var COLUMN_DA_ACCES_COMPTAFOUR = 34;
// Index de la colonne Acces Assistante (Fonctionnalite Dashboard)
var COLUMN_DA_ACCES_ASSISTANTE = 35;
// Index de la colonne Qtite x Prix achat(Fonctionnalite Dashboard)
var COLUMN_DA_MONTANT_ACHAT = 36;
// Index de la colonne Resume DA (Fonctionnalite Dashboard)
var COLUMN_DA_RESUME = 37;
// Index de la colonne Updated (Fonction de batch)
var COLUMN_DA_UPADTED = 38;

//*********************************************************************************************
// Numero des colonnes Fournisseur dans l'onglet Fournisseurs
//*********************************************************************************************
var COLUMN_FOUR_ID = 0;
// Index de la colonne Nom/RaisonSociale d'un Fournisseur
var COLUMN_FOUR_NOM = 1;
// Index de la colonne Sigle d'un Fournisseur
var COLUMN_FOUR_SIGLE = 2;
// Index de la colonne Adresse d'un Fournisseur
var COLUMN_FOUR_ADRESSE = 3;
// Index de la colonne Tel d'un Fournisseur
var COLUMN_FOUR_TEL = 4;
// Index de la colonne Fax d'un Fournisseur
var COLUMN_FOUR_FAX = 5;
// Index de la colonne SIRET d'un Fournisseur
var COLUMN_FOUR_SIRET = 6;
// Index de la colonne APE d'un Fournisseur
var COLUMN_FOUR_APE = 7;
// Index de la colonne Contact 1 d'un Fournisseur
var COLUMN_FOUR_CONTACT1_NOM = 8;
var COLUMN_FOUR_CONTACT1_TEL = 9;
var COLUMN_FOUR_CONTACT1_EMAIL = 10;
// Index de la colonne Contact 2 d'un Fournisseur
var COLUMN_FOUR_CONTACT2_NOM = 11;
var COLUMN_FOUR_CONTACT2_TEL = 12;
var COLUMN_FOUR_CONTACT2_EMAIL = 13;

// Liste des emails en CC des mails envoyes
var EMAIL_CC=(function () {var params = SpreadsheetApp.openById(CLSID).getSheetByName(SHEET_PARAMS).getDataRange().getValues();
                           for( var i=0;i< params[0].length;i++){if(params[0][i]==COLUMN_CC ) return params[1][i];}
                           return null;})();

// Sujet des emails envoys
var SUBJECT ='[ACHAT] : %%id%% - %%fournisseur%% - %%buimputation%% - %%statut%%';

//*********************************************************************************************
// Regroupement Avancement
//*********************************************************************************************
var REGROUPEMENT_UNIT = "Validation Manager Unit";
var REGROUPEMENT_DIRECTION = "Validation Direction Entreprise";
var REGROUPEMENT_COMPTA = "Génération Comptabilité Fournisseur";
var REGROUPEMENT_ASSISTANTE = "Gestion Assistante";
var REGROUPEMENT_CLOS = "Clos";

//*********************************************************************************************
// Formule de concatenation de l'historique d'une DA (pour la fonctionnalite Historique des operations)
//*********************************************************************************************
var FORMULE_HISTORIQUE = '=JOIN(";";QUERY(\'Historique DA\'!A:F;"select F where A contains \'"&A%%idrow%%&"\' label F \'\'"))';
// Formule remontant les users de la BU d'imputation d'une DA (pour la gestion de visibilite du dashboard)
var FORMULE_ACCES_UNIT = '=IF(ISNA(QUERY(Params!H:I; "select I where H = \'"&K%%idrow%%&"\'"));"";QUERY(Params!H:I; "select I where H = \'"&K%%idrow%%&"\'"))';
// Formule remontant les users de la BU Direction Entreprise (pour la gestion de visibilite du dashboard)
var FORMULE_ACCES_ENTREPRISE = '=IF(ISNA(QUERY(Params!H:I; "select I where H = \''+BU_ENTREPRISE_PARIS+'\'"));"";QUERY(Params!H:I; "select I where H = \''+BU_ENTREPRISE_PARIS+'\'"))';
// Formule remontant les users de la BU Compta Fournisseur (pour la gestion de visibilite du dashboard)
var FORMULE_ACCES_COMPTAFOURN = '=IF(ISNA(QUERY(Params!H:I; "select I where H = \''+BU_COMPTA_FOURNISSEUR+'\'"));"";QUERY(Params!H:I; "select I where H = \''+BU_COMPTA_FOURNISSEUR+'\'"))';
// Formule remontant les users de la BU Assistante (pour la gestion de visibilite du dashboard)
var FORMULE_ACCES_ASSISTANTE = '=IF(ISNA(QUERY(Params!H:I; "select I where H = \''+BU_ASSISTANTE_ENTREPRISE_PARIS+'\'"));"";QUERY(Params!H:I; "select I where H = \''+BU_ASSISTANTE_ENTREPRISE_PARIS+'\'"))';
// Formule du calcul du montant d'achat (pour la gestion de visibilite du dashboard)
var FORMULE_MONTANT_ACHAT = '=N%%idrow%%*O%%idrow%%';
// Formule de generation des informations remontees dans la timeline
var FORMULE_INFO_TIMELINE = '="{"&A%%idrow%%&";"&B%%idrow%%&";"&C%%idrow%%&";"&SUBSTITUTE(D%%idrow%%;"\'";" ")&";"&SUBSTITUTE(F%%idrow%%;"\'";" ")&";"&G%%idrow%%&";"&K%%idrow%%&";"&L%%idrow%%&";"&N%%idrow%%&";"&DOLLAR(O%%idrow%%;2)&";"&IF(P%%idrow%%<>"";DOLLAR(P%%idrow%%;2);"")&";"&IF(Q%%idrow%%<>"";FIXED(Q%%idrow%%;2);"")&";"&R%%idrow%%&";"&TO_TEXT(S%%idrow%%)&";"&TO_TEXT(T%%idrow%%)&";"&V%%idrow%%&"}"';


//*********************************************************************************************
// Batch
//*********************************************************************************************
var BATCH_GENERATION_FICHE_DA = "GENERATION FICHE DA";
var BATCH_GENERATION_AUTORISATION_REP_PRINCIPAL = "AFFECTATION DROIT SUR LE REPERTOIRE GOOGLE DRIVE DA";
var BATCH_NIVEAU_INFORMATION = "INFO";
var BATCH_NIVEAU_ERROR = "ERROR";