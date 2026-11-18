import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {evaluateTerminalModuleTruth} from './cxorbia-i3-c3-finalize-module-truth.mjs';

const SHA='a'.repeat(40), TREE='b'.repeat(40), HR='c'.repeat(64), DIGEST='sha256:'+'d'.repeat(64), HASH='e'.repeat(64);
const hash=s=>crypto.createHash('sha256').update(String(s)).digest('hex');
const registry=JSON.parse(fs.readFileSync('CXORBIA_CANONICAL_MODULE_REGISTRY_2026-09-18.json','utf8'));
const DOMAINS=[...registry.modules.map(x=>x.domain),'tenant-admin-config-branding'];
const TYPES={read:'historical',shell:'base-router-shell-cache',write:'finance-core-liquidation-costs',auth:'auth-protected-data-runtime',ui:'dashboard-operation'};
const OWNERS={read:'app/core/historical-proof.js',shell:'app/core/shell-proof.js',write:'app/modules/finance-proof.js',auth:'app/core/auth-proof.js',ui:'app/modules/dashboard-proof.js'};
const BLOBS=Object.fromEntries(Object.entries(OWNERS).map(([k])=>[k,(k==='read'?'1':k==='shell'?'5':k==='write'?'2':k==='auth'?'3':'4').repeat(40)]));
const CONTRACTS={read:'Historical/ProtectedRead',shell:'Release/Visual/Security',write:'País/moneda/Persistencia/ACK',auth:'Auth/Identidad/Seguridad',ui:'Operación/HR/Visual'};

function fixture(type='read',options={}){
  const types=Array.isArray(type)?type:[type],requiredIds=options.requiredIds||null;
  const modules=DOMAINS.map(domain=>{
    const idx=types.find(t=>TYPES[t]===domain);
    return {domain,classification:idx?'SOURCE_FIXED_DEV_MATERIALIZED_PENDING_LIVE_E2E_HUMAN':'MATCH',
      owners:idx?[OWNERS[idx]]:[],pendingTerminalFiles:[],
      contractFunctional:idx?CONTRACTS[idx]:'',
      currentOwnerBlobs:idx?{[OWNERS[idx]]:BLOBS[idx]}:{},
      ...(idx&&requiredIds?{terminalRequiredObligationIds:requiredIds}: {})};
  });
  const sourceFiles=types.map(t=>({path:OWNERS[t],domain:TYPES[t],classification:'SOURCE_FIXED_PENDING_QA_DEV_E2E_HUMAN',
    phaseAAuthority:true,currentBlob:BLOBS[t]}));
  const findings=Object.fromEntries(['033','034','035','036','037','038','039','040','041','042'].map(n=>['VRM-'+n,{state:'FIXED_PROVEN'}]));
  const identity={sourceSha:SHA,sourceTree:TREE,runtimeRevision:'runtime-dev',runtimeDigest:DIGEST,hostingVersion:'sites/dev/versions/1'};
  return {pre:{productSource:{sha:SHA,treeSha:TREE},preTerminalComposition:{decision:'PASS_C3_PRETERMINAL_COMPOSITION',moduleCount:21,pendingMappingApprovalFiles:[]},modules,sourceFiles},
    ledger:{findings},identity,additionalReceipts:[],
    focal:{decision:'PASS_PRE_I4_FOCAL_HUMAN_BROWSER',sourceSha:SHA,hrRevision:HR},
    human:{decision:'PASS_I3_HUMAN_LIVE_ACCEPTANCE',sourceSha:SHA,sourceRevision:HR},
    qa:{decision:'PASS_C3_QA_RESERVATION_CLEANUP',after:0},
    parity:{decision:'PASS_C3_PENDING_OWNER_BYTE_PARITY',mismatches:0}};
}
function receipt(type,kind='READ_ONLY',obligationId='a',fullDomain=true){
  const path=OWNERS[type],domain=TYPES[type],mutating=kind==='PROVIDER_WRITE';
  return {moduleDomain:domain,findingIds:['VRM-900'],decision:'PASS_REAL_SCOPED_EVIDENCE',
    sourceSha:SHA,sourceTree:TREE,runtimeRevision:'runtime-dev',runtimeDigest:DIGEST,
    hostingVersion:'sites/dev/versions/1',hrRevision:HR,production:false,
    operationKind:kind,ownerPaths:[path],
    ownerEvidence:[{path,gitBlob:BLOBS[type],sourceSha256:HASH,servedSha256:HASH,byteParity:true}],
    contractAuthority:{contractSha256:hash(CONTRACTS[type])},
    contractCoverage:{fullDomain,obligations:[{id:obligationId,observed:true,evidenceRef:'run-scoped-receipt',evidenceSha256:HASH}]},
    scope:{tenantId:'tya',projectId:'cinepolis',periodId:'2026-09',role:'shopper'},
    auth:{authenticated:true,tenantExact:true,projectAuthorized:true,role:'shopper'},
    mutationEvidence:{applicable:mutating,providerAckClaimed:mutating,providerWrites:mutating?1:0,
      authWrites:0,firestoreWrites:0,hrWrites:0},
    readOnlyProof:{liveReadback:true,expectedObserved:true,providerCommandsObserved:0},
    authProof:{ordinaryCredential:true,login:true,logout:true,relogin:true,protectedScope:true},
    uiProof:{realBrowserE2E:true,routeConsistent:true,visualEvidenceSha256:HASH,roleScopeVerified:true},
    actionReal:mutating,providerAck:mutating,durableReadback:mutating,reloadProof:mutating,noDuplicateRegression:mutating,
    providerWriteProof:mutating?{remoteReceiptId:'remote-ack-proof',idempotencyKey:'stable-visit-key',replayNoDuplicate:true}:undefined};
}
const append=(f,rows)=>{const rs=Array.isArray(rows)?rows:[rows];const paths=[...new Set(rs.flatMap(r=>r.ownerPaths))];
  f.ledger.findings['VRM-900']={state:'FIXED_PROVEN',owner:paths};
  f.additionalReceipts.push(...rs);return f;};
