/* CXOrbia I3 — aviso no bloqueante de expedientes shopper por adjudicar.
   La cola protegida existente gobierna la presencia; nunca se fusiona aquí. */
(function(){
  'use strict';
  const CX=window.CX;
  if(!CX?.app||window.CX_ADMIN_IDENTITY_REVIEW_NOTICE_V1)return;
  const NOTICE_ID='cxAdminIdentityReviewNotice';
  const arr=value=>Array.isArray(value)?value:[];
  const str=value=>String(value==null?'':value).trim();
  const role=()=>str(CX.session?.effectiveRole?.()||CX.session?.testRole||CX.session?.user?.role||CX.session?.role).toLowerCase();
  let dismissed=false;

  function authorized(){
    return CX.session?.role==='admin'&&['super','admin','ops'].includes(role());
  }
  function protectedSourceReady(){
    const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{};
    const uid=str(window.firebase?.auth?.()?.currentUser?.uid);
    return authority.applied===true&&!!uid&&str(authority.actorUid)===uid&&
      CX.dataSource?.mode==='connected'&&CX.dataSource?.status==='ready';
  }
  const reviewIds=item=>[
    item?.shopperId,item?.sourceShopperId,item?.canonicalShopperId,item?.liveShopperId,item?.id,
    ...arr(item?.shopperIds),...arr(item?.candidateShopperIds),...arr(item?.candidates),...arr(item?.exactAliases)
  ].map(str).filter(Boolean);
  const pairKey=item=>[...new Set(reviewIds(item))].sort().join('|');

  function hasPendingIdentityCases(){
    const data=CX.data;if(!data)return false;
    // Igual que Shoppers: una decisión durable de mantener separados excluye
    // ese par; una coincidencia de nombre no es autorización para fusionarlo.
    const resolved=new Set(arr(data.__identityReviewResolutions)
      .filter(x=>str(x?.status).toLowerCase()==='resolved_distinct'&&x?.identityRemap!==true)
      .map(pairKey).filter(Boolean));
    if(arr(data.__identityReviewQueue).some(item=>{
      if(str(item?.status||'active').toLowerCase()!=='active')return false;
      const ids=[...new Set(reviewIds(item))];
      return ids.length<2||!resolved.has(ids.sort().join('|'));
    }))return true;
    // El módulo Shoppers también genera revisión desde aliases técnicos que
    // existen en dos expedientes visibles, sin deducir identidad por nombre.
    let rows=[];
    try{rows=arr(data.shoppersFor?.());}catch(_){return false;}
    for(const row of rows){
      const id=str(row?.id||row?.shopperId);if(!id)continue;
      const aliases=[...arr(row?.exactAliases),...arr(row?.sourceShopperIds),...arr(row?.legacyLiveShopperIds)];
      for(const value of aliases){
        const alias=str(value);if(!alias||alias===id||!data.getShopper?.(alias))continue;
        const key=[id,alias].sort().join('|');
        if(!resolved.has(key))return true;
      }
    }
    return false;
  }
  function mayOpenShoppers(){
    return CX.MODULES?.shoppers?.roles?.includes(CX.session?.role)===true&&
      CX.moduleEnabled?.('shoppers')===true&&CX.roleCanAccess?.(role(),'shoppers')===true&&
      CX.moduleVisibleForProfile?.('shoppers',CX.session.role)!==false;
  }
  function remove(){document.getElementById(NOTICE_ID)?.remove();}
  function refresh(){
    if(dismissed||!authorized()||!protectedSourceReady()||!hasPendingIdentityCases()){
      remove();return;
    }
    const host=document.querySelector('#app .content'),view=document.getElementById('view');
    if(!host||!view||document.getElementById(NOTICE_ID))return;
    const box=document.createElement('section');box.id=NOTICE_ID;
    box.setAttribute('role','status');box.setAttribute('aria-live','polite');
    box.style.cssText='background:var(--panel,#fff);border:1px solid var(--border);border-left:4px solid var(--amber);border-radius:10px;padding:12px 14px;margin-bottom:14px;color:var(--t1)';
    const title=document.createElement('div');title.style.cssText='font-weight:800;font-size:13px;margin-bottom:4px';
    title.textContent='Identidades de shoppers pendientes de confirmación';
    const explanation=document.createElement('div');explanation.style.cssText='font-size:12px;color:var(--t2);line-height:1.5';
    explanation.textContent='Existen expedientes para revisión. Confirma si corresponden a una misma persona o deben permanecer separados. Ninguna fusión se realiza automáticamente.';
    const actions=document.createElement('div');actions.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-top:10px';
    if(mayOpenShoppers()){
      const go=document.createElement('button');go.type='button';go.className='btn btn-pr btn-sm';
      go.textContent='Revisar en Shoppers';go.addEventListener('click',()=>{
        dismissed=true;remove();CX.router?.nav?.('shoppers');
      });actions.appendChild(go);
    }else{
      const info=document.createElement('span');info.style.cssText='font-size:11px;color:var(--t3)';
      info.textContent='Solicita la revisión a Administración.';actions.appendChild(info);
    }
    const later=document.createElement('button');later.type='button';later.className='btn btn-soft btn-sm';
    later.textContent='Ahora no';later.addEventListener('click',()=>{dismissed=true;remove();});
    actions.appendChild(later);box.append(title,explanation,actions);host.insertBefore(box,view);
  }
  const originalEnter=CX.app.enter;
  CX.app.enter=function(...args){
    dismissed=false;
    const result=originalEnter.apply(this,args);
    setTimeout(refresh,0);return result;
  };
  for(const event of ['cx:protected-auth-hr-authority-ready','cx:live-source-updated','cx:protected-auth-hr-authority-blocked']){
    window.addEventListener(event,()=>setTimeout(refresh,0));
  }
  CX.bus?.on?.('project',()=>setTimeout(refresh,0));
  window.CX_ADMIN_IDENTITY_REVIEW_NOTICE_V1=Object.freeze({version:'i3.v1',refresh});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,0),{once:true});
  else setTimeout(refresh,0);
})();
