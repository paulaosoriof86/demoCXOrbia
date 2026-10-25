#!/usr/bin/env node
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

const str=v=>String(v==null?'':v).trim();
const projectId=process.env.PROJECT||process.env.GOOGLE_CLOUD_PROJECT||'cxorbia-backend-dev';
const tenantId=process.env.TENANT_ID||'tya';
const programId=process.env.PROJECT_ID||'cinepolis';
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId});
const db=getFirestore();

const ym=v=>{const m=str(v).match(/(20\d{2})[-_/](0[1-9]|1[0-2])/);return m?m[1]+'-'+m[2]:'';};
const country=v=>{const x=str(v).toUpperCase();if(x==='GT'||x.includes('GUATEMALA'))return 'GT';if(x==='HN'||x.includes('HONDURAS'))return 'HN';return '';};
const statusFor=(period,c)=>{
  if(!period||!c)return '';
  if(period<='2026-07')return 'paid';
  if(period==='2026-08')return c==='HN'?'paid':c==='GT'?'pending':'';
  if(period==='2026-09')return ['GT','HN'].includes(c)?'pending':'';
  return '';
};
const snap=await db.collection('tenants').doc(tenantId).collection('projects').doc(programId).collection('visits').get();
const groups=new Map(),ambiguous=[],eligible=[];
for(const doc of snap.docs){
  const v=doc.data()||{},period=ym(v.periodId||v.periodo||v.period||v.projectPeriodId),c=country(v.pais||v.country);
  const expected=statusFor(period,c);
  if(!expected)continue; // Oct and out-of-scope untouched.
  const fm=v.financialMatch||{},shopperId=str(v.shopperId||v.shopper?.id),currency=str(fm.currency||fm.moneda||v.currency||v.moneda);
  const amount=Number(fm.total),exact=str(v.financialSourceStatus).toLowerCase()==='reconciled_exact'&&str(fm.status).toLowerCase()==='reconciled_exact'&&Number.isFinite(amount)&&amount>=0;
  if(!shopperId||!currency||!exact){
    ambiguous.push({visitId:str(v.id||v.visitId||doc.id),hrRowId:str(v.hrRowId)||null,period,country:c,shopperId:shopperId||null,currency:currency||null,reason:!shopperId?'SHOPPER_ID_MISSING':!currency?'CURRENCY_MISSING':'EXACT_FINANCIAL_MATCH_REQUIRED'});
    continue;
  }
  const row={visitId:str(v.id||v.visitId||doc.id),hrRowId:str(v.hrRowId)||null,period,country:c,currency,shopperId,amount,paymentStatus:expected};
  eligible.push(row);
  const key=[period,c,currency,shopperId,expected].join('|');
  const g=groups.get(key)||{period,country:c,currency,shopperId,paymentStatus:expected,count:0,amount:0,visitIds:[]};
  g.count++;g.amount+=amount;g.visitIds.push(row.visitId);groups.set(key,g);
}
const grouped=[...groups.values()].sort((a,b)=>[a.period,a.country,a.currency,a.shopperId].join('|').localeCompare([b.period,b.country,b.currency,b.shopperId].join('|')));
const totals=grouped.reduce((o,g)=>{const k=[g.period,g.country,g.currency,g.paymentStatus].join('|');const x=o[k]||(o[k]={period:g.period,country:g.country,currency:g.currency,paymentStatus:g.paymentStatus,count:0,amount:0});x.count+=g.count;x.amount+=g.amount;return o;},{});
const result={
 decision:ambiguous.length?'HOLD_VRM151_HISTORICAL_RECONCILIATION_AMBIGUOUS':'PASS_VRM151_HISTORICAL_RECONCILIATION_DRY_RUN',
 scope:{paid:['<=2026-07 GT+HN','2026-08 HN'],pending:['2026-08 GT','2026-09 GT+HN'],untouched:['2026-10']},
 project:{tenantId,projectId:programId},readDocuments:snap.size,eligibleCount:eligible.length,ambiguousCount:ambiguous.length,
 grouped,totals:Object.values(totals),ambiguous,
 writes:0,hrWrites:0,bankWrites:0,production:false
};
process.stdout.write(JSON.stringify(result,null,2)+'\n');
if(ambiguous.length)process.exitCode=2;
