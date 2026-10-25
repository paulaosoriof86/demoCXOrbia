import crypto from 'node:crypto';

export const LEGAL_PUBLICATION_PROVIDER_VERSION='cxorbia-legal-publication-provider-v1';
export const LEGAL_PUBLICATION_COMMAND_TYPE='legal.publication.materialize';
export const LEGAL_PUBLICATION_GATE='PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3';

const str=v=>String(v==null?'':v).trim();
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const arr=v=>Array.isArray(v)?v:[];
const clone=v=>JSON.parse(JSON.stringify(v));
const sha256=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const canonicalText=v=>String(v==null?'':v).replace(/\r\n?/g,'\n');
const uniq=v=>[...new Set(v)];

function fail(code,details={}){
  const e=new Error(code);e.code=code;e.details=details;throw e;
}

function assertNoRestrictedPublicFields(value,path='root'){
  const forbidden=/registeredLegalDomicileRestricted|rawBankAccount|rawIdentityDocument|password|token|secret|providerCredential/i;
  if(Array.isArray(value)){value.forEach((v,i)=>assertNoRestrictedPublicFields(v,`${path}[${i}]`));return;}
  if(!value||typeof value!=='object')return;
  for(const [k,v] of Object.entries(value)){
    if(forbidden.test(k))fail('LEGAL_PUBLICATION_RESTRICTED_FIELD_FORBIDDEN',{path:`${path}.${k}`});
    assertNoRestrictedPublicFields(v,`${path}.${k}`);
  }
}

export function validateMaterializationGate(input){
  const g=obj(input),errors=[];
  if(g.enabled!==true)errors.push('LEGAL_PUBLICATION_GATE_DISABLED');
  if(g.consumed===true)errors.push('LEGAL_PUBLICATION_GATE_CONSUMED');
  if(g.providerWriteAuthorized!==true)errors.push('LEGAL_PUBLICATION_PROVIDER_WRITE_NOT_AUTHORIZED');
  if(str(g.targetProject)!=='cxorbia-backend-dev')errors.push('LEGAL_PUBLICATION_TARGET_PROJECT_INVALID');
  if(str(g.commandType)!==LEGAL_PUBLICATION_COMMAND_TYPE)errors.push('LEGAL_PUBLICATION_GATE_COMMAND_INVALID');
  if(Number(g.allowedExecutions)!==1)errors.push('LEGAL_PUBLICATION_EXECUTION_BUDGET_INVALID');
  if(Number(g.firestoreWrites)!==4)errors.push('LEGAL_PUBLICATION_FIRESTORE_WRITE_BUDGET_INVALID');
  if(Number(g.legalProfileWrites)!==1)errors.push('LEGAL_PUBLICATION_PROFILE_WRITE_BUDGET_INVALID');
  if(Number(g.legalProviderWrites)!==1)errors.push('LEGAL_PUBLICATION_PROVIDER_REGISTRY_WRITE_BUDGET_INVALID');
  if(Number(g.legalContentWrites)!==2)errors.push('LEGAL_PUBLICATION_CONTENT_WRITE_BUDGET_INVALID');
  if(Number(g.legalAcceptanceWrites)!==0)errors.push('LEGAL_PUBLICATION_ACCEPTANCE_WRITE_FORBIDDEN');
  if(Number(g.authWrites)!==0)errors.push('LEGAL_PUBLICATION_AUTH_WRITE_FORBIDDEN');
  if(Number(g.passwordResets)!==0)errors.push('LEGAL_PUBLICATION_PASSWORD_RESET_FORBIDDEN');
  if(Number(g.historicalCredentialAccess)!==0)errors.push('LEGAL_PUBLICATION_HISTORICAL_CREDENTIAL_ACCESS_FORBIDDEN');
  if(Number(g.historicalReconciliationWrites)!==0)errors.push('LEGAL_PUBLICATION_HISTORICAL_RECONCILIATION_FORBIDDEN');
  if(Number(g.otherIdentityWrites)!==0)errors.push('LEGAL_PUBLICATION_OTHER_IDENTITY_WRITE_FORBIDDEN');
  for(const k of ['hrWrites','rulesWrites','storageWrites','makeWrites','geminiCalls','paymentWrites','deploys'])if(Number(g[k])!==0)errors.push(`LEGAL_PUBLICATION_${k.toUpperCase()}_FORBIDDEN`);
  if(g.production!==false)errors.push('LEGAL_PUBLICATION_PRODUCTION_FORBIDDEN');
  if(g.merge!==false)errors.push('LEGAL_PUBLICATION_MERGE_FORBIDDEN');
  if(g.automaticAcceptance!==false)errors.push('LEGAL_PUBLICATION_AUTOMATIC_ACCEPTANCE_FORBIDDEN');
  if(g.humanAcceptanceRequired!==true)errors.push('LEGAL_PUBLICATION_HUMAN_ACCEPTANCE_REQUIRED');
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}

