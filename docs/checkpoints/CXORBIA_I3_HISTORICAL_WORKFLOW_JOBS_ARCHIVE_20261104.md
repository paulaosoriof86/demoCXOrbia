# CXOrbia I3 — frozen historical GitHub Action jobs (size remediation)

Archived on 2026-11-04 from canonical workflow as served at Git commit `5cc2cc5a3599e0d96598d774a38921ee28e3331b`.
This is a **read-only provenance archive, not a new workflow or deploy mechanism**. Six jobs were gated to obsolete exact statuses/source hashes and had no incoming dependent jobs. Their existing IDs remain as explicit disabled stubs in the sole live workflow. Preserve these scripts for historical trace; do not run them, reauthorize historical gates, or infer new certificate PASS.

## 1. vrm078-external-project-live

Original 10025 bytes. Original job definition, verbatim:

```yaml
  vrm078-external-project-live:
   needs: canonical-candidate-authority
   if: ${{ needs.canonical-candidate-authority.outputs.status=='HOLD_VRM078_FINAL_UI_REPROOF_REQUIRED'&&github.event_name=='push'&&contains(github.event.head_commit.message, '[vrm-078-live]') }}
   runs-on: ubuntu-latest
   timeout-minutes: 22
   env:
    VRM078_SOURCE: ${{ needs.canonical-candidate-authority.outputs.source_sha }}
    VRM078_TREE: ${{ needs.canonical-candidate-authority.outputs.source_tree }}
    VRM078_OUT: .tmp/i3-vrm078
    VRM078_ROOT: https://cxorbia-backend-dev.web.app
    EXPECTED_RUNTIME_REVISION: cxorbia-live-hr-dev-00223-tlg
    EXPECTED_RUNTIME_DIGEST: sha256:b34be533f545c6dda7dc9f6c4a1cb0af517aad2aff1d79005412b4a2433d7ecd
   steps:
   - uses: actions/checkout@v4
     with: {fetch-depth: 0}
   - uses: actions/setup-node@v4
     with: {node-version: '24'}
   - name: step
     run: |
      set -Eeuo pipefail
      mkdir -p "$VRM078_OUT"
      test "$VRM078_SOURCE" = "17ffd1cbac4aeee7f6a422b2c27b8d5c6111358f"
      test "$VRM078_TREE" = "b389cec06c8e7c1de1988f76105ddebe42ef303d"
      test "$(git rev-parse "$VRM078_SOURCE^{tree}")" = "$VRM078_TREE"
      git diff --name-only ae6016a03e1943250d91f636132178802f4cb114 "$VRM078_SOURCE" -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source ':(exclude)backend/runtime/hr-live-service/test/**' | tee "$VRM078_OUT/product-diff.txt"
      test "$(wc -l < "$VRM078_OUT/product-diff.txt" | tr -d ' ')" = "1"
      grep -Fxq 'app/modules/proyecto-wizard.js' "$VRM078_OUT/product-diff.txt"
      git show "$VRM078_SOURCE:app/modules/proyecto-wizard.js" > "$VRM078_OUT/proyecto-wizard.js"
      cp tools/qa/cxorbia-i3-vrm078-external-project-live.mjs "$VRM078_OUT/live-proof.mjs"
      node --check "$VRM078_OUT/proyecto-wizard.js"
      node --check "$VRM078_OUT/live-proof.mjs"
      test "$(git diff --name-only "$VRM078_SOURCE" "$GITHUB_SHA" -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source ':(exclude)backend/runtime/hr-live-service/test/**' | wc -l | tr -d ' ')" = "0"
      grep -Fq "providerBindingId=opaqueSourceRef(st.providerBindingId)" "$VRM078_OUT/proyecto-wizard.js"
      grep -Fq "source.mappingRef=opaqueSourceRef(st.mappingRef)" "$VRM078_OUT/proyecto-wizard.js"
      grep -Fq 'No pegues URL, Sheet ID, credenciales ni tokens' "$VRM078_OUT/proyecto-wizard.js"
      grep -Fq 'pendiente de asignar alcance para operarlo' "$VRM078_OUT/proyecto-wizard.js"
      jq -n -S --arg source "$VRM078_SOURCE" --arg tree "$VRM078_TREE" '{decision:"PASS_I3_VRM078_SOURCE_GATE",sourceSha:$source,sourceTree:$tree,ownerPaths:["app/modules/proyecto-wizard.js"],production:false}' > "$VRM078_OUT/source-gate.json"
   - name: step
     run: |
      npm install --no-save --ignore-scripts --package-lock=false firebase-tools@latest firebase-admin@13.4.0 playwright@1.56.1 >/dev/null 2>&1
      npx playwright install chromium >/dev/null 2>&1
   - name: step
     uses: google-github-actions/auth@v2
     with:
      credentials_json: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV }}'
   - uses: google-github-actions/setup-gcloud@v2
     with:
      project_id: ${{ env.PROJECT }}
   - name: step
     run: |
      set -Eeuo pipefail
      gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$VRM078_OUT/runtime.json"
      test "$(jq -r '.status.latestReadyRevisionName // empty' "$VRM078_OUT/runtime.json")" = "$EXPECTED_RUNTIME_REVISION"
      gcloud run revisions describe "$EXPECTED_RUNTIME_REVISION" --project "$PROJECT" --region "$REGION" --format=json > "$VRM078_OUT/runtime-revision.json"
      RAW="$(jq -r '.status.imageDigest // empty' "$VRM078_OUT/runtime-revision.json")"
      if [[ "$RAW" =~ ^sha256:[0-9a-f]{64}$ ]]; then DIGEST="$RAW"; else DIGEST="sha256:${RAW##*@sha256:}"; fi
      test "$DIGEST" = "$EXPECTED_RUNTIME_DIGEST"
   - name: step
     run: |
      set -Eeuo pipefail
      REL="modules/proyecto-wizard.js"
      REMOTE="$VRM078_OUT/precheck.remote"
      MATCH=1
      if ! curl -fsSL --retry 4 --retry-delay 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$VRM078_ROOT/$REL?vrm078pre=$GITHUB_RUN_ID-$(date +%s%N)" -o "$REMOTE"; then MATCH=0
      elif [[ "$(sha256sum "$REMOTE"|awk '{print $1}')" != "$(git show "$VRM078_SOURCE:app/$REL" | sha256sum | awk '{print $1}')" ]]; then MATCH=0
      fi
      DEPLOYED=0
      if [[ "$MATCH" != "1" ]]; then
        SOURCE_DIR="$RUNNER_TEMP/cxorbia-vrm078-source"; rm -rf "$SOURCE_DIR"; mkdir -p "$SOURCE_DIR"
        git archive "$VRM078_SOURCE" | tar -x -C "$SOURCE_DIR"
        cd "$SOURCE_DIR"
        "$GITHUB_WORKSPACE/node_modules/.bin/firebase" deploy --config firebase.json --only "hosting:$FIREBASE_HOSTING_TARGET" --project "$PROJECT" --non-interactive | tee "$GITHUB_WORKSPACE/$VRM078_OUT/hosting-deploy.log"
        cd "$GITHUB_WORKSPACE"
        DEPLOYED=1
      else
        printf '%s\n' 'Exact VRM-078 bytes already served; no Hosting redeploy.' | tee "$VRM078_OUT/hosting-deploy.log"
      fi
      TOKEN="$(gcloud auth print-access-token)"
      curl --fail --silent --show-error -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$VRM078_OUT/hosting-live-channel.json"
      HOSTING_VERSION="$(jq -r '.release.version.name // empty' "$VRM078_OUT/hosting-live-channel.json")"; test -n "$HOSTING_VERSION"
      echo "VRM078_HOSTING_VERSION=$HOSTING_VERSION" >> "$GITHUB_ENV"
      echo "VRM078_HOSTING_DEPLOYED=$DEPLOYED" >> "$GITHUB_ENV"
   - name: step
     run: |
      set -Eeuo pipefail
      curl -fsSL --retry 8 --retry-delay 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$VRM078_ROOT/modules/proyecto-wizard.js?vrm078=$GITHUB_RUN_ID-$(date +%s%N)" -o "$VRM078_OUT/proyecto-wizard.remote"
      test "$(sha256sum "$VRM078_OUT/proyecto-wizard.remote"|awk '{print $1}')" = "$(git show "$VRM078_SOURCE:app/modules/proyecto-wizard.js" | sha256sum | awk '{print $1}')"
   - name: step
     run: |
      set -Eeuo pipefail
      VRM078_OUT="$VRM078_OUT" VRM078_ROOT="$VRM078_ROOT" VRM078_SOURCE="$VRM078_SOURCE" timeout --signal=TERM --kill-after=20s 12m node "$VRM078_OUT/live-proof.mjs" | tee "$VRM078_OUT/live.log"
      test "$(jq -r '.decision' "$VRM078_OUT/result.json")" = "PASS_I3_VRM078_EXTERNAL_PROJECT_CREATE_READBACK"
      test "$(jq -r '.providerAck' "$VRM078_OUT/result.json")" = "true"
      test "$(jq -r '.durableReadback' "$VRM078_OUT/result.json")" = "true"
      test "$(jq -r '.browserWizard' "$VRM078_OUT/result.json")" = "true"
      test "$(jq -r '.browserState.present' "$VRM078_OUT/result.json")" = "true"
      test "$(jq -r '.noDuplicateRegression' "$VRM078_OUT/result.json")" = "true"
      test "$(jq -r '.browserRegistryReadback' "$VRM078_OUT/result.json")" = "true"
      test "$(jq -r '.noSilentEntitlementInheritance' "$VRM078_OUT/result.json")" = "true"
      test "$(jq -r '.cleanup.projectDeleted' "$VRM078_OUT/result.json")" = "true"
      test "$(jq -r '.cleanup.receiptsAfter' "$VRM078_OUT/result.json")" = "0"
      test "$(jq -r '.cleanup.auditsAfter' "$VRM078_OUT/result.json")" = "0"
   - name: step
     if: always()
     run: |
      node --input-type=module <<'NODE' | tee "$VRM078_OUT/emergency-cleanup.json"
      import crypto from 'node:crypto';
      import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
      import {getFirestore} from 'firebase-admin/firestore';
      if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
      const db=getFirestore(),tenant=db.collection('tenants').doc('tya'),run=String(process.env.GITHUB_RUN_ID);
      const name='QA External Source '+run;
      const normalized=name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
      const id='prj-'+crypto.createHash('sha256').update('tya\0'+normalized).digest('hex').slice(0,20);
      const p=tenant.collection('projects').doc(id),r=await tenant.collection('commandReceipts').where('projectId','==',id).get(),a=await tenant.collection('entityAuditTrail').where('projectId','==',id).get();
      const b=db.batch();let writes=0;r.docs.forEach(d=>{b.delete(d.ref);writes++;});a.docs.forEach(d=>{b.delete(d.ref);writes++;});if((await p.get()).exists){b.delete(p);writes++;}if(writes)await b.commit();
      const check=await p.get(),r2=await tenant.collection('commandReceipts').where('projectId','==',id).get(),a2=await tenant.collection('entityAuditTrail').where('projectId','==',id).get();
      const out={decision:!check.exists&&r2.empty&&a2.empty?'PASS_VRM078_QA_CLEANUP':'FAIL_VRM078_QA_CLEANUP',projectId:id,writes,projectDeleted:!check.exists,receiptsAfter:r2.size,auditsAfter:a2.size,production:false};
      console.log(JSON.stringify(out));
      if(out.decision!=='PASS_VRM078_QA_CLEANUP')process.exit(1);
      NODE
   - name: step
     run: |
      set -Eeuo pipefail
      jq -n -S --arg source "$VRM078_SOURCE" --arg tree "$VRM078_TREE" --arg runtime "$EXPECTED_RUNTIME_REVISION" --arg digest "$EXPECTED_RUNTIME_DIGEST" --arg hosting "$VRM078_HOSTING_VERSION" --argjson hostingDeploys "$VRM078_HOSTING_DEPLOYED" '{decision:"PASS_I3_VRM078_OWNER_SPECIFIC_RECEIPT",moduleDomain:"projects-periods-hr-source-wizard-multiproject",sourceSha:$source,sourceTree:$tree,runtimeRevision:$runtime,runtimeDigest:$digest,hostingVersion:$hosting,hrRevision:null,ownerPaths:["app/modules/proyecto-wizard.js"],actionReal:true,providerAck:true,durableReadback:true,reloadProof:true,noDuplicateRegression:true,qaCleanup:true,production:false,builds:0,runtimeDeploys:0,hostingDeploys:$hostingDeploys,hrWrites:0,externalWrites:0}' > "$VRM078_OUT/owner-receipt.json"
   - if: always()
     uses: actions/upload-artifact@v4
     with:
      name: cxorbia-i3-vrm078-${{ github.run_id }}
      path: ${{ env.VRM078_OUT }}
      if-no-files-found: error
      retention-days: 30
      compression-level: 0
      include-hidden-files: true
```

