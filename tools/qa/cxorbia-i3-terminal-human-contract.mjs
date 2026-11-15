// Terminal QA predicates only. No provider mutation or identity adjudication.
const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const active=new Set(['active','confirmed','approved','materialized']);

export function collectTenantAdjudications(links,{tenantId,projectId,crossTargets=new Map()}={}){
  const candidates=new Map();
  for(const link of arr(links)){
    const target=str(link.canonicalShopperId||link.canonicalId||link.shopperId||link.profileId);
    const scope=str(link.projectScope||link.scope?.projectId||link.projectId);
    if(str(link.tenantId||link.scope?.tenantId)!==tenantId||!target||
      !active.has(str(link.status||link.state).toLowerCase())||
      str(link.authorityType||link.authority?.type).toLowerCase()!=='tenant_adjudication'||
      (scope&&scope!==projectId&&!['tenant','*'].includes(scope.toLowerCase()))||link.sourceSafe===false)continue;
    const fields=['sourceShopperId','sourceIdentityKey','sourceSubjectId','sourceId','sourceKey','legacyShopperId','externalShopperId'];
    const tokens=fields.map(field=>[field,link[field]]);
    tokens.push(['sourceIdentity.sourceShopperId',link.sourceIdentity?.sourceShopperId],['sourceIdentity.shopperId',link.sourceIdentity?.shopperId]);
    for(const field of ['sourceIdentityAliases','identityAliases','aliases'])for(const value of arr(link[field]))tokens.push([field,value]);
    // The provider's confirmed consolidation writes all aliases into these two
    // fields. Require its durable acknowledgement and human authority before
    // accepting an alias that the old gate omitted.
    const authorityRef=str(link.authorityRef||link.adjudicationId);
    if(link.humanConfirmed===true&&link.providerAck===true&&link.fuzzyMatching===false&&authorityRef&&
      ![link.periodId,link.periodKey,link.periodScope].some(x=>str(x)))
      for(const field of ['exactAliases','sourceAliases'])for(const value of arr(link[field]))tokens.push([field,value]);
    for(const [field,value] of tokens){
      const sourceId=str(value);if(!sourceId)continue;
      if(!candidates.has(sourceId))candidates.set(sourceId,[]);
      candidates.get(sourceId).push({sourceId,canonicalId:target,linkId:str(link.identityLinkId||link.id),
        matchedTokenField:field,authorityType:'tenant_adjudication',authorityRef:authorityRef||null,
        status:str(link.status||link.state),tenantId,projectScope:scope||null,
        humanConfirmed:link.humanConfirmed===true,providerAck:link.providerAck===true});
    }
  }
  const targets={},evidence=[],rejected=[];
  for(const [sourceId,rows] of candidates){
    const unique=[...new Set(rows.map(x=>x.canonicalId))];
    const cross=[...(crossTargets.get(sourceId)||[])];
    if(unique.length!==1||(cross.length&&(cross.length!==1||cross[0]!==unique[0]))){
      rejected.push({sourceId,reason:unique.length!==1?'CONFLICTING_ADJUDICATION_TARGETS':'EXACT_CROSSWALK_CONFLICT'});continue;
    }
    targets[sourceId]=unique[0];
    const seen=new Set();
    for(const row of rows){const key=row.linkId+'|'+row.matchedTokenField;if(!seen.has(key)){seen.add(key);evidence.push(row);}}
  }
  return {targets,evidence,rejected};
}

export function currentHrPeriodId(hr){
  const key=str(hr?.source?.currentCalendarPeriodKey);
  const selected=arr(hr?.periods).filter(p=>str(p.key||p.periodKey)===key);
  if(!/^\d{4}-\d{2}$/.test(key)||selected.length!==1||!str(selected[0].id||selected[0].periodId))
    throw new Error('MAPPING_FAILURE:REPRESENTATIVE_HR_CURRENT_PERIOD_NOT_EXACT');
  return str(selected[0].id||selected[0].periodId);
}

export function representativeHrExpectation({visits,periods,periodId,canonicalShopperId,resolve,revision}){
  if(!/^[a-f0-9]{64}$/.test(str(revision))||typeof resolve!=='function'||!str(canonicalShopperId))
    throw new Error('MAPPING_FAILURE:REPRESENTATIVE_HR_AUTHORITY_MISSING');
  const selected=arr(periods).filter(p=>str(p.id||p.periodId)===str(periodId));
  if(selected.length!==1||!str(selected[0].key||selected[0].periodKey))throw new Error('MAPPING_FAILURE:REPRESENTATIVE_HR_PERIOD_NOT_EXACT');
  const periodKey=str(selected[0].key||selected[0].periodKey);
  const own=arr(visits).filter(v=>str(resolve(str(v.shopperId||v.shopperCode||v.shopper)))===str(canonicalShopperId));
  const current=own.filter(v=>str(v.periodKey)===periodKey);
  return {authority:'pinned_hr_exact_identity',revision:str(revision),periodId:str(periodId),periodKey,
    canonicalShopperId:str(canonicalShopperId),expectedHistory:own.length,expectedCurrentVisits:current.length};
}

export function representativeMatchesHr(observed,expected,routeChecks){
  const required=['midia','miperfil','misvisitas','beneficios'];
  return expected?.authority==='pinned_hr_exact_identity'&&expected.expectedHistory>0&&
    observed?.identity===true&&observed.authority===true&&observed.nameRendered===true&&!!str(observed.country)&&
    str(observed.key)===expected.canonicalShopperId&&observed.revision===expected.revision&&
    observed.periodId===expected.periodId&&observed.confirmedHistory===expected.expectedHistory&&
    observed.confirmedCurrentVisits===expected.expectedCurrentVisits&&
    Number.isInteger(observed.pendingCurrentVisits)&&observed.pendingCurrentVisits>=0&&
    observed.currentVisits===observed.confirmedCurrentVisits+observed.pendingCurrentVisits&&
    required.every(id=>arr(routeChecks).filter(x=>x.id===id&&x.ok===true).length===1);
}
