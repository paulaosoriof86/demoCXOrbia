#!/usr/bin/env bash
set -Eeuo pipefail
MODE="${1:-}"
OUT=".tmp/i3-phasea-completion"
ROOT="https://cxorbia-backend-dev.web.app"
ASSETS=(core/backend-browser-auth.js core/shoppers-store.js core/topbar.js modules/beneficios.js modules/dashboard.js modules/postulaciones.js modules/finanzas.js modules/cert.js modules/misvisitas.js modules/reservas.js modules/soporte.js modules/novedades.js core/backend-bulletins.js adapters/cxorbia-command-adapter-v1.js adapters/cxorbia-cxdata-command-boundary-v1.js adapters/tya-canonical-shopper-portal-v2.js adapters/tya-c6-domain-consistency-bridge.js adapters/tya-protected-auth-hr-authority-bridge-v2.js adapters/tya-c6-unified-human-runtime-v1.js adapters/tya-canonical-reservations-guard-v2.js data/tya-payment-history-source-safe.js adapters/tya-financial-canonical-source-safe-adapter.js styles/layout.css core/backend-firebase.js core/cliente-data.js modules/cliente.js core/ui.js core/router.js adapters/tya-cumulative-read-model-v2.js modules/midia.js modules/visitas.js modules/visita-detalle.js styles/theme.css modules/proyecto-wizard.js modules/cuestionario-shopper.js adapters/tya-live-source-inplace-apply.js index-backend-dev.html core/automations.js modules/automatizaciones.js core/backend-cxdata-finance-read.js core/backend-finance-benefits.js core/backend-resources.js core/backend-certifications.js modules/documentos.js)
# BEGIN_EXISTING_IMAGE_TRAFFIC_ACTIVATION_HELPERS
phasea_activation_guard() {
  test "${GITHUB_EVENT_NAME:-}" = push
  test "${GITHUB_REF:-}" = refs/heads/recovery/cxorbia-phase-a-20260831
  jq -e '.head_commit.message | contains("[i3-phasea-dev-materialize]") and (contains("[i3-phasea-dev-readback]")|not)' "$GITHUB_EVENT_PATH" >/dev/null
  test "$(jq -r .status "$CANDIDATE_DESCRIPTOR")" = HOLD_I3_PHASEA_CUMULATIVE_DEV_MATERIALIZATION_REQUIRED
  test "$(jq -r .production "$CANDIDATE_DESCRIPTOR")" = DO_NOT_TOUCH
  test "$PROJECT" = cxorbia-backend-dev
  test "$SERVICE" = cxorbia-live-hr-dev
  test "$REGION" = us-central1
  test "$HOSTING_SITE" = cxorbia-backend-dev
  test "$FIREBASE_HOSTING_TARGET" = cxorbia-dev
  test "$TENANT_ID" = tya
  test "$PROJECT_ID" = cinepolis
  test "$PHASEA_SOURCE" = 4854a4e289bf76d08f3ffe3ecddd09168ba501af
  test "$PHASEA_TREE" = 7e55c5fefee821b2d9dd1d7c6e575592b8534be4
  test "$(git rev-parse "$PHASEA_SOURCE^{tree}")" = "$PHASEA_TREE"
  mkdir -p "$OUT"
  ACT_TMP="$RUNNER_TEMP/cxorbia-s485-existing-image-activation"
  mkdir -p "$ACT_TMP"
  ACT_TARGET="$OUT/materialization-target.json"
  python3 - "$CANDIDATE_DESCRIPTOR" "$ACT_TARGET" <<'ACTIVATION_TARGET_PY'
import json, sys
from pathlib import Path
expected = {'sourceSha': '4854a4e289bf76d08f3ffe3ecddd09168ba501af', 'sourceTree': '7e55c5fefee821b2d9dd1d7c6e575592b8534be4', 'project': 'cxorbia-backend-dev', 'materializationRunId': 40984272542, 'cloudBuildId': '968bd3aa-8c78-4652-9018-9ad2f7edc026', 'cloudBuildSource': {'bucket': 'cxorbia-backend-dev_cloudbuild', 'object': 'source/1793322732.959441-20242ed1a5ab437fb3ee3ed2f5d1ef31.tgz', 'generation': '1793322764003720'}, 'cloudBuildSourceArchiveSha256': 'cacc3d42c4303b1a568f2a1480ed7ff8bbd3bf68dc6ef845f764b59f4f611507', 'imageUri': 'gcr.io/cxorbia-backend-dev/cxorbia-live-hr-dev:i3-phasea-4854a4e289bf-40984272542', 'runtimeRevision': 'cxorbia-live-hr-dev-00331-2xq', 'runtimeDigest': 'sha256:e56826df529bd132d2413a0913c557743dbeb78945724e1073665e8bc388ca65', 'expectedCurrentRuntimeRevision': 'cxorbia-live-hr-dev-00330-fim', 'expectedCurrentRuntimeDigest': 'sha256:bba5ebbf19c203954ec0be6c2c3ef01a057e7ce3f98fb7e5eeac2d889bd0a500', 'expectedCurrentServiceGeneration': 332, 'expectedCurrentServiceResourceVersion': 'AAZfBIQl06U', 'expectedTrafficTags': [{'tag': 'i3-a2be-40832567443', 'revisionName': 'cxorbia-live-hr-dev-00329-xac'}, {'tag': 'i3-a2be-40833285318', 'revisionName': 'cxorbia-live-hr-dev-00330-fim'}], 'expectedHrRevision': 'ad25ad68f7d08c4dd3617c9de49df909d26ab73e69a1e40f2800b947a4dde79a', 'hostingVersion': 'sites/cxorbia-backend-dev/versions/eeef27f0aca1d6e5', 'hostingRelease': 'sites/cxorbia-backend-dev/channels/live/releases/1793322873249000', 'firestoreRuleset': 'projects/cxorbia-backend-dev/rulesets/4b50c97e-3729-41b8-8899-f5c02d6b9b62', 'sourceArtifactDigest': 'sha256:f3509fc74a7a5c46c1a8bf1e018ebae8e363b2897d1f06c85bbac34379316fa4', 'existingImageTrafficActivation': True, 'diagnosticOnly': False, 'requireBuildImageRuntimeDigestBinding': True, 'observedRuntimeIsNotSourceBinding': False, 'production': False}
descriptor = json.loads(Path(sys.argv[1]).read_text())
target = descriptor['i3PhaseADevReadbackTarget']
assert all(type(target.get(k)) is type(v) and target[k] == v for k,v in expected.items()), 'EXISTING_IMAGE_ACTIVATION_TARGET_DRIFT'
assert descriptor['productSourceSha'] == expected['sourceSha']
assert descriptor['productTreeAuthority'] == expected['sourceTree']
Path(sys.argv[2]).write_text(json.dumps(target, indent=2, sort_keys=True) + '\n')
ACTIVATION_TARGET_PY
  ACT_REV=cxorbia-live-hr-dev-00331-2xq
  ACT_OLD_REV=cxorbia-live-hr-dev-00330-fim
  ACT_DIGEST=sha256:e56826df529bd132d2413a0913c557743dbeb78945724e1073665e8bc388ca65
  ACT_GCS='gs://cxorbia-backend-dev_cloudbuild/source/1793322732.959441-20242ed1a5ab437fb3ee3ed2f5d1ef31.tgz#1793322764003720'
}

phasea_activation_hold() {
  local activation_rc="$1"
  trap - ERR
  unset ACT_TOKEN
  jq -n -S --arg stage "${ACT_STAGE:-UNKNOWN}" --argjson exitCode "$activation_rc" --argjson attempted "${ACT_ATTEMPTED:-0}" --argjson completed "${ACT_COMPLETED:-0}" '{decision:"HOLD_I3_PHASEA_EXISTING_IMAGE_TRAFFIC_ACTIVATION",stage:$stage,exitCode:$exitCode,trafficUpdatesAttempted:$attempted,trafficUpdatesCompleted:$completed,providerWriteOutcomeUnknown:($attempted>$completed),builds:0,runtimeDeploys:0,hostingDeploys:0,firestoreRulesDeploys:0,authWrites:0,hrWrites:0,production:false}' > "$OUT/result.json"
  exit "$activation_rc"
}

phasea_activation_capture_runtime() {
  local activation_phase="$1"
  gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$ACT_TMP/service-$activation_phase.json"
  gcloud run revisions describe "$ACT_REV" --project "$PROJECT" --region "$REGION" --format=json > "$ACT_TMP/desired-$activation_phase.json"
  gcloud run revisions describe "$ACT_OLD_REV" --project "$PROJECT" --region "$REGION" --format=json > "$ACT_TMP/previous-$activation_phase.json"
  jq '{metadata:{name:.metadata.name,generation:.metadata.generation,resourceVersion:.metadata.resourceVersion},spec:{traffic:.spec.traffic,template:{spec:{containers:[.spec.template.spec.containers[]? | {name,image,ports,envNames:[.env[]?.name]}]}}},status}' "$ACT_TMP/service-$activation_phase.json" > "$OUT/runtime-$activation_phase.json"
  jq '{metadata:{name:.metadata.name,generation:.metadata.generation,resourceVersion:.metadata.resourceVersion},spec:{containers:[.spec.containers[]? | {name,image,ports,envNames:[.env[]?.name]}]},status}' "$ACT_TMP/desired-$activation_phase.json" > "$OUT/revision-$activation_phase.json"
}

phasea_activation_state_guard() {
  local activation_phase="$1" activation_original="$2"
  python3 - "$activation_phase" "$ACT_TARGET" "$ACT_TMP/service-$activation_phase.json" "$ACT_TMP/desired-$activation_phase.json" "$ACT_TMP/previous-$activation_phase.json" "$activation_original" "$OUT/state-$activation_phase.json" <<'ACTIVATION_STATE_PY'
#!/usr/bin/env python3
"""Pure local state guard, embedded into the existing control; no provider calls."""
import json
import sys
from pathlib import Path

def read(path):
    return json.loads(Path(path).read_text())

def require(condition, reason):
    if not condition:
        raise ValueError(reason)

def digest(value):
    text = str(value or '')
    return text.rsplit('@', 1)[-1] if '@' in text else text

def ready(obj):
    return any(c.get('type') == 'Ready' and c.get('status') == 'True' for c in obj.get('status', {}).get('conditions', []))

def percentages(entries):
    result = {}
    for entry in entries:
        value = entry.get('percent', 0)
        require(type(value) is int and 0 <= value <= 100, 'TRAFFIC_PERCENT_INVALID')
        require(not entry.get('latestRevision'), 'TRAFFIC_NOT_REVISION_PINNED')
        if value:
            name = entry.get('revisionName')
            require(isinstance(name, str) and name, 'TRAFFIC_REVISION_MISSING')
            result[name] = result.get(name, 0) + value
    return result

def tags(entries):
    pairs = [(v['tag'], v.get('revisionName')) for v in entries if v.get('tag')]
    require(len({v[0] for v in pairs}) == len(pairs), 'TRAFFIC_TAG_DUPLICATE')
    return sorted(pairs)

def verify(stage, target, service, desired, previous, original=None):
    expected = target['runtimeRevision']
    old = target['expectedCurrentRuntimeRevision']
    expected_digest = target['runtimeDigest']
    spec, status = service['spec'], service['status']
    require(service['metadata']['name'] == 'cxorbia-live-hr-dev', 'SERVICE_NAME_DRIFT')
    require(status.get('latestCreatedRevisionName') == expected, 'LATEST_CREATED_DRIFT')
    require(status.get('observedGeneration') == service['metadata'].get('generation'), 'SERVICE_GENERATION_NOT_OBSERVED')
    require(ready(service), 'SERVICE_NOT_READY')
    containers = spec['template']['spec']['containers']
    require(len(containers) == 1 and containers[0].get('image') == target['imageUri'], 'SERVICE_TEMPLATE_IMAGE_DRIFT')
    require(desired['metadata']['name'] == expected, 'DESIRED_REVISION_NAME_DRIFT')
    require(ready(desired), 'DESIRED_REVISION_NOT_READY')
    require(digest(desired['status'].get('imageDigest')) == expected_digest, 'DESIRED_REVISION_DIGEST_DRIFT')
    revision_containers = desired['spec']['containers']
    expected_image = 'gcr.io/cxorbia-backend-dev/cxorbia-live-hr-dev@' + expected_digest
    require(len(revision_containers) == 1 and revision_containers[0].get('image') == expected_image, 'DESIRED_REVISION_IMAGE_DRIFT')
    expected_tags = sorted((v['tag'], v['revisionName']) for v in target['expectedTrafficTags'])
    require(tags(spec['traffic']) == expected_tags, 'SPEC_TAG_DRIFT')
    require(tags(status['traffic']) == expected_tags, 'OBSERVED_TAG_DRIFT')
    spec_traffic = percentages(spec['traffic'])
    actual_traffic = percentages(status['traffic'])
    require(spec_traffic == actual_traffic, 'TRAFFIC_NOT_CONVERGED')
    if actual_traffic == {old: 100} and stage in ('before', 'cas'):
        require(status.get('latestReadyRevisionName') == old, 'PREVIOUS_READY_REVISION_DRIFT')
        require(service['metadata'].get('generation') == target['expectedCurrentServiceGeneration'], 'PREVIOUS_GENERATION_DRIFT')
        require(service['metadata'].get('resourceVersion') == target['expectedCurrentServiceResourceVersion'], 'PREVIOUS_RESOURCE_VERSION_DRIFT')
        require(previous['metadata']['name'] == old and ready(previous), 'PREVIOUS_REVISION_NOT_READY')
        require(digest(previous['status'].get('imageDigest')) == target['expectedCurrentRuntimeDigest'], 'PREVIOUS_REVISION_DIGEST_DRIFT')
        action = 'ACTIVATE_EXISTING_REVISION'
    elif actual_traffic == {expected: 100}:
        require(status.get('latestReadyRevisionName') == expected, 'ACTIVE_READY_REVISION_DRIFT')
        require(any(c.get('type') == 'Active' and c.get('status') == 'True' for c in desired['status'].get('conditions', [])), 'DESIRED_REVISION_NOT_ACTIVE')
        action = 'ALREADY_ACTIVE'
    else:
        raise ValueError('TRAFFIC_CAS_PRECONDITION_FAILED')
    if original is not None:
        before_spec = dict(original['spec'])
        after_spec = dict(spec)
        before_spec.pop('traffic', None)
        after_spec.pop('traffic', None)
        require(before_spec == after_spec, 'NON_TRAFFIC_SERVICE_CONFIGURATION_DRIFT')
        if stage == 'cas':
            require(service['metadata'].get('resourceVersion') == original['metadata'].get('resourceVersion'), 'REREAD_RESOURCE_VERSION_DRIFT')
            require(service['metadata'].get('generation') == original['metadata'].get('generation'), 'REREAD_GENERATION_DRIFT')
            require(spec['traffic'] == original['spec']['traffic'], 'REREAD_TRAFFIC_DRIFT')
    return {'decision': 'PASS_EXISTING_IMAGE_ACTIVATION_STATE_GUARD', 'stage': stage, 'action': action, 'runtimeRevision': expected, 'runtimeDigest': expected_digest, 'observedTraffic': actual_traffic, 'serviceGeneration': service['metadata']['generation'], 'serviceResourceVersion': service['metadata']['resourceVersion'], 'tagsPreserved': True, 'configurationUnchanged': original is not None, 'production': False}

if __name__ == '__main__':
    stage, target_path, service_path, desired_path, previous_path, original_path, output_path = sys.argv[1:]
    try:
        output = verify(stage, read(target_path), read(service_path), read(desired_path), read(previous_path), read(original_path) if original_path != '-' else None)
    except Exception as error:
        output = {'decision': 'HOLD_EXISTING_IMAGE_ACTIVATION_STATE_GUARD', 'stage': stage, 'reason': str(error), 'production': False}
        Path(output_path).write_text(json.dumps(output, indent=2, sort_keys=True) + '\n')
        raise SystemExit(1)
    Path(output_path).write_text(json.dumps(output, indent=2, sort_keys=True) + '\n')
ACTIVATION_STATE_PY
}

