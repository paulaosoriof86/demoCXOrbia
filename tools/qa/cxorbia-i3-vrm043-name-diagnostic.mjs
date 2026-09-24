#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';
import {settleCustomRoleAuth} from '../../.github/control/RECOVERY-I3-BROWSER-AUTH-LIFECYCLE-20260919.mjs';

const PROJECT=String(process.env.PROJECT||'cxorbia-backend-dev');
const HOST=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const TENANT=String(process.env.TENANT_ID||'tya');
const PROJ=String(process.env.PROJECT_ID||'cinepolis');
const OUT=String(process.env.VRM043_OUT||'.tmp/vrm043-name-diagnostic');
const EXPECTED_REV=String(process.env.VRM043_EXPECTED_HR_REVISION||'').trim();
const PRE='YES_PAULA_20260628_PREVIEW_DEV',PROT='YES_PAULA_20260730_PROTECTED_DEV',FULL='YES_PAULA_20260731_FULL_PROFILE_DEV';
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
fs.mkdirSync(OUT,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const staff=members.find(m=>m.active===true&&String(m.authNamespace)==='staff'&&String(m.role)==='super')||
  members.find(m=>m.active===true&&String(m.authNamespace)==='staff'&&['admin','ops','coordinador'].includes(String(m.role)));
if(!staff)throw new Error('AUTH_FAILURE:VRM043_STAFF_MISSING');

const hrResp=await fetch(HOST+'/api/tya/'+encodeURIComponent(PROJ)+'/hr-live?format=json&vrm043='+Date.now(),{headers:{'cache-control':'no-cache'}});
if(!hrResp.ok)throw new Error('SOURCE_FAILURE:VRM043_HR_HTTP_'+hrResp.status);
const hp=await hrResp.json(),hr=hp?.snapshot||hp?.data||hp;
const revision=String(hp?._runtime?.revision||hr?._runtime?.revision||hr?.sourceRevision||'');
const hrShoppers=Array.isArray(hr?.shoppers)?hr.shoppers:[];
const hrVisits=Array.isArray(hr?.visits)?hr.visits:[];
if(!/^[a-f0-9]{64}$/.test(revision)||!hrShoppers.length)throw new Error('SOURCE_FAILURE:VRM043_HR_INVALID');
const opResp=await fetch(HOST+'/api/tya/'+encodeURIComponent(PROJ)+'/hr-live?format=json&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV&vrm043op='+Date.now(),{headers:{'cache-control':'no-cache'}});
if(!opResp.ok)throw new Error('SOURCE_FAILURE:VRM043_OPERATIONAL_HR_HTTP_'+opResp.status);
const opPayload=await opResp.json(),opHr=opPayload?.snapshot||opPayload?.data||opPayload;
const opRevision=String(opPayload?._runtime?.revision||opHr?._runtime?.revision||opHr?.sourceRevision||'');
const opShoppers=Array.isArray(opHr?.shoppers)?opHr.shoppers:[];
if(opRevision!==revision)throw new Error('RELEASE_COMPOSITION_FAILURE:VRM043_OPERATIONAL_VIEW_REVISION_DESYNC:'+opRevision+':'+revision);
if(opHr?.operationalIdentityPreview!==true||String(opHr?.operationalIdentityScope||'')!=='display_name_only')throw new Error('SOURCE_FAILURE:VRM043_OPERATIONAL_IDENTITY_VIEW_NOT_ACTIVE');
const opById=new Map(opShoppers.map(x=>[String(x?.shopperId||x?.id||'').trim(),x]).filter(([k])=>k));
if(EXPECTED_REV&&revision!==EXPECTED_REV)throw new Error('RELEASE_COMPOSITION_FAILURE:VRM043_EXPECTED_HR_REVISION_MISMATCH:'+revision+':'+EXPECTED_REV);

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await ctx.newPage();
  const base=HOST+'/index-backend-dev.html?'+new URLSearchParams({cxBackendPreview:PRE,cxProjectId:PROJ,cxProtectedRuntime:PROT,cxHumanFullVisual:FULL});
  await settleCustomRoleAuth({page,member:staff,role:'admin',tenantId:TENANT,projectId:PROJ,baseUrl:base,getCustomToken:()=>auth.createCustomToken(staff.id)});
  await page.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,null,{timeout:150000});
  const observed=await page.evaluate(()=>({
    revision:String(window.CX?.data?.previewMeta?.sourceRevision||''),
    shoppers:(Array.isArray(window.CX?.data?.shoppers)?window.CX.data.shoppers:[]).map(x=>({
      id:String(x?.id||x?.shopperId||''),
      shopperId:String(x?.shopperId||''),
      nombre:String(x?.nombre||''),
      name:String(x?.name||''),
      displayName:String(x?.displayName||''),
      fullName:String(x?.fullName||''),
      legacyLiveShopperIds:Array.isArray(x?.legacyLiveShopperIds)?x.legacyLiveShopperIds.map(String):[],
      exactAliases:Array.isArray(x?.exactAliases)?x.exactAliases.map(String):[],
      identityAuthority:String(x?.identityAuthority||''),
      identityReviewRequired:x?.identityReviewRequired===true,
      identityReviewReason:String(x?.identityReviewReason||''),
      canonicalIdentityOverlay:x?.__canonicalIdentityOverlay===true
    }))
  }));
  if(observed.revision!==revision)throw new Error('RELEASE_COMPOSITION_FAILURE:VRM043_REVISION_DESYNC:'+observed.revision+':'+revision);
  const obs=observed.shoppers;
  const byId=new Map(obs.map(x=>[x.id,x]).filter(([k])=>k));
  const details=[];
  let matchedById=0,matchedByLegacy=0,missing=0,nameEqual=0,nameMismatch=0;
  const visitNamesByShopper=new Map();
  for(const v of hrVisits){
    const id=String(v?.shopperId||'').trim(),nm=String(v?.shopper||v?.shopperName||v?.nombreShopper||'').trim();
    if(id&&nm&&!visitNamesByShopper.has(id))visitNamesByShopper.set(id,nm);
  }
  for(const h of hrShoppers){
    const id=String(h?.shopperId||h?.id||'').trim();
    const safeName=String(h?.nombre||h?.name||h?.displayName||h?.fullName||'').trim();
    const op=opById.get(id)||{};
    const hrName=String(op?.nombre||op?.name||op?.displayName||op?.fullName||'').trim();
    if(!id||!hrName)continue;
    let row=byId.get(id)||null,matchMode='id';
    if(row)matchedById++;
    else{
      row=obs.find(x=>x.legacyLiveShopperIds.includes(id)||x.exactAliases.includes(id))||null;
      if(row){matchedByLegacy++;matchMode='alias';}
    }
    if(!row){missing++;if(details.length<20)details.push({id,safeName,hrName,visitName:visitNamesByShopper.get(id)||'',matchMode:'missing'});continue;}
    const observedName=String(row.nombre||row.name||row.displayName||row.fullName||'').trim();
    const authorityHuman=hrName&&hrName!=='Shopper protegido'&&!/^shopper_(?:gt|hn|sv|ni)_[a-z0-9]+$/i.test(hrName);
    const equal=authorityHuman?norm(observedName)===norm(hrName):null;
    if(authorityHuman){if(equal)nameEqual++;else nameMismatch++;}
    if((!equal||details.length<8)&&details.length<30)details.push({
      id,safeName,hrName,visitName:visitNamesByShopper.get(id)||'',observedId:row.id,observedShopperId:row.shopperId,
      observedName,observedRaw:{nombre:row.nombre,name:row.name,displayName:row.displayName,fullName:row.fullName},
      legacyLiveShopperIds:row.legacyLiveShopperIds,exactAliases:row.exactAliases,
      identityAuthority:row.identityAuthority,identityReviewRequired:row.identityReviewRequired,identityReviewReason:row.identityReviewReason,canonicalIdentityOverlay:row.canonicalIdentityOverlay,authorityHuman,matchMode,equal
    });
  }
  const report={
    decision:'PASS_VRM043_NAME_DIAGNOSTIC',
    generatedAt:new Date().toISOString(),production:false,writes:0,deploys:0,
    sourceRevision:revision,hrShopperCount:hrShoppers.length,operationalHrShopperCount:opShoppers.length,observedShopperCount:obs.length,
    sourceSafeProtectedNameCount:hrShoppers.filter(x=>String(x?.nombre||x?.name||'').trim()==='Shopper protegido').length,
    operationalHumanNameCount:opShoppers.filter(x=>{const n=String(x?.nombre||x?.name||x?.displayName||'').trim();return n&&n!=='Shopper protegido';}).length,
    matchedById,matchedByLegacy,missing,nameEqual,nameMismatch,
    mismatchRatio:nameMismatch/Math.max(1,nameEqual+nameMismatch),
    unresolvedAuthorityCount:details.filter(x=>x.authorityHuman===false).length,
    unresolvedProperlyReviewOnly:details.filter(x=>x.authorityHuman===false&&x.identityReviewRequired===true&&x.identityReviewReason==='human_display_name_unresolved'&&x.observedName==='Identidad pendiente de revisión').length,
    sample:details
  };
  fs.writeFileSync(path.join(OUT,'vrm043-name-diagnostic.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
  await ctx.close();
}finally{await browser.close();}
