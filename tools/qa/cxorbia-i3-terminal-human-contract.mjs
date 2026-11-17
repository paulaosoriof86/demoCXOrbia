// Terminal QA predicates only. No provider mutation or identity adjudication.
import crypto from 'node:crypto';
const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const active=new Set(['active','confirmed','approved','materialized']);

// Persist successful checks as well as failures. Explicit projection prevents a
// later diagnostic field from exporting an operational shopper display name.
export function persistAdminCompositionIdentityProof({write,summary={},expected={},identity={}}){
  const countKeys=['visits','shoppers','hrShoppers','expectedCanonicalHrShoppers','rawHrReferences','platformOnly',
    'platformBadFlags','platformCrossProject','duplicateShopperIds','periods','protectedNames','realNames',
    'technicalPrimaryNames','unresolvedAuthorityCount','runtimeOutOfRange','expectedOutOfRange'];
  const counts=Object.fromEntries(countKeys.map(k=>[k,Number.isInteger(summary[k])&&summary[k]>=0?summary[k]:null]));
  const mismatchKeys=['nameMismatches','unresolvedReviewMismatches'];
  const mismatchCounts=Object.fromEntries(mismatchKeys.map(k=>[k,Array.isArray(summary[k])?summary[k].length:null]));
  const binding=Object.fromEntries(['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion','hrRevision','runId','runAttempt'].map(k=>[k,str(identity[k])]));
  const checks={
    exactArtifactBinding:/^[a-f0-9]{40}$/.test(binding.sourceSha)&&/^[a-f0-9]{40}$/.test(binding.sourceTree)&&
      /^[a-f0-9]{64}$/.test(binding.hrRevision)&&/^sha256:[a-f0-9]{64}$/.test(binding.runtimeDigest)&&
      !!binding.runtimeRevision&&!!binding.hostingVersion&&/^\d+$/.test(binding.runId)&&/^\d+$/.test(binding.runAttempt),
    completeSummary:countKeys.every(k=>counts[k]!==null)&&mismatchKeys.every(k=>mismatchCounts[k]!==null),
    sameHrRevision:str(summary.revision)===binding.hrRevision,
    sameProject:!!str(expected.projectId)&&str(summary.project)===str(expected.projectId),
    composition:counts.visits===expected.visits&&counts.periods===expected.periods&&
      counts.hrShoppers===counts.expectedCanonicalHrShoppers&&counts.shoppers===counts.expectedCanonicalHrShoppers+counts.platformOnly&&
      counts.platformBadFlags===0&&counts.platformCrossProject===0&&counts.duplicateShopperIds===0,
    humanDisplay:counts.realNames>0&&counts.protectedNames===0&&counts.technicalPrimaryNames===0&&
      mismatchCounts.nameMismatches===0&&mismatchCounts.unresolvedReviewMismatches===0,
    outOfRange:counts.runtimeOutOfRange===counts.expectedOutOfRange
  };
  const proof={schemaVersion:'cxorbia.i3.admin-composition-identity-proof.v1',
    decision:Object.values(checks).every(v=>v===true)?'PASS_I3_ADMIN_COMPOSITION_IDENTITY':'HOLD_I3_ADMIN_COMPOSITION_IDENTITY',
    ...binding,scope:'ADMIN_HR_COMPOSITION_AND_DISPLAY_INVARIANTS_ONLY_NOT_FULL_DOMAIN_OR_HUMAN_APPROVAL',
    production:false,humanApproval:false,fullDomain:false,nameFree:true,checks,counts,mismatchCounts,
    expected:{visits:expected.visits,periods:expected.periods,projectId:str(expected.projectId)},
    observedProjectId:str(summary.project),observedHrRevision:str(summary.revision),
    mismatchIdentityDigest:crypto.createHash('sha256').update(JSON.stringify(mismatchKeys.map(k=>arr(summary[k])))).digest('hex')};
  write('admin-composition-identity-proof.json',proof);
  return proof;
}

