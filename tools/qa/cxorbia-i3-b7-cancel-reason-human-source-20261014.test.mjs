import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../../app/modules/postulaciones.js',import.meta.url),'utf8');
test('B7 cancellation reason human presentation preserves free-text',()=>{
 const begin=source.indexOf('CX.adminPostulacionesActions.cancelReasonForUi=');
 const end=source.indexOf('\nCX.adminPostulacionesActions.openRequest',begin);
 assert.ok(begin>=0&&end>begin,'helper exists');
 const CX={adminPostulacionesActions:{}};
 new Function('CX',source.slice(begin,end))(CX);
 const label=CX.adminPostulacionesActions.cancelReasonForUi;
 assert.equal(label({reason:'shopper-cancel-request'}),'El shopper solicitó cancelar la visita. No hay un motivo adicional registrado.');
 assert.equal(label({reason:'No podré asistir'}),'No podré asistir');
 assert.match(label({reason:'internal-shopper-cancel-request'}),/Solicita aclaración/);
 assert.equal(label({}),'El shopper no indicó un motivo.');
 assert.ok(source.includes('safe(CX.adminPostulacionesActions.cancelReasonForUi(v.cancelRequest))'));
 assert.ok(!source.includes("ui.aiBox('Estas fechas provienen de HR"));
});