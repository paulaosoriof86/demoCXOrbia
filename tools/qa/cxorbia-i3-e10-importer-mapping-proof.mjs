import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const args=Object.fromEntries(process.argv.slice(2).reduce((pairs,value,index,all)=>index%2?pairs:[...pairs,[value,all[index+1]]],[]));
const repoRoot=path.resolve(import.meta.dirname,'../..');
const ownerPath=path.resolve(args['--owner']||path.join(repoRoot,'app/core/importador.js'));
const dedupePath=path.resolve(args['--dedupe']||path.join(repoRoot,'app/core/dedupe.js'));
const outputPath=args['--output']?path.resolve(args['--output']):null;
const expected={"fixtureSynthetic": true, "countryAndCurrencyAreSynthetic": true, "project": {"id": "qa-e10-project-only", "name": "Synthetic E10 fixture", "countries": ["ZZ"], "currency": {"ZZ": "TST"}, "honorario": {"ZZ": 99}, "scenarios": ["QA Scenario"], "quincenas": ["QA Window"]}, "existingVisits": [{"id": "qa-e10-existing-duplicate", "projectId": "qa-e10-project-only", "ref": "QA-E10-D1", "sucursal": "QA Duplicate Branch", "ciudad": "QA City", "escenario": "QA Scenario", "quincena": "QA Window", "fecha": "2030-04-02", "shopper": "QA Shopper Existing", "honorario": 22}, {"id": "qa-e10-existing-conflict", "projectId": "qa-e10-project-only", "ref": "QA-E10-C1", "sucursal": "QA Conflict Branch", "ciudad": "QA City", "escenario": "QA Scenario", "quincena": "QA Window", "fecha": "2030-04-03", "shopper": "QA Shopper Before", "honorario": 30}, {"id": "qa-e10-other-project", "projectId": "qa-e10-unrelated-project", "ref": "QA-E10-N1", "sucursal": "QA Other Project", "ciudad": "QA City", "escenario": "QA Scenario", "quincena": "QA Window", "fecha": "2030-04-01", "shopper": "QA Unrelated Shopper", "honorario": 11}], "csv": {"headers": ["Ref", "Fecha", "Sucursal", "Ciudad", "Shopper", "Escenario", "Honorario", "Estado"], "rows": [["QA-E10-N1", "01/04/2030", "QA New Branch", "QA City New", "QA Shopper New", "QA Scenario", "11", "disponible"], ["QA-E10-D1", "02/04/2030", "QA Duplicate Branch", "QA City", "QA Shopper Existing", "QA Scenario", "22", "disponible"], ["QA-E10-C1", "03/04/2030", "QA Conflict Branch", "QA City", "QA Shopper Changed", "QA Scenario", "33", "disponible"], ["QA-E10-X1", "", "QA Invalid Branch", "QA City", "", "QA Scenario", "44", "disponible"]], "map": {"0": "ref", "1": "fecha", "2": "sucursal", "3": "ciudad", "4": "shopper", "5": "escenario", "6": "honorario", "7": "estado"}, "delimiter": ","}, "tsv": {"headers": ["Honorario", "Sucursal", "Fecha", "Estado", "Ref", "Escenario", "Shopper", "Ciudad"], "rows": [["11", "QA New Branch", "01/04/2030", "disponible", "QA-E10-N1", "QA Scenario", "QA Shopper New", "QA City New"], ["22", "QA Duplicate Branch", "02/04/2030", "disponible", "QA-E10-D1", "QA Scenario", "QA Shopper Existing", "QA City"], ["33", "QA Conflict Branch", "03/04/2030", "disponible", "QA-E10-C1", "QA Scenario", "QA Shopper Changed", "QA City"], ["44", "QA Invalid Branch", "", "disponible", "QA-E10-X1", "QA Scenario", "", "QA City"]], "map": {"0": "honorario", "1": "sucursal", "2": "fecha", "3": "estado", "4": "ref", "5": "escenario", "6": "shopper", "7": "ciudad"}, "delimiter": "\t"}, "candidates": [{"_row": 0, "ref": "QA-E10-N1", "sucursal": "QA New Branch", "ciudad": "QA City New", "pais": "ZZ", "franja": "", "fecha": "2030-04-01", "shopper": "QA Shopper New", "escenario": "QA Scenario", "honorario": 11, "reembolso": 0, "estado": "disponible", "obs": ""}, {"_row": 1, "ref": "QA-E10-D1", "sucursal": "QA Duplicate Branch", "ciudad": "QA City", "pais": "ZZ", "franja": "", "fecha": "2030-04-02", "shopper": "QA Shopper Existing", "escenario": "QA Scenario", "honorario": 22, "reembolso": 0, "estado": "disponible", "obs": ""}, {"_row": 2, "ref": "QA-E10-C1", "sucursal": "QA Conflict Branch", "ciudad": "QA City", "pais": "ZZ", "franja": "", "fecha": "2030-04-03", "shopper": "QA Shopper Changed", "escenario": "QA Scenario", "honorario": 33, "reembolso": 0, "estado": "disponible", "obs": ""}, {"_row": 3, "ref": "QA-E10-X1", "sucursal": "QA Invalid Branch", "ciudad": "QA City", "pais": "ZZ", "franja": "", "fecha": "", "shopper": "", "escenario": "QA Scenario", "honorario": 44, "reembolso": 0, "estado": "disponible", "obs": ""}], "diffRefs": {"nuevos": ["QA-E10-N1"], "dups": ["QA-E10-D1"], "conflicts": ["QA-E10-C1"], "discarded": ["QA-E10-X1"]}, "limit": "Reference-key cases only; no assertion that mutable date is the natural identity. No import commit, durable provider replay, permissions, real identity, payment or runtime assertion."};
const fixtureText={"e10-minimal.csv": "Ref,Fecha,Sucursal,Ciudad,Shopper,Escenario,Honorario,Estado\nQA-E10-N1,01/04/2030,QA New Branch,QA City New,QA Shopper New,QA Scenario,11,disponible\nQA-E10-D1,02/04/2030,QA Duplicate Branch,QA City,QA Shopper Existing,QA Scenario,22,disponible\nQA-E10-C1,03/04/2030,QA Conflict Branch,QA City,QA Shopper Changed,QA Scenario,33,disponible\nQA-E10-X1,,QA Invalid Branch,QA City,,QA Scenario,44,disponible\n", "e10-reordered.tsv": "Honorario\tSucursal\tFecha\tEstado\tRef\tEscenario\tShopper\tCiudad\n11\tQA New Branch\t01/04/2030\tdisponible\tQA-E10-N1\tQA Scenario\tQA Shopper New\tQA City New\n22\tQA Duplicate Branch\t02/04/2030\tdisponible\tQA-E10-D1\tQA Scenario\tQA Shopper Existing\tQA City\n33\tQA Conflict Branch\t03/04/2030\tdisponible\tQA-E10-C1\tQA Scenario\tQA Shopper Changed\tQA City\n44\tQA Invalid Branch\t\tdisponible\tQA-E10-X1\tQA Scenario\t\tQA City\n"};
const read=name=>fixtureText[name];
const review={controlHeadRead:'266f764ae585d654300ff6fbfb618512a644437a',productSourceSha:'235d6c28e72226f792514656fd5c47c8ba65cbee',productSourceTree:'77b4de2c621560019ad043f22d90e75a508d2f79',originalTask:{acceptanceBindingSha256:'b74b83a1ebd1afeca4c420e64d476e811bf8d90d982abe4a1060a557b4bffa4f'}};
const plain=value=>JSON.parse(JSON.stringify(value)),hash=value=>createHash('sha256').update(value).digest('hex');
const deepFreeze=value=>{if(value&&typeof value==='object'){for(const item of Object.values(value))deepFreeze(item);Object.freeze(value);}return value;};
const effects={commitCalls:0,networkCalls:0,storageCalls:0,eventCalls:0,dataMutationCalls:0};
const blocked=name=>()=>{effects[name]++;throw Error('DISALLOWED_SOURCE_FIXTURE_EFFECT:'+name);};
const project=deepFreeze(plain(expected.project)),visits=deepFreeze(plain(expected.existingVisits));
const data=deepFreeze({currentPeriodId:project.id,_visitas:visits,shoppers:[],period:()=>project,addShopper:blocked('dataMutationCalls'),updateShopper:blocked('dataMutationCalls')});
const CX={data,bus:{emit:blocked('eventCalls')}};
const context=vm.createContext({CX,window:{CX},fetch:blocked('networkCalls'),XMLHttpRequest:blocked('networkCalls'),WebSocket:blocked('networkCalls'),localStorage:{getItem:blocked('storageCalls'),setItem:blocked('storageCalls'),removeItem:blocked('storageCalls')}},{codeGeneration:{strings:false,wasm:false}});
const ownerSources=[{path:'app/core/dedupe.js',localPath:dedupePath},{path:'app/core/importador.js',localPath:ownerPath}].map(owner=>({...owner,source:fs.readFileSync(owner.localPath,'utf8')}));
review.owners=ownerSources.map(({source,...owner})=>({...owner,sha256:hash(source),bytes:Buffer.byteLength(source)}));
for(const owner of ownerSources)vm.runInContext(owner.source,context,{filename:owner.path,timeout:1500});
// Commit is outside the requested probe and cannot be called accidentally.
Object.defineProperty(CX.importador,'commit',{value:blocked('commitCalls'),writable:false,configurable:false});
const inputHash=hash(JSON.stringify({project,visits,expected})),cases=[];
const record=(id,clause,expectedValue,operation)=>{
 let actual,pass=false,error=null;
 try{actual=plain(operation());assert.deepEqual(actual,expectedValue);pass=true;}
 catch(e){error={name:e.name,message:e.message};}
 cases.push({id,clause,expected:expectedValue,observed:actual??null,pass,error});return actual;
};
const importer=CX.importador,csv=read('e10-minimal.csv'),tsv=read('e10-reordered.tsv');
record('parse_csv','Existing E10 source/mapping traceability',{headers:expected.csv.headers,rows:expected.csv.rows,delim:expected.csv.delimiter},()=>importer.parse(csv));
record('parse_tsv_reordered','Existing E10 source/mapping traceability',{headers:expected.tsv.headers,rows:expected.tsv.rows,delim:expected.tsv.delimiter},()=>importer.parse(tsv));
record('auto_map_csv','Existing named-field autodetection; suggestions remain editable',expected.csv.map,()=>importer.autoMap(importer.parse(csv).headers));
record('auto_map_tsv_reordered','Existing named-field autodetection after reordering',expected.tsv.map,()=>importer.autoMap(importer.parse(tsv).headers));
record('build_with_explicit_csv_mapping','Existing supported manual column mapping',expected.candidates,()=>importer.build(importer.parse(csv),expected.csv.map,project));
record('build_with_explicit_reordered_mapping','Same existing fields under reordered columns',expected.candidates,()=>importer.build(importer.parse(tsv),expected.tsv.map,project));
const categories=result=>Object.fromEntries(['nuevos','dups','conflicts','discarded'].map(key=>[key,result[key].map(row=>row.ref)]));
record('dry_run_categories','Existing new/exact-duplicate/conflict/discarded categories',expected.diffRefs,()=>categories(importer.diff(importer.build(importer.parse(csv),expected.csv.map,project),project)));
record('repeat_dry_run_without_mutation','Repeated preview only; durable post-import replay is not claimed',{diff:expected.diffRefs,inputHash},()=>({diff:categories(importer.diff(importer.build(importer.parse(tsv),expected.tsv.map,project),project)),inputHash:hash(JSON.stringify({project,visits,expected}))}));
record('exact_normalized_fields','Existing field labels and accents retain canonical meaning',
 {0:'ref',1:'sucursal',2:'ciudad',3:'franja',4:'fecha',5:'shopper',6:'escenario',7:'honorario',8:'reembolso',9:'estado',10:'obs'},
 ()=>importer.autoMap([' Ref / Fila ','SUCURSAL','Ciudad','Franja','FÉCHA','Shopper','Escenario',' HÓNORARIO ','Reembolso','Estado','Observaciones']));