## 2. vrm079-documents-resources-live

Original 9406 bytes. Original job definition, verbatim:

```yaml
  vrm079-documents-resources-live:
   needs: canonical-candidate-authority
   if: ${{ needs.canonical-candidate-authority.outputs.status=='HOLD_VRM079_LIVE_REPROOF_REQUIRED'&&github.event_name=='push'&&contains(github.event.head_commit.message, '[vrm-079-live]') }}
   runs-on: ubuntu-latest
   timeout-minutes: 22
   env:
    VRM079_SOURCE: ${{ needs.canonical-candidate-authority.outputs.source_sha }}
    VRM079_TREE: ${{ needs.canonical-candidate-authority.outputs.source_tree }}
    VRM079_OUT: .tmp/i3-vrm079
    VRM079_ROOT: https://cxorbia-backend-dev.web.app
    EXPECTED_RUNTIME_REVISION: cxorbia-live-hr-dev-00223-tlg
    EXPECTED_RUNTIME_DIGEST: sha256:b34be533f545c6dda7dc9f6c4a1cb0af517aad2aff1d79005412b4a2433d7ecd
   steps:
   - uses: actions/checkout@v4
     with: {fetch-depth: 0}
   - uses: actions/setup-node@v4
     with: {node-version: '24'}
   - name: step
     run: |
      set -Eeuo pipefail
      mkdir -p "$VRM079_OUT"
      test "$VRM079_SOURCE" = "6877b38171a3b1ef8caf88734d0884a31ebef639"
      test "$VRM079_TREE" = "67a8f88c606332fc3be2251afaf8f1ba40da0047"
      test "$(git rev-parse "$VRM079_SOURCE^{tree}")" = "$VRM079_TREE"
      git diff --name-only 17ffd1cbac4aeee7f6a422b2c27b8d5c6111358f "$VRM079_SOURCE" -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source ':(exclude)backend/runtime/hr-live-service/test/**' | tee "$VRM079_OUT/product-diff.txt"
      test "$(wc -l < "$VRM079_OUT/product-diff.txt" | tr -d ' ')" = "1"
      grep -Fxq 'app/modules/documentos.js' "$VRM079_OUT/product-diff.txt"
      git show "$VRM079_SOURCE:app/modules/documentos.js" > "$VRM079_OUT/documentos.js"
      cp tools/qa/cxorbia-i3-vrm079-documents-resources-live.mjs "$VRM079_OUT/live-proof.mjs"
      node --check "$VRM079_OUT/documentos.js"
      node --check "$VRM079_OUT/live-proof.mjs"
      test "$(git diff --name-only "$VRM079_SOURCE" "$GITHUB_SHA" -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source ':(exclude)backend/runtime/hr-live-service/test/**' | wc -l | tr -d ' ')" = "0"
      grep -Fq "＋ Agregar recurso" "$VRM079_OUT/documentos.js"
      grep -Fq "Archivos binarios no disponibles en este entorno" "$VRM079_OUT/documentos.js"
      grep -Fq "Guardar recurso" "$VRM079_OUT/documentos.js"
      jq -n -S --arg source "$VRM079_SOURCE" --arg tree "$VRM079_TREE" '{decision:"PASS_I3_VRM079_SOURCE_GATE",sourceSha:$source,sourceTree:$tree,ownerPaths:["app/modules/documentos.js"],storageRulesChanged:false,production:false}' > "$VRM079_OUT/source-gate.json"
   - name: step
     run: |
      npm install --no-save --ignore-scripts --package-lock=false firebase-tools@latest firebase-admin@13.4.0 playwright@1.56.1 >/dev/null 2>&1
      npx playwright install chromium >/dev/null 2>&1
   - name: step
     uses: google-github-actions/auth@v2
     with:
      credentials_json: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV }}'
   - uses: google-github-actions/setup-gcloud@v2
     with:
      project_id: ${{ env.PROJECT }}
   - name: step
     run: |
      set -Eeuo pipefail
      gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$VRM079_OUT/runtime.json"
      test "$(jq -r '.status.latestReadyRevisionName // empty' "$VRM079_OUT/runtime.json")" = "$EXPECTED_RUNTIME_REVISION"
      gcloud run revisions describe "$EXPECTED_RUNTIME_REVISION" --project "$PROJECT" --region "$REGION" --format=json > "$VRM079_OUT/runtime-revision.json"
      RAW="$(jq -r '.status.imageDigest // empty' "$VRM079_OUT/runtime-revision.json")"
      if [[ "$RAW" =~ ^sha256:[0-9a-f]{64}$ ]]; then DIGEST="$RAW"; else DIGEST="sha256:${RAW##*@sha256:}"; fi
      test "$DIGEST" = "$EXPECTED_RUNTIME_DIGEST"
   - name: step
     run: |
      set -Eeuo pipefail
      git show "$VRM079_SOURCE:storage.rules" > "$VRM079_OUT/storage.rules"
      grep -Eq 'allow read, write: if false;' "$VRM079_OUT/storage.rules"
   - name: step
     run: |
      set -Eeuo pipefail
      REL="modules/documentos.js"
      REMOTE="$VRM079_OUT/precheck.remote"
      MATCH=1
      if ! curl -fsSL --retry 4 --retry-delay 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$VRM079_ROOT/$REL?vrm079pre=$GITHUB_RUN_ID-$(date +%s%N)" -o "$REMOTE"; then MATCH=0
      elif [[ "$(sha256sum "$REMOTE"|awk '{print $1}')" != "$(git show "$VRM079_SOURCE:app/$REL" | sha256sum | awk '{print $1}')" ]]; then MATCH=0
      fi
      DEPLOYED=0
      if [[ "$MATCH" != "1" ]]; then
        SOURCE_DIR="$RUNNER_TEMP/cxorbia-vrm079-source"; rm -rf "$SOURCE_DIR"; mkdir -p "$SOURCE_DIR"
        git archive "$VRM079_SOURCE" | tar -x -C "$SOURCE_DIR"
        cd "$SOURCE_DIR"
        "$GITHUB_WORKSPACE/node_modules/.bin/firebase" deploy --config firebase.json --only "hosting:$FIREBASE_HOSTING_TARGET" --project "$PROJECT" --non-interactive | tee "$GITHUB_WORKSPACE/$VRM079_OUT/hosting-deploy.log"
        cd "$GITHUB_WORKSPACE"
        DEPLOYED=1
      else
        printf '%s\n' 'Exact VRM-079 bytes already served; no Hosting redeploy.' | tee "$VRM079_OUT/hosting-deploy.log"
      fi
      TOKEN="$(gcloud auth print-access-token)"
      curl --fail --silent --show-error -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$VRM079_OUT/hosting-live-channel.json"
      HOSTING_VERSION="$(jq -r '.release.version.name // empty' "$VRM079_OUT/hosting-live-channel.json")"; test -n "$HOSTING_VERSION"
      echo "VRM079_HOSTING_VERSION=$HOSTING_VERSION" >> "$GITHUB_ENV"
      echo "VRM079_HOSTING_DEPLOYED=$DEPLOYED" >> "$GITHUB_ENV"
   - name: step
     run: |
      set -Eeuo pipefail
      curl -fsSL --retry 8 --retry-delay 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$VRM079_ROOT/modules/documentos.js?vrm079=$GITHUB_RUN_ID-$(date +%s%N)" -o "$VRM079_OUT/documentos.remote"
      test "$(sha256sum "$VRM079_OUT/documentos.remote"|awk '{print $1}')" = "$(git show "$VRM079_SOURCE:app/modules/documentos.js" | sha256sum | awk '{print $1}')"
   - name: step
     run: |
      set -Eeuo pipefail
      VRM079_OUT="$VRM079_OUT" VRM079_ROOT="$VRM079_ROOT" VRM079_SOURCE="$VRM079_SOURCE" timeout --signal=TERM --kill-after=20s 12m node "$VRM079_OUT/live-proof.mjs" | tee "$VRM079_OUT/live.log"
      test "$(jq -r '.decision' "$VRM079_OUT/result.json")" = "PASS_I3_VRM079_DOCUMENTS_RESOURCES_DURABLE_METADATA"
      test "$(jq -r '.storageState.authorized' "$VRM079_OUT/result.json")" = "false"
      test "$(jq -r '.binaryControl.createModal.fileDisabled' "$VRM079_OUT/result.json")" = "true"
      test "$(jq -r '.binaryControl.editModal.fileDisabled' "$VRM079_OUT/result.json")" = "true"
      test "$(jq -r '.providerAck' "$VRM079_OUT/result.json")" = "true"
      test "$(jq -r '.durableReadback' "$VRM079_OUT/result.json")" = "true"
      test "$(jq -r '.reloadState.visible' "$VRM079_OUT/result.json")" = "true"
      test "$(jq -r '.delete.status' "$VRM079_OUT/result.json")" = "deleted"
      test "$(jq -r '.cleanup.after' "$VRM079_OUT/result.json")" = "0"
      test "$(jq -r '.binaryWrites' "$VRM079_OUT/result.json")" = "0"
   - name: step
     if: always()
     run: |
      node --input-type=module <<'NODE' | tee "$VRM079_OUT/emergency-cleanup.json"
      import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
      import {getFirestore} from 'firebase-admin/firestore';
      if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
      const db=getFirestore(),c=db.collection('tenants').doc('tya').collection('resources'),run=String(process.env.GITHUB_RUN_ID),names=new Set(['QA Resource '+run,'QA Resource '+run+' Updated']);
      const s=await c.where('projectId','==','cinepolis').get(),docs=s.docs.filter(d=>names.has(String(d.data()?.n||'')));
      if(docs.length){const b=db.batch();docs.forEach(d=>b.delete(d.ref));await b.commit();}
      const a=await c.where('projectId','==','cinepolis').get(),left=a.docs.filter(d=>names.has(String(d.data()?.n||'')));
      const out={decision:left.length===0?'PASS_VRM079_QA_CLEANUP':'FAIL_VRM079_QA_CLEANUP',deletedIds:docs.map(d=>d.id),after:left.length,production:false};console.log(JSON.stringify(out));if(left.length)process.exit(1);
      NODE
   - name: step
     run: |
      set -Eeuo pipefail
      jq -n -S --arg source "$VRM079_SOURCE" --arg tree "$VRM079_TREE" --arg runtime "$EXPECTED_RUNTIME_REVISION" --arg digest "$EXPECTED_RUNTIME_DIGEST" --arg hosting "$VRM079_HOSTING_VERSION" --argjson hostingDeploys "$VRM079_HOSTING_DEPLOYED" '{decision:"PASS_I3_VRM079_OWNER_SPECIFIC_RECEIPT",moduleDomain:"documents-resources",sourceSha:$source,sourceTree:$tree,runtimeRevision:$runtime,runtimeDigest:$digest,hostingVersion:$hosting,hrRevision:null,hrIndependent:true,ownerPaths:["app/modules/documentos.js"],actionReal:true,providerAck:true,durableReadback:true,reloadProof:true,noDuplicateRegression:true,qaCleanup:true,binaryStorageAuthorized:false,binaryWrites:0,production:false,builds:0,runtimeDeploys:0,hostingDeploys:$hostingDeploys,storageRuleDeploys:0,hrWrites:0}' > "$VRM079_OUT/owner-receipt.json"
   - if: always()
     uses: actions/upload-artifact@v4
     with:
      name: cxorbia-i3-vrm079-${{ github.run_id }}
      path: ${{ env.VRM079_OUT }}
      if-no-files-found: error
      retention-days: 30
      compression-level: 0
      include-hidden-files: true
```