phasea_activation_read_hosting_rules_hr() {
  local activation_phase="$1"
  ACT_TOKEN="$(gcloud auth print-access-token)"
  curl -fsS -H "Authorization: Bearer $ACT_TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$OUT/hosting-$activation_phase.json"
  curl -fsS -H "Authorization: Bearer $ACT_TOKEN" "https://firebaserules.googleapis.com/v1/projects/$PROJECT/releases/cloud.firestore" > "$OUT/firestore-release-$activation_phase.json"
  local activation_ruleset
  activation_ruleset="$(jq -r .firestoreRuleset "$ACT_TARGET")"
  curl -fsS -H "Authorization: Bearer $ACT_TOKEN" "https://firebaserules.googleapis.com/v1/$activation_ruleset" > "$OUT/firestore-ruleset-$activation_phase.json"
  unset ACT_TOKEN
  jq -e --slurpfile t "$ACT_TARGET" '.release.version.name==$t[0].hostingVersion and .release.name==$t[0].hostingRelease and .release.version.status=="FINALIZED" and .url=="https://cxorbia-backend-dev.web.app"' "$OUT/hosting-$activation_phase.json" >/dev/null
  jq -e --slurpfile t "$ACT_TARGET" '.name=="projects/cxorbia-backend-dev/releases/cloud.firestore" and .rulesetName==$t[0].firestoreRuleset' "$OUT/firestore-release-$activation_phase.json" >/dev/null
  jq -e '[.source.files[] | select(.name=="firestore.rules")]|length==1' "$OUT/firestore-ruleset-$activation_phase.json" >/dev/null
  jq -j '[.source.files[] | select(.name=="firestore.rules") | .content][0]' "$OUT/firestore-ruleset-$activation_phase.json" > "$OUT/firestore-remote-$activation_phase.rules"
  cmp "$OUT/firestore-remote-$activation_phase.rules" "$PHASEA_SOURCE_DIR/firestore.rules"
  test "$(git hash-object "$OUT/firestore-remote-$activation_phase.rules")" = 540240ddbbb078ebcd14611dd2cc39375472ea66
  curl -fsS --retry 3 -H 'Cache-Control: no-cache, no-store, max-age=0' "$ROOT/api/$TENANT_ID/$PROJECT_ID/hr-live?format=meta&i3trafficactivation=$GITHUB_RUN_ID-$activation_phase" > "$OUT/hr-meta-$activation_phase.json"
  jq -e --slurpfile t "$ACT_TARGET" '.ok==true and .revision==$t[0].expectedHrRevision and .revisionStable==true and .sourceSafe==true and .hrWrites==false and .production==false' "$OUT/hr-meta-$activation_phase.json" >/dev/null
}

