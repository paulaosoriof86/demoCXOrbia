#!/usr/bin/env node
/* I3 / RUN2382 — fenced DEV-only, temporary-identity provider certification.
 * The only writes are explicitly tagged disposable QA members, Auth accounts,
 * visit/application fixtures and their exact command receipts, audits/notices.
 * Never touches an HR row, a real visitor, an existing learner or production.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

async function runClientCollaborationQa(){
  const e=process.env,s=v=>String(v??'').trim(),hash=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
  const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
  const check=(yes,code)=>{if(!yes)throw Error(code);};
  const runId=s(e.GITHUB_RUN_ID),attempt=s(e.GITHUB_RUN_ATTEMPT||'1'),sourceSha=s(e.FOCAL_SOURCE),sourceTree=s(e.FOCAL_TREE);
  const projectName=s(e.PROJECT),tenantId=s(e.TENANT_ID),projectId=s(e.PROJECT_ID),host=s(e.HOSTING_URL).replace(/\/$/,'');
  const out=s(e.QA_OUT),expectedHr=s(e.EXPECTED_HR_REVISION),tag='qa_f09_'+runId+'_'+attempt;
  check(e.CXORBIA_I3_QA_ISOLATED_WRITE_GATE==='PAULA_AUTHORIZED_F09_DEV_ONLY'&&projectName==='cxorbia-backend-dev'&&host==='https://cxorbia-backend-dev.web.app'&&tenantId&&projectId&&out&&/^\d{8,}$/.test(runId)&&/^[a-f0-9]{40}$/.test(sourceSha)&&/^[a-f0-9]{40}$/.test(sourceTree)&&/^[a-f0-9]{64}$/.test(expectedHr),'SOURCE_FAILURE:F09_SCOPE_GATE_DENIED');
  fs.mkdirSync(out,{recursive:true});
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:projectName});
  const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId),project=tenant.collection('projects').doc(projectId);
  const result={schemaVersion:'cxorbia.i3.f09.client-collaboration-live.v1',decision:'HOLD',sourceSha,sourceTree,runId,runAttempt:attempt,production:false,tenantId,projectId,periodId:null,
    runtimeRevision:s(e.DEV_REVISION),runtimeDigest:s(e.RUNTIME_DIGEST),hostingVersion:s(e.HOSTING_VERSION_NAME),hrBefore:null,hrAfter:null,
    ui:{},readback:{},creationJournal:[],identities:[],cleanup:{ok:false},safety:{hrWrites:0,realMemberWrites:0,calendarCalls:0,emailCalls:0,paymentWrites:0,productionDeploys:0}};
  const save=()=>fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');save();
  const request=async(url,options={})=>{const r=await fetch(url,{...options,signal:AbortSignal.timeout(90000)});const b=await r.json().catch(()=>({}));return {http:r.status,...b};};
  const hrMeta=()=>request(host+'/api/'+encodeURIComponent(tenantId)+'/'+encodeURIComponent(projectId)+'/hr-live?format=meta&f09='+runId+'-'+Date.now(),{headers:{'cache-control':'no-cache, no-store'}});
  const planned=[['a','cliente'],['b','cliente'],['admin','admin']].map(([label,role])=>({uid:tag+'_'+label,label,role,name:'QA F09 '+runId+' '+label,memberPath:tenant.collection('users').doc(tag+'_'+label).path}));
  const contexts=[],records=new Map();let browser=null,periodId='',periodIds=[],projectBefore='',periodBefore='',productionBefore='';
  const authIdentity=user=>({uid:user.uid,displayName:user.displayName||'',disabled:user.disabled,email:user.email||null,emailVerified:user.emailVerified,phoneNumber:user.phoneNumber||null,photoURL:user.photoURL||null,creationTime:user.metadata.creationTime,providerData:user.providerData||[],mfa:user.multiFactor?.enrolledFactors||[]});
  const getPeriod=async()=>{
    const h=await request(host+'/api/'+encodeURIComponent(tenantId)+'/'+encodeURIComponent(projectId)+'/hr-live?format=json&f09='+runId,{headers:{'cache-control':'no-cache, no-store'}});
    const snap=h.snapshot||h.data||h,key=s(snap.source?.currentCalendarPeriodKey),p=(snap.periods||[]).find(x=>s(x.key||x.periodKey)===key);
    check(h.http===200&&p?.id&&key&&snap.sourceSafe===true&&snap.imported===false&&snap.tenantId===tenantId&&snap.projectId===projectId&&p.projectId===projectId&&h._runtime?.revision===expectedHr&&h._runtime?.cacheOrigin==='runtime_refresh','SOURCE_FAILURE:F09_ACTIVE_HR_PERIOD_MISSING');
    result.hrPeriodAuthority={id:s(p.id),key,sourceRevision:h._runtime.revision,authority:'current_server_hr_snapshot'};return s(p.id);
  };
  function commandPaths(c,uid){
    const kind={'client.nps.submit':'nps','client.note.create':'note','client.meeting.request':'meeting'}[c.commandType];
    check(kind&&c.tenantId===tenantId&&c.projectId===projectId&&c.periodId===periodId,'SOURCE_FAILURE:F09_COMMAND_SCOPE');
    const rid=hash(`${tenantId}\0${projectId}\0${periodId}\0${c.idempotencyKey}`).slice(0,40);
    const id='client-'+kind+'-'+hash([tenantId,projectId,periodId,uid,c.commandType,c.idempotencyKey]).slice(0,32);
    return {uid,kind,id,commandDigest:hash(stable(c)),command:c,entityPath:tenant.collection('bulletins').doc(id).path,receiptPath:tenant.collection('commandReceipts').doc(rid).path,auditPath:tenant.collection('entityAuditTrail').doc('client-'+rid).path};
  }
  async function track(c,uid){
    const record=commandPaths(c,uid),old=records.get(record.receiptPath);
    if(old){check(old.uid===uid&&old.commandDigest===record.commandDigest,'SOURCE_FAILURE:F09_REPLAY_PLAN_CHANGED');return old;}
    const existing=await Promise.all([record.entityPath,record.receiptPath,record.auditPath].map(p=>db.doc(p).get()));
    check(existing.every(x=>!x.exists),'SOURCE_FAILURE:F09_ENTITY_COLLISION');
    records.set(record.receiptPath,record);result.creationJournal.push(record);save();return record;
  }
  function ownedEntity(row,record){
    const fields={nps:['score','comment'],note:['subject','detail'],meeting:['subject','date','time','mode']}[record.kind];
    return row&&row.id===record.id&&row.entityType==='client_collaboration'&&row.status==='active'&&row.collaborationStatus==='pending'&&row.createdBy===record.uid&&row.idempotencyKey===record.command.idempotencyKey&&row.requesterUid===record.uid&&row.tenantId===tenantId&&row.projectId===projectId&&row.periodId===periodId&&row.kind===record.kind&&row.version===1&&row.requesterName===planned.find(x=>x.uid===record.uid)?.name&&fields.every(k=>record.command.payload[k]===undefined?row[k]===undefined:row[k]===(typeof record.command.payload[k]==='string'?s(record.command.payload[k]):record.command.payload[k]));
  }
  async function verifyRecord(record,ack){
    check(ack?.ok===true&&ack.providerAck===true&&ack.status==='committed'&&ack.readbackVerified===true&&ack.actorUid===record.uid&&ack.entityId===record.id&&ack.tenantId===tenantId&&ack.projectId===projectId&&ack.periodId===periodId,'PERSISTENCE_FAILURE:F09_PROVIDER_ACK');
    const [entity,receipt,audit]=await Promise.all([record.entityPath,record.receiptPath,record.auditPath].map(p=>db.doc(p).get()));
    const r=entity.data(),c=receipt.data(),a=audit.data();
    check(entity.exists&&receipt.exists&&audit.exists&&r.requesterUid===record.uid&&r.tenantId===tenantId&&r.projectId===projectId&&r.periodId===periodId&&r.version===1&&r.kind===record.kind&&r.actionRoute==='tablon'&&JSON.stringify(r.targetUserIds)===JSON.stringify([record.uid])&&r.targetAll!==true&&!(r.targetProjectIds||[]).length&&c.actorUid===record.uid&&c.commandDigest===record.commandDigest&&c.entityId===record.id&&a.actorUid===record.uid&&a.idempotencyKey===record.command.idempotencyKey,'PERSISTENCE_FAILURE:F09_INDEPENDENT_READBACK');
    check(ownedEntity(r,record),'PERSISTENCE_FAILURE:F09_ENTITY_PAYLOAD_DRIFT');
    for(const [field,value] of [['entitySha256',r],['receiptSha256',c],['auditSha256',a]]){const digest=hash(stable(value));check(!record[field]||record[field]===digest,'PERSISTENCE_FAILURE:F09_REPLAY_READBACK_CHANGED');record[field]=digest;}
    return {entityId:record.id,kind:record.kind,providerAck:true,readbackVerified:true,actorExact:true,version:1,receiptAndAudit:true,privateRecipient:true};
  }
  try{
    const initial=await hrMeta();check(initial.http===200&&initial.revision===expectedHr&&initial.hrWrites===false&&initial.production===false,'PROVIDER_FAILURE:F09_HR_PREFLIGHT');result.hrBefore=initial.revision;
    productionBefore=hash(await (await fetch('https://tya-plataforma.web.app/',{cache:'no-store'})).text());
    periodId=await getPeriod();result.periodId=periodId;
    periodIds=[...new Set([periodId,result.hrPeriodAuthority.key])];
    const pr=await project.get(),periodDocs=await Promise.all(periodIds.map(id=>project.collection('periods').doc(id).get())),present=periodDocs.filter(x=>x.exists);
    check(pr.exists&&pr.data().tenantId===tenantId&&present.length<=1&&present.every(x=>(x.data().tenantId===undefined||x.data().tenantId===tenantId)&&(x.data().projectId===undefined||x.data().projectId===projectId)),'SOURCE_FAILURE:F09_EXACT_PROJECT_PERIOD_REQUIRED');
    check([pr.data(),...present.map(x=>x.data())].every(x=>x.active!==false&&['status','state'].every(k=>!['inactive','deleted','closed','archived','inactivo','cerrado','archivado'].includes(s(x[k]).toLowerCase()))),'SOURCE_FAILURE:F09_PERIOD_NOT_WRITABLE');
    const mode=s(pr.data().operationalSource?.mode||pr.data().routeSource?.mode||pr.data().routeSource);
    check(present.length||!mode||mode==='external','SOURCE_FAILURE:F09_EXTERNAL_PERIOD_AUTHORITY_REQUIRED');
    projectBefore=hash(stable(pr.data()));periodBefore=hash(stable(periodDocs.map(x=>({id:x.id,exists:x.exists,data:x.exists?x.data():null}))));
    result.preflight={exactProject:true,exactPeriod:true,periodAuthority:present.length?'project_period_metadata':'current_server_hr_snapshot',projectSourceMode:mode||'server_hr_exact_scope_legacy_metadata_absent',projectSha256:projectBefore,periodSha256:periodBefore};
    const canonicalAdminProjects=(await tenant.collection('projects').select('deleted').get()).docs.filter(x=>x.data().deleted!==true).map(x=>x.id).sort();
    check(canonicalAdminProjects.includes(projectId),'SOURCE_FAILURE:F09_ADMIN_CANONICAL_PROJECT_SCOPE');
    for(const identity of planned){
      check(!(await db.doc(identity.memberPath).get()).exists,'SOURCE_FAILURE:F09_MEMBER_COLLISION');
      try{await auth.getUser(identity.uid);throw Error('SOURCE_FAILURE:F09_AUTH_COLLISION');}catch(error){if(error.code!=='auth/user-not-found')throw error;}
    }
    result.identities=planned.map(x=>({...x,state:'PLANNED_ABSENT'}));save();
    for(const identity of planned){
      const claims={tenantId,projectIds:identity.role==='admin'?canonicalAdminProjects:[projectId],role:identity.role,authNamespace:'staff',qaSynthetic:true,qaRunId:runId,qaRunAttempt:attempt,qaPurpose:'F09'};
      const entry=result.identities.find(x=>x.uid===identity.uid);
      entry.expectedClaims=claims;entry.state='AUTH_CREATE_DISPATCHED';save();
      const created=await auth.createUser({uid:identity.uid,displayName:identity.name,disabled:false});
      entry.authIdentity=authIdentity(created);entry.state='AUTH_CREATED';save();
      entry.state='CLAIMS_DISPATCHED';save();
      await auth.setCustomUserClaims(identity.uid,claims);
      entry.memberCreateDispatched=true;save();
      const staffMembership=identity.role==='admin'?{
        entitlementMode:'TYA_COMPLETE',
        claimsDigest:hash({authNamespace:'staff',projectIds:[...new Set(claims.projectIds)].sort(),role:identity.role,tenantId}),
        providerUidFingerprint:hash('cxorbia-provider-uid-v1\0'+identity.uid)
      }:{};
      const member={uid:identity.uid,...claims,name:identity.name,active:true,status:'active',...staffMembership};
      entry.expectedMembershipSha256=hash(stable(member));save();
      await db.doc(identity.memberPath).create(member);
      const persistedMember=await db.doc(identity.memberPath).get();
      check(persistedMember.exists&&JSON.stringify(stable(persistedMember.data()))===JSON.stringify(stable(member)),'AUTH_FAILURE:F09_CREATED_MEMBERSHIP_READBACK');
      const read=await auth.getUser(identity.uid);check(JSON.stringify(stable(read.customClaims||{}))===JSON.stringify(stable(claims)),'AUTH_FAILURE:F09_CREATED_IDENTITY_READBACK');
      check(JSON.stringify(stable(entry.authIdentity))===JSON.stringify(stable(authIdentity(read))),'AUTH_FAILURE:F09_CREATED_IDENTITY_CHANGED');entry.state='CREATED_VERIFIED';save();
    }
    const {chromium}=await import('playwright');browser=await chromium.launch({headless:true});
    const url=host+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId='+encodeURIComponent(projectId)+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
    async function session(identity){
      const ctx=await browser.newContext({viewport:{width:1440,height:1000}});contexts.push(ctx);const page=await ctx.newPage();
      const redact=v=>String(v??'').replace(/Bearer\s+\S+|eyJ[A-Za-z0-9_.-]+/g,'[TOKEN]').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[EMAIL]').replace(/(https?:\/\/[^\s?#]+)[?#][^\s]*/g,'$1').slice(0,700);
      const diagnostic={label:identity.label,role:identity.role,stage:'OPENING',network:[],pageErrors:[]};
      (result.sessionDiagnostics??=[]).push(diagnostic);save();
      page.on('pageerror',error=>{if(diagnostic.pageErrors.length<20)diagnostic.pageErrors.push(redact(error.message));});
      page.on('requestfailed',r=>{if(diagnostic.network.length<80)diagnostic.network.push({path:new URL(r.url()).pathname,error:redact(r.failure()?.errorText)});});
      page.on('response',r=>{const u=new URL(r.url());if(diagnostic.network.length<80&&(/\/api\/.*\/hr-live|\/v1\/cxorbia\//.test(u.pathname)||r.status()>=400))diagnostic.network.push({path:u.pathname,status:r.status()});});
      const capture=async()=>{
        diagnostic.observed=await page.evaluate(({uid,role,tenantId,projectId,periodId,hr})=>{
          const w=window,a=w.CX?.backendAuth?.context?.()||{},p=w.CX_BACKEND_AUTHORIZED_STATE?.principal||{},g=w.CX_C6_HR_AUTHORITY_GATE||{},d=w.CX?.data||{},h=w.CX_PROTECTED_AUTH_HR_AUTHORITY||{};
          const clean=v=>String(v??'').replace(/Bearer\s+\S+|eyJ[A-Za-z0-9_.-]+/g,'[TOKEN]').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[EMAIL]').replace(/(https?:\/\/[^\s?#]+)[?#][^\s]*/g,'$1').slice(0,500);
          const pick=(o,keys)=>Object.fromEntries(keys.filter(k=>o&&['string','number','boolean'].includes(typeof o[k])).map(k=>[k,typeof o[k]==='string'?clean(o[k]):o[k]]));
          const predicates={authenticated:a.authenticated===true,role:a.role===role,namespace:a.authNamespace==='staff',tenant:a.tenantId===tenantId,firebaseActor:w.firebase?.auth?.().currentUser?.uid===uid,principalActor:p.actorUid===uid,principalRole:p.role===role,principalTenant:p.tenantId===tenantId,hrApplied:h.applied===true,gateReady:g.ready===true,gateNotBlocked:!g.blocked,project:d.currentProjectId===projectId,period:d.currentPeriodId===periodId,hrRevision:d.previewMeta?.sourceRevision===hr};
          const visible=id=>{const x=document.getElementById(id);return !!x&&getComputedStyle(x).display!=='none'&&getComputedStyle(x).visibility!=='hidden'&&x.getClientRects().length>0;};
          return {predicates,failedPredicates:Object.keys(predicates).filter(k=>!predicates[k]),
            expected:{role,tenantId,projectId,periodId,sourceRevision:hr},auth:pick(a,['authenticated','role','authNamespace','tenantId','projectId']),principal:pick(p,['role','authNamespace','tenantId','projectId']),
            data:pick(d,['currentProjectId','currentPeriodId','__liveHrSourceRevision']),preview:pick(d.previewMeta,['sourceRevision','sourceRef','status']),
            gate:pick(g,['ready','blocked','reason','error','status','projectId','periodId','sourceRevision']),
            authority:{...pick(h,['applied','error','retryable','role','tenantId','projectId','sourceRevision','atomicPublication']),actorMatches:h.actorUid===uid},
            reconcile:pick(w.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE,['attempts','attempt','authorized','protectedBackendReady','runtimeDependenciesReady','exhausted','lastAuthorityError','status']),
            adminWiring:pick(w.CX_C6_LIVE_USER_ADMIN_WIRING,['status','code']),adminHandoff:pick(w.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF,['status','error','appOn','loginHidden']),
            backendState:{...pick(w.CX_BACKEND_LAST_STATE,['status','phase','error','code','source','empty','sourceRef','tenantId','projectId']),counts:Object.fromEntries(Object.entries(w.CX_BACKEND_LAST_STATE?.counts||{}).filter(([,v])=>Number.isFinite(v)))},
            backendScope:{...pick(w.CX_BACKEND_PROJECT_SCOPE,['status','error','tenantId','projectId','mode','role','totalProjectRecords']),selectedProjectPresent:(w.CX_BACKEND_PROJECT_SCOPE?.activeProjectIds||[]).includes(projectId)},dataSource:pick(w.CX?.dataSource,['status','error','sourceRef','sourceRevision','projectId','periodId']),
            session:pick(w.CX?.session,['role','view','projectId','periodId']),appVisible:visible('app'),loginVisible:visible('login'),gateText:clean(document.querySelector('[data-cx-human-authority-gate]')?.textContent)};
        },{uid:identity.uid,role:identity.role,tenantId,projectId,periodId,hr:expectedHr}).catch(error=>({captureError:redact(error.message)}));save();
      };
      try{
      for(let i=0;i<3;i++){
        await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await page.waitForFunction(()=>window.firebase?.apps?.length>0,null,{timeout:90000});
        const token=await auth.createCustomToken(identity.uid);
        try{await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithCustomToken(t);},token);}catch(error){if(!/context was destroyed|navigation|network|interrupted/i.test(String(error)))throw error;}
        await page.waitForLoadState('domcontentloaded');if(await page.evaluate(uid=>window.firebase?.auth?.().currentUser?.uid===uid,identity.uid).catch(()=>false))break;
      }
      await page.goto('about:blank');await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(uid=>window.firebase?.auth?.().currentUser?.uid===uid&&typeof window.CX?.backendAuth?.ensureAuthenticated==='function',identity.uid,{timeout:90000});
      await page.evaluate(()=>CX.backendAuth.ensureAuthenticated());
      diagnostic.stage='AUTHENTICATED_WAITING_OPERATIONAL_CONTEXT';save();
      await page.waitForFunction(({uid,role,tenantId,projectId,periodId,hr})=>{
        const a=CX.backendAuth.context()||{},p=window.CX_BACKEND_AUTHORIZED_STATE?.principal||{},g=window.CX_C6_HR_AUTHORITY_GATE||{},d=CX.data;
        return a.authenticated===true&&a.role===role&&a.authNamespace==='staff'&&a.tenantId===tenantId&&firebase.auth().currentUser?.uid===uid&&p.actorUid===uid&&p.role===role&&p.tenantId===tenantId&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&!g.blocked&&d.currentProjectId===projectId&&d.currentPeriodId===periodId&&d.previewMeta?.sourceRevision===hr;
      },{uid:identity.uid,role:identity.role,tenantId,projectId,periodId,hr:expectedHr},{timeout:150000});
      diagnostic.stage='READY';await capture();
      return {ctx,page};
      }catch(error){diagnostic.failedAt=diagnostic.stage;diagnostic.stage='FAILED';diagnostic.error=redact(error.message);await capture();const gate=page.locator('[data-cx-human-authority-gate]').first();if(await gate.count())await gate.screenshot({path:out+'/session-'+identity.label+'-gate.png',timeout:5000}).catch(()=>{});save();throw error;}
    }
    const a=await session(planned[0]);let dropNoteAck=true,droppedResolve;
    const droppedPromise=new Promise(resolve=>{droppedResolve=resolve;});
    await a.page.route('**/v1/cxorbia/commands',async route=>{
      const c=route.request().postDataJSON();if(!String(c?.commandType||'').startsWith('client.'))return route.continue();
      try{
        const record=await track(c,planned[0].uid);
        if(c.commandType==='client.note.create'&&dropNoteAck){
          dropNoteAck=false;const response=await route.fetch({timeout:90000}),ack=await response.json();
          result.ui.noteCommittedBeforeAckLoss=await verifyRecord(record,ack);save();await route.abort('failed');droppedResolve(true);return;
        }
        await route.continue();
      }catch(error){result.interceptionError=String(error?.message||error);save();await route.abort('failed').catch(()=>{});droppedResolve(false);}
    });
    await a.page.evaluate(()=>CX.router.nav('cli_insights'));
    await a.page.waitForFunction(()=>document.body.innerText.includes('0 respuesta(s)'));
    const noteSubject='QA F09 '+runId+' nota',noteDetail='Detalle verificable de la solicitud',meetingSubject='QA F09 '+runId+' reunión';
    const responseFor=type=>a.page.waitForResponse(r=>{try{return r.url().endsWith('/v1/cxorbia/commands')&&r.request().postDataJSON()?.commandType===type;}catch(_){return false;}},{timeout:90000});
    async function submit(type,click){const [response]=await Promise.all([responseFor(type),click()]);const ack=await response.json();const record=[...records.values()].find(x=>x.command.commandType===type);result.ui[type]=await verifyRecord(record,ack);save();return {ack,record};}
    await a.page.locator('#npsBtn').click();await a.page.locator('#npsCom').fill('QA F09 '+runId+' programa');
    await submit('client.nps.submit',()=>a.page.locator('.npsN[data-n="9"]').click());await a.page.locator('#npsCom').waitFor({state:'hidden',timeout:30000});
    await a.page.locator('#notaBtn').click();await a.page.locator('#ntTema').fill(noteSubject);await a.page.locator('#ntTxt').fill(noteDetail);await a.page.locator('#ntOk').click();
    check(await Promise.race([droppedPromise,new Promise(resolve=>setTimeout(()=>resolve(false),90000))]),'PERSISTENCE_FAILURE:F09_LOST_ACK_SETUP');
    await a.page.waitForFunction(()=>document.querySelector('#ntOk')?.disabled===false);check(await a.page.locator('#ntOk').count()===1,'PERSISTENCE_FAILURE:F09_FALSE_SUCCESS_AFTER_LOST_ACK');
    const note=await submit('client.note.create',()=>a.page.locator('#ntOk').click());
    check(note.ack.idempotentReplay===true&&note.ack.providerWrites===0,'PERSISTENCE_FAILURE:F09_LOST_ACK_RETRY_DUPLICATE');result.ui.lostAckRecoveredSameEntity=true;
    await a.page.locator('#ntOk').waitFor({state:'hidden',timeout:30000});
    const timezone=s(pr.data().timeZone||pr.data().timezone||'UTC'),dateParts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(Date.now()+7*86400000)).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
    const meetingDate=dateParts.year+'-'+dateParts.month+'-'+dateParts.day;
    await a.page.locator('#reuBtn').click();await a.page.locator('#ruTema').fill(meetingSubject);await a.page.locator('#ruF').fill(meetingDate);await a.page.locator('#ruH').fill('12:00');await a.page.locator('#ruM').selectOption({label:'Presencial'});
    await submit('client.meeting.request',()=>a.page.locator('#ruOk').click());await a.page.locator('#ruOk').waitFor({state:'hidden',timeout:30000});
    await a.page.screenshot({path:out+'/cliente-after.png',fullPage:true});await a.ctx.close();
    const second=await session(planned[0]);await second.page.evaluate(()=>CX.router.nav('cli_insights'));
    await second.page.waitForFunction(({note,meeting})=>document.body.innerText.includes(note)&&document.body.innerText.includes(meeting)&&document.body.innerText.includes('1 respuesta(s)'),{note:noteSubject,meeting:meetingSubject},{timeout:30000});
    const fresh=await second.page.evaluate(()=>CX.backendBulletins.listClientCollaboration());check(fresh.source==='firestore_server'&&fresh.entries.length===3&&fresh.entries.every(x=>x.requesterUid===planned[0].uid),'PERSISTENCE_FAILURE:F09_NEW_SESSION_READ');
    result.readback.newIndependentClientSession={ok:true,count:3,ids:fresh.entries.map(x=>x.id).sort()};await second.page.screenshot({path:out+'/cliente-new-session.png',fullPage:true});
    const b=await session(planned[1]);await b.page.evaluate(()=>CX.router.nav('cli_insights'));
    const other=await b.page.evaluate(()=>CX.backendBulletins.listClientCollaboration());check(other.entries.length===0,'AUTH_FAILURE:F09_OTHER_CLIENT_LEAK');
    const denied=await b.page.evaluate(async path=>{try{await firebase.firestore().doc(path).get({source:'server'});return false;}catch(error){return String(error?.code||'').includes('permission-denied');}},note.record.entityPath);check(denied,'AUTH_FAILURE:F09_FOREIGN_DOCUMENT_READ_ALLOWED');
    result.readback.otherClient={zeroRows:true,directDocumentPermissionDenied:true};
    const admin=await session(planned[2]);const adminRows=await admin.page.evaluate(()=>CX.backendBulletins.listClientCollaboration());
    check([...records.values()].every(r=>adminRows.entries.some(x=>x.id===r.id&&x.requesterUid===planned[0].uid)),'AUTH_FAILURE:F09_ADMIN_READ_MISSING');
    await admin.page.evaluate(async()=>{await CX.backendBulletins.load();CX.router.nav('tablon');});
    await admin.page.waitForFunction(({note,meeting,detail})=>document.body.innerText.includes(note)&&document.body.innerText.includes(meeting)&&document.body.innerText.includes(detail),{note:noteSubject,meeting:meetingSubject,detail:noteDetail},{timeout:30000});
    const adminDenied=await admin.page.evaluate(()=>CX.data.createClientNote({subject:'No suplantar',detail:'Prueba negativa',clientRequestId:'qa-admin-denied-001'},{ackAware:true}));check(adminDenied.ok===false&&adminDenied.providerAck===false,'AUTH_FAILURE:F09_ADMIN_SELF_IMPERSONATION');
    result.readback.admin={sameThreeRecords:true,tablonContentVisible:true,clientWriteDenied:true};await admin.page.screenshot({path:out+'/admin-tablon.png',fullPage:true});
    check(records.size===3,'PERSISTENCE_FAILURE:F09_ENTITY_COUNT');result.functionalPass=true;
  }catch(error){result.error=String(error?.message||error);result.classification=result.error.match(/(SOURCE_FAILURE|MAPPING_FAILURE|PROVIDER_FAILURE|PERSISTENCE_FAILURE|AUTH_FAILURE|FUNCTIONAL_DEFECT|VISUAL_DEFECT|RELEASE_COMPOSITION_FAILURE|ENVIRONMENT_FAILURE):/)?.[1]||(/MEMBERSHIP_|permission-denied/.test(result.error)?'AUTH_FAILURE':'FUNCTIONAL_DEFECT');}
  finally{
    await Promise.allSettled(contexts.map(c=>c.close()));if(browser)await browser.close().catch(()=>{});
    try{
      const ownedIdentities=result.identities,ids=ownedIdentities.map(x=>x.uid),known=new Set([...records.values()].flatMap(x=>[x.entityPath,x.receiptPath,x.auditPath]));
      let deleted=0;
      await db.runTransaction(async tx=>{
        for(const [collection,field] of [['bulletins','requesterUid'],['commandReceipts','actorUid'],['entityAuditTrail','actorUid']]){
          if(!ids.length)continue;const refs=await tx.get(tenant.collection(collection).where(field,'in',ids));check(refs.docs.every(d=>known.has(d.ref.path)),'PERSISTENCE_FAILURE:F09_UNEXPECTED_FIXTURE_REFERENCE');
        }
        const docs=[];for(const record of records.values()){
          const [en,re,au]=await Promise.all([record.entityPath,record.receiptPath,record.auditPath].map(p=>tx.get(db.doc(p))));
          if(!en.exists&&!re.exists&&!au.exists)continue;
          check(en.exists&&re.exists&&au.exists&&en.data().requesterUid===record.uid&&en.data().projectId===projectId&&en.data().periodId===periodId&&en.data().version===1&&re.data().actorUid===record.uid&&re.data().commandDigest===record.commandDigest&&re.data().entityId===record.id&&au.data().actorUid===record.uid&&au.data().idempotencyKey===record.command.idempotencyKey,'PERSISTENCE_FAILURE:F09_CLEANUP_OWNERSHIP');
          check(ownedEntity(en.data(),record),'PERSISTENCE_FAILURE:F09_CLEANUP_PAYLOAD_CHANGED');
          check((!record.entitySha256||hash(stable(en.data()))===record.entitySha256)&&(!record.receiptSha256||hash(stable(re.data()))===record.receiptSha256)&&(!record.auditSha256||hash(stable(au.data()))===record.auditSha256),'PERSISTENCE_FAILURE:F09_CLEANUP_CONCURRENT_CHANGE');
          docs.push(en.ref,re.ref,au.ref);
        }
        for(const identity of ownedIdentities){const member=await tx.get(db.doc(identity.memberPath));if(!member.exists)continue;const row=member.data();check(identity.memberCreateDispatched===true&&row.qaSynthetic===true&&row.qaRunId===runId&&row.qaRunAttempt===attempt&&row.qaPurpose==='F09'&&row.role===identity.role&&row.authNamespace==='staff'&&row.tenantId===tenantId&&row.name===identity.name&&JSON.stringify(row.projectIds)===JSON.stringify(identity.expectedClaims.projectIds)&&hash(stable(row))===identity.expectedMembershipSha256,'PERSISTENCE_FAILURE:F09_MEMBER_OWNERSHIP');docs.push(member.ref);}
        for(const ref of docs)tx.delete(ref);deleted=docs.length;
      });
      let authDeleted=0;for(const identity of ownedIdentities){
        try{const user=await auth.getUser(identity.uid),c=user.customClaims||{};
          const exactClaims=JSON.stringify(stable(c))===JSON.stringify(stable(identity.expectedClaims));
          const initialClaims=['AUTH_CREATED','CLAIMS_DISPATCHED'].includes(identity.state)&&Object.keys(c).length===0;
          check(identity.authIdentity&&JSON.stringify(stable(authIdentity(user)))===JSON.stringify(stable(identity.authIdentity))&&(exactClaims||initialClaims),'AUTH_FAILURE:F09_AUTH_CLEANUP_OWNERSHIP');
          await auth.deleteUser(identity.uid);authDeleted++;
        }catch(error){if(error.code!=='auth/user-not-found')throw error;}
      }
      const remaining=await Promise.all([...known,...ownedIdentities.map(x=>x.memberPath)].map(p=>db.doc(p).get()));check(remaining.every(x=>!x.exists),'PERSISTENCE_FAILURE:F09_DOC_RESIDUE');
      for(const x of ownedIdentities){try{await auth.getUser(x.uid);throw Error('AUTH_FAILURE:F09_AUTH_RESIDUE');}catch(error){if(error.code!=='auth/user-not-found')throw error;}}
      result.cleanup={ok:true,deletedDocuments:deleted,deletedAuth:authDeleted,remainingDocuments:0,remainingAuth:0};
      if(projectBefore&&periodBefore){const pr=await project.get(),periodDocs=await Promise.all(periodIds.map(id=>project.collection('periods').doc(id).get()));check(hash(stable(pr.data()))===projectBefore&&hash(stable(periodDocs.map(x=>({id:x.id,exists:x.exists,data:x.exists?x.data():null}))))===periodBefore,'PERSISTENCE_FAILURE:F09_REAL_PROJECT_PERIOD_CHANGED');result.realProjectPeriodUnchanged=true;}
      const after=await hrMeta();result.hrAfter=after.revision;check(after.revision===expectedHr&&after.hrWrites===false,'PROVIDER_FAILURE:F09_HR_CHANGED');
      if(productionBefore){result.productionIndexUnchanged=hash(await (await fetch('https://tya-plataforma.web.app/',{cache:'no-store'})).text())===productionBefore;check(result.productionIndexUnchanged,'ENVIRONMENT_FAILURE:F09_PRODUCTION_INDEX_DRIFT');}
      const {execFileSync}=await import('node:child_process');
      const runtime=JSON.parse(execFileSync('gcloud',['run','services','describe',e.SERVICE,'--project',projectName,'--region',e.REGION,'--format=json'],{encoding:'utf8'}));
      check(runtime.status.latestReadyRevisionName===result.runtimeRevision&&(runtime.status.traffic||[]).filter(x=>Number(x.percent||0)>0).every(x=>x.revisionName===result.runtimeRevision)&&(runtime.status.traffic||[]).reduce((a,x)=>a+Number(x.percent||0),0)===100,'ENVIRONMENT_FAILURE:F09_RUNTIME_TRAFFIC_DRIFT');
      result.runtimeTrafficExact=true;
    }catch(error){result.cleanup.error=String(error?.message||error);result.cleanup.ok=false;result.cleanup.unverifiedAuthIdentities=result.identities.map(x=>x.uid);}
    if(result.functionalPass&&result.cleanup.ok)result.decision='PASS_I3_F09_UI_PROVIDER_NEW_SESSION_PRIVACY_REPLAY_CLEANUP';save();
  }
  console.log(JSON.stringify({decision:result.decision,sourceSha,runId,periodId,records:records.size,cleanup:result.cleanup,error:result.error||null}));
  if(result.decision!=='PASS_I3_F09_UI_PROVIDER_NEW_SESSION_PRIVACY_REPLAY_CLEANUP')process.exitCode=2;
}

