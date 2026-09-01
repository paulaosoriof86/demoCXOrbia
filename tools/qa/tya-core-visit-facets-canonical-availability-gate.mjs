import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';

const args=process.argv.slice(2);
const valueOf=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0&&args[i+1]?args[i+1]:fallback;};
const repo=path.resolve(valueOf('--repo','.'));
const dataPath=path.join(repo,'app/core/data.js');

function fail(code,detail={}){
  console.error(JSON.stringify({decision:`HOLD_${code}`,detail,safeState:{writes:false,deploy:false,production:false}},null,2));
  process.exit(1);
}

if(!fs.existsSync(dataPath)) fail('I3_GATE5_DATA_JS_MISSING',{dataPath});
const source=fs.readFileSync(dataPath,'utf8');
const marker='  visitFacets(v){';
const start=source.indexOf(marker);
if(start<0) fail('I3_GATE5_VISIT_FACETS_MISSING');
const next=source.indexOf('\n  visitBucketFns:',start);
if(next<0) fail('I3_GATE5_VISIT_BUCKET_BOUNDARY_MISSING');
let block=source.slice(start,next).trim();
if(block.endsWith(',')) block=block.slice(0,-1);
let holder;
try{ holder=vm.runInNewContext(`({${block}})`,Object.create(null),{timeout:1000}); }
catch(error){ fail('I3_GATE5_VISIT_FACETS_EVAL_FAILED',{message:String(error?.message||error)}); }
const visitFacets=holder?.visitFacets;
if(typeof visitFacets!=='function') fail('I3_GATE5_VISIT_FACETS_NOT_FUNCTION');

const cases=[
  {
    id:'canonical_out_of_range_available',
    input:{shopperId:null,estado:'fuera_rango',canonicalFacets:{available:true,eligibilityBlocked:false,assigned:false,scheduled:false,realized:false,questionnaire:false,submitted:false,outOfRange:true,cancelled:false}},
    assert:r=>r.available===true&&r.eligibilityBlocked===false&&r.assigned===false&&r.outOfRange===true
  },
  {
    id:'canonical_blocked_over_text_available',
    input:{shopperId:null,estado:'disponible',canonicalFacets:{available:false,eligibilityBlocked:true,assigned:false,scheduled:false,realized:false,questionnaire:false,submitted:false,outOfRange:false,cancelled:false}},
    assert:r=>r.available===false&&r.eligibilityBlocked===true&&r.assigned===false
  },
  {
    id:'canonical_assigned',
    input:{shopperId:'legacy-stale-id',estado:'asignada',canonicalFacets:{available:false,eligibilityBlocked:false,assigned:true,scheduled:false,realized:false,questionnaire:false,submitted:false,outOfRange:false,cancelled:false}},
    assert:r=>r.available===false&&r.assigned===true
  },
  {
    id:'synthetic_post_builder_unassigned_available',
    input:{shopperId:null,shopper:null,estado:'disponible',canonicalFacets:{available:true,eligibilityBlocked:false,assigned:false,scheduled:false,realized:false,questionnaire:false,submitted:false,outOfRange:false,cancelled:false}},
    assert:r=>r.available===true&&r.eligibilityBlocked===false&&r.assigned===false
  },
  {
    id:'legacy_shape_preserved',
    input:{shopperId:'legacy-shopper',agendada:'2026-09-02',estado:'agendada'},
    assert:r=>r.assigned===true&&r.scheduled===true&&r.realized===false&&r.questionnaire===false&&r.submitted===false&&r.outOfRange===false&&r.cancelled===false&&!Object.prototype.hasOwnProperty.call(r,'available')&&!Object.prototype.hasOwnProperty.call(r,'eligibilityBlocked')
  }
];

const results=[];
for(const test of cases){
  const result=visitFacets(test.input);
  const pass=Boolean(test.assert(result));
  results.push({id:test.id,pass,result});
  if(!pass) fail('I3_GATE5_CORE_CANONICAL_AVAILABILITY_BRIDGE',{case:test.id,result});
}

console.log(JSON.stringify({
  decision:'PASS_I3_GATE5_CORE_CANONICAL_AVAILABILITY_BRIDGE',
  implementation:'app/core/data.js::visitFacets',
  realImplementationExtracted:true,
  cases:results,
  safeState:{writes:false,deploy:false,production:false,realData:false}
},null,2));
