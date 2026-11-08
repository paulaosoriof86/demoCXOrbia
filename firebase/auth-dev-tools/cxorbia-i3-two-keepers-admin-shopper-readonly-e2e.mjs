#!/usr/bin/env node
/* I3 focal DEV readback after the two approved human identity mergers.
 * Uses existing Auth principals and a signed browser session; does not issue
 * provider commands, write Firebase, edit HR, deploy or enter production.
 * A source test is not a module certificate: this proves exact Admin+Shopper
 * role visibility against the currently served HR revision only. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault, getApps, initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {getStorage} from 'firebase-admin/storage';
import {chromium} from 'playwright';

const TENANT='tya', PROGRAM='cinepolis', PROJECT='cxorbia-backend-dev';
const ROOT='https://cxorbia-backend-dev.web.app';
const ALIAS='https://cxorbia-backend-dev.firebaseapp.com';
const SOURCE=String(process.env.CXORBIA_PRODUCT_SOURCE_SHA||'').trim();
const EXPECTED_HR=String(process.env.CXORBIA_HR_REVISION||'').trim();
const OUT='.tmp/cxorbia-i3-two-keepers-role-e2e-readonly';
const norm=x=>String(x??'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const str=x=>String(x??'').trim(),arr=x=>Array.isArray(x)?x:[];
const fingerprint=x=>crypto.createHash('sha256').update(str(x)).digest('hex').slice(0,16);
const cases=[
  {caseId:'GT_MURGA',login:'jennypher.murga',approvedName:'Jhennypher Murga',country:'GT'},
  {caseId:'HN_VILCA',login:'rocio.vilca',approvedName:'Rocío Vilca',country:'HN'}
];
const result={schemaVersion:'cxorbia.i3.two-keepers.admin-shopper-readonly-e2e.v1',
  iteration:'I3',gate:'HOLD',sourceSha:SOURCE,expectedHrRevision:EXPECTED_HR,
  environment:PROJECT,projectId:PROGRAM,decision:'HOLD_NOT_EXECUTED',
  admin:{},shoppers:[],checks:[],pdfComparison:{decision:'HOLD_NOT_RUN',sites:[]},
  safety:{providerCommands:0,directAuthWrites:0,directFirestoreWrites:0,
    hrWrites:0,deploys:0,production:false}};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n','utf8');
const check=(ok,code,details={})=>{
  result.checks.push({code,pass:!!ok,...details});
  if(!ok)throw Error(code);
};
const authUrl=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV'+
  '&cxProjectId='+PROGRAM+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV'+
  '&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
let browser;
const shortError=e=>{
  const s=str(e?.message||e),known=s.match(/(?:SOURCE_FAILURE|MAPPING_FAILURE|PROVIDER_FAILURE|PERSISTENCE_FAILURE|AUTH_FAILURE|FUNCTIONAL_DEFECT|VISUAL_DEFECT|RELEASE_COMPOSITION_FAILURE|ENVIRONMENT_FAILURE):[A-Z0-9_]+/);
  return known?known[0]:/timeout/i.test(s)?'ENVIRONMENT_FAILURE:E2E_TIMEOUT':
    /execution context|navigation|frame detached/i.test(s)?'ENVIRONMENT_FAILURE:BROWSER_NAVIGATION_INTERRUPTED':
      'FUNCTIONAL_DEFECT:E2E_UNCLASSIFIED';
};
const approvedCountry=v=>{
  const n=norm(v);
  return ['gt','guatemala'].includes(n)?'GT':['hn','honduras'].includes(n)?'HN':'UNSET';
};
async function signed(auth,member,role,root=ROOT){
  const requestedUrl=authUrl.replace(ROOT,root);
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  const token=await auth.createCustomToken(member.uid);
  await page.goto(requestedUrl+'&case='+role+'&stamp='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>!!window.firebase?.auth && window.firebase.apps?.length>0,null,{timeout:90000});
  await page.evaluate(async()=>{await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);});
  await page.evaluate(jwt=>{window.firebase.auth().signInWithCustomToken(jwt).catch(()=>{});return true;},token);
  await page.waitForFunction(uid=>window.firebase?.auth?.()?.currentUser?.uid===uid,member.uid,{timeout:90000});
  await page.goto('about:blank',{waitUntil:'domcontentloaded',timeout:30000});
  await page.goto(requestedUrl+'&settled='+role+'&stamp='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({uid,revision,role})=>{
    const cx=window.CX,ctx=cx?.backendAuth?.context?.()||{},value=String(ctx.role||'').toLowerCase();
    return window.firebase?.auth?.()?.currentUser?.uid===uid &&
      ctx.authenticated===true && (role==='admin'?['admin','super'].includes(value):value==='shopper') &&
      window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true &&
      String(cx?.data?.previewMeta?.sourceRevision||'')===revision;
  },{uid:member.uid,revision:EXPECTED_HR,role},{timeout:120000});
  return {context,page};
}
// Separate fresh browser contexts prevent the real Julissa/Admin sessions from
// sharing Firebase persistence. Reads only; never persist JWTs, Storage paths,
// PDF bytes, user identities or query payloads in the uploaded receipt.
async function probePublishedPdf(auth,member,origin,label){
  const entry={label,origin,status:'HOLD_NOT_RUN'};
  let session;
  try{
    session=await signed(auth,member,'shopper',origin);
    entry.storageBucket=await session.page.evaluate(()=>String(window.firebase?.app?.()?.options?.storageBucket||''));
    const failedFetches=[];
    session.page.on('requestfailed',request=>{
      if(request.url().startsWith('https://firebasestorage.googleapis.com/')){
        const reason=str(request.failure()?.errorText);
        failedFetches.push(/ERR_FAILED/.test(reason)?'NET_ERR_FAILED':
          /ERR_BLOCKED/.test(reason)?'NET_ERR_BLOCKED':
          /ERR_ABORTED/.test(reason)?'NET_ERR_ABORTED':'NETWORK_FAILURE');
      }
    });
    entry.observed=await session.page.evaluate(async()=>{
      const api=window.CX?.backendResources;
      const scope=api?.scope?.()||{};
      const safe=e=>{
        const s=String(e?.message||e||'');
        const m=s.match(/(?:AUTH_FAILURE|SOURCE_FAILURE|MAPPING_FAILURE|PROVIDER_FAILURE|PERSISTENCE_FAILURE|FUNCTIONAL_DEFECT|VISUAL_DEFECT|RELEASE_COMPOSITION_FAILURE|ENVIRONMENT_FAILURE):[A-Z0-9_]+/);
        return m?m[0]:'RESOURCE_PROJECTION_UNCLASSIFIED';
      };
      const out={scope:{tenantId:String(scope.tenantId||''),projectId:String(scope.projectId||''),
        periodId:String(scope.periodId||'')},projection:'HOLD',pdfCandidates:0};
      if(!api?.load||!api?.list||!api?.readPublishedPdf){
        out.projectionCode='RESOURCE_API_UNAVAILABLE';return out;
      }
      try{
        await api.load();
        out.projection='PASS';
      }catch(error){
        out.projectionCode=safe(error);return out;
      }
      const candidates=api.list({resourceType:'project_resource'}).filter(item=>{
        const title=String(item?.n||item?.name||item?.title||item?.titulo||'')
          .normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
        return String(item?.tipo||'').toLowerCase()==='pdf'&&
          /instructivo.*shopper.*cinepolis/.test(title);
      });
      out.pdfCandidates=candidates.length;
      if(candidates.length!==1){
        out.readCode='RESOURCE_GUIDE_CARDINALITY_MISMATCH';return out;
      }
      const chosen=candidates[0];
      out.resourcePeriodId=String(chosen.periodId||'');
      const result=await api.readPublishedPdf(chosen,{timeoutMs:15000});
      out.read={ok:result?.ok===true,code:result?.ok===true?'PASS':
        String(result?.code||'RESOURCE_READ_UNKNOWN'),httpStatus:result?.httpStatus??null,
        diagnostic:{stage:String(result?.diagnostic?.stage||''),
          tokenObtained:result?.diagnostic?.tokenObtained===true,
          httpStatus:result?.diagnostic?.httpStatus??null,
          bytesRead:result?.diagnostic?.bytesRead===true,
          bytesLength:Number(result?.diagnostic?.bytesLength||0),
          errorType:String(result?.diagnostic?.errorType||'')}};
      return out;
    });
    entry.storageNetworkFailures=failedFetches.slice(0,3);
    entry.status=entry.observed?.read?.ok===true?'PASS_PDF_READ':'HOLD_PDF_READ';
  }catch(error){
    entry.status='HOLD_AUTHENTICATION_OR_ENVIRONMENT';
    entry.failureCode=shortError(error);
  }finally{
    if(session?.context)await session.context.close().catch(()=>{});
  }
  return entry;
}
async function comparePdfOrigins(auth,members){
  const matches=members.filter(m=>m.active===true&&norm(m.role)==='shopper'&&
    norm(m.authNamespace)==='shopper'&&
    norm(m.visibleLogin||m.username||m.user)==='julissa.flores');
  const report={decision:'HOLD',sites:[],caseId:'GT_JULISSA',membershipCount:matches.length,
    authorizedProjectMembership:matches.length===1&&arr(matches[0].projectIds).includes(PROGRAM)};
  if(!report.authorizedProjectMembership){
    report.failureCode='AUTH_FAILURE:SHOPPER_RESOURCE_PROJECT_MEMBERSHIP_MISSING';
    return report;
  }
  for(const [origin,label] of [[ROOT,'CANONICAL_WEB_APP'],[ALIAS,'FIREBASEAPP_ALIAS']]){
    report.sites.push(await probePublishedPdf(auth,matches[0],origin,label));
  }
  const bucketNames=report.sites.map(s=>s.storageBucket).filter(Boolean);
  report.storageCors={decision:'HOLD_NOT_READ'};
  if(bucketNames.length===2&&bucketNames[0]===bucketNames[1]&&
      /^cxorbia-backend-dev\.(?:firebasestorage\.app|appspot\.com)$/.test(bucketNames[0])){
    try{
      const [metadata]=await getStorage().bucket(bucketNames[0]).getMetadata();
      const entries=Array.isArray(metadata?.cors)?metadata.cors:[];
      const allows=(origin)=>entries.some(rule=>Array.isArray(rule.origin)&&
        rule.origin.includes(origin)&&Array.isArray(rule.method)&&rule.method.includes('GET'));
      report.storageCors={decision:'PASS_BUCKET_METADATA_READ',bucketFingerprint:fingerprint(bucketNames[0]),
        corsEntryCount:entries.length,canonicalGetAllowed:allows(ROOT),aliasGetAllowed:allows(ALIAS)};
    }catch(error){
      report.storageCors={decision:'HOLD_CORS_READ_PERMISSION_OR_PROVIDER',
        failureCode:String(error?.code||'')==='403'?'PROVIDER_FAILURE:STORAGE_BUCKET_METADATA_PERMISSION':
          'PROVIDER_FAILURE:STORAGE_BUCKET_METADATA_READ'};
    }
  }
  for(const site of report.sites)delete site.storageBucket;
  report.decision=report.sites.every(s=>s.status==='PASS_PDF_READ')?
    'PASS_BOTH_ORIGINS_PDF_READ':'HOLD_PDF_ORIGIN_COMPARISON';
  return report;
}

async function gotoRoute(page,route){
  await page.evaluate(r=>window.CX.router.nav(r,{history:false}),route);
  await page.waitForFunction(r=>String(window.CX?.session?.view||'')===r,route,{timeout:30000});
  await page.waitForFunction(()=>String(document.querySelector('#view')?.innerText||'').trim().length>35,null,{timeout:30000});
}
try {
  if(!/^[a-f0-9]{40}$/.test(SOURCE) ||
     !/^[a-f0-9]{64}$/.test(EXPECTED_HR) ||
     str(process.env.CXORBIA_PRODUCT_SOURCE_SHA)!==SOURCE ||
     str(process.env.CXORBIA_HR_REVISION)!==EXPECTED_HR)
    throw Error('RELEASE_COMPOSITION_FAILURE:EXPECTED_DEV_SOURCE_REVISION_MISMATCH');
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
  const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
  const [membersSnap,profilesSnap]=await Promise.all([
    tenant.collection('users').get(),tenant.collection('shoppers').get()
  ]);
  const members=membersSnap.docs.map(d=>({uid:d.id,...d.data()}));
  const profiles=new Map(profilesSnap.docs.map(d=>[d.id,d.data()||{}]));
  const targets=[];
  for(const c of cases){
    const candidates=members.filter(m=>m.active===true&&str(m.role)==='shopper'&&
      str(m.authNamespace)==='shopper'&&arr(m.projectIds).includes(PROGRAM)&&
      norm(m.visibleLogin||m.username||m.user)===c.login);
    check(candidates.length===1,'MAPPING_FAILURE:KEEPER_MEMBERSHIP_NOT_UNIQUE',{caseId:c.caseId,count:candidates.length});
    const m=candidates[0],p=profiles.get(str(m.shopperId))||{};
    const user=await auth.getUser(m.uid);
    check(user.disabled!==true&&str(user.customClaims?.shopperId)===str(m.shopperId),
      'AUTH_FAILURE:KEEPER_UID_CLAIM_MISMATCH',{caseId:c.caseId});
    check(norm(p.nombre||[p.firstName,p.lastName].join(' '))===norm(c.approvedName)&&
      approvedCountry(p.pais||p.country)===c.country,
      'MAPPING_FAILURE:KEEPER_PROFILE_AUTHORITY_MISMATCH',{caseId:c.caseId,country:approvedCountry(p.pais||p.country)});
    targets.push({case:c,member:m,shopperId:str(m.shopperId)});
  }
  const admins=members.filter(m=>m.active===true&&['admin','super'].includes(norm(m.role))&&
    norm(m.authNamespace)==='staff'&&arr(m.projectIds).includes(PROGRAM));
  const validAdmins=[];
  for(const m of admins){
    const u=await auth.getUser(m.uid).catch(e=>str(e?.code)==='auth/user-not-found'?null:Promise.reject(e));
    if(u&&!u.disabled)validAdmins.push(m);
  }
  check(validAdmins.length>=1,'AUTH_FAILURE:DEV_ADMIN_NOT_AVAILABLE',{count:validAdmins.length});
  browser=await chromium.launch({headless:true});
  result.pdfComparison=await comparePdfOrigins(auth,members);
  const admin=await signed(auth,validAdmins[0],'admin');
  await gotoRoute(admin.page,'shoppers');
  result.admin={authenticated:true,staffUidFingerprint:fingerprint(validAdmins[0].uid),
    hrRevision:EXPECTED_HR,visibleRows:0,cases:[]};
  for(const t of targets){
    const data=await admin.page.evaluate(id=>{
      const source=window.CX?.data||{};
      const all=typeof source.shoppersFor==='function'?source.shoppersFor():[];
      const raw=Array.isArray(source.shoppers)?source.shoppers:[];
      const canonical=all.filter(s=>String(s.id||s.shopperId)===id);
      const rawKeeper=raw.filter(s=>String(s.id||s.shopperId)===id);
      const protectedKeeper=(Array.isArray(source.__protectedCertificationProfiles)?source.__protectedCertificationProfiles:[])
        .filter(s=>String(s.id||s.shopperId)===id);
      const activePeriod=typeof source.period==='function'?source.period():{};
      const tombstones=(Array.isArray(source.__shopperTombstones)?source.__shopperTombstones:[]);
      const idMap=source.__identityMap||{};
      const pre=window.CX_PROVIDER_IDENTITY_LINK_PRECOMPOSE||{};
      const post=window.CX_PROVIDER_IDENTITY_LINK_POSTCOMPOSE||{};
      const auth=window.CX_PROVIDER_IDENTITY_LINK_RUNTIME||{};
      const country=s=>String(s?.pais||s?.country||'');
      const mappedIds=Object.keys(idMap).filter(key=>String(idMap[key])===id);
      const keeperVisits=(Array.isArray(source._visitas)?source._visitas:[])
        .filter(v=>String(v.shopperId||'')===id).length;
      return {canonicalReadRows:canonical.length,
        exactName:canonical.length===1?String(canonical[0].nombre||''):null,
        identityState:canonical.length===1?String(canonical[0].identityState||''):null,
        diagnostic:{rawCount:raw.length,scopedCount:all.length,rawKeeperCount:rawKeeper.length,
          rawKeeperCountries:rawKeeper.map(country),rawKeeperIdentityStates:rawKeeper.map(s=>String(s.identityState||'')),
          rawKeeperProjects:rawKeeper.map(s=>({projectId:String(s.projectId||''),projectIds:Array.isArray(s.projectIds)?s.projectIds:[]})),
          periodCountries:Array.isArray(activePeriod?.countries)?activePeriod.countries:[],
          rawKeeperInScope:rawKeeper.map(s=>typeof source.inScope==='function'?source.inScope(s.pais):null),
          protectedKeeperCount:protectedKeeper.length,protectedKeeperCountries:protectedKeeper.map(country),
          liveHrIdsContainKeeper:(source.__liveHrShopperIds||[]).includes(id),
          tombstoneRetiredCanonical:tombstones.some(t=>String(t.shopperId||t.id)===id&&String(t.status||'').toLowerCase()==='retired'),
          mappedHrAliasCount:mappedIds.length,keeperVisits,
          providerLinksStatus:String(auth.status||''),providerLinksLoaded:Number(auth.links||0),
          precomposeAppliedCount:(pre.applied||[]).length,precomposeConflictCount:(pre.conflicts||[]).length,
          precomposeCanonicalApplied:(pre.applied||[]).filter(x=>String(x.canonicalShopperId||'')===id).length,
          precomposeCanonicalConflictReasons:(pre.conflicts||[]).filter(x=>String(x.canonicalShopperId||'')===id).map(x=>String(x.reason||'')),
          postcomposeCanonicalApplied:(post.applied||[]).filter(x=>String(x.canonicalShopperId||'')===id).length,
          postcomposeCanonicalConflictReasons:(post.conflicts||[]).filter(x=>String(x.canonicalShopperId||'')===id).map(x=>String(x.reason||''))}};
    },t.shopperId);
    const search=admin.page.locator('#shSearch');
    await search.fill(t.case.approvedName.split(' ').at(-1));
    const ui=await admin.page.evaluate(id=>{
      const rows=[...document.querySelectorAll('#shBody tr[data-sid]')];
      return {visibleFilteredRows:rows.length,
        canonicalDomRows:rows.filter(tr=>tr.dataset.sid===id).length,
        reviewBadge:rows.filter(tr=>tr.dataset.sid===id).some(tr=>tr.dataset.identityReview==='required')};
    },t.shopperId);
    result.admin.cases.push({caseId:t.case.caseId,...data,...ui});
    check(data.canonicalReadRows===1,'MAPPING_FAILURE:ADMIN_CANONICAL_READ_MODEL_MISSING',{caseId:t.case.caseId,count:data.canonicalReadRows});
    check(ui.canonicalDomRows===1,'FUNCTIONAL_DEFECT:ADMIN_KEEPER_ROW_NOT_VISIBLE',{caseId:t.case.caseId,rows:ui.canonicalDomRows});
    await search.fill('');
  }
  await gotoRoute(admin.page,'visitas');
  const adminVisits=await admin.page.evaluate(()=>({dataRows:window.CX?.data?._visitas?.length||0,
    viewLength:document.querySelector('#view')?.innerText?.length||0}));
  check(adminVisits.dataRows>0&&adminVisits.viewLength>35,'FUNCTIONAL_DEFECT:ADMIN_VISITS_NOT_HYDRATED');
  result.admin.visits=adminVisits;
  await admin.context.close();
  for(const t of targets){
    const shopper=await signed(auth,t.member,'shopper');
    const base=await shopper.page.evaluate(id=>{
      const cx=window.CX,own=typeof cx?.data?.visitsForShopper==='function'?
        cx.data.visitsForShopper(id,false):[],ids=own.map(v=>String(v.hrRowId||v.sourceCoord||v.id||v.visitId||''));
      return {ownerIdMatches:String(cx?.backendAuth?.context?.()?.shopperId||'')===id,
        ownVisits:own.length,uniqueVisitIds:new Set(ids).size,
        country:String(cx?.session?.user?.pais||cx?.backendAuth?.context?.()?.country||''),
        hrRevision:String(cx?.data?.previewMeta?.sourceRevision||'')};
    },t.shopperId);
    const caseReport={caseId:t.case.caseId,shopperIdFingerprint:fingerprint(t.shopperId),
      uidFingerprint:fingerprint(t.member.uid),...base,routes:[]};
    result.shoppers.push(caseReport);
    check(base.ownerIdMatches,'AUTH_FAILURE:SHOPPER_CANONICAL_SESSION_OWNER_MISMATCH',{caseId:t.case.caseId});
    check(base.ownVisits>0&&base.ownVisits===base.uniqueVisitIds,
      'MAPPING_FAILURE:SHOPPER_VISITS_ZERO_OR_DUPLICATE',{caseId:t.case.caseId,count:base.ownVisits});
    for(const route of ['miperfil','misvisitas']){
      await gotoRoute(shopper.page,route);
      const state=await shopper.page.evaluate(()=>({role:String(window.CX?.backendAuth?.context?.()?.role||''),
        route:String(window.CX?.session?.view||''),
        viewLength:document.querySelector('#view')?.innerText?.length||0}));
      caseReport.routes.push(state);
      check(state.role==='shopper'&&state.route===route&&state.viewLength>35,
        'FUNCTIONAL_DEFECT:SHOPPER_ROUTE_NOT_VISIBLE',{caseId:t.case.caseId,route});
    }
    await shopper.context.close();
  }
  if(result.pdfComparison?.decision!=='PASS_BOTH_ORIGINS_PDF_READ')
    throw Error('AUTH_FAILURE:SHOPPER_RESOURCE_PDF_ORIGIN_NOT_PROVEN');
  result.decision='PASS_SCOPED_ADMIN_GT_HN_SHOPPER_ROLE_DEV_E2E';
}catch(error){
  result.decision='HOLD_SCOPED_ADMIN_GT_HN_SHOPPER_ROLE_DEV_E2E';
  result.failureCode=shortError(error);
  process.exitCode=1;
}finally{
  if(browser)await browser.close().catch(()=>{});
  save();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
