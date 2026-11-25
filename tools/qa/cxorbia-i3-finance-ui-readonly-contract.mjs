// Pure contract for the focal UI readback. Never dispatch the prepared command.
import crypto from 'node:crypto';
import {digest,prepareMetadataCommand} from './cxorbia-i3-finance-advance-metadata.mjs';
export {digest,prepareMetadataCommand};
export const UI_MODE='READONLY_C09_C10_CURRENT_UI';
export const UI_SCHEMA='cxorbia.i3.finance-core-ui-readonly.v1';
export const UI_SCOPE_PATH='docs/checkpoints/CXORBIA_I3_C09_C10_ADVANCE_UI_READONLY_SCOPE_20261125.json';
const BRANCH='recovery/cxorbia-phase-a-20260831';
const METADATA_PATH='docs/checkpoints/CXORBIA_I3_NOVEMBER_ADVANCE_METADATA_SCOPE_20261124.json';
export const str=v=>String(v??'').trim();
export const norm=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').toLowerCase();
export const need=(ok,code)=>{if(!ok)throw Error(code);};
export const hashBytes=v=>crypto.createHash('sha256').update(v).digest('hex');
export const stripDocumentId=row=>Object.fromEntries(Object.entries(row).filter(([key])=>key!=='docId'));
export const ordered=rows=>[...rows].sort((a,b)=>str(a.docId||a.id).localeCompare(str(b.docId||b.id)));
export const publicError=e=>str(e?.message).match(/^(?:SOURCE_FAILURE|MAPPING_FAILURE|PROVIDER_FAILURE|PERSISTENCE_FAILURE|AUTH_FAILURE|FUNCTIONAL_DEFECT|VISUAL_DEFECT|RELEASE_COMPOSITION_FAILURE|ENVIRONMENT_FAILURE):[A-Z0-9_]+/)?.[0]||'ENVIRONMENT_FAILURE:C09_C10_UI_UNCONFIRMED';