## 3. vrm080-connected-admin-config-live

Original 10372 bytes. Original job definition, verbatim:

```yaml
  vrm080-connected-admin-config-live:
   needs: canonical-candidate-authority
   if: ${{ needs.canonical-candidate-authority.outputs.status=='HOLD_VRM080_LIVE_REPROOF_REQUIRED'&&github.event_name=='push'&&contains(github.event.head_commit.message, '[vrm-080-live]') }}
   runs-on: ubuntu-latest
   timeout-minutes: 24
   env:
    VRM080_SOURCE: ${{ needs.canonical-candidate-authority.outputs.source_sha }}
    VRM080_TREE: ${{ needs.canonical-candidate-authority.outputs.source_tree }}
    VRM080_OUT: .tmp/i3-vrm080
    VRM080_ROOT: https://cxorbia-backend-dev.web.app
    EXPECTED_RUNTIME_REVISION: cxorbia-live-hr-dev-00223-tlg
    EXPECTED_RUNTIME_DIGEST: sha256:b34be533f545c6dda7dc9f6c4a1cb0af517aad2aff1d79005412b4a2433d7ecd
   steps:
   - uses: actions/checkout@v4
     with: {fetch-depth: 0}
   - uses: actions/setup-node@v4
     with: {node-version: '24'}
   - name: step
     run: |
      set -Eeuo pipefail
      mkdir -p "$VRM080_OUT"
      test "$VRM080_SOURCE" = "77b29e303c825be586a97e159d4d65bfae7e66c8"
      test "$VRM080_TREE" = "279f33d6ad734ac7da9e5764dd05c91cab8882aa"
      test "$(git rev-parse "$VRM080_SOURCE^{tree}")" = "$VRM080_TREE"
      git diff --name-only 6877b38171a3b1ef8caf88734d0884a31ebef639 "$VRM080_SOURCE" -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source ':(exclude)backend/runtime/hr-live-service/test/**' | tee "$VRM080_OUT/product-diff.txt"
      test "$(wc -l < "$VRM080_OUT/product-diff.txt" | tr -d ' ')" = "4"
      for p in app/modules/configuracion.js app/core/config.js app/adapters/cxorbia-cxdata-command-boundary-v1.js app/adapters/cxorbia-command-adapter-v1.js; do grep -Fxq "$p" "$VRM080_OUT/product-diff.txt"; done
      for spec in "app/modules/configuracion.js:configuracion.js" "app/core/config.js:config.js" "app/adapters/cxorbia-cxdata-command-boundary-v1.js:command-boundary.js" "app/adapters/cxorbia-command-adapter-v1.js:command-adapter.js"; do src="${spec%%:*}"; out="${spec##*:}"; git show "$VRM080_SOURCE:$src" > "$VRM080_OUT/$out"; node --check "$VRM080_OUT/$out"; done
      cp tools/qa/cxorbia-i3-vrm080-connected-admin-config-live.mjs "$VRM080_OUT/live-proof.mjs"
      node --check "$VRM080_OUT/live-proof.mjs"
      test "$(git diff --name-only "$VRM080_SOURCE" "$GITHUB_SHA" -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source ':(exclude)backend/runtime/hr-live-service/test/**' | wc -l | tr -d ' ')" = "0"
      grep -Fq "CX.liveUserAdmin=Object.freeze" "$VRM080_OUT/configuracion.js"
      grep -Fq "data-connected-security" "$VRM080_OUT/configuracion.js"
      grep -Fq "TENANT_PLAN_PROVIDER_REQUIRED" "$VRM080_OUT/config.js"
      grep -Fq "__backendAllProjectRecords" "$VRM080_OUT/command-boundary.js"
      grep -Fq "projectId:result?.projectId||command.projectId||null" "$VRM080_OUT/command-adapter.js"
   - name: step
     run: |
      npm install --no-save --ignore-scripts --package-lock=false firebase-tools@latest firebase-admin@13.4.0 playwright@1.56.1 >/dev/null 2>&1
      npx playwright install chromium >/dev/null 2>&1
   - name: step
     uses: google-github-actions/auth@v2
     with:
      credentials_json: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV }}'
   - uses: google-github-actions/setup-gcloud@v2
     with:
      project_id: ${{ env.PROJECT }}
   - name: step
     run: |
      set -Eeuo pipefail
      gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$VRM080_OUT/runtime.json"
      test "$(jq -r '.status.latestReadyRevisionName // empty' "$VRM080_OUT/runtime.json")" = "$EXPECTED_RUNTIME_REVISION"
      gcloud run revisions describe "$EXPECTED_RUNTIME_REVISION" --project "$PROJECT" --region "$REGION" --format=json > "$VRM080_OUT/runtime-revision.json"
      RAW="$(jq -r '.status.imageDigest // empty' "$VRM080_OUT/runtime-revision.json")"
      if [[ "$RAW" =~ ^sha256:[0-9a-f]{64}$ ]]; then DIGEST="$RAW"; else DIGEST="sha256:${RAW##*@sha256:}"; fi
      test "$DIGEST" = "$EXPECTED_RUNTIME_DIGEST"
   - name: step
     run: |
      set -Eeuo pipefail
      MATCH=1
      for rel in modules/configuracion.js core/config.js adapters/cxorbia-cxdata-command-boundary-v1.js adapters/cxorbia-command-adapter-v1.js; do
        remote="$VRM080_OUT/$(echo "$rel"|tr '/' '_').pre"
        curl -fsSL --retry 4 --retry-delay 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$VRM080_ROOT/$rel?vrm080pre=$GITHUB_RUN_ID-$(date +%s%N)" -o "$remote" || { MATCH=0; break; }
        [[ "$(sha256sum "$remote"|awk '{print $1}')" = "$(git show "$VRM080_SOURCE:app/$rel" | sha256sum | awk '{print $1}')" ]] || { MATCH=0; break; }
      done
      DEPLOYED=0
      if [[ "$MATCH" != "1" ]]; then
        SD="$RUNNER_TEMP/cxorbia-vrm080-source";rm -rf "$SD";mkdir -p "$SD";git archive "$VRM080_SOURCE"|tar -x -C "$SD";cd "$SD"
        "$GITHUB_WORKSPACE/node_modules/.bin/firebase" deploy --config firebase.json --only "hosting:$FIREBASE_HOSTING_TARGET" --project "$PROJECT" --non-interactive | tee "$GITHUB_WORKSPACE/$VRM080_OUT/hosting-deploy.log"
        cd "$GITHUB_WORKSPACE";DEPLOYED=1
      fi
      TOKEN="$(gcloud auth print-access-token)"
      curl --fail --silent --show-error -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$VRM080_OUT/hosting-live-channel.json"
      HV="$(jq -r '.release.version.name // empty' "$VRM080_OUT/hosting-live-channel.json")";test -n "$HV"
      echo "VRM080_HOSTING_VERSION=$HV" >> "$GITHUB_ENV";echo "VRM080_HOSTING_DEPLOYED=$DEPLOYED" >> "$GITHUB_ENV"
   - name: step
     run: |
      set -Eeuo pipefail
      for rel in modules/configuracion.js core/config.js adapters/cxorbia-cxdata-command-boundary-v1.js; do
        remote="$VRM080_OUT/$(echo "$rel"|tr '/' '_').remote"
        curl -fsSL --retry 8 --retry-delay 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$VRM080_ROOT/$rel?vrm080=$GITHUB_RUN_ID-$(date +%s%N)" -o "$remote"
        test "$(sha256sum "$remote"|awk '{print $1}')" = "$(git show "$VRM080_SOURCE:app/$rel" | sha256sum | awk '{print $1}')"
      done
   - name: step
     run: |
      set -Eeuo pipefail
      VRM080_OUT="$VRM080_OUT" VRM080_ROOT="$VRM080_ROOT" VRM080_SOURCE="$VRM080_SOURCE" timeout --signal=TERM --kill-after=20s 14m node "$VRM080_OUT/live-proof.mjs" | tee "$VRM080_OUT/live.log"
      test "$(jq -r '.decision' "$VRM080_OUT/result.json")" = "PASS_I3_VRM080_CONNECTED_ADMIN_CONFIG_DURABLE"
      test "$(jq -r '.providerAck' "$VRM080_OUT/result.json")" = "true"
      test "$(jq -r '.durableReadback' "$VRM080_OUT/result.json")" = "true"
      test "$(jq -r '.localStorage.authoritativeWrites' "$VRM080_OUT/result.json")" = "0"
      test "$(jq -r '.cleanup.userResidue' "$VRM080_OUT/result.json")" = "0"
      test "$(jq -r '.cleanup.projectResidue' "$VRM080_OUT/result.json")" = "0"
   - name: step
     if: always()
     run: |
      node --input-type=module <<'NODE' | tee "$VRM080_OUT/emergency-cleanup.json"
      import crypto from 'node:crypto';import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';import {getAuth} from 'firebase-admin/auth';import {getFirestore} from 'firebase-admin/firestore';
      if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
      const db=getFirestore(),auth=getAuth(),t=db.collection('tenants').doc('tya'),run=String(process.env.GITHUB_RUN_ID),uid=('vrm080-'+run).slice(0,120);
      try{await auth.deleteUser(uid);}catch{}await t.collection('users').doc(uid).delete().catch(()=>{});
      const ua=await t.collection('auditLogs').where('targetUid','==',uid).get();if(!ua.empty){const b=db.batch();ua.docs.forEach(d=>b.delete(d.ref));await b.commit();}
      const name='QA Config Project '+run,norm=name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' '),pid='prj-'+crypto.createHash('sha256').update('tya\0'+norm).digest('hex').slice(0,20);
      await t.collection('projects').doc(pid).delete().catch(()=>{});
      for(const col of ['commandReceipts','entityAuditTrail']){const s=await t.collection(col).where('projectId','==',pid).get();if(!s.empty){const b=db.batch();s.docs.forEach(d=>b.delete(d.ref));await b.commit();}}
      const ur=await t.collection('users').doc(uid).get(),pr=await t.collection('projects').doc(pid).get();const out={decision:!ur.exists&&!pr.exists?'PASS_VRM080_QA_CLEANUP':'FAIL_VRM080_QA_CLEANUP',userResidue:ur.exists?1:0,projectResidue:pr.exists?1:0,production:false};console.log(JSON.stringify(out));if(out.decision!=='PASS_VRM080_QA_CLEANUP')process.exit(1);
      NODE
   - name: step
     run: |
      set -Eeuo pipefail
      jq -n -S --arg source "$VRM080_SOURCE" --arg tree "$VRM080_TREE" --arg runtime "$EXPECTED_RUNTIME_REVISION" --arg digest "$EXPECTED_RUNTIME_DIGEST" --arg hosting "$VRM080_HOSTING_VERSION" --argjson hostingDeploys "$VRM080_HOSTING_DEPLOYED" '[
        {decision:"PASS_I3_VRM080_OWNER_SPECIFIC_RECEIPT",moduleDomain:"core-config-data-router-permissions",sourceSha:$source,sourceTree:$tree,runtimeRevision:$runtime,runtimeDigest:$digest,hostingVersion:$hosting,hrRevision:null,hrIndependent:true,ownerPaths:["app/core/config.js","app/modules/configuracion.js"],actionReal:true,providerAck:true,durableReadback:true,reloadProof:true,noDuplicateRegression:true,qaCleanup:true,localStorageAuthoritativeWrites:0,production:false,builds:0,runtimeDeploys:0,hostingDeploys:$hostingDeploys,hrWrites:0},
        {decision:"PASS_I3_VRM080_OWNER_SPECIFIC_RECEIPT",moduleDomain:"persistence-command-ack-boundary",sourceSha:$source,sourceTree:$tree,runtimeRevision:$runtime,runtimeDigest:$digest,hostingVersion:$hosting,hrRevision:null,hrIndependent:true,ownerPaths:["app/adapters/cxorbia-cxdata-command-boundary-v1.js","app/adapters/cxorbia-command-adapter-v1.js"],actionReal:true,providerAck:true,durableReadback:true,reloadProof:true,noDuplicateRegression:true,qaCleanup:true,production:false,builds:0,runtimeDeploys:0,hostingDeploys:$hostingDeploys,hrWrites:0}
      ]' > "$VRM080_OUT/owner-receipts.json"
   - if: always()
     uses: actions/upload-artifact@v4
     with:
      name: cxorbia-i3-vrm080-${{ github.run_id }}
      path: ${{ env.VRM080_OUT }}
      if-no-files-found: error
      retention-days: 30
      compression-level: 0
      include-hidden-files: true
```

