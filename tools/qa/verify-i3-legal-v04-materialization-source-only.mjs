import crypto from 'node:crypto';
import {createLegalPublicationProvider,normalizePublicationCommand,sourceOnlyStatus,validateMaterializationGate,LEGAL_PUBLICATION_COMMAND_TYPE,LEGAL_PUBLICATION_GATE} from '../../backend/runtime/cxorbia-legal-publication-provider-v1.mjs';

const assert=(c,m)=>{if(!c)throw new Error(m);};
const digest=s=>crypto.createHash('sha256').update(String(s).replace(/\r\n?/g,'\n'),'utf8').digest('hex');

class MemSnap{constructor(data){this._data=data;this.exists=data!=null;}data(){return this._data==null?undefined:JSON.parse(JSON.stringify(this._data));}}
class MemRef{constructor(db,path){this.db=db;this.path=path;}async get(){return new MemSnap(this.db.map.has(this.path)?this.db.map.get(this.path):null);}}
class MemTx{constructor(db){this.db=db;this.pending=[];}async get(ref){return ref.get();}create(ref,data){if(this.db.map.has(ref.path)||this.pending.some(x=>x.ref.path===ref.path))throw new Error('MEM_CREATE_COLLISION');this.pending.push({ref,data});}commit(){for(const x of this.pending)this.db.map.set(x.ref.path,JSON.parse(JSON.stringify(x.data)));}}
class MemDb{constructor(){this.map=new Map();}doc(path){return new MemRef(this,path);}async runTransaction(fn){const tx=new MemTx(this);const out=await fn(tx);tx.commit();return out;}}

const rendered=`ACUERDO INTERINO TyA V0.4\nOperador público configurable.\nAceptación exclusivamente humana.\nCounsel diferido post-go-live.\n`;
const profile={
  tenantId:'tya',
  operator:{legalDisplayName:'Operador Público TyA',taxId:'TAX-PUBLIC',countryOfEstablishment:'GT',operatingCountries:['GT','HN'],publicLegalAddress:'Ciudad de Guatemala, Guatemala',publicLegalAddressMode:'locality_only'},
  contacts:{legal:'legal@example.test',privacy:'legal@example.test',securityIncidents:'legal@example.test'},
  platformBrandProfile:{displayName:'',legalGenericReference:'La Plataforma',registrationStatus:'unregistered'},
  platformLicensorProfile:{licensorName:'',licensorType:'contractual_owner_or_licensee',rightsBasis:'other_documented_basis'},
  retentionPolicy:{rawFieldEvidenceDaysAfterFinalAcceptance:90,rawFieldEvidenceMinimumFloorDays:60,preciseGeolocationDaysAfterFinalAcceptance:90,bankAccountFullDataDaysAfterFinalPaymentOrDeactivation:180,commercialOperationalAuditYears:5,financialLiquidationPaymentLedgerYears:5,legalAcceptanceReceiptYearsAfterRelationshipEnd:5},
  disputePolicy:{b2bClients:'negotiation_then_institutional_arbitration_when_contractually_valid',individualUsers:'good_faith_resolution_then_applicable_courts'},
  sensitiveDataPolicy:{fullBankAccountAllowed:true,documentMinimization:true}
};
const coreProvider={providerKey:'firebase-google-core',displayName:'Google Firebase / Google Cloud',purpose:'core authentication database and hosting infrastructure',technicalActiveState:true,dataCategories:['account','technical','operational'],processingLocations:['per_active_service_configuration'],contractReference:'provider_terms_current_at_activation'};
const command={
  version:'cxorbia-command-adapter-v1',commandType:LEGAL_PUBLICATION_COMMAND_TYPE,entityType:'legalPublication',tenantId:'tya',projectId:null,idempotencyKey:'source-only-test',
  payload:{scopeMode:'tenant',expectedProfileRevision:'absent',tenantLegalProfile:profile,coreProvider,publication:{legalContentId:'tya-platform-master-terms',legalVersion:'tya-legal-bundle-v0.4-interim-golive-20260816',templateId:'tya-legal-bundle',templateVersion:'v0.4',scopeMode:'tenant',roleApplicability:['super','admin','ops','coordinador','shopper','cliente','aliado'],renderedContent:rendered,contentDigest:digest(rendered),renderedContentEncoding:'UTF-8',renderedContentLineEndings:'LF',resolvedPublicSections:{operatorPublicIdentity:'Operador Público TyA',publicLegalAddress:'Ciudad de Guatemala, Guatemala',publicContacts:{legal:'legal@example.test'},platformDisplayName:'La Plataforma',platformTrademarkStatus:'unregistered',platformLicensorPublicIdentity:null,retentionPublicSummary:'configured',disputePublicSummary:'configured',activeProviderRecipients:['firebase-google-core'],countryAnnexes:['GT','HN']},counselReviewed:false,counselStatus:'deferred_post_golive',interimGoLive:true}}
};
const gate={enabled:true,consumed:false,providerWriteAuthorized:true,targetProject:'cxorbia-backend-dev',commandType:LEGAL_PUBLICATION_COMMAND_TYPE,allowedExecutions:1,firestoreWrites:4,legalProfileWrites:1,legalProviderWrites:1,legalContentWrites:2,legalAcceptanceWrites:0,authWrites:0,passwordResets:0,historicalCredentialAccess:0,historicalReconciliationWrites:0,otherIdentityWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeWrites:0,geminiCalls:0,paymentWrites:0,deploys:0,production:false,merge:false,automaticAcceptance:false,humanAcceptanceRequired:true};

