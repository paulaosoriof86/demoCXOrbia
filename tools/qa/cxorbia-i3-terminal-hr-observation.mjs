// G05 GETs observe source HR; command reconciliation has a separate ACK receipt.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function validateTerminalHrObservation(meta){
  if(meta?.ok!==true||!/^[a-f0-9]{64}$/.test(String(meta.revision||''))||meta.sourceSafe!==true||
    meta.refreshError!==null||meta.writes!==false||meta.hrWrites!==false||meta.production!==false)
    throw new Error('SOURCE_FAILURE:TERMINAL_HR_READ_ONLY_OBSERVATION_INVALID');
  return {decision:'PASS_TERMINAL_HR_READ_ONLY_OBSERVATION',revision:meta.revision,
    sourceSafe:true,writes:false,hrWrites:false,production:false,
    scope:'HR_OBSERVATION_ONLY_NOT_COMMAND_RECONCILIATION',reconciliationCertified:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  console.log(JSON.stringify(validateTerminalHrObservation(JSON.parse(fs.readFileSync(process.argv[2],'utf8')))));
}
