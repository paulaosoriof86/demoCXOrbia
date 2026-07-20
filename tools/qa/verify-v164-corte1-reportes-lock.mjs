#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import process from 'node:process';

const expected={
  'app/modules/cliente-extra.js':'a8a90275bfb53a804ad240e3792e735302290aba1d040ab008af333c4b05e526',
  'app/index.html':'040c6521c21e799e12495070b9fbb77594adba32c41d91127839a653b7131c01',
  'app/vendor/pptxgenjs.min.js':'cd078ca9e91c6f9e061ee0a3c310d6ff157c3a71b1dea7f40fd53818017266ff',
  'app/REPORTE-DE-CAMBIOS.md':'db4cf066b1d4cb682efbb9b352e6553fd09cf1fc047b0b2808c65f2e840b61e3'
};
const failures=[];
for(const [file,want] of Object.entries(expected)){
  if(!fs.existsSync(file)){failures.push({file,error:'missing'});continue;}
  const got=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if(got!==want)failures.push({file,error:'sha256_mismatch',want,got});
}
const html=fs.readFileSync('app/index.html','utf8');
if(!html.includes('<script src="vendor/pptxgenjs.min.js"></script>'))failures.push({file:'app/index.html',error:'pptx_local_script_missing'});
if(html.includes('adapters/tya-corte1-report-projection.js'))failures.push({file:'app/index.html',error:'generated_adapter_must_not_be_source'});
const moduleText=fs.readFileSync('app/modules/cliente-extra.js','utf8');
for(const text of ['CX_TYA_CORTE1_REPORTS','periodKey','branchRows','Pendiente de fuente','Pendiente de alcance autorizado'])if(!moduleText.includes(text))failures.push({file:'app/modules/cliente-extra.js',error:'required_marker_missing',text});
for(const text of ['— demo','PDF demo','exportada (PDF demo)'])if(moduleText.includes(text))failures.push({file:'app/modules/cliente-extra.js',error:'demo_marker_present',text});
const result={ok:failures.length===0,decision:failures.length?'HOLD_V164_CORTE1_REPORTES_LOCK':'PASS_V164_CORTE1_REPORTES_LOCK',expected,failures};
console.log(JSON.stringify(result,null,2));
if(failures.length)process.exit(1);
