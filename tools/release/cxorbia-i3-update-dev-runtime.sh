#!/usr/bin/env bash
set -Eeuo pipefail
image=${1:?Missing deployment image}
[[ "$PROJECT" == cxorbia-backend-dev && "$SERVICE" == cxorbia-live-hr-dev && "$REGION" == us-central1 ]]
settings="$LEGAL_ENABLE_NAME=$LEGAL_ENABLE_VALUE,$LEGAL_GATE_NAME=$LEGAL_GATE_VALUE,$I3_HR_CACHE_PIN_NAME=$I3_HR_CACHE_PIN_VALUE,CXORBIA_RECOVERY_SOURCE_SHA=$FOCAL_SOURCE"
extra=()
if [[ "$FOCAL_SOURCE" == ff9ac83ea7bbe4ad19e8faf7951ef8256be92671 ]]; then
  [[ "${CXORBIA_PAIRED_BUILD_ID:-}" =~ ^[a-f0-9-]{36}$ ]]
  settings+=",CXORBIA_E10_PAIRED_RUN=$CXORBIA_PAIRED_BUILD_ID"
fi
secret_bindings=()
if [[ "$ACTIVE_STATUS" == HOLD_I3_B14_P0_SOURCE_PROVEN_PENDING_RUNTIME_AND_HOSTING_DEV_6_OF_21 || "$ACTIVE_STATUS" == HOLD_I3_F3_DEV_MATERIALIZED_ENV_REQUIRED ]]; then
  if [[ "$ACTIVE_STATUS" == HOLD_I3_F3_DEV_MATERIALIZED_ENV_REQUIRED ]]; then
    [[ "$PAIR_ENV_ONLY" == true ]]
    node tools/qa/cxorbia-i3-f2-predeploy-proven-predecessor.mjs --reuse
    [[ "$image" == "gcr.io/$PROJECT/$SERVICE@$(jq -r '.currentMaterialization.runtimeDigest' "$CANDIDATE_DESCRIPTOR")" ]]
  fi
  settings+=",CXORBIA_I3_B14_DIRECT_READER_DEV=true,CXORBIA_B14_MAKE_TOOLBOX_URL=https://eu2.make.com/mcp/server/98b29fbe-fbfe-42f2-aeae-e27998eb60c6"
  # The existing writer scenario fences the exact F3 synthetic project/tabs.
  # Operational bindings keep external_read_only and hrWritesEnabled=false.
  settings+=",CXORBIA_F3_HR_FIELDS_ENABLED=true,CXORBIA_F3_MAKE_TOOLBOX_URL=https://eu2.make.com/mcp/server/4b7fc076-74a6-410b-8a7b-937e972e8bbe"
  secret_bindings+=("CXORBIA_B14_MAKE_TOOLBOX_TOKEN=cxorbia-dev-b14-make-toolbox:1" "CXORBIA_F3_MAKE_TOOLBOX_TOKEN=cxorbia-dev-f3-make-toolbox:1")
fi
# P0367: prepare the existing DEV mailbox runtime. Policy may permit SMTP, but the
# send flag below stays false until a separately consented provider proof. This
# does not supply mailbox credentials, read messages or submit SMTP traffic.
mailbox_binding="$(CXORBIA_DEPLOY_IMAGE="$image" node --input-type=module <<'NODE'
import crypto from 'node:crypto';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const {PROJECT:project,SERVICE:service,REGION:region}=process.env;
const fail=code=>{throw Error('ENVIRONMENT_FAILURE:P0367_'+code);};
const ensure=(ok,code)=>{if(!ok)fail(code);};
const cli=(args,input)=>spawnSync('gcloud',[...args,'--project='+project,'--quiet','--format=json','--verbosity=error'],{
  input,encoding:'utf8',timeout:45000,maxBuffer:4*1024*1024,
  env:{...process.env,CLOUDSDK_CORE_LOG_HTTP:'false',CLOUDSDK_CORE_VERBOSITY:'error'},stdio:['pipe','pipe','pipe']});