async function runHrDurableRevisionDiagnostic(){
  const e=process.env,s=v=>String(v??'').trim(),stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
  const hash=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(stable(v))).digest('hex'),hrDigest=v=>hash(JSON.stringify(stable(v))),check=(ok,code)=>{if(!ok)throw Error(code);};
  const tenantId=s(e.TENANT_ID),projectId=s(e.PROJECT_ID),host=s(e.HOSTING_URL).replace(/\/$/,''),out=s(e.QA_OUT),fingerprint='bfc8f1788b902124e6';
  check(e.PROJECT==='cxorbia-backend-dev'&&host==='https://cxorbia-backend-dev.web.app'&&tenantId&&projectId&&out&&/^\d+$/.test(s(e.GITHUB_RUN_ID)),'SOURCE_FAILURE:HR_DIAG_DEV_SCOPE');
  fs.mkdirSync(out,{recursive:true});if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:e.PROJECT});const db=getFirestore(),tenant=db.collection('tenants').doc(tenantId);
  const r={schemaVersion:'cxorbia.i3.hr-durable-diagnostic-readonly.v1',decision:'HOLD',observationComplete:false,runId:s(e.GITHUB_RUN_ID),candidateSourceSha:s(e.FOCAL_SOURCE),visitFingerprint:fingerprint,scope:'READ_ONLY_DIAGNOSIS_NOT_RECONCILIATION_OR_TERMINAL_CERTIFICATE',production:false,phaseAComplete:false,safety:{firestoreWrites:0,authWrites:0,hrWrites:0,commandPosts:0,builds:0,deploys:0}};
  const save=()=>fs.writeFileSync(out+'/result.json',JSON.stringify(r,null,2)+'\n');save();
  const endpoint=host+'/api/'+encodeURIComponent(tenantId)+'/'+encodeURIComponent(projectId)+'/hr-live',get=async format=>{const response=await fetch(endpoint+'?format='+format+'&hrdiag='+e.GITHUB_RUN_ID+'-'+Date.now(),{headers:{'cache-control':'no-cache, no-store'},signal:AbortSignal.timeout(90000)});check(response.ok,'PROVIDER_FAILURE:HR_DIAG_HTTP');return response.json();};
  const time=t=>t&&Number.isInteger(t.seconds)?{seconds:t.seconds,nanoseconds:t.nanoseconds}:null,stamp=t=>typeof t==='string'&&/^\d{4}-\d\d-\d\dT/.test(t)?t:time(t),state=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(v)?v:null,counts=o=>Object.fromEntries(Object.entries(o||{}).filter(([,v])=>typeof v==='boolean'||typeof v==='number'&&Number.isFinite(v)));
  let exactBinding=null,readServing=null;
  try{
    if(e.QA_RO==='true'){
      const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
      const d=read(e.CANDIDATE_DESCRIPTOR||'CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json'),p=read('CXORBIA_RECOVERY_EXECUTION_CURRENT.json'),seal=d.postDeployRunSeal||{};
      const {validateHrUidDiagnosticBinding}=await import('./cxorbia-i3-hr-ack-exact-same-revision.mjs'),{validateFixtureDevIdentity}=await import('./cxorbia-i3-live-fixture-contract.mjs');
      check(typeof seal.receiptPath==='string'&&/^docs\/checkpoints\/[A-Za-z0-9_./-]+\.json$/.test(seal.receiptPath)&&!seal.receiptPath.split('/').includes('..'),'SOURCE_FAILURE:HR_UID_READONLY_RECEIPT_PATH');
      const receipt=read(seal.receiptPath);
      exactBinding=validateHrUidDiagnosticBinding({descriptor:d,pointer:p,receipt,sourceSha:s(e.FOCAL_SOURCE),sourceTree:s(e.FOCAL_TREE),receiptBlob:git('hash-object',seal.receiptPath),treeExact:git('rev-parse',e.FOCAL_SOURCE+'^{tree}')===e.FOCAL_TREE,
        productDiffClean:!git('diff','--name-only',e.FOCAL_SOURCE,'HEAD','--','app','backend','firebase.json','.firebaserc','firestore.rules','storage.rules'),branchName:e.GITHUB_REF_NAME,writeGate:s(e.CXORBIA_I3_QA_ISOLATED_WRITE_GATE)});
      r.exactDevBinding=exactBinding;
      check(/^[a-z0-9-]+$/.test(e.REGION||'')&&e.SERVICE,'SOURCE_FAILURE:HR_UID_READONLY_RUNTIME_ENV');
      readServing=async()=>{
        const token=await getApps()[0].options.credential.getAccessToken(),base='https://'+e.REGION+'-run.googleapis.com/apis/serving.knative.dev/v1/namespaces/'+encodeURIComponent(e.PROJECT);
        const readCloud=async url=>{const response=await fetch(url,{headers:{authorization:'Bearer '+token.access_token},signal:AbortSignal.timeout(30000)});check(response.ok,'PROVIDER_FAILURE:HR_UID_READONLY_CLOUD_HTTP_'+response.status);return response.json();};
        const service=await readCloud(base+'/services/'+encodeURIComponent(e.SERVICE)),revision=await readCloud(base+'/revisions/'+encodeURIComponent(exactBinding.runtimeRevision)),hosting=await readCloud('https://firebasehosting.googleapis.com/v1beta1/sites/'+encodeURIComponent(e.PROJECT)+'/channels/live');
        validateFixtureDevIdentity(exactBinding,{service,revision,hosting});
        return{verified:true,runtimeRevision:exactBinding.runtimeRevision,runtimeDigest:exactBinding.runtimeDigest,hostingVersion:exactBinding.hostingVersion,serviceSha256:hash(service),revisionSha256:hash(revision),hostingSha256:hash(hosting),observedAt:new Date().toISOString()};
      };
      r.exactDevBefore=await readServing();save();
    }
    const {b14PredecessorReadOnly}=await import('./cxorbia-i3-hr-ack-exact-same-revision.mjs');const {validateTerminalHrObservation}=await import('./cxorbia-i3-terminal-hr-observation.mjs'),before=await get('meta');validateTerminalHrObservation(before);const revision=before.revision;r.sourceRevision=revision;
    if(exactBinding)check(revision===exactBinding.hrRevision,'SOURCE_FAILURE:HR_UID_READONLY_HR_CHANGED');
    const response=await get('json'),hr=response.snapshot||response.data||response;check(hr.tenantId===tenantId&&hr.projectId===projectId&&hr.sourceSafe===true&&hr.imported===false&&response._runtime?.revision===revision&&response._runtime?.cacheOrigin==='runtime_refresh','SOURCE_FAILURE:HR_DIAG_HR_SCOPE');
    const sourceId=v=>s(v.visitId||v.id||v.hrRowId||(s(v.sourceTab)&&s(v.sourceRow)?s(v.sourceTab)+'::'+s(v.sourceRow):'')),matches=(hr.visits||[]).filter(v=>hash(sourceId(v)).slice(0,18)===fingerprint);check(matches.length===1,'SOURCE_FAILURE:HR_DIAG_VISIT_NOT_EXACT');
    const live=matches[0],durableId=s(live.hrRowId||(s(live.sourceTab)&&s(live.sourceRow)?s(live.sourceTab)+'::'+s(live.sourceRow):'')||live.visitId||live.id),periods=(hr.periods||[]).filter(p=>s(p.key||p.periodKey)===s(live.periodKey));check(durableId&&!durableId.includes('/')&&periods.length===1,'MAPPING_FAILURE:HR_DIAG_DURABLE_PERIOD');const expectedPeriodId=s(periods[0].id||periods[0].periodId);check(expectedPeriodId,'MAPPING_FAILURE:HR_DIAG_PERIOD_ID');
    const discovered=await tenant.collection('users').where('authNamespace','==','staff').select('active','authNamespace','role','projectIds').limit(33).get();check(discovered.size<33,'SOURCE_FAILURE:HR_DIAG_STAFF_BOUND_EXCEEDED');
    const eligible=m=>m.active===true&&m.authNamespace==='staff'&&(m.role==='super'||m.role==='admin'&&Array.isArray(m.projectIds)&&m.projectIds.includes(projectId));const uids=discovered.docs.filter(d=>eligible(d.data())).map(d=>d.id);check(uids.length>0&&uids.length<=8,'SOURCE_FAILURE:HR_DIAG_STAFF_SCOPE_UNRESOLVED');
    const visitRef=tenant.collection('projects').doc(projectId).collection('visits').doc(durableId),memberRefs=uids.map(uid=>tenant.collection('users').doc(uid)),lockRef=tenant.collection('commandReceipts').doc('hr-scope-'+hrDigest(tenantId));
    const observation=await db.runTransaction(async tx=>{
      const [visit]=await tx.getAll(visitRef,{fieldMask:['tenantId','projectId','periodId','periodKey','hrSourceRevision','estado','status','shopperId','assignmentSource','assignmentSyncStatus','version','createdAt','updatedAt']}),members=await tx.getAll(...memberRefs,{fieldMask:['active','authNamespace','role','projectIds']}),[lock]=await tx.getAll(lockRef,{fieldMask:['status','projectId','receiptPath','expiresAt']});const row=visit.data()||{},actors=[];
      for(let i=0;i<uids.length;i++){
        const uid=uids[i],member=members[i],m=member.data()||{},actor={uidHash:hash(uid),membershipExists:member.exists,membershipUpdateTime:time(member.updateTime),role:state(m.role),authNamespace:state(m.authNamespace),eligibleForAutomaticReconciliation:member.exists&&eligible(m)};
        if(actor.eligibleForAutomaticReconciliation){
          const key='hr-auto-v2-'+revision.slice(0,32)+'-'+uid,ref=tenant.collection('commandReceipts').doc('hr-'+hrDigest([projectId,key]));
          const [receipt]=await tx.getAll(ref,{fieldMask:['digest','actorUid','tenantId','projectId','sourceRevision','idempotencyKey','status','startedAt','completedAt','predecessorReconciliation','result.predecessorReconciliation','result.code','result.ok','result.status','result.committed','result.providerAck','result.sourceRevision','result.receiptPath','result.receiptBinding','result.confirmedProviderWrites','result.providerWrites','result.unresolvedEffects','result.unverifiedEffects','result.applicationWritesThisAttempt','result.stages']}),stages=await tx.getAll(ref.collection('stages').doc('visits'),ref.collection('stages').doc('shoppers'),{fieldMask:['status','sourceRevision','completedAt','summary']});
          const rr=receipt.data()||{},result=rr.result||{},binding=result.receiptBinding||{},digest=hrDigest({actorUid:uid,scope:{tenantId,projectId},sourceRevision:revision,commandType:'hr.snapshot.reconcile'});
          actor.receipt={pathHash:hash(ref.path),exists:receipt.exists,updateTime:time(receipt.updateTime),status:state(rr.status),startedAt:stamp(rr.startedAt),completedAt:stamp(rr.completedAt),sourceRevision:rr.sourceRevision||null,exactBinding:receipt.exists&&rr.digest===digest&&rr.actorUid===uid&&rr.tenantId===tenantId&&rr.projectId===projectId&&rr.sourceRevision===revision&&rr.idempotencyKey===key&&result.sourceRevision===revision&&result.receiptPath===ref.path&&binding.actorUid===uid&&binding.tenantId===tenantId&&binding.projectId===projectId&&binding.sourceRevision===revision&&binding.idempotencyKey===key&&binding.commandType==='hr.snapshot.reconcile',result:counts(result),errorCode:state(result.code),stageResults:Object.fromEntries(['visits','shoppers'].map(k=>[k,{...counts(result.stages?.[k]),code:state(result.stages?.[k]?.code),status:state(result.stages?.[k]?.status)}])),predecessorReconciliation:await b14PredecessorReadOnly(tx,{receipt:rr,receiptRef:ref,tenantId,projectId,revision,db}),applicationWritesThisAttempt:counts(result.applicationWritesThisAttempt),stages:stages.map((d,j)=>({name:['visits','shoppers'][j],exists:d.exists,updateTime:time(d.updateTime),status:state(d.data()?.status),sourceRevision:d.data()?.sourceRevision||null,completedAt:stamp(d.data()?.completedAt),counts:counts(d.data()?.summary),summaryStatus:state(d.data()?.summary?.status)}))};
        }
        actors.push(actor);
      }
      const l=lock.data()||{};return {tenantIdHash:hash(tenantId),projectIdHash:hash(projectId),independentHR:{periodId:expectedPeriodId,periodKey:s(live.periodKey),state:state(live.estado||live.status),shopperPresent:!!s(live.shopperId)},durable:{pathHash:hash(visitRef.path),exists:visit.exists,updateTime:time(visit.updateTime),tenantMatches:row.tenantId===tenantId,projectMatches:row.projectId===projectId,periodId:row.periodId||null,periodMatches:row.periodId===expectedPeriodId,hrSourceRevision:row.hrSourceRevision||null,revisionMatches:row.hrSourceRevision===revision,state:state(row.estado||row.status),shopperPresent:!!s(row.shopperId),assignmentSource:state(row.assignmentSource),assignmentSyncStatus:state(row.assignmentSyncStatus),version:Number.isFinite(row.version)?row.version:null},reconciliationLock:{exists:lock.exists,updateTime:time(lock.updateTime),status:state(l.status),projectMatches:l.projectId===projectId,receiptPathHash:l.receiptPath?hash(l.receiptPath):null,expiresAt:Number.isFinite(l.expiresAt)?l.expiresAt:null},actors};
    },{readOnly:true});
    Object.assign(r,observation);const {b14ReconciliationLeaseReadOnly,hrCrosswalkUidReadOnly}=await import('./cxorbia-i3-hr-ack-exact-same-revision.mjs');r.reconciliationLeaseDetail=await b14ReconciliationLeaseReadOnly(db,tenantId,projectId,revision);save();
    if(r.reconciliationLeaseDetail.receipt?.stageResults?.shoppers?.code==='SHOPPER_CROSSWALK_UID_CONFLICT'){
      r.shopperCrosswalkDiagnosis=await hrCrosswalkUidReadOnly({db,auth:getAuth(),snapshot:{...hr,_runtime:response._runtime},tenantId,projectId,revision,sourceDir:s(e.SOURCE_DIR)||process.cwd()});save();
    }
    const after=await get('meta');validateTerminalHrObservation(after);r.sourceRevisionAfter=after.revision;check(after.revision===revision,'PROVIDER_FAILURE:HR_DIAG_REVISION_DRIFT');
    if(readServing)r.exactDevAfter=await readServing();
    r.observationComplete=true;r.decision=observation.durable.revisionMatches?'OBSERVED_DURABLE_REVISION_MATCH_NOT_FULL_RECONCILIATION':'HOLD_OBSERVED_DURABLE_REVISION_DIVERGENCE';
  }catch(error){r.error=String(error?.message||error).replace(/Bearer\s+\S+|eyJ[A-Za-z0-9_.-]+/g,'[TOKEN]').slice(0,1000);process.exitCode=2;}finally{save();}
  console.log(JSON.stringify(r));
}

