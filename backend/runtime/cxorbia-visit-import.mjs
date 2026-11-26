import {createHash} from 'node:crypto';

export const IMPORT_COMMANDS = ['import.visits.dry_run', 'import.visits.commit', 'import.visits.read'];
const fields = ['ref', 'sucursal', 'ciudad', 'escenario', 'quincena', 'franja', 'fecha'];
const clean = value => typeof value === 'string' ? value.trim() : '';
const norm = value => clean(value).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/\s+/g,' ');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const segment = value => typeof value === 'string' && /^[\w-][\w.:-]{0,159}$/.test(value);
const sha = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const validDate = value => /^\d{4}-\d\d-\d\d$/.test(value) && !isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value;
const requireValue = (condition, code) => { if (!condition) throw new Error('E10_'+code); };
const natural = row => [row.sucursal,row.ciudad,row.escenario,row.quincena].map(norm).join('|');
const projectRow = row => Object.fromEntries(fields.map(key=>[key,clean(row[key])]));
const rowHash = row => hash(fields.map(key=>clean(row[key])));

function checkMembership(member, actor, command) {
  requireValue(member?.active===true && member.tenantId===command.tenantId && member.role==='admin' &&
    member.authNamespace==='staff' && member.projectIds?.includes(command.projectId) &&
    !['inactive','disabled','deleted','revoked'].includes(member.status) && actor.role==='admin' &&
    actor.namespace==='staff' && actor.tenantId===command.tenantId && actor.projectId===command.projectId,'MEMBERSHIP_DENIED');
}

function allowedDate(period, value) {
  if (!validDate(value)) return false;
  const start = period.startDate || period.fechaInicio;
  const end = period.endDate || period.fechaFin;
  if (start || end) return validDate(start) && validDate(end) && start<=value && value<=end;
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const keys = new Set();
  for (const key of [period.periodKey,period.key,period.periodId,period.periodo,period.ronda,period.name]) {
    const label = clean(key).toLowerCase();
    for (const match of label.matchAll(/(20\d\d)[-/](0?[1-9]|1[0-2])(?!\d)/g))
      keys.add(match[1]+'-'+match[2].padStart(2,'0'));
    for (const match of label.matchAll(/\b(ene(?:ro)?|feb(?:rero)?|mar(?:zo)?|abr(?:il)?|may(?:o)?|jun(?:io)?|jul(?:io)?|ago(?:sto)?|sep(?:tiembre)?|oct(?:ubre)?|nov(?:iembre)?|dic(?:iembre)?)[\s./-]+(20\d\d|\d\d)\b/g))
      keys.add((match[2].length===2?'20':'')+match[2]+'-'+String(months.indexOf(match[1].slice(0,3))+1).padStart(2,'0'));
  }
  return keys.size===1 && keys.has(value.slice(0,7));
}

