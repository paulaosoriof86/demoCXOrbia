/* CXOrbia — contrato canónico de modelo financiero por proyecto v1.
   Reusable multi-tenant, con regla TyA/Cinépolis explícita.

   Contrato:
   - cada proyecto selecciona su modelo al crearse: facturación local o delegado;
   - las regalías solo pueden aplicar a proyectos con facturación local;
   - un proyecto delegado nunca descuenta regalías;
   - el proyecto delegado registra la comisión de coordinación y su reparto
     como configuración propia, sin inventar montos, porcentajes ni participantes;
   - Cinépolis/TyA es delegado;
   - no modifica módulos UI, proveedores, HR, pagos ni producción.
*/
(function(){
  'use strict';
  window.CX=window.CX||{};

  const str=v=>String(v==null?'':v).trim();
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const arr=v=>Array.isArray(v)?v:[];
  const delegatedValues=new Set([
    'delegado','delegated','delegated_coordination','franquicia_delegada',
    'franchise_delegated','coordination_commission','coordination_commission_shared'
  ]);
  const directValues=new Set([
    'directo','direct','local','local_invoicing','facturado_directamente','local_billing'
  ]);

  function projectIdentity(project){
    return [
      project&&project.parentProjectId,
      project&&project.program,
      project&&project.projectId,
      project&&project.id,
      project&&project.name,
      project&&project.programLabel
    ].map(str).join('|').toLowerCase();
  }

  function isCinepolis(project){
    const identity=projectIdentity(project);
    return identity.split('|').some(value=>value==='cinepolis'||value.startsWith('cinepolis::'))
      || identity.includes('|cinépolis|')
      || identity.startsWith('cinépolis|')
      || identity.endsWith('|cinépolis');
  }

  function resolveModel(project){
    if(isCinepolis(project))return 'delegado';
    const candidates=[project&&project.modelo,project&&project.billingModel,project&&project.projectModel,project&&project.compensationModel]
      .map(v=>str(v).toLowerCase())
      .filter(Boolean);
    if(candidates.some(v=>delegatedValues.has(v)))return 'delegado';
    if(candidates.some(v=>directValues.has(v)))return 'directo';
    return 'directo';
  }

  function normalize(project,options={}){
    if(!project||typeof project!=='object')return project;
    const model=resolveModel(project);
    if(model==='delegado'){
      project.modelo='delegado';
      project.billingModel='delegated_coordination';
      project.projectModel='delegated';
      project.localBilling=false;
      project.royaltyApplicable=false;
      project.regalias=0;
      project.compensationModel='coordination_commission_shared';
      project.coordinationCommission=Object.assign({
        enabled:true,
        shared:true,
        amount:null,
        currencyByCountry:{},
        splitRule:'project_configuration',
        participants:[],
        percentages:null,
        sourceStatus:'project_configuration_required'
      },project.coordinationCommission||{});
      project.coordinationCommission.enabled=true;
      project.coordinationCommission.shared=true;
      if(project.coordinationCommission.splitRule==null)project.coordinationCommission.splitRule='project_configuration';
      if(project.coordinationCommission.sourceStatus==null)project.coordinationCommission.sourceStatus='project_configuration_required';
      project.financialModelNote='Proyecto delegado: comisión de coordinación compartida; no aplica regalía sobre facturación local.';
    }else{
      const royalty=num(project.regalias);
      project.modelo='directo';
      project.billingModel='local_invoicing';
      project.projectModel='local_billing';
      project.localBilling=true;
      project.royaltyApplicable=royalty>0;
      project.regalias=royalty;
      project.compensationModel='local_project_margin';
      project.financialModelNote='Proyecto facturado localmente: impuestos y regalías se aplican solo según su configuración.';
    }
    project.financialModelContractVersion='cxorbia.project-financial-model.v1';
    project.financialModelNormalizedAt=options.timestamp||new Date().toISOString();
    return project;
  }

  function normalizeAll(reason){
    if(!CX.data)return {ready:false,reason:'data_not_ready'};
    let delegated=0,direct=0,cinepolis=0,royaltyViolations=0;
    for(const project of arr(CX.data.projects)){
      normalize(project);
      if(project.modelo==='delegado')delegated++;else direct++;
      if(isCinepolis(project))cinepolis++;
      if(project.modelo==='delegado'&&(num(project.regalias)!==0||project.royaltyApplicable!==false))royaltyViolations++;
    }
    const status={
      ready:true,
      version:'cxorbia.project-financial-model.v1',
      reason:reason||'runtime',
      projects:arr(CX.data.projects).length,
      delegated,
      direct,
      cinepolis,
      royaltyViolations,
      cinepolisModel:'delegado',
      delegatedRoyaltyPct:0,
      delegatedCompensation:'coordination_commission_shared',
      splitValuesInvented:false,
      providerWrites:0,
      production:false,
      at:new Date().toISOString()
    };
    window.CX_PROJECT_FINANCIAL_MODEL_CONTRACT=status;
    return status;
  }

  function wrapAddProject(){
    if(!CX.data||typeof CX.data.addProject!=='function'||CX.data.addProject.__financialModelContractV1)return false;
    const original=CX.data.addProject.bind(CX.data);
    const wrapped=function(config){
      const normalized=normalize(Object.assign({},config||{}));
      const created=original(normalized);
      normalize(created);
      return created;
    };
    wrapped.__financialModelContractV1=true;
    CX.data.addProject=wrapped;
    return true;
  }

  function activate(reason){
    wrapAddProject();
    return normalizeAll(reason||'activate');
  }

  CX.projectFinancialModel=Object.assign(CX.projectFinancialModel||{}, {
    normalize,
    normalizeAll,
    resolveModel,
    isCinepolis,
    contractVersion:'cxorbia.project-financial-model.v1'
  });

  activate('script_load');
  window.addEventListener('cx:live-source-updated',()=>activate('live_source_updated'));
  window.addEventListener('cx:protected-auth-hr-authority-ready',()=>activate('protected_auth_hr_authority_ready'));
  if(CX.bus&&typeof CX.bus.on==='function'){
    CX.bus.on('backend-ready',()=>activate('backend_ready'));
    CX.bus.on('project',()=>activate('project_changed'));
  }
})();