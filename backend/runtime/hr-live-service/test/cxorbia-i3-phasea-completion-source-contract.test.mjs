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
  assert.match(d,/class="bdSel"/);assert.match(d,/bdBulkRequest/);assert.match(d,/bdBulkAgenda/);assert.match(d,/CX_PENDING_ADMIN_OPERATION_ACTION/);
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
  assert.match(src,/displayNameActorUid=uid/);
  assert.match(src,/displayNameAuthority='shopper_self_profile'/);
});