phasea_activate_existing_image() {
  phasea_activation_guard
  ACT_STAGE=CANONICAL_SOURCE_TAR
  ACT_ATTEMPTED=0
  ACT_COMPLETED=0
  trap 'phasea_activation_hold $?' ERR
  jq -n '{decision:"HOLD_I3_PHASEA_EXISTING_IMAGE_TRAFFIC_ACTIVATION",stage:"STARTED",trafficUpdatesAttempted:0,trafficUpdatesCompleted:0,production:false}' > "$OUT/result.json"
  sha256sum -c "$OUT/cxorbia-phasea-source.tar.sha256"
  test "$(cut -d' ' -f1 "$OUT/cxorbia-phasea-source.tar.sha256")" = f3509fc74a7a5c46c1a8bf1e018ebae8e363b2897d1f06c85bbac34379316fa4
  ACT_STAGE=EXISTING_BUILD_AND_REMOTE_INPUTS
  gcloud builds describe 968bd3aa-8c78-4652-9018-9ad2f7edc026 --project "$PROJECT" --format=json > "$ACT_TMP/build.json"
  jq '{id,projectId,status,source,sourceProvenance,images,substitutions:{_IMAGE:.substitutions._IMAGE},steps:[.steps[]? | {name,dir,entrypoint,args:[.args[]? | if test("^(build|-t|-f|\\.|backend/|gcr\\.io/)$|^(backend/|gcr\\.io/)") then . else "REDACTED_OR_UNEXPECTED_ARGUMENT" end],envNames:[.env[]? | split("=")[0]],secretEnvNames:.secretEnv}],results:{images:.results.images},options:{sourceProvenanceHash:.options.sourceProvenanceHash}}' "$ACT_TMP/build.json" > "$OUT/build-existing.json"
  jq -e --slurpfile t "$ACT_TARGET" '.status=="SUCCESS" and .id==$t[0].cloudBuildId and .projectId==$t[0].project and .source.storageSource==$t[0].cloudBuildSource and .sourceProvenance.resolvedStorageSource==$t[0].cloudBuildSource and .substitutions._IMAGE==$t[0].imageUri and .images==[$t[0].imageUri] and ([.results.images[] | select(.name==$t[0].imageUri and .digest==$t[0].runtimeDigest)]|length)==1 and (.results.images|length)==1' "$ACT_TMP/build.json" >/dev/null
  gcloud storage cp "$ACT_GCS" "$ACT_TMP/build-source.tgz" --quiet
  python3 - "$PHASEA_SOURCE_DIR" "$RUNNER_TEMP/cxorbia-phasea-readback-source.tar" "$ACT_TMP/build-source.tgz" "$ACT_TMP/build.json" "$OUT/build-inputs-proof.json" <<'ACTIVATION_INPUTS_PY'
#!/usr/bin/env python3
"""Read-only build-input binding. CLI pins are frozen; tests may call verify().

Usage: python - SOURCE_DIR CANONICAL_TAR GCS_SOURCE_TGZ BUILD_JSON OUTPUT_JSON
No extraction, subprocess, network, provider mutation or repository writes.
"""
import base64
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import shlex
import sys
import tarfile

PINS = {
    'sourceSha': '4854a4e289bf76d08f3ffe3ecddd09168ba501af',
    'sourceTree': '7e55c5fefee821b2d9dd1d7c6e575592b8534be4',
    'sourceArtifactDigest': 'sha256:f3509fc74a7a5c46c1a8bf1e018ebae8e363b2897d1f06c85bbac34379316fa4',
    'projectId': 'cxorbia-backend-dev',
    'cloudBuildId': '968bd3aa-8c78-4652-9018-9ad2f7edc026',
    'cloudBuildSource': {
        'bucket': 'cxorbia-backend-dev_cloudbuild',
        'object': 'source/1793322732.959441-20242ed1a5ab437fb3ee3ed2f5d1ef31.tgz',
        'generation': '1793322764003720',
    },
    'gcsArchiveSha256': 'cacc3d42c4303b1a568f2a1480ed7ff8bbd3bf68dc6ef845f764b59f4f611507',
    'imageUri': 'gcr.io/cxorbia-backend-dev/cxorbia-live-hr-dev:i3-phasea-4854a4e289bf-40984272542',
    'builtImageDigest': 'sha256:e56826df529bd132d2413a0913c557743dbeb78945724e1073665e8bc388ca65',
    'materializationRunId': 40984272542,
}
DOCKERFILE = 'backend/runtime/hr-live-service/Dockerfile'
CLOUDBUILD = 'backend/runtime/hr-live-service/cloudbuild.yaml'
IGNORE_FILES = ['.dockerignore', DOCKERFILE + '.dockerignore']
CAPTURE = {DOCKERFILE, CLOUDBUILD, *IGNORE_FILES}
EXPECTED_YAML = '''steps:
  - name: gcr.io/cloud-builders/docker
    args:
      - build
      - -f
      - backend/runtime/hr-live-service/Dockerfile
      - -t
      - ${_IMAGE}
      - .
images:
  - ${_IMAGE}
options:
  logging: CLOUD_LOGGING_ONLY
'''

class VerificationError(Exception):
    pass

def require(condition, code):
    if not condition:
        raise VerificationError(code)

def file_sha256(file):
    h = hashlib.sha256()
    with open(file, 'rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()

def normalize_name(name):
    require(isinstance(name, str) and '\x00' not in name and '\\' not in name, 'ARCHIVE_PATH_INVALID')
    require(not name.startswith('/') and '..' not in PurePosixPath(name).parts, 'ARCHIVE_PATH_ESCAPE')
    while name.startswith('./'):
        name = name[2:]
    name = name.rstrip('/')
    return '' if name == '.' else name

def archive_manifest(file, mode):
    """One sequential archive pass; only two small control files retain bytes."""
    entries, directories, captured, seen = {}, set(), {}, set()
    with tarfile.open(file, mode=mode) as archive:
        for member in archive:
            name = normalize_name(member.name)
            if not name:
                require(member.isdir(), 'ARCHIVE_ROOT_NOT_DIRECTORY')
                continue
            require(name not in seen, 'ARCHIVE_DUPLICATE_PATH')
            seen.add(name)
            if member.isdir():
                directories.add(name)
                continue
            if not member.isfile():
                entries[name] = {'kind': 'unsupported_link_or_special'}
                continue
            require(member.size >= 0, 'ARCHIVE_FILE_SIZE_INVALID')
            reader = archive.extractfile(member)
            require(reader is not None, 'ARCHIVE_FILE_UNREADABLE')
            digest, size, pieces = hashlib.sha256(), 0, []
            with reader:
                for chunk in iter(lambda: reader.read(1024 * 1024), b''):
                    digest.update(chunk)
                    size += len(chunk)
                    if name in CAPTURE:
                        require(size <= 4 * 1024 * 1024, 'BUILD_CONTROL_FILE_TOO_LARGE')
                        pieces.append(chunk)
            require(size == member.size, 'ARCHIVE_FILE_TRUNCATED')
            entries[name] = {'kind': 'file', 'size': size, 'sha256': digest.hexdigest(),
                             'executable': bool(member.mode & 0o111)}
            if name in CAPTURE:
                captured[name] = b''.join(pieces)
    return entries, directories, captured

def copy_commands(dockerfile):
    commands, logical = [], ''
    for physical in dockerfile.decode('utf-8').splitlines():
        text = physical.strip()
        if not logical and (not text or text.startswith('#')):
            continue
        if text.endswith('\\'):
            logical += text[:-1] + ' '
            continue
        logical += text
        parts = logical.split(None, 1)
        logical = ''
        op = parts[0].upper()
        require(op != 'ADD', 'DOCKER_ADD_UNSUPPORTED')
        if op != 'COPY':
            continue
        require(len(parts) == 2, 'DOCKER_COPY_INVALID')
        args = json.loads(parts[1]) if parts[1].startswith('[') else shlex.split(parts[1])
        require(isinstance(args, list) and len(args) >= 2 and all(isinstance(x, str) for x in args), 'DOCKER_COPY_INVALID')
        require(not any(x.startswith('--') for x in args), 'DOCKER_COPY_FLAGS_UNSUPPORTED')
        for raw in args[:-1]:
            require(not any(x in raw for x in '$*?[]'), 'DOCKER_COPY_PATTERN_UNSUPPORTED')
            source = normalize_name(raw)
            require(bool(source), 'DOCKER_COPY_ROOT_UNSUPPORTED')
            commands.append({'source': source, 'destination': args[-1]})
    require(not logical and bool(commands), 'DOCKER_COPY_LIST_EMPTY_OR_INCOMPLETE')
    return commands

def selected_paths(entries, directories, source):
    if source in entries:
        require(entries[source]['kind'] == 'file', 'DOCKER_COPY_LINK_OR_SPECIAL')
        return [source], False
    prefix = source + '/'
    selected = sorted(p for p in entries if p.startswith(prefix))
    require(source in directories or selected, 'DOCKER_COPY_SOURCE_MISSING')
    require(selected, 'DOCKER_COPY_DIRECTORY_EMPTY')
    require(all(entries[p]['kind'] == 'file' for p in selected), 'DOCKER_COPY_LINK_OR_SPECIAL')
    return selected, True

def verify_local_file(root, rel, expected):
    path = root / rel
    current = path
    while current != root:
        require(not current.is_symlink(), 'CANONICAL_SOURCE_DIR_SYMLINK')
        current = current.parent
    require(path.is_file() and path.resolve().is_relative_to(root), 'CANONICAL_SOURCE_DIR_FILE_MISSING')
    require(path.stat().st_size == expected['size'] and file_sha256(path) == expected['sha256'], 'CANONICAL_SOURCE_DIR_BYTES_MISMATCH')
    require(bool(path.stat().st_mode & 0o111) == expected['executable'], 'CANONICAL_SOURCE_DIR_EXECUTABLE_MISMATCH')

def verify(source_dir, canonical_tar, gcs_tgz, build, pins=PINS):
    require('sha256:' + file_sha256(canonical_tar) == pins['sourceArtifactDigest'], 'CANONICAL_SOURCE_TAR_DIGEST_MISMATCH')
    source = pins['cloudBuildSource']
    require(build.get('id') == pins['cloudBuildId'] and build.get('projectId') == pins['projectId'], 'CLOUD_BUILD_IDENTITY_MISMATCH')
    require(build.get('status') == 'SUCCESS', 'CLOUD_BUILD_NOT_SUCCESS')
    require(build.get('source', {}).get('storageSource') == source, 'CLOUD_BUILD_SOURCE_GENERATION_MISMATCH')
    provenance = build.get('sourceProvenance', {})
    require(provenance.get('resolvedStorageSource') == source, 'RESOLVED_SOURCE_GENERATION_MISMATCH')
    source_uri = 'gs://' + source['bucket'] + '/' + source['object'] + '#' + source['generation']
    hashes = provenance.get('fileHashes', {})
    require(set(hashes) == {source_uri}, 'SOURCE_PROVENANCE_OBJECT_MISMATCH')
    sha_rows = [r for r in hashes[source_uri].get('fileHash', []) if r.get('type') == 'SHA256']
    require(len(sha_rows) == 1, 'SOURCE_PROVENANCE_SHA256_MISSING_OR_AMBIGUOUS')
    try:
        declared_sha = base64.b64decode(sha_rows[0]['value'], altchars=b'-_', validate=True)
    except (ValueError, KeyError, TypeError):
        raise VerificationError('SOURCE_PROVENANCE_SHA256_INVALID')
    require(len(declared_sha) == 32, 'SOURCE_PROVENANCE_SHA256_INVALID')
    gcs_sha = file_sha256(gcs_tgz)
    require(gcs_sha == declared_sha.hex() == pins['gcsArchiveSha256'], 'DOWNLOADED_GCS_SOURCE_DIGEST_MISMATCH')
    image = pins['imageUri']
    require(build.get('images') == [image] and build.get('substitutions', {}).get('_IMAGE') == image, 'BUILD_IMAGE_SUBSTITUTION_MISMATCH')
    steps = build.get('steps')
    require(isinstance(steps, list) and len(steps) == 1, 'BUILD_STEPS_MISMATCH')
    step = steps[0]
    require(step.get('name') == 'gcr.io/cloud-builders/docker', 'BUILD_BUILDER_MISMATCH')
    require(step.get('args') == ['build', '-f', DOCKERFILE, '-t', image, '.'], 'BUILD_DOCKER_ARGUMENTS_MISMATCH')
    require(step.get('dir') in (None, '', '.') and step.get('entrypoint') in (None, ''), 'BUILD_CONTEXT_OR_ENTRYPOINT_MISMATCH')
    require(not step.get('env') and not step.get('secretEnv') and not step.get('envNames') and not step.get('secretEnvNames'), 'BUILD_ENVIRONMENT_OVERRIDE_UNEXPECTED')
    images = build.get('results', {}).get('images')
    require(isinstance(images, list) and len(images) == 1 and images[0].get('name') == image
            and images[0].get('digest') == pins['builtImageDigest'], 'BUILD_RESULT_IMAGE_DIGEST_MISMATCH')
    canonical, canonical_dirs, canonical_bytes = archive_manifest(canonical_tar, 'r|')
    uploaded, uploaded_dirs, uploaded_bytes = archive_manifest(gcs_tgz, 'r|gz')
    for rel in [DOCKERFILE, CLOUDBUILD]:
        require(rel in canonical_bytes and rel in uploaded_bytes and uploaded_bytes[rel] == canonical_bytes[rel], 'BUILD_CONTROL_SOURCE_BYTES_MISMATCH')
    require(not any(p in canonical or p in uploaded for p in IGNORE_FILES), 'DOCKER_IGNORE_RULES_UNSUPPORTED')
    require(canonical_bytes[CLOUDBUILD].decode('utf-8').strip() == EXPECTED_YAML.strip(), 'CLOUDBUILD_SOURCE_CONFIGURATION_UNEXPECTED')
    copies = copy_commands(canonical_bytes[DOCKERFILE])
    selected = {DOCKERFILE, CLOUDBUILD}
    copy_records = []
    root = Path(source_dir).resolve(strict=True)
    require(root.is_dir() and not Path(source_dir).is_symlink(), 'CANONICAL_SOURCE_DIR_INVALID')
    for instruction in copies:
        left, recursive = selected_paths(canonical, canonical_dirs, instruction['source'])
        right, remote_recursive = selected_paths(uploaded, uploaded_dirs, instruction['source'])
        require(left == right and recursive == remote_recursive, 'RECURSIVE_COPY_MANIFEST_MISMATCH')
        for rel in left:
            require(canonical[rel] == uploaded[rel], 'COPY_INPUT_BYTES_OR_EXECUTABLE_MISMATCH')
        if recursive:
            local = root / instruction['source']
            require(local.is_dir() and not local.is_symlink(), 'CANONICAL_COPY_DIRECTORY_INVALID')
            local_files = sorted(p.relative_to(root).as_posix() for p in local.rglob('*') if p.is_file() or p.is_symlink())
            require(local_files == left, 'CANONICAL_SOURCE_DIR_RECURSIVE_MANIFEST_MISMATCH')
            source_path = instruction['source']
            prefix = source_path + '/'
            implicit_dirs = {source_path}
            for rel in left:
                implicit_dirs.update(str(p) for p in PurePosixPath(rel).parents
                                     if str(p) == source_path or str(p).startswith(prefix))
            copy_dirs = implicit_dirs | {p for p in canonical_dirs if p == source_path or p.startswith(prefix)}
            remote_dirs = implicit_dirs | {p for p in uploaded_dirs if p == source_path or p.startswith(prefix)}
            require(copy_dirs == remote_dirs, 'RECURSIVE_COPY_DIRECTORY_MANIFEST_MISMATCH')
            local_dirs = {source_path} | {p.relative_to(root).as_posix() for p in local.rglob('*') if p.is_dir()}
            require(local_dirs == copy_dirs, 'CANONICAL_SOURCE_DIR_DIRECTORY_MANIFEST_MISMATCH')
        selected.update(left)
        copy_records.append({**instruction, 'recursive': recursive, 'fileCount': len(left),
                             'directories': sorted(copy_dirs) if recursive else []})
    manifest = [{'path': rel, **canonical[rel]} for rel in sorted(selected)]
    for row in manifest:
        verify_local_file(root, row['path'], row)
    manifest_sha = hashlib.sha256(json.dumps(manifest, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    return {'decision': 'PASS_EXACT_SOURCE_BUILD_INPUTS_BINDING', 'sourceSha': pins['sourceSha'], 'sourceTree': pins['sourceTree'],
            'sourceArtifactDigest': pins['sourceArtifactDigest'], 'localCanonicalSourceTarVerified': True,
            'cloudBuildId': pins['cloudBuildId'], 'cloudBuildSource': source, 'gcsSourceGenerationUri': source_uri,
            'downloadedSourceSha256': gcs_sha, 'sourceProvenanceSha256': declared_sha.hex(),
            'remoteBuildSourceContentVerified': True, 'imageUri': image, 'builtImageDigest': pins['builtImageDigest'],
            'materializationRunId': pins['materializationRunId'], 'dockerfileSha256': canonical[DOCKERFILE]['sha256'],
            'cloudbuildSha256': canonical[CLOUDBUILD]['sha256'], 'dockerCopies': copy_records,
            'verifiedInputCount': len(manifest), 'inputManifestSha256': manifest_sha, 'inputs': manifest,
            'archivePasses': {'canonicalTar': 1, 'gcsTgzDecompressions': 1},
            'runtimeRevisionVerified': False, 'trafficChanged': False, 'providerReads': 0, 'providerWrites': 0, 'production': False}

def main(argv):
    require(len(argv) == 5, 'VERIFIER_ARGUMENT_COUNT')
    source_dir, canonical_tar, gcs_tgz, build_json, output_json = argv
    report = {'decision': 'HOLD_EXACT_SOURCE_BUILD_INPUTS_BINDING', 'sourceSha': PINS['sourceSha'],
              'sourceTree': PINS['sourceTree'], 'runtimeRevisionVerified': False, 'providerWrites': 0, 'production': False}
    status = 1
    try:
        with open(build_json, encoding='utf-8') as stream:
            build = json.load(stream)
        report = verify(source_dir, canonical_tar, gcs_tgz, build)
        status = 0
    except VerificationError as error:
        report['reasonCode'] = str(error)
    except Exception:
        report['reasonCode'] = 'BUILD_INPUT_VERIFIER_FAILURE'
    output = Path(output_json)
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_name(output.name + '.tmp')
    temporary.write_text(json.dumps(report, indent=2) + '\n')
    os.chmod(temporary, 0o600)
    temporary.replace(output)
    print(json.dumps({k: report[k] for k in ['decision', 'reasonCode', 'verifiedInputCount', 'inputManifestSha256'] if k in report}))
    return status

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
ACTIVATION_INPUTS_PY
  jq -e '.decision=="PASS_EXACT_SOURCE_BUILD_INPUTS_BINDING"' "$OUT/build-inputs-proof.json" >/dev/null
  ACT_STAGE=OBSERVE_EXISTING_RUNTIME
  phasea_activation_capture_runtime before
  phasea_activation_state_guard before -
  ACT_STAGE=HOSTING_RULES_HR_PRECONDITION
  phasea_activation_read_hosting_rules_hr before
  ACT_STAGE=IMMEDIATE_RUNTIME_REREAD
  phasea_activation_capture_runtime cas
  phasea_activation_state_guard cas "$ACT_TMP/service-before.json"
  ACT_ACTION="$(jq -r .action "$OUT/state-cas.json")"
  if [[ "$ACT_ACTION" == ACTIVATE_EXISTING_REVISION ]]; then
    ACT_STAGE=ACTIVATE_EXACT_EXISTING_REVISION
    ACT_ATTEMPTED=1
    # The only provider mutation in this branch; no image/configuration/tag changes.
    gcloud run services update-traffic "$SERVICE" --project "$PROJECT" --region "$REGION" --to-revisions=cxorbia-live-hr-dev-00331-2xq=100 --quiet
    ACT_COMPLETED=1
  else
    test "$ACT_ACTION" = ALREADY_ACTIVE
  fi
  ACT_STAGE=RUNTIME_POST_ACTIVATION
  phasea_activation_capture_runtime after
  phasea_activation_state_guard after "$ACT_TMP/service-before.json"
  ACT_URL="$(jq -r .status.url "$ACT_TMP/service-after.json")"
  test "$ACT_URL" = https://cxorbia-live-hr-dev-mzgge2pnia-uc.a.run.app
  curl -fsS --retry 8 "$ACT_URL/health" > "$OUT/health.json"
  jq -e '.ok==true and .production==false and .hrWrites==false' "$OUT/health.json" >/dev/null
  ACT_STAGE=HOSTING_RULES_HR_POST_ACTIVATION
  phasea_activation_read_hosting_rules_hr after
  jq -n -S --argjson attempted "$ACT_ATTEMPTED" --argjson completed "$ACT_COMPLETED" '{decision:"PASS_EXISTING_IMAGE_TRAFFIC_ACTIVATION_MUTATION_STEP",trafficUpdatesAttempted:$attempted,trafficUpdatesCompleted:$completed,production:false}' > "$OUT/activation-step.json"
  echo "PHASEA_RUNTIME=$ACT_REV" >> "$GITHUB_ENV"
  echo "PHASEA_DIGEST=$ACT_DIGEST" >> "$GITHUB_ENV"
  echo "PHASEA_RULESET=$(jq -r .firestoreRuleset "$ACT_TARGET")" >> "$GITHUB_ENV"
  echo "PHASEA_HOSTING_VERSION=$(jq -r .hostingVersion "$ACT_TARGET")" >> "$GITHUB_ENV"
  echo "PHASEA_HOSTING_RELEASE=$(jq -r .hostingRelease "$ACT_TARGET")" >> "$GITHUB_ENV"
  trap - ERR
}

phasea_prove_existing_image_activation() {
  phasea_activation_guard
  ACT_STAGE=PROOF_INPUTS
  ACT_ATTEMPTED="$(jq -r .trafficUpdatesAttempted "$OUT/activation-step.json")"
  ACT_COMPLETED="$(jq -r .trafficUpdatesCompleted "$OUT/activation-step.json")"
  trap 'phasea_activation_hold $?' ERR
  jq -e '.decision=="PASS_EXISTING_IMAGE_TRAFFIC_ACTIVATION_MUTATION_STEP" and (.trafficUpdatesCompleted==0 or .trafficUpdatesCompleted==1) and .trafficUpdatesCompleted==.trafficUpdatesAttempted and .production==false' "$OUT/activation-step.json" >/dev/null
  sha256sum -c "$OUT/cxorbia-phasea-source.tar.sha256"
  jq -e '.decision=="PASS_EXACT_SOURCE_BUILD_INPUTS_BINDING"' "$OUT/build-inputs-proof.json" >/dev/null
  ACT_STAGE=FINAL_RUNTIME_IDENTITY
  phasea_activation_capture_runtime final
  phasea_activation_state_guard final "$ACT_TMP/service-before.json"
  ACT_STAGE=FINAL_HOSTING_RULES_HR
  phasea_activation_read_hosting_rules_hr final
  ACT_STAGE=EXACT_SERVED_ASSETS
  test "${#ASSETS[@]}" = 44
  echo '{}' > "$OUT/served-owner-blobs.json"
  for p in "${ASSETS[@]}"; do
    remote="$OUT/remote-${p//\//_}"
    curl -fsSL --retry 8 -H 'Cache-Control: no-cache, no-store, max-age=0' "$ROOT/$p?trafficactivation=$GITHUB_RUN_ID-$(date +%s%N)" -o "$remote"
    actual_blob="$(git hash-object "$remote")"
    test "$actual_blob" = "$(git rev-parse "$PHASEA_SOURCE:app/$p")"
    jq --arg path "app/$p" --arg blob "$actual_blob" '.+{($path):$blob}' "$OUT/served-owner-blobs.json" > "$ACT_TMP/served-next.json"
    cp "$ACT_TMP/served-next.json" "$OUT/served-owner-blobs.json"
  done
  ACT_STAGE=FINAL_BOUND_RECEIPT
  python3 - "$OUT" "$GITHUB_RUN_ID" "$(git rev-parse HEAD)" <<'ACTIVATION_RECEIPT_PY'
import hashlib, json, sys
from pathlib import Path
out = Path(sys.argv[1])
def load(name): return json.loads((out/name).read_text())
def save(name,obj): (out/name).write_text(json.dumps(obj, indent=2, sort_keys=True) + '\n')
t, inputs, state, step, owners = [load(p) for p in ['materialization-target.json','build-inputs-proof.json','state-final.json','activation-step.json','served-owner-blobs.json']]
binding = {'decision':'PASS_EXACT_SOURCE_BUILD_IMAGE_REVISION_BINDING','sourceSha':t['sourceSha'],'sourceTree':t['sourceTree'],'sourceArtifactDigest':t['sourceArtifactDigest'],'cloudBuildId':t['cloudBuildId'],'cloudBuildSource':t['cloudBuildSource'],'cloudBuildSourceArchiveSha256':t['cloudBuildSourceArchiveSha256'],'imageUri':t['imageUri'],'builtImageDigest':t['runtimeDigest'],'runtimeRevision':t['runtimeRevision'],'runtimeDigest':t['runtimeDigest'],'trafficPercent':100,'materializationRunId':t['materializationRunId'],'readbackRunId':int(sys.argv[2]),'controlSha':sys.argv[3],'remoteBuildInputsVerified':True,'buildInputsProof':inputs,'buildInputsProofSha256':hashlib.sha256((out/'build-inputs-proof.json').read_bytes()).hexdigest(),'sourceIdentityVerified':True,'runtimeSourceVerified':True,'configurationUnchanged':state['configurationUnchanged'],'tagsPreserved':state['tagsPreserved'],'trafficUpdates':step['trafficUpdatesCompleted'],'production':False}
save('runtime-binding-proof.json',binding)
result = {'decision':'PASS_I3_PHASEA_CUMULATIVE_DEV_MATERIALIZATION','operation':'EXISTING_IMAGE_TRAFFIC_ACTIVATION','sourceSha':t['sourceSha'],'sourceTree':t['sourceTree'],'runtimeSourceSha':t['sourceSha'],'artifactDigest':t['sourceArtifactDigest'],'sourceArtifactDigest':t['sourceArtifactDigest'],'sourceArtifactRetainedInUpload':False,'materializationRunId':t['materializationRunId'],'readbackRunId':int(sys.argv[2]),'controlSha':sys.argv[3],'cloudBuildId':t['cloudBuildId'],'runtimeRevision':t['runtimeRevision'],'runtimeDigest':t['runtimeDigest'],'hostingVersion':t['hostingVersion'],'hostingRelease':t['hostingRelease'],'firestoreRuleset':t['firestoreRuleset'],'rulesGitBlob':'540240ddbbb078ebcd14611dd2cc39375472ea66','hrRevision':t['expectedHrRevision'],'servedAssetCount':len(owners),'servedOwnerBlobs':owners,'sourceIdentityVerified':True,'remoteBuildInputsVerified':True,'runtimeSourceVerified':True,'trafficPercent':100,'runtimeBindingProof':'runtime-binding-proof.json','runtimeBindingProofSha256':hashlib.sha256((out/'runtime-binding-proof.json').read_bytes()).hexdigest(),'builds':0,'runtimeDeploys':0,'hostingDeploys':0,'firestoreRulesDeploys':0,'trafficUpdates':step['trafficUpdatesCompleted'],'configurationUnchanged':True,'tagsPreserved':True,'authWrites':0,'hrWrites':0,'fullTasksClosed':False,'production':False}
save('result.json',result)
ACTIVATION_RECEIPT_PY
  trap - ERR
  cat "$OUT/result.json"
}
# END_EXISTING_IMAGE_TRAFFIC_ACTIVATION_HELPERS

case "$MODE" in
session-source-proof|session-preflight|session-proof)
  # Focal opt-in in this existing control lane; no materialization and no seal rewrite.
  test "${I3_SESSION_PROOF:-}" = true
  test "${GITHUB_EVENT_NAME:-}" = push
  test "${GITHUB_REF:-}" = refs/heads/recovery/cxorbia-phase-a-20260831
  jq -e '.head_commit.message | contains("[i3-c02-d04-session-proof]")' "$GITHUB_EVENT_PATH" >/dev/null
  test "$(jq -r .status "$CANDIDATE_DESCRIPTOR")" = HOLD_I3_PHASE_A_CROSS_FUNCTIONAL_SHOCK_CONTROL
  test "$(jq -r .production "$CANDIDATE_DESCRIPTOR")" = DO_NOT_TOUCH
  SESSION_POINTER=CXORBIA_RECOVERY_EXECUTION_CURRENT.json
  SESSION_PACKAGE="$(jq -r .currentSessionProofPackage.path "$SESSION_POINTER")"
  [[ "$SESSION_PACKAGE" =~ ^docs/checkpoints/CXORBIA_I3_C02_D04_INDEPENDENT_SESSION_PACKAGE_20261029(_R[1-9][0-9]*)?\.json$ ]]
  test "$(git rev-parse "HEAD:$SESSION_PACKAGE")" = "$(jq -r .currentSessionProofPackage.gitBlob "$SESSION_POINTER")"
  test "$(jq -r .schemaVersion "$SESSION_PACKAGE")" = cxorbia.i3.c02-d04.independent-session-package.v1
  test "$(jq -r .branch "$SESSION_PACKAGE")" = recovery/cxorbia-phase-a-20260831
  test "$(git rev-parse HEAD^)" = "$(jq -r .expectedControlParentSha "$SESSION_PACKAGE")"
  test "$(jq -r .sourceSha "$SESSION_PACKAGE")" = 946c3cb8eff6a043693b10ed628d2ebc860508e1
  test "$(jq -r .sourceTree "$SESSION_PACKAGE")" = 4afcecfd4b41ac697995a1164115a23a46db44c7
  test "$(jq -r .sourceSha "$SESSION_PACKAGE")" = "$FOCAL_SOURCE"
  test "$(jq -r .sourceTree "$SESSION_PACKAGE")" = "$FOCAL_TREE"
  test "$(jq -r .productSourceSha "$CANDIDATE_DESCRIPTOR")" = "$FOCAL_SOURCE"
  test "$(jq -r .productTreeAuthority "$CANDIDATE_DESCRIPTOR")" = "$FOCAL_TREE"
  test "$(git rev-parse "$FOCAL_SOURCE^{tree}")" = "$FOCAL_TREE"
  git diff --quiet "$FOCAL_SOURCE" HEAD -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source ':(exclude)backend/runtime/hr-live-service/test/**'
  # The active immutable package selects exactly one existing QA mode.
  SESSION_MODE="$(jq -r '.mode // "C02_D04_INDEPENDENT_SESSION"' "$SESSION_PACKAGE")"
  case "$SESSION_MODE" in
    C02_D04_INDEPENDENT_SESSION)
      test "$(jq -r .id "$SESSION_PACKAGE")" = CXORBIA-I3-C02-D04-INDEPENDENT-SESSION-20261029-R5
      test "$(jq -r .attemptNumber "$SESSION_PACKAGE")" = 5
      SESSION_PREFLIGHT_DECISION=PASS_C02_D04_EXISTING_PREVIEW_PREFLIGHT
      SESSION_SOURCE_DECISION=PASS_C02_D04_SESSION_PACKAGE_SOURCE_GUARD
      ;;
    R6D07_READ_ONLY)
      test "$(jq -r .id "$SESSION_PACKAGE")" = CXORBIA-I3-D07-ADMIN-SHOPPER-READ-ONLY-20261029-R6
      test "$(jq -r .attemptNumber "$SESSION_PACKAGE")" = 6
      SESSION_PREFLIGHT_DECISION=PASS_D07_EXISTING_PREVIEW_PREFLIGHT
      SESSION_SOURCE_DECISION=PASS_D07_READ_ONLY_SESSION_PACKAGE_SOURCE_GUARD
      ;;
    *) echo SESSION_MODE_NOT_AUTHORIZED >&2; exit 1;;
  esac
  SESSION_REPAIR=docs/checkpoints/CXORBIA_I3_D04_EXACT_SERVER_READBACK_REPAIR_20261029.json
  test "$(jq -r .sourceRepair.path "$SESSION_PACKAGE")" = "$SESSION_REPAIR"
  test "$(jq -r .sourceRepair.gitBlob "$SESSION_PACKAGE")" = 87d53c006e247bec3b8ddde4599ce945fb6f48e8
  test "$(git rev-parse "HEAD:$SESSION_REPAIR")" = 87d53c006e247bec3b8ddde4599ce945fb6f48e8
  jq -e --arg source "$FOCAL_SOURCE" --arg tree "$FOCAL_TREE" '.d04ExactServerReadbackRepair20261029.sourceSha==$source and .d04ExactServerReadbackRepair20261029.sourceTree==$tree and .d04ExactServerReadbackRepair20261029.path=="docs/checkpoints/CXORBIA_I3_D04_EXACT_SERVER_READBACK_REPAIR_20261029.json" and .d04ExactServerReadbackRepair20261029.gitBlob=="87d53c006e247bec3b8ddde4599ce945fb6f48e8"' "$CANDIDATE_DESCRIPTOR" >/dev/null
  SESSION_PREVIEW_CONTROL="$(jq -r .preview.controlSha "$SESSION_PACKAGE")"
  SESSION_PREVIEW_REQUEST=.github/control/CXORBIA_I3_CROSSFRONT_1029_DEV_PREVIEW_REQUEST.json
  SESSION_PREVIEW_WORKFLOW=.github/workflows/cxorbia-i3-vrm290-invoked-hosting-dev.yml
  [[ "$SESSION_PREVIEW_CONTROL" =~ ^[a-f0-9]{40}$ ]]
  test "$(jq -r .preview.transportRequestPath "$SESSION_PACKAGE")" = "$SESSION_PREVIEW_REQUEST"
  test "$(git log -1 --pretty=%B "$SESSION_PREVIEW_CONTROL")" = I3-CROSSFRONT-1029-DEV-PREVIEW-ONLY
  git merge-base --is-ancestor "$FOCAL_SOURCE" "$SESSION_PREVIEW_CONTROL"
  git merge-base --is-ancestor "$SESSION_PREVIEW_CONTROL" HEAD^
  test "$(git rev-parse "$SESSION_PREVIEW_CONTROL^")" = "$(jq -r .expectedControlParentSha "$SESSION_PREVIEW_REQUEST")"
  test "$(git rev-parse "$SESSION_PREVIEW_CONTROL:$SESSION_PREVIEW_REQUEST")" = "$(jq -r .preview.transportRequestGitBlob "$SESSION_PACKAGE")"
  test "$(git rev-parse "HEAD:$SESSION_PREVIEW_REQUEST")" = "$(jq -r .preview.transportRequestGitBlob "$SESSION_PACKAGE")"
  git diff --quiet "$SESSION_PREVIEW_CONTROL" HEAD -- "$SESSION_PREVIEW_REQUEST" "$SESSION_PREVIEW_WORKFLOW"
  git diff --quiet "$FOCAL_SOURCE" "$SESSION_PREVIEW_CONTROL" -- app backend tools firebase.json .firebaserc firestore.rules storage.rules
  test "$(git diff --name-only "$FOCAL_SOURCE" HEAD -- tools)" = tools/qa/cxorbia-i3-d04-e04-run1782-live.mjs
  jq -e --arg source "$FOCAL_SOURCE" --arg tree "$FOCAL_TREE" '.sourceSha==$source and .sourceTree==$tree and .expectedProductPredecessorSha=="e753c418fb797a506f6dce3b2b51de405c9b33f1" and .transport=="FIREBASE_HOSTING_PREVIEW_ONLY" and .production=="DO_NOT_TOUCH" and .authorizationI4==false' "$SESSION_PREVIEW_REQUEST" >/dev/null
  test "$(jq -cS .sourceProof "$SESSION_PACKAGE")" = "$(jq -cS .sourceProof "$SESSION_PREVIEW_REQUEST")"
  SESSION_PREVIEW_RUN="$(jq -r .preview.runId "$SESSION_PACKAGE")"
  SESSION_PREVIEW_ARTIFACT="$(jq -r .preview.artifactId "$SESSION_PACKAGE")"
  SESSION_PREVIEW_ZIP="$(jq -r .preview.artifactZipSha256 "$SESSION_PACKAGE")"
  [[ "$SESSION_PREVIEW_RUN" =~ ^[1-9][0-9]*$ ]]
  [[ "$SESSION_PREVIEW_ARTIFACT" =~ ^[1-9][0-9]*$ ]]
  [[ "$SESSION_PREVIEW_ZIP" =~ ^[a-f0-9]{64}$ ]]
  test "$SESSION_PREVIEW_RUN" = '40973709501'
  test "$SESSION_PREVIEW_RUN" != 40901257714
  jq -e '.preview.transportDecision=="PASS_I3_CROSSFRONT_1029_DEV_HOSTING_PREVIEW_EXACT_BYTES_ISOLATED" and .preview.servedFilesMatch==8 and .preview.production==false and .preview.hostingLiveWrites==0 and .preview.cloudRunTrafficWrites==0 and .preview.rulesWrites==0 and .preview.hrWrites==0 and .preview.authWrites==0 and .c02.replayReconciliation==false and .actor.createUser==false and .actor.changeClaims==false' "$SESSION_PACKAGE" >/dev/null
  if [[ "$SESSION_MODE" == R6D07_READ_ONLY ]];then
    jq -e '.production==false and .actor.uid=="NkcIVM4AnSU1gI9cGKHI5P12YqC3" and .actor.tenantId=="tya" and .actor.projectId=="cinepolis" and .actor.role=="admin" and .c02.execute==false and .c02.replayReconciliation==false and .d04.execute==false and .d04.fixtureSeeds==0 and .d04.contentEdits==0 and .d04.fixtureDeletes==0 and .scope.financeWrites==0 and .scope.authMutations==0 and .scope.hrWrites==0 and .scope.resourceWrites==0 and .scope.storageWrites==0 and .scope.qaFixtureWrites==0 and .scope.deploys==0 and .scope.production==false and .d07.roles==["admin","shopper"] and .d07.tenantId=="tya" and .d07.projectId=="cinepolis" and .d07.periodId=="cinepolis-2026-10" and .d07.shopperId=="TYA_GT_393371F88D10F7A8" and .d07.shopperUidFingerprint=="a6e3ff21498bd79cbc4078ec47b7b5760a6534e43803614e997bb2294d77ee98" and .d07.approvedName=="Instructivo Shopper.pdf" and .d07.approvedSize==162335 and .d07.approvedSha256=="3654d624896f3517c39136b29f6c37542d8a128f9d8d9d8a616693f039753454" and .d07.bucket=="cxorbia-backend-dev.firebasestorage.app" and .d07.binaryGetsPerRole==1 and .d07.downloadsPerRole==1 and .d07.resourceCrud==false and .d07.storageRuleChanges==false and .d07.corsChanges==false and .d07.serviceWorkerChanges==false' "$SESSION_PACKAGE" >/dev/null
  else
  jq -e '.production==false and .actor.uid=="NkcIVM4AnSU1gI9cGKHI5P12YqC3" and .actor.tenantId=="tya" and .actor.projectId=="cinepolis" and .actor.role=="admin" and .c02.uiVisitId=="hr_2026-10_gt_2_97b3975c30" and .c02.durableVisitId=="OCTUBRE 26!2" and .c02.periodId=="cinepolis-2026-10" and .c02.priorReceiptPath=="docs/checkpoints/CXORBIA_I3_C02_DURABLE_RECEIPT_READBACK_20261029.json" and .c02.priorReceiptGitBlob=="5a18cab354ac9fbb216c0c9ff03a8460065f40db" and .d04.fixturePrefix=="qa-i3-d04-session-" and .d04.questions==15 and .d04.edits==1 and .d04.publish==false and .d04.cleanup==true and .scope.financeWrites==0 and .scope.authMutations==0 and .scope.hrWrites==0 and .scope.deploys==0 and .scope.production==false' "$SESSION_PACKAGE" >/dev/null
  test "$(git rev-parse "HEAD:$(jq -r .c02.priorReceiptPath "$SESSION_PACKAGE")")" = "$(jq -r .c02.priorReceiptGitBlob "$SESSION_PACKAGE")"
  fi
  test "$(jq -r .preview.channel "$SESSION_PACKAGE")" = "i3-recovery-1029-$SESSION_PREVIEW_RUN"
  SESSION_EXPECTED_ROOT="$(jq -r .preview.origin "$SESSION_PACKAGE")"
  SESSION_EXPECTED_HOSTING="$(jq -r .preview.hostingVersion "$SESSION_PACKAGE")"
  test "$SESSION_EXPECTED_ROOT" = 'https://cxorbia-backend-dev--i3-recovery-1029-40973709501-011nk50h.web.app'
  test "$SESSION_EXPECTED_HOSTING" = 'sites/cxorbia-backend-dev/versions/bd065678b1af6c14'
  [[ "$SESSION_EXPECTED_ROOT" =~ ^https://cxorbia-backend-dev--i3-recovery-1029-$SESSION_PREVIEW_RUN-[a-z0-9]+\.web\.app$ ]]
  [[ "$SESSION_EXPECTED_HOSTING" =~ ^sites/cxorbia-backend-dev/versions/[a-f0-9]+$ ]]
  test "$(jq -r .preview.runtimeRevision "$SESSION_PACKAGE")" = cxorbia-live-hr-dev-00330-fim
  test "$(jq -r .preview.runtimeDigest "$SESSION_PACKAGE")" = sha256:bba5ebbf19c203954ec0be6c2c3ef01a057e7ce3f98fb7e5eeac2d889bd0a500
  test "$PROJECT" = cxorbia-backend-dev
  test "$SERVICE" = cxorbia-live-hr-dev
  test "$HOSTING_SITE" = cxorbia-backend-dev
  test "$TENANT_ID" = tya
  test "$PROJECT_ID" = cinepolis
  node --check tools/qa/cxorbia-i3-d04-e04-run1782-live.mjs
  SESSION_OUT="${PHASEA_LIVE_OUT:?}/session-proof"
  mkdir -p "$SESSION_OUT"
  SESSION_PACKAGE_BLOB="$(git rev-parse "HEAD:$SESSION_PACKAGE")"
  SESSION_CONTROL="$(git rev-parse HEAD)"
  if [[ "$MODE" == session-source-proof ]];then
    jq -n -S --arg control "$SESSION_CONTROL" --arg package "$SESSION_PACKAGE_BLOB" --arg source "$FOCAL_SOURCE" --arg decision "$SESSION_SOURCE_DECISION" --arg mode "$SESSION_MODE" '{decision:$decision,mode:$mode,controlSha:$control,packageBlob:$package,sourceSha:$source,cloudAccess:false,writes:0,production:false}' > "$SESSION_OUT/package-source-guard.json"
    exit 0
  fi
  if [[ "$MODE" == session-proof ]];then
    jq -e --arg control "$SESSION_CONTROL" --arg package "$SESSION_PACKAGE_BLOB" --arg run "$GITHUB_RUN_ID" --arg decision "$SESSION_PREFLIGHT_DECISION" --arg mode "$SESSION_MODE" '.decision==$decision and .mode==$mode and .controlSha==$control and .packageBlob==$package and .runId==$run and .production==false' "$SESSION_OUT/preflight.json" >/dev/null
    export HOSTING_URL="$(jq -r .preview.origin "$SESSION_PACKAGE")"
    export EXPECTED_HR_REVISION="$(jq -r .hrRevision "$SESSION_OUT/preflight.json")"
    export CXORBIA_I3_INDEPENDENT_SESSION_PROOF=YES_PAULA_20261029_DEV
    export CXORBIA_I3_SESSION_PACKAGE="$SESSION_PACKAGE"
    export CXORBIA_I3_SESSION_PREFLIGHT="$SESSION_OUT/preflight.json"
    export CXORBIA_I3_SESSION_MODE="$SESSION_MODE"
    node tools/qa/cxorbia-i3-d04-e04-run1782-live.mjs | tee "$SESSION_OUT/session-proof-console.log"
    if [[ "$SESSION_MODE" == R6D07_READ_ONLY ]];then
      jq -e '.decision=="PASS_D07_ADMIN_SHOPPER_REAL_PDF_READ_ONLY_CLAUSE" and .mode=="R6D07_READ_ONLY" and .d07.metadataAndUpdateTimeUnchanged==true and .d07.admin.decision=="PASS_EXACT_APPROVED_PDF_READ_RENDER_DOWNLOAD_FOR_ROLE" and .d07.shopper.decision=="PASS_EXACT_APPROVED_PDF_READ_RENDER_DOWNLOAD_FOR_ROLE" and .contextGuardsPass==true and .c02.executed==false and .d04.executed==false and .writes.auth==0 and .writes.hr==0 and .writes.resource==0 and .writes.financeCommands==0 and .cleanup.browserClosed==true and .production==false' "$PHASEA_LIVE_OUT/d07-readonly/result.json" >/dev/null
    else
    jq -e '.decision=="PASS_C02_D04_INDEPENDENT_SESSIONS" and .c02.independentApplicationSession==true and .d04.independentApplicationSession==true and .cleanup.qaAbsentAfter==true and .writes.auth==0 and .writes.hr==0 and .writes.finance==0 and .writes.otherBanks==0 and .production==false' "$PHASEA_LIVE_OUT/d04-e04/result.json" >/dev/null
    fi
    exit 0
  fi
  SESSION_ROOT="$(jq -r .preview.origin "$SESSION_PACKAGE")"
  SESSION_REVISION="$(jq -r .preview.runtimeRevision "$SESSION_PACKAGE")"
  SESSION_DIGEST="$(jq -r .preview.runtimeDigest "$SESSION_PACKAGE")"
  gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$SESSION_OUT/runtime.json"
  jq -e --arg revision "$SESSION_REVISION" '.status.latestReadyRevisionName==$revision and ([.status.traffic[] | select(.revisionName==$revision) | (.percent // 0)] | add)==100' "$SESSION_OUT/runtime.json" >/dev/null
  gcloud run revisions describe "$SESSION_REVISION" --project "$PROJECT" --region "$REGION" --format=json > "$SESSION_OUT/revision.json"
  SESSION_RAW="$(jq -r '.status.imageDigest // empty' "$SESSION_OUT/revision.json")"
  case "$SESSION_RAW" in sha256:*) SESSION_OBSERVED_DIGEST="$SESSION_RAW";; *@sha256:*) SESSION_OBSERVED_DIGEST="sha256:${SESSION_RAW##*@sha256:}";; *) exit 1;; esac
  test "$SESSION_OBSERVED_DIGEST" = "$SESSION_DIGEST"
  SESSION_TOKEN="$(gcloud auth print-access-token)"
  curl -fsS -H "Authorization: Bearer $SESSION_TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/$(jq -r .preview.channel "$SESSION_PACKAGE")" > "$SESSION_OUT/hosting-preview.json"
  unset SESSION_TOKEN
  jq -e --arg version "$(jq -r .preview.hostingVersion "$SESSION_PACKAGE")" --arg root "$SESSION_ROOT" '.release.version.name==$version and .release.version.status=="FINALIZED" and .url==$root' "$SESSION_OUT/hosting-preview.json" >/dev/null
  SESSION_ASSETS=(index-backend-dev.html core/backend-browser-auth.js core/backend-protected-dev-mode.js core/backend-protected-dev-session-continuity.js core/backend-resources.js core/backend-certifications.js modules/cert.js modules/finanzas.js adapters/tya-financial-canonical-source-safe-adapter.js core/backend-cxdata-finance-read.js core/backend-finance-benefits.js)
  if [[ "$SESSION_MODE" == R6D07_READ_ONLY ]];then SESSION_ASSETS+=(modules/documentos.js);fi
  SESSION_OWNER_BLOBS='{}'
  for SESSION_ASSET in "${SESSION_ASSETS[@]}";do
    SESSION_FILE="$SESSION_OUT/served-${SESSION_ASSET//\//_}"
    curl -fsSL -H 'Cache-Control: no-cache, no-store, max-age=0' "$SESSION_ROOT/$SESSION_ASSET?sessionproof=$GITHUB_RUN_ID" -o "$SESSION_FILE"
    test "$(git hash-object "$SESSION_FILE")" = "$(git rev-parse "$FOCAL_SOURCE:app/$SESSION_ASSET")"
    SESSION_ASSET_BLOB="$(git hash-object "$SESSION_FILE")"
    SESSION_OWNER_BLOBS="$(jq -c --arg path "app/$SESSION_ASSET" --arg blob "$SESSION_ASSET_BLOB" '.+{($path):$blob}' <<< "$SESSION_OWNER_BLOBS")"
  done
  curl -fsS -H 'Cache-Control: no-cache, no-store, max-age=0' "$SESSION_ROOT/api/tya/cinepolis/hr-live?format=meta&phaseapreflight=readback-20261029&sessionproof=$GITHUB_RUN_ID" > "$SESSION_OUT/hr-meta.json"
  jq -e '.ok==true and .revisionStable==true and .sourceSafe==true and .hrWrites==false and .production==false' "$SESSION_OUT/hr-meta.json" >/dev/null
  SESSION_HR="$(jq -r '.revision // empty' "$SESSION_OUT/hr-meta.json")"
  [[ "$SESSION_HR" =~ ^[0-9a-f]{64}$ ]]
  jq -n -S --arg control "$SESSION_CONTROL" --arg package "$SESSION_PACKAGE_BLOB" --arg run "$GITHUB_RUN_ID" --arg source "$FOCAL_SOURCE" --arg tree "$FOCAL_TREE" --arg hr "$SESSION_HR" --arg root "$SESSION_ROOT" --arg hosting "$(jq -r .preview.hostingVersion "$SESSION_PACKAGE")" --arg revision "$SESSION_REVISION" --arg digest "$SESSION_DIGEST" --arg previewControl "$SESSION_PREVIEW_CONTROL" --argjson previewRun "$SESSION_PREVIEW_RUN" --argjson previewArtifact "$SESSION_PREVIEW_ARTIFACT" --arg previewZip "$SESSION_PREVIEW_ZIP" --arg decision "$SESSION_PREFLIGHT_DECISION" --arg mode "$SESSION_MODE" --argjson servedOwners "$SESSION_OWNER_BLOBS" --argjson servedCount "${#SESSION_ASSETS[@]}" '{decision:$decision,mode:$mode,controlSha:$control,packageBlob:$package,runId:$run,sourceSha:$source,sourceTree:$tree,hrRevision:$hr,previewOrigin:$root,hostingVersion:$hosting,runtimeRevision:$revision,runtimeDigest:$digest,previewControlSha:$previewControl,previewRunId:$previewRun,previewArtifactId:$previewArtifact,previewArtifactZipSha256:$previewZip,servedOwnerCount:$servedCount,servedOwnerBlobs:$servedOwners,sourceIdentityVerified:true,deploys:0,writes:0,production:false}' > "$SESSION_OUT/preflight.json"
  ;;
