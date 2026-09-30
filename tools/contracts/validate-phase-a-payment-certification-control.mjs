import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const payment=JSON.parse(fs.readFileSync(path.join(root,'backend/contracts/phase-a-liquidation-payment-control-v1.json'),'utf8'));
const cert=JSON.parse(fs.readFileSync(path.join(root,'backend/contracts/phase-a-certification-carryover-control-v1.json'),'utf8'));
const fixture=JSON.parse(fs.readFileSync(path.join(here,'fixtures/phase-a-payment-certification-control-fixture.json'),'utf8'));

const required=(obj,fields)=>fields.every(k=>obj[k]!==undefined&&obj[k]!==null&&obj[k]!=='');
const validatePayment=r=>{
  let valid=payment.paymentStates.includes(r.paymentState);
  let paid=false;
  const reasons=[];
  if(!valid) reasons.push('invalid_payment_state');
  if(r.paymentState==='paid'){
    if(!required(r,payment.requiredForPaid)){valid=false;reasons.push('missing_paid_fields');}
    if(r.paidAt&&r.realizedAt&&r.paidAt===r.realizedAt){valid=false;reasons.push('realized_at_used_as_paid_at');}
    paid=valid;
  }
  if(r.visitState==='liquidated'&&r.paymentState!=='paid') paid=false;
  return {valid,paid,reasons};
};
const validateCertification=r=>{
  let valid=cert.states.includes(r.state);
  const reasons=[];
  if(!valid) reasons.push('invalid_certification_state');
  if(r.state==='carried_over'&&!required(r,cert.requiredForCarryover)){valid=false;reasons.push('missing_carryover_fields');}
  const eligible=valid&&cert.eligibility.eligibleStates.includes(r.state);
  return {valid,eligible,reasons};
};
const results=[];
for(const c of fixture.paymentCases){
  const actual=validatePayment(c.record);
  const pass=actual.valid===c.expected.valid&&actual.paid===c.expected.paid;
  results.push({domain:'payment',id:c.id,pass,expected:c.expected,actual});
}
for(const c of fixture.certificationCases){
  const actual=validateCertification(c.record);
  const pass=actual.valid===c.expected.valid&&actual.eligible===c.expected.eligible;
  results.push({domain:'certification',id:c.id,pass,expected:c.expected,actual});
}
const report={
  ok:results.every(x=>x.pass),
  generatedAt:new Date().toISOString(),
  contracts:[payment.contract,cert.contract],
  cases:results,
  safety:{writes:false,providers:false,production:false,pii:false}
};
fs.writeFileSync(path.join(root,'PHASE-A-PAYMENT-CERTIFICATION-CONTROL-VALIDATION.json'),JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify(report,null,2));
if(!report.ok)process.exit(1);
