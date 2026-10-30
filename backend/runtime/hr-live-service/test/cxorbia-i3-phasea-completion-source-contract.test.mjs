import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');

test('benefits and profile expose report-like hierarchy plus clickable historical detail',()=>{
  const b=read('app/modules/beneficios.js'),p=read('app/adapters/tya-canonical-shopper-portal-v2.js'),v=read('app/modules/misvisitas.js');
  assert.match(b,/data-benefits-overview/);assert.match(b,/const allSorted=all\.slice\(\)\.sort/);assert.match(b,/data-ben-row=/);
  assert.match(p,/data-profile-overview/);assert.match(p,/data-profile-visit-row=/);
  assert.match(v,/data-history-visit=/);assert.match(v,/projectTimezone/);assert.match(v,/canCompleteVisit/);
});

test('shopper visit actions are durable and tenant-date gated',()=>{
  const s=read('app/modules/misvisitas.js');
  assert.match(s,/uploadVisitEvidence/);assert.match(s,/recordVisitCheckinEvidence/);assert.match(s,/recordResourceReadReceipt/);
  assert.match(s,/aria-disabled="true" title="Se habilita el día de la visita"/);
  assert.match(s,/America\/Guatemala/);
});

test('certification source supports durable self-admin, multi-cert, recertification and exact-count AI',()=>{
  const s=read('app/modules/cert.js');
  assert.match(s,/banks\(pid\)/);assert.match(s,/Certificación<\/label><select/);assert.match(s,/id="certImp"/);
  assert.match(s,/CX\.certStore\.save/);assert.match(s,/CX\.certStore\.clear/);assert.match(s,/requestRecertification/);
  assert.match(s,/generated\.preguntas\.length!==n/);assert.match(s,/CERT_BANK_DELETE_ACK_REQUIRED/);
  assert.match(s,/Certificación aún no disponible/);
});

test('finance UI exposes individual and batch internal payment, durable support and reconciliation without false bank confirmation',()=>{
  const s=read('app/modules/finanzas.js');
  assert.match(s,/data-payone=/);assert.match(s,/id="liqSelectAll"/);assert.match(s,/id="liqClearSelection"/);
  assert.match(s,/onePaySupport/);assert.match(s,/batchPaySupport/);assert.match(s,/uploadBinary/);assert.match(s,/saveMetadata/);
  assert.match(s,/reconcileFinanceVisit/);assert.match(s,/Registro interno · conciliación externa pendiente/);
  assert.doesNotMatch(s,/id="loteMark"/);
});

test('frozen historical payment cut is explicit and September remains non-inferred',()=>{
  const s=read('app/data/tya-payment-history-source-safe.js'),a=read('app/adapters/tya-financial-canonical-source-safe-adapter.js');
  assert.match(s,/paidThroughPeriodKey:'2026-07'/);assert.match(s,/paidAt:'2026-10-02'/);assert.match(s,/mode:'explicit_items_only'/);assert.match(s,/inferUnlisted:false/);
  assert.match(a,/recovery-lock:phase-a-completion:historical-cut/);
});

test('admin dashboard/postulations and reservation source expose real interaction owners',()=>{
  const d=read('app/modules/dashboard.js'),p=read('app/modules/postulaciones.js'),r=read('app/modules/reservas.js'),c=read('app/adapters/cxorbia-cxdata-command-boundary-v1.js');
  assert.match(d,/class="bdSel"/);assert.match(d,/bdBulkRequest/);assert.match(d,/bdBulkAgenda/);assert.match(d,/CX\.adminPostulacionesActions/);assert.match(d,/handoff\('request',requireSelected\(\)\)/);
  assert.match(p,/const requestTargets=/);assert.match(p,/sourceType:'operational_assignment'/);assert.match(p,/pushDurable/);
  assert.match(r,/createReservation/);assert.match(r,/setReservationStatus/);assert.match(r,/deleteReservation/);assert.match(r,/future_only/);
  assert.match(c,/reservation\.create/);assert.match(c,/reservation\.status\.update/);assert.match(c,/reservation\.delete/);
});

test('admin shopper source exposes banking/profile workflow with provider ACK governance',()=>{
  const s=read('app/modules/shoppers.js');
  assert.match(s,/banco|ctaNum/);assert.match(s,/profile_completion_requested/);assert.match(s,/providerAck/);assert.match(s,/idempotentReplay|idempotency/);
});

test('B2 self-display name validation uses real Unicode escapes and preserves HR identity',()=>{
  const src=read('backend/runtime/cxorbia-shopper-command-provider-v1.mjs');
  const start=src.indexOf('const wantsDisplayChange='),end=src.indexOf('const merged=',start);
  assert.ok(start>=0&&end>start,'provider B2 exact owner required');
  const guard=src.slice(start,end);
  const match=guard.match(/\/\[<>\S+?\]\/\.test\(first\+last\)/);
  assert.ok(match,'exact display validation expression required');
  const sourceRegex=match[0].slice(0,match[0].indexOf('.test'));
  const rejects=new Function('return '+sourceRegex)();
  assert.equal(rejects.test('AnaCorregida'),false,'valid name must not be rejected');
  assert.equal(rejects.test('LucíaPérez'),false,'accented names must be allowed');
  assert.equal(rejects.test('Ana<Corregida'),true,'HTML delimiters rejected');
  assert.equal(rejects.test('Ana\nCorregida'),true,'control characters rejected');
  assert.match(src,/SHOPPER_HR_MANAGED_FIELDS_IMMUTABLE/);
  assert.match(src,/patch\.displayNameActorUid=selfScoped\?uid:actor\.uid/);
  assert.match(src,/patch\.displayNameAuthority=selfScoped\?'shopper_self_profile':'staff_authorized_profile'/);
});

