import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../../app/modules/postulaciones.js',import.meta.url),'utf8');
test('B7 request new date closes stale pending request with provider ACK/readback before success',()=>{
 const helper=source.split('CX.adminPostulacionesActions.requestReplacementDate=')[1]?.split('CX.adminPostulacionesActions.openRequest=')[0];
 assert.ok(helper);
 assert.match(helper,/rescheduleRequest\?\.status!=='pending_review'/);
 assert.match(helper,/requestVisitReschedule\(id,null,\{ackAware:true,decision:'rejected',reason\}\)/);
 assert.match(helper,/result\?\.providerAck===true/);
 assert.match(helper,/observed\?\.rescheduleRequest\?\.status!=='rejected'/);
 assert.match(helper,/const preserved=/);
 assert.match(source,/requestReplacementDate\(\{data,ui,visitId/);
 assert.doesNotMatch(source,/close\(\);CX\.adminPostulacionesActions\.openRequest\(\{data,ui,visitIds:\[String\(visit\.id\|\|visit\.visitId\)\],defaultType:'cambio'\}\)/);
});