export function normalizePublicationCommand(input){
  const c=obj(input),p=obj(c.payload),errors=[];
  if(str(c.commandType)!==LEGAL_PUBLICATION_COMMAND_TYPE)errors.push('LEGAL_PUBLICATION_COMMAND_TYPE_INVALID');
  if(str(c.entityType)!=='legalPublication')errors.push('LEGAL_PUBLICATION_ENTITY_TYPE_INVALID');
  const tenantId=str(c.tenantId);
  if(!tenantId)errors.push('LEGAL_PUBLICATION_TENANT_REQUIRED');
  if(str(c.projectId))errors.push('LEGAL_PUBLICATION_PROJECT_SCOPE_FORBIDDEN_FOR_MASTER_BUNDLE');
  if(str(p.scopeMode)!=='tenant')errors.push('LEGAL_PUBLICATION_SCOPE_MODE_INVALID');
  if(str(p.expectedProfileRevision)!=='absent')errors.push('LEGAL_PUBLICATION_PROFILE_EXPECTED_ABSENT_REQUIRED');

  const profile=obj(p.tenantLegalProfile);
  const operator=obj(profile.operator),contacts=obj(profile.contacts),brand=obj(profile.platformBrandProfile),retention=obj(profile.retentionPolicy),dispute=obj(profile.disputePolicy);
  if(str(profile.tenantId)!==tenantId)errors.push('LEGAL_PUBLICATION_PROFILE_TENANT_MISMATCH');
  if(!str(operator.legalDisplayName))errors.push('LEGAL_PUBLICATION_OPERATOR_NAME_REQUIRED');
  if(!str(operator.taxId))errors.push('LEGAL_PUBLICATION_OPERATOR_TAX_ID_REQUIRED');
  if(str(operator.countryOfEstablishment)!=='GT')errors.push('LEGAL_PUBLICATION_ESTABLISHMENT_COUNTRY_INVALID');
  const countries=uniq(arr(operator.operatingCountries).map(str).filter(Boolean)).sort();
  if(!countries.includes('GT')||!countries.includes('HN'))errors.push('LEGAL_PUBLICATION_OPERATING_COUNTRIES_INCOMPLETE');
  if(str(operator.publicLegalAddressMode)!=='locality_only'&&str(operator.publicLegalAddressMode)!=='full_approved_address'&&str(operator.publicLegalAddressMode)!=='contact_channel_only_when_legally_sufficient')errors.push('LEGAL_PUBLICATION_PUBLIC_ADDRESS_MODE_INVALID');
  if(!str(operator.publicLegalAddress)&&str(operator.publicLegalAddressMode)!=='contact_channel_only_when_legally_sufficient')errors.push('LEGAL_PUBLICATION_PUBLIC_ADDRESS_REQUIRED');
  if(!str(contacts.legal)||!str(contacts.privacy)||!str(contacts.securityIncidents))errors.push('LEGAL_PUBLICATION_CONTACTS_REQUIRED');
  if(!Number.isFinite(Number(retention.rawFieldEvidenceDaysAfterFinalAcceptance)))errors.push('LEGAL_PUBLICATION_RETENTION_REQUIRED');
  if(!str(dispute.b2bClients)||!str(dispute.individualUsers))errors.push('LEGAL_PUBLICATION_DISPUTE_POLICY_REQUIRED');
  if(!str(brand.legalGenericReference))errors.push('LEGAL_PUBLICATION_GENERIC_PLATFORM_REFERENCE_REQUIRED');

  const provider=obj(p.coreProvider);
  if(str(provider.providerKey)!=='firebase-google-core')errors.push('LEGAL_PUBLICATION_CORE_PROVIDER_KEY_INVALID');
  if(provider.technicalActiveState!==true)errors.push('LEGAL_PUBLICATION_CORE_PROVIDER_MUST_BE_ACTIVE');
  if(!str(provider.displayName)||!str(provider.purpose))errors.push('LEGAL_PUBLICATION_CORE_PROVIDER_METADATA_REQUIRED');

  const publication=obj(p.publication);
  const legalContentId=str(publication.legalContentId),legalVersion=str(publication.legalVersion),templateId=str(publication.templateId),templateVersion=str(publication.templateVersion);
  if(!legalContentId||!legalVersion||!templateId||!templateVersion)errors.push('LEGAL_PUBLICATION_VERSION_METADATA_REQUIRED');
  if(str(publication.scopeMode)!=='tenant')errors.push('LEGAL_PUBLICATION_VERSION_SCOPE_INVALID');
  const roles=uniq(arr(publication.roleApplicability).map(str).filter(Boolean)).sort();
  if(!roles.length)errors.push('LEGAL_PUBLICATION_ROLES_REQUIRED');
  const renderedContent=canonicalText(publication.renderedContent);
  if(!renderedContent.trim())errors.push('LEGAL_PUBLICATION_RENDERED_CONTENT_REQUIRED');
  if(renderedContent.includes('{{')||renderedContent.includes('}}'))errors.push('LEGAL_PUBLICATION_UNRESOLVED_PLACEHOLDER');
  if(/LEGAL_REVIEW_REQUIRED/.test(renderedContent))errors.push('LEGAL_PUBLICATION_INTERNAL_REVIEW_MARKER_FORBIDDEN');
  const digest=sha256(renderedContent);
  if(str(publication.contentDigest).toLowerCase()!==digest)errors.push('LEGAL_PUBLICATION_DIGEST_MISMATCH');
  if(str(publication.renderedContentEncoding)!=='UTF-8')errors.push('LEGAL_PUBLICATION_ENCODING_INVALID');
  if(str(publication.renderedContentLineEndings)!=='LF')errors.push('LEGAL_PUBLICATION_LINE_ENDINGS_INVALID');
  if(publication.counselReviewed===true)errors.push('LEGAL_PUBLICATION_FALSE_COUNSEL_REVIEW_FORBIDDEN');
  if(str(publication.counselStatus)!=='deferred_post_golive')errors.push('LEGAL_PUBLICATION_COUNSEL_STATUS_INVALID');
  if(publication.interimGoLive!==true)errors.push('LEGAL_PUBLICATION_INTERIM_FLAG_REQUIRED');

  try{assertNoRestrictedPublicFields(publication.resolvedPublicSections);}catch(e){errors.push(e.code||'LEGAL_PUBLICATION_RESTRICTED_FIELD_FORBIDDEN');}

  return Object.freeze({
    ok:errors.length===0,
    errors:Object.freeze(uniq(errors)),
    command:c,
    tenantId,
    profile:Object.freeze(clone(profile)),
    provider:Object.freeze(clone(provider)),
    publication:Object.freeze({...clone(publication),renderedContent,contentDigest:digest,roleApplicability:roles}),
    digest
  });
}

