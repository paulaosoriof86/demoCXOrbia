import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const theme=fs.readFileSync(new URL('../../app/styles/theme.css',import.meta.url),'utf8');
const layout=fs.readFileSync(new URL('../../app/styles/layout.css',import.meta.url),'utf8');
const fontSize=(css,selector)=>{
  const start=css.indexOf(selector+'{');
  assert.ok(start>=0,`missing shared selector ${selector}`);
  const rule=css.slice(start,css.indexOf('}',start));
  const match=rule.match(/font-size:\s*([\d.]+)px/);
  assert.ok(match,`missing font size for ${selector}`);
  return Number(match[1]);
};

test('V01 shared financial, operational, shopper and client KPI labels are legible',()=>{
  assert.ok(fontSize(theme,'.kpi .k-l')>=12);
  assert.ok(fontSize(theme,'.kpi .k-s')>=12);
  assert.ok(fontSize(theme,'.ph-s')>=14);
  assert.ok(fontSize(theme,'.bdg')>=12);
});

test('V01 table and form components use a consistent readable type scale',()=>{
  assert.ok(fontSize(theme,'.tbl th')>=13);
  assert.ok(fontSize(theme,'.tbl td')>=14);
  assert.ok(fontSize(theme,'.inp,.sel')>=14);
  assert.ok(fontSize(theme,'.lbl')>=13);
});

test('V01 all roles share legible primary/compact actions and rail headings',()=>{
  assert.ok(fontSize(theme,'.btn')>=14);
  assert.ok(fontSize(theme,'.btn-sm')>=13.5);
  assert.ok(fontSize(layout,'.nav-sec')>=11);
  assert.ok(fontSize(layout,'.rail-proj-l')>=11);
});