export function validateUiEnvironment({scope,plan,descriptor,current,project,host,source,tree,branch,mode,period,emulator}){
  need(scope?.schemaVersion==='cxorbia.i3.c09-c10-advance-ui-readonly-scope.v1'&&scope.mode===UI_MODE&&scope.requestId==='CXORBIA-I3-C09-C10-ADVANCE-UI-READONLY-20261125','SOURCE_FAILURE:C09_C10_SCOPE_SCHEMA');
  need(scope.metadataScopePath===METADATA_PATH&&scope.tenantId===plan.tenantId&&scope.projectId===plan.projectId&&scope.cashPeriodId===plan.cashPeriodId&&period===scope.cashPeriodId,'SOURCE_FAILURE:C09_C10_CASH_PERIOD_SCOPE');
  need(scope.operationKind==='READ_ONLY_WITH_APP_MUTATIONS_BLOCKED'&&scope.networkPolicy==='BLOCK_ALL_APP_MUTATIONS'&&scope.expectedAutomaticHrAction==='BLOCK_AND_RECORD'&&scope.independentAdminSessions===2&&scope.authActorSource==='EXACT_COMMITTED_METADATA_RECEIPT','SOURCE_FAILURE:C09_C10_READONLY_SCOPE');
  need(scope.production===false&&scope.i4Authorized===false&&scope.fullDomain===false&&scope.newDomainMatches===0&&scope.phaseAComplete===false&&scope.paymentsTested===false&&scope.benefitsRetested===false,'SOURCE_FAILURE:C09_C10_CREDIT_BOUNDARY');
  need(digest(scope.routes)===digest(['movimientos','financiero'])&&digest(scope.exports)===digest(['MOVEMENTS_XLSX','MOVEMENTS_PRINT_PDF','DASHBOARD_XLSX_IF_REAL_ROWS','DASHBOARD_PRINT_PDF_IF_REAL_ROWS']),'SOURCE_FAILURE:C09_C10_ALLOWED_UI_ACTIONS');
  const p=scope.prerequisite||{};
  need(String(p.runId)==='45514816284'&&String(p.runAttempt)==='1'&&String(p.jobId)==='138871923237'&&String(p.artifactId)==='14977308482'&&p.artifactDigest==='sha256:408850cd4c9a2243424229c6b26ff3c7471318e6387a086ca0302382c1b3759a'&&p.entry==='finance-metadata.json'&&p.decision==='PASS_FINANCE_METADATA_SECOND_ADVANCE'&&p.scopeSha256===digest(plan),'SOURCE_FAILURE:C09_C10_METADATA_PREREQUISITE');
  need(project==='cxorbia-backend-dev'&&host==='https://cxorbia-backend-dev.web.app'&&branch===BRANCH&&mode===UI_MODE&&!emulator,'ENVIRONMENT_FAILURE:C09_C10_DEV_ONLY');
  const m=descriptor.currentMaterialization||{};
  need(/^[a-f0-9]{40}$/.test(source)&&/^[a-f0-9]{40}$/.test(tree)&&descriptor.branch===BRANCH&&descriptor.productSourceSha===source&&descriptor.productTreeAuthority===tree&&m.sourceSha===source&&m.sourceTree===tree,'SOURCE_FAILURE:C09_C10_CURRENT_SOURCE');
  need(m.production===false&&m.sourceHostedExact===true&&m.hrLiveVerified===true&&current.production==='DO_NOT_TOUCH'&&current.authorizationI4===false,'SOURCE_FAILURE:C09_C10_CURRENT_DEV_AUTHORITY');
  need(/^cxorbia-live-hr-dev-\d{5}-[a-z0-9]+$/.test(m.runtimeRevision)&&/^sha256:[a-f0-9]{64}$/.test(m.runtimeDigest)&&/^sites\/cxorbia-backend-dev\/versions\/[a-z0-9]+$/.test(m.hostingVersion),'SOURCE_FAILURE:C09_C10_MATERIALIZATION_IDENTITY');
  return true;
}
export function assertCommittedAdvanceReadback({ledger,plan,receipt}){
  const {first,second,receiptId}=prepareMetadataCommand(ledger,plan);
  need(receipt?.status==='committed'&&receipt.commandType==='finance.movement.metadata.update'&&receipt.providerAck===true&&receipt.metadataOnly===true&&receipt.entityId===second.docId&&str(receipt.actorUid),'PERSISTENCE_FAILURE:C09_C10_METADATA_RECEIPT_REQUIRED');
  need(digest(receipt.entity)===digest(stripDocumentId(second))&&digest({cat:second.cat,fecha:second.fecha})===digest(plan.patch)&&second.metadataCorrection?.providerReceiptId===receiptId&&second.metadataCorrection?.authorityRef===plan.authorityRef&&second.metadataCorrection?.bankEvidenceConfirmed===false,'PERSISTENCE_FAILURE:C09_C10_METADATA_RECEIPT_READBACK');
  return {first,second,receiptId,actorUid:receipt.actorUid};
}
export function assertCurrentAdmin({uid,member,user,tenantId,projectId}){
  const c=user?.customClaims||{},scoped=x=>x.role==='super'||Array.isArray(x.projectIds)&&x.projectIds.includes(projectId);
  need(member?.id===uid&&member.active===true&&member.authNamespace==='staff'&&['super','admin'].includes(member.role)&&(!member.tenantId||member.tenantId===tenantId)&&scoped(member),'AUTH_FAILURE:C09_C10_CURRENT_MEMBERSHIP');
  need(user?.uid===uid&&user.disabled!==true&&c.tenantId===tenantId&&c.authNamespace==='staff'&&c.role===member.role&&scoped(c),'AUTH_FAILURE:C09_C10_CURRENT_ADMIN_CLAIMS');
  return {uid,tenantId,role:c.role,projectIds:[...(c.projectIds||[])]};
}
export function assertBrowserPrincipal({observed,expected,projectId,firebaseProject}){
  const c=observed?.claims||{},ctx=observed?.context||{};
  need(observed?.uid===expected.uid&&observed.firebaseProject===firebaseProject&&c.aud===firebaseProject&&c.iss==='https://securetoken.google.com/'+firebaseProject&&c.tenantId===expected.tenantId&&c.authNamespace==='staff'&&c.role===expected.role&&(c.role==='super'||Array.isArray(c.projectIds)&&c.projectIds.includes(projectId))&&ctx.authenticated===true&&ctx.tenantId===expected.tenantId&&ctx.authNamespace==='staff'&&ctx.role===expected.role,'AUTH_FAILURE:C09_C10_BROWSER_PRINCIPAL');
}
export function normalizeDocument(value){
  if(value instanceof Date)return {timestampMillis:value.getTime()};
  if(Array.isArray(value))return value.map(normalizeDocument);
  if(value&&typeof value==='object'){
    const keys=Object.keys(value).sort(),sec=value.seconds??value._seconds,nano=value.nanoseconds??value._nanoseconds;
    if(keys.every(k=>['seconds','nanoseconds','_seconds','_nanoseconds'].includes(k))&&Number.isSafeInteger(sec)&&Number.isInteger(nano))return {seconds:sec,nanoseconds:nano};
    return Object.fromEntries(keys.map(k=>[k,normalizeDocument(value[k])]));
  }
  return value;
}
export const rowDataHash=rows=>digest(ordered(rows).map(row=>normalizeDocument(stripDocumentId(row))));
export function assertExactMovementProjection({adcRows,remote,projection,projectId,periodId,tenantId}){
  need(remote?.status==='ok'&&remote.serverConfirmed===true&&Array.isArray(remote.items)&&Array.isArray(projection),'PERSISTENCE_FAILURE:C09_C10_BROWSER_SERVER_READ');
  const expected=adcRows.filter(row=>row.periodId===periodId&&row.projectId===projectId&&row.global!==true);
  for(const list of [expected,remote.items,projection]){
    need(new Set(list.map(row=>row.id)).size===list.length&&list.every(row=>str(row.id)&&(!row.docId||row.docId===row.id)&&row.tenantId===tenantId&&row.projectId===projectId&&row.periodId===periodId&&row.global!==true),'PERSISTENCE_FAILURE:C09_C10_PROJECT_ROW_SCOPE');
  }
  need(rowDataHash(expected)===rowDataHash(remote.items)&&rowDataHash(expected)===rowDataHash(projection),'PERSISTENCE_FAILURE:C09_C10_PROJECT_PROJECTION_READBACK');
  return expected;
}
export const MOVEMENT_HEADERS=Object.freeze(['Fecha','Concepto','Categoría','Tipo','País','Moneda','Monto','Estado']);
export const DASHBOARD_HEADERS=Object.freeze(['País','Moneda','Ingresos','Honorario devengado','Honorario por pagar','Honorario pagado','Gastos fijos','Margen','Margen %','CxC']);
export const displayCell=x=>x===null||x===undefined||x===''?'—':String(x);
const xlsxCell=x=>x===null||x===undefined?'':String(x);
export function assertReportRows(actual,expected,{format='display',columns,code='REPORT_ROWS'}={}){
  need(Array.isArray(actual)&&Array.isArray(expected)&&['display','xlsx'].includes(format),'MAPPING_FAILURE:C09_C10_REPORT_SHAPE');
  const convert=format==='xlsx'?xlsxCell:displayCell,width=columns??expected[0]?.length??0;
  const canonical=(rows,raw)=>rows.map(row=>{
    need(Array.isArray(row)&&row.length<=width,'FUNCTIONAL_DEFECT:C09_C10_REPORT_WIDTH');
    return JSON.stringify(Array.from({length:width},(_,i)=>raw?convert(row[i]):String(row[i]??'')));
  }).sort();
  need(digest(canonical(actual,false))===digest(canonical(expected,true)),'FUNCTIONAL_DEFECT:C09_C10_'+code);
}
export function movementExpected(rows,{currency,incomeLabels,expenseLabels}){
  return rows.map(row=>{
    const cur=row.pais&&currency?.[row.pais]||row.moneda||'';
    need(str(cur)&&cur!=='pending_currency'&&Number.isFinite(row.monto),'FUNCTIONAL_DEFECT:C09_C10_MOVEMENT_SOURCE_FIELDS');
    need((!row.currency||row.currency===cur)&&(!row.moneda||row.moneda===cur),'FUNCTIONAL_DEFECT:C09_C10_MOVEMENT_CURRENCY_CONFLICT');
    return {id:row.id,amount:row.monto,currency:cur,desc:String(row.desc||''),cells:[row.fecha||'—',row.cat||row.desc||'—',row.categoria||'Proyecto',incomeLabels?.[row.tipoIngreso]||expenseLabels?.[row.tipoEgreso]||row.tipo||'—',row.pais||'—',cur,Math.round(row.monto||0),row.estado||'—']};
  });
}
export function assertMovementDom(observed,expected){
  need(Array.isArray(observed)&&observed.length===expected.length&&new Set(observed.map(r=>r.id)).size===observed.length,'FUNCTIONAL_DEFECT:C09_C10_DOM_ROW_SET');
  for(const row of expected){
    const hit=observed.find(x=>x.id===row.id);
    need(hit&&hit.date===row.cells[0]&&hit.concept===row.cells[1]&&hit.description===row.desc&&hit.category===row.cells[2]&&hit.typeLabel===row.cells[3]&&hit.country===row.cells[4]&&hit.status===row.cells[7],'FUNCTIONAL_DEFECT:C09_C10_DOM_FIELDS');
    const money=str(hit.displayedMoney).replace(/\u2212/g,'-');
    need(money.includes(row.currency),'FUNCTIONAL_DEFECT:C09_C10_DOM_CURRENCY');
    const numeric=money.replace(row.currency,'').replace(/[\s,\u00a0]/g,'');
    need(/^[+-]?\d+(?:\.\d+)?$/.test(numeric)&&Number(numeric)===row.amount,'FUNCTIONAL_DEFECT:C09_C10_DOM_AMOUNT');
  }
  return true;
}
export function classifyUiRequest({url,method,body,devOrigin,firebaseProject,tenantId,projectId}){
  let u;try{u=new URL(url);}catch{return 'DENY_OTHER';}
  const m=String(method).toUpperCase(),read=['GET','HEAD'].includes(m);
  if(['data:','blob:','about:'].includes(u.protocol))return 'ALLOW_LOCAL';
  if(u.protocol!=='https:'||u.username||u.password)return 'DENY_OTHER';
  let p;try{p=decodeURIComponent(u.pathname);}catch{return 'DENY_OTHER';}
  if(u.origin===devOrigin&&p==='/v1/cxorbia/commands'){
    const automatic=m==='POST'&&body?.commandType==='hr.snapshot.reconcile'&&body.tenantId===tenantId&&body.projectId===projectId&&body.source==='hr-source-authorized-auto-reconciliation'&&/^[a-f0-9]{64}$/.test(String(body.entityId||''))&&body.expectedVersion===body.entityId;
    return automatic?'BLOCK_AUTOMATIC_HR':'DENY_APP_MUTATION';
  }
  if(u.origin===devOrigin)return read||m==='OPTIONS'?'ALLOW_READ':'DENY_APP_MUTATION';
  if(u.hostname==='identitytoolkit.googleapis.com')return /^\/v1\/accounts:(signInWithCustomToken|lookup)$/.test(p)&&['POST','OPTIONS'].includes(m)?'ALLOW_AUTH':'DENY_AUTH_MUTATION';
  if(u.hostname==='securetoken.googleapis.com')return p==='/v1/token'&&['POST','OPTIONS'].includes(m)?'ALLOW_AUTH':'DENY_AUTH_MUTATION';
  if(u.hostname==='firestore.googleapis.com'){
    if(/Firestore\/Write\/channel|:(commit|batchWrite)$/.test(p))return 'DENY_FIRESTORE_MUTATION';
    const database='projects/'+firebaseProject+'/databases/(default)',listen=p==='/google.firestore.v1.Firestore/Listen/channel'&&u.searchParams.get('database')===database;
    const prefix='/v1/'+database+'/documents',rest=p===prefix||p.startsWith(prefix+'/')||p.startsWith(prefix+':');
    if(listen&&['GET','POST','OPTIONS'].includes(m))return 'ALLOW_FIRESTORE_READ';
    if(rest&&(read||m==='OPTIONS'||m==='POST'&&/:(batchGet|runQuery|runAggregationQuery)$/.test(p)))return 'ALLOW_FIRESTORE_READ';
    return 'DENY_FIRESTORE_OTHER';
  }
  if(u.hostname==='firebasestorage.googleapis.com'){
    const prefix='/v0/b/'+firebaseProject+'.firebasestorage.app/o';
    return read&&(p===prefix||p.startsWith(prefix+'/'))?'ALLOW_STORAGE_READ':'DENY_STORAGE_MUTATION';
  }
  if(u.hostname===firebaseProject+'.firebaseapp.com'&&p.startsWith('/__/auth/')&&read)return 'ALLOW_AUTH_FRAME';
  return read&&new Set(['www.gstatic.com','fonts.googleapis.com','fonts.gstatic.com','cdn.sheetjs.com','cdnjs.cloudflare.com']).has(u.hostname)?'ALLOW_STATIC':'DENY_OTHER';
}
export function assertStableFinance(before,after){
  need(digest(before)===digest(after),'PERSISTENCE_FAILURE:C09_C10_FINANCE_CHANGED_DURING_READ');return true;
}

export function sanitizeUiDiagnostic(value={}){
  const flags=['firebaseUserPresent','contextAuthenticated','authorityApplied','expectedProjectSelected','expectedPeriodSelected','projectionLoaded','projectionKeyMatches','movExportPresent','finExportPresent','reportPreviewPresent','printTablePresent'];
  const out={available:value.available===true};
  for(const key of flags)out[key]=typeof value[key]==='boolean'?value[key]:null;
  out.route=['login','inicio','dashboard','movimientos','financiero'].includes(value.route)?value.route:'OTHER_OR_UNAVAILABLE';
  out.role=['super','admin'].includes(value.role)?value.role:'OTHER_OR_UNAVAILABLE';
  for(const key of ['movementRowCount','reportRowCount'])out[key]=Number.isInteger(value[key])&&value[key]>=0&&value[key]<=10000?value[key]:null;
  return out;
}
