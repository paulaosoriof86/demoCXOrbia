/* CXOrbia TyA — cumulative canonical read model composer v2.
   Pure adapter logic: no provider calls, writes or UI rendering.
   HR owns periods/visits/operational state. Protected sources enrich only exact identities,
   certifications and financial facets. Unmatched protected profiles stay in a review queue. */
(function(root){
  'use strict';
  const arr=v=>Array.isArray(v)?v:[];
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const has=v=>v!==undefined&&v!==null&&(typeof v!=='string'||v.trim()!=='');
  const str=v=>String(v==null?'':v).trim();
  const lower=v=>str(v).toLowerCase();
  const get=(obj,path)=>{let cur=obj;for(const p of String(path||'').split('.')){if(!cur||typeof cur!=='object'||!Object.prototype.hasOwnProperty.call(cur,p))return undefined;cur=cur[p];}return cur;};
  const first=(obj,paths)=>{for(const p of paths){const v=p.includes('.')?get(obj,p):obj&&obj[p];if(has(v))return v;}return '';};
  const patch=(base,extra)=>{const out=Object.assign({},base||{});for(const [k,v] of Object.entries(extra||{})){if(has(v)||typeof v==='boolean'||typeof v==='number'||Array.isArray(v)||(v&&typeof v==='object'))out[k]=clone(v);}return out;};
  const uniq=values=>[...new Set(arr(values).map(str).filter(Boolean))];
  const flattenAliases=value=>{
    const out=[];
    const walk=v=>{
      if(v==null)return;
      if(Array.isArray(v)){v.forEach(walk);return;}
      if(typeof v==='object'){Object.values(v).forEach(walk);return;}
      const s=str(v);if(s)out.push(s);
    };
    walk(value);return uniq(out);
  };
  const normalizedName=s=>{
    const direct=first(s,['nombre','displayName','display_name','fullName','shopperName','name','profile.nombre','profile.displayName','profile.fullName']);
    if(has(direct))return str(direct);
    const a=first(s,['firstName','primerNombre','first_name','profile.firstName','profile.primerNombre']);
    const b=first(s,['lastName','primerApellido','last_name','profile.lastName','profile.primerApellido']);
    return [a,b].filter(has).map(str).join(' ').trim();
  };
  function exactAliases(s){
    return uniq([
      first(s,['id','shopperId']),
      first(s,['legacyShopperId','legacy.shopperId','legacy.id']),
      ...flattenAliases(first(s,['canonicalLegacyIds','legacyLiveShopperIds','sourceShopperIds','hrShopperIds','identityAliases','aliases','crosswalk.aliases','identity.aliases','profile.aliases']))
    ]);
  }
  function normalizeProfile(raw){
    const s=clone(raw||{}), id=str(first(s,['shopperId','id']));
    const username=first(s,['username','user','login','credentials.username','credential.username','legacyCredentials.username','auth.username','account.username','profile.username']);
    const password=first(s,['pass','password','credentials.password','credential.password','legacyCredentials.password','auth.password','account.password','profile.password']);
    const department=first(s,['depto','departamento','department','profile.depto','profile.departamento','profile.department']);
    const whatsapp=first(s,['whatsapp','wa','telefono','phone','contact.whatsapp','contact.phone','profile.whatsapp','profile.telefono','profile.phone']);
    const phone=first(s,['phone','telefono','wa','whatsapp','contact.phone','contact.whatsapp','profile.phone','profile.telefono','profile.whatsapp']);
    const email=first(s,['email','correo','contact.email','profile.email','profile.correo']);
    const documentId=first(s,['dpi','documentId','documento','idNumber','profile.dpi','profile.documentId','profile.documento']);
    const aliases=exactAliases(s);
    return patch(s,{
      id,shopperId:id,legacyShopperId:str(first(s,['legacyShopperId','legacy.shopperId','legacy.id'])),exactAliases:aliases,
      nombre:normalizedName(s),pais:first(s,['pais','country','countryCode','profile.pais','profile.country']),
      ciudad:first(s,['ciudad','city','profile.ciudad','profile.city']),depto:department,departamento:department,
      whatsapp,phone,email,dpi:documentId,direccion:first(s,['direccion','address','profile.direccion','profile.address']),
      fecha_nac:first(s,['fecha_nac','fechaNacimiento','birthDate','profile.fecha_nac','profile.birthDate']),
      edad:first(s,['edad','age','profile.edad','profile.age']),sexo:first(s,['sexo','sex','profile.sexo','profile.sex']),
      banco:first(s,['banco','bank','payment.banco','payment.bank','profile.banco']),
      ctaTipo:first(s,['ctaTipo','accountType','payment.ctaTipo','payment.accountType']),
      ctaNum:first(s,['ctaNum','accountNumber','payment.ctaNum','payment.accountNumber']),
      ctaTitular:first(s,['ctaTitular','accountHolder','payment.ctaTitular','payment.accountHolder']),
      ctaMoneda:first(s,['ctaMoneda','accountCurrency','payment.ctaMoneda','payment.accountCurrency']),
      cuentaPago:first(s,['cuentaPago','payment.cuentaPago']),
      user:username,username,pass:password,password,
      sourceSafe:false,piiProtected:false,operationalProfileAvailable:true
    });
  }
  function knownFixture(s){
    const id=str(s&&s.id),name=str(s&&s.nombre),code=str(s&&s.code),email=str(s&&s.email);
    return id==='sh_ref_protegida'||id==='sh_op_parcial'||(/^sh\d+$/i.test(id)&&/^Evaluador\s+\d+$/i.test(name)&&(/^EVL-\d+$/i.test(code)||/@demo\.cxorbia$/i.test(email)));
  }
  function meaningfulProfile(s){
    if(!s||knownFixture(s))return false;
    const name=str(s.nombre),id=str(s.id);
    if(/^shp-[a-f0-9]+$/i.test(name)||(!name&&/^shp-[a-f0-9]+$/i.test(id)))return false;
    return !!(name||s.username||s.user||s.whatsapp||s.phone||s.email||s.dpi||arr(s.exactAliases).length);
  }
  function facets(v){
    const f=v&&v.canonicalFacets||{},st=lower(v&&(v.estado||v.status||v.presentationState));
    const bool=(key,fallback)=>typeof f[key]==='boolean'?f[key]:fallback;
    const assigned=bool('assigned',!!(v&&(v.shopperId||v.shopperCode||v.shopper)));
    const scheduled=bool('scheduled',assigned&&!!(v&&v.agendada));
    const submitted=bool('submitted',!!(v&&(v.submit||v.submittedAt))||['submitida','liquidada','pagada'].includes(st));
    const questionnaire=bool('questionnaire',!!(v&&v.cuestFecha)||submitted||['cuestionario','submitida','liquidada','pagada'].includes(st));
    const realized=bool('realized',!!(v&&v.realizada)||questionnaire||['realizada','cuestionario','submitida','liquidada','pagada'].includes(st));
    const outOfRange=bool('outOfRange',st==='fuera_rango');
    const cancelled=bool('cancelled',!!(v&&v._archived)||['cancelada','cancelled','archivada'].includes(st));
    const liquidationCandidate=bool('liquidationCandidate',submitted||v&&v.liquidationCandidate===true);
    const liquidationConfirmed=bool('liquidationConfirmed',v&&v.liquidationConfirmed===true||['confirmed','liquidated','liquidada'].includes(lower(v&&v.liquidationState))||['liquidada','pagada'].includes(st));
    const paymentConfirmed=bool('paymentConfirmed',v&&v.paymentConfirmed===true||['confirmed','paid','pagada'].includes(lower(v&&v.paymentState))||st==='pagada');
    const available=bool('available',st==='disponible');
    return {assigned,scheduled,realized,questionnaire,submitted,outOfRange,cancelled,available,liquidationCandidate,liquidationConfirmed,paymentConfirmed};
  }
  const sourceCoord=v=>{const t=str(v&&v.sourceTab),r=str(v&&v.sourceRow);return t&&r?`${t}::${r}`:'';};
  const visitKey=v=>str(v&&v.hrRowId)||sourceCoord(v)||str(v&&(v.visitId||v.id));
  function uniqueIndex(rows,keyFn){const m=new Map();arr(rows).forEach(row=>{const k=str(keyFn(row));if(!k)return;if(!m.has(k))m.set(k,[]);m.get(k).push(row);});return m;}
  const onlyUnique=(m,k)=>{const rows=m.get(str(k))||[];return rows.length===1?rows[0]:null;};
  function findProtectedVisit(base,indexes){
    const c=[];const add=v=>{if(v&&!c.includes(v))c.push(v);};
    add(onlyUnique(indexes.hrRow,str(base&&base.hrRowId)));add(onlyUnique(indexes.coord,sourceCoord(base)));add(onlyUnique(indexes.id,str(base&&(base.visitId||base.id))));
    if(c.length===1)return {row:c[0],conflict:false};
    if(c.length>1){const ids=new Set(c.map(v=>str(v&&(v.visitId||v.id))||str(v&&v.hrRowId)||sourceCoord(v)));return ids.size===1?{row:c[0],conflict:false}:{row:null,conflict:true};}
    return {row:null,conflict:false};
  }
  function addRelation(map,a,b){a=str(a);b=str(b);if(!a||!b)return;if(!map.has(a))map.set(a,new Set());map.get(a).add(b);}
  function profileComplete(s){return !!(str(s&&s.nombre)&&str(s&&(s.whatsapp||s.phone))&&str(s&&(s.username||s.user))&&str(s&&(s.password||s.pass)));}
  function certStatus(rows){
    const list=arr(rows);const passed=list.some(c=>c&&(
      c.approved===true||c.passed===true||c.certified===true||['aprobada','aprobado','passed','certified','vigente','completada'].includes(lower(c.status||c.estado||c.resultado))
    ));
    const presented=list.some(c=>c&&(c.presented===true||c.submitted===true||c.completed===true||has(c.submittedAt)||has(c.completedAt)||has(c.presentedAt)))||list.length>0;
    return {records:list.length,presented,passed,status:passed?'certificada':presented?'presentada':'sin_registro'};
  }
  function periodSummary(visits){
    const map=new Map();
    for(const v of arr(visits)){
      const key=str(v.periodKey)||str(v.projectId).replace(/^cinepolis-/,'')||'unknown';
      if(!map.has(key))map.set(key,{periodKey:key,total:0,available:0,assigned:0,scheduled:0,realized:0,questionnaireCompleted:0,submitted:0,liquidationCandidates:0,liquidationConfirmed:0,paymentConfirmed:0,outOfRange:0,reviewRequired:0,byCountry:{}});
      const row=map.get(key),f=facets(v);row.total++;row.available+=f.available?1:0;row.assigned+=f.assigned?1:0;row.scheduled+=f.scheduled?1:0;row.realized+=f.realized?1:0;row.questionnaireCompleted+=f.questionnaire?1:0;row.submitted+=f.submitted?1:0;row.liquidationCandidates+=f.liquidationCandidate?1:0;row.liquidationConfirmed+=f.liquidationConfirmed?1:0;row.paymentConfirmed+=f.paymentConfirmed?1:0;row.outOfRange+=f.outOfRange?1:0;row.reviewRequired+=v&&v.reviewRequired===true?1:0;const c=str(v&&v.pais||v&&v.country)||'unknown';row.byCountry[c]=(row.byCountry[c]||0)+1;
    }
    return [...map.values()].sort((a,b)=>a.periodKey.localeCompare(b.periodKey));
  }
  function compose(input){
    const hr=clone(input&&input.hr||{}),payload=clone(input&&input.protectedPayload||{});
    const projects=arr(hr.projects),baseVisits=arr(hr.visits||hr._visitas),baseShoppers=arr(hr.shoppers),basePosts=arr(hr.posts||hr._posts);
    const protectedVisits=arr(payload.visits),profiles=arr(payload.shoppers).map(normalizeProfile);
    const visitIndexes={id:uniqueIndex(protectedVisits,v=>v&&(v.visitId||v.id)),hrRow:uniqueIndex(protectedVisits,v=>v&&v.hrRowId),coord:uniqueIndex(protectedVisits,sourceCoord)};
    const relation=new Map(),protectedVisitToHrVisit=new Map(),matches=new Map(),visitConflicts=[];
    for(const base of baseVisits){
      const match=findProtectedVisit(base,visitIndexes),key=visitKey(base);
      if(match.conflict){visitConflicts.push(key);continue;}if(!match.row)continue;
      matches.set(key,match.row);const pid=str(match.row.visitId||match.row.id);if(pid)protectedVisitToHrVisit.set(pid,str(base.visitId||base.id));addRelation(relation,base.shopperId,match.row.shopperId);
    }
    const profilesById=uniqueIndex(profiles,p=>p.id),profilesByAlias=new Map();
    for(const p of profiles){for(const alias of arr(p.exactAliases)){if(!profilesByAlias.has(alias))profilesByAlias.set(alias,[]);profilesByAlias.get(alias).push(p);}}
    const liveToCanonical=new Map(),identityConflicts=[];
    for(const s of baseShoppers){
      const liveId=str(s.shopperId||s.id);if(!liveId)continue;const candidates=new Set();
      const direct=onlyUnique(profilesById,liveId);if(direct)candidates.add(str(direct.id));
      const alias=onlyUnique(profilesByAlias,liveId);if(alias)candidates.add(str(alias.id));
      const rel=relation.get(liveId);if(rel&&rel.size===1)candidates.add([...rel][0]);
      if(candidates.size===1)liveToCanonical.set(liveId,[...candidates][0]);
      else if(candidates.size>1)identityConflicts.push({liveShopperId:liveId,candidates:[...candidates].sort(),reason:'conflicting_exact_crosswalk'});
    }
    const composedVisits=baseVisits.map(base=>{
      const out=clone(base),key=visitKey(base),pv=matches.get(key)||null,liveId=str(base.shopperId),canonical=liveToCanonical.get(liveId)||liveId;
      if(canonical)out.shopperId=canonical;
      if(pv){
        out.__protectedVisitId=str(pv.visitId||pv.id)||null;out.__exactProtectedVisitOverlay=true;
        const bf=facets(base),pf=facets(pv);
        out.canonicalFacets=Object.assign({},base.canonicalFacets||{},bf,{
          liquidationCandidate:bf.liquidationCandidate||pf.liquidationCandidate,
          liquidationConfirmed:bf.liquidationConfirmed||pf.liquidationConfirmed,
          paymentConfirmed:bf.paymentConfirmed||pf.paymentConfirmed
        });
        if(pv.liquidationState&&pf.liquidationConfirmed)out.liquidationState=pv.liquidationState;
        if(pv.paymentState&&pf.paymentConfirmed)out.paymentState=pv.paymentState;
      }else out.canonicalFacets=Object.assign({},base.canonicalFacets||{},facets(base));
      out.__hrOwnedOperational=true;return out;
    });
    const certById=new Map();
    for(const c of arr(payload.certifications)){const sid=str(c&&c.shopperId||c&&c.idShopper);if(!sid)continue;if(!certById.has(sid))certById.set(sid,[]);certById.get(sid).push(c);}
    const liqById=new Map();
    for(const l of arr(payload.liquidations)){const sid=str(l&&l.shopperId);if(!sid)continue;if(!liqById.has(sid))liqById.set(sid,[]);liqById.get(sid).push(l);}
    const consumedProfiles=new Set(),shopperByCanonical=new Map();
    for(const base of baseShoppers){
      const liveId=str(base.shopperId||base.id);if(!liveId)continue;const canonical=liveToCanonical.get(liveId)||liveId;
      const p=onlyUnique(profilesById,canonical)||onlyUnique(profilesByAlias,liveId)||null;if(p&&p.id)consumedProfiles.add(str(p.id));
      let row=p?patch(base,p):clone(base);row.id=canonical;row.shopperId=canonical;row.legacyLiveShopperIds=uniq([...(arr(row.legacyLiveShopperIds)),liveId]);
      row.nombre=p&&normalizedName(p)?normalizedName(p):(base.nombre||row.nombre||'Shopper protegido');row.code=base.code||row.code||row.username||row.user||row.legacyShopperId||'';
      row.sourceSafe=p?false:base.sourceSafe;row.piiProtected=p?false:base.piiProtected;row.__canonicalIdentityOverlay=!!p;
      const certs=[...(certById.get(canonical)||[]),...(certById.get(liveId)||[])];const cs=certStatus(certs);row.certificationRecords=certs;row.certs=cs.records;row.certificationPresented=cs.presented;row.certified=cs.passed;row.certificationStatus=cs.status;
      row.protectedLiquidations=[...(liqById.get(canonical)||[]),...(liqById.get(liveId)||[])];
      if(identityConflicts.some(x=>x.liveShopperId===liveId)){row.identityReviewRequired=true;row.identityReviewReason='conflicting_exact_crosswalk';}
      const old=shopperByCanonical.get(canonical);shopperByCanonical.set(canonical,old?patch(old,row):row);
    }
    const visitsByShopper=new Map();for(const v of composedVisits){const sid=str(v.shopperId);if(!sid)continue;if(!visitsByShopper.has(sid))visitsByShopper.set(sid,[]);visitsByShopper.get(sid).push(v);}
    const composedShoppers=[...shopperByCanonical.values()].map(row=>{
      const vs=visitsByShopper.get(str(row.id))||[],fs=vs.map(facets);
      const out=Object.assign({},row,{visitas:vs.length,realizadas:fs.filter(f=>f.realized).length,submitidas:fs.filter(f=>f.submitted).length,liquidationCandidates:fs.filter(f=>f.liquidationCandidate).length,liquidadas:fs.filter(f=>f.liquidationConfirmed).length,pagadas:fs.filter(f=>f.paymentConfirmed).length,sourceHistoricalVisitCount:vs.length,sourceHistoricalRealizedCount:fs.filter(f=>f.realized).length,sourceHistoricalLiquidatedCount:fs.filter(f=>f.liquidationConfirmed).length});
      out.perfilCompleto=profileComplete(out);out.profileCompletenessSource='actual_minimum_fields';out.credentialsDerivable=!!(out.__canonicalIdentityOverlay&&out.nombre&&!out.user&&!out.username);return out;
    });
    for(const v of composedVisits){const s=shopperByCanonical.get(str(v.shopperId));if(s){v.shopper=s.nombre||v.shopper;v.shopperCode=s.code||v.shopperCode;v.shopperWa=s.whatsapp||s.phone||v.shopperWa||null;}}
    const postMap=new Map(),postKey=p=>{const vid=str(p.visitId||p.visitaId),sid=str(p.shopperId),id=str(p.id||p.applicationId||p.postulationId);return vid&&sid?`vs:${vid}::${sid}`:(id?`id:${id}`:'');};
    for(const raw of basePosts){const p=clone(raw),sid=str(p.shopperId);if(liveToCanonical.has(sid))p.shopperId=liveToCanonical.get(sid);const key=postKey(p);if(key)postMap.set(key,p);}
    for(const raw of [...arr(payload.postulations),...arr(payload.applications)]){const p=clone(raw);let vid=str(p.visitId||p.visitaId);if(protectedVisitToHrVisit.has(vid))vid=protectedVisitToHrVisit.get(vid);if(vid&&!composedVisits.some(v=>str(v.visitId||v.id)===vid))continue;p.visitId=vid;p.visitaId=vid;const sid=str(p.shopperId);if(liveToCanonical.has(sid))p.shopperId=liveToCanonical.get(sid);const key=postKey(p);if(key)postMap.set(key,postMap.has(key)?patch(postMap.get(key),p):p);}
    const platformOnlyProfiles=profiles.filter(p=>p.id&&!consumedProfiles.has(str(p.id))&&meaningfulProfile(p)).map(p=>({id:p.id,nombre:p.nombre,exactAliases:p.exactAliases,reason:'no_exact_hr_crosswalk'}));
    const nameGroups=new Map();for(const s of composedShoppers){const n=lower(s.nombre).normalize('NFD').replace(/[\u0300-\u036f]/g,'');if(!n)continue;if(!nameGroups.has(n))nameGroups.set(n,[]);nameGroups.get(n).push(s.id);}
    const sameDisplayNameGroups=[...nameGroups.entries()].filter(([,ids])=>ids.length>1).map(([normalizedName,ids])=>({normalizedName,shopperIds:ids.sort(),reason:'display_name_collision_not_auto_merged'}));
    const uniqueVisitKeys=new Set(composedVisits.map(visitKey).filter(Boolean)),uniqueShopperIds=new Set(composedShoppers.map(s=>str(s.id)).filter(Boolean));
    const summaries=periodSummary(composedVisits);
    const diagnostics={hrProjects:projects.length,hrVisits:baseVisits.length,hrShoppers:baseShoppers.length,hrPosts:basePosts.length,protectedVisits:protectedVisits.length,protectedProfiles:profiles.length,matchedProtectedVisits:matches.size,unmatchedProtectedVisits:Math.max(0,protectedVisits.length-matches.size),crosswalkLiveToCanonical:liveToCanonical.size,identityConflicts,visitConflicts,platformOnlyProfiles:platformOnlyProfiles.length,sameDisplayNameGroups,outputVisits:composedVisits.length,outputShoppers:composedShoppers.length,outputPosts:postMap.size,uniqueVisitKeys:uniqueVisitKeys.size,duplicateVisitKeys:composedVisits.length-uniqueVisitKeys.size,uniqueShopperIds:uniqueShopperIds.size,duplicateShopperIds:composedShoppers.length-uniqueShopperIds.size,protectedVisitsAppended:0,idempotentDesign:true,hrOwnsOperationalState:true,canonicalFacetSource:true,unmatchedProfilesExcludedFromOperationalList:true};
    return {projects,visits:composedVisits,shoppers:composedShoppers,posts:[...postMap.values()],periodOperationalSummary:summaries,currentPeriodId:hr.currentPeriodId||null,currentProjectId:hr.currentProjectId||'cinepolis',sourceRevision:hr.sourceRevision||null,identityMap:Object.fromEntries(liveToCanonical),identityReviewQueue:[...identityConflicts,...platformOnlyProfiles,...sameDisplayNameGroups],platformOnlyProfiles,diagnostics};
  }
  function signature(result){const d=result&&result.diagnostics||{};return JSON.stringify({visits:d.outputVisits,shoppers:d.outputShoppers,posts:d.outputPosts,uniqueVisitKeys:d.uniqueVisitKeys,duplicateVisitKeys:d.duplicateVisitKeys,uniqueShopperIds:d.uniqueShopperIds,duplicateShopperIds:d.duplicateShopperIds,visitIds:arr(result&&result.visits).map(visitKey).filter(Boolean).sort(),shopperIds:arr(result&&result.shoppers).map(s=>str(s.id)).filter(Boolean).sort(),periodSummary:result&&result.periodOperationalSummary});}
  const api={compose,signature,normalizeProfile,visitKey,facets,periodSummary,version:'c6-canonical-domain-composer-v2'};
  root.CX_TYA_CUMULATIVE_READ_MODEL=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