source-proof)
  STATUS="$(jq -r '.status' "$CANDIDATE_DESCRIPTOR")"
  case "$STATUS" in
    HOLD_I3_B_CUMULATIVE_SOURCE_PROOF_REQUIRED|HOLD_I3_PHASE_A_CROSS_FUNCTIONAL_SHOCK_CONTROL) ;;
    *) echo "PHASEA_SOURCE_PROOF_UNAUTHORIZED_STATUS:$STATUS" >&2; exit 1 ;;
  esac
  # A failed source gate must leave an honest receipt and preserve its log.
  trap 'source_rc=$?; jq -n -S --arg source "$FOCAL_SOURCE" --arg tree "$FOCAL_TREE" --argjson exitCode "$source_rc" '\''{decision:"FAIL_I3_CUMULATIVE_SOURCE_PROOF",sourceSha:$source,sourceTree:$tree,exitCode:$exitCode,scope:"SOURCE_CONTRACTS_ONLY_NOT_I3_CERTIFICATION",wholeProductPass:false,liveE2e:"NOT_RUN",moduleMatchPromotions:0,deploys:0,production:false}'\'' > /tmp/i3-phasea-completion-source-proof.json; exit "$source_rc"' ERR
  test "$(jq -r '.productSourceSha' "$CANDIDATE_DESCRIPTOR")" = "$FOCAL_SOURCE"
  test "$(jq -r '.productTreeAuthority' "$CANDIDATE_DESCRIPTOR")" = "$FOCAL_TREE"
  test "$(git rev-parse "$FOCAL_SOURCE^{tree}")" = "$FOCAL_TREE"
  git diff --quiet "$FOCAL_SOURCE" HEAD -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source ':(exclude)backend/runtime/hr-live-service/test/**'
  # Same pinned SDK as the existing runtime; source fixtures never use remote credentials.
  npm install --no-save --ignore-scripts --package-lock=false firebase-admin@13.4.0
  for f in app/modules/beneficios.js app/modules/dashboard.js app/modules/postulaciones.js app/modules/finanzas.js app/modules/cert.js app/modules/misvisitas.js app/adapters/tya-canonical-shopper-portal-v2.js app/adapters/tya-c6-domain-consistency-bridge.js app/adapters/tya-protected-auth-hr-authority-bridge-v2.js app/adapters/tya-c6-unified-human-runtime-v1.js app/adapters/tya-canonical-reservations-guard-v2.js app/adapters/tya-financial-canonical-source-safe-adapter.js; do node --check "$f"; done
  # G04: execute the exact sealed A04/C01 regressions in this existing source-only lane.
  node tools/qa/cxorbia-i3-a04-c01-focal.test.cjs . | tee /tmp/i3-a04-c01-focal-source-test.log
  node --test backend/runtime/hr-live-service/test/cxorbia-b1-canonical-visible-identity.test.mjs | tee /tmp/i3-a04-canonical-visible-identity-test.log
  # G05: source-only reader/writer, receipt, UI and unchanged identity/read regressions.
  node tools/qa/cxorbia-i3-g05-observation-no-writes.test.cjs . | tee /tmp/i3-g05-source-1.log
  node tools/qa/cxorbia-i3-g05-writer-receipts.test.cjs . | tee /tmp/i3-g05-source-2.log
  node tools/qa/cxorbia-i3-g05-sync-command-ui.test.cjs . | tee /tmp/i3-g05-source-3.log
  node --test --test-name-pattern="bounded visit workers" backend/runtime/hr-live-service/test/cxorbia-gate7-operational-assignment.test.mjs | tee /tmp/i3-g05-source-4.log
  node --test backend/runtime/hr-live-service/test/cxorbia-shopper-command-provider-v1.test.mjs backend/runtime/hr-live-service/test/cxorbia-vrm134-runtime-latency.test.mjs tools/qa/cxorbia-i3-b1-cold-login-parallel-source.test.mjs | tee /tmp/i3-g05-source-5.log
  grep -Fq "data-dashboard-actions" app/modules/dashboard.js
  grep -Fq "c6PrimarySurfacePreserved" app/adapters/tya-c6-domain-consistency-bridge.js
  grep -Fq "canonicalBaseSucursales" app/adapters/tya-canonical-reservations-guard-v2.js
  node --test backend/runtime/hr-live-service/test/cxorbia-i3-phasea-completion-source-contract.test.mjs
