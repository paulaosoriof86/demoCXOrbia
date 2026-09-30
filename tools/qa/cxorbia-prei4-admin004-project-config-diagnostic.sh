#!/usr/bin/env bash
set -Eeuo pipefail
OUT="${PREI4_004_DIAG_OUT:-.tmp/prei4-admin-004-project-config}"
mkdir -p "$OUT"
TOKEN="$(gcloud auth print-access-token)"
URL="https://firestore.googleapis.com/v1/projects/cxorbia-backend-dev/databases/(default)/documents/tenants/tya/projects/cinepolis"
curl -fsS -H "Authorization: Bearer $TOKEN" "$URL" > "$OUT/project-raw.json"
jq -S '{
  schemaVersion:"cxorbia.prei4.admin004.project-config-diagnostic.v1",
  decision:"PASS_PREI4_ADMIN_004_PROJECT_CONFIG_DIAGNOSTIC",
  readOnly:true,writes:0,deploys:0,production:false,
  document:{name:.name,createTime:.createTime,updateTime:.updateTime},
  safe:{
    id:(.fields.id.stringValue // null),
    projectId:(.fields.projectId.stringValue // null),
    name:(.fields.name.stringValue // null),
    version:((.fields.version.integerValue // "0")|tonumber),
    countries:[.fields.countries.arrayValue.values[]?.stringValue],
    honorario:{
      GT:((.fields.honorario.mapValue.fields.GT.doubleValue // .fields.honorario.mapValue.fields.GT.integerValue // null)|if .==null then null else tonumber end),
      HN:((.fields.honorario.mapValue.fields.HN.doubleValue // .fields.honorario.mapValue.fields.HN.integerValue // null)|if .==null then null else tonumber end)
    },
    currency:{
      GT:(.fields.currency.mapValue.fields.GT.stringValue // null),
      HN:(.fields.currency.mapValue.fields.HN.stringValue // null)
    },
    operationalSource:{
      mode:(.fields.operationalSource.mapValue.fields.mode.stringValue // null),
      providerType:(.fields.operationalSource.mapValue.fields.providerType.stringValue // null),
      readPolicy:(.fields.operationalSource.mapValue.fields.readPolicy.stringValue // null),
      writePolicy:(.fields.operationalSource.mapValue.fields.writePolicy.stringValue // null),
      hasProviderBinding:((.fields.operationalSource.mapValue.fields.providerBindingId.stringValue // .fields.operationalSource.mapValue.fields.integrationSettingId.stringValue // .fields.operationalSource.mapValue.fields.providerRef.stringValue // "")|length>0),
      mappingRef:(.fields.operationalSource.mapValue.fields.mappingRef.stringValue // null)
    }
  }
}' "$OUT/project-raw.json" > "$OUT/result.json"
rm "$OUT/project-raw.json"
cat "$OUT/result.json"
