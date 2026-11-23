/* I3/F2 — identity-safe original Excel HR lineage for the existing operational reader.
 * Pure source adapter: no network, no writes, no logging of private HR rows.
 * Use after Make/Graph has independently verified a country/period binding.
 * This is NOT a substitute for the canonical R20 visit state engine.
 */
import {createHash} from 'node:crypto';

const str = value => String(value ?? '').trim();
const norm = value => str(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const hash = value => createHash('sha256').update(value).digest('hex');
const fail = code => {throw new Error('MAPPING_FAILURE:EXCEL_OPERATIONAL_' + code);};
const id = value => /^[a-z0-9][a-z0-9._:-]{0,179}$/i.test(str(value));
const rev = value => /^[a-f0-9]{64}$/i.test(str(value));

// Business identity uses source's declared scenario dimensions, not a row number
// or a person's name. Revisions of dates, shopper and status do not change it.
export function excelVisitBusinessKey(visit, scope) {
  const fields = [scope.tenantId,scope.projectId,scope.periodId,scope.countryCode,
    visit.cinemaId || visit.idCinema,visit.sucursal || visit.shopping,
    visit.quincena,visit.franja,visit.escenario || visit.tipoCompra,
    visit.formato,visit.tipoCombo];
  if(fields.slice(0,8).some(value => !str(value))) fail('VISIT_BUSINESS_IDENTITY_INCOMPLETE');
  return hash(fields.map(norm).join('\u001f'));
}

function assertScope(scope) {
  if(!scope || ![scope.tenantId,scope.projectId,scope.periodId].every(id)
    || !/^[A-Z]{2}$/.test(str(scope.countryCode))) fail('SCOPE_INVALID');
}
function visitIdOf(row) {return str(row.hrRowId || ((row.sourceTab && row.sourceRow) ? `${row.sourceTab}::${row.sourceRow}` : '') || row.visitId || row.id);}
function correctScope(row,scope) {
  if(str(row.tenantId || scope.tenantId)!==scope.tenantId ||
    str(row.projectId || scope.projectId)!==scope.projectId) fail('EXISTING_PROJECT_SCOPE_CONFLICT');
  const period=str(row.periodId || row.measurementPeriodId || `${scope.projectId}-${str(row.periodKey)}`);
  if(period!==scope.periodId) fail('EXISTING_PERIOD_SCOPE_CONFLICT');
  if(str(row.country || row.pais).toUpperCase()!==scope.countryCode) fail('EXISTING_COUNTRY_SCOPE_CONFLICT');
}

export function reconcileOriginalExcelPeriod({binding,read,parsedVisits,existingVisits,
  exactShopperCrosswalk,existingIndexComplete=false,canonicalizeVisit}={}) {
  const scope=binding?.scope;
  assertScope(scope);
  const proof=binding?.proof||{},readProof=read?.proof||{};
  if(proof.providerType!=='excel_online'||proof.readPolicy!=='external_live'
    ||proof.writePolicy!=='external_read_only'||proof.hrWrites!==false
    ||!rev(proof.bindingFingerprint)) fail('PROVIDER_BINDING_INVALID');
  for(const key of ['tenantId','projectId','periodId','countryCode']) {
    if(str(readProof[key])!==str(scope[key])) fail('PROVIDER_READ_SCOPE_DRIFT');
  }
  if(readProof.bindingFingerprint!==proof.bindingFingerprint ||
    !rev(readProof.sourceRevision)||readProof.externalRevisionIndependentlyVerified!==true ||
    readProof.hrWrites!==0) fail('PROVIDER_REVISION_UNVERIFIED');
  if(!existingIndexComplete || !Array.isArray(existingVisits)) fail('DURABLE_VISIT_INDEX_INCOMPLETE');
  if(!Array.isArray(parsedVisits)||!parsedVisits.length||
    typeof canonicalizeVisit!=='function') fail('CANONICAL_VISITS_REQUIRED');
  if(!(exactShopperCrosswalk instanceof Map)) fail('SHOPPER_CROSSWALK_REQUIRED');

  const byBusiness=new Map(),existingIds=new Set();
  for(const row of existingVisits) {
    correctScope(row,scope);
    const key=excelVisitBusinessKey(row,scope),stable=visitIdOf(row);
    if(!stable||byBusiness.has(key)||existingIds.has(stable)) fail('DURABLE_VISIT_INDEX_AMBIGUOUS');
    byBusiness.set(key,row);existingIds.add(stable);
  }

  const seenBusiness=new Set(),matched=new Set(),usedIds=new Set(),visits=[];
  let newVisits=0,existingPreserved=0,assigned=0;
  for(const raw of parsedVisits) {
    correctScope(raw,scope);
    const key=excelVisitBusinessKey(raw,scope);
    if(seenBusiness.has(key)) fail('ORIGINAL_SOURCE_DUPLICATE_BUSINESS_KEY');
    seenBusiness.add(key);
    const old=byBusiness.get(key);
    const stable=old?visitIdOf(old):`hr_excel_${hash(key).slice(0,24)}`;
    const hrRowId=old?str(old.hrRowId || stable):stable;
    if(!stable||usedIds.has(stable)||(existingIds.has(stable)&&!old)) fail('VISIT_ID_COLLISION');
    usedIds.add(stable);
    if(old){matched.add(key);existingPreserved++;}else newVisits++;
    const hadShopper=raw.canonicalFacets?.assigned===true || raw.hasShopper===true;
    const alias=str(raw.shopperId);
    // Never merge two real people by name alone. An assigned Excel row MUST
    // have an explicit provider/identity crosswalk before publication.
    const canonicalShopperId=hadShopper?str(exactShopperCrosswalk.get(alias)):'';
    if(hadShopper && (!alias||!canonicalShopperId||!id(canonicalShopperId))) fail('ASSIGNED_SHOPPER_CROSSWALK_MISSING');
    if(hadShopper)assigned++;
    const candidate={...raw,
      id:stable,visitId:stable,hrRowId,
      tenantId:scope.tenantId,projectId:scope.projectId,periodId:scope.periodId,
      country:scope.countryCode,pais:scope.countryCode,
      shopperId:hadShopper?canonicalShopperId:null,
      canonicalShopperId:hadShopper?canonicalShopperId:null,
      assignmentSource:hadShopper?'hr':null,
      assignmentSyncStatus:hadShopper?'synced':null,
      hrSourceRevision:readProof.sourceRevision,
      hrBindingFingerprint:proof.bindingFingerprint,
      sourceSafe:true,piiProtected:true};
    // Preserve approved business identity: do not silently substitute the
    // physical row or the Excel worksheet id as a new durable visit key.
    visits.push(canonicalizeVisit(candidate));
  }
  const unaccounted=existingVisits.filter(row=>!matched.has(excelVisitBusinessKey(row,scope))
    && !['archived','cancelled','cancelada'].includes(norm(row.estado || row.status)));
  if(unaccounted.length) fail('EXISTING_ACTIVE_VISITS_UNMATCHED');
  const readOnlyProof={schemaVersion:'cxorbia.i3.f2.excel-operational-lineage.v1',...scope,
    sourceRevision:readProof.sourceRevision,bindingFingerprint:proof.bindingFingerprint,
    visits:visits.length,newVisits,existingPreserved,assigned,
    archivedUnmatched:existingVisits.length-existingPreserved-unaccounted.length,
    identityResolution:'exact_durable_crosswalk',existingIndexComplete:true,
    originalSource:true,independentProviderRevision:true,hrWrites:0,
    firestoreWrites:0,production:false};
  return {visits,proof:readOnlyProof};
}