async function runNotificationCycleQa(){
  const e=process.env,s=v=>String(v??'').trim(),hash=v=>crypto.createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v)).digest('hex');
  const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
  const check=(yes,code)=>{if(!yes)throw Error(code);},runId=s(e.GITHUB_RUN_ID),attempt=s(e.GITHUB_RUN_ATTEMPT||'1'),sourceSha=s(e.FOCAL_SOURCE),sourceTree=s(e.FOCAL_TREE);
  const projectName=s(e.PROJECT),tenantId=s(e.TENANT_ID),projectId=s(e.PROJECT_ID),host=s(e.HOSTING_URL).replace(/\/$/,''),out=s(e.QA_OUT),expectedHr=s(e.EXPECTED_HR_REVISION),tag='qa_vrm143_'+runId+'_'+attempt;
  check(e.CXORBIA_I3_QA_ISOLATED_WRITE_GATE==='PAULA_AUTHORIZED_VRM143_DEV_ONLY'&&projectName==='cxorbia-backend-dev'&&host==='https://cxorbia-backend-dev.web.app'&&tenantId&&projectId&&out&&/^\d{8,}$/.test(runId)&&/^[a-f0-9]{40}$/.test(sourceSha)&&/^[a-f0-9]{40}$/.test(sourceTree)&&/^[a-f0-9]{64}$/.test(expectedHr),'SOURCE_FAILURE:VRM143_SCOPE_GATE_DENIED');
  fs.mkdirSync(out,{recursive:true});if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:projectName});
  const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId),project=tenant.collection('projects').doc(projectId);
  const result={schemaVersion:'cxorbia.i3.vrm143.live-provider-served-consumer.v1',decision:'HOLD',runId,runAttempt:attempt,sourceSha,sourceTree,tenantId,projectId,periodId:null,runtimeRevision:s(e.DEV_REVISION),runtimeDigest:s(e.RUNTIME_DIGEST),hostingVersion:s(e.HOSTING_VERSION_NAME),hrBefore:null,hrAfter:null,cases:[],identities:[],cleanup:{ok:false},scope:'LIVE_DEV_PROVIDER_AND_EXACT_SERVED_SHARED_CONSUMER_NOT_BROWSER_UI_OR_FULL_DOMAIN',phaseAComplete:false,fullDomain:false,production:false,safety:{hrWrites:0,realVisitWrites:0,realMemberWrites:0,paymentWrites:0,calendarCalls:0,emailCalls:0,productionDeploys:0}};
  const save=()=>fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');save();
  const request=async(url,options={})=>{const r=await fetch(url,{...options,signal:AbortSignal.timeout(90000)});const b=await r.json().catch(()=>({}));return {http:r.status,...b};};
  const hr=()=>request(host+'/api/'+encodeURIComponent(tenantId)+'/'+encodeURIComponent(projectId)+'/hr-live?format=meta&vrm143='+runId+'-'+Date.now(),{headers:{'cache-control':'no-cache, no-store'}});
  const owned=new Map(),identities=[],register=(ref,kind,expected={})=>{owned.set(ref.path,{ref,kind,expected});return ref;};
  const authShape=u=>({uid:u.uid,displayName:u.displayName||'',disabled:u.disabled,email:u.email||null,emailVerified:u.emailVerified,phoneNumber:u.phoneNumber||null,creationTime:u.metadata.creationTime,providerData:u.providerData||[]});
  let beforeProject='',beforeProduction='',periodId='',periodKey='',consumerScripts=null;
  try{
    const h=await hr();check(h.http===200&&h.sourceSafe===true&&h.revisionStable===true&&h.hrWrites===false&&h.production===false&&h.revision===expectedHr,'SOURCE_FAILURE:VRM143_HR_PRECONDITION');result.hrBefore=h.revision;
    const snapResponse=await request(host+'/api/'+encodeURIComponent(tenantId)+'/'+encodeURIComponent(projectId)+'/hr-live?format=json&vrm143='+runId,{headers:{'cache-control':'no-store'}}),snapshot=snapResponse.snapshot||snapResponse.data||snapResponse;
    periodKey=s(snapshot.source?.currentCalendarPeriodKey);const periods=(snapshot.periods||[]).filter(x=>s(x.key||x.periodKey)===periodKey);
    check(snapResponse.http===200&&snapshot.sourceSafe===true&&snapshot.imported===false&&snapshot.tenantId===tenantId&&snapshot.projectId===projectId&&snapResponse._runtime?.revision===expectedHr&&periods.length===1&&periods[0].projectId===projectId,'SOURCE_FAILURE:VRM143_CURRENT_PERIOD');periodId=s(periods[0].id);result.periodId=periodId;
    const projectSnap=await project.get();check(projectSnap.exists&&projectSnap.data().tenantId===tenantId,'SOURCE_FAILURE:VRM143_PROJECT');beforeProject=hash(stable(projectSnap.data()));
    const route=projectSnap.data().operationalSource||projectSnap.data().routeSource||{};check(s(typeof route==='string'?route:route.mode||route.sourceType||route.authority)!=='internal','SOURCE_FAILURE:VRM143_EXTERNAL_HR_CASE_REQUIRED');
    beforeProduction=hash(Buffer.from(await (await fetch('https://tya-plataforma.web.app/',{cache:'no-store'})).arrayBuffer()));
    const legacy=(await project.collection('visits').select('periodId','cancelRequest','rescheduleRequest','qaSynthetic').get()).docs;
    result.legacyPendingCycleAudit={realVisitsRead:legacy.filter(x=>x.data().qaSynthetic!==true).length,unlinkedPending:legacy.flatMap(x=>{const v=x.data();return v.qaSynthetic===true?[]:['cancelRequest','rescheduleRequest'].filter(k=>['pending_review','approved_pending_hr'].includes(v[k]?.status)&&!v[k]?.requestCycleId).map(k=>({visitHash:hash(x.id),requestKind:k,periodId:v.periodId||null,status:v[k].status}));}),writes:0,scope:'EXACT_CURRENT_PROJECT_DURABLE_REQUEST_METADATA_ONLY'};
    const cp=await import('node:child_process'),vm=await import('node:vm');consumerScripts={};result.servedConsumerSha256={};
    for(const file of ['core/notif.js','core/backend-bulletins.js']){const response=await fetch(host+'/'+file+'?vrm143='+runId,{cache:'no-store'}),bytes=Buffer.from(await response.arrayBuffer()),exact=cp.execFileSync('git',['show',sourceSha+':app/'+file],{maxBuffer:3*1024*1024});check(response.ok&&bytes.equals(exact),'SOURCE_FAILURE:VRM143_SERVED_CONSUMER:'+file);consumerScripts[file]=bytes.toString('utf8');result.servedConsumerSha256[file]=hash(bytes);}
    const feed=(bulletins,visit,role)=>{
      const next=new Date(periodKey+'-01T00:00:00Z');next.setUTCMonth(next.getUTCMonth()+1);const later=next.toISOString().slice(0,7),CX={BACKEND:{enabled:false,previewMode:false,tenantId},dataSource:{showFixtures:()=>false},session:{role,user:{shopperId:tag+'_shopper'}},backendAuth:{context:()=>({tenantId,role,shopperId:tag+'_shopper'})},data:{currentProjectId:projectId,currentPeriodId:later,period:()=>({periodo:later}),_visitas:[visit]}};
      const c=vm.createContext({CX,Date,Set,console,document:{readyState:'complete'}});c.window=c;c.addEventListener=()=>{};vm.runInContext(consumerScripts['core/notif.js'],c);vm.runInContext(consumerScripts['core/backend-bulletins.js'].replace('  CX.backendBulletins = {','  CX.__normalizeNotice=normalize;\n  CX.backendBulletins = {'),c);CX.notif._items=bulletins.map(b=>CX.__normalizeNotice({id:b.id,data:()=>b},new Set()));return CX.notif;
    };
    const init=await request(host+'/__/firebase/init.json');check(init.http===200&&init.apiKey,'ENVIRONMENT_FAILURE:VRM143_FIREBASE_INIT');
    const tokenFor=async identity=>{const token=await auth.createCustomToken(identity.uid,identity.claims),r=await request('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(init.apiKey),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token,returnSecureToken:true})});check(r.http===200&&r.idToken,'AUTH_FAILURE:VRM143_QA_SESSION');return r.idToken;};
    for(const role of ['shopper','admin']){
      const uid=tag+'_'+role,member=tenant.collection('users').doc(uid),claims={tenantId,projectIds:[projectId],role,authNamespace:role==='shopper'?'shopper':'staff',...(role==='shopper'?{shopperId:uid}:{}),qaSynthetic:true,qaRunId:runId,qaRunAttempt:attempt,qaPurpose:'VRM143'};
      check(!(await member.get()).exists,'SOURCE_FAILURE:VRM143_MEMBER_COLLISION');try{await auth.getUser(uid);throw Error('SOURCE_FAILURE:VRM143_AUTH_COLLISION');}catch(error){if(error.code!=='auth/user-not-found')throw error;}
      const identity={uid,role,claims,state:'PLANNED',memberPath:member.path};identities.push(identity);result.identities=identities;save();
      identity.state='AUTH_CREATE_DISPATCHED';save();const created=await auth.createUser({uid,displayName:'QA VRM143 '+runId+' '+role,disabled:false});identity.authIdentity=authShape(created);identity.state='AUTH_CREATED';save();await auth.setCustomUserClaims(uid,claims);
      const membership={uid,...claims,active:true,status:'active',name:created.displayName};register(member,'member',{sha256:hash(stable(membership))});await member.create(membership);identity.memberCreated=true;
      check(hash(stable((await member.get()).data()))===hash(stable(membership))&&hash(stable((await auth.getUser(uid)).customClaims||{}))===hash(stable(claims)),'AUTH_FAILURE:VRM143_IDENTITY_READBACK');identity.state='VERIFIED';save();
    }
    const shopper=identities.find(x=>x.role==='shopper'),admin=identities.find(x=>x.role==='admin'),tokens={shopper:await tokenFor(shopper),admin:await tokenFor(admin)};
    const invoke=(role,command)=>request(host+'/v1/cxorbia/commands',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+tokens[role]},body:JSON.stringify(command)});
    if(e.ACTIVE_STATUS==='HOLD_I3_VRM350_DEV_MATERIALIZATION_REQUIRED'){
      // The HTTP negative uses an owned synthetic visit absent from the real HR.
      // An erroneous commit can only affect documents already in the cleanup journal.
      const visitId=tag+'_sync_confirm',ref=project.collection('visits').doc(visitId);check(!(await ref.get()).exists&&!(snapshot.visits||[]).some(v=>v.hrRowId===visitId||v.id===visitId),'SOURCE_FAILURE:VRM350_FIXTURE_COLLISION');register(ref,'visit',{visitId});
      const original={id:visitId,visitId,hrRowId:visitId,tenantId,projectId,periodId,periodKey,shopperId:shopper.uid,estado:'asignada',status:'asignada',version:1,assignmentSource:'platform',assignmentSyncStatus:'pending_hr',qaSynthetic:true,qaRunId:runId,qaRunAttempt:attempt,qaPurpose:'VRM143'};await ref.create(original);
      const command={version:'cxorbia-command-adapter-v1',commandType:'visit.sync.confirm',entityType:'visit',entityId:visitId,tenantId,projectId,periodId,expectedVersion:1,idempotencyKey:tag+'_vrm350_no_independent_row',payload:{visitId,hrRowId:visitId,hrShopperId:shopper.uid},authorization:{providerEnforcementRequired:true,permission:'visit.sync.confirm'},audit:{reason:'isolated-dev-vrm350',correlationId:tag}};
      const receipt=tenant.collection('commandReceipts').doc(hash([tenantId,projectId,periodId,command.idempotencyKey].join('\0')).slice(0,40)),audit=tenant.collection('entityAuditTrail').doc(hash([command.idempotencyKey,command.commandType,visitId].join('\0')).slice(0,40));
      for(const [kind,doc]of[['receipt',receipt],['audit',audit]]){check(!(await doc.get()).exists,'SOURCE_FAILURE:VRM350_RECEIPT_COLLISION');register(doc,kind,{visitId,key:command.idempotencyKey,type:command.commandType});}
      const before=await ref.get(),responses=[];
      for(let session=0;session<2;session++){
        if(session)tokens.admin=await tokenFor(admin);const response=await invoke('admin',command),after=await ref.get();
        check(response.ok===false&&response.status==='blocked'&&response.code==='OPS_SYNC_CONFIRM_HR_ROW_NOT_UNIQUE'&&response.providerAck===false&&response.hrProviderAck===false&&response.hrReflectionVerified===false&&response.providerWrites===0,'FUNCTIONAL_DEFECT:VRM350_FALSE_SYNC_HTTP:'+s(response.code));
        check(hash(stable(after.data()))===hash(stable(before.data()))&&after.updateTime.isEqual(before.updateTime)&&!(await receipt.get()).exists&&!(await audit.get()).exists,'PERSISTENCE_FAILURE:VRM350_NEGATIVE_WROTE');responses.push({freshSession:session===1,http:response.http,code:response.code,providerAck:false,hrProviderAck:false,providerWrites:0,durableUnchanged:true,receiptAbsent:true,auditAbsent:true});
      }
      // Positive and replay use this same independently fetched HR, but only an
      // in-memory durable fixture. No commercial visit or remote HR is written.
      const live=(snapshot.visits||[]).find(v=>s(v.shopperId)&&s(v.id)&&s(v.hrRowId)&&(snapshot.periods||[]).filter(p=>s(p.key||p.periodKey)===s(v.periodKey)&&p.projectId===projectId).length===1);check(live,'SOURCE_FAILURE:VRM350_ASSIGNED_HR_REFERENCE_REQUIRED');
      const pe=snapshot.periods.find(p=>s(p.key||p.periodKey)===s(live.periodKey)&&p.projectId===projectId),memory=new Map(),clone=v=>v===undefined?undefined:structuredClone(v),snap=(path,store)=>({id:path.split('/').at(-1),exists:store.has(path),data:()=>clone(store.get(path))});
      const memoryRef=path=>({path,id:path.split('/').at(-1),collection:n=>memoryRef(path+'/'+n),doc:id=>memoryRef(path+'/'+id),get:async()=>snap(path,memory)});
      const memoryDb={collection:memoryRef,runTransaction:async fn=>{const working=new Map([...memory].map(([k,v])=>[k,clone(v)]));let written=false;const out=await fn({get:async ref=>{check(!written,'SOURCE_FAILURE:VRM350_READ_AFTER_WRITE');return snap(ref.path,working);},set:(ref,v,o={})=>{written=true;working.set(ref.path,(o.merge||o.mergeFields)?{...(working.get(ref.path)||{}),...clone(v)}:clone(v));}});memory.clear();for(const [k,v]of working)memory.set(k,v);return out;}};
      memory.set(admin.memberPath,clone((await tenant.collection('users').doc(admin.uid).get()).data()));const memoryPath=project.path+'/visits/'+live.hrRowId;
      memory.set(memoryPath,{id:live.hrRowId,visitId:live.hrRowId,hrRowId:live.hrRowId,tenantId,projectId,periodId:pe.id,periodKey:live.periodKey,shopperId:live.shopperId,assignmentSyncStatus:'pending_hr',version:4,hrSourceRevision:'b'.repeat(64),unrelatedMarker:'preserved'});
      const {pathToFileURL}=await import('node:url'),{createOperationalCommandProvider}=await import(pathToFileURL(e.SOURCE_DIR+'/backend/runtime/cxorbia-operational-command-provider-v1.mjs').href);
      const provider=createOperationalCommandProvider({auth,db:memoryDb,policy:{schemaVersion:'cxorbia.operational.provider-policy.v1',enabled:true,allowedTenantIds:[tenantId],allowedProjectIds:[projectId],conflictPolicy:'review_no_silent_overwrite',hrWrites:false,makeCalls:false,geminiCalls:false,storageWrites:false,paymentWrites:false},hrSnapshot:snapshot,hrRevision:expectedHr});
      const positive={...command,periodId:pe.id,entityId:live.id,expectedVersion:4,idempotencyKey:tag+'_vrm350_memory',payload:{visitId:live.id,hrRowId:live.hrRowId,hrShopperId:live.shopperId}},first=await provider.execute(tokens.admin,positive);check(first.ok===true&&first.providerWrites===3&&first.hrReflectionVerified===true&&first.hrProviderAck===false,'FUNCTIONAL_DEFECT:VRM350_REAL_HR_FACTORY_POSITIVE:'+s(first.code));
      const seal=hash(stable([...memory]));const replay=await provider.execute(tokens.admin,positive);check(replay.ok===true&&replay.idempotentReplay===true&&replay.providerWrites===0&&hash(stable([...memory]))===seal&&memory.get(memoryPath).hrSourceRevision==='b'.repeat(64)&&memory.get(memoryPath).unrelatedMarker==='preserved','FUNCTIONAL_DEFECT:VRM350_REAL_HR_FACTORY_REPLAY');
      result.syncConfirmation={decision:'PASS_VRM350_SERVED_HTTP_REJECTS_UNOBSERVED_HR_AND_REAL_HR_FACTORY_POSITIVE_REPLAY',sourceRevision:expectedHr,httpNegative:{scope:'LIVE_HTTP_OWNED_SYNTHETIC_VISIT_ABSENT_FROM_REAL_HR',cases:responses},positive:{scope:'EXACT_PRODUCT_FACTORY_WITH_REAL_INDEPENDENT_HR_AND_MEMORY_ONLY_DURABLE_STATE_NOT_HTTP_OR_FIRESTORE_PERSISTENCE',initialMemoryWrites:3,replayMemoryWrites:0,hrProviderAck:false,proofSourceRevision:first.hrReflection.sourceRevision,visitFingerprint:hash(live.id),periodId:pe.id},commercialVisitWrites:0,hrWrites:0,fullDomain:false,b14Closed:false};save();
    }
    let future=new Date(Date.now()+2*86400000).toISOString().slice(0,10);if(future.slice(0,7)!==periodKey)future=new Date(Date.now()).toISOString().slice(0,10);check(future.slice(0,7)===periodKey,'SOURCE_FAILURE:VRM143_PERIOD_CLOCK');
    for(const [type,field]of [['visit.cancel','cancelRequest'],['visit.reschedule','rescheduleRequest']]){
      const visitId=tag+'_'+field,ref=project.collection('visits').doc(visitId);check(!(await ref.get()).exists,'SOURCE_FAILURE:VRM143_VISIT_COLLISION');register(ref,'visit',{visitId});
      const original={id:visitId,visitId,hrRowId:visitId,tenantId,projectId,periodId,periodKey,shopperId:shopper.uid,estado:'agendada',status:'agendada',agendada:future,version:1,assignmentSource:'platform',canonicalFacets:{available:false,assigned:true,scheduled:true,cancelled:false},qaSynthetic:true,qaRunId:runId,qaRunAttempt:attempt,qaPurpose:'VRM143'};await ref.create(original);
      const command=(version,label,payload)=>({version:'cxorbia-command-adapter-v1',commandType:type,entityType:'visit',entityId:visitId,tenantId,projectId,periodId,expectedVersion:version,idempotencyKey:tag+'_'+field+'_'+label,payload:{visitId,hrRowId:visitId,shopperId:shopper.uid,...payload},authorization:{providerEnforcementRequired:true,permission:type},audit:{reason:'isolated-dev-vrm143',correlationId:tag}});
      const request1=command(1,'request1',{reason:'QA request one',newDate:future,...(type==='visit.cancel'?{requestOnly:true}:{requestedByShopper:true})}),decision1=command(2,'decision1',{decision:'rejected',reason:'QA decision one'}),request2=command(3,'request2',{reason:'QA request two',newDate:future,...(type==='visit.cancel'?{requestOnly:true}:{requestedByShopper:true})}),decision2=command(4,'decision2',{decision:'approved',reason:'QA decision two',...(type==='visit.reschedule'?{newDate:future}:{})});
      const docRefs=new Map();
      const blockedRequest=type==='visit.cancel'?command(5,'blocked',{requestOnly:true,reason:'QA blocked pendingHR'}):null;
      for(const c of [request1,decision1,request2,decision2,...(blockedRequest?[blockedRequest]:[])]){const id=hash([tenantId,projectId,periodId,c.idempotencyKey].join('\0')).slice(0,40),refs={receipt:tenant.collection('commandReceipts').doc(id),audit:tenant.collection('entityAuditTrail').doc(hash([c.idempotencyKey,c.commandType,c.entityId].join('\0')).slice(0,40)),bulletin:tenant.collection('bulletins').doc('visit-request-'+id)};docRefs.set(c.idempotencyKey,refs);for(const [kind,doc]of Object.entries(refs)){check(!(await doc.get()).exists,'SOURCE_FAILURE:VRM143_COMMAND_COLLISION');register(doc,kind,{visitId,key:c.idempotencyKey,type:c.commandType});}}
      const acked=async(role,c)=>{const r=await invoke(role,c);check(r.http===200&&r.ok===true&&r.providerAck===true&&r.status==='committed'&&r.successUiAllowed===true&&r.providerWrites===4,'PERSISTENCE_FAILURE:VRM143_COMMAND_ACK:'+s(r.code));const refs=docRefs.get(c.idempotencyKey),docs=await Promise.all(Object.values(refs).map(x=>x.get()));check(docs.every(x=>x.exists),'PERSISTENCE_FAILURE:VRM143_ATOMIC_RECORDS');
        const [receipt,audit,notice]=docs.map(x=>x.data()),actor=role==='shopper'?shopper.uid:admin.uid;
        check(receipt.status==='committed'&&receipt.providerAck===true&&receipt.commandDigest===hash(stable(c))&&receipt.commandType===c.commandType&&receipt.entityId===visitId&&receipt.actorUid===actor,'PERSISTENCE_FAILURE:VRM143_RECEIPT_CONTENT');
        check(audit.tenantId===tenantId&&audit.projectId===projectId&&audit.periodId===periodId&&audit.idempotencyKey===c.idempotencyKey&&audit.commandType===type&&audit.entityId===visitId&&audit.entityType==='visit'&&audit.actorUid===actor,'PERSISTENCE_FAILURE:VRM143_AUDIT_CONTENT');
        const current=(await ref.get()).data();check(notice.id===refs.bulletin.id&&notice.tenantId===tenantId&&notice.projectId===projectId&&notice.periodId===periodId&&notice.entityType==='visit'&&notice.entityId===visitId&&notice.idempotencyKey===c.idempotencyKey&&notice.requestCycleId===current[field]?.requestCycleId&&notice.toRole===(role==='shopper'?'admin':'shopper')&&JSON.stringify(notice.targetRoles)===JSON.stringify([role==='shopper'?'admin':'shopper'])&&JSON.stringify(notice.targetProjectIds)===JSON.stringify([projectId])&&JSON.stringify(notice.targetShopperIds)===JSON.stringify(role==='shopper'?[]:[shopper.uid]),'PERSISTENCE_FAILURE:VRM143_BULLETIN_CONTENT');return r;};
      await acked('shopper',request1);const row1=(await ref.get()).data(),cycle1=row1[field]?.requestCycleId;check(cycle1===docRefs.get(request1.idempotencyKey).receipt.id,'PERSISTENCE_FAILURE:VRM143_CYCLE_MISSING');
      await acked('admin',decision1);const rejected=(await ref.get()).data(),n1=(await docRefs.get(request1.idempotencyKey).bulletin.get()).data(),nd=(await docRefs.get(decision1.idempotencyKey).bulletin.get()).data();check(rejected[field].status==='rejected'&&rejected[field].requestCycleId===cycle1&&n1.requestCycleId===cycle1&&nd.requestCycleId===cycle1&&nd.idempotencyKey===decision1.idempotencyKey,'PERSISTENCE_FAILURE:VRM143_DECISION_CYCLE');
      await acked('shopper',request2);const row2=(await ref.get()).data(),cycle2=row2[field]?.requestCycleId,n2=(await docRefs.get(request2.idempotencyKey).bulletin.get()).data();check(cycle2===docRefs.get(request2.idempotencyKey).receipt.id&&cycle2!==cycle1&&n2.requestCycleId===cycle2&&row2[field].status==='pending_review'&&['decidedAt','decidedBy','decisionReason'].every(k=>row2[field][k]===null),'PERSISTENCE_FAILURE:VRM143_SECOND_CYCLE');
      const omit=v=>{const x=structuredClone(v);for(const k of [field,'version','updatedAt'])delete x[k];return x;};check(hash(stable(omit(row2)))===hash(stable(omit(original))),'PERSISTENCE_FAILURE:VRM143_UNRELATED_VISIT_DRIFT');
      tokens.shopper=await tokenFor(shopper);tokens.admin=await tokenFor(admin);
      for(const [role,c]of [['shopper',request1],['admin',decision1]]){const replay=await invoke(role,c);check(replay.ok===true&&replay.idempotentReplay===true&&replay.providerWrites===0&&hash(stable((await ref.get()).data()))===hash(stable(row2)),'PERSISTENCE_FAILURE:VRM143_OLD_REPLAY_CHANGED_CYCLE');}
      const adminFeed=feed([n1,nd,n2],row2,'admin'),shopperFeed=feed([n1,nd,n2],row2,'shopper');check(adminFeed.for('admin').length===1&&adminFeed.for('admin')[0].id===n2.id&&adminFeed.history('admin').length===2&&shopperFeed.for('shopper').length===0&&shopperFeed.history('shopper').length===1,'FUNCTIONAL_DEFECT:VRM143_HISTORIC_CYCLE_CONSUMER');
      await acked('admin',decision2);const row3=(await ref.get()).data(),last=(await docRefs.get(decision2.idempotencyKey).bulletin.get()).data();check(row3[field].requestCycleId===cycle2&&last.requestCycleId===cycle2,'PERSISTENCE_FAILURE:VRM143_APPROVAL_CYCLE');
      if(type==='visit.cancel'){check(row3.cancelRequest.status==='approved_pending_hr'&&hash(stable(omit(row3)))===hash(stable(omit(original)))&&feed([last],row3,'shopper').for('shopper').length===1,'FUNCTIONAL_DEFECT:VRM143_PENDING_HR');const blocked=await invoke('shopper',blockedRequest);const blockedDocs=await Promise.all(Object.values(docRefs.get(blockedRequest.idempotencyKey)).map(x=>x.get()));check(blocked.ok===false&&blocked.code==='OPS_VISIT_REQUEST_ALREADY_PENDING'&&blockedDocs.every(x=>!x.exists)&&hash(stable((await ref.get()).data()))===hash(stable(row3)),'PERSISTENCE_FAILURE:VRM143_PENDING_HR_SECOND_REQUEST');}
      else {check(row3.rescheduleRequest.status==='approved'&&row3.agendada===future&&feed([last],row3,'shopper').for('shopper').length===0,'FUNCTIONAL_DEFECT:VRM143_COMPLETED_RESCHEDULE');const finalUnrelated=v=>{const x=omit(v);for(const k of ['agendada','estado','status','pendienteAgendamiento','franjaCode'])delete x[k];return x;};check(hash(stable(finalUnrelated(row3)))===hash(stable(finalUnrelated(original))),'PERSISTENCE_FAILURE:VRM143_RESCHEDULE_UNRELATED_DRIFT');}
      result.cases.push({type,cycle1,cycle2,providerAck:true,independentDurableReadback:true,newSessionOldReplayZeroWrites:true,requestAndDecisionCycleExact:true,secondCycleClearsPriorDecision:true,oldNoticeNotReactivated:true,authorizedHistoryPreserved:true,unrelatedVisitFieldsPreserved:true,finalStatus:row3[field].status,commands:4,providerWrites:16});save();
    }
    result.functionalPass=true;
  }catch(error){result.error=String(error?.message||error).replace(/Bearer\s+\S+|eyJ[A-Za-z0-9_.-]+/g,'[TOKEN]').slice(0,1200);result.classification=result.error.split(':')[0];}
  finally{
    try{
      const entries=[...owned.values()];let deleted=0;
      await db.runTransaction(async tx=>{const docs=await Promise.all(entries.map(x=>tx.get(x.ref)));for(let i=0;i<entries.length;i++){const x=entries[i],doc=docs[i];if(!doc.exists)continue;const v=doc.data();let ok=false;
        if(x.kind==='member')ok=hash(stable(v))===x.expected.sha256&&v.qaPurpose==='VRM143'&&v.qaRunId===runId;
        if(x.kind==='visit')ok=v.id===x.expected.visitId&&v.qaSynthetic===true&&v.qaRunId===runId&&v.qaRunAttempt===attempt&&v.qaPurpose==='VRM143'&&v.tenantId===tenantId&&v.projectId===projectId;
        if(x.kind==='receipt')ok=v.entityId===x.expected.visitId&&v.commandType===x.expected.type&&identities.some(i=>i.uid===v.actorUid)&&v.status==='committed';
        if(x.kind==='audit')ok=v.entityId===x.expected.visitId&&v.idempotencyKey===x.expected.key&&v.tenantId===tenantId&&v.projectId===projectId&&identities.some(i=>i.uid===v.actorUid);
        if(x.kind==='bulletin')ok=v.entityId===x.expected.visitId&&v.idempotencyKey===x.expected.key&&v.tenantId===tenantId&&v.projectId===projectId&&v.source==='cxorbia-operational-command-provider-v1';
        check(ok,'PERSISTENCE_FAILURE:VRM143_CLEANUP_OWNERSHIP:'+x.kind);
      }for(let i=0;i<entries.length;i++)if(docs[i].exists){tx.delete(entries[i].ref);deleted++;}});
      const left=await Promise.all(entries.map(x=>x.ref.get()));check(left.every(x=>!x.exists),'PERSISTENCE_FAILURE:VRM143_DOCUMENT_RESIDUE');
      let authDeleted=0;for(const identity of identities){if(!identity.authIdentity){try{await auth.getUser(identity.uid);throw Error('AUTH_FAILURE:VRM143_UNVERIFIED_AUTH_CREATION');}catch(error){if(error.code!=='auth/user-not-found')throw error;}continue;}const u=await auth.getUser(identity.uid);check(hash(stable(authShape(u)))===hash(stable(identity.authIdentity))&&[hash(stable(identity.claims)),hash({})].includes(hash(stable(u.customClaims||{}))),'AUTH_FAILURE:VRM143_AUTH_CLEANUP_OWNERSHIP');await auth.deleteUser(identity.uid);authDeleted++;try{await auth.getUser(identity.uid);throw Error('AUTH_FAILURE:VRM143_AUTH_RESIDUE');}catch(error){if(error.code!=='auth/user-not-found')throw error;}}
      result.cleanup={ok:true,documentsDeleted:deleted,authDeleted,remainingDocuments:0,remainingAuth:0};
      const after=await hr();result.hrAfter=after.revision;check(after.http===200&&after.sourceSafe===true&&after.revisionStable===true&&after.hrWrites===false&&after.production===false&&result.hrAfter===expectedHr,'PROVIDER_FAILURE:VRM143_HR_CHANGED');
      result.realProjectUnchanged=beforeProject===hash(stable((await project.get()).data()));result.productionIndexUnchanged=beforeProduction===hash(Buffer.from(await (await fetch('https://tya-plataforma.web.app/',{cache:'no-store'})).arrayBuffer()));check(result.realProjectUnchanged&&result.productionIndexUnchanged,'PERSISTENCE_FAILURE:VRM143_REAL_SCOPE_CHANGED');
      const cp=await import('node:child_process'),runtime=JSON.parse(cp.execFileSync('gcloud',['run','services','describe',s(e.SERVICE),'--project',projectName,'--region',s(e.REGION),'--format=json'],{encoding:'utf8'}));result.runtimeTrafficExact=runtime.status?.latestReadyRevisionName===result.runtimeRevision&&(runtime.status?.traffic||[]).filter(t=>t.revisionName===result.runtimeRevision&&t.percent===100).length===1;check(result.runtimeTrafficExact,'ENVIRONMENT_FAILURE:VRM143_RUNTIME_CHANGED');
      const token=cp.execFileSync('gcloud',['auth','print-access-token'],{encoding:'utf8'}).trim(),hosting=await request('https://firebasehosting.googleapis.com/v1beta1/sites/'+s(e.HOSTING_SITE)+'/channels/live',{headers:{authorization:'Bearer '+token}});result.hostingVersionExact=hosting.http===200&&hosting.release?.version?.name===result.hostingVersion;check(result.hostingVersionExact,'ENVIRONMENT_FAILURE:VRM143_HOSTING_CHANGED');
    }catch(error){result.cleanup.ok=false;result.cleanup.error=String(error?.message||error).slice(0,1000);}
    if(result.functionalPass&&result.cleanup.ok)result.decision='PASS_VRM143_LIVE_PROVIDER_EXACT_CYCLE_AND_SERVED_CONSUMER';save();
  }
  console.log(JSON.stringify({decision:result.decision,sourceSha,cases:result.cases.length,cleanup:result.cleanup,error:result.error||null}));if(result.decision!=='PASS_VRM143_LIVE_PROVIDER_EXACT_CYCLE_AND_SERVED_CONSUMER')process.exitCode=2;
}