const decision=f=>evaluateTerminalModuleTruth(f).terminalClosure;

test('focal readonly evidence can certify a truly read-only domain, with no invented remote ACK',()=>{
  const f=append(fixture('read'),receipt('read'));
  const out=decision(f);
  assert.equal(out.matchModules,21);assert.equal(out.status,'GO');assert.equal(out.ownerSpecificReceipts.length,1);
});
test('read-only proof without no-write evidence is not a pass',()=>{
  const r=receipt('read');delete r.mutationEvidence;
  const out=decision(append(fixture('read'),r));
  assert.equal(out.status,'HOLD');assert.equal(out.matchModules,20);
});
test('a readonly proof never settles a domain requiring durable financial writes',()=>{
  const out=decision(append(fixture('write'),receipt('write')));
  assert.equal(out.matchModules,20);assert.equal(out.status,'HOLD');
});
test('read-only inspection cannot replace real shell cold-login and browser-navigation proofs',()=>{
  const f=append(fixture('shell'),receipt('shell'));
  assert.equal(decision(f).matchModules,20);
  f.additionalReceipts.push(receipt('shell','AUTH_SESSION'),receipt('shell','UI_INTERACTION'));
  assert.equal(decision(f).matchModules,21);
});
test('an already approved MATCH retains owner-only reproof compatibility without opening another domain gate',()=>{
  const f=fixture('read'),mod=f.pre.modules.find(x=>x.domain===TYPES.read);
  mod.classification='MATCH';mod.pendingTerminalFiles=[OWNERS.read];
  const r=receipt('read','PROVIDER_WRITE');delete r.operationKind;
  append(f,r);
  assert.equal(decision(f).matchModules,21);
});
test('real provider writes need remote ACK and replay, independent of functional UI proof',()=>{
  const f=append(fixture('write'),receipt('write','PROVIDER_WRITE'));
  assert.equal(decision(f).matchModules,21);
  f.additionalReceipts[0].providerAck=false;
  assert.equal(decision(f).matchModules,20);
});
test('separate bounded receipts accumulate only against frozen complete obligation IDs',()=>{
  const f=append(fixture('read',{requiredIds:['cold','warm']}),[
    receipt('read','READ_ONLY','cold',false),
    receipt('read','READ_ONLY','warm',false)]);
  assert.equal(decision(f).matchModules,21);
  f.additionalReceipts.pop();
  assert.equal(decision(f).matchModules,20);
  const noList=append(fixture('read'),[
    receipt('read','READ_ONLY','cold',false),receipt('read','READ_ONLY','warm',false)]);
  assert.equal(decision(noList).matchModules,20);
});
test('ordinary credential login is an explicit non-writing proof kind',()=>{
  const f=append(fixture('auth'),receipt('auth','AUTH_SESSION'));
  assert.equal(decision(f).matchModules,21);
  f.additionalReceipts[0].authProof.ordinaryCredential=false;
  assert.equal(decision(f).matchModules,20);
});
test('real browser UI proof is not forced to fabricate provider writes',()=>{
  const f=append(fixture('ui'),receipt('ui','UI_INTERACTION'));
  assert.equal(decision(f).matchModules,21);
  f.additionalReceipts[0].uiProof.realBrowserE2E=false;
  assert.equal(decision(f).matchModules,20);
});
test('old source receipt carryover needs unchanged exact owner bytes and dependencies',()=>{
  const f=append(fixture('read'),receipt('read'));
  const r=f.additionalReceipts[0];
  r.sourceSha='f'.repeat(40);r.sourceTree='9'.repeat(40);
  assert.equal(decision(f).matchModules,20);
  r.carryForward={approvedUnchangedOwners:true,ownerAndDependenciesUnchanged:true,
    ownerEvidence:[{path:OWNERS.read,gitBlob:BLOBS.read,sourceSha256:HASH,servedSha256:HASH}],
    dependencyEvidence:[{path:'app/core/unchanged-dep.js',gitBlob:'8'.repeat(40),sourceSha256:HASH,servedSha256:HASH}],
    currentSourceSha:SHA,currentSourceTree:TREE,currentRuntimeRevision:'runtime-dev',
    currentRuntimeDigest:DIGEST,currentHostingVersion:'sites/dev/versions/1',
    currentAssetReadback:true,unchangedApprovedContractSha256:hash(CONTRACTS.read)};
  assert.equal(decision(f).matchModules,20); // Dependency path is absent from frozen source.
  f.pre.sourceFiles.push({path:'app/core/unchanged-dep.js',domain:TYPES.read,phaseAAuthority:false,currentBlob:'8'.repeat(40)});
  assert.equal(decision(f).matchModules,21);
  r.carryForward.ownerEvidence[0].gitBlob='0'.repeat(40);
  assert.equal(decision(f).matchModules,20);
});
test('wrong functional role, owner or unobserved obligation never auto-promotes',()=>{
  const f=append(fixture('read'),receipt('read'));
  f.additionalReceipts[0].contractCoverage.obligations[0].observed=false;
  assert.equal(decision(f).matchModules,20);
  f.additionalReceipts[0].contractCoverage.obligations[0].observed=true;
  f.additionalReceipts[0].scope.role='unknown';
  assert.equal(decision(f).matchModules,20);
});
test('module-only proof needs exact frozen owners but not a fabricated defect ID',()=>{
  const f=fixture('read'),r=receipt('read');r.findingIds=[];f.additionalReceipts=[r];
  assert.equal(decision(f).matchModules,21);
  r.ownerPaths=['app/core/not-approved.js'];
  assert.equal(decision(f).matchModules,20);
});
test('a partial financial read cannot close a P0 finding before the write contract is complete',()=>{
  const f=append(fixture('write'),receipt('write'));
  f.ledger.findings['VRM-900'].state='PENDING';f.ledger.findings['VRM-900'].severity='P0';
  const out=decision(f);
  assert.equal(out.matchModules,20);
  assert.ok(out.unresolvedP0.some(x=>x.id==='VRM-900'));
  assert.ok(!out.closedByCurrentReceipt.includes('VRM-900'));
});
test('no invented contract hash, cross-scope role or unknown operation-kind can promote',()=>{
  const f=append(fixture('read'),receipt('read'));
  f.additionalReceipts[0].contractAuthority.contractSha256='f'.repeat(64);
  assert.equal(decision(f).matchModules,20);
  f.additionalReceipts[0].contractAuthority.contractSha256=hash(CONTRACTS.read);
  f.additionalReceipts[0].auth.role='admin';
  assert.equal(decision(f).matchModules,20);
  f.additionalReceipts[0].auth.role='shopper';
  f.additionalReceipts[0].operationKind='UNVERIFIED_EVENT';
  assert.equal(decision(f).matchModules,20);
});
