#!/usr/bin/env node
import fs from 'node:fs';
import {validateProjectPayload} from '../../cxorbia-project-command-provider-v1.mjs';

const projects=fs.readFileSync('app/modules/proyectos.js','utf8');
const server=fs.readFileSync('backend/runtime/hr-live-service/server.mjs','utf8');
const apply=fs.readFileSync('app/adapters/tya-live-source-inplace-apply.js','utf8');
const programa=fs.readFileSync('app/core/programa.js','utf8');
const config=fs.readFileSync('app/modules/configuracion.js','utf8');

const fixtureProgram={activeId:'v1',versions:[{id:'v1',name:'General',criterio:'General',aplica:'Todas',sections:[{id:'s1',name:'Servicio',weight:100,questions:[{id:'q1',name:'Cumplimiento',tipo:'Sí / No',weight:100,req:true,critico:false,evidencia:'none',evidNota:''}]}]}]};
const providerValidation=validateProjectPayload({
  name:'Fixture Project',
  countries:['GT'],
  operationalSource:{mode:'internal',providerType:'internal_firestore',readPolicy:'internal_live',writePolicy:'platform_only'},
  version:7,
  questionnaireProgramsByPeriod:{'fixture-2026-10':fixtureProgram}
},'update');

const checks={
  projectUiGeneralUrl:projects.includes('id="cf_cueUrl"'),
  projectSaveGeneralUrl:projects.includes("url:cueMode==='externo_general'?cueUrl:''"),
  visitSpecificHasNoGeneralFallback:projects.includes("visitLinkField:cueMode==='externo_visita'"),
  runtimeSafeProjectConfigCarriesQuestionnaire:server.includes("SAFE_PROJECT_CONFIG_KEYS")&&server.includes("'cuestionario'"),
  liveCompositionPreservesDurableQuestionnaire:apply.includes("identity.projectConfig.cuestionario||{}"),
  vrm188ProgramHasNoBrowserStorageAuthority:!programa.match(/localStorage\.(getItem|setItem|removeItem)/),
  vrm188ProgramReadsDurablePeriodOrProject:programa.includes('questionnaireProgram')&&programa.includes('questionnaireProgramsByPeriod')&&programa.includes("source:durable?'firestore_project_config':'default_template'"),
  vrm188ProgramWritesOnlyViaConnectedProvider:programa.includes("updateQuestionnaireProgram")&&programa.includes("providerAck:false")&&programa.includes("localStorageWrite:false"),
  vrm188AdminSaveAwaitsProviderAck:config.includes("await CX.programa.save(p.id,_qProg)")&&config.includes("ack?.providerAck===true")&&config.includes("ack?.durableReadback===true"),
  vrm188ProjectUpdateUsesAckAndReadback:config.includes("connected-config-questionnaire-program")&&config.includes("CX.data.updateProject")&&config.includes("QUESTIONNAIRE_PROGRAM_DURABLE_READBACK_MISMATCH"),
  vrm188RuntimeWhitelistCarriesPrograms:server.includes("'questionnaireProgramsByPeriod'"),
  vrm188LivePeriodProjectionCarriesProgram:apply.includes("questionnaireProgram:")&&apply.includes("questionnaireProgramAuthority:"),
  vrm188ProviderAcceptsDurableProgramField:providerValidation.ok===true&&providerValidation.errors.length===0
};
const failed=Object.entries(checks).filter(([,ok])=>!ok).map(([k])=>k);
const decision=failed.length?'FAIL_PREI4_PROJECT_QUESTIONNAIRE_CONFIG_SOURCE':'PASS_PREI4_PROJECT_QUESTIONNAIRE_CONFIG_SOURCE';
console.log(JSON.stringify({decision,checks,failed,providerValidation,writes:0,deploys:0,production:false},null,2));
if(failed.length)process.exit(1);