record('legacy_ui_sample_headers','Preserve exact sample already in app/modules/importador.js',
 {0:'ref',1:'fecha',2:'sucursal',3:'ciudad',4:'shopper',5:'escenario',6:'reembolso',7:'estado'},
 ()=>importer.autoMap(['Fila','Fecha Prog','Sucursal','Ciudad · Franja','Shopper','Compra','Combo','Estado']));
record('existing_alias_priority','An exact existing alias wins over another field substring',
 {0:'ciudad',1:'ref',2:'honorario',3:'fecha',4:'obs'},
 ()=>importer.autoMap(['Localidad','Num.','Honorario (Q)','Realizada','Observaciones']));
record('short_alias_tokens_and_legacy_full_forms','Keep existing abbreviations and full forms while preventing embedded short aliases',
 {positive:['ref','ref','ref','ref','ref','fecha','franja','honorario','obs','ref','ref','ref','ref','ref','ref'],negative:[null,null,null]},
 ()=>({positive:['No.','ID de visita','Núm. de fila','Ref. visita','#','Día programado','WK','Fee','Obs.','Referencia','Número','Identificador','Referencia de visita','Número de fila','Identificador visita'].map(h=>importer.autoMap([h])[0]||null),negative:['Nombre','Cantidad','Sino'].map(h=>importer.autoMap([h])[0]||null)}));
