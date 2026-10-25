#!/usr/bin/env node
/*
  CXOrbia Phase A R14 — reconcile a source-safe TyA financial-workbook extract
  against the live source-safe HR payload.

  This tool never reads the raw financial workbook, never emits shopper/store
  names, never writes providers, never imports, never executes payments and
  never touches production. It links only exact protected/composite candidates.
*/
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
function arg(name, fallback){ const i=args.indexOf(name); return i>=0 ? args[i+1] : fallback; }
const hrPath = arg('--hr', 'app/data/tya-hr-source-safe-periods.js');
const financialPath = arg('--financial', 'backend/config/phase-a-financial-workbook-source-safe-r14.json');
const outDir = arg('--out', '.tmp/phase-a-financial-r14-live-hr');

function readJsonOrJs(file){
  const text=fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'');
  if(path.extname(file).toLowerCase()==='.js'){
    const m=text.match(/=\s*(\{[\s\S]*\})\s*;?\s*$/);
    if(!m) throw new Error(`Could not parse JS assignment: ${file}`);
    return JSON.parse(m[1]);
  }
  return JSON.parse(text);
}
function norm(value){
  return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
}
function matchRef(value,prefix){
  const n=norm(value); if(!n) return '';
  return `${prefix}_${crypto.createHash('sha256').update(n).digest('hex').slice(0,16)}`;
}
function amount(value){
  if(value===null||value===undefined||value==='') return null;
  if(typeof value==='number' && Number.isFinite(value)) return Math.round(value*100)/100;
  const n=Number(String(value).replace(/[QL\s]/gi,'').replace(/,/g,'.').replace(/[^0-9.-]/g,''));
  return Number.isFinite(n)?Math.round(n*100)/100:null;
}
function dateIso(value){
  if(!value) return null;
  const text=String(value).trim();
  let m=text.match(/^(\d{4})-(\d{2})-(\d{2})/); if(m) return `${m[1]}-${m[2]}-${m[3]}`;
  m=text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/); if(m) return `${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
  const months={enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,julio:7,agosto:8,septiembre:9,setiembre:9,octubre:10,noviembre:11,diciembre:12};
  const n=norm(text); m=n.match(/(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})/);
  if(m && months[m[2]]) return `${m[3]}-${String(months[m[2]]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
  return null;
}
function key(parts){ return parts.map(v=>String(v??'')).join('|'); }
function indexPush(map,k,v){ const arr=map.get(k)||[]; arr.push(v); map.set(k,arr); }

const hr=readJsonOrJs(hrPath);
const financial=readJsonOrJs(financialPath);
if(hr.tenantId!=='tya'||hr.projectId!=='cinepolis'||financial.tenantId!=='tya'||financial.projectId!=='cinepolis') throw new Error('TyA/Cinepolis scope mismatch');
if(hr.sourceSafe!==true||financial.safeState?.sourceSafe!==true) throw new Error('Source-safe input required');

const visits=(hr.visits||[]).map(v=>{
  const expected=[amount(v.honorario),amount(v.boleto),amount(v.comboAmt)];
  const expectedTotal=expected.every(x=>x!==null)?Math.round(expected.reduce((a,b)=>a+b,0)*100)/100:null;
  return {...v,
    country:String(v.country||v.pais||'').toUpperCase(),
    locationMatchRef:matchRef(v.sucursal||v.shopping,'location_match'),
    realizedDate:dateIso(v.realizada),
    expectedTotal
  };
});

const strict=new Map(), noAmount=new Map(), noShopper=new Map(), noDate=new Map();
for(const v of visits){
  indexPush(strict,key([v.periodKey,v.country,v.shopperId,v.locationMatchRef,v.realizedDate,v.expectedTotal]),v);
  indexPush(noAmount,key([v.periodKey,v.country,v.shopperId,v.locationMatchRef,v.realizedDate]),v);
  indexPush(noShopper,key([v.periodKey,v.country,v.locationMatchRef,v.realizedDate,v.expectedTotal]),v);
  indexPush(noDate,key([v.periodKey,v.country,v.shopperId,v.locationMatchRef,v.expectedTotal]),v);
}

const statusCounts={};
const linked=[]; const review=[]; const importPayments=[];
function bump(s){statusCounts[s]=(statusCounts[s]||0)+1;}
for(const row of financial.liquidationControl?.records||[]){
  const exact=strict.get(key([row.periodKey,row.country,row.shopperIdSourceHash,row.locationMatchRef,row.visitDate,row.total]))||[];
  let candidates=exact, status='exact_composite_linked', method='period_country_shopper_ref_location_ref_visit_date_total';
  if(exact.length!==1){
    const a=noAmount.get(key([row.periodKey,row.country,row.shopperIdSourceHash,row.locationMatchRef,row.visitDate]))||[];
    const b=noShopper.get(key([row.periodKey,row.country,row.locationMatchRef,row.visitDate,row.total]))||[];
    const c=noDate.get(key([row.periodKey,row.country,row.shopperIdSourceHash,row.locationMatchRef,row.total]))||[];
    if(a.length===1){candidates=a;status='candidate_amount_mismatch';method='period_country_shopper_ref_location_ref_visit_date';}
    else if(b.length===1){candidates=b;status='candidate_shopper_ref_mismatch';method='period_country_location_ref_visit_date_total';}
    else if(c.length===1){candidates=c;status='candidate_visit_date_missing_or_mismatch';method='period_country_shopper_ref_location_ref_total';}
    else if(exact.length>1||a.length>1||b.length>1||c.length>1){candidates=[...exact,...a,...b,...c];status='ambiguous_composite_candidates';method='composite_candidate_union';}
    else {candidates=[];status='no_composite_candidate';method='none';}
  }
  const unique=candidates.length===1?candidates[0]:null;
  const accepted=status==='exact_composite_linked'&&unique;
  const record={
    sourceRecordId:row.sourceRecordId,periodKey:row.periodKey,country:row.country,currency:row.currency,
    visitDate:row.visitDate,honorario:row.honorario,boleto:row.boleto,combo:row.combo,total:row.total,
    visitId:accepted?unique.id:null,hrRowId:accepted?unique.hrRowId:null,paymentItemId:accepted?`payitem_tya_cinepolis_${String(unique.id).replace(/[^a-zA-Z0-9_-]+/g,'_')}`:null,
    expectedTotal:unique?.expectedTotal??null,matchStatus:status,matchMethod:method,candidateCount:candidates.length,
    reviewRequired:!accepted,sourceSafe:true,imported:false,production:false
  };
  linked.push(record);bump(status);
  if(accepted){
    importPayments.push({visitId:unique.id,hrRowId:unique.hrRowId,paymentItemId:record.paymentItemId,periodKey:row.periodKey,country:row.country,currency:row.currency,honorario:row.honorario,boleto:row.boleto,combo:row.combo,total:row.total,paymentState:'pending_financial_source',paymentSource:'controlled_financial_workbook_liquidation_control',sourceRecordId:row.sourceRecordId});
  }else{
    review.push({key:`r14_liquidation:${row.sourceRecordId}`,type:'liquidation_source_reconciliation',entityId:row.sourceRecordId,state:'pending_review',reasons:[status],candidateCount:candidates.length,sourceRef:`sha256:${financial.source.sha256}`,sourceSafe:true});
  }
}

const hrCounts={}; for(const v of visits){hrCounts[v.periodKey]??={GT:0,HN:0};hrCounts[v.periodKey][v.country]=(hrCounts[v.periodKey][v.country]||0)+1;}
const finCounts=financial.liquidationControl?.summary?.countsByPeriodCountry||{};
const coverage={};
for(const period of [...new Set([...Object.keys(hrCounts),...Object.keys(finCounts)])].sort()){
  coverage[period]={};
  for(const country of ['GT','HN']){
    const h=hrCounts[period]?.[country]||0, f=finCounts[period]?.[country]||0;
    const linkedCount=linked.filter(r=>r.periodKey===period&&r.country===country&&r.matchStatus==='exact_composite_linked').length;
    coverage[period][country]={hrVisits:h,financialRows:f,exactLinked:linkedCount,sourceCountGap:h-f,exactLinkGap:f-linkedCount};
  }
}

const ledgerCandidates=[];
for(const row of financial.expenseLedger?.itemizedRecords||[]){
  const sourceAmount=(row.paidAmount??0)>0?row.paidAmount:row.pendingAmount;
  const arr=noDate.get(key([row.periodKey,row.country,row.shopperIdSourceHash,row.locationMatchRef,sourceAmount]))||[];
  const unique=arr.length===1?arr[0]:null;
  const reasons=[];
  if(arr.length===0) reasons.push('no_exact_hr_candidate_by_period_country_shopper_location_amount');
  if(arr.length>1) reasons.push('ambiguous_hr_candidates_by_period_country_shopper_location_amount');
  if(!row.paymentDate && row.ledgerState==='paid_recorded') reasons.push('paid_at_missing');
  reasons.push('payment_batch_id_not_from_source');
  reasons.push('confirmed_by_not_from_source');
  ledgerCandidates.push({
    sourceRecordId:row.sourceRecordId,periodKey:row.periodKey,country:row.country,currency:row.currency,
    visitId:unique?.id||null,hrRowId:unique?.hrRowId||null,paymentState:row.ledgerState==='paid_recorded'?'paid':'pending_financial_source',
    paidAt:row.paymentDate||null,total:sourceAmount??null,paymentSource:'controlled_financial_workbook_expense_ledger',
    paymentBatchId:null,confirmedBy:null,matchMethod:'period_country_shopper_ref_location_ref_amount',candidateCount:arr.length,
    reviewRequired:true,reviewReasons:reasons,sourceSafe:true,imported:false,production:false
  });
  review.push({key:`r14_ledger:${row.sourceRecordId}`,type:'payment_evidence_reconciliation',entityId:unique?.id||row.sourceRecordId,state:'pending_review',reasons,sourceRef:`sha256:${financial.source.sha256}`,sourceSafe:true});
}
for(const item of financial.reviewQueue||[]) review.push(item);

const exact=statusCounts.exact_composite_linked||0;
const total=(financial.liquidationControl?.records||[]).length;
const decision=exact>0?'PASS_WITH_REVIEW_REAL_TYA_FINANCIAL_RECONCILIATION':'HOLD_NO_EXACT_REAL_TYA_LINKS';
const report={
  schemaVersion:'1.0.0',reportId:'phase-a-financial-live-hr-reconciliation-r14',generatedAt:new Date().toISOString(),decision,
  tenantId:'tya',projectId:'cinepolis',sourceWorkbookSha256:financial.source.sha256,hrGeneratedAt:hr.generatedAt||null,
  summary:{hrVisits:visits.length,financialLiquidationRows:total,exactCompositeLinked:exact,reviewLiquidationRows:total-exact,itemizedLedgerRows:ledgerCandidates.length,reviewQueue:review.length,statusCounts},
  coverageByPeriodCountry:coverage,
  liquidationCandidates:linked,
  ledgerPaymentEvidenceCandidates:ledgerCandidates,
  sourceQuality:financial.sourceQuality,
  safeState:{sourceSafe:true,piiOutput:false,rawWorkbookRead:false,rawWorkbookCommitted:false,providerReads:false,providerWrites:false,imports:false,paymentsExecuted:false,deploy:false,production:false}
};
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'financial-live-hr-reconciliation-r14.source-safe.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'financial-import-input-r14.source-safe.json'),JSON.stringify({payments:importPayments,sourceSafe:true,imported:false,production:false},null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'ledger-payment-evidence-candidates-r14.source-safe.json'),JSON.stringify({payments:ledgerCandidates,sourceSafe:true,imported:false,production:false},null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'review-queue-r14.source-safe.json'),JSON.stringify(review,null,2)+'\n','utf8');
const md=[
  '# Phase A R14 — conciliación financiera TyA contra HR viva', '',
  `Decisión: **${decision}**`, '',
  `- Visitas HR source-safe: ${visits.length}`,
  `- Filas reales de control de liquidación: ${total}`,
  `- Enlaces compuestos exactos: ${exact}`,
  `- Filas de liquidación en revisión: ${total-exact}`,
  `- Evidencias itemizadas de libro financiero: ${ledgerCandidates.length}`,
  `- Cola de revisión total: ${review.length}`,'',
  '## Estado seguro','',
  '- Sin nombres de shoppers o tiendas en salida.',
  '- Sin lectura del workbook crudo en CI.',
  '- Sin writes Firebase/HR, import, pagos, deploy ni producción.','',
  '## Uso operativo','',
  '- Los enlaces exactos crean candidatos de liquidación vinculados a `visitId/hrRowId`.',
  '- `liquidada` o día planificado no se convierten en pago.',
  '- Evidencia de ledger permanece en revisión hasta tener lote/actor/fecha y enlace estable suficientes.',''
].join('\n');
fs.writeFileSync(path.join(outDir,'financial-live-hr-reconciliation-r14.source-safe.md'),md,'utf8');
console.log(JSON.stringify({decision,summary:report.summary,safeState:report.safeState},null,2));
