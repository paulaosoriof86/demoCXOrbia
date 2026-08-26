#!/usr/bin/env bash
set -euo pipefail

V96_SHA="587732874f86f8c7a22f919617cbe271f8be68bd"
TARGET_BRANCH="docs-tya-v6-v71-audit"
EXPECTED_B64_SHA="3377778ce06c2d31f61bfb21801f9da6559f0d5fd51d3fc9734e83cbc341d724"
EXPECTED_TGZ_SHA="6cf68d769d8baa3d1394df7434a8c91b9ca0114a64223f258834680734ec9042"
OUT=".tmp/post-v96-empalme"

runtime_files=(
  "app/app.js"
  "app/core/automations.js"
  "app/core/config.js"
  "app/core/data.js"
  "app/core/liquidacion.js"
  "app/core/manuales-data.js"
  "app/core/router.js"
  "app/core/store.js"
  "app/core/topbar.js"
  "app/index.html"
  "app/modules/academia.js"
  "app/modules/administrabilidad.js"
  "app/modules/automatizaciones.js"
  "app/modules/cliente.js"
  "app/modules/configuracion.js"
  "app/modules/correo.js"
  "app/modules/crm.js"
  "app/modules/dashboard.js"
  "app/modules/diagnostico.js"
  "app/modules/documentos.js"
  "app/modules/finanzas.js"
  "app/modules/hr-source.js"
  "app/modules/importador.js"
  "app/modules/misvisitas.js"
  "app/modules/novedades.js"
  "app/modules/postulaciones.js"
  "app/modules/proyecto-wizard.js"
  "app/modules/proyectos.js"
  "app/modules/reservas.js"
  "app/modules/revision-admin.js"
  "app/modules/saas-console.js"
  "app/modules/shoppers.js"
  "app/modules/soporte.js"
  "app/modules/visitas.js"
  "app/styles/layout.css"
  "app/styles/theme.css"
  "app/sw.js"
)

preserved_extras=(
  "app/core/backend-active-project.js"
  "app/core/backend-adapter.compat.v78.disabled.js"
  "app/core/backend-adapter.v78.disabled.js"
  "app/core/backend-ai.js"
  "app/core/backend-automations.js"
  "app/core/backend-bulletins.js"
  "app/core/backend-config-preview-dev.js"
  "app/core/backend-config.js"
  "app/core/backend-connection-point.v78.disabled.js"
  "app/core/backend-cxdata-finance-read.js"
  "app/core/backend-cxdata-read-guard.js"
  "app/core/backend-data-contract.js"
  "app/core/backend-finance-benefits.js"
  "app/core/backend-firebase.js"
  "app/core/backend-hr-source-bridge.js"
  "app/core/backend-operational-actions.js"
  "app/core/backend-preview-status.js"
  "app/core/backend-resources.js"
  "app/core/backend-ui-action-bridge.js"
  "app/core/backend-v57-extra-config.js"
  "app/core/cx-data-bridge.v78.disabled.js"
  "app/core/production-copy-guard.js"
  "app/core/tya-phase-a-source-safe-preview.js"
  "app/core/v91-modules.js"
  "app/modules/academia-admin-actions.js"
  "app/modules/academia-create-ai-stable.js"
  "app/modules/rutas.js"
)

mkdir -p "$OUT"
printf '%s\n' "empalme=started" "v96_sha=$V96_SHA" "target_branch=$TARGET_BRANCH" > "$OUT/status.txt"

current_branch="$(git branch --show-current)"
if [[ "$current_branch" != "$TARGET_BRANCH" ]]; then
  echo "Unexpected branch: $current_branch" >&2
  exit 1
fi

git cat-file -e "${V96_SHA}^{commit}"

for file in "${runtime_files[@]}"; do
  mkdir -p "$(dirname "$file")"
  git show "${V96_SHA}:${file}" > "$file"
done

