#!/usr/bin/env bash
set -Eeuo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
test_dir="$(mktemp -d)"
trap 'rm -rf "$test_dir"' EXIT
export HOSTING_URL=https://fixture.invalid TENANT_ID=fixture PROJECT_ID=fixture
export GITHUB_RUN_ID=immutable-run
export REV="$(printf '%064d' 1)"
curl() {
  local out url
  while (($#)); do
    case "$1" in
      -o) out="$2"; shift 2 ;;
      --retry) [[ "$2" == 0 ]] || return 99; shift 2 ;;
      -H|-w|--connect-timeout|--max-time) shift 2 ;;
      -sS) shift ;;
      *) url="$1"; shift ;;
    esac
  done
  echo "$url" >> "$FOCAL_OUT/calls"
  case "$MODE" in
    mapping) echo '{"message":"MAPPING_FAILURE:fake-private-detail"}' > "$out"; printf 503; return ;;
    mapping200) echo '{"ok":false,"error":{"code":"MAPPING_FAILURE:fake-private-detail"}}' > "$out"; printf 200; return ;;
    auth200) echo '{"ok":false,"code":"AUTH_FAILURE:fake-private-detail"}' > "$out"; printf 200; return ;;
    auth403) echo '{"error":"MAPPING_FAILURE:fake-private-detail"}' > "$out"; printf 403; return ;;
    denied) : > "$out"; printf 403; return ;;
    limited) echo '{}' > "$out"; printf 429; return ;;
    timeout) printf 000; return 28 ;;
    empty) : > "$out"; printf 200; return ;;
    truncated) echo '{' > "$out"; printf 200; return ;;
  esac
  if [[ "$url" == *format=meta* ]]; then
    printf '{"ok":true,"revision":"%s","revisionStable":true,"sourceSafe":true,"hrWrites":false,"production":false}' "$REV" > "$out"
  elif [[ "$MODE" == invalid-visits ]]; then
    echo '{}' > "$out"
  else
    echo '{"sourceSafe":true,"production":false,"projectConfig":{"scenarioDimensions":[1,2]},"visits":[{"escenario":"qa","tipoCombo":"qa"}]}' > "$out"
  fi
  printf 200
}
export -f curl
probe() {
  local expected="$2" count="$3" transient="$4" rc=0
  export MODE="$1" FOCAL_OUT="$test_dir/$1"
  mkdir "$FOCAL_OUT"
  export GITHUB_ENV="$FOCAL_OUT/env"
  bash "$root/tools/qa/cxorbia-i3-paired-dev-seal.sh" strict-hr || rc=$?
  [[ $(wc -l < "$FOCAL_OUT/calls") == "$count" ]]
  if [[ "$expected" == PASS ]]; then
    [[ "$rc" == 0 && "$(cat "$GITHUB_ENV")" == "HR_REVISION=$REV" ]]
  else
    [[ "$rc" != 0 && ! -e "$GITHUB_ENV" ]]
    jq -e --arg c "$expected" --argjson t "$transient" '.classification==$c and .transient==$t and .automaticRetries==0 and .runId=="immutable-run"' "$FOCAL_OUT/strict-hr-failure.json" >/dev/null
    jq -e '.quarantineSameAttempt==(.classification=="MAPPING_FAILURE" or .classification=="AUTH_FAILURE")' "$FOCAL_OUT/strict-hr-failure.json" >/dev/null
    if [[ "$MODE" == mapping200 || "$MODE" == auth200 ]]; then
      jq -e '.bodySha256|test("^[a-f0-9]{64}$")' "$FOCAL_OUT/strict-hr-failure.json" >/dev/null
    fi
    if grep -Rq fake-private-detail "$FOCAL_OUT"; then exit 1; fi
  fi
  echo "PASS $MODE"
}
probe ok PASS 2 false
probe mapping MAPPING_FAILURE 1 false
probe denied AUTH_FAILURE 1 false
probe limited PROVIDER_FAILURE 1 true
probe timeout PROVIDER_FAILURE 1 true
probe empty FUNCTIONAL_DEFECT 1 false
probe truncated FUNCTIONAL_DEFECT 1 false
probe invalid-visits FUNCTIONAL_DEFECT 2 false
probe mapping200 MAPPING_FAILURE 1 false
probe auth200 AUTH_FAILURE 1 false
probe auth403 AUTH_FAILURE 1 false
