#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

REQUEST_PATH="${1:-backend/config/phase-a-v105-v106-empalme-request.source-safe.json}"
CHECKSUM_PATH="tools/empalme/v105-v106-runtime-checksums.sha256"
PART_DIR="tools/empalme/v105-v106-delta"
REPORT_DIR=".tmp/v105-v106-runtime-empalme"
BASE_COMMIT="40ed11aa4f6de5524f60b0ea1d0060f20a4172f4"
TARGET_BRANCH="docs-tya-v6-v71-audit"
EXPECTED_PACKAGE_SHA="582a8c98cdac7b46028bb720d1304657c6d678e99e4bc23a49e80ab440bc8206"
EXPECTED_RAW_B64_SHA="30c486f481ee981ae8141cd506157371a0be82bc0e4a883a55568b3fe37645ec"
EXPECTED_B64_SHA="d52ffc307a269d5630c81e4fd0e89d05cd4b672d261f104cb767998e46fa2c85"
EXPECTED_ARCHIVE_SHA="eaab10c0cef8670d79fb6a6fb68b014acf0707545419172cf73ff1cdb2e7ccb7"
EXPECTED_CHECKSUM_FILE_SHA="d198b0a1cf5d8e5de8fc87bbb961b40e08cd4b97314764ec9e87fcac4befc49b"
REQUIRED_CONFIRMATION="EMPALME_V105_INTERNAL_V106_EXACTO"

mkdir -p "$REPORT_DIR"
REPORT_PATH="$REPORT_DIR/report.json"
PATHS_PATH="$REPORT_DIR/runtime-paths.txt"
RAW_B64_PATH="$REPORT_DIR/runtime-delta.raw.b64"
B64_PATH="$REPORT_DIR/runtime-delta.b64"
ARCHIVE_PATH="$REPORT_DIR/runtime-delta.tar.gz"
ARCHIVE_LIST="$REPORT_DIR/archive-paths.txt"
EXPECTED_ARCHIVE_LIST="$REPORT_DIR/expected-archive-paths.txt"

fail() {
  local code="$1"
  local message="$2"
  node - "$REPORT_PATH" "$code" "$message" <<'NODE'
const fs = require('fs');
const [out, code, message] = process.argv.slice(2);
fs.writeFileSync(out, JSON.stringify({
  schemaVersion: '1.0.0',
  gate: 'cxorbia-v105-internal-v106-runtime-empalme',
  generatedAt: new Date().toISOString(),
  decision: 'BLOCKED',
  blocker: code,
  message,
  safeState: { writesToProviders:false, deploy:false, production:false, firebaseWrites:false, hrWrites:false, payments:false }
}, null, 2) + '\n', 'utf8');
NODE
  echo "BLOCKED [$code] $message" >&2
  exit 2
}

[[ "${CXORBIA_CONFIRM:-}" == "$REQUIRED_CONFIRMATION" ]] || fail "confirmation_missing" "CXORBIA_CONFIRM must equal $REQUIRED_CONFIRMATION"
[[ -f "$REQUEST_PATH" ]] || fail "request_missing" "$REQUEST_PATH"
[[ -f "$CHECKSUM_PATH" ]] || fail "checksum_missing" "$CHECKSUM_PATH"

git cat-file -e "$BASE_COMMIT^{commit}" 2>/dev/null || fail "base_commit_missing" "$BASE_COMMIT"
CURRENT_BRANCH="${GITHUB_REF_NAME:-$(git branch --show-current)}"
[[ "$CURRENT_BRANCH" == "$TARGET_BRANCH" ]] || fail "branch_mismatch" "expected $TARGET_BRANCH, got ${CURRENT_BRANCH:-detached}"

node - "$REQUEST_PATH" "$EXPECTED_PACKAGE_SHA" "$BASE_COMMIT" "$TARGET_BRANCH" <<'NODE'
const fs = require('fs');
const [file, expectedPackageSha, expectedBaseCommit, expectedBranch] = process.argv.slice(2);
const request = JSON.parse(fs.readFileSync(file, 'utf8'));
const checks = {
  schemaVersion: request.schemaVersion === '1.0.0',
  requestId: request.requestId === 'cxorbia-v105-internal-v106-runtime-empalme',
  packageName: request.packageName === 'Prototype development request CXOrbia V105(1).zip',
  packageSha256: request.packageSha256 === expectedPackageSha,
  internalIdentity: request.internalIdentity === 'V106',
  baseRuntimeCommit: request.baseRuntimeCommit === expectedBaseCommit,
  targetBranch: request.targetBranch === expectedBranch,
  authorized: request.authorized === true,
  authorizedBy: request.authorizedBy === 'Paula',
  providerWritesBlocked: request.safeState?.providerWrites === false,
  firebaseWritesBlocked: request.safeState?.firebaseWrites === false,
  hrWritesBlocked: request.safeState?.hrWrites === false,
  deployBlocked: request.safeState?.deploy === false,
  productionBlocked: request.safeState?.production === false,
  paymentsBlocked: request.safeState?.paymentsExecuted === false
};
const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
if (failed.length) {
  console.error(`request_invalid:${failed.join(',')}`);
  process.exit(2);
}
NODE

