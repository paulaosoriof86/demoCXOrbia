import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';

const source=process.env.FOCAL_SOURCE;
const tree=process.env.FOCAL_TREE;
const out=process.env.VRM249_OUT || '.tmp/i3-vrm249-source';
const descriptor=JSON.parse(readFileSync(process.env.CANDIDATE_DESCRIPTOR || 'CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
const predecessor=descriptor.predecessorProductSourceSha;
const expectedSource='9d948a6a1b506b75b93cb1b023603cd6cd6d357f';
const expectedTree='638ab7ab63244286ff460205da441221d5957ef0';
const expectedPredecessor='a03d61afe9b33d01647bb4d58542e87d1496d3d7';
const productPaths=['app','backend','firebase.json','.firebaserc','firestore.rules','storage.rules','tools/hr-source',':(exclude)backend/runtime/hr-live-service/test/**'];

const run=(args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const ok=(v,m)=>{if(!v)throw new Error(m);};

ok(predecessor===expectedPredecessor,'Unexpected predecessor');
ok(source===expectedSource,'Unexpected focal source');
ok(tree===expectedTree,'Unexpected focal tree');
ok(run(['rev-parse',source+'^{tree}'])===tree,'Source/tree mismatch');
execFileSync('git',['merge-base','--is-ancestor',predecessor,source],{stdio:'inherit'});
const changed=run(['diff','--name-only',predecessor,source,'--',...productPaths]).split(/\r?\n/).filter(Boolean).sort();
const expected=['app/adapters/tya-protected-auth-hr-authority-bridge-v2.js','app/core/backend-firebase.js'].sort();
ok(JSON.stringify(changed)===JSON.stringify(expected),'VRM249 product diff is not exactly the two authorized owners');
const drift=spawnSync('git',['diff','--quiet',source,'HEAD','--',...productPaths],{stdio:'inherit'});
ok(drift.status===0,'Unexpected product drift after focal source');

for(const p of expected) execFileSync('node',['--check',p],{stdio:'inherit'});
const firebase=readFileSync('app/core/backend-firebase.js','utf8');
const bridge=readFileSync('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js','utf8');
for(const marker of [
  'async function loadReservationsForPrincipal(projectId, ctx)',
  'reservations:(state&&state.reservations)||[]',
  'CX.data.__protectedReservations = state.reservations || []',
  'CX.data.__protectedReservations = safeState.reservations || []'
]) ok(firebase.includes(marker),'Missing backend-firebase marker: '+marker);
ok(bridge.includes('reservations:clone(b.reservations||[])'),'Missing bridge reservation marker');

const result={
  decision:'PASS_VRM249_RESERVATIONS_READ_MODEL_SOURCE_REPROOF',
  sourceSha:source,
  sourceTree:tree,
  predecessorSourceSha:predecessor,
  productFilesChanged:expected,
  reservationsLoadedByAuthorizedBackend:true,
  reservationsPublishedInAuthorizedState:true,
  reservationsAppliedToProtectedReadModel:true,
  bridgeUsesAuthorizedReservationState:true,
  builds:0,
  deploys:0,
  production:false
};
mkdirSync(out,{recursive:true});
writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