## 4. prei4-admin-008-runtime-materialization

Original 9461 bytes. Original job definition, verbatim:

```yaml
  prei4-admin-008-runtime-materialization:
   needs: canonical-candidate-authority
   if: ${{ needs.canonical-candidate-authority.outputs.status=='HOLD_PREI4_ADMIN_008_DEV_RUNTIME_MATERIALIZATION_REQUIRED'&&github.event_name=='push'&&contains(github.event.head_commit.message, '[prei4-admin-008-runtime]') }}
   runs-on: ubuntu-latest
   timeout-minutes: 50
   env:
    PREI4_008_SOURCE: ${{ needs.canonical-candidate-authority.outputs.source_sha }}
    PREI4_008_TREE: ${{ needs.canonical-candidate-authority.outputs.source_tree }}
    PREI4_008_OUT: .tmp/prei4-admin-008-runtime
    PREI4_008_ROOT: https://cxorbia-backend-dev.web.app
    PREI4_008_STALE_REVISION: d068b00c62a940f0ad828436ffcf22fbf1dbb43e763ab4e14854102bf5f84a51
   steps:
   - uses: actions/checkout@v4
     with: {fetch-depth: 0}
   - uses: actions/setup-node@v4
     with: {node-version: '24'}
   - run: |
      set -Eeuo pipefail
      mkdir -p "$PREI4_008_OUT"
      test "$PREI4_008_SOURCE" = "5c472e089e6d8492b184a7cb24e78816d347c2de"
      test "$PREI4_008_TREE" = "8abf63499d3df6ef2a9a8dfa22ca1a080ed67c83"
      test "$(git rev-parse "$PREI4_008_SOURCE^{tree}")" = "$PREI4_008_TREE"
      PRODUCT_DIFF="$(git diff --name-only "09b4e56be96dedbeb89d14f1d190bfc5b8b4f990" "$PREI4_008_SOURCE" -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source | sort)"
      EXPECTED="$(printf '%s\n' 'backend/contracts/tya-cinepolis-cinema-identity-r20-v1.json' 'backend/contracts/tya-hr-column-map-r20-v1.json' 'tools/hr-source/tya-build-live-hr-source-safe-r20.mjs' | sort)"
      test "$PRODUCT_DIFF" = "$EXPECTED"
      git diff --quiet "$PREI4_008_SOURCE" HEAD -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source
      SOURCE_DIR="$RUNNER_TEMP/cxorbia-prei4-admin008-source"
      rm -rf "$SOURCE_DIR"; mkdir -p "$SOURCE_DIR"
      git archive "$PREI4_008_SOURCE" | tar -x -C "$SOURCE_DIR"
      cd "$SOURCE_DIR"
      node --check tools/hr-source/tya-build-live-hr-source-safe-r20.mjs
      node tools/hr-source/tya-build-live-hr-source-safe-r20.mjs --mapping-self-test | tee "$GITHUB_WORKSPACE/$PREI4_008_OUT/mapping-self-test.json"
      node tools/hr-source/tya-build-live-hr-source-safe-r20.mjs --assignment-self-test | tee "$GITHUB_WORKSPACE/$PREI4_008_OUT/assignment-self-test.json"
      test "$(jq -r '.decision' "$GITHUB_WORKSPACE/$PREI4_008_OUT/mapping-self-test.json")" = "PASS_R20_PROJECT_SCOPED_CINEMA_IDENTITY"
      test "$(jq -r '.decision' "$GITHUB_WORKSPACE/$PREI4_008_OUT/assignment-self-test.json")" = "PASS_R20_SHOPPER_ASSIGNMENT_CLASSIFICATION"
      cd "$GITHUB_WORKSPACE"
      echo "SOURCE_DIR=$SOURCE_DIR" >> "$GITHUB_ENV"
   - uses: google-github-actions/auth@v2
     with:
      credentials_json: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV }}'
   - uses: google-github-actions/setup-gcloud@v2
     with:
      project_id: ${{ env.PROJECT }}
   - run: |
      set -Eeuo pipefail
      TOKEN="$(gcloud auth print-access-token)"
      curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$PREI4_008_OUT/hosting-before.json"
      HOSTING_VERSION="$(jq -r '.release.version.name // empty' "$PREI4_008_OUT/hosting-before.json")"; test -n "$HOSTING_VERSION"
      echo "PREI4_008_HOSTING_VERSION=$HOSTING_VERSION" >> "$GITHUB_ENV"
      gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_008_OUT/runtime-before.json"
   - run: |
      set -Eeuo pipefail
      IMAGE_URI="gcr.io/${PROJECT}/${SERVICE}:prei4-admin008-${PREI4_008_SOURCE:0:12}-${GITHUB_RUN_ID}"
      echo "$IMAGE_URI" > "$PREI4_008_OUT/image-uri.txt"
      gcloud builds submit "$SOURCE_DIR" --project "$PROJECT" --config "$SOURCE_DIR/backend/runtime/hr-live-service/cloudbuild.yaml" --substitutions "_IMAGE=$IMAGE_URI" --quiet
   - run: |
      set -Eeuo pipefail
      IMAGE_URI="$(cat "$PREI4_008_OUT/image-uri.txt")"
      gcloud run services update "$SERVICE" --project "$PROJECT" --region "$REGION" --image "$IMAGE_URI" --min-instances=1 --max-instances=1 --update-env-vars "$LEGAL_ENABLE_NAME=$LEGAL_ENABLE_VALUE,$LEGAL_GATE_NAME=$LEGAL_GATE_VALUE,$I3_HR_CACHE_PIN_NAME=$I3_HR_CACHE_PIN_VALUE" --quiet
      gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_008_OUT/runtime-after.json"
      REV="$(jq -r '.status.latestReadyRevisionName // empty' "$PREI4_008_OUT/runtime-after.json")"; test -n "$REV"
      gcloud run revisions describe "$REV" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_008_OUT/runtime-revision.json"
      RAW="$(jq -r '.status.imageDigest // empty' "$PREI4_008_OUT/runtime-revision.json")"
      if [[ "$RAW" =~ ^sha256:[0-9a-f]{64}$ ]]; then DIGEST="$RAW"; elif [[ "$RAW" == *@sha256:* ]]; then DIGEST="sha256:${RAW##*@sha256:}"; else exit 1; fi
      echo "PREI4_008_RUNTIME_REVISION=$REV" >> "$GITHUB_ENV"
      echo "PREI4_008_RUNTIME_DIGEST=$DIGEST" >> "$GITHUB_ENV"
   - run: |
      set -Eeuo pipefail
      ok=0
      for i in $(seq 1 18); do
        URL="$PREI4_008_ROOT/api/$TENANT_ID/$PROJECT_ID/hr-live?fresh=1&prei4admin008=$GITHUB_RUN_ID-$i"
        if curl -fsS --retry 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$URL" > "$PREI4_008_OUT/hr-fresh.json"; then
          if node - "$PREI4_008_OUT/hr-fresh.json" "$PREI4_008_STALE_REVISION" <<'NODE'
      const fs=require('fs');
      const [file,stale]=process.argv.slice(2);
      const d=JSON.parse(fs.readFileSync(file,'utf8'));
      const runtime=d._runtime||{};
      const revision=String(runtime.revision||d.revision||d.sourceRevision||'');
      const refreshError=runtime.refreshError??runtime.lastRefreshError??d.refreshError??d.lastRefreshError??null;
      const summary=Array.isArray(d.periodOperationalSummary)?d.periodOperationalSummary:[];
      const aug=summary.find(x=>String(x.periodKey)==='2026-08');
      const sep=summary.find(x=>String(x.periodKey)==='2026-09');
      const expected={
        aug:{total:44,available:1,assigned:43,unassigned:1,scheduled:0,pendingSchedule:0,realized:43,pendingQuestionnaire:3,questionnaireCompleted:40,pendingSubmission:8,submitted:32,liquidationConfirmed:0,outOfRange:12},
        sep:{total:44,assigned:44,unassigned:0,scheduled:4,pendingSchedule:0,realized:40,pendingQuestionnaire:6,questionnaireCompleted:34,pendingSubmission:7,submitted:27,liquidationConfirmed:0,outOfRange:2,reviewRequired:11}
      };
      function exact(row,want){return row&&Object.entries(want).every(([k,v])=>Number(row[k])===v);}
      const reasons=(d.visits||[]).filter(v=>v.periodKey==='2026-09'&&v.reviewRequired===true).flatMap(v=>v.reviewReasons||[]);
      const septemberSubmittedWithoutQuestionnaire=reasons.filter(x=>x==='submitted_without_questionnaire_date').length;
      const pass=/^[0-9a-f]{64}$/.test(revision)&&revision!==stale&&refreshError==null&&exact(aug,expected.aug)&&exact(sep,expected.sep)&&Number(sep?.byCountry?.GT)===34&&Number(sep?.byCountry?.HN)===10&&Number(sep?.total)===44&&septemberSubmittedWithoutQuestionnaire===11&&d.sourceSafe===true&&d.production===false;
      const receipt={decision:pass?'PASS_PREI4_ADMIN_008_FRESH_HR':'HOLD_PREI4_ADMIN_008_FRESH_HR',revision,staleRevision:stale,refreshError,august:aug||null,september:sep||null,septemberSubmittedWithoutQuestionnaire,sourceSafe:d.sourceSafe===true,production:d.production===true,safeState:d.safeState||null};
      fs.writeFileSync(process.env.PREI4_008_OUT+'/fresh-authority.json',JSON.stringify(receipt,null,2)+'\n');
      console.log(JSON.stringify(receipt,null,2));
      if(!pass)process.exit(1);
      NODE
          then ok=1; break; fi
        fi
        sleep 10
      done
      test "$ok" = 1
      HR_REVISION="$(jq -r '.revision' "$PREI4_008_OUT/fresh-authority.json")"; [[ "$HR_REVISION" =~ ^[0-9a-f]{64}$ ]]
      test "$HR_REVISION" != "$PREI4_008_STALE_REVISION"
      echo "PREI4_008_HR_REVISION=$HR_REVISION" >> "$GITHUB_ENV"
   - run: |
      set -Eeuo pipefail
      TOKEN="$(gcloud auth print-access-token)"
      curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$PREI4_008_OUT/hosting-after.json"
      AFTER="$(jq -r '.release.version.name // empty' "$PREI4_008_OUT/hosting-after.json")"
      test "$AFTER" = "$PREI4_008_HOSTING_VERSION"
      jq -n -S --arg source "$PREI4_008_SOURCE" --arg tree "$PREI4_008_TREE" --arg runtime "$PREI4_008_RUNTIME_REVISION" --arg digest "$PREI4_008_RUNTIME_DIGEST" --arg hosting "$AFTER" --arg hr "$PREI4_008_HR_REVISION" --argjson proofRun 36499124903 '{decision:"PASS_PREI4_ADMIN_008_RUNTIME_FRESH_HR",sourceSha:$source,sourceTree:$tree,runtimeRevision:$runtime,runtimeDigest:$digest,hostingVersion:$hosting,hrRevision:$hr,sourceProofRunId:$proofRun,builds:1,runtimeDeploys:1,hostingDeploys:0,rulesDeploys:0,hrWrites:0,production:false}' > "$PREI4_008_OUT/result.json"
      test "$(jq -r '.decision' "$PREI4_008_OUT/result.json")" = "PASS_PREI4_ADMIN_008_RUNTIME_FRESH_HR"
   - if: always()
     uses: actions/upload-artifact@v4
     with:
      name: cxorbia-prei4-admin-008-runtime-${{ github.run_id }}
      path: ${{ env.PREI4_008_OUT }}
      if-no-files-found: error
      retention-days: 30
      compression-level: 0
      include-hidden-files: true
   - if: always()
     run: rm -rf "$RUNNER_TEMP/cxorbia-prei4-admin008-source"
```