printf '%s  %s\n' "$EXPECTED_CHECKSUM_FILE_SHA" "$CHECKSUM_PATH" | sha256sum -c - >/dev/null || fail "checksum_file_hash_mismatch" "$CHECKSUM_PATH"

parts=(
  "$PART_DIR/part-00.txt"
  "$PART_DIR/part-01.txt"
  "$PART_DIR/part-02.txt"
  "$PART_DIR/part-03.txt"
  "$PART_DIR/part-04-05.txt"
  "$PART_DIR/part-06-07.txt"
  "$PART_DIR/part-08-09.txt"
  "$PART_DIR/part-10-11.txt"
  "$PART_DIR/part-12-13.txt"
)
for part in "${parts[@]}"; do
  [[ -f "$part" ]] || fail "delta_part_missing" "$part"
done

# El conector de archivos de texto alteró tres caracteres al transportar el blob.
# Se normaliza y repara únicamente esos offsets conocidos; ambos estados quedan
# fijados por SHA-256 antes de decodificar el archivo exacto del paquete.
cat "${parts[@]}" | tr -d '\r\n\t ' > "$RAW_B64_PATH"
printf '%s  %s\n' "$EXPECTED_RAW_B64_SHA" "$RAW_B64_PATH" | sha256sum -c - >/dev/null || fail "delta_raw_base64_hash_mismatch" "$RAW_B64_PATH"
python3 - "$RAW_B64_PATH" "$B64_PATH" <<'PY'
from pathlib import Path
import sys
source = Path(sys.argv[1]).read_bytes()
if len(source) != 132090:
    raise SystemExit(f'unexpected_raw_base64_length:{len(source)}')
repaired = bytearray(source)
if repaired[85527:85528] != b't':
    raise SystemExit('unexpected_connector_offset_85527')
repaired[85527:85527] = b'k'
if repaired[101860:101861] != b'E':
    raise SystemExit('unexpected_connector_offset_101860')
repaired[101860:101861] = b'A'
if repaired[114227:114228] != b'e':
    raise SystemExit('unexpected_connector_offset_114227')
repaired[114227:114227] = b'/'
Path(sys.argv[2]).write_bytes(repaired)
print(f'connector_repair_ok:{len(repaired)}')
PY
printf '%s  %s\n' "$EXPECTED_B64_SHA" "$B64_PATH" | sha256sum -c - >/dev/null || fail "delta_base64_hash_mismatch" "$B64_PATH"
base64 --decode "$B64_PATH" > "$ARCHIVE_PATH"
printf '%s  %s\n' "$EXPECTED_ARCHIVE_SHA" "$ARCHIVE_PATH" | sha256sum -c - >/dev/null || fail "delta_archive_hash_mismatch" "$ARCHIVE_PATH"

cat > "$EXPECTED_ARCHIVE_LIST" <<'EOF'
app/core/build-lock.js
app/core/data-source.js
app/core/notif.js
app/core/permissions.js
app/modules/beneficios.js
app/modules/cert.js
app/modules/cliente-extra.js
app/modules/cliente.js
app/modules/configuracion.js
app/modules/dashboard.js
app/modules/finanzas.js
app/modules/historico.js
app/modules/misvisitas.js
app/modules/reservas.js
app/modules/visita-detalle.js
app/modules/visitas.js
app/styles/layout.css
app/sw.js
EOF

tar -tzf "$ARCHIVE_PATH" | LC_ALL=C sort > "$ARCHIVE_LIST"
LC_ALL=C sort "$EXPECTED_ARCHIVE_LIST" -o "$EXPECTED_ARCHIVE_LIST"
cmp -s "$EXPECTED_ARCHIVE_LIST" "$ARCHIVE_LIST" || fail "delta_archive_paths_mismatch" "expected exact 18-file delta"
if grep -Eq '(^/|(^|/)\.\.(/|$))' "$ARCHIVE_LIST"; then
  fail "unsafe_archive_path" "absolute or traversal path detected"
fi

awk '{print $2}' "$CHECKSUM_PATH" > "$PATHS_PATH"
[[ "$(wc -l < "$PATHS_PATH" | tr -d ' ')" == "70" ]] || fail "runtime_path_count_mismatch" "expected 70 runtime files"

while IFS= read -r runtime_path; do
  mkdir -p "$(dirname "$runtime_path")"
  if git cat-file -e "$BASE_COMMIT:$runtime_path" 2>/dev/null; then
    git show "$BASE_COMMIT:$runtime_path" > "$runtime_path"
  else
    rm -f "$runtime_path"
  fi
