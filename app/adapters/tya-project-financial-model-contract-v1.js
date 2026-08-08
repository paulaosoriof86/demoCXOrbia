/* CXOrbia — contrato canónico de modelo financiero por proyecto v1.
   Reusable multi-tenant; ningún cliente/proyecto se clasifica por nombre.

   Contrato:
   - cada proyecto selecciona su modelo al crearse: facturación local, delegado o regional;
   - las regalías solo pueden aplicar a proyectos con facturación local;
   - un proyecto delegado o regional nunca descuenta regalías locales;
   - delegado/regional registra la comisión de coordinación y su reparto
     como configuración propia, sin inventar montos, porcentajes ni participantes;
   - un proyecto sin modelo explícito queda fail-closed y requiere configuración;
   - Cinépolis se mantiene delegado por su projectConfig vigente, no por hardcode global;
   - no modifica módulos UI, proveedores, HR, pagos ni producción.
*/
(function(){
  'use strict';
  window.CX=window.CX||{};

  const str=v=>String(v==null?'':v).trim();
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const arr=v=>Array.isArray(v)?v:[];
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const registry=new Map();
  const MATERIALIZER_VERSION='cxorbia.project-financial-configuration-materializer.v1';

  function technicalKey(tenantId,projectId){
    const tenant=str(tenantId).toLowerCase();
    const project=str(projectId).toLowerCase();
    return tenant&&project?`${tenant}::${project}`:'';
  }
  function projectTechnicalId(project){
    return str(project&&(project.parentProjectId||project.program||project.baseProjectId||project.clientProjectId||project.canonicalProjectId));
  }
  function tenantTechnicalId(project){
    return str(project&&project.tenantId||CX.BACKEND&&CX.BACKEND.tenantId||CX.data&&CX.data.previewMeta&&CX.data.previewMeta.tenantId);
  }
  function registerProjectConfig(config){
    const source=clone(config||{});
    const key=technicalKey(source.tenantId,source.projectId);
    if(!key)throw new Error('PROJECT_FINANCIAL_CONFIG_TECHNICAL_KEY_REQUIRED');
    source.tenantId=str(source.tenantId).toLowerCase();
    source.projectId=str(source.projectId).toLowerCase();
    source.configurationKey=key;
    source.configurationVersion=MATERIALIZER_VERSION;
    registry.set(key,source);
    return clone(source);
  }
  function resolveProjectConfig(project){
    const key=technicalKey(tenantTechnicalId(project),projectTechnicalId(project));
    return key&&registry.has(key)?clone(registry.get(key)):null;
  }
  function materializeProjectConfig(project,config,reason){
    if(!project||typeof project!=='object'||!config)return {matched:false,reason:'exact_project_config_not_found'};
    const configKey=technicalKey(config.tenantId,config.projectId);
    const projectKey=technicalKey(tenantTechnicalId(project),projectTechnicalId(project));
    if(!configKey||projectKey!==configKey)return {matched:false,reason:'technical_key_mismatch',projectKey,configKey};
    project.tenantId=config.tenantId;
    project.parentProjectId=project.parentProjectId||config.projectId;
    project.program=project.program||config.projectId;
    project.modelo=config.model;
    project.billingModel=config.billingModel;
    project.projectModel=config.projectModel;
    project.localBilling=config.localBilling;
    project.royaltyApplicable=config.royaltyApplicable;
    project.regalias=Number(config.royalty||0);
    project.compensationModel=config.compensationModel;
    project.honorario=Object.assign({},project.honorario||{},clone(config.honorarium||{}));
    project.coordinationCommission=Object.assign({},clone(config.coordinationCommission||{}),project.coordinationCommission||{});
    project.coordinationCommission.enabled=config.coordinationCommission&&config.coordinationCommission.enabled===true;
    project.coordinationCommission.shared=config.coordinationCommission&&config.coordinationCommission.shared===true;
    project.coordinationCommission.model=config.model;
    project.coordinationCommission.splitRule=config.coordinationCommission&&config.coordinationCommission.splitRule||'project_configuration';
    project.coordinationCommission.sourceStatus=config.coordinationCommission&&config.coordinationCommission.sourceStatus||'project_configuration_required';
    project.taxTreatment=config.taxTreatment||'project_specific_not_inferred';
    project.financialModelReviewRequired=false;
    project.financialConfigurationKey=configKey;
    project.financialConfigurationSource='exact_tenant_project_registry';
    project.financialConfigurationMaterialized=true;
    project.financialConfigurationVersion=MATERIALIZER_VERSION;
    project.financialConfigurationReason=reason||'runtime';
    return {matched:true,projectKey,configKey};
  }
  function materializeAll(reason){
    if(!CX.data)return {ready:false,reason:'data_not_ready',matched:0,unresolved:0};
    let matched=0,unresolved=0;
    const unresolvedKeys=[];
    for(const project of arr(CX.data.projects)){
      const result=materializeProjectConfig(project,resolveProjectConfig(project),reason);
      if(result.matched)matched++;
      else{unresolved++;unresolvedKeys.push(technicalKey(tenantTechnicalId(project),projectTechnicalId(project))||'missing_technical_key');}
    }
    const status={ready:true,version:MATERIALIZER_VERSION,reason:reason||'runtime',projects:arr(CX.data.projects).length,matched,unresolved,unresolvedKeys:[...new Set(unresolvedKeys)],exactTechnicalKeysOnly:true,displayNameMatching:false,valuesInvented:false,providerWrites:0,production:false,at:new Date().toISOString()};
    window.CX_PROJECT_FINANCIAL_CONFIGURATION_MATERIALIZATION=status;
    return status;
  }
  const delegatedValues=new Set([
    'delegado','delegated','delegated_coordination','franquicia_delegada',
    'franchise_delegated','coordination_commission','coordination_commission_shared'
  ]);
  const regionalValues=new Set([
    'regional','regional_coordination','regional_distribution','regional_commission_shared'
  ]);
  const directValues=new Set([
    'directo','direct','local','local_invoicing','facturado_directamente','local_billing'
  ]);

  function resolveModel(project){
    const candidates=[
      project&&project.modelo,
      project&&project.billingModel,
      project&&project.projectModel,
      project&&project.compensationModel
    ].map(v=>str(v).toLowerCase()).filter(Boolean);
    if(candidates.some(v=>regionalValues.has(v)))return 'regional';
    if(candidates.some(v=>delegatedValues.has(v)))return 'delegado';
    if(candidates.some(v=>directValues.has(v)))return 'directo';
    return 'unconfigured';
  }

  function sharedCommissionDefaults(model){
    return {
      enabled:true,
      shared:true,
      amount:null,
      amountByCountry:{},
      amountByPeriodCountry:{},
      calculationMode:null,
      currencyByCountry:{},
      splitRule:'project_configuration',
      participants:[],
      percentages:null,
      distributedAmount:null,
      distributedAmountByCountry:{},
      distributedAmountByPeriodCountry:{},
      sourceStatus:'project_configuration_required',
      model
    };
  }

  function normalize(project,options={}){
    if(!project||typeof project!=='object')return project;
    const model=resolveModel(project);
    if(model==='delegado'||model==='regional'){
      project.modelo=model;
      project.billingModel=model==='regional'?'regional_coordination':'delegated_coordination';
      project.projectModel=model;
      project.localBilling=false;
      project.royaltyApplicable=false;
      project.regalias=0;
      project.compensationModel=model==='regional'
        ?'regional_coordination_distribution'
        :'coordination_commission_shared';
      project.coordinationCommission=Object.assign(
        sharedCommissionDefaults(model),
        project.coordinationCommission||{}
      );
      project.coordinationCommission.enabled=true;
      project.coordinationCommission.shared=true;
      project.coordinationCommission.model=model;
      if(project.coordinationCommission.splitRule==null)project.coordinationCommission.splitRule='project_configuration';
      if(project.coordinationCommission.sourceStatus==null)project.coordinationCommission.sourceStatus='project_configuration_required';
      project.financialModelReviewRequired=false;
      project.financialModelNote=model==='regional'
        ?'Proyecto regional: distribución de comisión configurable; no aplica regalía local.'
        :'Proyecto delegado: comisión de coordinación compartida; no aplica regalía local.';
    }else if(model==='directo'){
      const royalty=num(project.regalias);
      project.modelo='directo';
      project.billingModel='local_invoicing';
      project.projectModel='local_billing';
      project.localBilling=true;
      project.royaltyApplicable=royalty>0;
      project.regalias=royalty;
      project.compensationModel='local_project_margin';
      project.financialModelReviewRequired=false;
      project.financialModelNote='Proyecto facturado localmente: impuestos y regalías se aplican solo según su configuración.';
    }else{
      project.modelo='unconfigured';
      project.billingModel='project_configuration_required';
      project.projectModel='unconfigured';
      project.localBilling=null;
      project.royaltyApplicable=false;
      project.regalias=0;
      project.compensationModel='project_configuration_required';
      project.financialModelReviewRequired=true;
      project.financialModelNote='Modelo financiero pendiente de configuración; no se calculan ingresos, regalías ni margen.';
    }
    project.financialModelContractVersion='cxorbia.project-financial-model.v1';
    project.financialModelNormalizedAt=options.timestamp||new Date().toISOString();
    return project;
  }

  function normalizeAll(reason){
    if(!CX.data)return {ready:false,reason:'data_not_ready'};
    let delegated=0,regional=0,direct=0,unconfigured=0,royaltyViolations=0;
    for(const project of arr(CX.data.projects)){
      normalize(project);
      if(project.modelo==='delegado')delegated++;
      else if(project.modelo==='regional')regional++;
      else if(project.modelo==='directo')direct++;
      else unconfigured++;
      if(project.modelo!=='directo'&&(num(project.regalias)!==0||project.royaltyApplicable!==false))royaltyViolations++;
    }
    const status={
      ready:true,
      version:'cxorbia.project-financial-model.v1',
      reason:reason||'runtime',
      projects:arr(CX.data.projects).length,
      delegated,
      regional,
      direct,
      unconfigured,
      royaltyViolations,
      nonLocalRoyaltyPct:0,
      delegatedCompensation:'coordination_commission_shared',
      regionalCompensation:'regional_coordination_distribution',
      projectClassificationSource:'project_configuration_not_name',
      defaultModelAssumed:false,
      splitValuesInvented:false,
      providerWrites:0,
      production:false,
      at:new Date().toISOString()
    };
    window.CX_PROJECT_FINANCIAL_MODEL_CONTRACT=status;
    return status;
  }

  registerProjectConfig({
    tenantId:'tya',projectId:'cinepolis',model:'delegado',billingModel:'delegated_coordination',projectModel:'delegated',
    localBilling:false,royaltyApplicable:false,royalty:0,compensationModel:'coordination_commission_shared',honorarium:{GT:60,HN:200},
    coordinationCommission:{enabled:true,shared:true,amount:null,amountByCountry:{},amountByPeriodCountry:{},calculationMode:null,currencyByCountry:{},splitRule:'project_configuration',participants:[],percentages:null,distributedAmount:null,distributedAmountByCountry:{},distributedAmountByPeriodCountry:{},sourceStatus:'project_configuration_required',valuesInvented:false},
    taxTreatment:'project_specific_not_inferred'
  });

  function wrapAddProject(){
    if(!CX.data||typeof CX.data.addProject!=='function'||CX.data.addProject.__financialModelContractV1)return false;
    const original=CX.data.addProject.bind(CX.data);
    const wrapped=function(config){
      const incoming=Object.assign({},config||{});
      materializeProjectConfig(incoming,resolveProjectConfig(incoming),'add_project_before_normalization');
      const normalized=normalize(incoming);
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
    const why=reason||'activate';
    materializeAll(`${why}_before_normalization`);
    return normalizeAll(why);
  }

  CX.projectFinancialModel=Object.assign(CX.projectFinancialModel||{}, {
    normalize,
    normalizeAll,
    resolveModel,
    materializeAll,
    materializeProjectConfig,
    resolveProjectConfig,
    registerProjectConfig,
    technicalKeyFor:project=>technicalKey(tenantTechnicalId(project),projectTechnicalId(project)),
    registrySnapshot:()=>[...registry.values()].map(clone),
    materializerVersion:MATERIALIZER_VERSION,
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
