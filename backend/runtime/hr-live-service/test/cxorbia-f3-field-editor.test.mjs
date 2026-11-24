import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const editorSource=fs.readFileSync(new URL('../../../../app/modules/visitas.js',import.meta.url),'utf8');
const start=editorSource.indexOf('    const openHrFieldEditor='),end=editorSource.indexOf("    document.querySelectorAll('[data-edit-hr]')",start);
const capStart=editorSource.indexOf('  const canEditHr='),capEnd=editorSource.indexOf('  /* I3 A09/B11:',capStart);
function fixture(responses,{refreshes=[{ok:true}],pending={}}={}){
 const cap={schemaVersion:'cxorbia.hr-field-editor-capability.v1',enabled:true,tenantId:'t',projectId:'p',periodId:'p-2025-06',countryCode:'GT',fields:[{key:'escenario',label:'Escenario',kind:'text'},{key:'agendada',label:'Fecha',kind:'date'}]};
 const visit={id:'v',tenantId:'t',projectId:'p',periodId:'p-2025-06',country:'GT',pais:'GT',sucursal:'QA',escenario:'A',agendada:null,hrFieldEditing:cap};
 const inputs=[{dataset:{hrField:'escenario'},value:'B',disabled:false},{dataset:{hrField:'agendada'},value:'',disabled:false}],calls=[],toasts=[],nav=[];
 const button={dataset:{},disabled:false,addEventListener:(_event,fn)=>{button.click=fn;}},status={textContent:''};
 let removed=0,html='',refreshCalls=0;
 const ov={querySelectorAll:()=>inputs,querySelector:q=>q.includes('save')?button:status,remove:()=>{removed++;}};
 const data={hrVisitFieldEditContext:()=>({ok:true,expectedVersion:7,baseFieldValues:{escenario:'A',agendada:null},sourceRevision:'a'.repeat(64),pendingFields:pending}),
  updateHrVisitFields:async(...args)=>{calls.push(structuredClone(args));return responses.shift();},shoppers:[]};
 const ui={toast:(...args)=>toasts.push(args),modal:(_title,body,options)=>{html=body;options.onMount(ov);}};
 const CX={BACKEND:{tenantId:'t'},router:{nav:route=>nav.push(route)}};
 const context={data,ui,CX,role:'admin',window:{CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY:async()=>{refreshCalls++;return refreshes.shift();}}};
 vm.createContext(context);vm.runInContext(editorSource.slice(capStart,capEnd)+editorSource.slice(start,end)+'\nglobalThis.open=openHrFieldEditor;globalThis.allow=canEditHr;',context);context.open(visit);
 return {visit,context,inputs,button,status,calls,toasts,nav,removed:()=>removed,refreshCalls:()=>refreshCalls,html:()=>html};
}
const committed={ok:true,status:'committed',providerAck:true,hrProviderAck:true,readbackVerified:true,successUiAllowed:true};
test('F3 editor preserves draft and exact pending intent until a remote ACK and refreshed view',async()=>{
 const h=fixture([{ok:false,status:'pending_hr',localCommitted:true,idempotencyKey:'pending-exact'},committed]);
 await h.button.click();assert.equal(h.removed(),0);assert.equal(h.toasts.length,0);assert.equal(h.refreshCalls(),0);
 assert.match(h.status.textContent,/confirmación.*pendiente/i);assert.ok(h.inputs.every(x=>x.disabled));
 h.inputs[0].value='tampered-after-pending';await h.button.click();
 assert.deepEqual(h.calls.map(x=>x[1]),[{escenario:'B'},{escenario:'B'}]);
 assert.ok(h.calls.every(x=>x[2].expectedVersion===7&&x[2].baseFieldValues.escenario==='A'));
 assert.equal(h.removed(),1);assert.equal(h.toasts.length,1);assert.equal(h.refreshCalls(),1);assert.deepEqual(h.nav,['visitas']);
});
test('F3 editor never treats Firestore-only success as confirmed HR',async()=>{
 const h=fixture([{...committed,hrProviderAck:false}]);await h.button.click();
 assert.equal(h.removed(),0);assert.equal(h.toasts.length,0);assert.equal(h.refreshCalls(),0);assert.equal(h.button.textContent,'Consultar confirmación');
});
test('F3 editor refresh after confirmed ACK cannot cause another write',async()=>{
 const h=fixture([committed],{refreshes:[{ok:false},{ok:true}]});await h.button.click();
 assert.equal(h.removed(),0);assert.equal(h.button.textContent,'Actualizar vista');await h.button.click();
 assert.equal(h.calls.length,1);assert.equal(h.refreshCalls(),2);assert.equal(h.removed(),1);
});
test('F3 editor preserves conflict without blind retry or success',async()=>{
 const h=fixture([{status:'conflict',code:'HR_FIELD_CAUSAL_CONFLICT'}]);await h.button.click();
 assert.equal(h.button.disabled,true);assert.equal(h.removed(),0);assert.equal(h.toasts.length,0);assert.match(h.status.textContent,/conflicto/);
});
test('F3 editor is invisible to disabled, foreign-scope or shopper capabilities',()=>{
 const h=fixture([]);assert.equal(h.context.allow(h.visit),true);
 for(const change of [{enabled:false},{projectId:'other'},{periodId:'p-2026-11'},{countryCode:'HN'}])assert.equal(h.context.allow({...h.visit,hrFieldEditing:{...h.visit.hrFieldEditing,...change}}),false);
 h.context.role='shopper';assert.equal(h.context.allow(h.visit),false);
});
test('F3 boundary freezes raw live values and prior version, excluding display defaults on retry',async()=>{
 const calls=[],row={id:'v',visitId:'v',tenantId:'t',projectId:'p',periodId:'p-2025-06',country:'GT',hrRowId:'QA!2',boleto:0,version:1};
 const CX={BACKEND:{enabled:true,tenantId:'t'},data:{_visitas:[row],__liveHrVisits:[row],__protectedVisits:[{...row,version:7}],previewMeta:{sourceRevision:'a'.repeat(64)},ctx:()=>({projectId:'p',periodId:'p-2026-11'})},
  backendAuth:{context:()=>({authenticated:true,tenantId:'t',role:'admin',projectIds:['p']})},session:{role:'admin'},commandAdapter:{execute:async c=>{calls.push(structuredClone(c));return {status:'pending_hr'};}}};
 const raw={sourceSafe:true,tenantId:'t',projectId:'p',visits:[{...row,boleto:null}]},root={CX,CX_TYA_HR_SOURCE_SAFE:raw,addEventListener(){}};
 const context={CX,window:root,Date,console,document:{readyState:'loading',addEventListener(){}}};vm.createContext(context);
 vm.runInContext(fs.readFileSync(new URL('../../../../app/adapters/cxorbia-cxdata-command-boundary-v1.js',import.meta.url),'utf8'),context);CX.cxDataCommandBoundary.install('test');
 const edit=CX.data.hrVisitFieldEditContext('v');assert.equal(edit.baseFieldValues.boleto,null);assert.equal(edit.expectedVersion,7);
 raw.visits[0].boleto=99;CX.data.__protectedVisits[0].version=8;CX.data.previewMeta.sourceRevision='b'.repeat(64);
 await CX.data.updateHrVisitFields('v',{boleto:12},{...edit,ackAware:true});await CX.data.updateHrVisitFields('v',{boleto:12},{...edit,ackAware:true});
 assert.deepEqual(calls[0],calls[1]);assert.equal(calls[0].expectedVersion,7);assert.equal(calls[0].payload.baseFieldValues.boleto,null);assert.equal(calls[0].payload.sourceRevision,'a'.repeat(64));assert.equal(calls[0].periodId,'p-2025-06');
});
test('F3 protected capability exposes fields and scope only and remains absent for clients',async()=>{
 const source=fs.readFileSync(new URL('../server.mjs',import.meta.url),'utf8'),start=source.indexOf('async function attachHrFieldEditingCapability('),end=source.indexOf('async function protectedPlatformState(',start);
 const snapshot={tenantId:'t',projectId:'p',projectConfig:{operationalSource:{providerType:'excel_online',writePolicy:'bidirectional_gated',countryBindings:[{countryCode:'GT',providerBindingId:'private-setting',mappingRef:'approved-map'}]}},visits:[{country:'GT',periodId:'p-2025-06'}]};
 const setting={tenantId:'t',projectId:'p',countryCode:'GT',enabled:true,hrWritesEnabled:true,writePolicy:'bidirectional_gated',periodSheets:[{periodId:'p-2025-06',worksheetId:'private-sheet'}],fieldWriter:{schemaVersion:'cxorbia.hr-field-writer-binding.v1',enabled:true,protocolVersion:'cxorbia.hr-field-transport.v1',remoteEventReceipt:true,observedBaseGuard:true,allowedFields:['escenario'],fieldMap:{escenario:{columnKey:'tipoCompra',valueKind:'text'}}}};
 let reads=0;const db={doc:()=>({get:async()=>{reads++;return {exists:true,data:()=>setting};}})};
 const context={F3_HR_FIELDS_ENABLED:true,process:{env:{CXORBIA_F3_MAKE_TOOLBOX_URL:'fixture-configured',CXORBIA_F3_MAKE_TOOLBOX_TOKEN:'fixture-configured'}},snapshotScope:s=>({tenantId:s.tenantId,projectId:s.projectId}),HR_WRITABLE_VISIT_FIELDS:['escenario'],loadExcelMappingLibrary:()=>({columnMap:{columns:{tipoCompra:{aliases:['Escenario']}}}})};
 vm.createContext(context);vm.runInContext(source.slice(start,end),context);
 const admin=structuredClone(snapshot);await context.attachHrFieldEditingCapability(admin,{role:'admin',db},'a'.repeat(64));
 assert.equal(admin.visits[0].hrFieldEditing.enabled,true);assert.equal(reads,1);assert.equal(JSON.stringify(admin.visits[0].hrFieldEditing).includes('private-'),false);
 const client=structuredClone(snapshot);await context.attachHrFieldEditingCapability(client,{role:'client',db},'a'.repeat(64));assert.equal(client.visits[0].hrFieldEditing,undefined);assert.equal(reads,1);
 context.F3_HR_FIELDS_ENABLED=false;const disabled=structuredClone(snapshot);await context.attachHrFieldEditingCapability(disabled,{role:'admin',db},'a'.repeat(64));assert.equal(disabled.visits[0].hrFieldEditing,undefined);assert.equal(reads,1);
});
