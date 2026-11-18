#!/usr/bin/env bash
set -Eeuo pipefail
mkdir -p "$FINAL_FOCAL_OUT"
if [[ "${CXORBIA_I3_FINANCE_MODE:-}" == READONLY_SEP_ADVANCES ]]; then
  # Exact read-only ADC dependency; no browser download or root legacy package resolution.
  test ! -e node_modules
  FINANCE_DEPS="$(mktemp -d "$RUNNER_TEMP/cx-finance-readonly.XXXXXX")"
  npm install --prefix "$FINANCE_DEPS" --no-save --ignore-scripts --no-package-lock firebase-admin@13.4.0 2>&1 | tee "$FINAL_FOCAL_OUT/npm-readonly.log"
  ln -s "$FINANCE_DEPS/node_modules" node_modules
  node --input-type=module -e 'await import("firebase-admin/app");await import("firebase-admin/firestore");console.log("PASS_FINANCE_READONLY_DEPENDENCIES_NO_BROWSER")'
else
  npm install --no-save --ignore-scripts --package-lock=false firebase-admin@13.4.0 playwright@1.56.1 2>&1 | tee "$FINAL_FOCAL_OUT/npm-legacy.log"
  npx --no-install playwright install chromium 2>&1 | tee "$FINAL_FOCAL_OUT/chromium-legacy.log"
fi
