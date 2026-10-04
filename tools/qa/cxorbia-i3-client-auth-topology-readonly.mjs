#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
const OUT=String(process.env.CLIENT_DIAG_OUT||'.tmp/i3-client-auth-topology');
fs.mkdirSync(OUT,{recursive:true});
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[],fp=v=>crypto.createHash('sha256').update(str(v)).digest('hex').slice(0,16);
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc('tya');
const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const memberClients=members.filter(m=>['cliente','client'].includes(str(m.role).toLowerCase())).map(m=>({uidFp:fp(m.id),active:m.active===true,role:str(m.role).toLowerCase(),authNamespace:str(m.authNamespace).toLowerCase()||null,projectIds:arr(m.projectIds).map(String).sort(),scopeProjectId:str(m.scopeProjectId)||null,tenantId:str(m.tenantId)||'tya'}));
const authClients=[];let token;
do{
 const page=await auth.listUsers(1000,token);token=page.pageToken;
 for(const u of page.users){
  const c=u.customClaims||{},role=str(c.role).toLowerCase();
  if(!['cliente','client'].includes(role))continue;
  authClients.push({uidFp:fp(u.uid),disabled:u.disabled===true,role,authNamespace:str(c.authNamespace).toLowerCase()||null,tenantId:str(c.tenantId)||null,tenants:arr(c.tenants).map(String).sort(),projectIds:arr(c.projectIds).map(String).sort(),emailFp:u.email?fp(u.email):null});
 }
}while(token);
const joined=[];
for(const a of authClients){const m=memberClients.find(x=>x.uidFp===a.uidFp)||null;joined.push({uidFp:a.uidFp,auth:a,member:m,valid:Boolean(m&&m.active===true&&!a.disabled&&['staff',''].includes(str(a.authNamespace))&&['staff',''].includes(str(m.authNamespace))&&(a.tenantId==='tya'||a.tenants.includes('tya'))&&a.projectIds.includes('cinepolis'))});}
const valid=joined.filter(x=>x.valid);
let decision='HOLD_CLIENT_AUTH_TOPOLOGY',classification='AUTH_FAILURE',code='CLIENT_IDENTITY_ABSENT';
if(valid.length) {decision='PASS_CLIENT_AUTH_TOPOLOGY';classification=null;code=null;}
else if(authClients.length&&memberClients.length===0){classification='MAPPING_FAILURE';code='CLIENT_AUTH_EXISTS_MEMBER_MISSING';}
else if(memberClients.length&&authClients.length===0){classification='AUTH_FAILURE';code='CLIENT_MEMBER_EXISTS_AUTH_OR_CLAIMS_MISSING';}
else if(authClients.length&&memberClients.length){classification='MAPPING_FAILURE';code='CLIENT_AUTH_MEMBER_SCOPE_OR_NAMESPACE_DESYNC';}
const out={schemaVersion:'cxorbia.i3.client-auth-topology-readonly.v1',decision,classification,code,memberClientCount:memberClients.length,authClientCount:authClients.length,validClientCount:valid.length,memberClients,authClients,joined,writes:0,hrWrites:0,externalWrites:0,production:false};
fs.writeFileSync(OUT+'/result.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
