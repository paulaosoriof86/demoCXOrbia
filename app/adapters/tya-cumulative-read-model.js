/* CXOrbia TyA — stable cumulative read model composer.
   Pure adapter logic: no provider calls, no writes, no UI rendering.
   HR owns operational visits/periods; protected Firestore only enriches exact identities/profile/history metadata. */
(function(root){
  'use strict';
  const safeArray=v=>Array.isArray(v)?v:[];
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const has=v=>v!==undefined&&v!==null&&(!(typeof v==='string')||v.trim()!=='');
  const str=v=>String(v==null?'':v).trim();
  const lower=v=>str(v).toLowerCase();
  const getPath=(obj,path)=>{
    let cur=obj;
    for(const part of String(path||'').split('.')){
      if(!cur||typeof cur!=='object'||!Object.prototype.hasOwnProperty.call(cur,part))return undefined;
      cur=cur[part];
    }
    return cur;
  };
  const firstPath=(obj,paths)=>{for(const path of paths){const v=path.includes('.')?getPath(obj,path):obj&&obj[path];if(has(v))return v;}return '';};
  const nonEmptyPatch=(base,extra)=>{const out=Object.assign({},base||{});for(const [k,v] of Object.entries(extra||{})){if(has(v)||typeof v==='boolean'||typeof v==='number'||Array.isArray(v)||(v&&typeof v==='object'))out[k]=clone(v);}return out;};
  const normalizedName=s=>{
    const direct=firstPath(s,['nombre','displayName','display_name','fullName','shopperName','name','profile.nombre','profile.displayName','profile.fullName']);
    if(has(direct))return str(direct);
    const first=firstPath(s,['firstName','primerNombre','first_name','profile.firstName','profile.primerNombre']);
    const last=firstPath(s,['lastName','primerApellido','last_name','profile.lastName','profile.primerApellido']);
    return [first,last].filter(has).map(str).join(' ').trim();
  };
  function normalizeProfile(raw){
    const s=clone(raw||{});
    const id=str(firstPath(s,['shopperId','id']));
    const legacyShopperId=str(firstPath(s,['legacyShopperId','legacy.shopperId','legacy.id']));
    const username=firstPath(s,['username','user','login','credentials.username','credential.username','legacyCredentials.username','auth.username','account.username','profile.username']);
    const password=firstPath(s,['pass','password','credentials.password','credential.password','legacyCredentials.password','auth.password','account.password','profile.password']);
    const department=firstPath(s,['depto','departamento','department','profile.depto','profile.departamento','profile.department']);
    const whatsapp=firstPath(s,['whatsapp','wa','telefono','phone','contact.whatsapp','contact.phone','profile.whatsapp','profile.telefono','profile.phone']);
    const phone=firstPath(s,['phone','telefono','wa','whatsapp','contact.phone','contact.whatsapp','profile.phone','profile.telefono','profile.whatsapp']);
    const email=firstPath(s,['email','correo','contact.email','profile.email','profile.correo']);
    const documentId=firstPath(s,['dpi','documentId','documento','idNumber','profile.dpi','profile.documentId','profile.documento']);
    return nonEmptyPatch(s,{
      id,shopperId:id,legacyShopperId,
      nombre:normalizedName(s),
      pais:firstPath(s,['pais','country','countryCode','profile.pais','profile.country']),
      ciudad:firstPath(s,['ciudad','city','profile.ciudad','profile.city']),
      depto:department,departamento:department,
      whatsapp,phone,email,dpi:documentId,
      direccion:firstPath(s,['direccion','address','profile.direccion','profile.address']),
      fecha_nac:firstPath(s,['fecha_nac','fechaNacimiento','birthDate','profile.fecha_nac','profile.birthDate']),
      edad:firstPath(s,['edad','age','profile.edad','profile.age']),
      sexo:firstPath(s,['sexo','sex','profile.sexo','profile.sex']),
      banco:firstPath(s,['banco','bank','payment.banco','payment.bank','profile.banco']),
      ctaTipo:firstPath(s,['ctaTipo','accountType','payment.ctaTipo','payment.accountType']),
      ctaNum:firstPath(s,['ctaNum','accountNumber','payment.ctaNum','payment.accountNumber']),
      ctaTitular:firstPath(s,['ctaTitular','accountHolder','payment.ctaTitular','payment.accountHolder']),
      ctaMoneda:firstPath(s,['ctaMoneda','accountCurrency','payment.ctaMoneda','payment.accountCurrency']),
      cuentaPago:firstPath(s,['cuentaPago','payment.cuentaPago']),
      user:username,username,pass:password,password,
      sourceSafe:false,piiProtected:false,operationalProfileAvailable:true
    });
  }
  function knownFixture(s){
    const id=str(s&&s.id), name=str(s&&s.nombre), code=str(s&&s.code), email=str(s&&s.email);
    return id==='sh_ref_protegida'||id==='sh_op_parcial'||(/^sh\d+$/i.test(id)&&/^Evaluador\s+\d+$/i.test(name)&&(/^EVL-\d+$/i.test(code)||/@demo\.cxorbia$/i.test(email)));
  }
  function meaningfulProfile(s){
    if(!s||knownFixture(s))return false;
    const name=str(s.nombre), id=str(s.id);
    const technicalOnly=/^shp-[a-f0-9]+$/i.test(name)||(!name&&/^shp-[a-f0-9]+$/i.test(id));
    if(technicalOnly)return false;
    return !!(name||s.username||s.user||s.whatsapp||s.phone||s.email||s.dpi||s.legacyShopperId);
  }
  function sourceCoord(v){
    const tab=str(v&&v.sourceTab), row=str(v&&v.sourceRow);
    return tab&&row?`${tab}::${row}`:'';
  }
  function uniqueIndex(rows,keyFn){
    const map=new Map();
    safeArray(rows).forEach(row=>{
      const key=str(keyFn(row));if(!key)return;
      if(!map.has(key))map.set(key,[]);
      map.get(key).push(row);
    });
    return map;
  }
  const onlyUnique=(map,key)=>{const rows=map.get(str(key))||[];return rows.length===1?rows[0]:null;};
  function visitKey(v){return str(v&&v.hrRowId)||sourceCoord(v)||str(v&&(v.visitId||v.id));}
  function findProtectedVisit(base,indexes){
    const candidates=[];
    const push=v=>{if(v&&!candidates.includes(v))candidates.push(v);};
    push(onlyUnique(indexes.hrRow,str(base&&base.hrRowId)));
    push(onlyUnique(indexes.coord,sourceCoord(base)));
    push(onlyUnique(indexes.id,str(base&&(base.visitId||base.id))));
    if(candidates.length===1)return {row:candidates[0],conflict:false};
    if(candidates.length>1){
      const ids=new Set(candidates.map(v=>str(v&&(v.visitId||v.id))||str(v&&v.hrRowId)||sourceCoord(v)));
      if(ids.size===1)return {row:candidates[0],conflict:false};
      return {row:null,conflict:true};
    }
    return {row:null,conflict:false};
  }
  function addRelation(map,a,b){
    a=str(a);b=str(b);if(!a||!b)return;
    if(!map.has(a))map.set(a,new Set());
    map.get(a).add(b);
  }
  function protectedFinancialFacets(p){
    const f=p&&p.canonicalFacets||{};
    return {
      liquidationCandidate:f.liquidationCandidate===true||p&&p.liquidationCandidate===true,
      liquidationConfirmed:f.liquidationConfirmed===true||p&&p.liquidationConfirmed===true||['confirmed','liquidated','liquidada'].includes(lower(p&&p.liquidationState)),
      paymentConfirmed:f.paymentConfirmed===true||p&&p.paymentConfirmed===true||['confirmed','paid','pagada'].includes(lower(p&&p.paymentState))
    };
  }
  function realized(v){const f=v&&v.canonicalFacets||{};const st=lower(v&&(v.estado||v.status||v.presentationState));return f.realized===true||f.questionnaire===true||f.submitted===true||['realizada','cuestionario','submitida','liquidada','pagada'].includes(st);}
  function submitted(v){const f=v&&v.canonicalFacets||{};const st=lower(v&&(v.estado||v.status||v.presentationState));return f.submitted===true||['submitida','liquidada','pagada'].includes(st);}
  function liquidated(v){const f=v&&v.canonicalFacets||{};return f.liquidationConfirmed===true||['confirmed','liquidated','liquidada'].includes(lower(v&&v.liquidationState))||['liquidada','pagada'].includes(lower(v&&(v.estado||v.status)));}
  function paid(v){const f=v&&v.canonicalFacets||{};return f.paymentConfirmed===true||['confirmed','paid','pagada'].includes(lower(v&&v.paymentState))||lower(v&&(v.estado||v.status))==='pagada';}

  function compose(input){
    const hr=clone(input&&input.hr||{}), payload=clone(input&&input.protectedPayload||{});
    const baseProjects=safeArray(hr.projects);
    const baseVisits=safeArray(hr.visits||hr._visitas);
    const baseShoppers=safeArray(hr.shoppers);
    const basePosts=safeArray(hr.posts||hr._posts);
    const protectedVisits=safeArray(payload.visits);
    const protectedProfiles=safeArray(payload.shoppers).map(normalizeProfile);
    const indexes={
      id:uniqueIndex(protectedVisits,v=>v&& (v.visitId||v.id)),
      hrRow:uniqueIndex(protectedVisits,v=>v&&v.hrRowId),
      coord:uniqueIndex(protectedVisits,sourceCoord)
    };
    const relation=new Map(), protectedVisitToHrVisit=new Map(), matches=new Map();
    const visitConflicts=[];
    for(const base of baseVisits){
      const match=findProtectedVisit(base,indexes);
      const key=visitKey(base);
      if(match.conflict){visitConflicts.push(key);continue;}
      if(!match.row)continue;
      matches.set(key,match.row);
      const protectedId=str(match.row.visitId||match.row.id);
      if(protectedId)protectedVisitToHrVisit.set(protectedId,str(base.visitId||base.id));
      addRelation(relation,base.shopperId,match.row.shopperId);
    }

    const profilesById=uniqueIndex(protectedProfiles,p=>p.id);
    const profilesByLegacy=uniqueIndex(protectedProfiles,p=>p.legacyShopperId);
    const liveToCanonical=new Map();
    const identityConflicts=[];
    for(const s of baseShoppers){
      const liveId=str(s.shopperId||s.id);if(!liveId)continue;
      const candidateIds=new Set();
      const direct=onlyUnique(profilesById,liveId);if(direct&&direct.id)candidateIds.add(str(direct.id));
      const legacy=onlyUnique(profilesByLegacy,liveId);if(legacy&&legacy.id)candidateIds.add(str(legacy.id));
      const rel=relation.get(liveId);if(rel&&rel.size===1)candidateIds.add([...rel][0]);
      if(candidateIds.size===1)liveToCanonical.set(liveId,[...candidateIds][0]);
      else if(candidateIds.size>1)identityConflicts.push({liveShopperId:liveId,candidates:[...candidateIds].sort()});
    }

    const composedVisits=baseVisits.map(base=>{
      const out=clone(base), key=visitKey(base), p=matches.get(key)||null;
      const liveId=str(base.shopperId), canonical=liveToCanonical.get(liveId)||liveId;
      if(canonical)out.shopperId=canonical;
      if(p){
        out.__protectedVisitId=str(p.visitId||p.id)||null;
        out.__exactProtectedVisitOverlay=true;
        const pf=protectedFinancialFacets(p);
        out.canonicalFacets=Object.assign({},base.canonicalFacets||{}, {
          liquidationCandidate:(base.canonicalFacets&&base.canonicalFacets.liquidationCandidate===true)||pf.liquidationCandidate,
          liquidationConfirmed:(base.canonicalFacets&&base.canonicalFacets.liquidationConfirmed===true)||pf.liquidationConfirmed,
          paymentConfirmed:(base.canonicalFacets&&base.canonicalFacets.paymentConfirmed===true)||pf.paymentConfirmed
        });
        if(p.liquidationState&&pf.liquidationConfirmed)out.liquidationState=p.liquidationState;
        if(p.paymentState&&pf.paymentConfirmed)out.paymentState=p.paymentState;
      }
      out.__hrOwnedOperational=true;
      return out;
    });

    const consumedProfiles=new Set();
    const shopperByCanonical=new Map();
    for(const base of baseShoppers){
      const liveId=str(base.shopperId||base.id);if(!liveId)continue;
      const canonical=liveToCanonical.get(liveId)||liveId;
      const p=onlyUnique(profilesById,canonical)||onlyUnique(profilesByLegacy,liveId)||null;
      if(p&&p.id)consumedProfiles.add(str(p.id));
      let row=p?nonEmptyPatch(base,p):clone(base);
      row.id=canonical;row.shopperId=canonical;
      row.legacyLiveShopperIds=Array.from(new Set([...(safeArray(row.legacyLiveShopperIds)),liveId].filter(Boolean))).sort();
      row.nombre=p&&normalizedName(p)?normalizedName(p):(base.nombre||row.nombre||'Shopper protegido');
      row.code=base.code||row.code||row.username||row.user||row.legacyShopperId||'';
      row.sourceSafe=p?false:base.sourceSafe;
      row.piiProtected=p?false:base.piiProtected;
      row.__canonicalIdentityOverlay=!!p;
      if(identityConflicts.some(x=>x.liveShopperId===liveId)){row.identityReviewRequired=true;row.identityReviewReason='conflicting_exact_crosswalk';}
      const old=shopperByCanonical.get(canonical);
      shopperByCanonical.set(canonical,old?nonEmptyPatch(old,row):row);
    }

    const canonicalLegacyIds=new Set(protectedProfiles.filter(p=>p.legacyShopperId&&p.id&&str(p.legacyShopperId)!==str(p.id)).map(p=>str(p.legacyShopperId)));
    for(const p of protectedProfiles){
      const pid=str(p.id);if(!pid||consumedProfiles.has(pid)||canonicalLegacyIds.has(pid)||!meaningfulProfile(p))continue;
      const row=clone(p);row.id=pid;row.shopperId=pid;row.code=row.code||row.username||row.user||row.legacyShopperId||'';row.__fullProfilePlatformOnly=true;
      if(!shopperByCanonical.has(pid))shopperByCanonical.set(pid,row);
      consumedProfiles.add(pid);
    }

    const visitsByShopper=new Map();
    for(const v of composedVisits){const sid=str(v.shopperId);if(!sid)continue;if(!visitsByShopper.has(sid))visitsByShopper.set(sid,[]);visitsByShopper.get(sid).push(v);}
    const composedShoppers=[...shopperByCanonical.values()].map(row=>{
      const vs=visitsByShopper.get(str(row.id))||[];
      return Object.assign({},row,{
        visitas:vs.length,
        realizadas:vs.filter(realized).length,
        submitidas:vs.filter(submitted).length,
        liquidadas:vs.filter(liquidated).length,
        pagadas:vs.filter(paid).length,
        sourceHistoricalVisitCount:vs.length,
        sourceHistoricalRealizedCount:vs.filter(realized).length,
        sourceHistoricalLiquidatedCount:vs.filter(liquidated).length
      });
    });

    const visitById=new Map(composedVisits.map(v=>[str(v.visitId||v.id),v]));
    const postMap=new Map();
    const postKey=p=>{
      const vid=str(p.visitId||p.visitaId), sid=str(p.shopperId), id=str(p.id||p.applicationId||p.postulationId);
      return vid&&sid?`vs:${vid}::${sid}`:(id?`id:${id}`:'');
    };
    for(const raw of basePosts){
      const p=clone(raw);const liveSid=str(p.shopperId);if(liveToCanonical.has(liveSid))p.shopperId=liveToCanonical.get(liveSid);
      const key=postKey(p);if(key)postMap.set(key,p);
    }
    const protectedPosts=safeArray(payload.postulations).concat(safeArray(payload.applications));
    for(const raw of protectedPosts){
      const p=clone(raw);let vid=str(p.visitId||p.visitaId);
      if(protectedVisitToHrVisit.has(vid))vid=protectedVisitToHrVisit.get(vid);
      if(vid&&!visitById.has(vid))continue;
      p.visitId=vid;p.visitaId=vid;
      const sid=str(p.shopperId);if(liveToCanonical.has(sid))p.shopperId=liveToCanonical.get(sid);
      const key=postKey(p);if(!key)continue;
      const old=postMap.get(key);postMap.set(key,old?nonEmptyPatch(old,p):p);
    }
    const composedPosts=[...postMap.values()];

    const uniqueVisitKeys=new Set(composedVisits.map(visitKey).filter(Boolean));
    const duplicateVisitKeys=composedVisits.length-uniqueVisitKeys.size;
    const uniqueShopperIds=new Set(composedShoppers.map(s=>str(s.id)).filter(Boolean));
    const duplicateShopperIds=composedShoppers.length-uniqueShopperIds.size;
    const diagnostics={
      hrProjects:baseProjects.length,hrVisits:baseVisits.length,hrShoppers:baseShoppers.length,hrPosts:basePosts.length,
      protectedVisits:protectedVisits.length,protectedProfiles:protectedProfiles.length,
      matchedProtectedVisits:matches.size,unmatchedProtectedVisits:Math.max(0,protectedVisits.length-matches.size),
      crosswalkLiveToCanonical:liveToCanonical.size,identityConflicts,visitConflicts,
      outputVisits:composedVisits.length,outputShoppers:composedShoppers.length,outputPosts:composedPosts.length,
      uniqueVisitKeys:uniqueVisitKeys.size,duplicateVisitKeys,uniqueShopperIds:uniqueShopperIds.size,duplicateShopperIds,
      protectedVisitsAppended:0,idempotentDesign:true,hrOwnsOperationalState:true
    };
    return {
      projects:baseProjects,
      visits:composedVisits,
      shoppers:composedShoppers,
      posts:composedPosts,
      periodOperationalSummary:clone(hr.periodOperationalSummary||[]),
      currentPeriodId:hr.currentPeriodId||null,
      currentProjectId:hr.currentProjectId||'cinepolis',
      sourceRevision:hr.sourceRevision||null,
      diagnostics
    };
  }

  function signature(result){
    const d=result&&result.diagnostics||{};
    return JSON.stringify({
      visits:d.outputVisits,shoppers:d.outputShoppers,posts:d.outputPosts,
      uniqueVisitKeys:d.uniqueVisitKeys,duplicateVisitKeys:d.duplicateVisitKeys,
      uniqueShopperIds:d.uniqueShopperIds,duplicateShopperIds:d.duplicateShopperIds,
      visitIds:safeArray(result&&result.visits).map(v=>visitKey(v)).filter(Boolean).sort(),
      shopperIds:safeArray(result&&result.shoppers).map(s=>str(s.id)).filter(Boolean).sort()
    });
  }
  const api={compose,signature,normalizeProfile,visitKey,version:'c6-stable-composer-v1'};
  root.CX_TYA_CUMULATIVE_READ_MODEL=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
