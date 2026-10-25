#!/usr/bin/env node
import { buildStableVisitId, stableVisitIdentityVersion } from '../hr-source/tya-stable-visit-id-r20.mjs';

const blockers=[];
const add=(code,detail='')=>blockers.push(detail?`${code}:${detail}`:code);
const base={tenantId:'tya',projectId:'cinepolis',periodKey:'2026-06',country:'HN',sourceRow:7};
const id1=buildStableVisitId({...base,cinemaId:'001',shopping:'Sucursal A',quincena:'1',franja:'WK'});
const id2=buildStableVisitId({...base,cinemaId:'999',shopping:'Sucursal corregida',quincena:'2',franja:'WKND'});
if(id1!==id2)add('mutable_fields_changed_visit_id',`${id1}/${id2}`);
const variants=[
  buildStableVisitId({...base,sourceRow:8}),
  buildStableVisitId({...base,periodKey:'2026-05'}),
  buildStableVisitId({...base,country:'GT'}),
  buildStableVisitId({...base,projectId:'otro'})
];
for(const value of variants)if(value===id1)add('distinct_identity_collision',value);
if(!/^hr_2026-06_hn_7_[0-9a-f]{10}$/.test(id1))add('id_format_invalid',id1);
let invalidAccepted=false;
try{buildStableVisitId({...base,sourceRow:0});invalidAccepted=true;}catch{}
if(invalidAccepted)add('invalid_row_accepted');
const report={
  ok:blockers.length===0,
  decision:blockers.length?'HOLD_TYA_STABLE_VISIT_ID_R20':'PASS_TYA_STABLE_VISIT_ID_R20',
  version:stableVisitIdentityVersion(),
  sample:id1,
  blockers,
  safeState:{sourceSafe:true,repositoryWrites:false,dataWrites:false,deploy:false,production:false}
};
console.log(JSON.stringify(report,null,2));
if(blockers.length)process.exit(1);