function refFor(db,path){
  if(!db||typeof db.doc!=='function')fail('LEGAL_PUBLICATION_FIRESTORE_DEPENDENCY_INVALID');
  return db.doc(path);
}
function snapData(snap){return snap&&snap.exists===true&&typeof snap.data==='function'?obj(snap.data()):null;}

export function createLegalPublicationProvider(deps={}){
  const db=deps.firestore,serverTimestamp=deps.serverTimestamp;
  if(!db||typeof db.doc!=='function'||typeof db.runTransaction!=='function')fail('LEGAL_PUBLICATION_FIRESTORE_DEPENDENCY_INVALID');
  if(typeof serverTimestamp!=='function')fail('LEGAL_PUBLICATION_SERVER_TIMESTAMP_DEPENDENCY_INVALID');

  async function materialize({command,gate}){
    const gateCheck=validateMaterializationGate(gate);if(!gateCheck.ok)fail('LEGAL_PUBLICATION_WRITE_GATE_INVALID',{errors:gateCheck.errors});
    const n=normalizePublicationCommand(command);if(!n.ok)fail('LEGAL_PUBLICATION_COMMAND_INVALID',{errors:n.errors});
    const t=n.tenantId,c=n.publication;
    const profilePath=`tenants/${t}/legalProfile/current`;
    const providerPath=`tenants/${t}/legalProviders/${n.provider.providerKey}`;
    const contentPath=`tenants/${t}/legalContents/${c.legalContentId}`;
    const versionPath=`${contentPath}/versions/${c.legalVersion}`;
    const paths=[profilePath,providerPath,contentPath,versionPath];
    let committed=false;
    await db.runTransaction(async tx=>{
      const refs=paths.map(p=>refFor(db,p));
      const snaps=[];for(const r of refs)snaps.push(await tx.get(r));
      if(snaps.some(s=>s&&s.exists===true))fail('LEGAL_PUBLICATION_BOOTSTRAP_COLLISION',{existing:paths.filter((_,i)=>snaps[i]?.exists===true)});
      const at=serverTimestamp();
      tx.create(refs[0],{...clone(n.profile),revision:1,tenantId:t,updatedAt:at,source:'interim_golive_bootstrap',counselStatus:'deferred_post_golive'});
      tx.create(refs[1],{...clone(n.provider),tenantId:t,updatedAt:at,source:'interim_golive_bootstrap'});
      tx.create(refs[2],{tenantId:t,legalContentId:c.legalContentId,currentVersion:c.legalVersion,currentDigest:c.contentDigest,scopeMode:'tenant',roleApplicability:c.roleApplicability,active:true,interimGoLive:true,counselStatus:'deferred_post_golive',updatedAt:at});
      tx.create(refs[3],{...clone(c),tenantId:t,active:true,sourceTenantLegalProfileRevision:1,resolvedAt:at,publishedAt:at,createOnly:true});
      committed=true;
    });
    return Object.freeze({ok:true,committed,providerAck:true,status:'committed',tenantId:t,legalContentId:c.legalContentId,legalVersion:c.legalVersion,contentDigest:c.contentDigest,firestoreWrites:4,legalProfileWrites:1,legalProviderWrites:1,legalContentWrites:2,legalAcceptanceWrites:0,authWrites:0,passwordResets:0,historicalCredentialAccess:0,historicalReconciliationWrites:0,automaticAcceptance:false,humanAcceptanceStillRequired:true});
  }

  async function readback({tenantId,legalContentId,legalVersion}){
    const t=str(tenantId),id=str(legalContentId),v=str(legalVersion);if(!t||!id||!v)fail('LEGAL_PUBLICATION_READBACK_SCOPE_REQUIRED');
    const profilePath=`tenants/${t}/legalProfile/current`,providerPath=`tenants/${t}/legalProviders/firebase-google-core`,contentPath=`tenants/${t}/legalContents/${id}`,versionPath=`${contentPath}/versions/${v}`;
    const reads=[];for(const p of [profilePath,providerPath,contentPath,versionPath])reads.push(snapData(await refFor(db,p).get()));
    const [profile,provider,content,version]=reads;
    const reasons=[];
    if(!profile||Number(profile.revision)!==1)reasons.push('LEGAL_PUBLICATION_PROFILE_MISSING');
    if(!provider||provider.technicalActiveState!==true)reasons.push('LEGAL_PUBLICATION_PROVIDER_REGISTRY_MISSING');
    if(!content||str(content.currentVersion)!==v)reasons.push('LEGAL_PUBLICATION_CONTENT_CURRENT_MISMATCH');
    if(!version||str(version.legalVersion)!==v)reasons.push('LEGAL_PUBLICATION_VERSION_MISSING');
    if(version&&str(version.contentDigest)!==str(content?.currentDigest))reasons.push('LEGAL_PUBLICATION_DIGEST_READBACK_MISMATCH');
    return Object.freeze({authority:'provider',ready:reasons.length===0,tenantId:t,legalContentId:id,legalVersion:v,contentDigest:str(version?.contentDigest||content?.currentDigest).toLowerCase()||null,counselStatus:str(version?.counselStatus||content?.counselStatus)||null,interimGoLive:version?.interimGoLive===true,providerTechnicalActive:provider?.technicalActiveState===true,reasons:Object.freeze(uniq(reasons)),restrictedFieldsReturned:false});
  }

  return Object.freeze({version:LEGAL_PUBLICATION_PROVIDER_VERSION,materialize,readback});
}

export function sourceOnlyStatus(){
  return Object.freeze({version:LEGAL_PUBLICATION_PROVIDER_VERSION,sourceOnly:true,activated:false,providerCredentialsLoaded:false,providerReadsExecuted:0,providerWritesExecuted:0,firestoreWritesExecuted:0,legalContentWritesExecuted:0,legalAcceptanceWritesExecuted:0,authWritesExecuted:0,automaticAcceptance:false,humanAcceptanceRequired:true,historicalCredentialAccess:0,passwordResets:0,deploys:0,merge:false,production:false,nextGate:LEGAL_PUBLICATION_GATE});
}
