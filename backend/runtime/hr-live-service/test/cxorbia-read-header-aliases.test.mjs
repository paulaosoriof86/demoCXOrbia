import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import test from 'node:test';
import {validateGraphColumnMap, verifyMakeGraphReadOutput} from '../../cxorbia-make-graph-provider-v1.mjs';
import {parseTab} from '../../../../tools/hr-source/tya-build-live-hr-source-safe-r20.mjs';

const read = url => JSON.parse(readFileSync(new URL(url, import.meta.url)));
const contract = read('../../../contracts/tya-hr-column-map-r20-v1.json');
const {observations} = read('../../../../docs/checkpoints/CXORBIA_I3_GT_NOV_HEADER_DRIFT_20261126.json');
const tab = {country:'GT', key:'2026-11', year:2026, month:11, tabTitle:'QA'};
const rows = header => [[], [], [], header];
const validate = (header, country='GT', map=contract) => validateGraphColumnMap(rows(header), map, country);

for (const item of observations) test('accept original header ' + item.id, () => {
  const country = item.scope[2];
  assert.equal(validate(item.header, country).headerVariant, country === 'GT' ? 'tab_scoped_compact' : 'full_identity');
  const parsed = parseTab({...tab, country}, rows(item.header), contract);
  assert.equal(parsed.diagnostic.headerRow, 4);
  assert.equal(parsed.issues.filter(issue => issue.severity === 'critical').length, 0);
});

const original = observations[0].header;
for (const label of ['Columna1', 'Shopper', 'Shopper Asignado']) {
  test('assigned and vacant rows retain their meaning with ' + label, () => {
    const header = ['Adicional', ...original];
    const index = header.indexOf('Columna1');
    header[index] = label;
    function visit(shopper) {
      const row = header.map(() => '');
      row[header.indexOf('CIUDAD')] = 'Ciudad QA';
      row[header.findIndex(s => s.trim() === 'Shopping')] = 'Cine QA';
      row[header.indexOf('Disponible a partir de')] = '2026-11-01';
      row[index] = shopper;
      return row;
    }
    const values = [...rows(header), visit('Shopper QA'), visit('por asignar')];
    const scope = {tenantId:'qa', projectId:'project', periodId:'2026-11', countryCode:'GT', bindingFingerprint:'a'.repeat(64)};
    const worksheet = {worksheetId:'sheet-qa'};
    const rangeAddress = 'A1:AJ140';
    const hash = createHash('sha256').update(JSON.stringify(values)).digest('hex');
    const result = verifyMakeGraphReadOutput({...scope, ...worksheet, rangeAddress, status1:200, status2:200,
      values1:values, values2:structuredClone(values), rowCount1:values.length, rowCount2:values.length, hash1:hash, hash2:hash},
      scope, worksheet, rangeAddress, contract);
    const parsed = parseTab(tab, result.privateRows, contract);
    assert.equal(result.proof.sourceContentSha256, hash);
    assert.equal(result.privateRows[3][index], label);
    assert.equal(parsed.issues.some(issue => issue.severity === 'critical'), false);
    assert.equal(parsed.visits.length, 2);
    assert.ok(parsed.visits[0].shopperId);
    assert.equal(parsed.visits[0].canonicalFacets.available, false);
    assert.equal(parsed.visits[1].shopperId, null);
    assert.equal(parsed.visits[1].canonicalFacets.available, true);
  });
}
test('a generic heading has no meaning outside its confirmed layout and configured contract', () => {
  const noRule = {...contract, readHeaderAliases:[]};
  assert.throws(() => validate(original, 'GT', noRule), /HEADER_AMBIGUOUS_OR_MISSING/);
  assert.throws(() => validate(original, 'HN'), /HEADER_AMBIGUOUS_OR_MISSING/);
  const moved = [...original];
  moved.splice(moved.indexOf('Columna1'), 0, 'Otro campo');
  assert.throws(() => validate(moved), /HEADER_AMBIGUOUS_OR_MISSING/);
});
test('two plausible shopper columns fail closed in the validator and visit parser', () => {
  for (const label of ['Shopper', 'Shopper Asignado']) {
    const ambiguous = [...original, label];
    assert.throws(() => validate(ambiguous), /COLUMN_AMBIGUOUS/);
    const parsed = parseTab(tab, rows(ambiguous), contract);
    assert.ok(parsed.issues.some(issue => issue.column === 'shopper' && issue.severity === 'critical'));
    assert.equal(parsed.visits.length, 0);
  }
});