if(process.env.CXORBIA_I3_QA_SCOPE==='HR_DURABLE_REVISION_READONLY'){
  await runHrDurableRevisionDiagnostic();
}else if(process.env.CXORBIA_I3_QA_SCOPE==='VRM143_NOTIFICATION_CYCLE'){
  await runNotificationCycleQa();
}else if(process.env.CXORBIA_I3_QA_SCOPE==='F09_CLIENT_COLLABORATION'){
  await runClientCollaborationQa();
}else{
const env=process.env,str=v=>String(v??'').trim(),sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v),'utf8').digest('hex');
const runId=str(env.GITHUB_RUN_ID),sourceSha=str(env.FOCAL_SOURCE),expectedHr=str(env.EXPECTED_HR_REVISION);
const host=str(env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const projectName=str(env.PROJECT||'cxorbia-backend-dev'),tenantId='tya',projectId='cinepolis',periodId='cinepolis-2026-11';
const out=str(env.QA_OUT||'.tmp/i3-run2382-academy-b7-synthetic');
if(env.CXORBIA_I3_QA_ISOLATED_WRITE_GATE!=='PAULA_AUTHORIZED_RUN2382_DEV_ONLY'||
   projectName!=='cxorbia-backend-dev'||host!=='https://cxorbia-backend-dev.web.app'||
   !/^\d{8,}$/.test(runId)||!/^[a-f0-9]{40}$/.test(sourceSha)||!/^[a-f0-9]{64}$/.test(expectedHr)){
  throw Error('SOURCE_FAILURE:QA_SCOPE_GATE_DENIED');
}
fs.mkdirSync(out,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:projectName});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId),proj=tenant.collection('projects').doc(projectId);
const baseCourses=JSON.parse(fs.readFileSync(new URL('../../backend/contracts/cxorbia-academy-base-progress-contract-v1.json',import.meta.url),'utf8')).courses;
const progressCourse=baseCourses.find(c=>c.audience==='shopper'&&c.courseId==='s_ruta');
const lesson=progressCourse?.lessons.find(l=>l.id==='sr1');
if(!lesson||lesson.quiz.length)throw Error('SOURCE_FAILURE:EXACT_SOURCE_BASE_LESSON_DRIFT');
const result={schemaVersion:'cxorbia.i3.run2382.qa-academy-b7-live.v1',decision:'HOLD',classification:null,
  runId,sourceSha,environment:projectName,production:false,periodId,hrBefore:null,hrAfter:null,
  academia:{},postulaciones:{},qaIdentitiesCreated:0,qaIdentitiesDeleted:0,cleanup:{ok:false,docFailures:[],authFailures:[],residue:[]},
  safety:{realLearnerWrites:0,realVisitsWritten:0,hrWrites:0,paymentWrites:0,productionDeploys:0}};