const json=(result,code)=>{if(result.status!==0)fail(code);try{return JSON.parse(result.stdout);}catch{fail(code+'_METADATA_INVALID');}};
function cliGitStage(pin){
  ensure(/^docs\/checkpoints\/[A-Z0-9_]+\.json$/.test(pin.path)&&/^[0-9a-f]{40}$/.test(pin.gitBlob),'HOLD_STAGE_PIN_INVALID');
  const body=fs.readFileSync(pin.path);
  ensure(crypto.createHash('sha1').update('blob '+body.length+'\0').update(body).digest('hex')===pin.gitBlob,'HOLD_STAGE_BLOB_DRIFT');
  return JSON.parse(body);
}
const codeIs=(result,command,code)=>new RegExp('^ERROR: \\(gcloud\\.'+command.replaceAll('.','\\.')+'\\) '+code+'(?:[ :]|$)','m').test(String(result.stderr||''));
try{
  ensure(project==='cxorbia-backend-dev'&&service==='cxorbia-live-hr-dev'&&region==='us-central1','DEV_SCOPE_REQUIRED');
  const current=json(cli(['run','services','describe',service,'--region='+region]),'RUNTIME_METADATA_UNAVAILABLE');
  let serviceAccount=current.spec?.template?.spec?.serviceAccountName;
  if(!serviceAccount){
    const revision=current.status?.latestReadyRevisionName;
    ensure(typeof revision==='string'&&/^cxorbia-live-hr-dev-[a-z0-9-]+$/.test(revision),'RUNTIME_IDENTITY_REQUIRED');
    serviceAccount=json(cli(['run','revisions','describe',revision,'--region='+region]),'RUNTIME_REVISION_METADATA_UNAVAILABLE').spec?.serviceAccountName;
  }
  ensure(typeof serviceAccount==='string'&&/^[A-Za-z0-9_.+-]+@[A-Za-z0-9.-]+\.gserviceaccount\.com$/.test(serviceAccount),'RUNTIME_IDENTITY_REQUIRED');
  const entries=current.spec?.template?.spec?.containers?.[0]?.env||[];
  const found=entries.filter(row=>row.name==='CXORBIA_MAILBOX_CREDENTIAL_KEY_B64');
  ensure(found.length<=1,'DUPLICATE_KEY_BINDING');
  const mounted=found[0]?.valueFrom?.secretKeyRef;
  ensure(!found.length||mounted,'PLAINTEXT_KEY_MIGRATION_REQUIRED');
  const descriptor=process.env.CANDIDATE_DESCRIPTOR?JSON.parse(fs.readFileSync(process.env.CANDIDATE_DESCRIPTOR,'utf8')):{};
  const {E10}=await import('./tools/release/cxorbia-i3-e10-rules-contract.mjs');
  if(process.env.FOCAL_SOURCE===E10.source){
    ensure(process.env.FOCAL_TREE===E10.tree&&descriptor.pendingDevSuccessor?.sourceSha===E10.source,'EXACT_SOURCE_REQUIRED');
    const name='cxorbia-dev-user-mailbox-credential-key';
    ensure(!found.length||(mounted.name===name&&mounted.key==='1'),'EXISTING_KEY_DRIFT');
    const version=json(cli(['secrets','versions','describe','1','--secret='+name]),'SECRET_VERSION_UNAVAILABLE');
    ensure(version.state==='ENABLED'&&[project,current.metadata?.namespace].some(id=>id&&version.name==='projects/'+id+'/secrets/'+name+'/versions/1'),'SECRET_VERSION_DRIFT');
    const policy=json(cli(['secrets','get-iam-policy',name]),'SECRET_IAM_READ_FAILED');
    ensure(policy.bindings?.some(b=>b.role==='roles/secretmanager.secretAccessor'&&!b.condition&&b.members?.includes('serviceAccount:'+serviceAccount)),'SECRET_ACCESSOR_REQUIRED');
    console.log(name+':1');
    process.exit(0);
  }
  const hold=descriptor.currentMailboxEnvironmentHold;
  if(hold?.state==='HOLD_MAIL_UNCONFIGURED'){
    const resume=descriptor.pairedBuildResumeRequest,pending=descriptor.pendingDevSuccessor;
    const newBuild=!resume&&pending?.state==='P0_PROVEN_PENDING_DEV_MATERIALIZATION'&&pending.scope==='RUNTIME_AND_HOSTING'&&pending.production===false&&pending.devPublished===false;
    ensure(descriptor.status==='HOLD_I3_GTHN_PENDING_DEV'&&(resume?.state==='RESUME_EXACT_SUCCESSFUL_BUILD'||newBuild),'HOLD_EXECUTION_MODE_INVALID');
    ensure(hold.classification==='ENVIRONMENT_FAILURE'&&hold.production===false&&descriptor.i4Authorized!==true,'HOLD_SCOPE_INVALID');
    ensure(hold.sourceSha===process.env.FOCAL_SOURCE&&hold.sourceSha===descriptor.productSourceSha&&hold.sourceTree===descriptor.productTreeAuthority,'HOLD_SOURCE_DRIFT');
    const stagePin=pending?.physicalPredecessor?.stageReceipt;
    let physicalRevision=hold.runtimeRevision;
    if(stagePin){
      const stage=cliGitStage(stagePin);
      ensure(stage.native.id===pending.physicalPredecessor.failedBuildId&&stage.native.status==='FAILURE'&&
        stage.production===false&&stage.identity.sourceSha===pending.previousApprovedSourceSha&&
        stage.native.predecessorReceiptBlob===descriptor.postDeployRunSeal.receiptBlob,'HOLD_PARTIAL_PREDECESSOR_DRIFT');
      physicalRevision=stage.identity.runtimeRevision;
    }
    ensure(physicalRevision===current.status?.latestReadyRevisionName,'HOLD_PREDECESSOR_DRIFT');
    if(newBuild){
      ensure(pending.sourceSha===hold.sourceSha&&pending.sourceTree===hold.sourceTree&&pending.sourceTree===process.env.FOCAL_TREE,'HOLD_PENDING_SOURCE_DRIFT');
      const served=descriptor.currentMaterialization,seal=descriptor.postDeployRunSeal;
      ensure(served?.sourceSha!==hold.sourceSha&&served?.runtimeRevision===hold.runtimeRevision&&seal?.runtimeRevision===hold.runtimeRevision&&
        seal.mode==='PREDECESSOR_SERVING_PENDING_SOURCE'&&JSON.stringify(pending.servingPairedMaterialization)===JSON.stringify(served)&&
        JSON.stringify(pending.servingRuntimeSeal)===JSON.stringify(seal),'HOLD_PREDECESSOR_DRIFT');
      let build;try{build=JSON.parse(fs.readFileSync(process.env.FOCAL_OUT+'/build.json','utf8'));}catch{fail('HOLD_BUILD_RECEIPT_REQUIRED');}
      ensure(build.builds===1&&build.production===false&&build.sourceSha===hold.sourceSha&&build.sourceTree===hold.sourceTree&&
        build.imageTag===process.env.CXORBIA_DEPLOY_IMAGE,'HOLD_BUILD_IDENTITY');
    }else ensure(hold.failedRunId===resume.originalBuildRunId,'HOLD_PREDECESSOR_DRIFT');
    ensure(!found.length&&['CXORBIA_USER_MAILBOX_ENABLED','CXORBIA_USER_MAILBOX_SEND_ENABLED'].every(name=>entries.filter(e=>e.name===name).every(e=>e.value==='false')),'HOLD_REQUIRES_UNCONFIGURED_RUNTIME');
    const lookup=cli(['secrets','describe','cxorbia-dev-user-mailbox-credential-key']);
    const recognized=String(lookup.stderr||'').match(/^ERROR: \(gcloud\.secrets\.describe\) (NOT_FOUND|PERMISSION_DENIED|UNAVAILABLE|FAILED_PRECONDITION|UNAUTHENTICATED|RESOURCE_EXHAUSTED)(?:[ :]|$)/m)?.[1];
    const proof={decision:'HOLD_E08_MAILBOX_UNCONFIGURED',sourceSha:hold.sourceSha,sourceTree:hold.sourceTree,predecessorRuntime:physicalRevision,failedRunId:hold.failedRunId,secretMetadataOutcome:lookup.status===0?'METADATA_ACCESSIBLE':recognized||'UNCLASSIFIED_PROVIDER_ERROR',keyMounted:false,mailboxEnabled:false,sendEnabled:false,secretWrites:0,iamWrites:0,credentialReads:0,smtpSends:0,production:false};
    if(process.env.FOCAL_OUT)fs.writeFileSync(process.env.FOCAL_OUT+'/mailbox-environment-readback.json',JSON.stringify(proof,null,2)+'\n');
    console.error('CXORBIA_MAILBOX_ENVIRONMENT_HOLD='+JSON.stringify(proof));
    console.log('HOLD_MAIL_UNCONFIGURED');process.exit(0);
  }
  let secret=mounted?.name||'cxorbia-dev-user-mailbox-credential-key';
  const annotation=current.spec?.template?.metadata?.annotations?.['run.googleapis.com/secrets']||current.metadata?.annotations?.['run.googleapis.com/secrets']||'';
  for(const item of annotation.split(',')){const at=item.indexOf(':');if(at>0&&item.slice(0,at).trim()===secret){secret=item.slice(at+1).trim();break;}}
  if(secret.startsWith('projects/')){
    const match=secret.match(/^projects\/([A-Za-z0-9-]+)\/secrets\/([A-Za-z0-9_-]{1,255})$/);
    ensure(match&&[project,String(current.metadata?.namespace||'')].includes(match[1]),'CROSS_PROJECT_KEY_FORBIDDEN');
    secret=match[2];
  }
  ensure(/^[A-Za-z0-9_-]{1,255}$/.test(secret),'SECRET_NAME_INVALID');
  const description=cli(['secrets','describe',secret]);
  if(description.status!==0){
    ensure(codeIs(description,'secrets.describe','NOT_FOUND'),'SECRET_LOOKUP_FAILED');
    // A missing previously mounted key is recovery, never permission to rotate.
    ensure(!mounted,'EXISTING_MOUNTED_SECRET_MISSING');
    const random=crypto.randomBytes(32),payload=Buffer.from(random.toString('base64'),'utf8');random.fill(0);
    let created;
    try{created=cli(['secrets','create',secret,'--replication-policy=automatic','--data-file=-'],payload);}finally{payload.fill(0);}
    if(created.status!==0){
      // A concurrent create may win. Reuse it; never append another version.
      ensure(codeIs(created,'secrets.create','ALREADY_EXISTS'),'SECRET_CREATE_FAILED');
      json(cli(['secrets','describe',secret]),'SECRET_RACE_READBACK_FAILED');
    }else json(created,'SECRET_CREATE_FAILED');
  }else json(description,'SECRET_METADATA_INVALID');
  const requested=mounted?.key||'latest';
  ensure(/^(?:[1-9][0-9]*|[A-Za-z][A-Za-z0-9_-]{0,62})$/.test(requested),'SECRET_VERSION_REFERENCE_INVALID');
  const version=json(cli(['secrets','versions','describe',requested,'--secret='+secret]),'SECRET_VERSION_UNAVAILABLE');
  const versionName=String(version.name||'').match(/^projects\/([A-Za-z0-9-]+)\/secrets\/([A-Za-z0-9_-]+)\/versions\/([1-9][0-9]*)$/);
  ensure(versionName&&versionName[2]===secret&&[project,String(current.metadata?.namespace||'')].includes(versionName[1])&&version.state==='ENABLED','SECRET_VERSION_NOT_ENABLED');
  if(/^[1-9][0-9]*$/.test(requested))ensure(versionName[3]===requested,'MOUNTED_VERSION_CHANGED');
  const member='serviceAccount:'+serviceAccount,role='roles/secretmanager.secretAccessor';
  const policy=json(cli(['secrets','get-iam-policy',secret]),'SECRET_IAM_READ_FAILED');
  if(!(policy.bindings||[]).some(binding=>binding.role===role&&!binding.condition&&binding.members?.includes(member))){
    const updated=json(cli(['secrets','add-iam-policy-binding',secret,'--member='+member,'--role='+role,'--condition=None']),'SECRET_IAM_GRANT_FAILED');
    ensure((updated.bindings||[]).some(binding=>binding.role===role&&!binding.condition&&binding.members?.includes(member)),'SECRET_IAM_GRANT_UNCONFIRMED');
  }
  // stdout carries a reference only. No versions access, key value or credential.
  console.log(secret+':'+versionName[3]);
}catch(error){
  const safe=String(error?.message||'').match(/ENVIRONMENT_FAILURE:P0367_[A-Z0-9_]+/);
  console.error(safe?.[0]||'ENVIRONMENT_FAILURE:P0367_MAILBOX_KEY_SETUP_FAILED');process.exitCode=1;
}
NODE
)"
if [[ "$mailbox_binding" == HOLD_MAIL_UNCONFIGURED ]]; then
  settings+=",CXORBIA_USER_MAILBOX_ENABLED=false,CXORBIA_USER_MAILBOX_SEND_ENABLED=false"
else
  [[ "$mailbox_binding" =~ ^[A-Za-z0-9_-]+:[1-9][0-9]*$ ]]
  settings+=",CXORBIA_USER_MAILBOX_ENABLED=true,CXORBIA_USER_MAILBOX_SEND_ENABLED=false"
  secret_bindings+=("CXORBIA_MAILBOX_CREDENTIAL_KEY_B64=$mailbox_binding")
fi
if ((${#secret_bindings[@]})); then extra+=(--update-secrets "$(IFS=,; printf '%s' "${secret_bindings[*]}")"); fi
gcloud run services update "$SERVICE" --project "$PROJECT" --region "$REGION" --image "$image" \
  --min-instances=1 --max-instances=1 --update-env-vars "$settings" "${extra[@]}" --quiet
