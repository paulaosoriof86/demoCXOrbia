/* CXOrbia — guard financiero para proyectos delegados/regionales v1.
   Reusable y read-only.

   Evita la regresión donde Finanzas usaba el honorario del shopper como
   fallback de ingreso recibido. Para proyectos sin facturación local o
   todavía sin modelo explícito:
   - ingreso = comisión de coordinación/distribución configurada;
   - regalías locales = 0;
   - no se inventan comisión, reparto, participantes ni porcentajes;
   - honorarios/reembolsos del shopper permanecen como obligaciones separadas;
   - el margen solo se calcula cuando comisión y reparto tienen fuente exacta.
*/
(function(){
  'use strict';
  window.CX=window.CX||{};
  if(!CX.fin||!CX.data)return;

  const str=v=>String(v==null?'':v).trim();
  const numOrNull=v=>v!==''&&v!=null&&Number.isFinite(Number(v))?Number(v):null;
  const modelOf=p=>CX.projectFinancialModel?.resolveModel?.(p)||str(p&&p.modelo).toLowerCase()||'unconfigured';
  const isFailClosedModel=p=>['delegado','regional','unconfigured'].includes(modelOf(p));
  const own=(obj,key)=>obj&&Object.prototype.hasOwnProperty.call(obj,key);

  function context(data,project){
    const period=typeof data?.period==='function'?data.period():null;
    return {
      periodId:str((typeof data?.periodId==='function'&&data.periodId())||period?.id||project?.activePeriodId),
      periodKey:str(period?.periodKey||period?.key),
      countries:Array.isArray(project?.countries)?project.countries:[]
    };
  }

  function nestedValue(container,contextValue,country){
    if(!container||typeof container!=='object')return null;
    const scoped=container[contextValue];
    if(scoped&&typeof scoped==='object'&&own(scoped,country))return numOrNull(scoped[country]);
    return null;
  }

  function countryValue(container,country){
    if(container&&typeof container==='object'&&own(container,country))return numOrNull(container[country]);
    return null;
  }

  function resolveCommission(project,data,country,visitCount){
    if(modelOf(project)==='unconfigured')return {exact:false,amount:0,source:'project_model_configuration_required'};
    const cfg=project?.coordinationCommission||{};
    const ctx=context(data,project);
    let value=nestedValue(cfg.amountByPeriodCountry,ctx.periodId,country);
    if(value==null)value=nestedValue(cfg.amountByPeriodCountry,ctx.periodKey,country);
    if(value!=null)return {exact:true,amount:value,source:'coordinationCommission.amountByPeriodCountry'};

    value=countryValue(cfg.amountByCountry,country);
    if(value!=null)return {exact:true,amount:value,source:'coordinationCommission.amountByCountry'};

    if(ctx.countries.length===1){
      value=numOrNull(cfg.amount);
      if(value!=null)return {exact:true,amount:value,source:'coordinationCommission.amount'};
    }

    const perVisit=countryValue(cfg.perVisitAmountByCountry,country);
    if(perVisit!=null&&str(cfg.calculationMode).toLowerCase()==='per_visit'){
      return {exact:true,amount:perVisit*Number(visitCount||0),source:'coordinationCommission.perVisitAmountByCountry'};
    }

    const configuredPerVisit=project?.honRecibe&&own(project.honRecibe,country)
      ?numOrNull(project.honRecibe[country]):null;
    if(configuredPerVisit!=null){
      return {exact:true,amount:configuredPerVisit*Number(visitCount||0),source:'project.honRecibe.explicit_per_visit'};
    }

    return {exact:false,amount:0,source:'project_configuration_required'};
  }

  function resolveDistributedAmount(project,data,country){
    if(modelOf(project)==='unconfigured')return {exact:false,amount:0,source:'project_model_configuration_required'};
    const cfg=project?.coordinationCommission||{};
    const ctx=context(data,project);
    let value=nestedValue(cfg.distributedAmountByPeriodCountry,ctx.periodId,country);
    if(value==null)value=nestedValue(cfg.distributedAmountByPeriodCountry,ctx.periodKey,country);
    if(value!=null)return {exact:true,amount:value,source:'coordinationCommission.distributedAmountByPeriodCountry'};

    value=countryValue(cfg.distributedAmountByCountry,country);
    if(value!=null)return {exact:true,amount:value,source:'coordinationCommission.distributedAmountByCountry'};

    if(ctx.countries.length===1){
      value=numOrNull(cfg.distributedAmount);
      if(value!=null)return {exact:true,amount:value,source:'coordinationCommission.distributedAmount'};
    }

    return {exact:false,amount:0,source:'project_configuration_required'};
  }

  function resolveOtherCosts(project,data,country){
    const cfg=project?.coordinationCommission||{};
    const ctx=context(data,project);
    let value=nestedValue(cfg.otherCostsByPeriodCountry,ctx.periodId,country);
    if(value==null)value=nestedValue(cfg.otherCostsByPeriodCountry,ctx.periodKey,country);
    if(value==null)value=countryValue(cfg.otherCostsByCountry,country);
    return value==null?0:value;
  }

  const previousHonRecibe=typeof CX.fin.honRecibe==='function'?CX.fin.honRecibe.bind(CX.fin):()=>0;
  CX.fin.honRecibe=function(project,country){
    if(!isFailClosedModel(project))return previousHonRecibe(project,country);
    if(modelOf(project)==='unconfigured')return 0;
    const explicit=project?.honRecibe&&own(project.honRecibe,country)
      ?numOrNull(project.honRecibe[country]):null;
    return explicit==null?0:explicit;
  };

  const previousPorPais=typeof CX.fin.porPais==='function'?CX.fin.porPais.bind(CX.fin):null;
  if(!previousPorPais)return;

  CX.fin.porPais=function(data){
    const project=typeof data?.project==='function'?data.project():data?.period?.();
    const output=previousPorPais(data);
    if(!project||!isFailClosedModel(project))return output;

    let pendingCountries=0,readyCountries=0;
    for(const country of project.countries||[]){
      const row=output[country];
      if(!row)continue;
      const commission=resolveCommission(project,data,country,row.visRe);
      const distribution=resolveDistributedAmount(project,data,country);
      const otherCosts=resolveOtherCosts(project,data,country);
      const includeShopperCosts=project.coordinationCommission?.includeShopperCosts===true;
      const shopperCosts=includeShopperCosts?Number(row.honorarioDevengado||0):0;
      const ready=modelOf(project)!=='unconfigured'&&commission.exact&&distribution.exact;
      const margin=ready?commission.amount-distribution.amount-otherCosts-shopperCosts:0;

      row.ingreso=commission.amount;
      row.isr=0;
      row.regal=0;
      row.fijos=otherCosts;
      row.margen=margin;
      row.margenPct=ready&&commission.amount?Math.round(margin/commission.amount*100):0;
      row.cxc=ready&&project.coordinationCommission?.receivableConfirmed===true?commission.amount:0;
      row.financialModel=modelOf(project);
      row.localBilling=modelOf(project)==='unconfigured'?null:false;
      row.royaltyApplicable=false;
      row.commissionAmount=commission.amount;
      row.commissionSource=commission.source;
      row.commissionSourceStatus=commission.exact?'confirmed_project_configuration':commission.source;
      row.distributedAmount=distribution.amount;
      row.distributionSource=distribution.source;
      row.distributionSourceStatus=distribution.exact?'confirmed_project_configuration':distribution.source;
      row.marginSourceStatus=ready?'confirmed_project_configuration':'pending_or_review';
      row.financialReviewRequired=!ready;
      row.shopperCostsIncludedInCommissionMargin=includeShopperCosts;
      row.valuesInvented=false;
      if(ready)readyCountries++;else pendingCountries++;
    }

    window.CX_DELEGATED_COORDINATION_FINANCE_GUARD={
      ready:true,
      version:'delegated-coordination-finance-guard-v1',
      projectId:project.id||null,
      projectModel:modelOf(project),
      localBilling:modelOf(project)==='unconfigured'?null:false,
      royaltyPct:0,
      readyCountries,
      pendingCountries,
      defaultModelAssumed:false,
      shopperHonorariumUsedAsIncomeFallback:false,
      splitValuesInvented:false,
      providerWrites:0,
      production:false,
      at:new Date().toISOString()
    };
    return output;
  };

  window.CX_DELEGATED_COORDINATION_FINANCE_GUARD={
    ready:true,
    version:'delegated-coordination-finance-guard-v1',
    installed:true,
    defaultModelAssumed:false,
    shopperHonorariumUsedAsIncomeFallback:false,
    splitValuesInvented:false,
    providerWrites:0,
    production:false,
    at:new Date().toISOString()
  };
})();