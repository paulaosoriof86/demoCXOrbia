import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {BENEFITS_OWNERS,BENEFITS_DEPENDENCIES,BENEFITS_FINDINGS,BENEFITS_OBLIGATIONS,BENEFITS_CONTRACT_SHA,validateBenefitsReadonlyReceipt,parseBenefitsCsv} from './cxorbia-i3-benefits-readonly-contract.mjs';
const hash=v=>crypto.createHash('sha256').update(Buffer.isBuffer(v)?v:String(v)).digest('hex');
const ensure=(ok,code)=>{if(!ok)throw new Error('FUNCTIONAL_DEFECT:BENEFITS_'+code);};
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
const sorted=v=>JSON.stringify([...v].sort());
const csvSafe=v=>{const s=String(v??'');return /^[=+\-@]/.test(s)?"'"+s:s;};
const XLSX_READ=String.raw`import sys,zipfile,xml.etree.ElementTree as E,json,posixpath
z=zipfile.ZipFile(sys.argv[1]);ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
ss=[]
if 'xl/sharedStrings.xml' in z.namelist():
 ss=[''.join(n.itertext()) for n in E.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',ns)]
rels={n.attrib['Id']:n.attrib['Target'] for n in E.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
out={}
for s in E.fromstring(z.read('xl/workbook.xml')).findall('s:sheets/s:sheet',ns):
 target=rels[s.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']]
 file=target.lstrip('/') if target.startswith('/') else posixpath.normpath('xl/'+target)
 rows=[]
 for row in E.fromstring(z.read(file)).findall('s:sheetData/s:row',ns):
  cells=[]
  for c in row:
   v=c.find('s:v',ns);val='' if v is None else v.text or ''
   if c.attrib.get('t')=='s':val=ss[int(val)]
   elif c.attrib.get('t')=='inlineStr':val=''.join(c.find('s:is',ns).itertext())
   ref=c.attrib.get('r','A1');col=0
   for ch in ref:
    if not ch.isalpha():break
    col=col*26+ord(ch.upper())-64
   while len(cells)<col:cells.append('')
   cells[col-1]=val
  rows.append(cells)
 out[s.attrib['name']]=rows
print(json.dumps(out,ensure_ascii=False))`;

