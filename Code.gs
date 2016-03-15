function doGet(request) {
  
  
  var html=null;
  var blnAuthorizedAction = false;
  // S.VIOT Google Analytics
  strActionName = request.parameter.page;
  // S.VIOT Google Analytics
  
  switch(request.parameter.page){
  
    case 'new'     : html = HtmlService.createTemplateFromFile('forms')
                        .evaluate()
                        .setTitle('Saisie Formulaire Demande d Achat')
                        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
                     break;
    case 'ReleaseNote' : html = HtmlService.createTemplateFromFile('form_ReleaseNote')
                            .evaluate()
                            .setTitle('Release Note')
                            .setSandboxMode(HtmlService.SandboxMode.IFRAME);
                     break;
    // Evolution #2  
    case 'PECNiv0' : blnAuthorizedAction=isAuthorizedAction(request.parameter.ref, request.parameter.page, Session.getActiveUser().getEmail());
                     if (blnAuthorizedAction) {
                       html = HtmlService.createTemplateFromFile('form_PEC0');
                       onPECNiv0(request.parameter.ref);
                     } else {
                       html = HtmlService.createTemplateFromFile('form_NotAuthorized');
                     }
                     html.reference = request.parameter.ref;
                     html.type= (request.parameter.type=='expanded')?request.parameter.type:'small';
                     html = html.evaluate()
                        .setTitle("Réponse à la demande d'achat")
                        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
                     break;
    // Evolution #2  
    case 'PECNiv1' : blnAuthorizedAction=isAuthorizedAction(request.parameter.ref, request.parameter.page, Session.getActiveUser().getEmail());
                     if (blnAuthorizedAction) {
                       html = HtmlService.createTemplateFromFile('form_PEC1');
                       onPECNiv1(request.parameter.ref);
                     } else {
                       html = HtmlService.createTemplateFromFile('form_NotAuthorized');
                     }
                     html.reference = request.parameter.ref;
                     html.type= (request.parameter.type=='expanded')?request.parameter.type:'small';
                     html = html.evaluate()
                        .setTitle("Réponse à la demande d'achat")
                        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
                     break;
    case 'PECNiv2' : blnAuthorizedAction=isAuthorizedAction(request.parameter.ref, request.parameter.page, Session.getActiveUser().getEmail());
                     if (blnAuthorizedAction) {
                       html = HtmlService.createTemplateFromFile('form_PEC2');
                       onPECNiv2(request.parameter.ref);
                     } else {
                       html = HtmlService.createTemplateFromFile('form_NotAuthorized');
                     }
                     html.reference = request.parameter.ref;
                     html.type= (request.parameter.type=='expanded')?request.parameter.type:'small';
                     html = html.evaluate()
                        .setTitle("Réponse à la demande d'achat")
                        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
                     break;
    case 'PECNiv3a' : blnAuthorizedAction=isAuthorizedAction(request.parameter.ref, request.parameter.page, Session.getActiveUser().getEmail());
                      if (blnAuthorizedAction) {
                        html = HtmlService.createTemplateFromFile('form_PEC3a');
                        onPECNiv3a(request.parameter.ref);
                      } else {
                        html = HtmlService.createTemplateFromFile('form_NotAuthorized');
                      }
                      html.reference = request.parameter.ref;
                      html.type= (request.parameter.type=='expanded')?request.parameter.type:'small';
                      html = html.evaluate()
                        .setTitle("Réponse à la demande d'achat")
                        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
                      break;
    case 'DECNiv3b' : blnAuthorizedAction=isAuthorizedAction(request.parameter.ref, request.parameter.page, Session.getActiveUser().getEmail());
                      if (blnAuthorizedAction) {
                        html = HtmlService.createTemplateFromFile('form_DEC3b');
                      } else {
                        html = HtmlService.createTemplateFromFile('form_NotAuthorized');
                      }
                      html.reference = request.parameter.ref;
                      html.type= (request.parameter.type=='expanded')?request.parameter.type:'small';
                      html = html.evaluate()
                        .setTitle("Réponse à la demande d'achat")
                        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
                      break;         
    // Evolution #2
    case 'PECNivDiff' : blnAuthorizedAction=isAuthorizedAction(request.parameter.ref, request.parameter.page, Session.getActiveUser().getEmail());
                      if (blnAuthorizedAction) {
                        html = HtmlService.createTemplateFromFile('form_PECDiff');
                        onPECNivDiff(request.parameter.ref);
                      } else {
                        html = HtmlService.createTemplateFromFile('form_NotAuthorized');
                      }
                      html.reference = request.parameter.ref;
                      html.type= (request.parameter.type=='expanded')?request.parameter.type:'small';
                      html = html.evaluate()
                        .setTitle("Réponse à la demande d'achat")
                        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
                      break;
    // Evolution #2
    case 'EditAPP' : blnAuthorizedAction=isAuthorizedAction(request.parameter.ref, request.parameter.page, Session.getActiveUser().getEmail());
                     if (blnAuthorizedAction) {
                       html = HtmlService.createTemplateFromFile('form_EditAPP');
                     } else {
                       html = HtmlService.createTemplateFromFile('form_NotAuthorized');
                     }
                     html.reference = request.parameter.ref;
                     html.type= (request.parameter.type=='expanded')?request.parameter.type:'small';
                     html = html.evaluate()
                        .setTitle("Réponse à la demande d'achat")
                        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
                     break;         
    case 'SendBDC' : blnAuthorizedAction=isAuthorizedAction(request.parameter.ref, request.parameter.page, Session.getActiveUser().getEmail());
                     if (blnAuthorizedAction) {
                      html = HtmlService.createTemplateFromFile('form_SendBDC');
                     } else {
                       html = HtmlService.createTemplateFromFile('form_NotAuthorized');
                     }
                     html.reference = request.parameter.ref;
                     html.type= (request.parameter.type=='expanded')?request.parameter.type:'small';
                     html = html.evaluate()
                        .setTitle("Réponse à la demande d'achat")
                        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
                     break;
    /*case 'RecepFact' : blnAuthorizedAction=isAuthorizedAction(request.parameter.ref, request.parameter.page, Session.getActiveUser().getEmail());
                       if (blnAuthorizedAction) {
                         html = HtmlService.createTemplateFromFile('form_RecepFact');
                       } else {
                         html = HtmlService.createTemplateFromFile('form_NotAuthorized');
                       }
                       html.reference = request.parameter.ref;
                       html.type= (request.parameter.type=='expanded')?request.parameter.type:'small';
                       html = html.evaluate()
                        .setTitle("Réponse au bon de commande")
                        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
                       break;*/
    /*case 'ValBPF' : blnAuthorizedAction=isAuthorizedAction(request.parameter.ref, request.parameter.page, Session.getActiveUser().getEmail());
                    if (blnAuthorizedAction) {
                      html = HtmlService.createTemplateFromFile('form_ValBPF');
                    } else {
                      html = HtmlService.createTemplateFromFile('form_NotAuthorized');
                    }
                    html.reference = request.parameter.ref;
                    html.type= (request.parameter.type=='expanded')?request.parameter.type:'small';
                    html = html.evaluate()
                        .setTitle("Réponse au bon de commande")
                        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
                    break;*/
     case 'dashboard':html = HtmlService.createTemplateFromFile('form_Reporting');
                      html.clsid = CLSID;  
                      html=html.evaluate()
                                .setTitle('Process Achat Reporting')
                                .setSandboxMode(HtmlService.SandboxMode.IFRAME);
                      break;      
    case 'fournisseur' : html = HtmlService.createTemplateFromFile('form_Fournisseur')
                         .evaluate()
                         .setTitle('Gestion Fournisseur')
                         .setSandboxMode(HtmlService.SandboxMode.IFRAME);
                         break;
    default:html = HtmlService.createTemplateFromFile('accueil')
                          .evaluate()
                          .setTitle('Accueil Process Achat')
                          .setSandboxMode(HtmlService.SandboxMode.IFRAME);
                   break;
 }
 return html;
}
