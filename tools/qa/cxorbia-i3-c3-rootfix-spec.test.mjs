import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import {evaluateTerminalModuleTruth,discoverCanonicalDomainReceipts,permitsModuleScopeRole,readDurableDomainReceipts} from './cxorbia-i3-c3-finalize-module-truth.mjs';
import {gitBlob} from './cxorbia-i3-current-control-projection.mjs';
import {D08_RECEIPT_SCHEMA,D08_OBLIGATION_IDS} from './cxorbia-i3-d08-result-normalizer.mjs';

const SHA='a'.repeat(40), TREE='b'.repeat(40), HR='c'.repeat(64), DIGEST='sha256:'+'d'.repeat(64), HASH='e'.repeat(64);
const hash=s=>crypto.createHash('sha256').update(String(s)).digest('hex');
const registry=JSON.parse(fs.readFileSync('CXORBIA_CANONICAL_MODULE_REGISTRY_2026-09-18.json','utf8'));
const currentMatrix=JSON.parse(fs.readFileSync('RECOVERY-I3-MODULE-TRUTH-MATRIX-20261118-V362.json','utf8'));
const DOMAINS=[...registry.modules.map(x=>x.domain),'tenant-admin-config-branding'];
const TYPES={read:'historical',shell:'base-router-shell-cache',write:'finance-core-liquidation-costs',auth:'auth-protected-data-runtime',ui:'dashboard-operation'};
const OWNERS={read:'app/core/historical-proof.js',shell:'app/core/shell-proof.js',write:'app/modules/finance-proof.js',auth:'app/core/auth-proof.js',ui:'app/modules/dashboard-proof.js'};
const BLOBS=Object.fromEntries(Object.entries(OWNERS).map(([k])=>[k,(k==='read'?'1':k==='shell'?'5':k==='write'?'2':k==='auth'?'3':'4').repeat(40)]));
const CONTRACTS={read:'Historical/ProtectedRead',shell:'Release/Visual/Security',write:'País/moneda/Persistencia/ACK',auth:'Auth/Identidad/Seguridad',ui:'Operación/HR/Visual'};
TYPES.academy='certifications';OWNERS.academy='app/modules/academia.js';BLOBS.academy='6'.repeat(40);CONTRACTS.academy='Shopper/Identidad/Visual';

test('A08 immutable-DEV read-only role proof does not inherit HEAD release-composition failure',()=>{
  const workflow=fs.readFileSync('.github/workflows/cxorbia-recovery-i3-dev-certification.yml','utf8');
  const job=workflow.split('  i3-keeper-role-e2e-readonly:')[1]?.split('\n  i3-run2382-')[0]||'';
  assert.ok(job.includes('always() && !cancelled()'));
  assert.match(job,/contains\(github\.event\.head_commit\.message,\s*'\[i3-a08-exceptions-negative-readonly\]'\)/);
  assert.match(job,/contains\(github\.event\.head_commit\.message,\s*'\[i3-keeper-role-e2e-readonly\]'\)\s*&&\s*needs\.canonical-candidate-authority\.result\s*==\s*'success'/);
  assert.ok(job.includes('bash tools/qa/cxorbia-i3-a08-same-artifact-readonly.sh'));
  const preflight=fs.readFileSync('tools/qa/cxorbia-i3-a08-same-artifact-readonly.sh','utf8');
  for(const required of ['CXORBIA_PRODUCT_SOURCE_SHA','runtimeDigest','hostingVersion','firestoreRuleset','git show "$S:app/$A"','servedSha256','test "$N" = "$EXPECTED_COUNT"','loadA08Pin','assertA08ServedInventory','assertA08AssetSeal'])
    assert.ok(preflight.includes(required),`missing immutable DEV guard: ${required}`);
  assert.ok(!/\b(gcloud run deploy|firebase deploy|PATCH|POST|PUT|DELETE)\b/.test(preflight));
});

