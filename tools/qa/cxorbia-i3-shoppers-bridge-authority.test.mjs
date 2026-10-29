import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const bridgeSource = readFileSync(new URL('../../app/adapters/tya-c6-domain-consistency-bridge.js', import.meta.url), 'utf8');
const shopperSource = readFileSync(new URL('../../app/modules/shoppers.js', import.meta.url), 'utf8');

test('Shoppers conserva columnas Visitas y Perfil al ejecutar puente legado DEV', () => {
  const cells = Array.from({ length: 8 }, () => ({ innerHTML: '' }));
  cells[3].innerHTML = '17'; // Visitas: dato numérico autoritativo del módulo.
  cells[4].innerHTML = '<span class="bdg bdg-a">Incompleto</span>'; // Perfil: contrato estricto de ocho campos.
  const row = {
    dataset: { sid: 'sh-1' },
    querySelectorAll: selector => selector === 'td' ? cells : [],
  };
  const events = new Map();
  const timers = [];
  const shopper = {
    id: 'sh-1', nombre: 'Shopper Uno', firstName: 'Shopper', lastName: 'Uno',
    pais: 'GT', whatsapp: '55555555', user: 'shopper.uno',
    certificationStatus: 'certificada',
    // Ciudad/correo/edad/sexo faltantes: NO es un perfil completo.
  };
  const CX = {
    session: { role: 'admin', view: 'shoppers' },
    modules: { shoppers: () => '<table id="shBody">contenido del módulo</table>' },
    data: { shoppers: [shopper], __identityMap: {}, getShopper: id => id === 'sh-1' ? shopper : null },
  };
  const document = {
    readyState: 'loading', body: {},
    addEventListener: (name, fn) => events.set(name, fn),
    querySelectorAll: selector => selector === '#shBody [data-sid]' ? [row] : [],
  };
  const window = { CX, addEventListener() {} };
  vm.runInNewContext(bridgeSource, {
    CX, window, document, URLSearchParams,
    location: { search: '?cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV' },
    MutationObserver: class { observe() {} },
    setTimeout: fn => timers.push(fn),
  }, { filename: 'tya-c6-domain-consistency-bridge.js' });

  events.get('DOMContentLoaded')();
  assert.equal(CX.modules.shoppers(), '<table id="shBody">contenido del módulo</table>');
  timers.forEach(fn => fn());
  assert.equal(shopper.perfilCompleto, true, 'La regla antigua y permisiva sigue siendo un dato distinto');
  assert.equal(cells[3].innerHTML, '17', 'El puente no sustituye Visitas por perfilCompleto');
  assert.match(cells[4].innerHTML, /Incompleto/, 'El puente no sustituye Perfil por Certificación');
});

test('Módulo Shoppers usa el mismo criterio estricto para KPI y columna Perfil', () => {
  assert.match(shopperSource, /const profileComplete=shopper=>missingProfileFields\(shopper\)\.length===0/);
  assert.match(shopperSource, /const perfilCell\s*=.*?profileComplete\(s\)\?ui\.bdg\('Completo','g'\)/s);
  assert.match(shopperSource, /ui\.kpi\('Perfiles completos',L\.filter\(s=>CX\.data_shopperDataLevel\(s\)!=='protected_reference'&&profileComplete\(s\)\)\.length/);
  assert.match(shopperSource, /<th[^>]*>Visitas<\/th><th>Perfil<\/th>/);
});