function classify(rows, existing, scope, period, sourceDigest) {
  const references=new Map(), naturals=new Map(), creates=[], outcomes=[];
  function index(map,key,row) {
    if (!key) return;
    const entries=map.get(key)||[];
    entries.push(row);
    map.set(key,entries);
  }
  function add(row) {
    index(references,norm(row.ref||row.extId),row);
    index(naturals,natural(row),row);
  }
  for (const row of existing) add(row);
  for (const [indexInFile,raw] of rows.entries()) {
    const row=projectRow(raw||{}), digest=rowHash(row);
    const sourceRowId='row-'+hash([sourceDigest,indexInFile,digest]);
    const outcome={index:indexInFile,rowDigest:digest,sourceRowId};
    const badShape=!raw||typeof raw!=='object'||Array.isArray(raw)||
      Object.keys(raw).some(k=>!fields.includes(k))||
      fields.some(k=>raw[k]!=null&&(typeof raw[k]!=='string'||raw[k].length>240||/[\u0000-\u001f<>]/.test(raw[k])));
    if (badShape||!row.sucursal||!allowedDate(period,row.fecha)) {
      outcomes.push({...outcome,state:'discarded',reason:badShape?'FIELD_DENIED':!row.sucursal?'BRANCH_REQUIRED':'DATE_OR_PERIOD'});
      continue;
    }
    const ref=norm(row.ref), key=natural(row);
    const hits=new Set([...(references.get(ref)||[]),...(naturals.get(key)||[])]);
    if (hits.size) {
      const [prior]=hits;
      const duplicate=hits.size===1 && rowHash({...prior,ref:prior.ref||prior.extId,fecha:prior.fecha||prior.disponibleDesde})===digest;
      outcomes.push({...outcome,state:duplicate?'duplicate':'conflict',reason:duplicate?'EXACT_ROW':'REF_OR_NATURAL_KEY'});
      continue;
    }
    const id='e10-'+hash([scope.tenantId,scope.projectId,scope.periodId,scope.countryCode,ref||key]);
    const visit={...row,...scope,id,visitId:id,extId:row.ref,periodKey:row.fecha.slice(0,7),pais:scope.countryCode,
      status:'disponible',estado:'disponible',availableFrom:row.fecha,disponibleDesde:row.fecha,
      shopperId:null,shopper:null,version:1,importRowDigest:digest,importSourceRowId:sourceRowId};
    creates.push(visit);
    add(visit);
    outcomes.push({...outcome,state:'new',visitId:id});
  }
  return {creates,outcomes};
}

async function verifyImport(project, run, exact) {
  const snap=await project.collection('hrImportRuns').doc(run.id).get();
  const saved=snap.data();
  requireValue(saved && saved.plan===run.plan && saved.actorUid===run.actorUid && saved.digest===run.digest &&
    saved.tenantId===run.tenantId && saved.periodId===run.periodId && saved.projectId===run.projectId && saved.countryCode===run.countryCode && saved.sourceDigest===run.sourceDigest &&
    saved.mappingDigest===run.mappingDigest && hash(saved.outcomes)===hash(run.outcomes),'RECEIPT_READBACK_PENDING');
  const auditRef=project.collection('hrImportRuns').doc('audit-'+run.digest);
  requireValue(saved.auditRef===auditRef.path,'AUDIT_READBACK_PENDING');
  const [auditSnap,accessSnap]=await Promise.all([auditRef.get(),project.collection('hrImportRuns').doc('visit-access-v1').get()]);
  const audit=auditSnap.data(),access=accessSnap.data();
  requireValue(access?.kind==='imported_visit_query_scope' && access.tenantId===run.tenantId && access.projectId===run.projectId,
    'ACCESS_MARKER_READBACK_PENDING');
  requireValue(audit?.actorUid===run.actorUid && audit.plan===run.plan && audit.importRunId===run.id &&
    audit.sourceDigest===run.sourceDigest && audit.mappingDigest===run.mappingDigest,'AUDIT_READBACK_PENDING');
  await Promise.all(saved.outcomes.filter(row=>row.state==='conflict').map(async row=>{
    const ref=project.collection('importConflicts').doc(hash([run.digest,row.index]));
    const conflict=(await ref.get()).data();
    requireValue(conflict?.importRunId===run.id && conflict.sourceRowDigest===row.rowDigest &&
      conflict.index===row.index && conflict.periodId===run.periodId && conflict.sourceRowId===row.sourceRowId,'CONFLICT_READBACK_PENDING');
  }));
  const ids=saved.outcomes.filter(row=>row.state==='new');
  const visits=await Promise.all(ids.map(row=>project.collection('visits').doc(row.visitId).get()));
  for(const [i,visit] of visits.entries()) {
    const data=visit.data();
    requireValue(data && data.importRunId===run.id && data.importRowDigest===ids[i].rowDigest && data.importSourceRowId===ids[i].sourceRowId &&
      data.tenantId===run.tenantId && data.projectId===run.projectId && data.periodId===run.periodId &&
      (!exact || rowHash(data)===ids[i].rowDigest),'VISIT_READBACK_PENDING');
  }
  return saved;
}

