import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../../app/modules/postulaciones.js',import.meta.url),'utf8');
const begin=source.indexOf('CX.adminPostulacionesActions.cancelProviderFailure=');
const end=source.indexOf('CX.adminPostulacionesActions.openCancellation=',begin);
assert.ok(begin>=0&&end>begin);
const CX={adminPostulacionesActions:{}};
new Function('CX',source.slice(begin,end))(CX);
const a=CX.adminPostulacionesActions,o={id:'visit-A',hrRowId:'row-A',shopperId:'shopper-A'};
test('R07 safe provider failure code and human wording',()=>{
  assert.equal(a.cancelProviderFailure({code:'OPS_CANCEL_REQUEST_NOT_PENDING'}).code,'OPS_CANCEL_REQUEST_NOT_PENDING');
  assert.match(a.cancelProviderFailure({code:'OPS_CANCEL_EXTERNAL_HR_ACK_REQUIRED'}).message,/Hoja de Ruta/);
  assert.equal(a.cancelProviderFailure({code:'TOKEN secret'}).code,'CANCEL_PROVIDER_UNCONFIRMED');
  assert.doesNotMatch(a.cancelProviderFailure({code:'TOKEN secret'}).message,/secret/);
});
test('R07 exact independent identity, HR row and status checks',()=>{
 const v=(status,id='visit-A',row='row-A',sid='shopper-A')=>({id,hrRowId:row,shopperId:sid,cancelRequest:{status}});
 assert.equal(a.cancelDecisionReadback(v('rejected'),o,'rejected'),true);
 assert.equal(a.cancelDecisionReadback(v('approved_pending_hr'),o,'approved'),true);
 assert.equal(a.cancelDecisionReadback(v('pending_review'),o,'approved'),false);
 assert.equal(a.cancelDecisionReadback(v('rejected','visit-B'),o,'rejected'),false);
 assert.equal(a.cancelDecisionReadback(v('rejected','visit-A','wrong'),o,'rejected'),false);
 assert.equal(a.cancelDecisionReadback(v('rejected','visit-A','row-A','wrong'),o,'rejected'),false);
});
test('R07 no optimistic success before remote refresh and readback',()=>{
 const body=source.slice(source.indexOf('CX.adminPostulacionesActions.openCancellation='),source.indexOf("CX.module('postulaciones'"));
 const refresh=body.indexOf('await CX.backend.refresh();'),readback=body.indexOf('cancelDecisionReadback(observed,v,decision)'),success=body.indexOf('close();ui.toast');
 assert.ok(refresh>=0&&readback>refresh&&success>readback);
 assert.match(body,/btn\.dataset\.providerResultCode=diag\.code/);
});
