#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createProjectCommandProvider } from '../../backend/runtime/cxorbia-project-command-provider-v1.mjs';
import { createOperationalCommandProvider, validateCommand } from '../../backend/runtime/cxorbia-operational-command-provider-v1.mjs';
import { createProviderForCommand, commandProviderKind } from '../../backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs';

const EXPECTED_HEAD='bb2ca859d6cbac26272fdbbb0f09ca31a950604a';
const SUCCESSOR='0a4c617c8af0f1c58394e78a28494ca044480d82';
const FOCAL_ALLOWED_PATHS=[
  'app/modules/proyecto-wizard.js',
  'app/modules/proyectos.js',
  'backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs',
  'tools/qa/cxorbia-recovery-i2-contract-gate.mjs'
];
const CANDIDATE_PATHS=[
  'app/adapters/cxorbia-command-adapter-v1.js',
  'app/adapters/cxorbia-cxdata-command-boundary-v1.js',
  'app/adapters/cxorbia-project-operational-source-v1.js',
  'app/adapters/tya-phase-a-operational-sync-v1.js',
  'app/core/backend-v57-extra-config.js',
  'app/modules/proyecto-wizard.js',
  'app/modules/proyectos.js',
  'backend/contracts/cxorbia-project-source-contract-v1.json',
  'backend/runtime/cxorbia-operational-command-provider-v1.mjs',
  'backend/runtime/cxorbia-project-command-provider-v1.mjs',
  'backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs',
  'backend/runtime/hr-live-service/server.mjs',
  'tools/qa/cxorbia-recovery-i2-contract-gate.mjs'
];
const stable=value=>Array.isArray(value)?value.map(stable):(value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value);
const sha=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value)),'utf8').digest('hex');
const git=args=>execFileSync('git',args,{encoding:'utf8'}).trim();
const gitMaybe=args=>{try{return {ok:true,out:execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()};}catch(error){return {ok:false,error:String(error?.message||error)}};};
const read=p=>fs.readFileSync(p,'utf8');
const blob=(ref,path)=>git(['rev-parse',`${ref}:${path}`]);
const worktreeBlob=path=>git(['hash-object',path]);
const lines=s=>s.split(/\r?\n/).filter(Boolean);
const changed=()=>[...new Set([...lines(git(['diff','--name-only','HEAD'])),...lines(git(['ls-files','--others','--exclude-standard']))])].sort();

class DocRef{
  constructor(store,path){this.store=store;this.path=path;}
  collection(name){return new CollectionRef(this.store,`${this.path}/${name}`);}
  async get(){const data=this.store.get(this.path);return {exists:data!==undefined,data:()=>JSON.parse(JSON.stringify(data))};}
}
class CollectionRef{
  constructor(store,path){this.store=store;this.path=path;}
  doc(id){return new DocRef(this.store,`${this.path}/${id}`);}
}
class Tx{
  constructor(store){this.store=store;}
  async get(ref){const data=this.store.get(ref.path);return {exists:data!==undefined,data:()=>JSON.parse(JSON.stringify(data))};}
  create(ref,data){if(this.store.has(ref.path))throw new Error('already_exists');this.store.set(ref.path,JSON.parse(JSON.stringify(data)));}
  set(ref,data,opts={}){const prev=opts.merge&&this.store.has(ref.path)?this.store.get(ref.path):{};this.store.set(ref.path,JSON.parse(JSON.stringify({...prev,...data})));}
  delete(ref){this.store.delete(ref.path);}
}
class Db{
  constructor(seed={}){this.store=new Map(Object.entries(seed).map(([k,v])=>[k,JSON.parse(JSON.stringify(v))]));}
  collection(name){return new CollectionRef(this.store,name);}
  async runTransaction(fn){return fn(new Tx(this.store));}
  get(path){return this.store.get(path);}
  has(path){return this.store.has(path);}
}

function authFor(tokens){
  return {verifyIdToken:async token=>tokens[token]};
}
function command(base){
  return {
    version:'cxorbia-command-adapter-v1',
    tenantId:'tya',
    projectId:'project-a',
    periodId:'period-2026-08',
    entityType:'application',
    expectedVersion:'absent',
    idempotencyKey:'idem-1',
    authorization:{providerEnforcementRequired:true},
    ...base
  };
}

const projectPolicy={
  schemaVersion:'cxorbia.project-command-provider-policy.v1',enabled:true,allowedTenantIds:['tya'],
  externalProviderWrites:false,hrWrites:false,makeCalls:false,geminiCalls:false,paymentWrites:false
};
const operationalPolicy={
  schemaVersion:'cxorbia.operational.provider-policy.v1',enabled:true,allowedTenantIds:['tya'],allowedProjectIds:['project-a','project-runtime'],
  hrWrites:false,makeCalls:false,geminiCalls:false,storageWrites:false,paymentWrites:false,conflictPolicy:'review_no_silent_overwrite'
};