export async function executeVisitImport(db,command,actor) {
  const {tenantId,projectId,periodId,commandType}=command, payload=command.payload||{};
  requireValue([tenantId,projectId,periodId].every(segment) && command.entityType==='hrImport' &&
    command.authorization?.permission===commandType && IMPORT_COMMANDS.includes(commandType),'SCOPE_OR_PERMISSION');
  requireValue(actor.role==='admin' && actor.namespace==='staff','ROLE_DENIED');
  const project=db.doc('tenants/'+tenantId+'/projects/'+projectId);
  const member=db.doc('tenants/'+tenantId+'/users/'+actor.uid);
  if (commandType==='import.visits.read') {
    requireValue(/^e10-[0-9a-f]{64}$/.test(command.entityId||''),'RECEIPT_ID');
    const [m,s]=await Promise.all([member.get(),project.collection('hrImportRuns').doc(command.entityId).get()]);
    checkMembership(m.data(),actor,command);
    const run=s.data();
    requireValue(run && run.actorUid===actor.uid && run.tenantId===tenantId && run.projectId===projectId && run.periodId===periodId,'RECEIPT_SCOPE');
    await verifyImport(project,run,false);
    return {ok:true,status:'readback',providerAck:false,committed:false,readbackVerified:true,providerWrites:0,runId:run.id,outcomes:run.outcomes};
  }
  const {rows,countryCode,mappingDigest,sourceDigest}=payload;
  requireValue(!command.entityId && sha(mappingDigest) && sha(sourceDigest) && /^[A-Z]{2}$/.test(countryCode) &&
    Object.keys(payload).every(key=>['rows','countryCode','mappingDigest','sourceDigest','plan'].includes(key)) &&
    Array.isArray(rows) && rows.length>0 && rows.length<=400,'INPUT_OR_ATOMIC_BATCH_SIZE');
  const identity=[tenantId,projectId,periodId,countryCode,sourceDigest,mappingDigest];
  const inputRows=rows.map(raw=>{
    if(!raw || typeof raw!=='object' || Array.isArray(raw))return ['invalid',typeof raw];
    return Object.keys(raw).sort().map(key=>[key,typeof raw[key],typeof raw[key]==='string'?raw[key]:null]);
  });
  const digest=hash([...identity,inputRows]);
  const runId='e10-'+digest, runRef=project.collection('hrImportRuns').doc(runId);
  const commit=commandType==='import.visits.commit';
  if(commit)requireValue(command.idempotencyKey==='import:'+digest && sha(payload.plan),'CONFIRMATION_REQUIRED');
  const result=await db.runTransaction(async tx=>{
    const periodRef=project.collection('periods').doc(periodId);
    // Serialize overlapping batches, including different files sharing natural keys.
    const lockRef=project.collection('hrImportRuns').doc('lock-'+hash([periodId,countryCode]));
    const accessRef=project.collection('hrImportRuns').doc('visit-access-v1');
    const [memberSnap,projectSnap,periodSnap,prior,lock,access]=await Promise.all(
      [member,project,periodRef,runRef,lockRef,accessRef].map(ref=>tx.get(ref)));
    if(access.exists)requireValue(access.data().tenantId===tenantId && access.data().projectId===projectId &&
      access.data().kind==='imported_visit_query_scope','INVALID_ACCESS_MARKER');
    checkMembership(memberSnap.data(),actor,command);
    const config=projectSnap.data(), period=periodSnap.data();
    requireValue(config?.tenantId===tenantId && (config.projectId||config.id)===projectId && config.active!==false && !['archived','inactive','deleted','disabled'].includes(config.status) &&
      config.countries?.includes(countryCode),'PROJECT_SCOPE');
    const source=config.operationalSource||config.routeSource;
    requireValue(source?.mode==='internal' && source.providerType==='internal_firestore' && source.readPolicy==='internal_live' &&
      source.writePolicy==='platform_only' && (!source.authority?.visits||source.authority.visits==='platform'),'VISITS_SOURCE_PROTECTED');
    requireValue(period?.tenantId===tenantId && period.projectId===projectId && (period.periodId||period.id)===periodId,'PERIOD_SCOPE');
    if(prior.exists){
      const run=prior.data();
      requireValue(run.actorUid===actor.uid && run.digest===digest && (!commit||run.plan===payload.plan),'RECEIPT_CONFLICT');
      return {run,replay:true,providerWrites:0};
    }
    requireValue(period.state==='activo' && period.sourceMode==='internal','PERIOD_CLOSED_OR_EXTERNAL');
    requireValue(Number.isSafeInteger(config.version) && Number.isSafeInteger(period.version),'SCOPE_VERSION');
    const query=project.collection('visits').where('periodId','==',periodId);
    const snapshot=await tx.get(query);
    const scoped=snapshot.docs.map(s=>({...s.data(),id:s.id})).filter(v=>(v.countryCode||v.pais)===countryCode);
    const scope={tenantId,projectId,periodId,countryCode}, {creates,outcomes}=classify(rows,scoped,scope,period,sourceDigest);
    const plan=hash([digest,config.version,period.version,outcomes]);
    const run={...scope,id:runId,importRunId:runId,digest,plan,sourceDigest,mappingDigest,actorUid:actor.uid,
      hrSourceId:'file-'+sourceDigest,sourcePeriodFrom:periodId,sourcePeriodTo:periodId,
      projectVersion:config.version,periodVersion:period.version,outcomes};
    if(!commit)return {run,replay:false,providerWrites:0};
    requireValue(command.expectedVersion===config.version && payload.plan===plan,'PLAN_CHANGED');
    requireValue(creates.length>0,'NO_NEW_VISITS');
    const createdAt=new Date().toISOString();
    const currency=config.currency?.[countryCode]||period.currency?.[countryCode];
    const auditRef=project.collection('hrImportRuns').doc('audit-'+digest);
    const conflicts=outcomes.filter(row=>row.state==='conflict');
    for(const row of conflicts){
      const ref=project.collection('importConflicts').doc(hash([digest,row.index]));
      tx.create(ref,{...scope,importRunId:runId,sourceRowId:row.sourceRowId,sourceRowDigest:row.rowDigest,index:row.index,
        reason:row.reason,status:'review_required',reviewerUid:null,createdAt});
    }
    tx.create(auditRef,{...scope,kind:'import_commit_audit',importRunId:runId,actorUid:actor.uid,
      sourceDigest,mappingDigest,plan,createdAt,createdVisits:creates.length,reviewCount:conflicts.length});
    if(!access.exists)tx.create(accessRef,{tenantId,projectId,kind:'imported_visit_query_scope',firstRunId:runId});
    for(const visit of creates)tx.create(project.collection('visits').doc(visit.id),{...visit,importRunId:runId,createdAt,createdBy:actor.uid,...(currency?{currency}:{})});
    tx.create(runRef,{...run,createdAt,createdBy:actor.uid,mode:'promote_reviewed',status:'promoted_audited',auditRef:auditRef.path});
    tx.set(lockRef,{sequence:(lock.data()?.sequence||0)+1,lastRunId:runId,tenantId,projectId,periodId,countryCode});
    return {run,replay:false,providerWrites:creates.length+3+conflicts.length+(access.exists?0:1)};
  });
  const {run,replay,providerWrites}=result;
  if(commit||replay)await verifyImport(project,run,!replay);
  return {ok:true,status:commit?'committed':'dry_run',committed:commit,providerAck:commit,successUiAllowed:commit,
    readbackVerified:commit||replay,alreadyCommitted:replay,idempotentReplay:commit&&replay,providerWrites,
    tenantId,projectId,periodId,entityId:runId,runId,batchKey:'import:'+digest,plan:run.plan,
    expectedVersion:run.projectVersion,outcomes:run.outcomes,localMutation:false,localStorageWrite:false};
}