const persist=()=>fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');
const ensure=(yes,category,code)=>{if(!yes)throw Error(category+':'+code)};
const delDocs=new Map(),createdAuth=[];
function queue(ref){delDocs.set(ref.path,ref);return ref}
function receipt(command){return queue(tenant.collection('commandReceipts').doc(sha(`${tenantId}\0${projectId}\0${periodId}\0${command.idempotencyKey}`).slice(0,40)))}
function audit(command){return queue(tenant.collection('entityAuditTrail').doc(sha(`${command.idempotencyKey}\0${command.commandType}\0${command.entityId||''}`).slice(0,40)))}
async function json(url,options={}){
  const response=await fetch(url,{...options,signal:AbortSignal.timeout(90000)});
  const body=await response.json().catch(()=>({}));return {http:response.status,...body};
}
async function hrMeta(){
  const m=await json(`${host}/api/tya/cinepolis/hr-live?format=meta&qa=${runId}-${Date.now()}`,
    {headers:{'cache-control':'no-cache, no-store'}});
  ensure(m.http===200&&m.ok===true&&m.sourceSafe===true&&m.revisionStable===true&&m.hrWrites===false&&m.production===false,'PROVIDER_FAILURE','HR_META_CONTRACT');
  return str(m.revision);
}
async function apiKey(){
  const j=await json(host+'/__/firebase/init.json',{headers:{'cache-control':'no-store'}});
  ensure(j.http===200&&str(j.apiKey),'ENVIRONMENT_FAILURE','DEV_AUTH_INITIALIZATION');return str(j.apiKey);
}
async function qaIdentity(letter,key){
  const uid=`qa_i3_${runId}_${letter}`,shopperId=`qa_i3_shopper_${runId}_${letter}`;
  const memberRef=queue(tenant.collection('users').doc(uid));
  ensure(!(await memberRef.get()).exists,'SOURCE_FAILURE','QA_MEMBER_COLLISION_'+letter);
  try{await auth.getUser(uid);throw Error('SOURCE_FAILURE:QA_AUTH_COLLISION_'+letter)}
  catch(e){if(e?.code!=='auth/user-not-found')throw e}
  const claims={tenantId,projectIds:[projectId],role:'shopper',authNamespace:'shopper',shopperId};
  await auth.createUser({uid,displayName:'QA Recovery '+letter,disabled:false});createdAuth.push(uid);
  await auth.setCustomUserClaims(uid,claims);
  await memberRef.create({uid,tenantId,projectIds:[projectId],role:'shopper',authNamespace:'shopper',shopperId,
    name:'QA Recovery '+letter,active:true,status:'active',qaSynthetic:true,qaRunId:runId});
  result.qaIdentitiesCreated++;
  return {uid,shopperId};
}
async function identityToken(uid,key){
  const user=await auth.getUser(uid),custom=await auth.createCustomToken(uid,user.customClaims||{});
  const j=await json('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(key),
    {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true})});
  ensure(j.http===200&&str(j.idToken),'AUTH_FAILURE','DEV_QA_LOGIN_'+j.http);
  const claims=await auth.verifyIdToken(j.idToken,true);
  ensure(claims.uid===uid&&claims.tenantId===tenantId&&claims.role==='shopper'&&claims.authNamespace==='shopper','AUTH_FAILURE','QA_CLAIMS_INVALID');
  return j.idToken;
}
async function command(token,c){return json(host+'/v1/cxorbia/commands',
  {method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify(c)});}