function historicalReceiptCandidate(link,{tenantId,projectId}){
  const target=str(link.canonicalShopperId),ref=str(link.authorityRef),id=str(link.identityLinkId);
  const aliases=arr(link.exactAliases),other=arr(link.sourceAliases);
  const exact=[...new Set(aliases.map(str))].sort(),same=[...new Set(other.map(str))].sort();
  if(Object.hasOwn(link,'providerAck')||link.schemaVersion!=='cxorbia.shopper-identity-link.v1'||
    str(link.tenantId)!==tenantId||str(link.projectScope)!==projectId||!target||
    !active.has(str(link.status).toLowerCase())||(str(link.state)&&!active.has(str(link.state).toLowerCase()))||
    str(link.authorityType)!=='tenant_adjudication'||link.humanConfirmed!==true||link.sourceSafe!==true||
    link.fuzzyMatching!==false||link.periodIndependent!==true||!exact.length||
    aliases.some(x=>typeof x!=='string'||!x||x!==str(x))||other.some(x=>typeof x!=='string'||!x||x!==str(x))||
    exact.length!==aliases.length||same.length!==other.length||JSON.stringify(exact)!==JSON.stringify(same)||
    [link.periodId,link.periodKey,link.periodScope,link.scope?.periodId,link.scope?.periodKey,link.scope?.periodScope].some(x=>str(x))||
    [link.projectId,link.scope?.projectId].some(x=>str(x)&&str(x)!==projectId)||
    (str(link.scope?.tenantId)&&str(link.scope.tenantId)!==tenantId)||
    !/^[a-f0-9]{40}$/.test(ref)||str(link.adjudicationId)!==ref||str(link.id)!==id||
    str(link._documentPath)!=='tenants/'+tenantId+'/shopperIdentityLinks/'+id)return null;
  // The historical provider bound this exact alias set to the durable link ID.
  // This prevents a later unacknowledged alias addition from reusing an old ACK.
  const expected='irl_'+crypto.createHash('sha256').update([tenantId,projectId,target,...exact].join('\0')).digest('hex').slice(0,32);
  return expected===id?{target,ref,id}:null;
}

export function tenantAdjudicationReceiptRefs(links,scope){
  return [...new Set(arr(links).map(link=>historicalReceiptCandidate(link,scope)?.ref).filter(Boolean))].sort();
}

function historicalReceiptProof(link,{tenantId,projectId,commandReceipts}){
  const candidate=historicalReceiptCandidate(link,{tenantId,projectId});if(!candidate)return null;
  const {target,ref,id}=candidate,entry=commandReceipts.get(ref),receipt=entry?.data;
  if(entry?.exists!==true||entry.id!==ref||entry.path!=='tenants/'+tenantId+'/commandReceipts/'+ref||!receipt||
    receipt.status!=='committed'||receipt.commandType!=='shopper.identity.adjudicate'||receipt.providerAck!==true||
    receipt.identityConsolidated!==true||str(receipt.identityLinkId)!==id||str(receipt.shopperId)!==target||
    !/^[a-f0-9]{64}$/.test(str(receipt.commandDigest))||
    [receipt.tenantId,receipt.scope?.tenantId].some(x=>str(x)&&str(x)!==tenantId)||
    [receipt.projectId,receipt.projectScope,receipt.scope?.projectId].some(x=>str(x)&&str(x)!==projectId)||
    [receipt.periodId,receipt.periodKey,receipt.periodScope,receipt.scope?.periodId,receipt.scope?.periodKey,receipt.scope?.periodScope].some(x=>str(x)))return null;
  return {mode:'REFERENCED_COMMITTED_COMMAND_RECEIPT',receiptId:ref,receiptPath:entry.path,
    commandType:receipt.commandType,identityLinkId:id,canonicalShopperId:target,
    exactAliasSetBoundToLinkId:true,commandDigestFormatValid:true,payloadDigestRecomputed:false};
}

export function collectTenantAdjudications(links,{tenantId,projectId,crossTargets=new Map(),commandReceipts=new Map()}={}){
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
    const receiptProof=historicalReceiptProof(link,{tenantId,projectId,commandReceipts});
    const providerAck=link.providerAck===true||!!receiptProof;
    if(link.humanConfirmed===true&&providerAck&&link.fuzzyMatching===false&&authorityRef&&
      ![link.periodId,link.periodKey,link.periodScope].some(x=>str(x)))
      for(const field of ['exactAliases','sourceAliases'])for(const value of arr(link[field]))tokens.push([field,value]);
    for(const [field,value] of tokens){
      const sourceId=str(value);if(!sourceId)continue;
      if(!candidates.has(sourceId))candidates.set(sourceId,[]);
      candidates.get(sourceId).push({sourceId,canonicalId:target,linkId:str(link.identityLinkId||link.id),
        matchedTokenField:field,authorityType:'tenant_adjudication',authorityRef:authorityRef||null,
        status:str(link.status||link.state),tenantId,projectScope:scope||null,
        humanConfirmed:link.humanConfirmed===true,providerAck,
        linkProviderAck:{present:Object.hasOwn(link,'providerAck'),value:Object.hasOwn(link,'providerAck')?link.providerAck:null},
        providerAckEvidence:receiptProof||(link.providerAck===true?{mode:'EXPLICIT_LINK_ACK'}:null)});
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