record('one_column_per_field','Keep first-column ownership when two headers mean the same field',
 {0:'honorario',2:'ref'},()=>importer.autoMap(['Honorario','Pago','Ref','Fila']));
// Insert beside the existing record(...) calls in the E10 source proof.
// Uses its existing importer, project and record bindings. Synthetic preview only.
record('legacy_fee_headers_preserve_amount','Preserve existing non-reference fee aliases and constructed amount',
 ['Fee','Fees','Fees (TST)'].map(header=>({header,mapping:{0:'ref',1:'honorario',2:'sucursal',3:'fecha',4:'estado'},ref:'QA-E10-FEE',honorario:22})),
 ()=>['Fee','Fees','Fees (TST)'].map(header=>{
   const parsed=importer.parse('Ref,'+header+',Sucursal,Fecha,Estado\nQA-E10-FEE,22,QA Fee Branch,2030-04-02,disponible');
   const mapping=importer.autoMap(parsed.headers),candidate=importer.build(parsed,mapping,project)[0];
   return {header,mapping,ref:candidate.ref,honorario:candidate.honorario};
 }));

record('zero_effects','No import commit,network,storage,event or data mutation',{commitCalls:0,networkCalls:0,storageCalls:0,eventCalls:0,dataMutationCalls:0},()=>effects);
const autoMapConsequences=Object.fromEntries([['csv',csv],['tsv',tsv]].map(([kind,text])=>{
 const parsed=importer.parse(text),mapping=importer.autoMap(parsed.headers),candidates=importer.build(parsed,mapping,project);
 return [kind,{mapping:plain(mapping),refs:candidates.map(x=>x.ref),honorarios:candidates.map(x=>x.honorario),diffRefs:categories(importer.diff(candidates,project))}];
}));
for(const kind of ['csv','tsv'])record('auto_mapping_identity_money_'+kind,'Original E10 identity,amount and dry-run category expectations',
 {refs:expected.candidates.map(x=>x.ref),honorarios:expected.candidates.map(x=>x.honorario),diffRefs:expected.diffRefs},
 ()=>{const {refs,honorarios,diffRefs}=autoMapConsequences[kind];return {refs,honorarios,diffRefs};});