function fixture(type='read',options={}){
  const types=Array.isArray(type)?type:[type],requiredIds=options.requiredIds||null;
  const modules=DOMAINS.map(domain=>{
    const idx=types.find(t=>TYPES[t]===domain);
    return {domain,classification:idx?'SOURCE_FIXED_DEV_MATERIALIZED_PENDING_LIVE_E2E_HUMAN':'MATCH',
      owners:idx?[OWNERS[idx]]:[],pendingTerminalFiles:[],
      // Match the frozen module matrix's human-readable role authority.
      roles:idx?['Admin','Shopper','Cliente']:[],
      contractFunctional:idx?CONTRACTS[idx]:'',
      currentOwnerBlobs:idx?{[OWNERS[idx]]:BLOBS[idx]}:{},
      ...(idx&&requiredIds?{terminalRequiredObligationIds:requiredIds}: {})};
  });
  const sourceFiles=types.map(t=>({path:OWNERS[t],domain:TYPES[t],classification:'SOURCE_FIXED_PENDING_QA_DEV_E2E_HUMAN',
    phaseAAuthority:true,currentBlob:BLOBS[t]}));
  const findings=Object.fromEntries(['033','034','035','036','037','038','039','040','041','042'].map(n=>['VRM-'+n,{state:'FIXED_PROVEN'}]));
  const identity={sourceSha:SHA,sourceTree:TREE,runtimeRevision:'runtime-dev',runtimeDigest:DIGEST,hostingVersion:'sites/dev/versions/1'};
  return {acceptanceMode:'LEGACY_21_HISTORICAL',pre:{productSource:{sha:SHA,treeSha:TREE},preTerminalComposition:{decision:'PASS_C3_PRETERMINAL_COMPOSITION',moduleCount:21,pendingMappingApprovalFiles:[]},modules,sourceFiles},
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

test('durable owner evidence requires exact index, receipt bytes and original raw bytes',()=>{
 const rawPath='docs/checkpoints/CXORBIA_I3_TEST_RAW.json',receiptPath='docs/checkpoints/CXORBIA_I3_TEST_TYPED.json',raw='{"synthetic":true}\n';
 const proof={runId:10,runAttempt:1,jobId:20,controlHead:SHA,artifactId:30,artifactDigest:DIGEST,resultRef:rawPath,resultSha256:hash(raw)};
 const body=JSON.stringify({evidence:proof,production:false,ownerSpecificReceipts:[{syntheticTestOnly:true}]});
 const entry={...proof,path:receiptPath,gitBlob:gitBlob(body),sha256:hash(body),ownerReceiptCount:1};
 const d={currentFunctionalEvidenceIndex:{schemaVersion:'cxorbia.i3.typed-result-index.v1',results:[entry],production:false}},p=structuredClone(d),files=new Map([[rawPath,raw],[receiptPath,body]]);
 const load=()=>readDurableDomainReceipts({descriptor:d,pointer:p,readBytes:path=>files.get(path)});
 assert.equal(load().receipts.length,1);
 files.set(rawPath,'tampered');assert.throws(load,/RAW_HASH/);files.set(rawPath,raw);
 files.set(receiptPath,body+' ');assert.throws(load,/RECEIPT_HASH/);files.set(receiptPath,body);
 p.currentFunctionalEvidenceIndex.results[0].artifactId=31;assert.throws(load,/INDEX_DESYNC/);
});

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
test('pending finding accepts and durably retains a proved clause without closing the missing obligation',()=>{
 const f=fixture('write',{requiredIds:['first','remaining']}),r=receipt('write','PROVIDER_WRITE','first',false);
 f.ledger.findings['VRM-900']={priority:'P0_PROVEN',state:'PENDING_REAL_PROOF',moduleDomain:TYPES.write,owner:[OWNERS.write],terminalEvidence:{ownerSpecificReceipt:r}};
 const out=evaluateTerminalModuleTruth(f),domain=out.terminalClosure.domainResults.find(x=>x.moduleDomain===TYPES.write);
 assert.equal(out.terminalClosure.matchModules,20);assert.equal(out.terminalClosure.acceptedCurrentOwnerReceipts.length,1);
 assert.deepEqual(domain.observedObligationIds,['first']);assert.deepEqual(domain.missingObligationIds,['remaining']);
 assert.ok(out.terminalClosure.unresolvedP0.some(x=>x.id==='VRM-900'));
 f.ledger.findings['VRM-900'].terminalEvidence.ownerSpecificReceipts=[r,receipt('write','PROVIDER_WRITE','remaining',false)];
 const completed=evaluateTerminalModuleTruth(f);assert.equal(completed.terminalClosure.matchModules,21);assert.ok(completed.terminalClosure.closedByCurrentReceipt.includes('VRM-900'));
});
test('provider partial without a full inventory survives save/load and never invents a domain denominator',()=>{
 const f=append(fixture('write'),receipt('write','PROVIDER_WRITE','observed',false));
 const first=evaluateTerminalModuleTruth(f),domain=first.terminalClosure.domainResults.find(x=>x.moduleDomain===TYPES.write);
 assert.equal(first.terminalClosure.matchModules,20);assert.equal(first.terminalClosure.acceptedCurrentOwnerReceipts.length,1);
 assert.equal(domain.completeObligationInventory,false);assert.equal(domain.missingObligationIds,null);
 f.pre=JSON.parse(JSON.stringify(first));f.additionalReceipts=[];
 const second=evaluateTerminalModuleTruth(f);assert.equal(second.terminalClosure.matchModules,20);assert.equal(second.terminalClosure.acceptedCurrentOwnerReceipts.length,1);
 f.additionalReceipts=[receipt('write','PROVIDER_WRITE','observed',false)];
 assert.equal(evaluateTerminalModuleTruth(f).terminalClosure.acceptedCurrentOwnerReceipts.length,1);
 f.identity={...f.identity,runtimeRevision:'different-runtime'};
 const drift=evaluateTerminalModuleTruth(f);assert.equal(drift.terminalClosure.acceptedCurrentOwnerReceipts.length,0);assert.equal(drift.terminalClosure.matchModules,20);
});
test('D08 tenant/course scope retains a partial receipt only under its frozen module authority',()=>{
 const f=fixture('academy'),mod=f.pre.modules.find(x=>x.domain==='certifications');
 const r=receipt('academy','PROVIDER_WRITE','D08.shopper.progress',false);
 Object.assign(r,{schemaVersion:D08_RECEIPT_SCHEMA,hrIndependent:true,fullDomain:false});
 Object.assign(r.scope,{kind:'D08_ACADEMY_TENANT_COURSE',periodId:null});
 Object.assign(r.contractAuthority,{taskId:'D08',scopeContractSha256:HASH});
 mod.scopedContractAuthorities={D08:{taskId:'D08',periodRequired:false,sha256:HASH,obligationIds:D08_OBLIGATION_IDS}};
 append(f,r);let out=decision(f);assert.equal(out.matchModules,20);assert.equal(out.acceptedCurrentOwnerReceipts.length,1);
 delete mod.scopedContractAuthorities;out=decision(f);assert.equal(out.acceptedCurrentOwnerReceipts.length,0);assert.ok(out.rejectedReceipts[0].reasons.includes('AUTHENTICATED_CONTRACT_SCOPE'));
});
test('HR-independent flag alone never waives finance period scope',()=>{
 const f=append(fixture('write'),receipt('write','PROVIDER_WRITE','D08.shopper.progress',false));
 Object.assign(f.additionalReceipts[0],{schemaVersion:D08_RECEIPT_SCHEMA,hrIndependent:true});
 f.additionalReceipts[0].scope.periodId=null;
 const out=decision(f);assert.equal(out.acceptedCurrentOwnerReceipts.length,0);assert.equal(out.matchModules,20);
});
test('ordinary credential login is an explicit non-writing proof kind',()=>{
  const f=append(fixture('auth'),receipt('auth','AUTH_SESSION'));
  f.additionalReceipts[0].mutationEvidence.authWrites=1;
  assert.equal(decision(f).matchModules,21);
  f.additionalReceipts[0].authProof.ordinaryCredential=false;
  assert.equal(decision(f).matchModules,20);
});
test('frozen display roles map to authenticated scope roles without broadening access',()=>{
  const f=append(fixture('auth'),receipt('auth','AUTH_SESSION'));
  const module=f.pre.modules.find(m=>m.domain===TYPES.auth),r=f.additionalReceipts[0];
  assert.equal(decision(f).matchModules,21); // Shopper label permits shopper scope.
  module.roles=['Admin'];
  assert.equal(decision(f).matchModules,20); // Shopper does not become Admin.
  r.scope.role='admin';r.auth.role='admin';
  assert.equal(decision(f).matchModules,21);
  module.roles=['Cliente'];
  assert.equal(decision(f).matchModules,20); // Admin does not become Cliente.
  r.scope.role='client';r.auth.role='client';
  assert.equal(decision(f).matchModules,21); // Locale display label maps to client.
  r.scope.role='super';r.auth.role='super';
  assert.equal(decision(f).matchModules,20); // Super needs its own explicit authority.
});
test('missing or malformed module role authority cannot silently authorize a receipt',()=>{
  const f=append(fixture('auth'),receipt('auth','AUTH_SESSION'));
  const module=f.pre.modules.find(m=>m.domain===TYPES.auth);
  for(const malformed of [undefined,null,[],['Admin',null],['Admin',''],['Admin',{}]]){
    module.roles=malformed;
    const result=decision(f);
    assert.equal(result.matchModules,20,'invalid authority: '+JSON.stringify(malformed));
    assert.ok(result.rejectedReceipts.some(x=>x.reasons.includes('MODULE_ROLE_AUTHORITY')));
  }
});
test('all 21 frozen module role authorities match exact credential roles and reject cross-role access',()=>{
  const labels={Admin:'admin',Shopper:'shopper',Cliente:'client'};
  assert.equal(currentMatrix.modules.length,21);
  for(const mod of currentMatrix.modules){
    assert.ok(Array.isArray(mod.roles)&&mod.roles.length>0,mod.domain);
    for(const label of mod.roles)assert.ok(Object.hasOwn(labels,label),mod.domain+':'+label);
    for(const scopedRole of ['admin','shopper','client','cliente','super']){
      const expected=mod.roles.some(label=>labels[label]===scopedRole||
        (scopedRole==='cliente'&&label==='Cliente')||(scopedRole==='super'&&label==='Admin'));
      assert.equal(permitsModuleScopeRole(mod.roles,scopedRole),expected,mod.domain+':'+scopedRole);
    }
  }
});
test('all 21 current domains retain concrete contract, owner paths and byte identities',()=>{
  const sourceByPath=new Map(currentMatrix.sourceFiles.map(f=>[f.path,f]));
  assert.equal(currentMatrix.modules.length,21);
  for(const mod of currentMatrix.modules){
    assert.ok(String(mod.contractFunctional||mod.contract||'').length>0,mod.domain+':contract');
    assert.ok(Array.isArray(mod.owners)&&mod.owners.length>0,mod.domain+':owners');
    const required=new Set([...mod.owners,...currentMatrix.sourceFiles.filter(f=>f.domain===mod.domain&&f.phaseAAuthority!==false).map(f=>f.path)]);
    for(const owner of required){
      const fromModule=mod.currentOwnerBlobs?.[owner],fromSource=sourceByPath.get(owner)?.currentBlob;
      assert.match(String(fromModule||fromSource||''),/^[a-f0-9]{40}$/,mod.domain+':'+owner);
      if(fromModule&&fromSource)assert.equal(fromModule,fromSource,mod.domain+':'+owner+':blob-consistency');
    }
  }
});
test('actual super-admin and cliente session roles are accepted only within their authorized module class',()=>{
  const f=append(fixture('auth'),receipt('auth','AUTH_SESSION'));
  const module=f.pre.modules.find(m=>m.domain===TYPES.auth),r=f.additionalReceipts[0];
  module.roles=['Admin'];
  r.scope.role='super';r.auth.role='super';
  assert.equal(decision(f).matchModules,21); // Super is privileged within Admin, not Shopper.
  module.roles=['Shopper'];
  assert.equal(decision(f).matchModules,20);
  module.roles=['Cliente'];
  r.scope.role='cliente';r.auth.role='cliente';
  assert.equal(decision(f).matchModules,21); // Real legacy session spelling is accepted.
  module.roles=['Admin'];
  assert.equal(decision(f).matchModules,20);
});
test('real browser UI proof is not forced to fabricate provider writes',()=>{
  const f=append(fixture('ui'),receipt('ui','UI_INTERACTION'));
  f.additionalReceipts[0].actionReal=true;
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

function moduleSourceFileFixture(){
  const f=fixture('read'),r=receipt('read'),p='app/core/declared-historical-dependency.js';
  r.findingIds=[];
  f.pre.sourceFiles.push({path:p,domain:TYPES.read,phaseAAuthority:true,
    classification:'SOURCE_FIXED_PENDING_QA_DEV_E2E_HUMAN',currentBlob:'6'.repeat(40)});
  r.ownerPaths.push(p);
  r.ownerEvidence.push({path:p,gitBlob:'6'.repeat(40),sourceSha256:HASH,servedSha256:HASH,byteParity:true});
  f.additionalReceipts=[r];
  return {f,r,p};
}
test('module-only proof accepts the authoritative source files its domain contract requires',()=>{
  const {f}=moduleSourceFileFixture();
  const out=decision(f);
  assert.equal(out.matchModules,21);
  assert.equal(out.rejectedReceipts.length,0);
});
test('a required domain source file remains blocking when its receipt coverage is absent',()=>{
  const {f,r,p}=moduleSourceFileFixture();
  r.ownerPaths=r.ownerPaths.filter(x=>x!==p);
  r.ownerEvidence=r.ownerEvidence.filter(x=>x.path!==p);
  const out=decision(f);
  assert.equal(out.matchModules,20);
  assert.ok(out.failures.some(x=>x.includes('C3_OWNER_RECEIPT_PENDING_FILE_UNCOVERED:'+TYPES.read)));
});
test('source files mapped to a different domain cannot broaden module-only proof scope',()=>{
  const {f,p}=moduleSourceFileFixture();
  f.pre.sourceFiles.find(x=>x.path===p).domain=TYPES.write;
  const out=decision(f);
  assert.equal(out.matchModules,20);
  assert.ok(out.rejectedReceipts.some(x=>x.reasons.includes('OWNER_DOMAIN_SCOPE')));
});
test('preserved non-authority source files cannot certify a domain',()=>{
  const {f,p}=moduleSourceFileFixture();
  f.pre.sourceFiles.find(x=>x.path===p).phaseAAuthority=false;
  const out=decision(f);
  assert.equal(out.matchModules,20);
  assert.ok(out.rejectedReceipts.some(x=>x.reasons.includes('OWNER_DOMAIN_SCOPE')));
});
test('declared domain source files still require exact current served bytes',()=>{
  const {f,r,p}=moduleSourceFileFixture();
  r.ownerEvidence.find(x=>x.path===p).gitBlob='0'.repeat(40);
  const out=decision(f);
  assert.equal(out.matchModules,20);
  assert.ok(out.rejectedReceipts.some(x=>x.reasons.includes('EXACT_CURRENT_OWNER_BYTE_PARITY')));
});
test('module source-file scope does not widen an individual finding owner scope',()=>{
  const {f,r}=moduleSourceFileFixture();
  r.findingIds=['VRM-900'];
  f.ledger.findings['VRM-900']={state:'PENDING',severity:'P0',owners:[OWNERS.read]};
  const out=decision(f);
  assert.equal(out.matchModules,20);
  assert.ok(out.rejectedReceipts.some(x=>x.reasons.includes('OWNER_MISMATCH')));
  assert.ok(out.unresolvedP0.some(x=>x.id==='VRM-900'));
});
test('canonical certifications coverage includes backend-ai without altering frozen owner lists',()=>{
  const mod=currentMatrix.modules.find(x=>x.domain==='certifications');
  const source=currentMatrix.sourceFiles.find(x=>x.path==='app/core/backend-ai.js');
  assert.ok(mod&&!mod.owners.includes(source.path));
  assert.equal(source.domain,mod.domain);
  assert.notEqual(source.phaseAAuthority,false);
  assert.match(source.currentBlob,/^[a-f0-9]{40}$/);
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
test('canonical evidence consumer is not limited to the two hardcoded original domains',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-domain-consumer-'));
  try{
    const index=path.join(dir,'current-domain-receipts.json');
    const folder=path.join(dir,'full-human-acceptance','module-results');
    fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(index,'[]');
    const read=receipt('read'),ui=receipt('ui','UI_INTERACTION');
    fs.writeFileSync(path.join(folder,'historical.json'),JSON.stringify({ownerSpecificReceipts:[read,read]}));
    fs.writeFileSync(path.join(folder,'dashboard.json'),JSON.stringify({domainReceipts:[ui]}));
    fs.writeFileSync(path.join(folder,'not-evidence.json'),JSON.stringify({moduleDomain:TYPES.write,decision:'PASS_FAKE',sourceSha:SHA}));
    const got=discoverCanonicalDomainReceipts(index);
    assert.equal(got.receipts.length,2);
    assert.deepEqual(new Set(got.receipts.map(x=>x.moduleDomain)),new Set([TYPES.read,TYPES.ui]));
    assert.equal(discoverCanonicalDomainReceipts(path.join(dir,'unapproved-index.json')).receipts.length,0);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('proved Excel successors bypass only the legacy Google preflight in the existing DEV lane',()=>{
  const wf=fs.readFileSync('.github/workflows/cxorbia-recovery-i3-dev-certification.yml','utf8');
  const job=wf.split('  vrm154-156-dev-materialization:')[1]?.split('\n  vrm185-admin-live-adjudication:')[0]||'';
  const sourceChecks=fs.readFileSync('tools/qa/cxorbia-i3-paired-source-checks.sh','utf8');
  assert.ok(job.includes('[[ "$PAIR_ENV_ONLY" == true || "$ACTIVE_STATUS" == HOLD_I3_F2_EXCEL_OPERATIONAL_READER_SOURCE_ONLY_PENDING_DEV_6_OF_21 || "$ACTIVE_STATUS" == HOLD_I3_GTHN_PENDING_DEV ]] || SOURCE_DIR="$SOURCE_DIR" node tools/qa/cxorbia-i3-vrm356-live-range-preflight.mjs'));
  assert.ok(job.includes('test "$(jq -r'));
  assert.ok(job.includes('bash tools/qa/cxorbia-i3-paired-source-checks.sh'));
  assert.ok(sourceChecks.includes('git diff --quiet "$FOCAL_SOURCE" HEAD -- app backend'));
  assert.ok(job.includes('node tools/qa/cxorbia-i3-f2-predeploy-proven-predecessor.mjs'));
  assert.ok(job.includes('gcloud builds submit "$SOURCE_DIR"'));
  assert.ok(job.includes('gcloud run services update "$SERVICE"'));
  assert.ok(job.includes('FIREBASE_HOSTING_TARGET'));
});

test('A08 browser read-only job must use the canonical current DEV receipt with its entire exact owner inventory',()=>{
  const workflow=fs.readFileSync('.github/workflows/cxorbia-recovery-i3-dev-certification.yml','utf8');
  const job=workflow.split('  i3-keeper-role-e2e-readonly:')[1]?.split('\n  i3-run2382-')[0]||'';
  assert.ok(job.includes('node tools/qa/cxorbia-i3-a08-current-artifact-pin.mjs'));
  assert.ok(job.includes('node --test tools/qa/cxorbia-i3-a08-residual-readonly.test.mjs'));
  assert.ok(!job.includes('b14Run2640VerifiedDevReadback20261119.proofPath'));
  assert.ok(!job.includes('P=docs/checkpoints/CXORBIA_I3_RUN2587'));
  const pin=fs.readFileSync('tools/qa/cxorbia-i3-a08-current-artifact-pin.mjs','utf8');
  assert.ok(pin.includes('current.currentMaterialization?.materializationReceiptPath'));
  assert.ok(pin.includes("readTracked(receiptPath)"));
  assert.ok(pin.includes("['firestoreRulesDeploys','storageRulesDeploys','hrWrites']"));
  assert.ok(pin.includes('CURRENT_SOURCE_NOT_MATERIALIZED'));
  assert.ok(pin.includes('EXACT_CURRENT_ASSET_INVENTORY_REQUIRED'));
  for(const required of ['SERVED_ASSET_SET_MISMATCH','SERVED_ASSET_HASH_MISMATCH','PIN_INVENTORY_DESYNC','servedInventorySha256'])assert.ok(pin.includes(required));
  const preflight=fs.readFileSync('tools/qa/cxorbia-i3-a08-same-artifact-readonly.sh','utf8');
  assert.ok(preflight.includes('test "$N" = "$EXPECTED_COUNT"'));
  assert.ok(preflight.includes('test "$(git rev-parse "HEAD:$(jq -er .receiptPath "$P")")" = "$(jq -er .receiptGitBlob "$P")"'));
  assert.ok(!/\b(firebase deploy|gcloud run (deploy|services update)|PATCH|POST|PUT|DELETE)\b/.test(preflight));
});