## 5. prei4-admin-002-hosting-live-reproof

Original 8058 bytes. Original job definition, verbatim:

```yaml
  prei4-admin-002-hosting-live-reproof:
   needs: canonical-candidate-authority
   if: ${{ needs.canonical-candidate-authority.outputs.status=='HOLD_PREI4_ADMIN_002_HOSTING_REPROOF_REQUIRED'&&github.event_name=='push'&&contains(github.event.head_commit.message, '[prei4-admin-002-hosting]') }}
   runs-on: ubuntu-latest
   timeout-minutes: 35
   env:
    PREI4_002_SOURCE: ${{ needs.canonical-candidate-authority.outputs.source_sha }}
    PREI4_002_TREE: ${{ needs.canonical-candidate-authority.outputs.source_tree }}
    PREI4_002_LIVE_OUT: .tmp/prei4-admin-002-live
    PREI4_002_ROOT: https://cxorbia-backend-dev.web.app
    PREI4_002_HR_REVISION: c16c18a89675d5c6daff9421604f978a558bc3bf78cf8e6a2da550820ff95e6a
    PREI4_002_EXPECTED_RUNTIME: cxorbia-live-hr-dev-00227-nwl
    PREI4_002_EXPECTED_RUNTIME_DIGEST: sha256:5d4f0504b18be23d1f9f1ef20ff717389d7db3a01f82d898f70873aa3503e31e
   steps:
   - uses: actions/checkout@v4
     with: {fetch-depth: 0}
   - uses: actions/setup-node@v4
     with: {node-version: '24'}
   - run: |
      set -Eeuo pipefail
      mkdir -p "$PREI4_002_LIVE_OUT"
      test "$PREI4_002_SOURCE" = "deb58669ea44b484716b9e0d83656310398ed54c"
      test "$PREI4_002_TREE" = "d494f4f3f8655cfc541b8c83279b6984608fab41"
      test "$(git rev-parse "$PREI4_002_SOURCE^{tree}")" = "$PREI4_002_TREE"
      git diff --name-only "5c472e089e6d8492b184a7cb24e78816d347c2de" "$PREI4_002_SOURCE" -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source | sort > "$PREI4_002_LIVE_OUT/product-diff.txt"
      printf '%s\n' 'app/adapters/tya-cumulative-read-model-v2.js' 'app/core/data.js' 'app/core/tya-phase-a-source-safe-preview.js' 'app/modules/misvisitas.js' 'app/modules/postulaciones.js' | sort > "$PREI4_002_LIVE_OUT/expected-diff.txt"
      diff -u "$PREI4_002_LIVE_OUT/expected-diff.txt" "$PREI4_002_LIVE_OUT/product-diff.txt"
      git diff --quiet "$PREI4_002_SOURCE" HEAD -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source
      node --check tools/qa/cxorbia-prei4-admin002-hosting-live-reproof.mjs
   - run: |
      npm install --no-save --ignore-scripts --package-lock=false firebase-tools@latest firebase-admin@13.4.0 playwright@1.56.1 >/dev/null 2>&1
      npx playwright install chromium >/dev/null 2>&1
   - uses: google-github-actions/auth@v2
     with:
      credentials_json: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV }}'
   - uses: google-github-actions/setup-gcloud@v2
     with:
      project_id: ${{ env.PROJECT }}
   - run: |
      set -Eeuo pipefail
      TOKEN="$(gcloud auth print-access-token)"
      curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$PREI4_002_LIVE_OUT/hosting-before.json"
      gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_002_LIVE_OUT/runtime-before.json"
      REV="$(jq -r '.status.latestReadyRevisionName // empty' "$PREI4_002_LIVE_OUT/runtime-before.json")"
      test "$REV" = "$PREI4_002_EXPECTED_RUNTIME"
      gcloud run revisions describe "$REV" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_002_LIVE_OUT/runtime-revision-before.json"
      RAW="$(jq -r '.status.imageDigest // empty' "$PREI4_002_LIVE_OUT/runtime-revision-before.json")"
      if [[ "$RAW" =~ ^sha256:[0-9a-f]{64}$ ]]; then DIGEST="$RAW"; else DIGEST="sha256:${RAW##*@sha256:}"; fi
      test "$DIGEST" = "$PREI4_002_EXPECTED_RUNTIME_DIGEST"
      BEFORE="$(jq -r '.release.version.name // empty' "$PREI4_002_LIVE_OUT/hosting-before.json")"; test -n "$BEFORE"
      echo "PREI4_002_HOSTING_BEFORE=$BEFORE" >> "$GITHUB_ENV"
   - run: |
      set -Eeuo pipefail
      SOURCE_DIR="$RUNNER_TEMP/cxorbia-prei4-admin002-hosting"
      rm -rf "$SOURCE_DIR"; mkdir -p "$SOURCE_DIR"
      git archive "$PREI4_002_SOURCE" | tar -x -C "$SOURCE_DIR"
      MATCH=1
      while read -r rel; do
        web="${rel#app/}"
        remote="$PREI4_002_LIVE_OUT/pre_$(echo "$web"|tr '/' '_')"
        if ! curl -fsSL --retry 3 --retry-delay 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$PREI4_002_ROOT/$web?prei4002pre=$GITHUB_RUN_ID-$(date +%s%N)" -o "$remote"; then MATCH=0; break; fi
        if [[ "$(sha256sum "$remote"|awk '{print $1}')" != "$(git show "$PREI4_002_SOURCE:$rel" | sha256sum | awk '{print $1}')" ]]; then MATCH=0; break; fi
      done < "$PREI4_002_LIVE_OUT/product-diff.txt"
      DEPLOYED=0
      if [[ "$MATCH" != "1" ]]; then
        cd "$SOURCE_DIR"
        "$GITHUB_WORKSPACE/node_modules/.bin/firebase" deploy --config firebase.json --only "hosting:$FIREBASE_HOSTING_TARGET" --project "$PROJECT" --non-interactive | tee "$GITHUB_WORKSPACE/$PREI4_002_LIVE_OUT/hosting-deploy.log"
        cd "$GITHUB_WORKSPACE"
        DEPLOYED=1
      else
        printf '%s\n' 'Exact ADMIN-002 bytes already served; no Hosting redeploy required.' | tee "$PREI4_002_LIVE_OUT/hosting-deploy.log"
      fi
      echo "PREI4_002_HOSTING_DEPLOYED=$DEPLOYED" >> "$GITHUB_ENV"
      echo "PREI4_002_SOURCE_DIR=$SOURCE_DIR" >> "$GITHUB_ENV"
   - run: |
      set -Eeuo pipefail
      while read -r rel; do
        web="${rel#app/}"
        remote="$PREI4_002_LIVE_OUT/served_$(echo "$web"|tr '/' '_')"
        curl -fsSL --retry 10 --retry-delay 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$PREI4_002_ROOT/$web?prei4002=$GITHUB_RUN_ID-$(date +%s%N)" -o "$remote"
        test "$(sha256sum "$remote"|awk '{print $1}')" = "$(git show "$PREI4_002_SOURCE:$rel" | sha256sum | awk '{print $1}')"
      done < "$PREI4_002_LIVE_OUT/product-diff.txt"
   - run: |
      set -Eeuo pipefail
      node tools/qa/cxorbia-prei4-admin002-hosting-live-reproof.mjs | tee "$PREI4_002_LIVE_OUT/console.log"
      test "$(jq -r '.decision' "$PREI4_002_LIVE_OUT/result.json")" = "PASS_PREI4_ADMIN_002_HOSTING_LIVE"
      test "$(jq -r '.admin.initial.active' "$PREI4_002_LIVE_OUT/result.json")" = "0"
      test "$(jq -r '.admin.initial.archived' "$PREI4_002_LIVE_OUT/result.json")" = "12"
      test "$(jq -r '.admin.initial.synthetic' "$PREI4_002_LIVE_OUT/result.json")" = "0"
      test "$(jq -r '.shopper.proof.active' "$PREI4_002_LIVE_OUT/result.json")" = "0"
      test "$(jq -r '.firestoreWrites' "$PREI4_002_LIVE_OUT/result.json")" = "0"
      test "$(jq -r '.hrWrites' "$PREI4_002_LIVE_OUT/result.json")" = "0"
   - run: |
      set -Eeuo pipefail
      TOKEN="$(gcloud auth print-access-token)"
      curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$PREI4_002_LIVE_OUT/hosting-after.json"
      AFTER="$(jq -r '.release.version.name // empty' "$PREI4_002_LIVE_OUT/hosting-after.json")"; test -n "$AFTER"
      gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$PREI4_002_LIVE_OUT/runtime-after.json"
      test "$(jq -r '.status.latestReadyRevisionName // empty' "$PREI4_002_LIVE_OUT/runtime-after.json")" = "$PREI4_002_EXPECTED_RUNTIME"
      jq -n -S --arg source "$PREI4_002_SOURCE" --arg tree "$PREI4_002_TREE" --arg before "$PREI4_002_HOSTING_BEFORE" --arg after "$AFTER" --arg runtime "$PREI4_002_EXPECTED_RUNTIME" --arg digest "$PREI4_002_EXPECTED_RUNTIME_DIGEST" --arg hr "$PREI4_002_HR_REVISION" --argjson deploys "$PREI4_002_HOSTING_DEPLOYED" '{decision:"PASS_PREI4_ADMIN_002_HOSTING_RECEIPT",sourceSha:$source,sourceTree:$tree,hostingBefore:$before,hostingAfter:$after,hostingDeploys:$deploys,runtimeRevision:$runtime,runtimeDigest:$digest,hrRevision:$hr,runtimeDeploys:0,rulesDeploys:0,firestoreWrites:0,hrWrites:0,production:false}' > "$PREI4_002_LIVE_OUT/receipt.json"
   - if: always()
     uses: actions/upload-artifact@v4
     with:
      name: cxorbia-prei4-admin-002-hosting-live-${{ github.run_id }}
      path: ${{ env.PREI4_002_LIVE_OUT }}
      if-no-files-found: error
      retention-days: 30
      compression-level: 0
      include-hidden-files: true
   - if: always()
     run: rm -rf "$RUNNER_TEMP/cxorbia-prei4-admin002-hosting"
```