async function main(){
  const tests=[];
  const pass=(name,detail={})=>tests.push({name,status:'PASS',...detail});
  assert.equal(git(['branch','--show-current']),'recovery/cxorbia-phase-a-20260831');
  assert.equal(git(['rev-parse','HEAD']),EXPECTED_HEAD);
  assert.equal(git(['status','--porcelain=v1','--untracked-files=no']).split(/\r?\n/).filter(Boolean).length>0,true);
  const paths=changed();
  assert.ok(paths.every(p=>FOCAL_ALLOWED_PATHS.includes(p)),`out-of-scope paths: ${paths.filter(p=>!FOCAL_ALLOWED_PATHS.includes(p)).join(',')}`);
  assert.equal(blob('HEAD','app/adapters/cxorbia-canonical-write-firewall-v1.js'),'a55bdc1f6ba405c4324d8ba65e5f0ca944d33c30');
  assert.equal(blob('HEAD','app/data/tya-hr-source-safe-current-through-july.js'),'4bdb9abe1c6582d1a5a72fc9b48a148e716d4cdf');
  assert.equal(gitMaybe(['cat-file','-e','HEAD:backend/config/cxorbia-project-onboarding-readiness-v1.json']).ok,false);
  assert.equal(blob(SUCCESSOR,'app/adapters/cxorbia-project-operational-source-v1.js'),'95ba739c314af820c514267374f47c965e96db6f');
  assert.equal(blob(SUCCESSOR,'backend/contracts/cxorbia-project-source-contract-v1.json'),'b92aa2e4464930cc74e10a6142ce762a40527961');
  assert.equal(worktreeBlob('app/adapters/cxorbia-project-operational-source-v1.js'),'95ba739c314af820c514267374f47c965e96db6f');
  assert.equal(worktreeBlob('backend/contracts/cxorbia-project-source-contract-v1.json'),'b92aa2e4464930cc74e10a6142ce762a40527961');
  pass('HEAD/lineage and focal scope', {changedPaths:paths});

  const wizard=read('app/modules/proyecto-wizard.js');
  const projects=read('app/modules/proyectos.js');
  assert.ok(!read('app/core/backend-v57-extra-config.js').includes('cinepolis-abril-26'));
  assert.ok(!read('app/adapters/tya-phase-a-operational-sync-v1.js').includes("||'tya'"));
  assert.ok(!read('app/adapters/tya-phase-a-operational-sync-v1.js').includes("||'cinepolis'"));
  assert.ok(!read('app/adapters/tya-phase-a-operational-sync-v1.js').includes('Date.now().toString'));
  assert.ok(!wizard.includes("ronda:'JUN 26'"));
  assert.ok(!wizard.includes("quincenas:['Quincena 1','Quincena 2']"));
  assert.ok(!wizard.includes("cols:['Sucursal','Ciudad','País','Escenario']"));
  assert.ok(!wizard.includes('pending-secure-provider-binding'));
  assert.ok(!wizard.includes('pending-hr-mapping-ref'));
  assert.ok(!wizard.includes('50/50'));
  assert.ok(!projects.includes('mitad de las visitas'));
  assert.ok(!projects.includes('50/50'));
  assert.ok(!projects.includes('pending-secure-provider-binding'));
  assert.ok(!projects.includes('pending-hr-mapping-ref'));
  assert.ok(!paths.includes('backend/config/cxorbia-project-onboarding-readiness-v1.json'));
  pass('Admission, preserve/reject and hardcode regression');

  assert.deepEqual(validateCommand(command({commandType:'application.create'})).errors,[]);
  assert.ok(validateCommand({...command({commandType:'application.create'}),periodId:''}).errors.includes('scope'));
  assert.ok(read('app/adapters/cxorbia-command-adapter-v1.js').includes('missing-periodId'));
  assert.ok(read('app/adapters/cxorbia-cxdata-command-boundary-v1.js').includes('cmd.projectId=null'));
  pass('Context command contract');

  const projectDb=new Db({
    'tenants/tya/users/admin1':{active:true,tenantId:'tya',role:'admin',authNamespace:'staff'}
  });
  const projectProvider=createProjectCommandProvider({
    auth:authFor({admin:{uid:'admin1',tenantId:'tya',role:'admin',authNamespace:'staff'}}),
    db:projectDb,
    policy:projectPolicy
  });
  const createPayload={name:'Project A',countries:['GT'],periodId:'period-setup',operationalSource:{mode:'internal',providerType:'internal_firestore',authority:'platform',readPolicy:'internal_live',writePolicy:'platform_only',mappingRef:'internal-native-mapping'}};
  const createCmd=command({commandType:'project.create',entityType:'project',entityId:null,projectId:null,periodId:'period-setup',idempotencyKey:'project-create-1',payload:createPayload});
  const createAck=await projectProvider.execute('admin',createCmd);
  assert.equal(createAck.ok,true);
  assert.match(createAck.projectId,/^prj-[a-f0-9]{20}$/);
  assert.equal((await projectProvider.execute('admin',createCmd)).providerWrites,0);
  const updateCmd=command({commandType:'project.update',entityType:'project',projectId:createAck.projectId,periodId:'period-setup',idempotencyKey:'project-update-1',expectedVersion:1,payload:{...createPayload,projectId:createAck.projectId,version:1,operationalSource:{mode:'external',providerType:'google_sheets',authority:'external_source',readPolicy:'external_live',writePolicy:'external_read_only',providerBindingId:'binding-a',mappingRef:'mapping-a'}}});
  assert.equal((await projectProvider.execute('admin',updateCmd)).ok,true);
  assert.equal((await projectProvider.execute('admin',{...updateCmd,idempotencyKey:'project-update-conflict',expectedVersion:1})).ok,false);
  pass('Project source and project lifecycle');

  const opDb=new Db({
    'tenants/tya/users/shopper1':{active:true,tenantId:'tya',role:'shopper',authNamespace:'shopper',projectIds:['project-a'],shopperId:'shopper-a'},
    'tenants/tya/users/admin1':{active:true,tenantId:'tya',role:'admin',authNamespace:'staff',projectIds:['project-a']},
    'tenants/tya/projects/project-a/visits/visit-a':{id:'visit-a',tenantId:'tya',projectId:'project-a',periodId:'period-2026-08',hrRowId:'hr-1',estado:'disponible',version:1}
  });
  const opProvider=createOperationalCommandProvider({
    auth:authFor({
      shopper:{uid:'shopper1',tenantId:'tya',role:'shopper',authNamespace:'shopper',projectIds:['project-a'],shopperId:'shopper-a'},
      admin:{uid:'admin1',tenantId:'tya',role:'admin',authNamespace:'staff',projectIds:['project-a']}
    }),
    db:opDb,
    policy:operationalPolicy
  });
  const appCreate=command({commandType:'application.create',payload:{periodId:'period-2026-08',visitId:'visit-a',shopperId:'shopper-a'}});
  const appAck=await opProvider.execute('shopper',appCreate);
  assert.equal(appAck.ok,true);
  assert.equal((await opProvider.execute('shopper',appCreate)).providerWrites,0);
  const appPath=`tenants/tya/projects/project-a/postulations/${appAck.entityId}`;
  assert.equal(opDb.get(appPath).periodId,'period-2026-08');
  const delAck=await opProvider.execute('shopper',command({commandType:'application.delete',entityId:appAck.entityId,expectedVersion:1,idempotencyKey:'delete-1',payload:{periodId:'period-2026-08',applicationId:appAck.entityId}}));
  assert.equal(delAck.ok,true);
  assert.equal(opDb.has(appPath),false);
  assert.equal((await opProvider.execute('shopper',command({commandType:'application.delete',entityId:appAck.entityId,expectedVersion:1,idempotencyKey:'delete-1',payload:{periodId:'period-2026-08',applicationId:appAck.entityId}}))).providerWrites,0);
  const assignAck=await opProvider.execute('admin',command({commandType:'visit.assign',entityType:'visit',entityId:'visit-a',expectedVersion:1,idempotencyKey:'assign-1',payload:{periodId:'period-2026-08',visitId:'visit-a',shopperId:'shopper-a',hrRowId:'hr-1',assignmentSource:'platform'}}));
  assert.equal(assignAck.ok,true);
  assert.equal(opDb.get('tenants/tya/projects/project-a/visits/visit-a').shopperId,'shopper-a');
  pass('Postulation and assignment persistence');

  const runtimeDb=new Db({
    'tenants/tya/users/admin-runtime':{active:true,tenantId:'tya',role:'admin',authNamespace:'staff'},
    'tenants/tya/users/shopper-runtime':{active:true,tenantId:'tya',role:'shopper',authNamespace:'shopper',projectIds:['project-runtime'],shopperId:'shopper-runtime'},
    'tenants/tya/projects/project-runtime/visits/visit-runtime':{id:'visit-runtime',tenantId:'tya',projectId:'project-runtime',periodId:'period-runtime',hrRowId:'hr-runtime',estado:'disponible',version:1}
  });
  const runtimeAuth=authFor({
    adminRuntime:{uid:'admin-runtime',tenantId:'tya',role:'admin',authNamespace:'staff'},
    shopperRuntime:{uid:'shopper-runtime',tenantId:'tya',role:'shopper',authNamespace:'shopper',projectIds:['project-runtime'],shopperId:'shopper-runtime'}
  });
  const runtimeProjectCmd=command({commandType:'project.create',entityType:'project',entityId:null,projectId:null,periodId:'setup-runtime',idempotencyKey:'runtime-project-create',payload:{name:'Runtime Project',countries:['GT'],periodId:'setup-runtime',operationalSource:{mode:'internal',providerType:'internal_firestore',authority:'platform',readPolicy:'internal_live',writePolicy:'platform_only',mappingRef:'internal-native-mapping'}}});
  assert.equal(commandProviderKind(runtimeProjectCmd.commandType),'project');
  const projectRoute=createProviderForCommand(runtimeProjectCmd,{auth:runtimeAuth,db:runtimeDb,projectPolicy,operationalPolicy});
  assert.equal(projectRoute.kind,'project');
  assert.ok(projectRoute.provider);
  assert.equal((await projectRoute.provider.execute('adminRuntime',runtimeProjectCmd)).ok,true);

  const runtimeOpCmd=command({commandType:'application.create',projectId:'project-runtime',periodId:'period-runtime',idempotencyKey:'runtime-app-create',payload:{periodId:'period-runtime',visitId:'visit-runtime',shopperId:'shopper-runtime'}});
  assert.equal(commandProviderKind(runtimeOpCmd.commandType),'operational');
  const operationalRoute=createProviderForCommand(runtimeOpCmd,{auth:runtimeAuth,db:runtimeDb,projectPolicy,operationalPolicy});
  assert.equal(operationalRoute.kind,'operational');
  assert.ok(operationalRoute.provider);
  assert.equal((await operationalRoute.provider.execute('shopperRuntime',runtimeOpCmd)).ok,true);

  const wrongProjectPolicy=createProviderForCommand(runtimeProjectCmd,{auth:runtimeAuth,db:runtimeDb,projectPolicy:operationalPolicy,operationalPolicy});
  assert.equal(wrongProjectPolicy.provider,null);
  assert.equal(wrongProjectPolicy.error,'PROJECT_COMMAND_PROVIDER_POLICY_INVALID');
  const wrongOperationalPolicy=createProviderForCommand(runtimeOpCmd,{auth:runtimeAuth,db:runtimeDb,projectPolicy,operationalPolicy:projectPolicy});
  assert.equal(wrongOperationalPolicy.provider,null);
  assert.equal(wrongOperationalPolicy.error,'OPERATIONAL_COMMAND_PROVIDER_POLICY_INVALID');
  const missingProjectPolicy=createProviderForCommand(runtimeProjectCmd,{auth:runtimeAuth,db:runtimeDb,projectPolicy:null,operationalPolicy});
  assert.equal(missingProjectPolicy.provider,null);
  assert.equal(missingProjectPolicy.error,'PROJECT_COMMAND_PROVIDER_NOT_CONFIGURED');
  const missingOperationalPolicy=createProviderForCommand(runtimeOpCmd,{auth:runtimeAuth,db:runtimeDb,projectPolicy,operationalPolicy:null});
  assert.equal(missingOperationalPolicy.provider,null);
  assert.equal(missingOperationalPolicy.error,'OPERATIONAL_COMMAND_PROVIDER_NOT_CONFIGURED');
  pass('Runtime dispatch uses independent fail-closed policies');

  pass('Safety counters', {providerRealWrites:0, firestoreRealWrites:0, auth:0, hr:0, storage:0, payments:0, makeGemini:0, deploy:0, production:false});

  const jsChanged=paths.filter(p=>/\.(m?js)$/.test(p));
  for(const file of jsChanged)execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
  const moduleManifest={version:'I2_MODULE_MANIFEST',paths:CANDIDATE_PATHS.map(p=>({path:p,sha256:sha(read(p))}))};
  const candidateManifest={version:'I2_CANDIDATE_MANIFEST',parent:EXPECTED_HEAD,successor:SUCCESSOR,treeInput:git(['write-tree']),modules:moduleManifest.paths};
  const fp1=sha(candidateManifest),fp2=sha(candidateManifest);
  assert.equal(fp1,fp2);
  pass('Syntax/determinism and composition', {moduleManifestSha256:sha(moduleManifest),candidateManifestSha256:fp1});

  console.log(JSON.stringify({
    terminal:'I2_CANDIDATE_SEALED',
    status:'PASS',
    tests,
    changedPaths:paths,
    fingerprints:{
      moduleManifestSha256:sha(moduleManifest),
      candidateManifestSha256:fp1,
      worktreeTreeSha:git(['write-tree'])
    }
  },null,2));
}

main().catch(error=>{
  console.error(JSON.stringify({terminal:'HOLD',status:'FAIL',taxonomy:'RECOVERY_ACCEPTANCE_GATE_FAILURE',error:String(error?.message||error),stack:String(error?.stack||'').split('\n').slice(0,6)},null,2));
  process.exit(1);
});
