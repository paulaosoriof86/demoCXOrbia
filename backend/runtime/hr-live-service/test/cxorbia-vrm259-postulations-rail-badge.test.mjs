import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../../../',import.meta.url));
const src=fs.readFileSync(root+'app/modules/postulaciones.js','utf8');

test('PASS_VRM259_POSTULATIONS_RAIL_BADGE_SOURCE',()=>{
  assert.match(src,/const syncPendingRailBadge=\(\)=>/);
  assert.match(src,/const n=c\('pendiente'\)/);
  assert.match(src,/badge\.textContent=n\?String\(n\):''/);
  assert.match(src,/badge\.style\.display=n\?'':'none'/);
  assert.match(src,/setTimeout\(syncPendingRailBadge,0\)/);
});
