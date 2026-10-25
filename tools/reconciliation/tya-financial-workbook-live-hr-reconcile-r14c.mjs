#!/usr/bin/env node
/*
  CXOrbia Phase A R14C — recover exact protected financial links when the
  source-safe HR snapshot omits realizedAt and honorario but retains stable
  shopperId, location, boleto and combo amounts.

  Safe by construction:
  - source-safe inputs only;
  - no names or document fields in output;
  - no provider reads/writes;
  - no imports, payment execution, deploy or production;
  - ambiguous candidates remain in reviewQueue.
*/
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
function arg(name, fallback){ const i=args.indexOf(name); return i>=0 ? args[i+1] : fallback; }
const hrPath = arg('--hr', 'app/data/tya-hr-source-safe-periods.js');
const financialPath = arg('--financial', 'backend/config/phase-a-financial-workbook-source-safe-r14.json');
const outDir = arg('--out', '.tmp/phase-a-financial-r14c-live-hr');

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
  return null;
}
function key(parts){ return parts.map(v=>String(v??'')).join('|'); }
function indexPush(map,k,v){ const arr=map.get(k)||[]; arr.push(v); map.set(k,arr); }
function uniqueObjects(items, field='id'){
  const seen=new Set(); const out=[];
  for(const item of items){ const k=String(item?.[field]??''); if(!k||seen.has(k)) continue; seen.add(k); out.push(item); }
  return out;
}

const hr=readJsonOrJs(hrPath);
const financial=readJsonOrJs(financialPath);
if(hr.tenantId!=='tya'||hr.projectId!=='cinepolis'||financial.tenantId!=='tya'||financial.projectId!=='cinepolis') throw new Error('TyA/Cinepolis scope mismatch');
if(hr.sourceSafe!==true||financial.safeState?.sourceSafe!==true) throw new Error('Source-safe input required');

const visits=(hr.visits||[]).map(v=>{
  const honorario=amount(v.honorario);
  const boleto=amount(v.boleto);
  const combo=amount(v.comboAmt);
  const expectedTotal=[honorario,boleto,combo].every(x=>x!==null)
    ? Math.round((honorario+boleto+combo)*100)/100 : null;
  const operationalSubtotal=[boleto,combo].every(x=>x!==null)
    ? Math.round((boleto+combo)*100)/100 : null;
  return {...v,
    country:String(v.country||v.pais||'').toUpperCase(),
    locationMatchRef:matchRef(v.sucursal||v.shopping,'location_match'),
    realizedDate:dateIso(v.realizada),
    honorarioAmount:honorario,
    boletoAmount:boleto,
    comboAmount:combo,
    expectedTotal,
    operationalSubtotal
  };
});

const strict=new Map();
const protectedOperational=new Map();
const protectedBase=new Map();
const locationOperational=new Map();
for(const v of visits){
  indexPush(strict,key([v.periodKey,v.country,v.shopperId,v.locationMatchRef,v.realizedDate,v.expectedTotal]),v);
  indexPush(protectedOperational,key([v.periodKey,v.country,v.shopperId,v.locationMatchRef,v.boletoAmount,v.comboAmount]),v);
  indexPush(protectedBase,key([v.periodKey,v.country,v.shopperId,v.locationMatchRef]),v);
  indexPush(locationOperational,key([v.periodKey,v.country,v.locationMatchRef,v.boletoAmount,v.comboAmount]),v);
}

const statusCounts={};
const linked=[]; const review=[]; const importPayments=[];
const linkedByFinancialIdentity=new Map();
function bump(s){statusCounts[s]=(statusCounts[s]||0)+1;}
function acceptedStatus(status){ return status==='exact_full_composite_linked'||status==='exact_protected_operational_linked'; }

