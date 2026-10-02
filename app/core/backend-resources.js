/* CXOrbia · durable project resources authority — PRE-I4 Recovery.
   Firestore metadata is authoritative in connected lane. Browser memory/DataURL never is.
   Binary storage is fail-closed unless the tenant explicitly enables Storage AND validated rules. */
window.CX=window.CX||{};
(function(){
  const cfg=CX.BACKEND||{};
  const col=cfg.collections||{};
  const str=v=>String(v==null?'':v).trim();
  const arr=v=>Array.isArray(v)?v:[];
  const now=()=>new Date().toISOString();
  const hash=value=>{const s=typeof value==='string'?value:JSON.stringify(value||{});let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(36);};
  const clean=value=>Array.isArray(value)?value.map(clean):(value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined&&typeof v!=='function').map(([k,v])=>[k,clean(v)])):value);
  const connected=()=>cfg.enabled===true;
  function db(){return window.firebase&&firebase.apps&&firebase.apps.length&&firebase.firestore?firebase.firestore():null;}
  function tenantId(){const v=typeof cfg.tenantId==='function'?cfg.tenantId():cfg.tenantId;return str(v||'tya');}
  function uid(){try{return str(firebase.auth?.().currentUser?.uid);}catch(_){return'';}}
  function role(){try{return str(CX.session?.effectiveRole?.()||CX.session?.role||CX.session?.user?.role||'');}catch(_){return str(CX.session?.role||'');}}
  function isOperator(){return ['super','admin','ops','coordinador'].includes(role());}
  function currentScope(input={}){
    let c={};try{c=typeof CX.data?.ctx==='function'?CX.data.ctx():{};}catch(_){}
    return {
      tenantId:tenantId(),
      projectId:str(input.projectId||c.projectId||CX.data?.currentProjectId||CX.session?.user?.scopeProjectId),
      periodId:str(input.periodId||c.periodId||CX.data?.currentPeriodId)
    };
  }
  function tenantRef(){const d=db();return d?d.collection(col.tenants||'tenants').doc(tenantId()):null;}
  function resourcesCol(){const t=tenantRef();return t?t.collection(col.resources||'resources'):null;}
  function visible(item,scope){
    if(!item||item.status!=='active'||str(item.projectId)!==scope.projectId)return false;
    if(item.periodId&&scope.periodId&&str(item.periodId)!==scope.periodId)return false;
    if(isOperator())return true;
    return item.targetAll===true||arr(item.visibleRoles).map(str).includes(role());
  }
  function blocked(code,extra={}){return Object.assign({ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,code,production:false},extra);}
  function ack(item,extra={}){return Object.assign({ok:true,status:'committed',committed:true,providerAck:true,successUiAllowed:true,localMutation:false,localStorageWrite:false,item,production:false},extra);}
  const api=CX.backendResources=CX.backendResources||{};
  api.items=arr(api.items);
  api.connected=connected;
  api.scope=currentScope;
  api.list=function(input={}){
    const scope=currentScope(input),type=str(input.resourceType);
    return arr(api.items).filter(x=>visible(x,scope)&&(!type||str(x.resourceType)===type));
  };
  api.load=async function(input={}){
    if(!connected())return [];
    const c=resourcesCol(),scope=currentScope(input);
    if(!c||!scope.projectId){api.items=[];window.CX_BACKEND_RESOURCES_STATUS={source:'firestore',status:'blocked',reason:'RESOURCE_SCOPE_UNAVAILABLE',count:0,at:now()};return [];}
    let q=c.where('projectId','==',scope.projectId).where('status','==','active');
    if(!isOperator())q=q.where('visibleRoles','array-contains',role());
    const snap=await q.get();
    const rows=snap.docs.map(d=>Object.assign({id:d.id},d.data()||{})).filter(x=>visible(x,scope));
    api.items=rows;
    window.CX_BACKEND_RESOURCES_STATUS={source:'firestore',status:'ready',tenantId:scope.tenantId,projectId:scope.projectId,periodId:scope.periodId,count:rows.length,at:now()};
    try{CX.bus?.emit?.('resources',window.CX_BACKEND_RESOURCES_STATUS);}catch(_){}
    return rows;
  };
  api.saveMetadata=async function(item={},options={}){
    if(!connected())return blocked('RESOURCE_CONNECTED_AUTHORITY_DISABLED');
    if(!isOperator())return blocked('RESOURCE_WRITE_ROLE_DENIED');
    const c=resourcesCol(),scope=currentScope({projectId:item.projectId||options.projectId,periodId:item.periodId||options.periodId});
    if(!c||!scope.projectId)return blocked('RESOURCE_SCOPE_UNAVAILABLE');
    const idem=str(options.idempotencyKey||item.idempotencyKey||('resource:'+hash([scope.tenantId,scope.projectId,scope.periodId,clean(item)])));
    const rid=str(item.id)||('res-'+hash(idem));
    if(/^data:/i.test(str(item.url)))return blocked('RESOURCE_DATA_URL_FORBIDDEN');
    let output=null,replay=false;
    await db().runTransaction(async tx=>{
      const ref=c.doc(rid),snap=await tx.get(ref),prior=snap.exists?(snap.data()||{}):null;
      if(prior&&prior.lastIdempotencyKey===idem){output=Object.assign({id:rid},prior);replay=true;return;}
      const expected=options.expectedVersion;
      if(expected!==undefined&&expected!==null&&prior&&String(prior.version||0)!==String(expected))throw new Error('RESOURCE_EXPECTED_VERSION_CONFLICT');
      const version=Number(prior?.version||0)+1;
      const payload=Object.assign({},clean(prior||{}),clean(item),{
        id:rid,tenantId:scope.tenantId,projectId:scope.projectId,periodId:scope.periodId||null,
        status:'active',version,lastIdempotencyKey:idem,updatedAt:now(),updatedByUid:uid(),
        createdAt:prior?.createdAt||now(),createdByUid:prior?.createdByUid||uid()
      });
      delete payload.idempotencyKey;
      tx.set(ref,payload,{merge:false});output=payload;
    });
    await api.load(scope);
    return ack(output,{idempotencyKey:idem,idempotentReplay:replay});
  };
  api.deleteMetadata=async function(resourceId,options={}){
    if(!connected())return blocked('RESOURCE_CONNECTED_AUTHORITY_DISABLED');
    if(!isOperator())return blocked('RESOURCE_WRITE_ROLE_DENIED');
    const c=resourcesCol(),scope=currentScope(options),rid=str(resourceId);if(!c||!rid)return blocked('RESOURCE_DELETE_SCOPE_INVALID');
    const idem=str(options.idempotencyKey||('resource.delete:'+scope.projectId+':'+scope.periodId+':'+rid));
    let output=null,replay=false;
    await db().runTransaction(async tx=>{
      const ref=c.doc(rid),snap=await tx.get(ref);if(!snap.exists){output={id:rid,status:'deleted'};replay=true;return;}
      const prior=snap.data()||{};if(prior.lastIdempotencyKey===idem&&prior.status==='deleted'){output=Object.assign({id:rid},prior);replay=true;return;}
      if(str(prior.projectId)!==scope.projectId)throw new Error('RESOURCE_PROJECT_SCOPE_MISMATCH');
      output=Object.assign({},prior,{status:'deleted',version:Number(prior.version||0)+1,lastIdempotencyKey:idem,deletedAt:now(),deletedByUid:uid(),updatedAt:now(),updatedByUid:uid()});
      tx.set(ref,output,{merge:false});
    });
    await api.load(scope);
    return ack(output,{idempotencyKey:idem,idempotentReplay:replay});
  };
  api.storageStatus=function(){
    const configured=cfg.resourceStorageAuthorized===true&&cfg.resourceStorageRulesValidated===true;
    const available=!!(window.firebase&&firebase.storage);
    return {authorized:configured&&available,configured,available,reason:configured&&available?null:'RESOURCE_STORAGE_NOT_AUTHORIZED'};
  };
  api.uploadBinary=async function(file,options={}){
    const st=api.storageStatus();if(!st.authorized)return blocked('RESOURCE_STORAGE_NOT_AUTHORIZED',{storage:st});
    if(!isOperator())return blocked('RESOURCE_WRITE_ROLE_DENIED');
    if(!file)return blocked('RESOURCE_FILE_REQUIRED');
    const scope=currentScope(options);if(!scope.projectId)return blocked('RESOURCE_SCOPE_UNAVAILABLE');
    const rid=str(options.resourceId||('res-'+hash([scope.projectId,scope.periodId,file.name,file.size,file.lastModified])));
    const safeName=str(file.name||'archivo').replace(/[^a-zA-Z0-9._-]+/g,'_');
    const storagePath=['tenants',scope.tenantId,'projects',scope.projectId,'periods',scope.periodId||'_project','resources',rid,safeName].join('/');
    const ref=firebase.storage().ref(storagePath),snap=await ref.put(file,{contentType:file.type||'application/octet-stream',customMetadata:{tenantId:scope.tenantId,projectId:scope.projectId,periodId:scope.periodId||'_project',resourceId:rid}});
    const url=await snap.ref.getDownloadURL();
    return ack({resourceId:rid,storagePath,url,meta:file.name,mimeType:file.type||null,size:file.size||null},{storage:true,storageProviderAck:true});
  };
  async function fileSha256(file){
    if(!file||!window.crypto?.subtle)return null;
    const digest=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());
    return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  api.uploadVisitEvidence=async function(file,options={}){
    const st=api.storageStatus();if(!st.authorized)return blocked('EVIDENCE_STORAGE_NOT_AUTHORIZED',{storage:st});
    if(role()!=='shopper')return blocked('EVIDENCE_SHOPPER_ROLE_REQUIRED');
    if(!file||!/^image\//i.test(str(file.type)))return blocked('EVIDENCE_IMAGE_REQUIRED');
    if(Number(file.size||0)<=0||Number(file.size||0)>15*1024*1024)return blocked('EVIDENCE_IMAGE_SIZE_INVALID');
    const scope=currentScope(options),visitId=str(options.visitId);
    const shopperId=str(options.shopperId||CX.backendAuth?.context?.()?.shopperId||CX.session?.user?.shopperId);
    if(!scope.projectId||!scope.periodId||!visitId||!shopperId)return blocked('EVIDENCE_SCOPE_REQUIRED');
    const checksum=await fileSha256(file);if(!checksum)return blocked('EVIDENCE_CHECKSUM_UNAVAILABLE');
    const evidenceId='ev-'+hash([scope.tenantId,scope.projectId,scope.periodId,visitId,shopperId,checksum]);
    const ext=(str(file.name).match(/\.[a-z0-9]{1,8}$/i)||[])[0]||'.jpg';
    const safeName=evidenceId+ext.toLowerCase();
    const storagePath=['tenants',scope.tenantId,'projects',scope.projectId,'periods',scope.periodId,'visits',visitId,'evidence',evidenceId,safeName].join('/');
    const metadata={tenantId:scope.tenantId,projectId:scope.projectId,periodId:scope.periodId,visitId,evidenceId,shopperId,checksum,kind:'geo_checkin'};
    const snap=await firebase.storage().ref(storagePath).put(file,{contentType:file.type,customMetadata:metadata});
    return ack({evidenceId,storagePath,checksum,mimeType:file.type,size:Number(file.size),visitId,shopperId},{storage:true,storageProviderAck:true});
  };
  api.deleteVisitEvidence=async function(storagePath,options={}){
    const st=api.storageStatus();if(!st.authorized)return blocked('EVIDENCE_STORAGE_NOT_AUTHORIZED',{storage:st});
    const scope=currentScope(options),visitId=str(options.visitId),path=str(storagePath);
    const shopperId=str(options.shopperId||CX.backendAuth?.context?.()?.shopperId||CX.session?.user?.shopperId);
    if(role()!=='shopper'&&!isOperator())return blocked('EVIDENCE_DELETE_ROLE_DENIED');
    const prefix=['tenants',scope.tenantId,'projects',scope.projectId,'periods',scope.periodId,'visits',visitId,'evidence'].join('/')+'/';
    if(!path||!visitId||!shopperId||!path.startsWith(prefix))return blocked('EVIDENCE_STORAGE_SCOPE_MISMATCH');
    try{await firebase.storage().ref(path).delete();return ack({storagePath:path,status:'deleted'},{storage:true,storageProviderAck:true});}
    catch(error){if(String(error?.code||'').includes('object-not-found'))return ack({storagePath:path,status:'already_absent'},{storage:true,storageProviderAck:true,idempotentReplay:true});throw error;}
  };
  api.downloadUrl=async function(storagePath){
    const st=api.storageStatus();if(!st.authorized)return blocked('RESOURCE_STORAGE_NOT_AUTHORIZED',{storage:st});
    const path=str(storagePath);if(!path)return blocked('RESOURCE_STORAGE_PATH_REQUIRED');
    const url=await firebase.storage().ref(path).getDownloadURL();
    return ack({storagePath:path,url},{storage:true,storageProviderAck:true});
  };
  api.deleteBinary=async function(storagePath,options={}){
    const st=api.storageStatus();if(!st.authorized)return blocked('RESOURCE_STORAGE_NOT_AUTHORIZED',{storage:st});
    if(!isOperator())return blocked('RESOURCE_WRITE_ROLE_DENIED');
    const scope=currentScope(options),path=str(storagePath);if(!path)return ack({storagePath:null,status:'no_binary'},{storage:true,storageProviderAck:true,idempotentReplay:true});
    const prefix=['tenants',scope.tenantId,'projects',scope.projectId,'periods',scope.periodId||'_project','resources'].join('/')+'/';
    if(!path.startsWith(prefix))return blocked('RESOURCE_STORAGE_SCOPE_MISMATCH');
    try{await firebase.storage().ref(path).delete();return ack({storagePath:path,status:'deleted'},{storage:true,storageProviderAck:true});}
    catch(error){if(String(error?.code||'').includes('object-not-found'))return ack({storagePath:path,status:'already_absent'},{storage:true,storageProviderAck:true,idempotentReplay:true});throw error;}
  };
  api.deleteResource=async function(item={},options={}){
    const scope=currentScope({projectId:item.projectId||options.projectId,periodId:item.periodId||options.periodId});
    if(item.storagePath){const binary=await api.deleteBinary(item.storagePath,scope);if(binary?.providerAck!==true)return binary;}
    return api.deleteMetadata(item.id,Object.assign({},scope,{idempotencyKey:options.idempotencyKey||('resource.delete:'+item.id)}));
  };
  function start(){
    if(!connected())return;
    if(CX.bus?.on){
      CX.bus.on('backend-ready',()=>api.load().catch(e=>console.warn('[CX.backend-resources]',e)));
      CX.bus.on('backend-auth-ready',()=>setTimeout(()=>api.load().catch(()=>{}),400));
      CX.bus.on('cx:protected-auth-hr-authority-ready',()=>api.load().catch(()=>{}));
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();