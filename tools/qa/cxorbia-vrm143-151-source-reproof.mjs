#!/usr/bin/env node
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const assert=(ok,code)=>{if(!ok)throw new Error(code);};
const indexOrder=(s,a,b,code)=>{const ia=s.lastIndexOf(a),ib=s.lastIndexOf(b);assert(ia>=0&&ib>=0&&ia<ib,code);};

const notif=read('app/core/notif.js');
assert(notif.includes('_activeForRole(n)'), 'VRM143_NOTIFICATION_LIFECYCLE_MISSING');
assert(notif.includes('history(role)'), 'VRM143_NOTIFICATION_HISTORY_MISSING');
assert(notif.includes('createdYm!==currentYm'), 'VRM143_PERIOD_FILTER_MISSING');

const midia=read('app/modules/midia.js');
indexOrder(midia,'Tu próxima visita','${notifBlock()}','VRM144_NEXT_VISIT_NOT_PRIORITIZED');
indexOrder(midia,'Progreso de la visita','${notifBlock()}','VRM144_PROGRESS_NOT_PRIORITIZED');

const profile=read('app/adapters/tya-canonical-shopper-portal-v2.js');
assert(profile.includes('Identidad y datos personales')&&profile.includes('Desempeño')&&profile.includes('Trayectoria'),'VRM145_PROFILE_HIERARCHY_MISSING');
assert(profile.includes('str(a.realizada||a.cuestFecha||a.submittedAt||a.agendada||periodOf(data,a)).localeCompare(str(b.realizada'),'VRM146_HISTORY_ASCENDING_MISSING');

const reservas=read('app/modules/reservas.js');
assert(reservas.includes("const executionCut=String(v.executionCut||v.quincena||v.cut||v.executionWindow||'').trim()"),'VRM147_EXECUTION_CUT_MAPPING_MISSING');
assert(reservas.includes("const id=('slot|'"),'VRM147_SLOT_IDENTITY_MISSING');
assert(reservas.includes('executionCut:branch.executionCut'),'VRM147_CUT_NOT_PERSISTED');
assert(!reservas.includes("const id=(v.sucursal+'|'+v.ciudad)"),'VRM147_BRANCH_DEDUP_STILL_ACTIVE');

const automations=read('app/core/automations.js');
assert(!automations.includes('sin capa de texto legible; usa el texto pegado'),'VRM148_FAKE_ATTACHMENT_GROUNDING_REMAINS');
const cert=read('app/modules/cert.js');
const certRuntime=read('backend/runtime/hr-live-service/certification-runtime.mjs');
assert(cert.includes('generated.preguntas.length!==n'),'VRM148_FRONTEND_EXACT_COUNT_MISSING');
assert(cert.includes('requestedQuestionCount:n'),'VRM148_REQUESTED_COUNT_AUDIT_MISSING');
assert(certRuntime.includes('AI_QUESTION_COUNT_INCOMPLETE'),'VRM148_BACKEND_EXACT_COUNT_MISSING');
assert(certRuntime.includes("requestedQuestionCount:questionCount"),'VRM148_BACKEND_REQUESTED_COUNT_MISSING');

const css=read('app/styles/layout.css');
assert(css.includes('[data-rail="light"] .rail-nav::-webkit-scrollbar-thumb'),'VRM149_LIGHT_SCROLLBAR_MISSING');

const benefits=read('app/modules/beneficios.js');
assert(benefits.includes('const periodRows=currentLiquidations'),'VRM150_PERIOD_SCOPE_MISSING');
assert(benefits.includes('periodRows.forEach'),'VRM150_KPI_PERIOD_SCOPE_MISSING');
assert(benefits.includes('id="benStatus"')&&benefits.includes('id="benCountry"')&&benefits.includes('id="benCurrency"'),'VRM150_FILTERS_MISSING');
assert(benefits.includes('Resumen del periodo seleccionado')&&benefits.includes('Histórico'),'VRM150_CURRENT_HISTORY_SEPARATION_MISSING');

const finance=read('backend/runtime/cxorbia-finance-command-provider-v1.mjs');
const boundary=read('app/adapters/cxorbia-cxdata-command-boundary-v1.js');
assert(finance.includes("'finance.historical.reconcile'"),'VRM151_COMMAND_MISSING');
assert(finance.includes("collection('paymentReconciliations')"),'VRM151_DURABLE_ENTITY_MISSING');
assert(finance.includes("source:'historical_reconciliation'"),'VRM151_SOURCE_AUDIT_MISSING');
const hs=finance.indexOf("if(command.commandType==='finance.historical.reconcile')");
const he=finance.indexOf("if(command.commandType==='finance.movement.create')",hs);
assert(hs>=0&&he>hs,'VRM151_BRANCH_BOUNDARY_MISSING');
const hblock=finance.slice(hs,he);
assert(!hblock.includes("collection('financialMovements')"),'VRM151_RECONCILIATION_MUST_NOT_CREATE_REVENUE_OR_PAYMENT_MOVEMENT');
assert(hblock.includes('hrWrites:0'),'VRM151_HR_WRITE_GUARD_MISSING');
assert(boundary.includes('D.reconcileHistoricalPayments'),'VRM151_COMMAND_BOUNDARY_MISSING');

const result={decision:'PASS_VRM143_151_FOCAL_SOURCE_REPROOF',findings:['VRM-143','VRM-144','VRM-145','VRM-146','VRM-147','VRM-148','VRM-149','VRM-150','VRM-151'],production:false,productWrites:0,dataWrites:0,hrWrites:0};
process.stdout.write(JSON.stringify(result,null,2)+'\n');