node --test tools/qa/cxorbia-i3-a05-atomic-session-publication-source.test.mjs | tee /tmp/i3-phasea-completion-source-test.log
  node --check app/core/shoppers-store.js
  node tools/qa/cxorbia-i3-vrm280-exact-shopper-session-fallback.test.mjs | tee /tmp/i3-vrm280-exact-shopper-session-source-test.log
  node --test tools/qa/cxorbia-i3-d02-document-extraction-source.test.mjs | tee /tmp/i3-d02-document-extraction-source-test.log
  node --test tools/qa/cxorbia-i3-d03-ai-generation-source.test.mjs | tee /tmp/i3-d03-ai-generation-source-test.log
  node --test tools/qa/cxorbia-i3-d04-versioned-bank-review.test.mjs tools/qa/cxorbia-i3-e04-benchmark-source.test.mjs | tee /tmp/i3-d04-e04-parallel-source-proof.log
  # D05: runtime-owned publication/configuration/retirement with durable authorization and readback.
  node --test backend/runtime/hr-live-service/test/cxorbia-prei4-cert-res-contract.test.mjs | tee /tmp/i3-d05-lifecycle-source-proof.log
  # C04/C05: durable Global scope, authoritative membership, ACK/readback and currency isolation.
  node --test backend/runtime/hr-live-service/test/cxorbia-finance-command-provider-v1.test.mjs | tee /tmp/i3-c04-global-finance-source-proof.log
  # D07: identical snapshots must not remount the viewer; retain authenticated bytes and period isolation.
  node --test tools/qa/cxorbia-i3-work-uat-vrm285-resource-viewer.test.mjs tools/qa/cxorbia-i3-d07-authenticated-pdf-resource.test.mjs tools/qa/cxorbia-i3-work-uat-cert-resource-period.test.mjs | tee /tmp/i3-d07-resource-stability-source-proof.log
  node --test tools/qa/cxorbia-i3-admin-client-readonly-preview.test.mjs | tee /tmp/i3-admin-client-preview-source-proof.log
  node --test backend/runtime/hr-live-service/test/cxorbia-i3-d03-document-source-metadata.test.mjs | tee /tmp/i3-d03-document-source-metadata.log
  node --test backend/runtime/hr-live-service/test/cxorbia-vrm261-264-source-contract.test.mjs | tee /tmp/i3-vrm261-264-source-test.log
  # B7: independent Firestore emulator gate; no DEV/production writes.
  node --check tools/qa/cxorbia-i3-b7-exact-notification-firestore-rules.test.mjs
  npm install --no-save --ignore-scripts --package-lock=false firebase@12.4.0 @firebase/rules-unit-testing@5.0.2 firebase-tools@latest
  if [ -n "${JAVA_HOME_21_X64:-}" ]; then export JAVA_HOME="$JAVA_HOME_21_X64"; export PATH="$JAVA_HOME/bin:$PATH"; fi
  node -e "require('fs').writeFileSync('firebase.i3-b7-emulator.json', JSON.stringify({firestore:{rules:'firestore.rules'},emulators:{singleProjectMode:false,firestore:{port:8080}}}))"
  ./node_modules/.bin/firebase emulators:exec --config firebase.i3-b7-emulator.json --project demo-cxorbia-b7-ruleproof --only firestore "node --test tools/qa/cxorbia-i3-b7-exact-notification-firestore-rules.test.mjs tools/qa/cxorbia-i3-c04-global-finance-rules.test.mjs tools/qa/cxorbia-i3-d05-certification-authority-rules.test.mjs" | tee /tmp/i3-b7-emulator-proof.log
  node --test backend/runtime/hr-live-service/test/cxorbia-vrm268-269-source-contract.test.mjs | tee /tmp/i3-vrm268-269-source-test.log
  node --test backend/runtime/hr-live-service/test/cxorbia-b1-transversal-shopper-actions.test.mjs | tee /tmp/i3-b1-oct07-source-test.log
  node --test backend/runtime/hr-live-service/test/cxorbia-i3-oct08-b1-b3-source.test.mjs | tee /tmp/i3-oct08-b1-b3-source-test.log
  # VRM-285 exact approved resources viewer owner + UI regression, no data writes.
  if [[ "$FOCAL_SOURCE" == "2c1c5951596a2dd260f02a744b21aa2cb46b17da" ]]; then
    test "$(git rev-parse "$FOCAL_SOURCE:app/modules/documentos.js")" = "c0eefe84d7d4f220c25dfd058e5712ec84556c42"
    test "$(git rev-parse "$FOCAL_SOURCE:tools/qa/cxorbia-i3-work-uat-vrm285-resource-viewer.test.mjs")" = "dcc13d368923c11085e70de715e6d940f8395dc1"
    node --check app/modules/documentos.js
    node --test tools/qa/cxorbia-i3-work-uat-vrm285-resource-viewer.test.mjs
  fi
  MATRIX="$(jq -r '.moduleTruthPath' "$CANDIDATE_DESCRIPTOR")"
  COUNTS="$(jq -c '[.modules[].classification] | group_by(.) | map({key:.[0],value:length}) | from_entries' "$MATRIX")"
  jq -n -S --arg source "$FOCAL_SOURCE" --arg tree "$FOCAL_TREE" --arg status "$STATUS" --argjson counts "$COUNTS" '{decision:"PASS_I3_B_CUMULATIVE_SOURCE_PROOF",sourceSha:$source,sourceTree:$tree,status:$status,scope:"SOURCE_CONTRACTS_ONLY_NOT_I3_CERTIFICATION",recordedModuleClassificationCounts:$counts,wholeProductPass:false,liveE2e:"NOT_RUN",moduleMatchPromotions:0,clickE2ERequired:true,deploys:0,production:false}' > /tmp/i3-phasea-completion-source-proof.json
  trap - ERR
  cat /tmp/i3-phasea-completion-source-proof.json
  ;;