for(const row of financial.liquidationControl?.records||[]){
  const exactFull=strict.get(key([row.periodKey,row.country,row.shopperIdSourceHash,row.locationMatchRef,row.visitDate,row.total]))||[];
  const exactOperational=protectedOperational.get(key([row.periodKey,row.country,row.shopperIdSourceHash,row.locationMatchRef,row.boleto,row.combo]))||[];
  const base=protectedBase.get(key([row.periodKey,row.country,row.shopperIdSourceHash,row.locationMatchRef]))||[];
  const locAmount=locationOperational.get(key([row.periodKey,row.country,row.locationMatchRef,row.boleto,row.combo]))||[];

  let candidates=[]; let status='no_protected_operational_candidate'; let method='none';
  if(exactFull.length===1){
    candidates=exactFull; status='exact_full_composite_linked'; method='period_country_shopper_ref_location_ref_visit_date_total';
  }else if(exactOperational.length===1){
    candidates=exactOperational; status='exact_protected_operational_linked'; method='period_country_shopper_ref_location_ref_boleto_combo';
  }else if(exactFull.length>1||exactOperational.length>1){
    candidates=uniqueObjects([...exactFull,...exactOperational]);
    status='ambiguous_exact_protected_candidates';
    method='full_or_operational_exact_union';
  }else if(base.length===1){
    candidates=base; status='candidate_amount_or_hr_detail_mismatch'; method='period_country_shopper_ref_location_ref';
  }else if(locAmount.length===1){
    candidates=locAmount; status='candidate_shopper_ref_mismatch'; method='period_country_location_ref_boleto_combo';
  }else if(base.length>1||locAmount.length>1){
    candidates=uniqueObjects([...base,...locAmount]);
    status='ambiguous_protected_base_candidates';
    method='protected_base_candidate_union';
  }

  const unique=candidates.length===1?candidates[0]:null;
  const accepted=Boolean(unique&&acceptedStatus(status));
  const record={
    sourceRecordId:row.sourceRecordId,periodKey:row.periodKey,country:row.country,currency:row.currency,
    visitDate:row.visitDate,honorario:row.honorario,boleto:row.boleto,combo:row.combo,total:row.total,
    visitId:accepted?unique.id:null,hrRowId:accepted?unique.hrRowId:null,
    paymentItemId:accepted?`payitem_tya_cinepolis_${String(unique.id).replace(/[^a-zA-Z0-9_-]+/g,'_')}`:null,
    hrRealizedDateAvailable:Boolean(unique?.realizedDate),
    hrHonorarioAvailable:unique?.honorarioAmount!==null&&unique?.honorarioAmount!==undefined,
    hrBoletoComboAvailable:Boolean(unique&&unique.boletoAmount!==null&&unique.comboAmount!==null),
    matchStatus:status,matchMethod:method,candidateCount:candidates.length,
    reviewRequired:!accepted,sourceSafe:true,imported:false,production:false
  };
  linked.push(record); bump(status);
  if(accepted){
    importPayments.push({
      visitId:unique.id,hrRowId:unique.hrRowId,paymentItemId:record.paymentItemId,
      periodKey:row.periodKey,country:row.country,currency:row.currency,
      honorario:row.honorario,boleto:row.boleto,combo:row.combo,total:row.total,
      paymentState:'pending_financial_source',
      paymentSource:'controlled_financial_workbook_liquidation_control',
      sourceRecordId:row.sourceRecordId
    });
    indexPush(linkedByFinancialIdentity,key([row.periodKey,row.country,row.shopperIdSourceHash,row.locationMatchRef,row.total]),{row,visit:unique,record});
  }else{
    review.push({
      key:`r14c_liquidation:${row.sourceRecordId}`,type:'liquidation_source_reconciliation',
      entityId:row.sourceRecordId,state:'pending_review',reasons:[status],
      candidateCount:candidates.length,sourceRef:`sha256:${financial.source.sha256}`,sourceSafe:true
    });
  }
}

const ledgerCandidates=[];
let ledgerVisitLinked=0;
for(const row of financial.expenseLedger?.itemizedRecords||[]){
  const sourceAmount=(row.paidAmount??0)>0?row.paidAmount:row.pendingAmount;
  const linkedLiquidations=linkedByFinancialIdentity.get(key([row.periodKey,row.country,row.shopperIdSourceHash,row.locationMatchRef,sourceAmount]))||[];
  const unique=linkedLiquidations.length===1?linkedLiquidations[0]:null;
  const reasons=[];
  if(linkedLiquidations.length===0) reasons.push('no_exact_linked_liquidation_by_protected_identity_and_total');
  if(linkedLiquidations.length>1) reasons.push('ambiguous_linked_liquidations_by_protected_identity_and_total');
  if(!row.paymentDate && row.ledgerState==='paid_recorded') reasons.push('paid_at_missing');
  reasons.push('payment_batch_id_not_from_source');
  reasons.push('confirmed_by_not_from_source');
  if(unique) ledgerVisitLinked++;
  ledgerCandidates.push({
    sourceRecordId:row.sourceRecordId,periodKey:row.periodKey,country:row.country,currency:row.currency,
    visitId:unique?.visit?.id||null,hrRowId:unique?.visit?.hrRowId||null,
    paymentState:row.ledgerState==='paid_recorded'?'paid':'pending_financial_source',
    paidAt:row.paymentDate||null,total:sourceAmount??null,
    paymentSource:'controlled_financial_workbook_expense_ledger',
    paymentBatchId:null,confirmedBy:null,
    matchMethod:'linked_liquidation_period_country_shopper_ref_location_ref_total',
    candidateCount:linkedLiquidations.length,reviewRequired:true,reviewReasons:reasons,
    sourceSafe:true,imported:false,production:false
  });
  review.push({
    key:`r14c_ledger:${row.sourceRecordId}`,type:'payment_evidence_reconciliation',
    entityId:unique?.visit?.id||row.sourceRecordId,state:'pending_review',
    reasons,sourceRef:`sha256:${financial.source.sha256}`,sourceSafe:true
  });
}
for(const item of financial.reviewQueue||[]) review.push(item);