const result={schemaVersion:'cxorbia.i3.e10.focal-auto-map-proof.v1',observedAt:new Date().toISOString(),iteration:'I3',state:'HOLD',scope:'LOCAL_SOURCE_ONLY_NO_COMMIT_NO_PROVIDER_NO_RUNTIME_CERTIFICATION',referenceControlHead:review.controlHeadRead,referenceProductSourceSha:review.productSourceSha,referenceProductSourceTree:review.productSourceTree,sourceBindingScope:'Exact owner hashes below identify the code executed; reference source is the unmodified comparison baseline, not a commit identity for the patched copy',nodeVersion:process.version,owners:review.owners,cases,passed:cases.filter(x=>x.pass).length,failed:cases.filter(x=>!x.pass).length,autoMapConsequences,effects,originalTaskAcceptanceBindingSha256:review.originalTask.acceptanceBindingSha256,classification:cases.every(x=>x.pass)?'LOCAL_SOURCE_FIX_VALIDATED':'MAPPING_FAILURE',severity:'NOT_ASSIGNED_SOURCE_OBSERVATION_REQUIRES_OWNER_REVIEW',operationalPass:false,durableImportReplayProven:false,permissionsProven:false,newDomainMatches:0,phaseAComplete:false,production:false};
if(outputPath)fs.writeFileSync(outputPath,JSON.stringify(result,null,2)+'\n');
process.stdout.write(JSON.stringify({state:result.state,classification:result.classification,passed:result.passed,failed:result.failed,failingCases:cases.filter(x=>!x.pass).map(x=>x.id),effects},null,2)+'\n');
process.exitCode=result.failed?1:0;
