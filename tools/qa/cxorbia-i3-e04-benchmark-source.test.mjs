import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('app/modules/cliente-insights.js','utf8');
function render(benchmarkSource){
 const period={id:'period-2026-10',name:'Programa prueba',industry:'Retail',benchmarkSource};
 let html='';let handler=null;
 const host={set innerHTML(v){html=v;},querySelector:()=>({addEventListener(){}})};
 const CX={module(name,fn){assert.equal(name,'cli_insights');handler=fn;}};
 const ui={el:()=>host,ph:()=>'',statusBdg:()=>'<status>pendiente</status>',aiBox:(txt)=>txt};
 const storage={getItem:()=>null,setItem(){throw Error('NO_WRITE_EXPECTED');}};
 vm.runInNewContext(source,{CX,localStorage:storage,Date,console,window:{}});
 assert.equal(typeof handler,'function');
 handler({data:{period:()=>period,visitas:()=>[{score:92,sucursal:'Centro'}]},ui});
 return html;
}
test('F12 never uses invented industry averages or top performer constants',()=>{
 assert.doesNotMatch(source,/const BENCH\s*=/);
 assert.doesNotMatch(source,/BENCH\[industria\]/);
 assert.doesNotMatch(source,/top performer \(85\)/);
 const html=render(null);
 assert.match(html,/Referencia sectorial pendiente/);
 assert.match(html,/sin benchmark verificable/i);
 assert.doesNotMatch(html,/Resultado por encima de la referencia sectorial validada/);
});
test('F12 only shows comparison after source, revision, sample and methodology verified',()=>{
 const benchmark={status:'verified',industry:'Retail',sourceId:'panel-industry',sourceRevision:'rev7',asOf:'2026-10-01',methodology:'muestra externa',sampleSize:100,meanScore:73,topPerformerScore:88};
 const html=render(benchmark);
 assert.match(html,/panel-industry/);
 assert.match(html,/rev7/);
 assert.match(html,/73/);
 assert.match(html,/88/);
 assert.match(html,/Resultado por encima de la referencia sectorial validada/);
 const missing={...benchmark,sourceRevision:''};
 const htmlMissing=render(missing);
 assert.match(htmlMissing,/Referencia sectorial pendiente/);
});