test('I3 Phase A existing DEV runner has one artifact, runtime build, rules and hosting in one guarded lane',()=>{
  const s=read('.github/control/CXORBIA_I3_PHASEA_COMPLETION_CONTROL_20261007.sh');
  const w=read('.github/workflows/cxorbia-recovery-i3-dev-certification.yml');
  assert.match(s,/gcloud builds submit "\$PHASEA_SOURCE_DIR"/);
  assert.match(s,/gcloud run services update "\$SERVICE"/);
  assert.match(s,/--only "firestore:rules,hosting:\$FIREBASE_HOSTING_TARGET"/);
  assert.match(s,/firebaserules\.googleapis\.com/);
  assert.match(s,/moduleBlobReadback\.pass==true/);
  assert.match(s,/cxorbia-phasea-source\.tar/);
  assert.match(s,/core\/automations\.js modules\/automatizaciones\.js core\/backend-cxdata-finance-read\.js/);
  assert.match(s,/builds:1,runtimeDeploys:1,hostingDeploys:1,firestoreRulesDeploys:1/);
  assert.match(w,/\[i3-phasea-dev-readback\]/);
  assert.doesNotMatch(s,/tya-plataforma\.web\.app/);
});

test('I3 Phase A exact source TAR is verified from repository workdir without duplicated output prefix',()=>{
  const runner=read('.github/control/CXORBIA_I3_PHASEA_COMPLETION_CONTROL_20261007.sh');
  const check='sha256sum -c "$OUT/cxorbia-phasea-source.tar.sha256"';
  const begin='# BEGIN_EXISTING_IMAGE_TRAFFIC_ACTIVATION_HELPERS';
  const end='# END_EXISTING_IMAGE_TRAFFIC_ACTIVATION_HELPERS';
  const verify=source=>{
    const lines=source.split('\n'),begins=lines.flatMap((line,i)=>line===begin?[i]:[]),ends=lines.flatMap((line,i)=>line===end?[i]:[]);
    assert.equal(begins.length,ends.length,'ACTIVATION_HELPER_MARKERS_UNPAIRED');
    assert.ok(begins.length<=1,'ACTIVATION_HELPER_MARKERS_DUPLICATED');
    if(begins.length)assert.ok(begins[0]<ends[0],'ACTIVATION_HELPER_MARKERS_REVERSED');
    const activation=begins.length?lines.slice(begins[0]+1,ends[0]):[];
    const legacy=begins.length?[...lines.slice(0,begins[0]),...lines.slice(ends[0]+1)]:lines;
    const count=scope=>scope.filter(line=>line.trim()===check).length;
    assert.match(source,/sha256sum "\$OUT\/cxorbia-phasea-source\.tar" > "\$OUT\/cxorbia-phasea-source\.tar\.sha256"/);
    assert.equal(count(legacy),2,'LEGACY_TAR_CHECK_COUNT');
    if(begins.length)assert.equal(count(activation),2,'ACTIVATION_TAR_CHECK_COUNT');
    assert.doesNotMatch(source,/\(cd "\$OUT" && sha256sum -c cxorbia-phasea-source\.tar\.sha256\)/);
    assert.doesNotMatch(source,/\bcd[ \t]+"\$OUT"[ \t]*(?:&&|;)[ \t]*sha256sum -c/,'TAR_CHECK_REQUIRES_REPOSITORY_WORKDIR');
  };
  verify(runner);
  const checks=runner.split('\n').flatMap((line,i)=>line.trim()===check?[i]:[]);
  for(const index of checks){
    const omitted=runner.split('\n');omitted[index]='# omitted checksum verification';
    assert.throws(()=>verify(omitted.join('\n')),/(?:LEGACY|ACTIVATION)_TAR_CHECK_COUNT/);
  }
  assert.throws(()=>verify(runner.replace(check,'sha256sum -c "$OUT/$OUT/cxorbia-phasea-source.tar.sha256"')),/(?:LEGACY|ACTIVATION)_TAR_CHECK_COUNT/);
  assert.throws(()=>verify(runner+'\n(cd "$OUT" && sha256sum -c cxorbia-phasea-source.tar.sha256)\n'));
  assert.throws(()=>verify(runner+'\n(cd "$OUT" && '+check+')\n'),/TAR_CHECK_REQUIRES_REPOSITORY_WORKDIR/);
});

test('I3 DEV previously-published artifact uses same job in readback-only mode with no extra build',()=>{
  const runner=read('.github/control/CXORBIA_I3_PHASEA_COMPLETION_CONTROL_20261007.sh');
  const workflow=read('.github/workflows/cxorbia-recovery-i3-dev-certification.yml');
  assert.match(runner,/^readback\)$/m);
  assert.match(runner,/gcloud builds describe "\$BUILD"/);
  assert.match(runner,/test "\$DIGEST" = "\$EXPECTED_DIGEST"/);
  assert.match(runner,/\.i3PhaseADevReadbackTarget\.production/);
  assert.match(runner,/jq -j '\[\.source\.files\[\] \| select\(\.name=="firestore\.rules"\) \| \.content\]\[0\] \/\/ empty'/);
  assert.match(workflow,/\[i3-phasea-dev-readback\]/);
  assert.match(workflow,/run: bash \.github\/control\/CXORBIA_I3_PHASEA_COMPLETION_CONTROL_20261007\.sh readback/);
  assert.doesNotMatch(workflow,/run: bash \.github\/control\/CXORBIA_I3_PHASEA_COMPLETION_CONTROL_20261007\.sh materialize\n      - run: bash/);
});

import '../../../../tools/qa/cxorbia-i3-r22-notification-route-ack-source.test.mjs';
import '../../../../tools/qa/cxorbia-i3-b10-external-provider-routing.test.mjs';
