import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import test from 'node:test';

// Copy this test into tools/qa/ in the canonical repository. It then reads
// ../../app/modules/visitas.js. This test is SOURCE-ONLY: never contacts DEV or HR.
const here = path.dirname(fileURLToPath(import.meta.url));
const moduleSource = fs.readFileSync(path.join(here, '../../app/modules/visitas.js'), 'utf8');

const periods = [
  { id: 'cinepolis-2026-10', programKey: 'cinepolis', name: 'Octubre', accent: '#1765a7' },
  { id: 'cinepolis-2026-11', programKey: 'cinepolis', name: 'Noviembre', accent: '#1765a7' },
];
const visit = (id, periodId, pais) => ({
  id,
  projectId: 'cinepolis-2026-10',
  periodId,
  pais,
  estado: 'disponible',
  sucursal: id,
  ciudad: pais === 'GT' ? 'Guatemala' : 'Tegucigalpa',
  quincena: 'Q1',
  franja: 'WK',
  escenario: 'Estándar',
  currency: pais === 'GT' ? 'GTQ' : 'HNL',
  honorario: pais === 'GT' ? 60 : 200,
});
const sourceVisits = [
  visit('gt-oct', 'cinepolis-2026-10', 'GT'),
  visit('gt-sept', 'cinepolis-2026-09', 'GT'),
  visit('hn-aug', 'cinepolis-2026-08', 'HN'),
];

function render(scope, activePeriod) {
  let handler;
  const CX = {
    module(name, fn) {
      assert.equal(name, 'visitas');
      handler = fn;
    },
    router: { resolveVisibleProjects: () => periods },
    paisName: pais => pais,
  };
  vm.runInNewContext(moduleSource, { CX, setTimeout() {} }, { timeout: 1000 });
  assert.equal(typeof handler, 'function');
  const data = {
    period: () => periods.find(x => x.id === activePeriod) || periods[0],
    projects: periods,
    programKey: p => p.programKey,
    programBase: p => p.name,
    currentPeriodId: activePeriod,
    _visitas: sourceVisits,
    recordPeriodId: v => v.periodId,
    scopePaises: () => scope,
    inScope: pais => scope.includes(pais),
    visitFacets: v => ({ available: v.estado === 'disponible', eligibilityBlocked: false }),
    availableVisits: rows => rows.filter(v => v.estado === 'disponible'),
  };
  const ui = {
    ph: (title, description) => `${title}: ${description}`,
    aiBox: description => description,
    empty: (_icon, title) => title,
    money: (currency, amount) => `${currency} ${amount}`,
  };
  return handler({ data, role: 'shopper', ui });
}

test('GT shopper sees only active October country-qualified offer, not historical or HN', () => {
  const html = render(['GT'], 'cinepolis-2026-10');
  assert.match(html, /1 oportunidades en 1 proyecto\(s\) para tu perfil/);
  assert.match(html, /data-detail="gt-oct"/);
  assert.doesNotMatch(html, /data-detail="gt-sept"|data-detail="hn-aug"/);
  assert.doesNotMatch(html, /cx-available-empty-reason/);
});

test('GT shopper sees truthful historical explanation when November has no offer', () => {
  const html = render(['GT'], 'cinepolis-2026-11');
  assert.match(html, /0 oportunidades en 0 proyecto\(s\) para tu perfil/);
  assert.match(html, /Existen visitas marcadas disponibles en otros períodos/);
  assert.match(html, /id="cx-available-empty-reason" role="status"/);
  assert.doesNotMatch(html, /data-detail="gt-oct"|data-detail="gt-sept"|data-detail="hn-aug"/);
});

test('missing shopper country never broadens scope and directs identity review', () => {
  const html = render([], 'cinepolis-2026-10');
  assert.match(html, /0 oportunidades en 0 proyecto\(s\) para tu perfil/);
  assert.match(html, /No pudimos confirmar el país de tu expediente/);
  assert.doesNotMatch(html, /data-detail="gt-oct"|data-detail="gt-sept"|data-detail="hn-aug"/);
});

test('HN historical August row does not appear as an active October application', () => {
  const html = render(['HN'], 'cinepolis-2026-10');
  assert.match(html, /0 oportunidades en 0 proyecto\(s\) para tu perfil/);
  assert.match(html, /Existen visitas marcadas disponibles en otros períodos/);
  assert.doesNotMatch(html, /data-detail="hn-aug"|data-detail="gt-oct"/);
});
