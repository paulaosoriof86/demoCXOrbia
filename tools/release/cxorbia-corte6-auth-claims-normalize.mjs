import fs from 'node:fs';
import crypto from 'node:crypto';
import admin from 'firebase-admin';

const expectedProject = process.env.CXORBIA_EXPECTED_PROJECT || 'cxorbia-backend-dev';
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const execute = process.env.CXORBIA_EXECUTE_AUTH_CLAIMS === 'true';
const expectedClients = Number(process.env.CXORBIA_EXPECTED_CLIENTS || 2);
const expectedShoppers = Number(process.env.CXORBIA_EXPECTED_SHOPPERS || 3);
const canonicalProjectId = 'cinepolis';
const tenantId = 'tya';
const staleProjectIds = new Set(['tya','tya-piloto']);
const out = process.env.CXORBIA_AUTH_EXECUTION_REPORT || 'app/docs/evidence/CORTE6-AUTH-CLAIMS-NORMALIZATION-LATEST.json';

if (!credentialPath || !fs.existsSync(credentialPath)) throw new Error('credential_missing');
const sa = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
if (sa.project_id !== expectedProject) throw new Error(`wrong_project:${sa.project_id || 'missing'}!=${expectedProject}`);
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa), projectId: expectedProject });
const auth = admin.auth();
const db = admin.firestore();

function vals(v){
  if(Array.isArray(v)) return v.map(String).map(x=>x.trim()).filter(Boolean);
  if(typeof v === 'string') return v.split(',').map(x=>x.trim()).filter(Boolean);
  return [];
}
function passwordProvider(u){ return (u.providerData || []).some(p=>p.providerId==='password'); }
function tenantAllowed(c, role){ return role==='super' || c.tenantId===tenantId || vals(c.tenants).includes(tenantId); }
function hashId(uid){ return crypto.createHash('sha256').update(String(uid)).digest('hex').slice(0,16); }
function staleOnly(projectIds){ return projectIds.length>0 && projectIds.every(x=>staleProjectIds.has(x)); }

const shopperRefs = await db.collection('tenants').doc(tenantId).collection('shoppers').listDocuments();
const shopperIds = new Set(shopperRefs.map(r=>r.id));
const targets=[];
let token;
do {
  const page=await auth.listUsers(1000,token);
  for(const u of page.users){
    if(u.disabled || !passwordProvider(u)) continue;
    const c=u.customClaims||{};
    const role=typeof c.role==='string'?c.role:'';
    if(!tenantAllowed(c,role)) continue;
    const projectIds=vals(c.projectIds);
    if(projectIds.includes(canonicalProjectId) || !staleOnly(projectIds)) continue;
    if(role==='cliente'||role==='client'){
      targets.push({uid:u.uid, kind:'client', role, beforeProjectIds:projectIds});
      continue;
    }
    if(role==='shopper'){
      const shopperId=typeof c.shopperId==='string'?c.shopperId.trim():'';
      if(!shopperId || !shopperIds.has(shopperId)) continue;
      targets.push({uid:u.uid, kind:'shopper', role, beforeProjectIds:projectIds});
    }
  }
  token=page.pageToken;
}while(token);

const clientTargets=targets.filter(x=>x.kind==='client');
const shopperTargets=targets.filter(x=>x.kind==='shopper');
const blockers=[];
if(clientTargets.length!==expectedClients) blockers.push(`client_target_count:${clientTargets.length}!=${expectedClients}`);
if(shopperTargets.length!==expectedShoppers) blockers.push(`shopper_target_count:${shopperTargets.length}!=${expectedShoppers}`);
if(targets.length!==(expectedClients+expectedShoppers)) blockers.push(`total_target_count:${targets.length}!=${expectedClients+expectedShoppers}`);
if(blockers.length) throw new Error('selection_blocked:'+blockers.join(','));

const changes=[];
for(const t of targets){
  const u=await auth.getUser(t.uid);
  const before=u.customClaims||{};
  const currentIds=vals(before.projectIds);
  if(currentIds.includes(canonicalProjectId) || !staleOnly(currentIds)) throw new Error('target_drift:'+hashId(t.uid));
  const after={...before, projectId:canonicalProjectId, projectIds:[canonicalProjectId]};
  const summary={principalHash:hashId(t.uid),kind:t.kind,role:t.role,beforeProjectIds:currentIds,afterProjectIds:[canonicalProjectId],executed:false};
  if(execute){
    await auth.setCustomUserClaims(t.uid,after);
    const verify=await auth.getUser(t.uid);
    const verifiedIds=vals((verify.customClaims||{}).projectIds);
    if((verify.customClaims||{}).projectId!==canonicalProjectId || verifiedIds.length!==1 || verifiedIds[0]!==canonicalProjectId){
      throw new Error('post_write_verify_failed:'+hashId(t.uid));
    }
    summary.executed=true;
  }
  changes.push(summary);
}

const report={
  schemaVersion:'cxorbia.corte6-auth-claims-normalization.v1',
  generatedAt:new Date().toISOString(),
  projectId:expectedProject,
  tenantId,
  canonicalProjectId,
  mode:execute?'EXECUTED':'DRY_RUN',
  selected:{clients:clientTargets.length,shoppers:shopperTargets.length,total:targets.length},
  expected:{clients:expectedClients,shoppers:expectedShoppers,total:expectedClients+expectedShoppers},
  changes,
  safety:{newUsers:0,passwordChanges:0,deletes:0,firestoreWrites:0,hostingDeploys:0,production:false,merge:false,piiExported:false}
};
fs.mkdirSync(new URL('../../app/docs/evidence/',import.meta.url),{recursive:true});
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify({mode:report.mode,selected:report.selected,providerWrites:execute?targets.length:0,piiExported:false}));