const s=sourceOnlyStatus();
assert(s.sourceOnly===true&&s.providerWritesExecuted===0&&s.legalAcceptanceWritesExecuted===0,'SOURCE_STATUS_DRIFT');
assert(s.nextGate===LEGAL_PUBLICATION_GATE,'SOURCE_NEXT_GATE_DRIFT');
const vg=validateMaterializationGate(gate);assert(vg.ok,'VALID_GATE_REJECTED:'+vg.errors.join(','));
const badGate=validateMaterializationGate({...gate,legalAcceptanceWrites:1});assert(!badGate.ok&&badGate.errors.includes('LEGAL_PUBLICATION_ACCEPTANCE_WRITE_FORBIDDEN'),'ACCEPTANCE_WRITE_GATE_NOT_BLOCKED');
const n=normalizePublicationCommand(command);assert(n.ok,'VALID_COMMAND_REJECTED:'+n.errors.join(','));
assert(n.digest===digest(rendered),'DIGEST_NORMALIZATION_DRIFT');
const placeholder=normalizePublicationCommand({...command,payload:{...command.payload,publication:{...command.payload.publication,renderedContent:'Texto {{pendiente}}',contentDigest:digest('Texto {{pendiente}}')}}});assert(!placeholder.ok&&placeholder.errors.includes('LEGAL_PUBLICATION_UNRESOLVED_PLACEHOLDER'),'PLACEHOLDER_NOT_BLOCKED');
const falseCounsel=normalizePublicationCommand({...command,payload:{...command.payload,publication:{...command.payload.publication,counselReviewed:true}}});assert(!falseCounsel.ok&&falseCounsel.errors.includes('LEGAL_PUBLICATION_FALSE_COUNSEL_REVIEW_FORBIDDEN'),'FALSE_COUNSEL_NOT_BLOCKED');
const restricted=normalizePublicationCommand({...command,payload:{...command.payload,publication:{...command.payload.publication,resolvedPublicSections:{...command.payload.publication.resolvedPublicSections,registeredLegalDomicileRestricted:'NO'}}}});assert(!restricted.ok&&restricted.errors.includes('LEGAL_PUBLICATION_RESTRICTED_FIELD_FORBIDDEN'),'RESTRICTED_PUBLIC_FIELD_NOT_BLOCKED');

const db=new MemDb();let stamp=0;const provider=createLegalPublicationProvider({firestore:db,serverTimestamp:()=>`SERVER_TS_${++stamp}`});
const ack=await provider.materialize({command,gate});
assert(ack.committed===true&&ack.providerAck===true,'MATERIALIZATION_ACK_FAILED');
assert(ack.firestoreWrites===4&&ack.legalAcceptanceWrites===0&&ack.authWrites===0,'WRITE_LEDGER_DRIFT');
assert(db.map.size===4,'EXACT_FOUR_DOCS_REQUIRED');
const rb=await provider.readback({tenantId:'tya',legalContentId:'tya-platform-master-terms',legalVersion:'tya-legal-bundle-v0.4-interim-golive-20260816'});
assert(rb.ready===true&&rb.authority==='provider','READBACK_FAILED:'+rb.reasons.join(','));
assert(rb.contentDigest===digest(rendered),'READBACK_DIGEST_DRIFT');
assert(rb.counselStatus==='deferred_post_golive'&&rb.interimGoLive===true,'COUNSEL_STATUS_READBACK_DRIFT');
assert(rb.restrictedFieldsReturned===false,'RESTRICTED_FIELDS_READBACK_DRIFT');
let collision=false;try{await provider.materialize({command,gate});}catch(e){collision=e.code==='LEGAL_PUBLICATION_BOOTSTRAP_COLLISION';}assert(collision,'CREATE_ONLY_COLLISION_NOT_BLOCKED');

console.log(JSON.stringify({decision:'PASS_I3_LEGAL_V04_INTERIM_MATERIALIZATION_PROVIDER_SOURCE_ONLY',sourceOnly:true,nextGate:LEGAL_PUBLICATION_GATE,counselDeferredNotApproved:true,providerAuthorityPrepared:true,exactBootstrapFirestoreWrites:4,legalProfileWrites:1,legalProviderWrites:1,legalContentWrites:2,legalAcceptanceWrites:0,authWrites:0,passwordResets:0,historicalCredentialAccess:0,historicalReconciliationWrites:0,automaticAcceptance:false,humanAcceptanceRequired:true,restrictedDomicileAutoPublished:false,unresolvedPlaceholdersPublishable:false,falseCounselClaimAllowed:false,providerReadsExecutedAgainstFirebase:0,providerWritesExecutedAgainstFirebase:0,deploys:0,merge:false,production:false},null,2));
