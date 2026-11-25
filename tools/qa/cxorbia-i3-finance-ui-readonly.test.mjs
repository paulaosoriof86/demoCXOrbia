import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {digest,prepareMetadataCommand,stripDocumentId,assertCommittedAdvanceReadback,assertCurrentAdmin,assertBrowserPrincipal,normalizeDocument,assertExactMovementProjection,movementExpected,assertMovementDom,assertReportRows,classifyUiRequest,assertStableFinance,validateUiEnvironment,UI_MODE,publicError,hashBytes,sanitizeUiDiagnostic} from './cxorbia-i3-finance-ui-readonly-contract.mjs';
import {readXlsxFile} from './cxorbia-i3-finance-ui-export-readonly.mjs';

const sourcePlan=JSON.parse(fs.readFileSync(new URL('../../docs/checkpoints/CXORBIA_I3_NOVEMBER_ADVANCE_METADATA_SCOPE_20261124.json',import.meta.url),'utf8'));
const sourceScope=JSON.parse(fs.readFileSync(new URL('../../docs/checkpoints/CXORBIA_I3_C09_C10_ADVANCE_UI_READONLY_SCOPE_20261125.json',import.meta.url),'utf8'));
const copy=v=>structuredClone(v);
function fixture(){
  const plan=copy(sourcePlan);
  const common={tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-10',tipo:'ingreso',tipoIngreso:'anticipo',amount:7300,monto:7300,country:'GT',pais:'GT',currency:'Q',moneda:'Q',fecha:'2026-10-01',cat:'Synthetic October advance',categoria:'Proyecto',estado:'Conciliado',sourceStatus:'confirmed',createdAt:'2026-10-01T00:00:00.000Z',updatedAt:'2026-11-24T12:00:00.000Z'};
  const first={...common,id:'qa-first',docId:'qa-first',desc:'Synthetic first support',sourceRef:'admin-entry:'+'1'.repeat(40)};
  const second={...common,id:'qa-second',docId:'qa-second',desc:'Synthetic second support',sourceRef:'admin-entry:'+'2'.repeat(40)};
  plan.firstIdSha256=digest(first.id);plan.secondIdSha256=digest(second.id);plan.targetSourceRefSha256=digest(second.sourceRef);
  const pick=row=>Object.fromEntries(plan.expectedFactFields.map(k=>[k,row[k]??null]));
  plan.firstOriginalFactsSha256=digest(pick(first));plan.secondOriginalFactsSha256=digest(pick(second));
  plan.firstOriginalMetadataSha256=digest({cat:first.cat,fecha:first.fecha});plan.secondOriginalMetadataSha256=digest({cat:second.cat,fecha:second.fecha});
  const ledger={movements:[first,second]},prepared=prepareMetadataCommand(ledger,plan);
  Object.assign(second,plan.patch,{version:1,metadataCorrection:{providerReceiptId:prepared.receiptId,authorityRef:plan.authorityRef,bankEvidenceConfirmed:false}});
  const receipt={status:'committed',commandType:'finance.movement.metadata.update',providerAck:true,metadataOnly:true,entityId:second.id,actorUid:'qa-admin',entity:stripDocumentId(second)};
  return {plan,ledger,receipt,first,second};
}
function principalFixture(){
  const claims={tenantId:'tya',authNamespace:'staff',role:'admin',projectIds:['cinepolis']};
  const member={id:'qa-admin',active:true,...claims};
  const user={uid:'qa-admin',disabled:false,customClaims:copy(claims)};
  const expected={uid:user.uid,...claims};
  const observed={uid:user.uid,firebaseProject:'cxorbia-backend-dev',claims:{...claims,aud:'cxorbia-backend-dev',iss:'https://securetoken.google.com/cxorbia-backend-dev'},context:{...claims,authenticated:true}};
  return {uid:user.uid,member,user,tenantId:'tya',projectId:'cinepolis',expected,observed,firebaseProject:'cxorbia-backend-dev'};
}

test('committed metadata is read back without mutating fixtures or dispatching a command',()=>{
  const f=fixture(),before=copy(f),r=assertCommittedAdvanceReadback(f);
  assert.equal(r.actorUid,'qa-admin');assert.equal(r.second.periodId,'cinepolis-2026-10');
  assert.equal(r.second.cat,sourcePlan.patch.cat);assert.equal(r.second.fecha,'2026-10-31');
  assert.deepEqual(f,before);
});
test('receipt and exact advance invariants reject changed scope, forged state, or duplicate advance',async t=>{
  const cases=[
    ['missing receipt',f=>f.receipt=null],['actor missing',f=>delete f.receipt.actorUid],['receipt not committed',f=>f.receipt.status='pending'],
    ['wrong entity',f=>f.receipt.entityId='other'],['ACK missing',f=>f.receipt.providerAck=false],['metadata only missing',f=>f.receipt.metadataOnly=false],
    ['receipt content mismatch',f=>f.receipt.entity.cat='different'],['old second label',f=>f.second.cat='Synthetic October advance'],
    ['wrong cash period',f=>f.second.periodId='cinepolis-2026-11'],['first concept changed',f=>f.first.cat='changed'],
    ['amount drift',f=>f.second.monto=7301],['currency drift',f=>f.second.moneda='L'],['country drift',f=>f.second.country='HN'],
    ['third advance',f=>f.ledger.movements.push({...f.second,id:'third',docId:'third'})],
    ['linked obligation',f=>f.second.accountId='account'],['bank claim forged',f=>f.second.metadataCorrection.bankEvidenceConfirmed=true]
  ];
  for(const [name,mutate]of cases)await t.test(name,()=>{const f=fixture();mutate(f);assert.throws(()=>assertCommittedAdvanceReadback(f),/PERSISTENCE_FAILURE:/);});
});
test('current membership, Auth and browser principal must all identify the exact Admin',async t=>{
  const f=principalFixture();assert.deepEqual(assertCurrentAdmin(f),{uid:'qa-admin',tenantId:'tya',role:'admin',projectIds:['cinepolis']});assert.doesNotThrow(()=>assertBrowserPrincipal(f));
  for(const [name,mutate]of [
    ['disabled',x=>x.user.disabled=true],['inactive',x=>x.member.active=false],['ops',x=>{x.member.role='ops';x.user.customClaims.role='ops';}],
    ['membership scope absent',x=>x.member.projectIds=[]],['Auth scope absent',x=>x.user.customClaims.projectIds=[]],
    ['wrong tenant',x=>x.user.customClaims.tenantId='foreign'],['role discrepancy',x=>x.user.customClaims.role='super'],
    ['wrong exact user',x=>x.user.uid='other']
  ])await t.test(name,()=>{const x=principalFixture();mutate(x);assert.throws(()=>assertCurrentAdmin(x),/AUTH_FAILURE:/);});
  for(const [name,mutate]of [
    ['wrong browser UID',x=>x.observed.uid='other'],['wrong audience',x=>x.observed.claims.aud='tya-plataforma'],
    ['browser scope absent',x=>x.observed.claims.projectIds=[]],['browser ops',x=>x.observed.claims.role='ops'],
    ['context mismatch',x=>x.observed.context.tenantId='foreign'],['unauthenticated context',x=>x.observed.context.authenticated=false]
  ])await t.test(name,()=>{const x=principalFixture();mutate(x);assert.throws(()=>assertBrowserPrincipal(x),/AUTH_FAILURE:/);});
});
test('server-confirmed UI projection matches ADC by complete row identity and values',async t=>{
  const f=fixture(),rows=f.ledger.movements.map(stripDocumentId);
  const input={adcRows:f.ledger.movements,remote:{status:'ok',serverConfirmed:true,items:rows},projection:copy(rows),tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-10'};
  assert.equal(assertExactMovementProjection(input).length,2);
  for(const [name,mutate]of [
    ['cache read',x=>x.remote.serverConfirmed=false],['missing row',x=>x.remote.items.pop()],
    ['duplicated row',x=>x.projection.push(copy(x.projection[0]))],['amount mismatch',x=>x.projection[1].monto=1],
    ['foreign tenant',x=>x.remote.items[0].tenantId='foreign'],['global row',x=>x.remote.items[0].global=true],
    ['ID alias',x=>x.adcRows[0].docId='other']
  ])await t.test(name,()=>{const x=copy(input);mutate(x);assert.throws(()=>assertExactMovementProjection(x),/PERSISTENCE_FAILURE:/);});
});
test('timestamp normalization preserves nanoseconds and does not reinterpret business objects',()=>{
  assert.deepEqual(normalizeDocument({_seconds:42,_nanoseconds:567}),normalizeDocument({seconds:42,nanoseconds:567}));
  assert.notDeepEqual(normalizeDocument({_seconds:42,_nanoseconds:567}),normalizeDocument({seconds:42,nanoseconds:568}));
  assert.deepEqual(normalizeDocument({seconds:42,nanoseconds:567,amount:5}),{amount:5,nanoseconds:567,seconds:42});
});
test('network guard allows only required DEV reads and Auth, suppresses exact auto HR, and rejects writers',async t=>{
  const base={devOrigin:'https://cxorbia-backend-dev.web.app',firebaseProject:'cxorbia-backend-dev',tenantId:'tya',projectId:'cinepolis'};
  const classify=(url,method='GET',body)=>classifyUiRequest({...base,url,method,body});
  const fs='https://firestore.googleapis.com/v1/projects/cxorbia-backend-dev/databases/(default)/documents';
  const listen='https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?database='+encodeURIComponent('projects/cxorbia-backend-dev/databases/(default)');
  for(const [url,method]of [
    [base.devOrigin+'/index-backend-dev.html','GET'],[base.devOrigin+'/api/tenants/tya/projects/cinepolis/hr-live','GET'],
    ['https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=redacted','POST'],
    ['https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=redacted','POST'],['https://securetoken.googleapis.com/v1/token','POST'],
    [listen,'POST'],[listen,'GET'],[fs+':batchGet','POST'],[fs+'/tenants/tya:runQuery','POST'],
    ['https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js','GET'],
    ['https://firebasestorage.googleapis.com/v0/b/cxorbia-backend-dev.firebasestorage.app/o/opaque','GET']
  ])assert.match(classify(url,method),/^ALLOW_/);
  const revision='a'.repeat(64),auto={commandType:'hr.snapshot.reconcile',tenantId:'tya',projectId:'cinepolis',source:'hr-source-authorized-auto-reconciliation',entityId:revision,expectedVersion:revision};
  assert.equal(classify(base.devOrigin+'/v1/cxorbia/commands','POST',auto),'BLOCK_AUTOMATIC_HR');
  for(const [name,url,method,body]of [
    ['payment',base.devOrigin+'/v1/cxorbia/commands','POST',{commandType:'finance.payment.batch'}],
    ['metadata again',base.devOrigin+'/v1/cxorbia/commands','POST',{commandType:'finance.movement.metadata.update'}],
    ['unknown app POST',base.devOrigin+'/api/write','POST',{}],
    ['Firestore commit',fs+':commit','POST',{}],['Firestore batchWrite',fs+':batchWrite','POST',{}],
    ['Firestore write channel','https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel','POST',{}],
    ['Auth claims update','https://identitytoolkit.googleapis.com/v1/accounts:update','POST',{}],
    ['Auth account create','https://identitytoolkit.googleapis.com/v1/accounts:signUp','POST',{}],
    ['Storage delete','https://firebasestorage.googleapis.com/v0/b/cxorbia-backend-dev.firebasestorage.app/o/x','DELETE'],
    ['Storage upload','https://firebasestorage.googleapis.com/v0/b/cxorbia-backend-dev.firebasestorage.app/o','POST'],
    ['production','https://tya-plataforma.web.app/index.html','GET'],
    ['foreign Listen',listen.replace('cxorbia-backend-dev','foreign'),'POST'],
    ['foreign REST',fs.replace('cxorbia-backend-dev','foreign'),'GET'],
    ['prefix confusion',fs.replace('/documents','/documents-other')+':runQuery','POST'],
    ['manual HR',base.devOrigin+'/v1/cxorbia/commands','POST',{...auto,source:'hr-source-sync-request'}],
    ['foreign HR',base.devOrigin+'/v1/cxorbia/commands','POST',{...auto,projectId:'foreign'}],
    ['wrong HR revision',base.devOrigin+'/v1/cxorbia/commands','POST',{...auto,expectedVersion:'b'.repeat(64)}]
  ])await t.test(name,()=>assert.match(classify(url,method,body),/^DENY_/));
});
test('money and DOM checks preserve sign, exact concept, country, currency and both IDs',()=>{
  const f=fixture(),config={currency:{GT:'Q'},incomeLabels:{anticipo:'Anticipo'},expenseLabels:{}};
  const expected=movementExpected(f.ledger.movements,config);
  const dom=expected.map(r=>({id:r.id,date:r.cells[0],concept:r.cells[1],description:r.desc,category:r.cells[2],typeLabel:r.cells[3],country:r.cells[4],displayedMoney:'+ Q 7,300',status:r.cells[7]}));
  assert.equal(assertMovementDom(dom,expected),true);
  for(const patch of [{displayedMoney:'− Q 7,300'},{displayedMoney:'+ L 7,300'},{displayedMoney:'+ Q 730'},{concept:'old'},{country:'HN'}]){
    const changed=copy(dom);Object.assign(changed[1],patch);assert.throws(()=>assertMovementDom(changed,expected),/FUNCTIONAL_DEFECT:/);
  }
  assert.throws(()=>movementExpected(f.ledger.movements,{...config,currency:{GT:'L'}}),/CURRENCY_CONFLICT/);
});
test('report comparison is a multiset and preserves blanks, duplicates and numeric signs',()=>{
  const rows=[['first','Q',7300,null],['second','Q',7300,0]];
  assert.doesNotThrow(()=>assertReportRows([['second','Q','7300','0'],['first','Q','7300','—']],rows,{columns:4}));
  assert.doesNotThrow(()=>assertReportRows([['first','Q','7300'],['second','Q','7300','0']],rows,{format:'xlsx',columns:4}));
  for(const actual of [
    [['first','Q','7300','—']], [['first','Q','7300','—'],['first','Q','7300','—']],
    [['first','Q','-7300','—'],['second','Q','7300','0']],
    [['first','L','7300','—'],['second','Q','7300','0']],
    [['first','Q','7300','0'],['second','Q','7300','0']]
  ])assert.throws(()=>assertReportRows(actual,rows,{columns:4}),/FUNCTIONAL_DEFECT:/);
});
test('actual ZIP/XML XLSX parser reads shared strings, inline strings, sparse blanks and numeric zero',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cx-ui-xlsx-test-')),file=path.join(dir,'case.xlsx');
  const script=[
    'import sys,zipfile',
    'z=zipfile.ZipFile(sys.argv[1],"w")',
    'z.writestr("xl/workbook.xml",\'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Datos" sheetId="1" r:id="r1"/></sheets></workbook>\')',
    'z.writestr("xl/_rels/workbook.xml.rels",\'<Relationships><Relationship Id="r1" Target="worksheets/sheet1.xml"/></Relationships>\')',
    'z.writestr("xl/sharedStrings.xml",\'<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><si><t>Moneda</t></si><si><t>Q</t></si></sst>\')',
    'z.writestr("xl/worksheets/sheet1.xml",\'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="inlineStr"><is><t>Monto</t></is></c><c r="D1" t="inlineStr"><is><t>Última</t></is></c></row><row r="2"><c r="A2" t="s"><v>1</v></c><c r="B2"><v>7300</v></c><c r="D2"><v>0</v></c></row></sheetData></worksheet>\')',
    'z.close()'
  ].join('\n');
  try{execFileSync('python3',['-c',script,file]);assert.deepEqual(readXlsxFile(file),{Datos:[['Moneda','Monto','','Última'],['Q','7300','','0']]});}
  finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('before/after stability detects changes even when amount totals or millisecond timestamps match',()=>{
  const before={ledger:{movements:[{docId:'x',monto:1}]},versions:{movements:[{docId:'x',updateTime:{seconds:1,nanoseconds:2}}]}};
  assert.equal(assertStableFinance(before,copy(before)),true);
  const timestamp=copy(before);timestamp.versions.movements[0].updateTime.nanoseconds=3;assert.throws(()=>assertStableFinance(before,timestamp),/FINANCE_CHANGED/);
  const replaced=copy(before);replaced.ledger.movements[0].docId='y';assert.throws(()=>assertStableFinance(before,replaced),/FINANCE_CHANGED/);
});
test('current DEV identity and frozen cash period are required before providers initialize',async t=>{
  const source='a'.repeat(40),tree='b'.repeat(40),scope=copy(sourceScope),plan=copy(sourcePlan);
  const materialization={sourceSha:source,sourceTree:tree,sourceHostedExact:true,hrLiveVerified:true,production:false,runtimeRevision:'cxorbia-live-hr-dev-00391-8mg',runtimeDigest:'sha256:'+'c'.repeat(64),hostingVersion:'sites/cxorbia-backend-dev/versions/511061474d07baca'};
  const input={scope,plan,descriptor:{branch:'recovery/cxorbia-phase-a-20260831',productSourceSha:source,productTreeAuthority:tree,currentMaterialization:materialization},current:{production:'DO_NOT_TOUCH',authorizationI4:false},project:'cxorbia-backend-dev',host:'https://cxorbia-backend-dev.web.app',source,tree,branch:'recovery/cxorbia-phase-a-20260831',mode:UI_MODE,period:scope.cashPeriodId};
  assert.equal(validateUiEnvironment(input),true);
  for(const [name,mutate]of [
    ['wrong source',x=>x.source='d'.repeat(40)],['wrong period',x=>x.period='cinepolis-2026-11'],
    ['production host',x=>x.host='https://tya-plataforma.web.app'],['emulator',x=>x.emulator='localhost:8080'],
    ['production allowed',x=>x.current.authorizationI4=true],['wrong artifact',x=>x.scope.prerequisite.artifactDigest='sha256:'+'e'.repeat(64)],
    ['third session',x=>x.scope.independentAdminSessions=3],['allow writer',x=>x.scope.networkPolicy='ALLOW_HR'],
    ['wrong mode',x=>x.mode='APPLY_NOV_ADVANCE_METADATA'],['promote domain',x=>x.scope.fullDomain=true]
  ])await t.test(name,()=>{const x=copy(input);mutate(x);assert.throws(()=>validateUiEnvironment(x),/FAILURE:/);});
});
test('public diagnostics never retain an identifier or arbitrary provider error suffix',()=>{
  assert.equal(publicError(Error('AUTH_FAILURE:C09_C10_CURRENT_ADMIN_CLAIMS:user@example.test')),'AUTH_FAILURE:C09_C10_CURRENT_ADMIN_CLAIMS');
  assert.equal(publicError(Error('secret token uid message')),'ENVIRONMENT_FAILURE:C09_C10_UI_UNCONFIRMED');
  assert.equal(hashBytes(Buffer.from('abc')),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});
test('partial UI diagnostics contain only approved booleans, counts and enumerated route/role',()=>{
  const safe=sanitizeUiDiagnostic({available:true,firebaseUserPresent:true,route:'private-customer',role:'person@example.test',movementRowCount:3,reportRowCount:10001,uid:'PRIVATE_UID',html:'PRIVATE_HTML',authToken:'PRIVATE_TOKEN'});
  assert.equal(safe.available,true);assert.equal(safe.firebaseUserPresent,true);assert.equal(safe.route,'OTHER_OR_UNAVAILABLE');assert.equal(safe.role,'OTHER_OR_UNAVAILABLE');assert.equal(safe.movementRowCount,3);assert.equal(safe.reportRowCount,null);
  assert(!JSON.stringify(safe).includes('PRIVATE'));assert(!JSON.stringify(safe).includes('example.test'));
});

test('only the three evidenced external image GETs are classified and still blocked',()=>{
 const scoped={devOrigin:'https://cxorbia-backend-dev.web.app',firebaseProject:'cxorbia-backend-dev',tenantId:'qa',projectId:'demo',method:'GET',resourceType:'image'};
 for(const url of ['https://tyaconsultores.com/wp-content/uploads/2023/05/logo.png','https://flagcdn.com/24x18/gt.png','https://flagcdn.com/24x18/hn.png']){
    assert.equal(classifyUiRequest({...scoped,url}),'BLOCK_KNOWN_PRESENTATION_IMAGE');
    for(const alter of [{method:'POST'},{resourceType:'fetch'},{url:url+'?scope=private'},{url:url.replace('https://','https://private@')},{url:url+'/unapproved'}])
      assert.equal(classifyUiRequest({...scoped,url,...alter}),'DENY_OTHER');
 }
});