cat tools/empalme/post-v96-delta10/chunk-*.txt > "$OUT/delta10.b64"
echo "$EXPECTED_B64_SHA  $OUT/delta10.b64" | sha256sum -c -
base64 --decode "$OUT/delta10.b64" > "$OUT/delta10.tar.gz"
echo "$EXPECTED_TGZ_SHA  $OUT/delta10.tar.gz" | sha256sum -c -
tar -xzf "$OUT/delta10.tar.gz" -C .

for file in "${preserved_extras[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Preserved backend/patch file missing: $file" >&2
    exit 1
  fi
done

node tools/release/tya-source-lock-post-v96-runtime-verify.mjs \
  --out "$OUT/source-lock"

find app -type f -name '*.js' -print0 | xargs -0 -n1 node --check

node <<'NODE'
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('app/index.html', 'utf8');
if (!/<meta\s+charset=["']?UTF-8["']?\s*\/?>/i.test(html)) {
  throw new Error('app/index.html is missing meta charset UTF-8');
}

const srcs = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)].map(match => match[1]);
const local = srcs.filter(src => !/^(?:https?:)?\/\//i.test(src) && !/^data:/i.test(src));
const normalized = local.map(src => src.split(/[?#]/, 1)[0].replace(/^\.\//, '').replace(/^\//, ''));
const missing = normalized.filter(src => !fs.existsSync(path.join('app', src)));
if (missing.length) throw new Error(`Missing local scripts: ${missing.join(', ')}`);
const duplicates = normalized.filter((src, index) => normalized.indexOf(src) !== index);
if (duplicates.length) throw new Error(`Duplicate local scripts: ${[...new Set(duplicates)].join(', ')}`);

const manifest = JSON.parse(fs.readFileSync('app/manifest.webmanifest', 'utf8'));
if (!manifest.name || !manifest.start_url || !manifest.display) {
  throw new Error('manifest.webmanifest lacks required app identity fields');
}

const sw = fs.readFileSync('app/sw.js', 'utf8');
if (!sw.includes('self.addEventListener')) throw new Error('service worker lacks event registration');

const deployWorkflow = fs.readFileSync('.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml', 'utf8');
if (!/^\s{2}workflow_dispatch:/m.test(deployWorkflow)) {
  throw new Error('DEV deploy workflow is not manual workflow_dispatch');
}
if (/^\s{2}(?:push|pull_request):/m.test(deployWorkflow)) {
  throw new Error('DEV deploy workflow has an automatic trigger');
}

const report = {
  localScripts: normalized.length,
  missingScripts: missing.length,
  duplicateScripts: [...new Set(duplicates)].length,
  manifest: 'valid',
  serviceWorker: 'present',
  charset: 'UTF-8',
  deployWorkflow: 'manual-only'
};
fs.writeFileSync('.tmp/post-v96-empalme/static-validation.json', JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(report, null, 2));
NODE

git diff --check
printf '%s\n' "${runtime_files[@]}" | sort > "$OUT/expected-runtime-files.txt"
git diff --name-only -- app | sort > "$OUT/actual-runtime-files.txt"
diff -u "$OUT/expected-runtime-files.txt" "$OUT/actual-runtime-files.txt"
git status --short > "$OUT/git-status-before-commit.txt"

if git diff --quiet -- "${runtime_files[@]}"; then
  printf '%s\n' "empalme=already_applied" >> "$OUT/status.txt"
  echo "Runtime already matches the post-V96 source lock; no commit needed."
  exit 0
fi

git config user.name "CXOrbia Empalme Bot"
git config user.email "actions@users.noreply.github.com"
git add -- "${runtime_files[@]}"
git diff --cached --check
git commit -m "feat(cxorbia): empalma runtime source lock post-V96"
new_sha="$(git rev-parse HEAD)"
printf '%s\n' "empalme=committed" "runtime_sha=$new_sha" >> "$OUT/status.txt"
git push origin "HEAD:${TARGET_BRANCH}"
echo "Empalme runtime post-V96 committed and pushed: $new_sha"
