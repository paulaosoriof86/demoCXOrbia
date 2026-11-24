#!/usr/bin/env bash
set -Eeuo pipefail
image=${1:?Missing deployment image}
[[ "$PROJECT" == cxorbia-backend-dev && "$SERVICE" == cxorbia-live-hr-dev && "$REGION" == us-central1 ]]
settings="$LEGAL_ENABLE_NAME=$LEGAL_ENABLE_VALUE,$LEGAL_GATE_NAME=$LEGAL_GATE_VALUE,$I3_HR_CACHE_PIN_NAME=$I3_HR_CACHE_PIN_VALUE,CXORBIA_RECOVERY_SOURCE_SHA=$FOCAL_SOURCE"
extra=()
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
mailbox_binding="$(node --input-type=module <<'NODE'
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const {PROJECT:project,SERVICE:service,REGION:region}=process.env;
const fail=code=>{throw Error('ENVIRONMENT_FAILURE:P0367_'+code);};
const ensure=(ok,code)=>{if(!ok)fail(code);};
const cli=(args,input)=>spawnSync('gcloud',[...args,'--project='+project,'--quiet','--format=json','--verbosity=error'],{
  input,encoding:'utf8',timeout:45000,maxBuffer:4*1024*1024,
  env:{...process.env,CLOUDSDK_CORE_LOG_HTTP:'false',CLOUDSDK_CORE_VERBOSITY:'error'},stdio:['pipe','pipe','pipe']});
const json=(result,code)=>{if(result.status!==0)fail(code);try{return JSON.parse(result.stdout);}catch{fail(code+'_METADATA_INVALID');}};
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
[[ "$mailbox_binding" =~ ^[A-Za-z0-9_-]+:[1-9][0-9]*$ ]]
settings+=",CXORBIA_USER_MAILBOX_ENABLED=true,CXORBIA_USER_MAILBOX_SEND_ENABLED=false"
secret_bindings+=("CXORBIA_MAILBOX_CREDENTIAL_KEY_B64=$mailbox_binding")
extra+=(--update-secrets "$(IFS=,; printf '%s' "${secret_bindings[*]}")")
gcloud run services update "$SERVICE" --project "$PROJECT" --region "$REGION" --image "$image" \
  --min-instances=1 --max-instances=1 --update-env-vars "$settings" "${extra[@]}" --quiet