preflight)
  mkdir -p "$OUT"
  test "$PROJECT" = "cxorbia-backend-dev"
  test "$SERVICE" = "cxorbia-live-hr-dev"
  test "$HOSTING_SITE" = "cxorbia-backend-dev"
  test "$FIREBASE_HOSTING_TARGET" = "cxorbia-dev"
  test "$(jq -r '.production' "$CANDIDATE_DESCRIPTOR")" = "DO_NOT_TOUCH"
  STATUS="$(jq -r '.status' "$CANDIDATE_DESCRIPTOR")"
  if [[ "$STATUS" != "HOLD_I3_PHASEA_CUMULATIVE_DEV_MATERIALIZATION_REQUIRED" && "$STATUS" != "HOLD_I3_PHASEA_CUMULATIVE_DEV_READBACK_ONLY_REQUIRED" ]]; then
    echo "PHASEA_UNAUTHORIZED_STATUS:$STATUS" >&2; exit 1
  fi
  if [[ "$STATUS" == "HOLD_I3_PHASEA_CUMULATIVE_DEV_READBACK_ONLY_REQUIRED" ]]; then
    test "$(jq -r '.i3PhaseADevReadbackTarget.production' "$CANDIDATE_DESCRIPTOR")" = "false"
    test "$(jq -r '.i3PhaseADevReadbackTarget.sourceSha' "$CANDIDATE_DESCRIPTOR")" = "$PHASEA_SOURCE"
    test "$(jq -r '.i3PhaseADevReadbackTarget.sourceTree' "$CANDIDATE_DESCRIPTOR")" = "$PHASEA_TREE"
    test "$(jq -r '.i3PhaseADevReadbackTarget.project' "$CANDIDATE_DESCRIPTOR")" = "cxorbia-backend-dev"
    test "$(jq -r '.i3PhaseADevReadbackTarget.materializationRunId // 0' "$CANDIDATE_DESCRIPTOR")" -gt 0
  fi
  test "$(jq -r '.productSourceSha' "$CANDIDATE_DESCRIPTOR")" = "$PHASEA_SOURCE"
  test "$(jq -r '.productTreeAuthority' "$CANDIDATE_DESCRIPTOR")" = "$PHASEA_TREE"
  test "$(git rev-parse "$PHASEA_SOURCE^{tree}")" = "$PHASEA_TREE"
  # Bind the one DEV materialization to an adjudicated immutable canonical CI receipt.
  SOURCE_PROOF_RECEIPT="$(jq -r '.currentSourceProof.path // empty' "$CANDIDATE_DESCRIPTOR")"
  SOURCE_PROOF_BLOB="$(jq -r '.currentSourceProof.gitBlob // empty' "$CANDIDATE_DESCRIPTOR")"
  [[ "$SOURCE_PROOF_RECEIPT" =~ ^docs/checkpoints/CXORBIA_I3_[A-Z0-9_]+\.json$ ]]
  [[ "$SOURCE_PROOF_BLOB" =~ ^[a-f0-9]{40}$ ]]
  test "$(git rev-parse "HEAD:$SOURCE_PROOF_RECEIPT")" = "$SOURCE_PROOF_BLOB"
  jq -e --arg source "$PHASEA_SOURCE" --arg tree "$PHASEA_TREE" '.decision=="PASS_I3_B_CUMULATIVE_SOURCE_PROOF" and .sourceSha==$source and .sourceTree==$tree and .runId>0 and .sourceJobId>0 and .artifactId>0 and (.artifactZipSha256|test("^[a-f0-9]{64}$")) and .production==false' "$SOURCE_PROOF_RECEIPT" >/dev/null
  git diff --quiet "$PHASEA_SOURCE" HEAD -- app backend firebase.json .firebaserc firestore.rules storage.rules tools/hr-source ':(exclude)backend/runtime/hr-live-service/test/**'
  node --test backend/runtime/hr-live-service/test/cxorbia-i3-phasea-completion-source-contract.test.mjs | tee "$OUT/source-test.log"
  node --test backend/runtime/hr-live-service/test/cxorbia-b1-transversal-shopper-actions.test.mjs | tee "$OUT/b1-oct07-source-test.log"
  node --test backend/runtime/hr-live-service/test/cxorbia-i3-oct08-b1-b3-source.test.mjs | tee "$OUT/oct08-b1-b3-source-test.log"
  PREDECESSOR_SOURCE="$(jq -r '.predecessorProductSourceSha' "$CANDIDATE_DESCRIPTOR")"
  # VRM-282/283/284 A09-B11: admit only the approved administrative HR command
  # entrypoint at its exact immutable source/blob. Preserve the predecessor
  # freeze for visita-detalle and every other candidate (fail closed on drift).
  for protected in app/modules/visitas.js app/modules/visita-detalle.js; do
    if [[ "$protected" == "app/modules/visitas.js" && "$PHASEA_SOURCE" == "cf94910dc3742e797b63f26e93166be388544021" ]]; then
      test "$(git rev-parse "$PHASEA_SOURCE:$protected")" = "c91bcd42c51b96ac266bb37967c2d2103735683b"
      test "$(git rev-parse "$PHASEA_SOURCE:tools/qa/cxorbia-i3-work-uat-a09b11-hr-admin-reconcile.test.mjs")" = "6e79255dcd76fa9dedf9d4e35981c9de6fac2298"
      node --check "$protected"
      node --test tools/qa/cxorbia-i3-work-uat-a09b11-hr-admin-reconcile.test.mjs
    elif [[ "$protected" == "app/modules/visitas.js" && "$PHASEA_SOURCE" == "68bf2522458fb48144eaa370c1a0bac516d96870" ]]; then
      test "$(git rev-parse "$PHASEA_SOURCE:$protected")" = "0d3e9f097c34076634c24e28efe7a1671c49c1d5"
      test "$(git rev-parse "$PHASEA_SOURCE:tools/qa/cxorbia-i3-work-uat-a09b11-hr-admin-reconcile.test.mjs")" = "6ff6ba738359375606251036c9e087e489d30db2"
      node --check "$protected"
      node --test tools/qa/cxorbia-i3-work-uat-a09b11-hr-admin-reconcile.test.mjs
    elif [[ "$protected" == "app/modules/visitas.js" && "$PHASEA_SOURCE" == "60b092d1f1a150e8e48c213695825dcbbaed7be4" ]]; then
      test "$(git rev-parse "$PHASEA_SOURCE:$protected")" = "b193c11d708667be9bf4ab586d903f47e69ab8c3"
      test "$(git rev-parse "$PHASEA_SOURCE:tools/qa/cxorbia-i3-work-uat-a09b11-hr-admin-reconcile.test.mjs")" = "ba3fc7fef5001089c18d95ed20fc5ac410aacfbc"
      node --check "$protected"
      node --test tools/qa/cxorbia-i3-work-uat-a09b11-hr-admin-reconcile.test.mjs
    elif [[ "$protected" == "app/modules/visitas.js" && "$PHASEA_SOURCE" == "f40d5d8bc6aa45a9c7ac3f2bfb0bd0a197a52251" ]]; then
      test "$(git rev-parse "$PHASEA_SOURCE:$protected")" = "8aea3a23e64dd186bee5d6639142859b7d53892f"
      node --check "$protected"
      node --test tools/qa/cxorbia-i3-work-uat-a09b11-hr-admin-reconcile.test.mjs
    else
      test "$(git rev-parse "$PREDECESSOR_SOURCE:$protected")" = "$(git rev-parse "$PHASEA_SOURCE:$protected")"
    fi
  done
  # VRM-285 exact approved resources viewer owner + UI regression, no data writes.
  if [[ "$PHASEA_SOURCE" == "2c1c5951596a2dd260f02a744b21aa2cb46b17da" ]]; then
    test "$(git rev-parse "$PHASEA_SOURCE:app/modules/documentos.js")" = "c0eefe84d7d4f220c25dfd058e5712ec84556c42"
    test "$(git rev-parse "$PHASEA_SOURCE:tools/qa/cxorbia-i3-work-uat-vrm285-resource-viewer.test.mjs")" = "dcc13d368923c11085e70de715e6d940f8395dc1"
    node --check app/modules/documentos.js
    node --test tools/qa/cxorbia-i3-work-uat-vrm285-resource-viewer.test.mjs
  fi
  node tools/qa/cxorbia-i3-canonical-candidate-authority-guard.mjs > "$OUT/canonical-authority.json"
  jq -e '.moduleTruthReadback.sourceAligned==true and .moduleTruthReadback.domainCount==21 and .moduleBlobReadback.pass==true' "$OUT/canonical-authority.json" >/dev/null
  # Install the pre-existing Firebase CLI in the same approved runner before the one DEV build.
  # Existing-image activation needs no Firebase publish CLI.
  if [[ "$(jq -r '.i3PhaseADevReadbackTarget.existingImageTrafficActivation // false' "$CANDIDATE_DESCRIPTOR")" != true ]]; then
  npm install --no-save --ignore-scripts --package-lock=false firebase-tools@latest >/dev/null 2>&1
  fi
  if [[ "$STATUS" == HOLD_I3_PHASEA_CUMULATIVE_DEV_READBACK_ONLY_REQUIRED && "$(jq -r '.i3PhaseADevReadbackTarget.diagnosticOnly // false' "$CANDIDATE_DESCRIPTOR")" == true ]] || [[ "$STATUS" == HOLD_I3_PHASEA_CUMULATIVE_DEV_MATERIALIZATION_REQUIRED && "$(jq -r '.i3PhaseADevReadbackTarget.existingImageTrafficActivation // false' "$CANDIDATE_DESCRIPTOR")" == true ]]; then
    if [[ "$(jq -r '.i3PhaseADevReadbackTarget.existingImageTrafficActivation // false' "$CANDIDATE_DESCRIPTOR")" == true ]]; then phasea_activation_guard; fi
    SOURCE_ARCHIVE="$RUNNER_TEMP/cxorbia-phasea-readback-source.tar"
    git archive --format=tar "$PHASEA_SOURCE" > "$SOURCE_ARCHIVE"
    sha256sum "$SOURCE_ARCHIVE" > "$OUT/cxorbia-phasea-source.tar.sha256"
    test "$(cut -d' ' -f1 "$OUT/cxorbia-phasea-source.tar.sha256")" = f3509fc74a7a5c46c1a8bf1e018ebae8e363b2897d1f06c85bbac34379316fa4
  else
    git archive --format=tar "$PHASEA_SOURCE" > "$OUT/cxorbia-phasea-source.tar"
    sha256sum "$OUT/cxorbia-phasea-source.tar" > "$OUT/cxorbia-phasea-source.tar.sha256"
    SOURCE_ARCHIVE="$OUT/cxorbia-phasea-source.tar"
  fi
  SOURCE_DIR="$RUNNER_TEMP/cxorbia-phasea-source";rm -rf "$SOURCE_DIR";mkdir -p "$SOURCE_DIR"
  tar -xf "$SOURCE_ARCHIVE" -C "$SOURCE_DIR"
  echo "PHASEA_SOURCE_DIR=$SOURCE_DIR" >> "$GITHUB_ENV"
  ;;
