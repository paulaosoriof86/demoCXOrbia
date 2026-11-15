// Independent expected values: raw external HR + separately read Firestore config.
// Never import the application's finance/read model to calculate its own oracle.
export const knownAmount=v=>(typeof v==='number'||typeof v==='string')&&String(v).trim()!==''&&Number.isFinite(Number(v));
const list=v=>Array.isArray(v)?v:[];
const facet=v=>v?.canonicalFacets||{};
const codeOf=v=>String(v?.pais||v?.country||'').toUpperCase();

export function assertFocalConfigAuthority({snapshot,projectId,projectConfig,projectExists}){
  if(String(snapshot?.projectId||'')!==projectId)throw new Error('SOURCE_FAILURE:FOCAL_PROJECT_SCOPE');
  if(!projectExists||snapshot.projectConfigAuthority!=='firestore_project_config')throw new Error('SOURCE_FAILURE:FOCAL_CONFIG_AUTHORITY');
  if(!Number.isSafeInteger(snapshot.projectConfigVersion)||snapshot.projectConfigVersion<1||String(snapshot.projectConfigVersion)!==String(projectConfig?.version))throw new Error('MAPPING_FAILURE:FOCAL_CONFIG_VERSION_DESYNC');
  for(const field of ['honorario','currency']){
    const external=snapshot?.projectConfig?.[field]||{},durable=projectConfig?.[field]||{};
    const keys=[...new Set([...Object.keys(external),...Object.keys(durable)])];
    if(keys.some(k=>String(external[k]??'')!==String(durable[k]??'')))throw new Error('MAPPING_FAILURE:FOCAL_CONFIG_'+field.toUpperCase()+'_DESYNC');
  }
  return true;
}

export function buildFocalHrReference({snapshot,periodKey,countryCodes,projectConfig={},periodConfig={},configAuthority}){
  const current=list(snapshot?.visits).filter(v=>String(v.periodKey||'')===periodKey);
  const realized=v=>facet(v).realized===true&&facet(v).cancelled!==true;
  const trusted=configAuthority==='firestore_project_config';
  const configuredHonorarium=code=>{
    if(!trusted)return null;
    const period=periodConfig?.honorario?.[code],project=projectConfig?.honorario?.[code];
    return knownAmount(period)?Number(period):knownAmount(project)?Number(project):null;
  };
  const countries=Object.fromEntries(countryCodes.map(code=>{
    const rows=current.filter(v=>codeOf(v)===code),realizedRows=rows.filter(realized);
    const active=key=>rows.filter(v=>facet(v)[key]===true&&facet(v).cancelled!==true).length;
    const honoraria=realizedRows.map(v=>knownAmount(v.honorario)?Number(v.honorario):configuredHonorarium(code));
    const reimbursements=realizedRows.map(v=>[v.boleto,v.comboAmt]);
    return [code,{total:rows.length,assigned:active('assigned'),scheduled:active('scheduled'),realized:active('realized'),
      questionnaire:active('questionnaire'),submitted:active('submitted'),liquidationConfirmed:active('liquidationConfirmed'),outOfRange:active('outOfRange'),
      finance:{realizedCount:realizedRows.length,honorarioDevengado:honoraria.length>0&&honoraria.every(Number.isFinite)?honoraria.reduce((n,v)=>n+v,0):null,
        knownReimbursements:reimbursements.flat().reduce((n,v)=>n+(knownAmount(v)?Number(v):0),0),
        reimbursementPartial:reimbursements.some(parts=>parts.some(v=>!knownAmount(v)))}}];
  }));
  // Liquidaciones displays all realized work; payable candidates are a different facet.
  const liquidations=current.filter(realized),shoppers=list(snapshot?.shoppers);
  return {countries,finance:Object.fromEntries(countryCodes.map(c=>[c,countries[c].finance])),
    liquidations:{total:liquidations.length,...Object.fromEntries(countryCodes.map(c=>[c,liquidations.filter(v=>codeOf(v)===c).length])),
      paymentsConfirmed:liquidations.filter(v=>facet(v).paymentConfirmed===true).length,
      liquidationsConfirmed:liquidations.filter(v=>facet(v).liquidationConfirmed===true).length},
    shopperPopulation:shoppers.length,sourceHrShopperIds:shoppers.map(v=>String(v.id||v.shopperId||'')).filter(Boolean),identityCases:[],unresolvedIdentityCases:[]};
}
