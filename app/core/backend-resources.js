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
  // The active tenant/project/period/role owns the resource cache; stale async reads must never replace it.
  let latestLoadId=0,lastLoadedKey='',pendingKey='';
  const cacheKey=scope=>JSON.stringify([scope.tenantId,scope.projectId,scope.periodId,role()]);
  api.load=async function(input={}){
    if(!connected())return [];
    const c=resourcesCol(),scope=currentScope(input),key=cacheKey(scope),readId=++latestLoadId;
    pendingKey=key;
    if(!c||!scope.projectId){
      if(readId===latestLoadId){
        api.items=[];lastLoadedKey='';
        window.CX_BACKEND_RESOURCES_STATUS={source:'firestore',status:'blocked',reason:'RESOURCE_SCOPE_UNAVAILABLE',count:0,at:now()};
        try{CX.bus?.emit?.('resources',window.CX_BACKEND_RESOURCES_STATUS);}catch(_){}
        pendingKey='';
      }
      return [];
    }
    try{
      let q=c.where('projectId','==',scope.projectId).where('status','==','active');
      if(!isOperator())q=q.where('visibleRoles','array-contains',role());
      const snap=await q.get();
      if(readId!==latestLoadId||cacheKey(currentScope())!==key)return [];
      const rows=snap.docs.map(d=>Object.assign({id:d.id},d.data()||{})).filter(x=>visible(x,scope));
      api.items=rows;lastLoadedKey=key;
      window.CX_BACKEND_RESOURCES_STATUS={source:'firestore',status:'ready',tenantId:scope.tenantId,projectId:scope.projectId,periodId:scope.periodId,count:rows.length,at:now()};
      try{CX.bus?.emit?.('resources',window.CX_BACKEND_RESOURCES_STATUS);}catch(_){}
      return rows;
    }catch(error){
      if(readId===latestLoadId&&cacheKey(currentScope())===key){
        api.items=[];lastLoadedKey='';
        window.CX_BACKEND_RESOURCES_STATUS={source:'firestore',status:'blocked',reason:'RESOURCE_PROVIDER_READ_FAILED',tenantId:scope.tenantId,projectId:scope.projectId,periodId:scope.periodId,count:0,at:now()};
        try{CX.bus?.emit?.('resources',window.CX_BACKEND_RESOURCES_STATUS);}catch(_){}
      }
      throw error;
    }finally{
      if(readId===latestLoadId)pendingKey='';
    }
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
      if(expected!==undefined&&expected!==null&&(!prior||String(prior.version||0)!==String(expected)))throw new Error('RESOURCE_EXPECTED_VERSION_CONFLICT');
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

  // I3/D07: binary reads are restricted to an active, visible Firestore resource.
  // Storage's public token URL is not an authenticated read. No download tokens or ID
  // tokens are persisted, embedded in markup, or used as query parameters here.
  api.readPublishedPdf=async function(item={},options={}){
    if(!connected())return blocked('RESOURCE_READ_CONNECTED_REQUIRED');
    const scope=currentScope(options),rid=str(item.id),path=str(item.storagePath);
    if(!scope.tenantId||!scope.projectId||!scope.periodId||!rid||!path)return blocked('RESOURCE_READ_SCOPE_REQUIRED');
    const prefix=['tenants',scope.tenantId,'projects',scope.projectId,'periods',scope.periodId,'resources'].join('/')+'/';
    const suffix=path.startsWith(prefix)?path.slice(prefix.length):'';
    if(!/^[-a-zA-Z0-9_]+\/[-a-zA-Z0-9_.]+\.pdf$/i.test(suffix)||suffix.includes('..'))
      return blocked('RESOURCE_READ_STORAGE_SCOPE_MISMATCH');
    const isCurrent=()=>arr(api.items).some(row=>str(row.id)===rid&&str(row.storagePath)===path&&
      str(row.tenantId)===scope.tenantId&&str(row.projectId)===scope.projectId&&
      str(row.periodId)===scope.periodId&&str(row.tipo).toLowerCase()==='pdf'&&visible(row,scope));
    if(!isCurrent()||str(item.tenantId)!==scope.tenantId||str(item.projectId)!==scope.projectId||
      str(item.periodId)!==scope.periodId||str(item.tipo).toLowerCase()!=='pdf')
      return blocked('RESOURCE_READ_NOT_PUBLISHED_FOR_ROLE');
    const fb=window.firebase,auth=fb?.auth?.(),user=auth?.currentUser;
    if(!user?.uid||!user.getIdToken)return blocked('RESOURCE_READ_AUTH_REQUIRED');
    const initialUid=str(user.uid),initialKey=cacheKey(scope);
    const bucket=str(fb?.app?.().options?.storageBucket||'');
    if(!/^[a-z0-9][a-z0-9.-]+$/i.test(bucket))return blocked('RESOURCE_READ_BUCKET_UNAVAILABLE');
    // D07 diagnostic-only: no token/path/UID/provider response body is retained
    // in the diagnostic. Storage Auth, roles, claims and fail-closed gates are unchanged.
    let stage='TOKEN',tokenObtained=false,httpStatus=null,bytesRead=false,bytesLength=0;
    // D07 P0: an unresolved token/GET/body promise must never leave the protected
    // viewer spinning indefinitely. Bound the complete read, not only fetch().
    const requestedTimeout=Number(options.timeoutMs);
    const timeoutMs=Number.isFinite(requestedTimeout)&&requestedTimeout>0
      ?Math.min(15000,Math.max(25,requestedTimeout)):15000;
    const controller=typeof AbortController==='function'?new AbortController():null;
    const upstreamSignal=options.signal;
    const onUpstreamAbort=()=>controller?.abort();
    if(upstreamSignal?.aborted)onUpstreamAbort();
    else upstreamSignal?.addEventListener?.('abort',onUpstreamAbort,{once:true});
    let timedOut=false;
    let timer=null;
    const deadline=new Promise((_,reject)=>{
      timer=setTimeout(()=>{
        timedOut=true;
        controller?.abort();
        reject(Object.assign(new Error('RESOURCE_READ_TIMEOUT'),{name:'TimeoutError'}));
      },timeoutMs);
    });
    const bounded=promise=>Promise.race([promise,deadline]);
    const diagnostic=(stageOverride,errorType)=>({
      stage:stageOverride||stage,tokenObtained,httpStatus,bytesRead,bytesLength,
      errorType:errorType||null
    });
    try{
      const jwt=await bounded(user.getIdToken());
      if(!jwt||str(auth.currentUser?.uid)!==initialUid||cacheKey(currentScope())!==initialKey||!isCurrent())
        return blocked('RESOURCE_READ_AUTH_SCOPE_CHANGED',{diagnostic:diagnostic('TOKEN')});
      tokenObtained=true;
      const endpoint='https://firebasestorage.googleapis.com/v0/b/'+encodeURIComponent(bucket)+
        '/o/'+encodeURIComponent(path)+'?alt=media';
      stage='GET';
      const response=await bounded(fetch(endpoint,{method:'GET',cache:'no-store',credentials:'omit',
        headers:{Authorization:'Firebase '+jwt},signal:controller?.signal||upstreamSignal}));
      httpStatus=Number(response.status)||0;
      if(!response.ok)return blocked('RESOURCE_READ_PROVIDER_DENIED',{
        httpStatus,diagnostic:diagnostic('GET_HTTP')
      });
      stage='BYTES';
      const maximum=25*1024*1024;
      const declared=Number(response.headers?.get?.('content-length')||0);
      if(declared>maximum)return blocked('RESOURCE_READ_SIZE_EXCEEDED',{diagnostic:diagnostic()});
      const bytes=new Uint8Array(await bounded(response.arrayBuffer()));
      bytesRead=true;bytesLength=bytes.byteLength;
      if(bytes.byteLength<5||bytes.byteLength>maximum||bytes[0]!==37||bytes[1]!==80||
        bytes[2]!==68||bytes[3]!==70||bytes[4]!==45)
        return blocked('RESOURCE_READ_INVALID_PDF',{diagnostic:diagnostic()});
      if(str(auth.currentUser?.uid)!==initialUid||cacheKey(currentScope())!==initialKey||!isCurrent())
        return blocked('RESOURCE_READ_AUTH_SCOPE_CHANGED',{diagnostic:diagnostic()});
      return {ok:true,status:'read',source:'firebase-storage-authenticated',bytes,
        resourceId:rid,storagePath:path,mimeType:'application/pdf',size:bytes.byteLength,
        diagnostic:diagnostic('COMPLETE')};
    }catch(error){
      const errorName=String(error?.name||'');
      const safeName=timedOut?'TimeoutError':
        ['TypeError','AbortError','NetworkError','TimeoutError',
        'FirebaseError','InvalidStateError'].includes(errorName)?errorName:'OtherError';
      const code=stage==='TOKEN'?'RESOURCE_READ_TOKEN_FAILED':
        stage==='GET'?'RESOURCE_READ_GET_FAILED':'RESOURCE_READ_BYTES_FAILED';
      return blocked(code,{diagnostic:diagnostic(stage,safeName)});
    }finally{
      clearTimeout(timer);
      upstreamSignal?.removeEventListener?.('abort',onUpstreamAbort);
    }
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
  function refreshActiveScope(){
    const scope=currentScope(),key=cacheKey(scope);
    if(!scope.projectId||key===lastLoadedKey||key===pendingKey)return;
    api.load().catch(e=>console.warn('[CX.backend-resources]',e));
  }
  function start(){
    if(!connected())return;
    if(CX.bus?.on){
      CX.bus.on('backend-ready',()=>api.load().catch(e=>console.warn('[CX.backend-resources]',e)));
      CX.bus.on('backend-auth-ready',()=>setTimeout(()=>api.load().catch(e=>console.warn('[CX.backend-resources]',e)),400));
      CX.bus.on('project',refreshActiveScope);
    }
    // The HR authority publishes DOM CustomEvents, not bus events.
    window.addEventListener('cx:protected-auth-hr-authority-ready',refreshActiveScope);
    window.addEventListener('cx:live-source-updated',refreshActiveScope);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
