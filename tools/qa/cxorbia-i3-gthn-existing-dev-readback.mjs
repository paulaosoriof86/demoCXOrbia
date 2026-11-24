/* I3 / RUN2753 continuation. Restore one approved project metadata field in DEV,
 * then verify the already deployed artifact. No build/deploy, selector switch,
 * Auth, visit, original HR, mirror, or production writes. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {validateExcelCanonicalHrObservation} from './cxorbia-i3-terminal-hr-observation.mjs';

const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const sha=v=>crypto.createHash('sha256').update(Buffer.isBuffer(v)||typeof v==='string'?v:JSON.stringify(stable(v))).digest('hex');
const same=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
const need=(v,c)=>{if(!v)throw Error(c);};
const stamp=s=>String(s?.updateTime?.seconds??'')+':'+String(s?.updateTime?.nanoseconds??'');
const rest=v=>Object.fromEntries(Object.entries(v).filter(([k])=>k!=='scenarioDimensions'));
const own=(v,k)=>Object.prototype.hasOwnProperty.call(v,k);

export function approvedScenarioDefinitions(raw,fixture,scope){
  need(sha(raw)===fixture.sha256,'SOURCE_FAILURE:SCENARIO_FIXTURE_SHA');
  const text=raw.toString('utf8'),prefix='window.CX_TYA_HR_SOURCE_SAFE = ';
  need(text.includes(prefix)&&text.trimEnd().endsWith(';'),'SOURCE_FAILURE:SCENARIO_FIXTURE_FORMAT');
  const payload=JSON.parse(text.slice(text.indexOf(prefix)+prefix.length).trim().slice(0,-1));
  const definitions=payload.projectConfig?.scenarioDimensions;
  need(payload.tenantId===scope.tenantId&&payload.projectId===scope.projectId&&
    Array.isArray(definitions)&&definitions.length===2&&same(definitions,fixture.definitions)&&
    sha(JSON.stringify(definitions))===fixture.definitionsSha256,'SOURCE_FAILURE:SCENARIO_APPROVED_CATALOG');
  return definitions;
}

function exactProject(snapshot,scope){
  const row=snapshot.data()||{},source=row.operationalSource;
  need(snapshot.exists&&row.tenantId===scope.tenantId&&
    (!row.projectId||row.projectId===scope.projectId),'MAPPING_FAILURE:SCENARIO_PROJECT_SCOPE');
  need(source?.mode==='external'&&source.providerType==='excel_online'&&
    source.readPolicy==='external_live'&&source.writePolicy==='external_read_only'&&
    source.periodDiscovery==='provider_auto'&&Array.isArray(source.countryBindings)&&
    source.countryBindings.length===2,'MAPPING_FAILURE:SCENARIO_SELECTOR_DRIFT');
  return row;
}

export async function restoreScenarioDimensions({db,ref,scope,definitions,onProgress=()=>{}}){
  const before=await ref.get(),row=exactProject(before,scope),beforeStamp=stamp(before);
  const restHash=sha(rest(row)),sourceHash=sha(row.operationalSource);
  const existing=own(row,'scenarioDimensions');
  need(!existing||same(row.scenarioDimensions,definitions),'MAPPING_FAILURE:SCENARIO_CATALOG_CONFLICT');
  const proof={decision:existing?'ALREADY_EXACT':'PENDING',fieldBeforeState:existing?'EXACT':'ABSENT',
    fieldMask:['scenarioDimensions'],projectPath:ref.path,projectUpdateTimeBefore:beforeStamp,
    projectRestSha256Before:restHash,operationalSourceSha256Before:sourceHash,configWrites:0,
    providerAck:false,configReadbackVerified:false,sourceSwitch:false};
  onProgress({...proof,stage:'PREIMAGE_VERIFIED'});
  if(!existing){
    onProgress({...proof,stage:'CAS_DISPATCHED',commitOutcome:'PENDING'});
    await db.runTransaction(async tx=>{
      const current=await tx.get(ref),value=exactProject(current,scope);
      need(stamp(current)===beforeStamp&&sha(rest(value))===restHash&&
        !own(value,'scenarioDimensions'),'PERSISTENCE_FAILURE:SCENARIO_CAS_CONFLICT');
      tx.update(ref,{scenarioDimensions:definitions});
    });
    proof.configWrites=1;proof.providerAck=true;proof.decision='RESTORED_APPROVED_FIELD';
    onProgress({...proof,stage:'REMOTE_COMMIT_ACK'});
  }
  const after=await ref.get(),value=exactProject(after,scope);
  need(same(value.scenarioDimensions,definitions),'PERSISTENCE_FAILURE:SCENARIO_DURABLE_FIELD');
  need(sha(rest(value))===restHash&&sha(value.operationalSource)===sourceHash,
    'PERSISTENCE_FAILURE:SCENARIO_PROJECT_REST_CHANGED');
  need(!existing||stamp(after)===beforeStamp,'PERSISTENCE_FAILURE:SCENARIO_REPLAY_CHANGED');
  Object.assign(proof,{configReadbackVerified:true,fieldAfterSha256:sha(value.scenarioDimensions),
    projectRestSha256After:sha(rest(value)),operationalSourceSha256After:sha(value.operationalSource),
    projectUpdateTimeAfter:stamp(after),idempotentReplay:existing});
  onProgress({...proof,stage:'DURABLE_READBACK_VERIFIED'});
  return proof;
}

export async function observeRestoredScenarioDimensions({ref,scope,definitions,authority}){
  need(authority?.providerAck===true&&authority.configReadbackVerified===true&&authority.configWrites===1,
    'SOURCE_FAILURE:SCENARIO_PRIOR_COMMIT_ACK_REQUIRED');
  const snapshot=await ref.get(),row=exactProject(snapshot,scope);
  need(same(row.scenarioDimensions,definitions)&&stamp(snapshot)===authority.projectUpdateTimeAfter&&
    sha(rest(row))===authority.projectRestSha256After&&
    sha(row.operationalSource)===authority.operationalSourceSha256After,
    'PERSISTENCE_FAILURE:SCENARIO_READONLY_RESTORATION_DRIFT');
  return {decision:'READ_ONLY_EXACT_RESTORATION_OBSERVED',configWrites:0,providerAck:false,
    configReadbackVerified:true,projectUpdateTimeBefore:stamp(snapshot),projectUpdateTimeAfter:stamp(snapshot),
    projectRestSha256Before:sha(rest(row)),projectRestSha256After:sha(rest(row)),sourceSwitch:false};
}

export async function runGthnExistingDevReadback(){
  const e=process.env,requestPath='docs/checkpoints/CXORBIA_I3_RUN2753_EXISTING_DEV_SCENARIO_REPAIR_SCOPE_20261124.json';
  const readonly=e.CXORBIA_F2_DEV_OPERATION==='READBACK_EXISTING_DEV';
  const out=e.QA_OUT||'.tmp/i3-f2-operational-dev',report={schemaVersion:'cxorbia.i3.existing-dev-scenario-restoration-result.v1',
    iteration:'I3',decision:'HOLD',mode:readonly?'READBACK_EXISTING_DEV':'RESTORE_SCENARIO_DIMENSIONS',readOnly:readonly,production:false,i4Authorized:false,
    builds:0,runtimeDeploys:0,hostingDeploys:0,authWrites:0,visitWrites:0,hrOriginalWrites:0,
    googleMirrorWrites:0,commandPosts:0,sourceSwitch:false,newDomainMatches:0,repairProgress:[]};
  fs.mkdirSync(out,{recursive:true});
  const save=()=>fs.writeFileSync(out+'/receipt.json',JSON.stringify(report,null,2)+'\n');
  const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:32*1024*1024}).trim();
  const gcloud=(...args)=>execFileSync('gcloud',args,{encoding:'utf8',stdio:['ignore','pipe','ignore'],timeout:60000}).trim();
  const get=async(url,headers={})=>{
    const r=await fetch(url,{headers,signal:AbortSignal.timeout(210000)});
    const bytes=Buffer.from(await r.arrayBuffer());
    if(!r.ok){
      let body;try{body=JSON.parse(bytes);}catch{}
      const safe=v=>typeof v==='string'&&/^[A-Za-z0-9_:. -]{1,500}$/.test(v)?v:null;
      (report.httpErrors??=[]).push({status:r.status,error:safe(body?.error),
        message:safe(body?.message),lastRefreshError:safe(body?.lastRefreshError)});
      save();throw Error('PROVIDER_FAILURE:EXISTING_DEV_READ_HTTP_'+r.status);
    }
    return bytes;
  };
  const json=async(url,headers)=>JSON.parse((await get(url,headers)).toString('utf8'));
  save();
  try{
    need((readonly?
      e.CXORBIA_F2_SCENARIO_METADATA_GATE==='PAULA_I3_EXISTING_DEV_READONLY_20261124':
      e.CXORBIA_F2_DEV_OPERATION==='RESTORE_SCENARIO_DIMENSIONS'&&e.CXORBIA_F2_SCENARIO_METADATA_GATE==='PAULA_I3_APPROVED_PROJECT_SCENARIOS_DEV_20261124')&&
      e.GITHUB_REPOSITORY==='paulaosoriof86/demoCXOrbia'&&
      e.GITHUB_REF==='refs/heads/recovery/cxorbia-phase-a-20260831'&&
      git('log','-1','--format=%B').includes(readonly?'[i3-hr-uid-readonly]':'[i3-f2-scenario-metadata-dev-once]'),
      'AUTH_FAILURE:SCENARIO_METADATA_DEV_GATE');
    const head=git('rev-parse','HEAD');
    need(head===e.GITHUB_SHA,'RELEASE_COMPOSITION_FAILURE:SCENARIO_CHECKOUT_DRIFT');
    const remote=execFileSync('gh',['api','repos/'+e.GITHUB_REPOSITORY+'/git/ref/heads/recovery/cxorbia-phase-a-20260831','--jq','.object.sha'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
    need(remote===head,'RELEASE_COMPOSITION_FAILURE:SCENARIO_REMOTE_HEAD_DRIFT');
    const r=JSON.parse(fs.readFileSync(requestPath)),scope=r.scope,expected=r.deploymentEvidence;
    need(scope.environment==='cxorbia-backend-dev'&&scope.projectPath==='tenants/tya/projects/cinepolis'&&
      scope.hostingUrl==='https://cxorbia-backend-dev.web.app'&&scope.allowedConfigWrites===1&&
      r.production==='DO_NOT_TOUCH'&&r.i4Authorized===false&&same(scope.fieldMask,['scenarioDimensions']),
      'AUTH_FAILURE:SCENARIO_REQUEST_SCOPE');
    const d=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json')),
      p=JSON.parse(fs.readFileSync('CXORBIA_RECOVERY_EXECUTION_CURRENT.json'));
    need(d.productSourceSha===r.sourceSha&&d.productTreeAuthority===r.sourceTree&&
      d.status==='HOLD_I3_GTHN_PENDING_DEV'&&d.pendingDevSuccessor?.sourceSha===r.sourceSha&&
      d.production==='DO_NOT_TOUCH'&&d.i4Authorized===false&&p.production==='DO_NOT_TOUCH'&&
      p.authorizationI4===false,'RELEASE_COMPOSITION_FAILURE:SCENARIO_CANDIDATE_AUTHORITY');
    need(git('rev-parse',r.sourceSha+'^{tree}')===r.sourceTree,'SOURCE_FAILURE:SCENARIO_SOURCE_TREE');
    git('diff','--exit-code',r.sourceSha,'HEAD','--','app','backend','firebase.json','.firebaserc',
      'firestore.rules','storage.rules','tools/hr-source',':(exclude)backend/runtime/hr-live-service/test/**');
    need(git('rev-parse',r.sourceSha+':'+r.fixture.path)===r.fixture.gitBlob,'SOURCE_FAILURE:SCENARIO_FIXTURE_BLOB');
    const raw=execFileSync('git',['show',r.sourceSha+':'+r.fixture.path],{maxBuffer:32*1024*1024});
    const definitions=approvedScenarioDefinitions(raw,r.fixture,scope);
    Object.assign(report,{source:{sha:r.sourceSha,tree:r.sourceTree},controlHead:head,requestPath,
      requestBlob:git('rev-parse','HEAD:'+requestPath),fixture:r.fixture,scope,readbackRunId:e.GITHUB_RUN_ID,
      readbackRunNumber:e.GITHUB_RUN_NUMBER,deploymentEvidence:expected});
    save();
    async function identity(stage){
      const service=JSON.parse(gcloud('run','services','describe',scope.service,'--project',scope.environment,'--region',scope.region,'--format=json'));
      const positive=(service.status?.traffic||[]).filter(t=>Number(t.percent)>0);
      need(service.status?.latestReadyRevisionName===expected.runtimeRevision&&positive.length===1&&
        positive[0].revisionName===expected.runtimeRevision&&positive[0].percent===100,
        'RELEASE_COMPOSITION_FAILURE:SCENARIO_RUNTIME_TRAFFIC');
      const revision=JSON.parse(gcloud('run','revisions','describe',expected.runtimeRevision,'--project',scope.environment,'--region',scope.region,'--format=json'));
      const containers=revision.spec?.containers||[],digest=String(revision.status?.imageDigest||'').match(/sha256:[a-f0-9]{64}$/)?.[0];
      need(revision.metadata?.name===expected.runtimeRevision&&containers.length===1&&digest===expected.runtimeDigest&&
        containers[0].env?.find(x=>x.name==='CXORBIA_RECOVERY_SOURCE_SHA')?.value===r.sourceSha,
        'RELEASE_COMPOSITION_FAILURE:SCENARIO_RUNTIME_SOURCE_DIGEST');
      const headers={Authorization:'Bearer '+gcloud('auth','print-access-token')};
      const hosting=await json('https://firebasehosting.googleapis.com/v1beta1/sites/'+scope.hostingSite+'/channels/live',headers);
      need(hosting.release?.version?.name===expected.hostingVersion&&hosting.release?.name===expected.hostingRelease,
        'RELEASE_COMPOSITION_FAILURE:SCENARIO_HOSTING_IDENTITY');
      const version=await json('https://firebasehosting.googleapis.com/v1beta1/'+expected.hostingVersion,headers);
      need(version.status==='FINALIZED','RELEASE_COMPOSITION_FAILURE:SCENARIO_HOSTING_NOT_FINALIZED');
      const rules=await json('https://firebaserules.googleapis.com/v1/projects/'+scope.environment+'/releases/cloud.firestore',headers);
      const productionSha256=sha(await get('https://tya-plataforma.web.app/',{'cache-control':'no-cache, no-store'}));
      need(rules.rulesetName===expected.firestoreRuleset&&productionSha256===expected.productionIndexSha256,
        'RELEASE_COMPOSITION_FAILURE:SCENARIO_RULES_OR_PRODUCTION_DRIFT');
      const result={sourceSha:r.sourceSha,sourceTree:r.sourceTree,runtimeRevision:expected.runtimeRevision,
        runtimeDigest:digest,runtimeTrafficExact:true,hostingVersion:version.name,hostingRelease:hosting.release.name,
        hostingFinalized:true,firestoreRuleset:rules.rulesetName,productionIndexSha256:productionSha256};
      fs.writeFileSync(out+'/identity-'+stage+'.json',JSON.stringify(result,null,2)+'\n');return result;
    }
    report.identityBefore=await identity('before');save();
    const {applicationDefault,initializeApp}=await import('firebase-admin/app');
    const {getFirestore}=await import('firebase-admin/firestore');
    const db=getFirestore(initializeApp({credential:applicationDefault(),projectId:scope.environment}));
    const ref=db.doc(scope.projectPath);
    const onProgress=event=>{report.repairProgress.push(event);save();};
    if(readonly){
      const ackPath='docs/checkpoints/CXORBIA_I3_RUN2754_APPROVED_SCENARIO_METADATA_ACK_20261124.json';
      const ack=JSON.parse(fs.readFileSync(ackPath));
      need(ack.source?.sha===r.sourceSha&&ack.source?.tree===r.sourceTree&&
        ack.workflowEvidence?.runId===45351980220,'SOURCE_FAILURE:SCENARIO_ACK_SOURCE_SCOPE');
      report.metadataRestorationEvidence={path:ackPath,gitBlob:git('rev-parse','HEAD:'+ackPath),runId:45351980220,
        configWrites:1,providerAck:true,readbackVerified:true,replayWrites:0,jobConclusion:'failure',failureAfterCommit:ack.error};
      report.repairEvidence=await observeRestoredScenarioDimensions({ref,scope,definitions,authority:ack.repairEvidence});
      report.replayEvidence={decision:'HISTORICAL_REPLAY_ALREADY_PROVEN_RUN2754',configWrites:0};
      save();
    }else{
      report.repairEvidence=await restoreScenarioDimensions({db,ref,scope,definitions,onProgress});save();
      report.replayEvidence=await restoreScenarioDimensions({db,ref,scope,definitions,onProgress});save();
      need(report.replayEvidence.decision==='ALREADY_EXACT'&&report.replayEvidence.configWrites===0&&
        report.repairEvidence.projectUpdateTimeAfter===report.replayEvidence.projectUpdateTimeBefore,
        'PERSISTENCE_FAILURE:SCENARIO_REPLAY_NOT_EXACT');
    }
    const hrUrl=scope.hostingUrl+'/api/'+scope.tenantId+'/'+scope.projectId+'/hr-live';
    const headers={'cache-control':'no-cache, no-store'},started=Date.now();
    const before=await json(hrUrl+'?format=meta&fresh=1&scenarioRepair='+e.GITHUB_RUN_ID,headers);
    const response=await json(hrUrl+'?format=json&scenarioRepair='+e.GITHUB_RUN_ID,headers);
    const after=await json(hrUrl+'?format=meta&scenarioRepair='+e.GITHUB_RUN_ID,headers);
    const hr=response.snapshot||response.data||response;
    report.canonicalIdReadback=validateExcelCanonicalHrObservation({before,response,after,tenantId:scope.tenantId,projectId:scope.projectId});
    need(same(hr.projectConfig?.scenarioDimensions,definitions),'MAPPING_FAILURE:SCENARIO_RUNTIME_CATALOG');
    need(before.projectReadBinding?.providerType==='excel_online'&&before.sourceAccessMode==='make_graph_delegated'&&
      before.providerReadStats?.excelOnlineOriginal?.periodReads===38&&before.refreshError===null,
      'PROVIDER_FAILURE:SCENARIO_EXCEL_PROVIDER_READBACK');
    Object.assign(report,{runtimeConsumerReadbackVerified:true,scenarioDimensionsProven:true,
      hrRevisionAfter:after.revision,hrReadbackDurationMs:Date.now()-started,
      providerReadStats:after.providerReadStats,configuredDimensions:definitions});
    fs.writeFileSync(out+'/hr-meta-before.json',JSON.stringify(before,null,2)+'\n');
    fs.writeFileSync(out+'/hr-meta-after.json',JSON.stringify(after,null,2)+'\n');
    save();
    const served={},entries=Object.entries(r.servedSha256);
    need(entries.length===41,'SOURCE_FAILURE:SCENARIO_ASSET_SCOPE');
    let next=0;
    await Promise.all(Array.from({length:4},async()=>{
      while(next<entries.length){
        const [asset,expectedSha]=entries[next++];
        need(/^[A-Za-z0-9_./-]+$/.test(asset)&&!asset.includes('..'),'SOURCE_FAILURE:SCENARIO_ASSET_PATH');
        const sourceBytes=execFileSync('git',['show',r.sourceSha+':app/'+asset],{maxBuffer:32*1024*1024});
        const remoteBytes=await get(scope.hostingUrl+'/'+asset+'?i3readback='+e.GITHUB_RUN_ID,headers);
        need(sha(sourceBytes)===expectedSha&&remoteBytes.equals(sourceBytes),'RELEASE_COMPOSITION_FAILURE:SCENARIO_SERVED_BYTES:'+asset);
        served[asset]=expectedSha;
      }
    }));
    report.servedSha256=Object.fromEntries(Object.entries(served).sort(([a],[b])=>a.localeCompare(b)));
    report.verifiedServedAssetCount=Object.keys(served).length;save();
    report.identityAfter=await identity('after');
    need(same(report.identityBefore,report.identityAfter),'RELEASE_COMPOSITION_FAILURE:SCENARIO_IDENTITY_CHANGED');
    Object.assign(report,{decision:'PASS_EXISTING_DEV_SOURCE_HR_AND_APPROVED_SCENARIO_METADATA',
      configWrites:report.repairEvidence.configWrites,replayWrites:0,idempotentReplay:true,
      configReadbackVerified:true,sourceHostedExact:true,runtimeTrafficExact:true,hrLiveVerified:true,
      rulesUnchanged:true,productionUnchanged:true,readbackComplete:true});
  }catch(error){
    const message=String(error?.message||error);
    report.error=/^(?:AUTH_FAILURE|SOURCE_FAILURE|MAPPING_FAILURE|PERSISTENCE_FAILURE|PROVIDER_FAILURE|RELEASE_COMPOSITION_FAILURE):[A-Za-z0-9_./:-]+$/.test(message)?message:'ENVIRONMENT_FAILURE:SCENARIO_READBACK_EXECUTION';
    report.configWrites=report.repairProgress.some(x=>x.stage==='REMOTE_COMMIT_ACK')?1:
      report.repairProgress.some(x=>x.stage==='CAS_DISPATCHED')?null:0;
    report.rollbackWrites=0;process.exitCode=1;
  }finally{save();console.log(JSON.stringify({decision:report.decision,configWrites:report.configWrites,
    replayWrites:report.replayWrites,assets:report.verifiedServedAssetCount,hrRevision:report.hrRevisionAfter,error:report.error||null}));}
  return report;
}