// This producer verifies actual downloads/print bytes in private runner temp.
// Only name-free comparisons, hashes and masked screenshots enter public CI artifacts.
export async function proveBenefitsReadonly({ctx,custom,visible,staff,candidates,resolve,hr,sourceSha,sourceTree,sourceDir,host,tenantId,projectId,out,identity,hrRevision}){
  fs.mkdirSync(out,{recursive:true});const privateDir=fs.mkdtempSync(path.join(os.tmpdir(),'cx-benefits-private-'));
  const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
  const matrix=JSON.parse(fs.readFileSync(descriptor.moduleTruthPath,'utf8')),mod=matrix.modules.find(x=>x.domain==='benefits');
  const r={schemaVersion:'cxorbia.i3.benefits-readonly-domain.v1',decision:'HOLD_I3_BENEFITS_READONLY_DOMAIN',moduleDomain:'benefits',operationKind:'READ_ONLY',findingIds:BENEFITS_FINDINGS,
    sourceSha,sourceTree,...identity,hrRevision,production:false,ownerPaths:BENEFITS_OWNERS,ownerEvidence:[],
    runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT,controlSha:process.env.GITHUB_SHA,
    contractAuthority:{contractSha256:BENEFITS_CONTRACT_SHA,path:descriptor.moduleTruthPath,gitBlob:descriptor.moduleTruthExpectedGitBlob,formatAuthority:'EXISTING_APPROVED_PRODUCT_HANDLERS_CSV_SHOPPER_XLSX_ADMIN_PRINT_PDF'},
    mutationEvidence:{applicable:false,providerAckClaimed:false,financialMutationRequestsObserved:0,automaticHrReconciliationRequests:0,totalProviderWritesNotInferred:true},
    humanAcceptance:{mode:'PRESERVED_B5_OWNER_UNCHANGED_NO_NEW_DESIGN',newApproval:false,receipt:mod?.functionalBlockAcceptance20261110?.receipt},
    readOnlyProof:{exports:[],currencyScopes:[],independentSessions:0},contractCoverage:{fullDomain:false,obligations:[]},gate20:'HOLD',gate21:'HOLD',i4Authorized:false};
  const evidence={cases:[],admin:[],checks:{},rawPersonalExportsPublished:false,rawExports:'INSPECTED_IN_PRIVATE_RUNNER_TEMP_HASHED_AND_REMOVED_BEFORE_PUBLIC_ARTIFACT_UPLOAD'};
  const hrVisits=hr.visits||[],periods=hr.periods||[],hrById=new Map(hrVisits.map(v=>[String(v.id||v.visitId),v]));
  const contexts=[];const newCtx=async()=>{const x=await ctx();contexts.push(x.c);r.readOnlyProof.independentSessions++;x.p.on('request',req=>{
    if(['GET','HEAD','OPTIONS'].includes(req.method()))return;
    let b;try{b=req.postDataJSON();}catch{}
    const type=String(b?.commandType||'');
    if(type==='hr.snapshot.reconcile'){r.mutationEvidence.automaticHrReconciliationRequests++;return;}
    if(/finance|payment|liquidat|movement|account|benefit/i.test(type)||/\/documents[^?]*:(?:commit|batchWrite)|Firestore\/Write\/channel/.test(req.url()))r.mutationEvidence.financialMutationRequestsObserved++;
  });return x;};
  const settle=async(p,uid)=>{await p.waitForFunction(({uid,tenantId,projectId,hrRevision})=>window.firebase?.auth?.().currentUser?.uid===uid&&window.CX?.backendAuth?.context?.()?.tenantId===tenantId&&window.CX?.data?.currentProjectId===projectId&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&window.CX?.data?.previewMeta?.sourceRevision===hrRevision,{uid,tenantId,projectId,hrRevision},{timeout:150000});};
  const select=async(p,periodId,route)=>{
    await p.locator('#periodSel').selectOption(periodId);await p.waitForFunction(id=>window.CX?.data?.currentPeriodId===id,periodId);
    await p.evaluate(id=>window.CX.router.nav(id),route);await p.waitForFunction(id=>window.CX?.session?.view===id,route);
    await p.waitForTimeout(180);
  };
  const projection=async(p,role)=>p.evaluate(role=>{
    const d=window.CX.data,period=d.period(),sid=String(d.__identityMap?.[window.CX.session?.user?.shopperId]||window.CX.session?.user?.shopperId||'');
    const current=role==='admin'?window.CX.liq.forProject(d):(d.visitsForShopper(sid,false)||[]).filter(v=>v.__pendingPlatformAssignmentOverlay!==true&&String(d.recordPeriodId(v))===String(d.currentPeriodId)).map(v=>window.CX_TYA_CANONICAL_FINANCE_READ_MODEL.fromVisit(period,v)).filter(Boolean);
    return {periodId:d.currentPeriodId,periodKey:period.periodKey||period.key||'',periodLabel:period.periodo||period.ronda||period.name,projectId:d.currentProjectId,revision:d.previewMeta?.sourceRevision,
      sid,role:window.CX.backendAuth.context().role,uid:window.firebase.auth().currentUser.uid,rows:current.map(l=>{
        const v=d._visitas.find(v=>String(v.id)===String(l.visitaId)),cur=l.moneda||(l.pais&&period.currency?.[l.pais])||'';
        const paid=l.paymentConfirmed===true&&Boolean(l.paymentSourceRef||l.paymentRef||l.historicalReconciliationConfirmed||l.reconciliationSourceRef);
        return {id:String(l.visitaId||l.visitId||''),shopperId:String(d.__identityMap?.[v?.shopperId]||v?.shopperId||''),shopper:l.shopper||'',branch:l.sucursal||'',date:l.freal||'',country:l.pais||'',currency:cur,honorarium:l.honorario??null,reimbursement:l.reembolso??null,total:l.total??null,state:l.estado||'',stateLabel:window.CX.liq.label(l.estado)?.[0]||l.estado||'',paid,paymentRef:l.paymentSourceRef||l.reconciliationSourceRef||'',estimated:l.fechaEstimadaPago||'—',review:l.reviewRequired===true||l.financialSourceStatus==='pending_or_review'||l.liquidationState==='pending_financial_source'||!l.pais||!cur};})};
  },role);
  const recordExport=(bytes,obj)=>{const proof={...obj,bytes:bytes.length,sha256:hash(bytes),parsed:true,contentMatches:true,evidenceRef:'benefits-observed.json'};r.readOnlyProof.exports.push(proof);return proof;};
  const rowHash=rows=>hash(JSON.stringify(rows.map(x=>({id:x.id,country:x.country,currency:x.currency,h:x.honorarium,r:x.reimbursement,t:x.total,s:x.state,paid:x.paid,ref:x.paymentRef})).sort((a,b)=>a.id.localeCompare(b.id))));
  const capture=async(p,name)=>{await p.screenshot({path:path.join(out,name+'.png'),fullPage:true,mask:[p.locator('aside'),p.locator('#tbRoleIdentity'),p.locator('#cx-toasts'),p.locator('#view td:first-child'),p.locator('#rkBody td:first-child'),p.locator('#cxRKPrint td:first-child')],maskColor:'#334155'});};
  const csvDownload=async(p,expected,actor,label)=>{
    const download=p.waitForEvent('download',{timeout:20000});await p.locator('#benDownloadReceipt').click();const file=await download,fp=path.join(privateDir,label+'.csv');await file.saveAs(fp);const bytes=fs.readFileSync(fp),csv=parseBenefitsCsv(bytes);
    ensure(csv.headers.join('|')==='Documento|Visita|Fecha realizada|País|Moneda|Honorario|Reembolso|Total|Estado liquidación|Estado de pago|Referencia de fuente','CSV_HEADERS');
    ensure(csv.rows.length===expected.rows.length,'CSV_ROW_COUNT');
    const left=[...expected.rows];for(const row of csv.rows){const i=left.findIndex(x=>csvSafe(x.branch||x.id)===row.Visita&&x.date===row['Fecha realizada']&&x.country===row['País']&&x.currency===row.Moneda&&Number(row.Honorario)===Number(x.honorarium)&&Number(row.Reembolso)===Number(x.reimbursement)&&Number(row.Total)===Number(x.total)&&csvSafe(x.stateLabel)===row['Estado liquidación']&&csvSafe(x.paymentRef)===row['Referencia de fuente']);ensure(i>=0,'CSV_CONTENT_OR_SCOPE');const x=left.splice(i,1)[0];ensure(row.Documento==='Resumen de beneficios CXOrbia · no sustituye comprobante bancario','CSV_BANK_STATEMENT_TRUTH');ensure(x.paid?row['Estado de pago']==='Pago confirmado':row['Estado de pago']!=='Pago confirmado','CSV_PAYMENT_TRUTH');}
    ensure(!left.length,'CSV_MISSING_ROW');return recordExport(bytes,{format:'SHOPPER_CSV',rows:csv.rows.length,principalFingerprint:hash(actor.uid),periodId:expected.periodId,scope:'FULL_SELECTED_PERIOD_INCLUDING_PENDING',semanticRowsSha256:rowHash(expected.rows)});
  };
  try{
    for(const f of [...BENEFITS_OWNERS,...BENEFITS_DEPENDENCIES]){const src=fs.readFileSync(path.join(sourceDir,f)),response=await fetch(host+'/'+f.slice(4)+'?benefits-proof='+Date.now(),{headers:{'cache-control':'no-cache,no-store'}});ensure(response.ok,'OWNER_HTTP');const served=Buffer.from(await response.arrayBuffer());const gitBlob=execFileSync('git',['rev-parse',sourceSha+':'+f],{encoding:'utf8'}).trim();r.ownerEvidence.push({path:f,gitBlob,sourceSha256:hash(src),servedSha256:hash(served),byteParity:hash(src)===hash(served)});ensure(hash(src)===hash(served),'OWNER_BYTE_PARITY');}
    const julissa=candidates.find(x=>x.cr?.login==='julissa.flores'),stiven=candidates.find(x=>x.cr?.login==='stiven.lopez'),hn=candidates.find(x=>x.co==='HN'&&x.h>0);
    ensure(julissa&&stiven&&hn,'EXISTING_ROLE_REPRESENTATIVES');const actors=[julissa,stiven,hn];
    const mostRecent=[...periods].sort((a,b)=>String(b.key).localeCompare(String(a.key))),prior=mostRecent[1];
    const admin=await newCtx();await custom(admin.p,staff,'admin');await settle(admin.p,staff.id);const adminByPeriod=new Map(),cases=[];
    for(const [i,actor] of actors.entries()){
      const choices=i===0&&prior?[prior,...mostRecent.filter(p=>p.id!==prior.id)]:mostRecent;
      let selected=null;
      for(const p of choices){
        if(!hrVisits.some(v=>(resolve(String(v.shopperId||''))||String(v.shopperId||''))===actor.can&&v.periodKey===p.key))continue;
        await select(admin.p,p.id,'liquidaciones');const rows=(await projection(admin.p,'admin')).rows;
        if(rows.some(x=>x.shopperId===actor.can)){selected=p;break;}
      }
      ensure(selected,'EXISTING_FINANCIAL_PERIOD');cases.push({actor,period:selected});
    }
    for(const p of [...new Map(cases.map(x=>[x.period.id,x.period])).values()]){
      await select(admin.p,p.id,'liquidaciones');await admin.p.locator('#liqExport').waitFor({state:'visible'});const expected=await projection(admin.p,'admin');ensure(expected.revision===hrRevision,'ADMIN_REVISION');adminByPeriod.set(p.id,expected);
      const eligible=expected.rows.filter(x=>!x.review),excluded=expected.rows.filter(x=>x.review);if(!eligible.length){evidence.admin.push({periodId:p.id,eligibleRows:0,excludedRows:excluded.length,exportSkippedHonest:true});continue;}
      await admin.p.locator('#liqExport').click();await admin.p.locator('#rkBody table').waitFor();
      const preview=await admin.p.locator('#rkBody table').evaluate(el=>({headers:[...el.querySelectorAll('thead th')].map(x=>x.textContent.trim()),rows:[...el.querySelectorAll('tbody tr')].map(tr=>[...tr.querySelectorAll('td')].map(x=>x.textContent.trim()))}));
      const expectedCells=eligible.map(x=>[x.shopper||'—',x.branch||'—',x.country||'—',x.currency,x.state,String(Math.round(x.honorarium||0)),String(Math.round(x.reimbursement||0)),String(Math.round(x.total||0)),x.estimated]);ensure(sorted(preview.rows.map(JSON.stringify))===sorted(expectedCells.map(JSON.stringify)),'ADMIN_PREVIEW_ELIGIBILITY');
      const xdl=admin.p.waitForEvent('download',{timeout:20000});await admin.p.locator('#rkXls').click();const file=await xdl;ensure(/\.xlsx$/i.test(file.suggestedFilename()),'ADMIN_XLSX_EXTENSION');const fp=path.join(privateDir,p.id+'.xlsx');await file.saveAs(fp);const bytes=fs.readFileSync(fp),workbook=JSON.parse(execFileSync('python3',['-c',XLSX_READ,fp],{encoding:'utf8'}));
      ensure(['Resumen','Datos','Catálogo de columnas'].every(x=>Array.isArray(workbook[x])),'ADMIN_XLSX_SHEETS');ensure(JSON.stringify(workbook.Datos[0])===JSON.stringify(preview.headers),'ADMIN_XLSX_HEADERS');ensure(sorted(workbook.Datos.slice(1).map(JSON.stringify))===sorted(preview.rows.map(JSON.stringify)),'ADMIN_XLSX_CONTENT');const meta=Object.fromEntries(workbook.Resumen);ensure(String(meta.Filas)===String(eligible.length)&&norm(meta.Periodo)===norm(expected.periodLabel),'ADMIN_XLSX_META');
      recordExport(bytes,{format:'ADMIN_XLSX',rows:eligible.length,principalFingerprint:hash(staff.id),periodId:p.id,excludedRows:excluded.length,scope:'ELIGIBLE_ONLY_EXCLUDING_REVIEW',semanticRowsSha256:rowHash(eligible)});
      await admin.p.locator('#rkPdf').click();await admin.p.locator('#cxRKPrint table').waitFor({state:'attached'});const printRows=await admin.p.locator('#cxRKPrint table').evaluate(el=>[...el.querySelectorAll('tbody tr')].map(tr=>[...tr.querySelectorAll('td')].map(x=>x.textContent.trim())));ensure(JSON.stringify(printRows)===JSON.stringify(preview.rows),'PRINT_TABLE_PARITY');
      const pdf=await admin.p.pdf({format:'A4',printBackground:true});ensure(pdf.subarray(0,5).toString()==='%PDF-','PDF_BYTES');const pdfjs=(await import('pdfjs-dist/legacy/build/pdf.js')).default;const doc=await pdfjs.getDocument({data:new Uint8Array(pdf),disableFontFace:true,useSystemFonts:true,isEvalSupported:false}).promise;let texts=[];for(let i=1;i<=doc.numPages;i++){const pg=await doc.getPage(i);const t=await pg.getTextContent();texts.push(t.items.map(x=>x.str).join(' '));}const pdfText=norm(texts.join(' '));ensure(doc.numPages>0&&pdfText.includes('liquidaciones')&&pdfText.includes(norm(expected.periodLabel)),'PDF_TITLE_PERIOD');ensure(preview.rows.every(row=>row.every(cell=>pdfText.includes(norm(cell)))),'PDF_ROW_CONTENT');const pages=doc.numPages;await doc.destroy();recordExport(pdf,{format:'ADMIN_PRINT_PDF',rows:eligible.length,pages,principalFingerprint:hash(staff.id),periodId:p.id,renderMode:'CHROMIUM_CAPTURE_OF_NATIVE_PRINT_OUTPUT_NOT_DOWNLOAD',textSha256:hash(texts.join(' '))});
      await admin.p.emulateMedia({media:'print'});await capture(admin.p,'admin-print-'+p.key);await admin.p.emulateMedia({media:'screen'});
      evidence.admin.push({periodId:p.id,eligibleRows:eligible.length,excludedRows:excluded.length,previewEqualsXlsx:true,printEqualsPreview:true,pdfAllCellsObserved:true,pages,previewSha256:hash(JSON.stringify(preview)),metaMatches:true});
      await admin.p.locator('.cx-modal [data-x]').last().click();
    }
    for(let i=0;i<cases.length;i++){
      const {actor,period}=cases[i],a=await newCtx();await visible(a.p,actor);await settle(a.p,actor.uid);await select(a.p,period.id,'beneficios');await a.p.locator('#benCurrentTable').waitFor();const before=await projection(a.p,'shopper');ensure(before.uid===actor.uid&&before.sid===actor.can&&before.role==='shopper','EXACT_SHOPPER_PRINCIPAL');ensure(before.rows.length>0&&before.rows.every(x=>x.shopperId===actor.can&&hrById.has(x.id)&&hrById.get(x.id).periodKey===period.key&&String(hrById.get(x.id).pais||hrById.get(x.id).country||'')===x.country),'INDEPENDENT_HR_ROW_SCOPE');
      const tableIds=await a.p.locator('#benCurrentTable tbody tr[data-ben-row]').evaluateAll(els=>els.map(x=>x.dataset.benRow));ensure(sorted(tableIds)===sorted(before.rows.map(x=>x.id)),'SHOPPER_TABLE_ROWS');
      const adm=adminByPeriod.get(period.id);ensure(before.rows.every(row=>adm.rows.some(x=>x.id===row.id&&x.country===row.country&&x.currency===row.currency&&Number(x.honorarium)===Number(row.honorarium)&&Number(x.reimbursement)===Number(row.reimbursement)&&Number(x.total)===Number(row.total)&&x.paid===row.paid)),'ADMIN_SHOPPER_ROW_PARITY');
      await csvDownload(a.p,before,actor,'actor-'+i+'-first');
      for(const [sel,key,values] of [['#benStatus','paid',['paid','pending']],['#benCountry','country',[actor.co]],['#benCurrency','currency',[...new Set(before.rows.map(x=>x.currency))].filter(Boolean)]])for(const val of values){ensure(await a.p.locator(sel+' option').evaluateAll((els,val)=>els.some(x=>x.value===val),val),'FILTER_OPTION_MISSING');await a.p.locator(sel).selectOption(val);const visibleIds=await a.p.locator('#benCurrentTable tbody tr[data-ben-row]').evaluateAll(els=>els.filter(x=>!x.hidden&&x.style.display!=='none').map(x=>x.dataset.benRow));const exp=before.rows.filter(x=>key==='paid'?(val==='paid'?x.paid:!x.paid):x[key]===val).map(x=>x.id);ensure(sorted(visibleIds)===sorted(exp),'FILTER_'+key);await a.p.locator(sel).selectOption('');}
      const firstRow=a.p.locator('#benCurrentTable [data-ben-row]').first(),detailId=await firstRow.getAttribute('data-ben-row'),detailExpected=before.rows.find(x=>x.id===detailId);await firstRow.click();const detail=await a.p.locator('.cx-modal').last().innerText();ensure(detailExpected&&norm(detail).includes(norm(detailExpected.branch)),'DETAIL');await a.p.locator('.cx-modal [data-x]').last().click();
      await a.p.reload({waitUntil:'domcontentloaded'});await settle(a.p,actor.uid);await select(a.p,period.id,'beneficios');const reloaded=await projection(a.p,'shopper');ensure(reloaded.uid===before.uid&&rowHash(reloaded.rows)===rowHash(before.rows),'RELOAD');await capture(a.p,'shopper-'+i+'-benefits');
      await a.p.evaluate(()=>window.CX.router.nav('liquidaciones'));const forbidden=await a.p.evaluate(()=>({route:window.CX?.session?.view,adminExport:!!document.querySelector('#liqExport')}));ensure(!forbidden.adminExport&&forbidden.route!=='liquidaciones','ADMIN_CONTROLS_DENIED');
      const foreign=actors.find(x=>x.uid!==actor.uid),acl=await a.p.evaluate(async({tenantId,shopperId})=>{try{await window.firebase.firestore().collection('tenants').doc(tenantId).collection('shopperBenefits').where('shopperId','==',shopperId).get({source:'server'});return'ALLOWED';}catch(e){return e.code||'UNKNOWN';}},{tenantId,shopperId:foreign.can});ensure(acl==='permission-denied','FOREIGN_BENEFIT_ACL');
      const empty=mostRecent.find(p=>!hrVisits.some(v=>(resolve(String(v.shopperId||''))||String(v.shopperId||''))===actor.can&&v.periodKey===p.key));if(empty){await select(a.p,empty.id,'beneficios');ensure((await projection(a.p,'shopper')).rows.length===0,'EMPTY_PERIOD_ROWS');const button=a.p.locator('#benDownloadReceipt');if(!await button.isDisabled()){const download=a.p.waitForEvent('download',{timeout:1200}).then(()=>true,()=>false);await button.click();await a.p.getByText('No hay beneficios del periodo para descargar',{exact:true}).waitFor({state:'visible'});ensure(!await download,'EMPTY_PERIOD_UNEXPECTED_DOWNLOAD');}evidence.checks.emptyPeriodHonest=true;}
      const b=await newCtx();await visible(b.p,actor);await settle(b.p,actor.uid);await select(b.p,period.id,'beneficios');const fresh=await projection(b.p,'shopper');ensure(fresh.uid===actor.uid&&rowHash(fresh.rows)===rowHash(before.rows),'NEW_SESSION');await csvDownload(b.p,fresh,actor,'actor-'+i+'-new');
      evidence.cases.push({principalFingerprint:hash(actor.uid),shopperFingerprint:hash(actor.can),periodId:period.id,periodKey:period.key,country:actor.co,rows:before.rows.length,currencies:[...new Set(before.rows.map(x=>x.currency))],rowHash:rowHash(before.rows),adminParity:true,hrRowKeysExact:true,filters:true,detail:true,reload:true,newSession:true,acl,adminControlsDenied:true,scope:'EXISTING_REAL_READ_ONLY'});r.readOnlyProof.currencyScopes.push(actor.co);
      await a.c.close();await b.c.close();
    }
    const endResponse=await fetch(host+'/api/'+encodeURIComponent(tenantId)+'/'+encodeURIComponent(projectId)+'/hr-live?format=meta&benefitsEnd='+Date.now(),{headers:{'cache-control':'no-cache'}});const endMeta=await endResponse.json();ensure(endResponse.ok&&endMeta.ok===true&&endMeta.revision===hrRevision&&endMeta.revisionStable===true,'END_HR_REVISION');evidence.checks.externalHrRevisionBeforeAndAfter=hrRevision;
    ensure(evidence.checks.emptyPeriodHonest===true,'EMPTY_PERIOD_NOT_OBSERVED');ensure(r.mutationEvidence.financialMutationRequestsObserved===0,'UNEXPECTED_FINANCIAL_MUTATION');
    Object.assign(r.readOnlyProof,{currencyScopes:[...new Set(r.readOnlyProof.currencyScopes)],currenciesSeparated:true,perRowParity:evidence.cases.every(x=>x.adminParity),periodIsolation:evidence.cases.every(x=>x.hrRowKeysExact),adminReviewRowsExcluded:evidence.admin.filter(x=>!x.exportSkippedHonest).every(x=>x.previewEqualsXlsx),roleSpecificUniversesPreserved:true,reloadProof:evidence.cases.every(x=>x.reload),samePrincipalAfterReload:true,newSessionParity:evidence.cases.every(x=>x.newSession),acl:{ownRowsOnly:true,adminControlsDenied:evidence.cases.every(x=>x.adminControlsDenied),foreignBenefitRead:evidence.cases.every(x=>x.acl==='permission-denied')?'permission-denied':'FAIL'},filtersAndDetail:evidence.cases.every(x=>x.filters&&x.detail),paymentSourceTruth:true,emptyPeriodHonest:true});
    const text=JSON.stringify(evidence,null,2)+'\n';fs.writeFileSync(path.join(out,'benefits-observed.json'),text);r.contractCoverage={fullDomain:true,obligations:BENEFITS_OBLIGATIONS.map(id=>({id,observed:true,evidenceRef:'benefits-observed.json',evidenceSha256:hash(text)}))};r.validation=validateBenefitsReadonlyReceipt(r,mod);r.decision=r.validation.pass?'PASS_I3_BENEFITS_READONLY_DOMAIN':'HOLD_I3_BENEFITS_READONLY_DOMAIN';
  }catch(e){const raw=String(e.message||e);r.error=raw.match(/^FUNCTIONAL_DEFECT:BENEFITS_[A-Z0-9_]+/)?.[0]||raw.match(/^(?:AUTH_FAILURE|RELEASE_COMPOSITION_FAILURE|MAPPING_FAILURE):[A-Z0-9_]+/)?.[0]||'ENVIRONMENT_FAILURE:BENEFITS_PROBE_EXCEPTION';r.errorSha256=hash(raw);r.failureClass=r.error.split(':')[0];}
  finally{for(const c of contexts)await c.close().catch(()=>{});fs.rmSync(privateDir,{recursive:true,force:true});fs.writeFileSync(path.join(out,'benefits-observed.json'),JSON.stringify(evidence,null,2)+'\n');fs.writeFileSync(path.join(out,'benefits-domain.json'),JSON.stringify(r,null,2)+'\n');}
  return r;
}
