import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../../app/modules/crm.js', import.meta.url), 'utf8');

function mountCuentaForm() {
  const start = source.indexOf("host.querySelector('#newCuenta')?.addEventListener(");
  const end = source.indexOf("host.querySelector('#newContacto')", start);
  assert.ok(start >= 0 && end > start, 'el bloque de creación de cuentas existe');
  const block = source.slice(start, end);
  const marker = 'onMount:(ov,close)=>{';
  const begin = block.indexOf(marker);
  const finish = block.lastIndexOf('}}));');
  assert.ok(begin >= 0 && finish > begin, 'onMount queda delimitado');
  const body = block.slice(begin + marker.length, finish);
  return new Function('ov', 'close', 'CX', 'ui', 'data', 'draw', 'ackOk', 'durableWarn', body);
}

function syntheticForm(ack) {
  const handlers = new Map();
  let closeCount = 0;
  let drawCount = 0;
  let warningCount = 0;
  let accountCount = 0;
  let contactCount = 0;
  let clientCount = 0;
  const toastMessages = [];
  const values = {
    '#cuN': 'CXORBIA_QA_G03_NO_REAL',
    '#cuR': 'Otra',
    '#cuP': 'GT',
    '#cuCity': '',
    '#cuWeb': '',
    '#cuS': '',
    '#cuE': '',
    '#cuNota': 'PRUEBA SINTETICA; NO CONTACTAR',
    '#cuCtN': '',
  };
  const ov = {
    querySelector(selector) {
      if (selector === '#cuFile' || selector === '#cuSave') {
        return { addEventListener(eventName, callback) { handlers.set(selector + ':' + eventName, callback); } };
      }
      if (selector === '#cuEsCli') return { checked: false };
      return Object.hasOwn(values, selector) ? { value: values[selector] } : null;
    },
  };
  const CX = {
    crmStore: {
      async addCuenta(payload) {
        accountCount += 1;
        assert.equal(payload.nombre, values['#cuN']);
        assert.equal(payload.nota, values['#cuNota']);
        return ack;
      },
      async addContacto() { contactCount += 1; throw Error('No se permite crear contacto en esta prueba'); },
      cuentas() { return []; },
      _canonical() { return true; },
    },
  };
  const data = { async addClient() { clientCount += 1; throw Error('No se permite crear cliente en esta prueba'); } };
  const ui = { toast(message) { toastMessages.push(message); } };
  const ackOk = result => result?.ok === true && result?.committed === true &&
    result?.providerAck === true && result?.successUiAllowed === true && result?.readbackVerified === true;
  mountCuentaForm()(ov, () => { closeCount += 1; }, CX, ui, data, () => { drawCount += 1; },
    ackOk, () => { warningCount += 1; });
  return { handlers, counts: () => ({ closeCount, drawCount, warningCount, accountCount, contactCount, clientCount }), toastMessages };
}

test('G03 CRM: montaje conecta archivo y guardado aun sin botones de modo inexistentes', () => {
  const fixture = syntheticForm({ ok: true, committed: true, providerAck: true, successUiAllowed: true, readbackVerified: true, entityId: 'synthetic-only' });
  assert.equal(typeof fixture.handlers.get('#cuFile:change'), 'function');
  assert.equal(typeof fixture.handlers.get('#cuSave:click'), 'function');
  assert.doesNotMatch(source, /ov\.querySelector\('#cuModo(?:Manual|IA)'\)\.addEventListener/);
});

test('G03 CRM: ACK completo confirma cuenta sintética sin crear contacto ni cliente', async () => {
  const fixture = syntheticForm({ ok: true, committed: true, providerAck: true, successUiAllowed: true, readbackVerified: true, entityId: 'synthetic-only' });
  await fixture.handlers.get('#cuSave:click')();
  assert.deepEqual(fixture.counts(), {
    closeCount: 1, drawCount: 1, warningCount: 0, accountCount: 1, contactCount: 0, clientCount: 0,
  });
  assert.ok(fixture.toastMessages.some(message => message.includes('creados y vinculados')));
});

test('G03 CRM: sin ACK durable el modal no comunica éxito ni crea entidades dependientes', async () => {
  const fixture = syntheticForm({ ok: false, committed: false, providerAck: false, readbackVerified: false });
  await fixture.handlers.get('#cuSave:click')();
  assert.deepEqual(fixture.counts(), {
    closeCount: 0, drawCount: 0, warningCount: 1, accountCount: 1, contactCount: 0, clientCount: 0,
  });
  assert.equal(fixture.toastMessages.length, 0);
});