materialize)
  # BEGIN_EXISTING_IMAGE_TRAFFIC_ACTIVATION_MATERIALIZE
  if [[ "$(jq -r '.i3PhaseADevReadbackTarget.existingImageTrafficActivation // false' "$CANDIDATE_DESCRIPTOR")" == true ]]; then
    phasea_activate_existing_image
    exit 0
  fi
  # END_EXISTING_IMAGE_TRAFFIC_ACTIVATION_MATERIALIZE
  # One existing Phase A runner: one build, one runtime, one Hosting + Firestore rules publish. DEV only.
  test "$PROJECT" = "cxorbia-backend-dev"
  test "$SERVICE" = "cxorbia-live-hr-dev"
  test "$HOSTING_SITE" = "cxorbia-backend-dev"
  test "$FIREBASE_HOSTING_TARGET" = "cxorbia-dev"
  sha256sum -c "$OUT/cxorbia-phasea-source.tar.sha256"
  IMAGE_URI="gcr.io/$PROJECT/$SERVICE:i3-phasea-$(printf '%s' "$PHASEA_SOURCE"|cut -c1-12)-$GITHUB_RUN_ID"
  gcloud builds submit "$PHASEA_SOURCE_DIR" --project "$PROJECT" --config "$PHASEA_SOURCE_DIR/backend/runtime/hr-live-service/cloudbuild.yaml" --substitutions "_IMAGE=$IMAGE_URI" --quiet
  gcloud run services update "$SERVICE" --project "$PROJECT" --region "$REGION" --image "$IMAGE_URI" --min-instances=1 --max-instances=1 --update-env-vars "$LEGAL_ENABLE_NAME=$LEGAL_ENABLE_VALUE,$LEGAL_GATE_NAME=$LEGAL_GATE_VALUE,$I3_HR_CACHE_PIN_NAME=$I3_HR_CACHE_PIN_VALUE" --quiet
  gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$OUT/runtime.json"
  REVISION="$(jq -r '.status.latestReadyRevisionName // empty' "$OUT/runtime.json")"
  test -n "$REVISION"
  gcloud run revisions describe "$REVISION" --project "$PROJECT" --region "$REGION" --format=json > "$OUT/revision.json"
  RAW="$(jq -r '.status.imageDigest // empty' "$OUT/revision.json")"
  case "$RAW" in sha256:*) DIGEST="$RAW" ;; *@sha256:*) DIGEST="sha256:$(printf '%s' "$RAW"|sed 's/.*@sha256://')" ;; *) echo RUNTIME_DIGEST_UNAVAILABLE >&2; exit 1 ;; esac
  URL="$(jq -r '.status.url // empty' "$OUT/runtime.json")"
  test -n "$URL"
  curl -fsS --retry 8 "$URL/health" > "$OUT/health.json"
  jq -e '.ok==true and .production==false and .hrWrites==false' "$OUT/health.json" >/dev/null
  (cd "$PHASEA_SOURCE_DIR" && "$GITHUB_WORKSPACE/node_modules/.bin/firebase" deploy --config firebase.json --only "firestore:rules,hosting:$FIREBASE_HOSTING_TARGET" --project "$PROJECT" --non-interactive) | tee "$OUT/dev-deploy.log"
  TOKEN="$(gcloud auth print-access-token)"
  curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$OUT/hosting.json"
  curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebaserules.googleapis.com/v1/projects/$PROJECT/releases/cloud.firestore" > "$OUT/firestore-release.json"
  RULESET="$(jq -r '.rulesetName // empty' "$OUT/firestore-release.json")"
  test -n "$RULESET"
  curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebaserules.googleapis.com/v1/$RULESET" > "$OUT/firestore-ruleset.json"
  jq -e '.source.files|length>0' "$OUT/firestore-ruleset.json" >/dev/null
  echo "PHASEA_RUNTIME=$REVISION" >> "$GITHUB_ENV"
  echo "PHASEA_DIGEST=$DIGEST" >> "$GITHUB_ENV"
  echo "PHASEA_RULESET=$RULESET" >> "$GITHUB_ENV"
  echo "PHASEA_HOSTING_VERSION=$(jq -r '.release.version.name // empty' "$OUT/hosting.json")" >> "$GITHUB_ENV"
  echo "PHASEA_HOSTING_RELEASE=$(jq -r '.release.name // empty' "$OUT/hosting.json")" >> "$GITHUB_ENV"
  ;;