function op(type,id,key,expectedVersion,payload,entityType='application'){
  const c={version:'cxorbia-command-adapter-v1',commandType:type,entityType,entityId:id,tenantId,projectId,periodId,
    expectedVersion,idempotencyKey:`qa-i3-${runId}-${key}`,authorization:{providerEnforcementRequired:true},
    payload,audit:{reason:'QA synthetic DEV RUN2382',correlationId:`qa-i3-${runId}-${key}`}};
  receipt(c);audit(c);return c;
}
async function applyPostulation(caseName,who,shopToken,adminToken,proposedDate,approval){
  const visitId=`QA_I3_${runId}_${caseName}_VISIT`,postId=`QA_I3_${runId}_${caseName}_APPLICATION`;
  const visitRef=queue(proj.collection('visits').doc(visitId)),postRef=queue(proj.collection('postulations').doc(postId));
  ensure(!(await visitRef.get()).exists&&!(await postRef.get()).exists,'SOURCE_FAILURE','QA_POSTULATION_ID_COLLISION');
  await visitRef.create({id:visitId,visitId,hrRowId:visitId,tenantId,projectId,periodId,periodKey:'2026-11',
    estado:'disponible',status:'disponible',shopperId:null,pais:'GT',sucursal:'QA SYNTHETIC DEV',
    assignmentSource:'platform',qaSynthetic:true,qaRunId:runId,version:1,
    canonicalFacets:{available:true,assigned:false,scheduled:false,realized:false,submitted:false,paymentConfirmed:false,cancelled:false}});
  const create=op('application.create',postId,caseName+'-create','absent',
    {visitId,hrRowId:visitId,shopperId:who.shopperId,proposedDate,note:'QA EXCLUSIVAMENTE'});
  const made=await command(shopToken,create);
  ensure(made.ok===true&&made.providerAck===true&&made.status==='committed','PERSISTENCE_FAILURE','CREATE_'+caseName+':'+str(made.code));
  ensure((await postRef.get()).data()?.shopperId===who.shopperId,'PERSISTENCE_FAILURE','CREATE_READBACK_'+caseName);
  const createAgain=await command(shopToken,create);
  ensure(createAgain.ok===true&&createAgain.idempotentReplay===true&&Number(createAgain.providerWrites)===0,'PERSISTENCE_FAILURE','CREATE_IDEMPOTENCE_'+caseName);
  const decide=op('application.status.update',postId,caseName+'-decision',1,
    {status:approval?'aprobada':'rechazada',reason:'QA administracion DEV'});
  const notice=queue(tenant.collection('bulletins').doc('application-approval-'+receiptIdUnqueued(decide)));
  const approved=await command(adminToken,decide);
  ensure(approved.ok===true&&approved.providerAck===true&&approved.status==='committed','PERSISTENCE_FAILURE','DECISION_'+caseName+':'+str(approved.code));
  const p=(await postRef.get()).data(),v=(await visitRef.get()).data(),n=await notice.get();
  ensure(p?.status===(approval?'aprobada':'rechazada')&&p?.version===2,'PERSISTENCE_FAILURE','DECISION_READBACK_'+caseName);
  const [cr,dr,ca,da]=await Promise.all([receipt(create).get(),receipt(decide).get(),audit(create).get(),audit(decide).get()]);
  ensure(cr.exists&&dr.exists&&ca.exists&&da.exists,'PERSISTENCE_FAILURE','RECEIPT_AUDIT_'+caseName);
  if(approval){
    ensure(v.shopperId===who.shopperId&&v.assignmentSyncStatus==='pending_hr'&&v.approvedApplicationId===postId,
      'PERSISTENCE_FAILURE','VISIT_ASSIGNMENT_READBACK');
    const body=n.exists?n.data():{};
    ensure(n.exists&&body.operational===true&&body.eventKey==='postulation_approved_visit_assigned'&&
      body.actionRoute==='misvisitas'&&body.toRole==='shopper'&&body.entityId===visitId&&
      JSON.stringify(body.targetShopperIds)==='["'+who.shopperId+'"]'&&JSON.stringify(body.targetProjectIds)==='["'+projectId+'"]',
      'MAPPING_FAILURE','SINGLE_SHOPPER_NOTICE');
  }else{
    ensure(!n.exists&&v.shopperId==null&&v.estado==='disponible','MAPPING_FAILURE','REJECTED_MUST_NOT_ASSIGN_OR_NOTIFY');
  }
  const replay=await command(adminToken,decide);
  ensure(replay.ok===true&&replay.idempotentReplay===true&&Number(replay.providerWrites)===0,
    'PERSISTENCE_FAILURE','DECISION_IDEMPOTENCE_'+caseName);
  const persisted=await postRef.get();
  ensure(persisted.data()?.version===2,'PERSISTENCE_FAILURE','DUPLICATE_DECISION_VERSION_'+caseName);
  return {status:p.status,approval,ack:true,postulationReadback:true,assignmentReadback:approval,
    shopperTargetExact:approval?'single_shopper':'no_approval_notice',receiptsAndAudits:true,idempotentReplay:true};
}
function receiptIdUnqueued(command){return sha(`${tenantId}\0${projectId}\0${periodId}\0${command.idempotencyKey}`).slice(0,40)}
async function lessonProgress(who,firstToken,other,otherToken,key){
  const payload={origin:'base',audience:'shopper',courseId:progressCourse.courseId,revision:progressCourse.revision,lessonId:lesson.id,answers:[]};
  const c={version:'cxorbia-command-adapter-v1',commandType:'academy.progress.lesson.complete',entityType:'academyProgress',entityId:payload.courseId,
    tenantId,projectId,periodId,idempotencyKey:`qa-i3-${runId}-academy-sr1`,expectedVersion:0,
    authorization:{providerEnforcementRequired:true},payload};
  const keyDigest=sha([who.uid,c.idempotencyKey]),receiptKey='academy-progress-'+keyDigest.slice(0,40);
  queue(tenant.collection('commandReceipts').doc(receiptKey));queue(tenant.collection('academyAudit').doc(receiptKey));
  queue(tenant.collection('entityAuditTrail').doc(receiptKey));
  ensure(!(await tenant.collection('users').doc(who.uid).get()).data()?.academyProgress,'SOURCE_FAILURE','SYNTHETIC_USER_HAS_PROGRESS');
  const a=await command(firstToken,c);
  ensure(a.ok===true&&a.status==='committed'&&a.providerAck===true&&a.successUiAllowed===true&&a.providerWrites===4,
    'PERSISTENCE_FAILURE','ACADEMY_LESSON_ACK:'+str(a.code));
  const member=await tenant.collection('users').doc(who.uid).get(),state=member.data()?.academyProgress;
  ensure(state?.ownerUid===who.uid&&state.tenantId===tenantId&&Object.values(state.courses||{}).some(v=>v.courseId==='s_ruta'&&v.lessons?.sr1===100&&v.version===1),
    'PERSISTENCE_FAILURE','ACADEMY_PROGRESS_READBACK');
  const newSessionToken=await identityToken(who.uid,key);
  const replay=await command(newSessionToken,c);
  ensure(replay.ok===true&&replay.idempotentReplay===true&&replay.providerWrites===0,
    'PERSISTENCE_FAILURE','ACADEMY_NEW_SESSION_REPLAY');
  ensure(!(await tenant.collection('users').doc(other.uid).get()).data()?.academyProgress,
    'MAPPING_FAILURE','ACADEMY_OTHER_LEARNER_PROGRESS_CONTAMINATED');
  const wrongAudience={...c,idempotencyKey:`qa-i3-${runId}-academy-wrong-role`,payload:{...c.payload,audience:'cliente'}};
  const denied=await command(otherToken,wrongAudience);
  ensure(denied.ok===false&&denied.providerWrites===0,'AUTH_FAILURE','ACADEMY_INVALID_AUDIENCE_NOT_BLOCKED');
  ensure(!(await tenant.collection('users').doc(other.uid).get()).data()?.academyProgress,
    'MAPPING_FAILURE','ACADEMY_WRONG_ROLE_MUTATED');
  const [rr,ar,tr]=await Promise.all([tenant.collection('commandReceipts').doc(receiptKey).get(),
    tenant.collection('academyAudit').doc(receiptKey).get(),tenant.collection('entityAuditTrail').doc(receiptKey).get()]);
  ensure(rr.exists&&ar.exists&&tr.exists,'PERSISTENCE_FAILURE','ACADEMY_RECEIPT_AUDIT');
  return {baseCourse:'s_ruta',lesson:'sr1',separateQaLearner:sha(who.uid).slice(0,12),
    providerAck:true,durableProgress:true,independentNewSession:true,idempotentReplay:true,
    secondLearnerUnchanged:true,otherAudienceDenied:true,auditsAndReceipts:true};
}
let error=null;
try{
  // Hosting does not proxy /health; the live scoped HR meta contract is the
  // correct DEV-only no-write runtime assertion for this endpoint.
  result.hrBefore=await hrMeta();ensure(result.hrBefore===expectedHr,'PROVIDER_FAILURE','HR_BEFORE_MISMATCH');
  ensure((await proj.get()).exists,'SOURCE_FAILURE','PROJECT_MISSING');
  const key=await apiKey(),who=await qaIdentity('a',key),other=await qaIdentity('b',key);
  const [shopToken,otherToken]=await Promise.all([identityToken(who.uid,key),identityToken(other.uid,key)]);
  const members=await tenant.collection('users').get();
  const admins=members.docs.map(d=>({uid:d.id,...d.data()})).filter(u=>u.active===true&&
    ['admin','super'].includes(str(u.role))&&u.authNamespace==='staff'&&
    (u.role==='super'||Array.isArray(u.projectIds)&&u.projectIds.includes(projectId)));
  ensure(admins.length>0,'AUTH_FAILURE','ADMIN_MISSING');
  const adminToken=await identityTokenStaff(admins[0].uid,key);
  result.academia=await lessonProgress(who,shopToken,other,otherToken,key);
  const localDate=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Guatemala',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const proposedDate=new Date(localDate+'T12:00:00Z');proposedDate.setUTCDate(proposedDate.getUTCDate()+4);
  const when=proposedDate.toISOString().slice(0,10);
  result.postulaciones.approve=await applyPostulation('approved',who,shopToken,adminToken,when,true);
  result.postulaciones.reject=await applyPostulation('rejected',other,otherToken,adminToken,when,false);
  const targetBulletin=await tenant.collection('bulletins').doc('application-approval-'+receiptIdUnqueued(op('application.status.update',`QA_I3_${runId}_approved_APPLICATION`,'approved-decision',1,{status:'aprobada',reason:'QA administracion DEV'}))).get();
  ensure(targetBulletin.exists&&targetBulletin.data().targetShopperIds?.includes(who.shopperId)&&
    !targetBulletin.data().targetShopperIds?.includes(other.shopperId),'MAPPING_FAILURE','B7_OTHER_SHOPPER_NOT_EXCLUDED');
  result.postulaciones.otherShopperExcluded=true;
  result.hrAfter=await hrMeta();ensure(result.hrAfter===expectedHr,'PROVIDER_FAILURE','HR_AFTER_MISMATCH');
}catch(e){error=str(e?.message||e);result.failure=error;result.classification=/^(SOURCE_FAILURE|MAPPING_FAILURE|PROVIDER_FAILURE|AUTH_FAILURE|ENVIRONMENT_FAILURE)/.test(error)?error.split(':')[0]:'PERSISTENCE_FAILURE';}
finally{
  for(const ref of [...delDocs.values()].reverse()){
    try{await ref.delete();if((await ref.get()).exists)result.cleanup.residue.push(ref.path)}
    catch(e){result.cleanup.docFailures.push({path:ref.path,error:str(e?.code||e?.message)})}
  }
  for(const uid of [...createdAuth].reverse()){
    try{await auth.deleteUser(uid);result.qaIdentitiesDeleted++;
      try{await auth.getUser(uid);result.cleanup.residue.push('auth:qa-user-still-present')}
      catch(e){if(e?.code!=='auth/user-not-found')throw e}}
    catch(e){result.cleanup.authFailures.push({uidHash:sha(uid).slice(0,12),error:str(e?.code||e?.message)})}
  }
}
result.cleanup.ok=result.cleanup.docFailures.length===0&&result.cleanup.authFailures.length===0&&result.cleanup.residue.length===0&&result.qaIdentitiesCreated===result.qaIdentitiesDeleted;
result.decision=!error&&result.cleanup.ok&&result.academia.providerAck&&result.postulaciones.otherShopperExcluded&&result.hrAfter===result.hrBefore
  ?'PASS_I3_RUN2382_ACADEMY_B7_SYNTHETIC_DEV':'HOLD_I3_RUN2382_ACADEMY_B7_SYNTHETIC_DEV';
persist();console.log(JSON.stringify(result,null,2));
if(result.decision!=='PASS_I3_RUN2382_ACADEMY_B7_SYNTHETIC_DEV')process.exitCode=2;

async function identityTokenStaff(uid,key){
  const member=await tenant.collection('users').doc(uid).get();
  ensure(member.exists,'AUTH_FAILURE','STAFF_MEMBER_NOT_FOUND');
  const user=await auth.getUser(uid),custom=await auth.createCustomToken(uid,user.customClaims||{});
  const r=await json('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(key),
    {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true})});
  ensure(r.http===200&&r.idToken,'AUTH_FAILURE','ADMIN_CUSTOM_TOKEN_EXCHANGE');
  const decoded=await auth.verifyIdToken(r.idToken,true);
  ensure(['admin','super'].includes(decoded.role)&&decoded.tenantId===tenantId&&decoded.authNamespace==='staff',
    'AUTH_FAILURE','ADMIN_ROLE_CLAIMS');return r.idToken;
}

}
