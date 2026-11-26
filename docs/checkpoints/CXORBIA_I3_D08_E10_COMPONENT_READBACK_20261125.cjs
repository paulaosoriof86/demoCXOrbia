/* Run from the canonical repository with node <script> <output.json>. Offline Chromium.
   Providers and Firebase Auth are intentionally absent. Each page starts with detached QA state. */
const {readFileSync,writeFileSync}=require('node:fs');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const sha=v=>createHash('sha256').update(v).digest('hex');
const source='d727f3be67a4430f08216dbb37cccba790f934f5';
const gitFile=file=>execFileSync('git',['show',source+':'+file],{maxBuffer:4e6});
const fixtureSource=gitFile('tools/qa/cxorbia-i3-e10-importer-mapping-proof.mjs').toString();
const fixture=JSON.parse(fixtureSource.match(/^const expected=(.+);$/m)[1]);
const catalog=JSON.parse(gitFile('backend/contracts/cxorbia-academy-base-progress-contract-v1.json')).courses;
const files=['core/config.js','core/store.js','core/ui.js','core/permissions.js','core/router.js','core/dedupe.js','core/importador.js','modules/importador.js','core/manuales-data.js','modules/academia.js'];
const sources=files.map(f=>gitFile('app/'+f));
const paired='docs/checkpoints/CXORBIA_I3_E10_SERVED_MAPPING_5670F782_20261125.json';
const control='d8c64eab7ae07997f29e9005290748380ea967a2';
const served=JSON.parse(execFileSync('git',['show',control+':'+paired],{encoding:'utf8'}));
const assets=Object.fromEntries(files.map((file,i)=>{
  const hash=sha(sources[i]),record=served.publicReadback.files.find(f=>f.path===file);
  const prior=record?.observedSha256||served.rendered.assets[file.replaceAll('/','_')];
  if(prior)assert.equal(hash,prior);
  return [file,{sha256:hash,servedReadbackMatched:!!prior}];
}));
async function main(){
  const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
  const result={iteration:'I3',state:'HOLD',source,control,observedAt:new Date().toISOString(),node:process.version,playwright:require('playwright/package.json').version,scriptSha256:sha(readFileSync(__filename)),scope:'OFFLINE_CHROMIUM_SYNTHETIC_ROLE_CONTEXTS_NO_FIREBASE_AUTH_OR_REMOTE_PROVIDER',chromium:browser.version(),assets,d08:[],e10:{},networkRequests:[],pageErrors:[]};
  async function openPage(role){
    const page=await browser.newPage();
    page.setDefaultTimeout(4500);
    await page.route('**/*',route=>{result.networkRequests.push(route.request().method());return route.abort();});
    page.on('pageerror',e=>result.pageErrors.push(e.message));
    await page.setContent('<!doctype html><html lang="es"><body><header id="crumb"></header><main id="view"></main></body></html>');
    for(const source of sources)await page.addScriptTag({content:source.toString()});
    await page.evaluate(({role,fixture})=>{
      const uid='qa-local-'+role,scope={role,actorId:uid,projectId:fixture.project.id,projectIds:[fixture.project.id],tenantId:'qa-local'};
      Object.assign(CX.session,{role,user:{role},view:null});
      CX.data={_visitas:structuredClone(fixture.existingVisits),visitas(){return this._visitas;},shoppers:[{id:'qa-new',nombre:'QA Shopper New',ciudad:'QA City New',pais:'GT'}],period:()=>fixture.project,currentProjectId:fixture.project.id,currentPeriodId:fixture.project.id,ctx:()=>scope,__academyState:{tenantId:scope.tenantId,courses:[],categories:[],progressOwnerUid:uid,progress:{ownerUid:uid,courses:{},version:0}}};
      CX.cxDataCommandBoundary={canonicalMode:()=>true,context:()=>scope};
      CX.backendAuth={context:()=>scope};
      window.__qaCommands=0;
      CX.commandAdapter={execute(){window.__qaCommands++;throw new Error('Unexpected provider command in offline read');}};
    },{role,fixture});
    return page;
  }
  const nav=(p,id)=>p.evaluate(id=>CX.router.nav(id,{history:false,remember:false}),id);
  async function importPreview(p){
    await nav(p,'importador');
    assert.equal(await p.evaluate(()=>CX.session.view),'importador');
    await p.locator('[data-tab="hr"]').click();
    const {headers,rows,delimiter}=fixture.csv;
    await p.locator('#hrTxt').fill([headers,...rows].map(row=>row.join(delimiter)).join('\n'));
    await p.locator('#hrDetect').click();
    await p.locator('#hrNext2').click();
    return p.locator('#tab-body table tbody tr').evaluateAll(rr=>rr.map(row=>({ref:row.cells[0].innerText,status:row.cells[7].innerText})));
  }
  try{
    const page=await openPage('admin');
    const first=await importPreview(page);
    const count=p=>p.evaluate(()=>CX.data._visitas.length);
    const before=await count(page);await page.locator('#hrCommit').click();
    const feedback=await page.locator('#cx-toasts').innerText();
    assert.match(feedback,/preview.*import real pendiente de backend/);
    assert.equal(await count(page),before+1);
    const replay=await importPreview(page);
    assert.match(replay.find(x=>x.ref==='QA-E10-N1').status,/Dup/i);
    const fresh=await openPage('admin');
    const freshRows=await importPreview(fresh);
    assert.equal(await count(fresh),before);
    assert.equal(freshRows.find(x=>x.ref==='QA-E10-N1').status,'Nuevo');
    assert.equal(await page.evaluate(()=>window.__qaCommands),0);
    result.e10={originalFixtureSource:'tools/qa/cxorbia-i3-e10-importer-mapping-proof.mjs',route:'importador',button:'hrCommit',first,replay,freshRows,beforeRows:before,afterLocalRows:before+1,freshLocalRows:before,toasts:feedback,commandAdapterCalls:0,providerAckObserved:false,confirmedRemoteImports:0,actualRemoteAuthenticatedAttempt:false};
    await page.close();await fresh.close();
    for(const [role,courseId] of [['shopper','s_ruta'],['cliente','cl_ruta']]){
      const p=await openPage(role);await nav(p,'importador');
      assert.notEqual(await p.evaluate(()=>CX.session.view),'importador');
      await nav(p,'aprendizaje');
      const selected=catalog.find(x=>x.audience===role&&x.courseId===courseId);
      const card=p.locator('[data-course="'+courseId+'"]');assert.match(await card.innerText(),/Comenzar/);
      const cards=await p.locator('[data-course]').evaluateAll(nodes=>nodes.map(n=>n.dataset.course));
      assert(!cards.includes(role==='shopper'?'cl_ruta':'s_ruta'));
      assert.equal(await p.locator('#acadNew,.acad-edit,#acadAud').count(),0);
      const manual=await p.evaluate(role=>CX.manualesData.MANUALES.find(m=>m.rol===role&&m.secciones.length>1).id,role);
      await p.locator('#acadManuales').click();
      const offeredManuals=await p.locator('.manualPick').evaluateAll(nodes=>nodes.map(n=>n.dataset.mid));
      assert(offeredManuals.includes(manual));
      await p.locator('.manualPick[data-mid="'+manual+'"]').click();
      const firstSection=await p.locator('.acad-content').innerText();
      await p.locator('#mNext').click();const second=await p.locator('.acad-content').innerText();
      assert(firstSection.trim().length>80&&second.trim().length>80&&firstSection!==second);
      await nav(p,'aprendizaje');await p.locator('[data-course="'+courseId+'"]').click();
      const lessonData=[];
      for(const lesson of selected.lessons){
        await p.locator('[data-li="'+lesson.id+'"]').click();
        if(lesson.quiz.length){
          assert.equal(await p.locator('.acad-question').count(),lesson.quiz.length);assert(await p.locator('#finQuiz').isDisabled());
          await p.locator('.acad-verify[data-qi="0"]').click();assert(await p.locator('#finQuiz').isDisabled());
          for(const [i,q] of lesson.quiz.entries()){
            await p.locator('input[name="q'+i+'"][value="'+q.answer+'"]').check();await p.locator('.acad-verify[data-qi="'+i+'"]').click();
            assert.match(await p.locator('#fb'+i).innerText(),/Correcto/);
          }
          assert(await p.locator('#finQuiz').isEnabled());
          lessonData.push({id:lesson.id,questions:lesson.quiz.length,incompleteBlocked:true,allReviewedEnabled:true});
        }else{
          const content=await p.locator('.acad-content').innerText();assert(content.trim().length>80);lessonData.push({id:lesson.id,textSha256:sha(content),characters:content.length});
        }
      }
      assert.equal(await p.evaluate(()=>window.__qaCommands),0);
      result.d08.push({role,courseId,visibleCourses:cards,manual,offeredManuals,manualSections:[sha(firstSection),sha(second)],lessonData,importerRouteDeniedInUi:true,courseManagementControlsAbsent:true,commandAdapterCalls:0});
      await p.close();
    }
    const contractPath='backend/contracts/hr-import-control-phase-a-v1.json';
    const adapterPath='backend/adapters/hr-import-control-adapter.preview.mjs';
    const contractBytes=gitFile(contractPath);
    const contract=JSON.parse(contractBytes);
    assert.equal(contract.status,'draft_safe_not_connected');
    assert.equal(contract.safeState.importWritesEnabled,false);
    const adapterBytes=gitFile(adapterPath);
    const {createHrImportControlAdapter}=await import('data:text/javascript;base64,'+adapterBytes.toString('base64'));
    const scope={tenantId:'qa-local',projectId:fixture.project.id,actorId:'qa-local-admin',role:'admin'};
    const descriptor={importRunId:'QA-E10',hrSourceId:'qa-local',mode:'dry_run',sourcePeriodFrom:'2030-04',sourcePeriodTo:'2030-04',auditRef:'qa-local'};
    const draft=createHrImportControlAdapter({scope});
    await assert.rejects(draft.saveImportRun(descriptor),{code:'HR_IMPORT_WRITE_GATE_BLOCKED'});
    const sentinel=new Proxy({},{get(){throw new Error('Preview adapter attempted storage access');}});
    const preview=createHrImportControlAdapter({scope,firestore:sentinel,options:{allowImportWrites:true}});
    const saved=await preview.saveImportRun(descriptor);
    assert.equal(saved.pendingImplementation,true);
    result.e10.historicalAlternative={contract:contractPath,contractSha256:sha(contractBytes),contractStatus:contract.status,connectedToFrontend:contract.safeState.frontendConnected,adapter:adapterPath,adapterSha256:sha(adapterBytes),defaultGate:'HR_IMPORT_WRITE_GATE_BLOCKED',disposableProbeWithFakeStore:'pendingImplementation',storeCalls:0,approvedDurableBindingLocatedInClassicRoute:false};
    result.d08LiveAuthority={request:'docs/checkpoints/CXORBIA_I3_D08_UI_GOOGLE_PAIRED_5670F782_REQUEST_20261125.json',requestBlob:'1250fc8b1997f83eb71a0afda10bb8e826434368',scope:'Actual signed Firebase sessions, protected context, provider ACK, independent reads, replay, denials and exact cleanup remain part of the existing live request.'};
    result.next='Retain the authenticated Academia run bound to the actual served DEV pair. Confirm the previously approved E10 durable import owner and action semantics before connecting any new writer. Repeat the synthetic import through an authenticated operational route only when its scoped remote command is available.';
    assert.deepEqual(result.pageErrors,[]);assert.deepEqual(result.networkRequests,[]);
    result.newLiveClauses=0;result.production=false;
    writeFileSync(process.argv[2],JSON.stringify(result,null,2)+'\n');
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