readback)
  # READ ONLY: certify exactly the already-published artifact; never rebuild or deploy.
  test "$PROJECT" = "cxorbia-backend-dev"
  test "$SERVICE" = "cxorbia-live-hr-dev"
  test "$(jq -r '.status' "$CANDIDATE_DESCRIPTOR")" = "HOLD_I3_PHASEA_CUMULATIVE_DEV_READBACK_ONLY_REQUIRED"
  TARGET="$OUT/materialization-target.json"
  jq '.i3PhaseADevReadbackTarget' "$CANDIDATE_DESCRIPTOR" > "$TARGET"
  test "$(jq -r '.sourceSha' "$TARGET")" = "$PHASEA_SOURCE"
  test "$(jq -r '.sourceTree' "$TARGET")" = "$PHASEA_TREE"
  test "$(jq -r '.project' "$TARGET")" = "$PROJECT"
  test "$(jq -r '.production' "$TARGET")" = "false"
  BUILD="$(jq -r '.cloudBuildId // empty' "$TARGET")"
  test -n "$BUILD"
  if [[ "$(jq -r '.diagnosticOnly // false' "$TARGET")" == true ]]; then
    # Read-only diagnostic: collect every observation before adjudicating identity.
    test "$(jq -r '.requireBuildImageRuntimeDigestBinding' "$TARGET")" = true
    test "$(jq -r '.sourceArtifactDigest' "$TARGET")" = sha256:f3509fc74a7a5c46c1a8bf1e018ebae8e363b2897d1f06c85bbac34379316fa4
    test "$(cut -d' ' -f1 "$OUT/cxorbia-phasea-source.tar.sha256")" = f3509fc74a7a5c46c1a8bf1e018ebae8e363b2897d1f06c85bbac34379316fa4
    DIAG_TMP="$RUNNER_TEMP/cxorbia-runtime-binding-readback"
    mkdir -p "$DIAG_TMP"
    READ_ERRORS='[]'
    if ! gcloud builds describe "$BUILD" --project "$PROJECT" --format=json > "$DIAG_TMP/build.json" 2> "$DIAG_TMP/build.stderr"; then
      READ_ERRORS='["BUILD_READ_FAILED"]'; echo '{}' > "$DIAG_TMP/build.json"
    fi
    if ! gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$DIAG_TMP/service.json" 2> "$DIAG_TMP/service.stderr"; then
      READ_ERRORS="$(jq -c '.+["SERVICE_READ_FAILED"]' <<< "$READ_ERRORS")"; echo '{}' > "$DIAG_TMP/service.json"
    fi
    # Never place environment values, secret substitutions or raw stderr in the artifact.
    jq '{id,projectId,status,createTime,startTime,finishTime,source,sourceProvenance,images,substitutions:(.substitutions // {} | with_entries(if .key=="_IMAGE" then . else .value="REDACTED" end)),steps:[.steps[]? | {name,id,dir,entrypoint,args:[.args[]? | if test("^(build|push|-t|-f|--tag|\\.|backend/|gcr\\.io/|\\$\\{?_IMAGE\\}?$)") then . else "REDACTED_OR_UNEXPECTED_ARGUMENT" end],envNames:[.env[]? | split("=")[0]],secretEnvNames:.secretEnv}],results:{images:.results.images,buildStepImages:.results.buildStepImages},options:{sourceProvenanceHash:.options.sourceProvenanceHash,requestedVerifyOption:.options.requestedVerifyOption,logging:.options.logging}}' "$DIAG_TMP/build.json" > "$OUT/build-existing.json"
    jq '{metadata:{name:.metadata.name,generation:.metadata.generation,resourceVersion:.metadata.resourceVersion},spec:{traffic:.spec.traffic,template:{metadata:{name:.spec.template.metadata.name,userImage:.spec.template.metadata.annotations["client.knative.dev/user-image"]},spec:{containers:[.spec.template.spec.containers[]? | {name,image,ports,envNames:[.env[]?.name]}]}}},status}' "$DIAG_TMP/service.json" > "$OUT/runtime.json"
    echo '[]' > "$OUT/runtime-revisions.json"
    mapfile -t DIAG_REVISIONS < <(jq -r '[.status.latestCreatedRevisionName,.status.latestReadyRevisionName] | map(select(type=="string" and test("^cxorbia-live-hr-dev-[a-z0-9-]+$"))) | unique[]' "$OUT/runtime.json")
    for DIAG_REV in "${DIAG_REVISIONS[@]}"; do
      if gcloud run revisions describe "$DIAG_REV" --project "$PROJECT" --region "$REGION" --format=json > "$DIAG_TMP/$DIAG_REV.json" 2> "$DIAG_TMP/$DIAG_REV.stderr"; then
        jq '{metadata:{name:.metadata.name,generation:.metadata.generation,resourceVersion:.metadata.resourceVersion},spec:{containers:[.spec.containers[]? | {name,image,ports,envNames:[.env[]?.name]}]},status}' "$DIAG_TMP/$DIAG_REV.json" > "$OUT/revision-$DIAG_REV.json"
        jq --slurpfile revision "$OUT/revision-$DIAG_REV.json" '.+$revision' "$OUT/runtime-revisions.json" > "$DIAG_TMP/revisions-next.json"
        cp "$DIAG_TMP/revisions-next.json" "$OUT/runtime-revisions.json"
      else
        READ_ERRORS="$(jq -c --arg rev "$DIAG_REV" '.+["REVISION_READ_FAILED:"+$rev]' <<< "$READ_ERRORS")"
      fi
    done
    jq -n --slurpfile b "$OUT/build-existing.json" --slurpfile s "$OUT/runtime.json" --slurpfile r "$OUT/runtime-revisions.json" --slurpfile t "$TARGET" --argjson readErrors "$READ_ERRORS" '
      def digest: (tostring | (try capture("(?:^|@)(?<d>sha256:[a-f0-9]{64})$").d catch "")) // "";
      $b[0] as $build | $s[0] as $service | $t[0] as $target | $r[0] as $revisions |
      [$build.results.images[]? | select(.name==$target.imageUri)] as $images |
      ($images[0].digest // "" | digest) as $buildDigest |
      ($service.status.latestCreatedRevisionName // "") as $created |
      ($service.status.latestReadyRevisionName // "") as $ready |
      ([$revisions[] | select(.metadata.name==$ready)][0] // {}) as $readyObject |
      ($readyObject.status.imageDigest // "" | digest) as $readyDigest |
      ($service.spec.template.spec.containers[0].image // "") as $templateImage |
      ([ $service.status.traffic[]? | select(.revisionName==$ready) | (.percent // 0)] | add // 0) as $readyTraffic |
      ([ $service.status.traffic[]? | (.percent // 0)] | add // 0) as $totalTraffic |
      {decision:"HOLD_READONLY_RUNTIME_BINDING_DIAGNOSTIC",diagnosticOnly:true,sourceSha:$target.sourceSha,sourceTree:$target.sourceTree,sourceArtifactDigest:$target.sourceArtifactDigest,localCanonicalSourceTarVerified:true,runtimeSourceSha:null,sourceIdentityVerified:false,remoteBuildSourceContentVerified:false,cloudBuildId:$build.id,buildStatus:$build.status,expectedImageUri:$target.imageUri,buildDeclaredImages:$build.images,buildImageResults:$images,buildImageDigest:$buildDigest,serviceTemplateImage:$templateImage,latestCreatedRevision:$created,latestReadyRevision:$ready,readyRevisionDigest:$readyDigest,buildRuntimeDigestBound:($build.status=="SUCCESS" and ($images|length)==1 and $buildDigest!="" and $buildDigest==$readyDigest),readyRevisionTrafficPercent:$readyTraffic,totalTrafficPercent:$totalTraffic,specTraffic:$service.spec.traffic,observedTraffic:$service.status.traffic,serviceConditions:$service.status.conditions,serviceGeneration:$service.metadata.generation,serviceObservedGeneration:$service.status.observedGeneration,cloudBuildSource:$build.source,cloudBuildSourceProvenance:$build.sourceProvenance,
       reasonCodes:($readErrors + [if $build.status!="SUCCESS" then "BUILD_NOT_SUCCESS" else empty end,if ($build.images // [] | index($target.imageUri))==null then "BUILD_DECLARED_IMAGE_MISMATCH" else empty end,if ($images|length)!=1 or $buildDigest=="" then "BUILD_RESULT_DIGEST_UNPROVEN" else empty end,if $templateImage!=$target.imageUri and $templateImage!=(($target.imageUri|split(":")[0])+"@"+$buildDigest) then "SERVICE_TEMPLATE_IMAGE_MISMATCH" else empty end,if $created=="" or $created!=$ready then "LATEST_CREATED_NOT_READY_OR_ROLLOUT_INCOMPLETE" else empty end,if $buildDigest=="" or $readyDigest!=$buildDigest then "BUILD_RUNTIME_DIGEST_MISMATCH" else empty end,if $readyTraffic!=100 or $totalTraffic!=100 then "TRAFFIC_NOT_100_PERCENT_READY_REVISION" else empty end,"REMOTE_BUILD_SOURCE_CONTENT_NOT_VERIFIED"]),builds:0,deploys:0,providerWrites:0,production:false}' > "$OUT/runtime-binding-diagnostic.json"
    cp "$OUT/runtime-binding-diagnostic.json" "$OUT/result.json"
    cat "$OUT/runtime-binding-diagnostic.json"
    # A diagnostic never reaches the old materialization PASS writer in proof).
    exit 1
  fi
  gcloud builds describe "$BUILD" --project "$PROJECT" --format=json > "$OUT/build-existing.json"
  test "$(jq -r '.status' "$OUT/build-existing.json")" = "SUCCESS"
  IMAGE_URI="$(jq -r '.imageUri' "$TARGET")"
  jq -e --arg u "$IMAGE_URI" '(.images // []) | index($u) != null' "$OUT/build-existing.json" >/dev/null
  EXPECTED_REV="$(jq -r '.runtimeRevision' "$TARGET")"
  EXPECTED_DIGEST="$(jq -r '.runtimeDigest' "$TARGET")"
  gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$OUT/runtime.json"
  test "$(jq -r '.status.latestReadyRevisionName' "$OUT/runtime.json")" = "$EXPECTED_REV"
  gcloud run revisions describe "$EXPECTED_REV" --project "$PROJECT" --region "$REGION" --format=json > "$OUT/revision.json"
  RAW="$(jq -r '.status.imageDigest // empty' "$OUT/revision.json")"
  case "$RAW" in sha256:*) DIGEST="$RAW";; *@sha256:*) DIGEST="sha256:$(printf '%s' "$RAW"|sed 's/.*@sha256://')";; *) exit 1;; esac
  test "$DIGEST" = "$EXPECTED_DIGEST"
  TOKEN="$(gcloud auth print-access-token)"
  curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebasehosting.googleapis.com/v1beta1/sites/$HOSTING_SITE/channels/live" > "$OUT/hosting.json"
  test "$(jq -r '.release.version.name' "$OUT/hosting.json")" = "$(jq -r '.hostingVersion' "$TARGET")"
  test "$(jq -r '.release.name' "$OUT/hosting.json")" = "$(jq -r '.hostingRelease' "$TARGET")"
  curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebaserules.googleapis.com/v1/projects/$PROJECT/releases/cloud.firestore" > "$OUT/firestore-release.json"
  RULESET="$(jq -r '.rulesetName // empty' "$OUT/firestore-release.json")"
  test "$RULESET" = "$(jq -r '.firestoreRuleset' "$TARGET")"
  curl -fsS -H "Authorization: Bearer $TOKEN" "https://firebaserules.googleapis.com/v1/$RULESET" > "$OUT/firestore-ruleset.json"
  echo "PHASEA_RUNTIME=$EXPECTED_REV" >> "$GITHUB_ENV"
  echo "PHASEA_DIGEST=$DIGEST" >> "$GITHUB_ENV"
  echo "PHASEA_RULESET=$RULESET" >> "$GITHUB_ENV"
  echo "PHASEA_HOSTING_VERSION=$(jq -r '.hostingVersion' "$TARGET")" >> "$GITHUB_ENV"
  echo "PHASEA_HOSTING_RELEASE=$(jq -r '.hostingRelease' "$TARGET")" >> "$GITHUB_ENV"
  ;;

proof)
  # BEGIN_EXISTING_IMAGE_TRAFFIC_ACTIVATION_PROOF
  if [[ "$(jq -r '.i3PhaseADevReadbackTarget.existingImageTrafficActivation // false' "$CANDIDATE_DESCRIPTOR")" == true ]]; then
    phasea_prove_existing_image_activation
    exit 0
  fi
  # END_EXISTING_IMAGE_TRAFFIC_ACTIVATION_PROOF
  sha256sum -c "$OUT/cxorbia-phasea-source.tar.sha256"
  gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format=json > "$OUT/runtime-final.json"
  test "$(jq -r '.status.latestReadyRevisionName // empty' "$OUT/runtime-final.json")" = "$PHASEA_RUNTIME"
  jq -j '[.source.files[] | select(.name=="firestore.rules") | .content][0] // empty' "$OUT/firestore-ruleset.json" > "$OUT/firestore-remote.rules"
  cmp "$OUT/firestore-remote.rules" "$PHASEA_SOURCE_DIR/firestore.rules"
  for p in "${ASSETS[@]}";do remote="$OUT/remote-$(echo "$p"|tr '/' '_')";curl -fsSL --retry 8 -H 'Cache-Control: no-cache, no-store, max-age=0' "$ROOT/$p?proof=$GITHUB_RUN_ID-$(date +%s%N)" -o "$remote";test "$(sha256sum "$remote"|awk '{print $1}')" = "$(git show "$PHASEA_SOURCE:app/$p"|sha256sum|awk '{print $1}')";done
  curl -fsS --retry 8 -H 'Cache-Control: no-cache, no-store, max-age=0' "$ROOT/api/$TENANT_ID/$PROJECT_ID/hr-live?format=meta&i3=$GITHUB_RUN_ID" > "$OUT/hr-meta.json";HR="$(jq -r '.revision // empty' "$OUT/hr-meta.json")";[[ "$HR" =~ ^[0-9a-f]{64}$ ]];jq -e '.ok==true and .revisionStable==true and .sourceSafe==true and .hrWrites==false and .production==false' "$OUT/hr-meta.json" >/dev/null
  jq -n -S --arg source "$PHASEA_SOURCE" --arg tree "$PHASEA_TREE" --arg runtime "$PHASEA_RUNTIME" --arg digest "$PHASEA_DIGEST" --arg hosting "$PHASEA_HOSTING_VERSION" --arg release "$PHASEA_HOSTING_RELEASE" --arg hr "$HR" --arg rules "$PHASEA_RULESET" --arg artifact "sha256:$(cut -d' ' -f1 "$OUT/cxorbia-phasea-source.tar.sha256")" '{decision:"PASS_I3_PHASEA_CUMULATIVE_DEV_MATERIALIZATION",sourceSha:$source,sourceTree:$tree,artifactDigest:$artifact,sourceArtifact:"cxorbia-phasea-source.tar",runtimeRevision:$runtime,runtimeDigest:$digest,hostingVersion:$hosting,hostingRelease:$release,firestoreRuleset:$rules,hrRevision:$hr,builds:1,runtimeDeploys:1,hostingDeploys:1,firestoreRulesDeploys:1,hrWrites:0,production:false}' > "$OUT/result.json";cat "$OUT/result.json"
  ;;
*) exit 2;;
esac