done < "$PATHS_PATH"

tar -xzf "$ARCHIVE_PATH" -C "$REPO_ROOT"
sha256sum -c "$CHECKSUM_PATH" > "$REPORT_DIR/checksums.log" || fail "runtime_checksum_mismatch" "one or more V105/V106 runtime files differ"

python3 - "$PATHS_PATH" <<'PY'
from pathlib import Path
import sys
paths = [Path(line.strip()) for line in Path(sys.argv[1]).read_text(encoding='utf-8').splitlines() if line.strip()]
mojibake = ('Ã', 'Â', 'â€', 'ï»¿', '\ufffd')
for path in paths:
    raw = path.read_bytes()
    if raw.startswith(b'\xef\xbb\xbf'):
        raise SystemExit(f'utf8_bom:{path}')
    text = raw.decode('utf-8')
    for token in mojibake:
        if token in text:
            raise SystemExit(f'mojibake:{token}:{path}')
print(f'utf8_ok:{len(paths)}')
PY

while IFS= read -r runtime_path; do
  if [[ "$runtime_path" == *.js ]]; then
    node --check "$runtime_path" >/dev/null
  fi
done < "$PATHS_PATH"

node <<'NODE'
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync('app/index.html', 'utf8');
const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]);
const local = scripts.filter(src => !/^https?:\/\//i.test(src));
const missing = local.filter(src => !fs.existsSync(path.join('app', src)));
const duplicates = local.filter((src, index) => local.indexOf(src) !== index);
if (scripts.length !== 66 || local.length !== 64 || new Set(local).size !== 64 || missing.length || duplicates.length) {
  throw new Error(`script_graph_invalid total=${scripts.length} local=${local.length} unique=${new Set(local).size} missing=${missing.join(',')} duplicates=${duplicates.join(',')}`);
}
const moduleFiles = fs.readdirSync('app/modules').filter(file => file.endsWith('.js')).sort();
const registrations = [];
for (const file of moduleFiles) {
  const source = fs.readFileSync(path.join('app/modules', file), 'utf8');
  for (const match of source.matchAll(/CX\.module\(\s*['"]([^'"]+)/g)) registrations.push(match[1]);
}
if (moduleFiles.length !== 40 || registrations.length !== 48 || new Set(registrations).size !== 48) {
  throw new Error(`module_graph_invalid files=${moduleFiles.length} registrations=${registrations.length} unique=${new Set(registrations).size}`);
}
console.log(JSON.stringify({ scriptsTotal:scripts.length, scriptsLocal:local.length, moduleFiles:moduleFiles.length, registrations:registrations.length }, null, 2));
NODE

node - "$REPORT_PATH" "$REQUEST_PATH" "$BASE_COMMIT" "$EXPECTED_PACKAGE_SHA" "$EXPECTED_ARCHIVE_SHA" "$EXPECTED_CHECKSUM_FILE_SHA" <<'NODE'
const fs = require('fs');
const [out, requestPath, baseCommit, packageSha256, deltaSha256, checksumFileSha256] = process.argv.slice(2);
const request = JSON.parse(fs.readFileSync(requestPath, 'utf8'));
fs.writeFileSync(out, JSON.stringify({
  schemaVersion: '1.0.0',
  gate: 'cxorbia-v105-internal-v106-runtime-empalme',
  generatedAt: new Date().toISOString(),
  decision: 'READY_TO_COMMIT_EXACT_RUNTIME',
  requestId: request.requestId,
  package: {
    fileName: request.packageName,
    externalLabel: 'V105',
    internalIdentity: 'V106',
    sha256: packageSha256
  },
  baseRuntimeCommit: baseCommit,
  targetBranch: request.targetBranch,
  validation: {
    exactRuntimeFiles: 70,
    deltaFiles: 18,
    localScripts: 64,
    moduleFiles: 40,
    uniqueModuleRegistrations: 48,
    nodeSyntax: 'PASS',
    utf8NoBomNoMojibake: 'PASS',
    deltaSha256,
    checksumFileSha256,
    connectorTransportRepair: 'THREE_FIXED_OFFSETS_HASH_VERIFIED'
  },
  knownHonestyLimits: {
    packageInternalManifest: 'INVALID_STALE_TWO_DIFFERENCES',
    packageProvidedVisualSmoke: 'PARTIAL_NOT_FULL_ROUTE_OR_MOBILE_COVERAGE',
    sourceSafeTyAVisualSmoke: 'PENDING_SEPARATE_ARTIFACT'
  },
  safeState: {
    providerWrites:false,
    firebaseWrites:false,
    hrWrites:false,
    paymentsExecuted:false,
    deploy:false,
    production:false,
    merge:false
  }
}, null, 2) + '\n', 'utf8');
NODE

cat "$REPORT_PATH"