## 6. pre-i4-cert-res-dev-materialization

Original 10936 bytes. Original job definition, verbatim:

```yaml
  pre-i4-cert-res-dev-materialization:
   needs: canonical-candidate-authority
   if: ${{ needs.canonical-candidate-authority.outputs.status=='HOLD_PREI4_CERT_RES_REMEDIATION_REQUIRED'&&github.event_name=='push'&&contains(github.event.head_commit.message, '[prei4-cert-res-materialize]') }}
   runs-on: ubuntu-latest
   timeout-minutes: 55
   env:
    CERT_RES_SOURCE: ${{ needs.canonical-candidate-authority.outputs.source_sha }}
    CERT_RES_TREE: ${{ needs.canonical-candidate-authority.outputs.source_tree }}
    CERT_RES_MAT_OUT: .tmp/prei4-cert-res-materialize
   steps:
   - name: step
     uses: actions/checkout@v4
     with: {fetch-depth: 0}
   - name: step
     run: |
      set -Eeuo pipefail
      mkdir -p "$CERT_RES_MAT_OUT"
      test "$CERT_RES_SOURCE" = "f6c3bb6c038a77eee9cbca8bfbfd1096bfd48cbc"
      test "$CERT_RES_TREE" = "6175786674fd02e454ccc3674b492a29ab1ed482"
      test "$(git rev-parse "$CERT_RES_SOURCE^{tree}")" = "$CERT_RES_TREE"
      git merge-base --is-ancestor "$CERT_RES_SOURCE" HEAD
      git diff --quiet "$CERT_RES_SOURCE" HEAD -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source ':(exclude)backend/runtime/hr-live-service/test/**'
      test "$(jq -r '.productSourceSha' "$CANDIDATE_DESCRIPTOR")" = "$CERT_RES_SOURCE"
      test "$(jq -r '.productTreeAuthority' "$CANDIDATE_DESCRIPTOR")" = "$CERT_RES_TREE"
      test "$(jq -r '.activeBlocker' "$CANDIDATE_DESCRIPTOR")" = "PREI4_CERT_RES_RUNTIME_REMATERIALIZATION_REQUIRED"
      test "$(jq -r '.preI4CertResClosure.state' "$CANDIDATE_DESCRIPTOR")" = "SOURCE_PROVEN_READY_EXACT_DEV_MATERIALIZATION"
      node --check tools/qa/cxorbia-prei4-cert-res-configure-dev.mjs
      node --check tools/qa/cxorbia-prei4-cert-res-live.mjs
      jq -n -S --arg source "$CERT_RES_SOURCE" --arg tree "$CERT_RES_TREE" '{decision:"PASS_PREI4_CERT_RES_EXACT_MATERIALIZATION_SCOPE",sourceSha:$source,sourceTree:$tree,production:false}' > "$CERT_RES_MAT_OUT/scope.json"
   - name: step
     uses: actions/setup-node@v4
     with: {node-version: '24'}
   - name: step
     run: |
      npm install --no-save --ignore-scripts --package-lock=false firebase-tools@latest firebase-admin@13.4.0 playwright@1.56.1 >/dev/null 2>&1
      npx playwright install chromium >/dev/null 2>&1
   - name: step
     uses: google-github-actions/auth@v2
     with:
      credentials_json: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV }}'
   - name: step
     uses: google-github-actions/setup-gcloud@v2
     with:
      project_id: ${{ env.PROJECT }}
   - name: step
     run: |
      set -Eeuo pipefail
      SOURCE_DIR="$RUNNER_TEMP/cxorbia-prei4-cert-res-source"
      rm -rf "$SOURCE_DIR"; mkdir -p "$SOURCE_DIR"
      git archive "$CERT_RES_SOURCE" | tar -x -C "$SOURCE_DIR"
      test -f "$SOURCE_DIR/backend/runtime/hr-live-service/cloudbuild.yaml"
      test -f "$SOURCE_DIR/firebase.json"
      test "$(git -C "$GITHUB_WORKSPACE" rev-parse "$CERT_RES_SOURCE^{tree}")" = "$CERT_RES_TREE"
      echo "SOURCE_DIR=$SOURCE_DIR" >> "$GITHUB_ENV"
   - name: step
     run: |
      set -Eeuo pipefail
      PROJECT="$PROJECT" TENANT_ID="$TENANT_ID" CERT_RES_MAT_OUT="$CERT_RES_MAT_OUT" node tools/qa/cxorbia-prei4-cert-res-configure-dev.mjs | tee "$CERT_RES_MAT_OUT/ai-setting-console.log"
      test "$(jq -r '.decision' "$CERT_RES_MAT_OUT/ai-setting.json")" = "PASS_PREI4_CERT_RES_AI_SETTING_CONFIGURED"
      test "$(jq -r '.serverProxy' "$CERT_RES_MAT_OUT/ai-setting.json")" = "true"
      test "$(jq -r '.production' "$CERT_RES_MAT_OUT/ai-setting.json")" = "false"
   - name: step
     run: |
      set -Eeuo pipefail
      git diff --quiet c71c7e800490059d36a5be6e266c28086b8db8f4 "$CERT_RES_SOURCE" -- firestore.rules storage.rules
      jq -n -S '{decision:"PASS_PREI4_CERT_RES_RULES_REUSED",authorityRunId:36789283777,firestoreRulesDeploysThisRun:0,storageRulesDeploysThisRun:0,byteIdentical:true,production:false}' > "$CERT_RES_MAT_OUT/rules.json"
   - name: step
     run: |
      set -Eeuo pipefail
      IMAGE_URI="gcr.io/${PROJECT}/${SERVICE}:i3-prei4-cert-res-${CERT_RES_SOURCE:0:12}-${GITHUB_RUN_ID}"
      echo "$IMAGE_URI" > "$CERT_RES_MAT_OUT/image-uri.txt"
      gcloud builds submit "$SOURCE_DIR" --project "$PROJECT" --config "$SOURCE_DIR/backend/runtime/hr-live-service/cloudbuild.yaml" --substitutions "_IMAGE=$IMAGE_URI" --quiet
      jq -n -S --arg source "$CERT_RES_SOURCE" --arg tree "$CERT_RES_TREE" --arg image "$IMAGE_URI" '{decision:"PASS_PREI4_CERT_RES_ONE_BUILD",sourceSha:$source,sourceTree:$tree,imageTag:$image,builds:1,production:false}' > "$CERT_RES_MAT_OUT/build.json"
   - name: step
     run: |
      set -Eeuo pipefail
      IMAGE_URI="$(cat "$CERT_RES_MAT_OUT/image-uri.txt")"
      gcloud run services update "$SERVICE" --project "$PROJECT" --region "$REGION" --image "$IMAGE_URI" --min-instances=1 --max-instances=1 --update-env-vars "$LEGAL_ENABLE_NAME=$LEGAL_ENABLE_VALUE,$LEGAL_GATE_NAME=$LEGAL_GATE_VALUE,$I3_HR_CACHE_PIN_NAME=$I3_HR_CACHE_PIN_VALUE" --quiet
      gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$CERT_RES_MAT_OUT/runtime.json"
      DEV_REVISION="$(jq -r '.status.latestReadyRevisionName // empty' "$CERT_RES_MAT_OUT/runtime.json")"
      test -n "$DEV_REVISION"
      gcloud run revisions describe "$DEV_REVISION" --project "$PROJECT" --region "$REGION" --format=json > "$CERT_RES_MAT_OUT/runtime-revision.json"
      RAW="$(jq -r '.status.imageDigest // empty' "$CERT_RES_MAT_OUT/runtime-revision.json")"
      if [[ "$RAW" =~ ^sha256:[0-9a-f]{64}$ ]]; then DIGEST="$RAW"; elif [[ "$RAW" == *@sha256:* ]]; then DIGEST="sha256:${RAW##*@sha256:}"; else echo "runtime digest unresolved" >&2; exit 1; fi
      RUNTIME_URL="$(jq -r '.status.url // empty' "$CERT_RES_MAT_OUT/runtime.json")"
      curl -fsS --retry 12 --retry-delay 3 "$RUNTIME_URL/health" > "$CERT_RES_MAT_OUT/health.json"
      jq -e '.ok==true and .production==false and .hrWrites==false and .shopperReconciliationReady==true and .visitReconciliationReady==true' "$CERT_RES_MAT_OUT/health.json" >/dev/null
      echo "DEV_REVISION=$DEV_REVISION" >> "$GITHUB_ENV"
      echo "RUNTIME_DIGEST=$DIGEST" >> "$GITHUB_ENV"
   - name: step
     run: |
      set -Eeuo pipefail
      cd "$SOURCE_DIR"
      "$GITHUB_WORKSPACE/node_modules/.bin/firebase" deploy --config firebase.json --only "hosting:$FIREBASE_HOSTING_TARGET" --project "$PROJECT" --non-interactive | tee "$GITHUB_WORKSPACE/$CERT_RES_MAT_OUT/hosting-deploy.log"
      cd "$GITHUB_WORKSPACE"
      TOKEN="$(gcloud auth print-access-token)"
      curl --fail --silent --show-error -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$CERT_RES_MAT_OUT/hosting-live-channel.json"
      HOSTING_RELEASE_NAME="$(jq -r '.release.name // empty' "$CERT_RES_MAT_OUT/hosting-live-channel.json")"
      HOSTING_VERSION_NAME="$(jq -r '.release.version.name // empty' "$CERT_RES_MAT_OUT/hosting-live-channel.json")"
      test -n "$HOSTING_VERSION_NAME"
      curl --fail --silent --show-error -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/$HOSTING_VERSION_NAME" > "$CERT_RES_MAT_OUT/hosting-version.json"
      test "$(jq -r '.status // empty' "$CERT_RES_MAT_OUT/hosting-version.json")" = "FINALIZED"
      for p in core/backend-certifications.js core/backend-ai.js core/backend-resources.js modules/cert.js modules/documentos.js; do
        out="$CERT_RES_MAT_OUT/remote-$(echo "$p" | tr '/' '_')"
        curl -fsSL --retry 8 --retry-delay 2 -H 'Cache-Control: no-cache, no-store, max-age=0' "$HOSTING_URL/$p?certres=$GITHUB_RUN_ID-$(date +%s%N)" -o "$out"
        test "$(sha256sum "$out" | awk '{print $1}')" = "$(sha256sum "$SOURCE_DIR/app/$p" | awk '{print $1}')"
      done
      echo "HOSTING_RELEASE_NAME=$HOSTING_RELEASE_NAME" >> "$GITHUB_ENV"
      echo "HOSTING_VERSION_NAME=$HOSTING_VERSION_NAME" >> "$GITHUB_ENV"
   - name: step
     run: |
      set -Eeuo pipefail
      gcloud storage buckets describe "gs://cxorbia-backend-dev.firebasestorage.app" --project "$PROJECT" --format=json > "$CERT_RES_MAT_OUT/storage-bucket.json"
      test "$(jq -r '.location // empty' "$CERT_RES_MAT_OUT/storage-bucket.json")" = "US-CENTRAL1"
      curl -fsS --retry 8 -H 'Cache-Control: no-cache, no-store, max-age=0' "$HOSTING_URL/api/$TENANT_ID/$PROJECT_ID/hr-live?format=meta&certres=$GITHUB_RUN_ID" > "$CERT_RES_MAT_OUT/hr-meta.json"
      HR_REVISION="$(jq -r '.revision // empty' "$CERT_RES_MAT_OUT/hr-meta.json")"
      [[ "$HR_REVISION" =~ ^[0-9a-f]{64}$ ]]
      jq -e '.ok==true and .revisionStable==true and .sourceSafe==true and .shopperReconciliation.providerAck==true and .visitReconciliation.providerAck==true and .hrWrites==false and .production==false and .refreshError==null' "$CERT_RES_MAT_OUT/hr-meta.json" >/dev/null
      echo "HR_REVISION=$HR_REVISION" >> "$GITHUB_ENV"
   - name: step
     run: |
      set -Eeuo pipefail
      PROJECT_ID="$PROJECT_ID" TENANT_ID="$TENANT_ID" HOSTING_URL="$HOSTING_URL" CERT_RES_SOURCE="$CERT_RES_SOURCE" CERT_RES_MAT_OUT="$CERT_RES_MAT_OUT" node tools/qa/cxorbia-prei4-cert-res-live.mjs | tee "$CERT_RES_MAT_OUT/live-console.log"
      test "$(jq -r '.decision' "$CERT_RES_MAT_OUT/cert-res-live.json")" = "PASS_PREI4_CERT_RES_CUMULATIVE_DEV_LIVE"
      test "$(jq -r '.cert001.decision' "$CERT_RES_MAT_OUT/cert-res-live.json")" = "PASS_PREI4_CERT_001_LIVE"
      test "$(jq -r '.cert002.recertification.decision' "$CERT_RES_MAT_OUT/cert-res-live.json")" = "PASS_PREI4_CERT_002_LIVE"
      test "$(jq -r '.res001.decision' "$CERT_RES_MAT_OUT/cert-res-live.json")" = "PASS_PREI4_RES_001_LIVE"
      test "$(jq -r '[.cleanup.attempt,.cleanup.recert,.cleanup.bank,.cleanup.resource,.cleanup.binary]|all' "$CERT_RES_MAT_OUT/cert-res-live.json")" = "true"
   - name: step
     run: |
      set -Eeuo pipefail
      jq -n -S --arg source "$CERT_RES_SOURCE" --arg tree "$CERT_RES_TREE" --arg runtime "$DEV_REVISION" --arg digest "$RUNTIME_DIGEST" --arg hosting "$HOSTING_VERSION_NAME" --arg hostingRelease "$HOSTING_RELEASE_NAME" --arg hr "$HR_REVISION" \
        '{decision:"PASS_PREI4_CERT_RES_EXACT_DEV_MATERIALIZATION_AND_LIVE",sourceSha:$source,sourceTree:$tree,runtimeRevision:$runtime,runtimeDigest:$digest,hostingVersion:$hosting,hostingRelease:$hostingRelease,hrRevision:$hr,p0:{"PREI4-CERT-001":"PASS_LIVE","PREI4-CERT-002":"PASS_LIVE","PREI4-RES-001":"PASS_LIVE"},builds:1,runtimeDeploys:1,hostingDeploys:1,firestoreRulesDeploysThisRun:0,storageRulesDeploysThisRun:0,rulesAuthorityRunId:36789283777,hrWrites:0,production:false}' > "$CERT_RES_MAT_OUT/result.json"
   - name: step
     if: always()
     uses: actions/upload-artifact@v4
     with:
      name: cxorbia-prei4-cert-res-materialization-${{ github.run_id }}
      path: .tmp/prei4-cert-res-materialize
      if-no-files-found: error
      retention-days: 30
      compression-level: 0
```