const total=(financial.liquidationControl?.records||[]).length;
const accepted=linked.filter(r=>acceptedStatus(r.matchStatus)).length;
const exactFull=statusCounts.exact_full_composite_linked||0;
const exactOperational=statusCounts.exact_protected_operational_linked||0;
const hr2026=visits.filter(v=>/^2026-0[1-6]$/.test(v.periodKey));
const dataAvailability={
  hrVisitsJanJun2026:hr2026.length,
  realizedDateAvailable:hr2026.filter(v=>Boolean(v.realizedDate)).length,
  honorarioAvailable:hr2026.filter(v=>v.honorarioAmount!==null).length,
  boletoComboAvailable:hr2026.filter(v=>v.boletoAmount!==null&&v.comboAmount!==null).length
};

const hrCounts={}; for(const v of visits){hrCounts[v.periodKey]??={GT:0,HN:0};hrCounts[v.periodKey][v.country]=(hrCounts[v.periodKey][v.country]||0)+1;}
const finCounts=financial.liquidationControl?.summary?.countsByPeriodCountry||{};
const coverage={};
for(const period of [...new Set([...Object.keys(hrCounts),...Object.keys(finCounts)])].sort()){
  coverage[period]={};
  for(const country of ['GT','HN']){
    const h=hrCounts[period]?.[country]||0, f=finCounts[period]?.[country]||0;
    const linkedCount=linked.filter(r=>r.periodKey===period&&r.country===country&&acceptedStatus(r.matchStatus)).length;
    coverage[period][country]={hrVisits:h,financialRows:f,exactLinked:linkedCount,sourceCountGap:h-f,exactLinkGap:f-linkedCount};
  }
}

const decision=accepted>0?'PASS_WITH_REVIEW_REAL_TYA_FINANCIAL_RECONCILIATION_R14C':'HOLD_NO_EXACT_REAL_TYA_LINKS_R14C';
const report={
  schemaVersion:'1.0.0',reportId:'phase-a-financial-live-hr-reconciliation-r14c',
  generatedAt:new Date().toISOString(),decision,tenantId:'tya',projectId:'cinepolis',
  sourceWorkbookSha256:financial.source.sha256,hrGeneratedAt:hr.generatedAt||null,
  summary:{
    hrVisits:visits.length,financialLiquidationRows:total,exactAcceptedLinks:accepted,
    exactFullCompositeLinked:exactFull,exactProtectedOperationalLinked:exactOperational,
    reviewLiquidationRows:total-accepted,itemizedLedgerRows:ledgerCandidates.length,
    ledgerRowsLinkedToVisit:ledgerVisitLinked,reviewQueue:review.length,statusCounts
  },
  dataAvailability,coverageByPeriodCountry:coverage,
  liquidationCandidates:linked,ledgerPaymentEvidenceCandidates:ledgerCandidates,
  safeState:{
    sourceSafe:true,piiOutput:false,rawWorkbookRead:false,rawWorkbookCommitted:false,
    providerReads:false,providerWrites:false,imports:false,paymentsExecuted:false,
    deploy:false,production:false
  }
};
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'financial-live-hr-reconciliation-r14c.source-safe.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'financial-import-input-r14c.source-safe.json'),JSON.stringify({payments:importPayments,sourceSafe:true,imported:false,production:false},null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'ledger-payment-evidence-candidates-r14c.source-safe.json'),JSON.stringify({payments:ledgerCandidates,sourceSafe:true,imported:false,production:false},null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'review-queue-r14c.source-safe.json'),JSON.stringify(review,null,2)+'\n','utf8');
const md=[
  '# Phase A R14C — conciliación financiera real TyA contra HR viva', '',
  `Decisión: **${decision}**`, '',
  `- Visitas HR source-safe: ${visits.length}`,
  `- Filas reales control liquidación: ${total}`,
  `- Enlaces exactos aceptados: ${accepted}`,
  `- Enlaces full composite: ${exactFull}`,
  `- Enlaces protected operational: ${exactOperational}`,
  `- Filas liquidación en revisión: ${total-accepted}`,
  `- Evidencias ledger itemizadas: ${ledgerCandidates.length}`,
  `- Evidencias ledger vinculadas a visita: ${ledgerVisitLinked}`,
  `- Cola de revisión: ${review.length}`, '',
  '## Disponibilidad HR enero-junio 2026','',
  `- visitas: ${dataAvailability.hrVisitsJanJun2026}`,
  `- fecha realizada disponible: ${dataAvailability.realizedDateAvailable}`,
  `- honorario disponible: ${dataAvailability.honorarioAvailable}`,
  `- boleto+combo disponibles: ${dataAvailability.boletoComboAvailable}`, '',
  '## Regla operativa segura','',
  '- Cuando fecha realizada y honorario faltan en HR source-safe, se admite solo enlace único por periodo+país+shopperId protegido+sucursal protegida+boleto+combo.',
  '- Ambigüedades, diferencias de montos y evidencias de pago incompletas permanecen en reviewQueue.',
  '- Liquidada o día planificado no equivale a pagada.',
  '- Sin writes, import real, pagos, deploy ni producción.',''
].join('\n');
fs.writeFileSync(path.join(outDir,'financial-live-hr-reconciliation-r14c.source-safe.md'),md,'utf8');
console.log(JSON.stringify({decision,summary:report.summary,dataAvailability,safeState:report.safeState},null,2));
