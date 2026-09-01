/* CXOrbia — reusable per-project operational source resolver v1.
   Pure source contract. It does not mutate project data and performs no provider write.
   Every project selects its own route source: internal or external provider.
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};
  const VERSION='cxorbia-project-operational-source-v1';
  const providers=new Map();
  const str=v=>String(v==null?'':v).trim();
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const arr=v=>Array.isArray(v)?v:[];

  function legacyToCanonical(project){
    const hr=project?.hrFuente||{};
    const label=str(hr.etiqueta||project?.hrMap?.fuente);
    if(str(hr.origen).toLowerCase()==='nativa'||/hoja creada en plataforma/i.test(label)){
      return {mode:'internal',providerType:'internal_firestore',authority:'platform',readPolicy:'internal_live',writePolicy:'platform_only'};
    }
    if(/google sheets/i.test(label))return {mode:'external',providerType:'google_sheets',authority:'external_source',readPolicy:'external_live',writePolicy:'external_read_only'};
    if(/excel/i.test(label))return {mode:'external',providerType:'excel_import',authority:'external_source',readPolicy:'external_snapshot_import',writePolicy:'external_read_only'};
    if(str(hr.origen).toLowerCase()==='externa')return {mode:'external',providerType:'custom_adapter',authority:'external_source',readPolicy:'external_live',writePolicy:'external_read_only'};
    return null;
  }

  function normalize(project){
    project=project||{};
    const source=clone(project.operationalSource||project.routeSource||legacyToCanonical(project)||{});
    const mode=str(source.mode).toLowerCase();
    const providerType=str(source.providerType).toLowerCase();
    const authority=str(source.authority|| (mode==='internal'?'platform':mode==='external'?'external_source':''));
    const readPolicy=str(source.readPolicy|| (mode==='internal'?'internal_live':providerType==='excel_import'?'external_snapshot_import':'external_live'));
    const writePolicy=str(source.writePolicy|| (mode==='internal'?'platform_only':'external_read_only'));
    return {
      schemaVersion:'cxorbia.project-operational-source.v1',
      tenantId:str(project.tenantId||CX.BACKEND?.tenantId),
      projectId:str(project.rootProjectId||project.program||project.projectId||project.id),
      mode,providerType,authority,readPolicy,writePolicy,
      providerBindingId:str(source.providerBindingId||source.integrationSettingId||source.providerRef),
      mappingRef:str(source.mappingRef||source.mappingId||project.hrMap?.mappingRef),
      periodDiscovery:str(source.periodDiscovery|| (mode==='internal'?'internal_native':'provider_auto')),
      visitLinkField:str(source.visitLinkField||project.cuestionario?.visitLinkField||'questionnaireLink'),
      sourceLabel:str(source.label||project.hrFuente?.etiqueta||project.hrMap?.fuente||providerType),
      sourceUrlPresentInProject:!!str(source.url||source.privateUrl||source.workbookUrl),
      credentialsPresentInProject:!!(source.credentials||source.password||source.token||source.apiKey),
      raw:source
    };
  }

  function validate(project){
    const s=normalize(project),errors=[],warnings=[];
    if(!s.tenantId)errors.push('PROJECT_SOURCE_TENANT_REQUIRED');
    if(!s.projectId)errors.push('PROJECT_SOURCE_PROJECT_REQUIRED');
    if(!['internal','external'].includes(s.mode))errors.push('PROJECT_SOURCE_MODE_REQUIRED');
    if(!s.providerType)errors.push('PROJECT_SOURCE_PROVIDER_TYPE_REQUIRED');
    if(!['platform','external_source'].includes(s.authority))errors.push('PROJECT_SOURCE_AUTHORITY_INVALID');
    if(!['internal_live','external_live','external_snapshot_import'].includes(s.readPolicy))errors.push('PROJECT_SOURCE_READ_POLICY_INVALID');
    if(!['platform_only','external_read_only','bidirectional_gated'].includes(s.writePolicy))errors.push('PROJECT_SOURCE_WRITE_POLICY_INVALID');
    if(s.mode==='external'&&s.readPolicy==='external_live'&&!s.providerBindingId)errors.push('PROJECT_SOURCE_PROVIDER_BINDING_REQUIRED');
    if(s.mode==='external'&&!s.mappingRef)errors.push('PROJECT_SOURCE_MAPPING_REQUIRED');
    if(s.mode==='internal'&&s.authority!=='platform')errors.push('PROJECT_SOURCE_INTERNAL_AUTHORITY_MUST_BE_PLATFORM');
    if(s.mode==='external'&&s.authority!=='external_source')errors.push('PROJECT_SOURCE_EXTERNAL_AUTHORITY_MUST_BE_EXTERNAL');
    if(s.sourceUrlPresentInProject)errors.push('PROJECT_SOURCE_RAW_URL_FORBIDDEN_USE_BINDING_REF');
    if(s.credentialsPresentInProject)errors.push('PROJECT_SOURCE_RAW_CREDENTIAL_FORBIDDEN');
    if(s.mode==='external'&&s.writePolicy==='bidirectional_gated')warnings.push('EXTERNAL_WRITES_REQUIRE_SEPARATE_PROVIDER_GATE');
    return {ok:errors.length===0,source:s,errors,warnings};
  }

  function registerProvider(providerType,provider){
    const key=str(providerType).toLowerCase();
    if(!key)throw new Error('PROJECT_SOURCE_PROVIDER_NAME_REQUIRED');
    if(!provider||typeof provider.read!=='function')throw new Error('PROJECT_SOURCE_PROVIDER_READ_REQUIRED');
    providers.set(key,provider);return true;
  }

  async function read(project,options){
    const v=validate(project);if(!v.ok)return {ok:false,status:'blocked',code:'PROJECT_SOURCE_INVALID',errors:v.errors,warnings:v.warnings,source:v.source};
    const p=providers.get(v.source.providerType);
    if(!p)return {ok:false,status:'blocked',code:'PROJECT_SOURCE_PROVIDER_UNREGISTERED',source:v.source};
    const result=await p.read({project:clone(project),source:clone(v.source),options:clone(options||{})});
    if(!(result&&result.ok===true))return Object.assign({ok:false,status:'blocked',code:'PROJECT_SOURCE_READ_FAILED',source:v.source},result||{});
    return Object.assign({},result,{ok:true,source:v.source});
  }

  root.CX.projectOperationalSource=Object.freeze({
    version:VERSION,normalize,validate,registerProvider,read,
    status(){return {version:VERSION,registeredProviders:[...providers.keys()],writesExecuted:0,dedupeByName:false,projectScoped:true};}
  });
})(typeof window!=='undefined'?window:globalThis);
