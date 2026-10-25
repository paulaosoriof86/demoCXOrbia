import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../../app/modules/postulaciones.js',import.meta.url),'utf8');
const extract=source.match(/^const poExclusiveModal=([^;]+);/m);
test('R05 owner forces exclusive modal, preserving other options',()=>{
 assert.ok(extract);
 const fn=vm.runInNewContext('('+extract[1]+')');
 const opened=[],ui={modal:(title,body,options)=>{opened.push({title,body,options});return ()=>{};}};
 fn(ui,'first','body',{premium:true,replaceExisting:false});
 fn(ui,'second','body',{dismissOnBackdrop:false});
 assert.equal(opened.length,2);
 assert.equal(opened[0].options.replaceExisting,true);
 assert.equal(opened[0].options.premium,true);
 assert.equal(opened[1].options.replaceExisting,true);
 assert.equal(opened[1].options.dismissOnBackdrop,false);
});
test('R05 all 18 Postulaciones modals use one exclusive owner',()=>{
 assert.equal([...source.matchAll(/\bpoExclusiveModal\((?:ui|CX\.ui),/g)].length,18);
 assert.equal((source.match(/(?<!\.)\bui\.modal\(/g)||[]).length,0);
 assert.equal((source.match(/CX\.ui\.modal\(/g)||[]).length,0);
});
test('R05 profile and historical visits follow exclusive modal transitions',()=>{
 assert.match(source,/const histModal=/);
 assert.match(source,/poExclusiveModal\(ui,title\+' · '\+s\.nombre/);
 assert.match(source,/poExclusiveModal\(ui,s\.nombre\+' · '\+s\.code/);
});
test('R06 assignment cards remain under shared search and filters',()=>{
 assert.match(source,/document\.querySelectorAll\('#poAssignedGroups \[data-cx-assignment-card\]'\)/);
 assert.match(source,/const matches=!q\|\|searchable\.includes\(q\)/);
 assert.match(source,/el\.style\.display=matches&&projectOk&&countryOk&&stateOk/);
 assert.match(source,/document\.querySelectorAll\('#poAssignedGroups \[data-cx-assignment-group\]'\)/);
});
