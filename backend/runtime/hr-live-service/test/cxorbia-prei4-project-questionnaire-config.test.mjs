#!/usr/bin/env node
import fs from 'node:fs';
const projects=fs.readFileSync('app/modules/proyectos.js','utf8');
const server=fs.readFileSync('backend/runtime/hr-live-service/server.mjs','utf8');
const apply=fs.readFileSync('app/adapters/tya-live-source-inplace-apply.js','utf8');
const checks={
  projectUiGeneralUrl:projects.includes('id="cf_cueUrl"'),
  projectSaveGeneralUrl:projects.includes("url:cueMode==='externo_general'?cueUrl:''"),
  visitSpecificHasNoGeneralFallback:projects.includes("visitLinkField:cueMode==='externo_visita'"),
  runtimeSafeProjectConfigCarriesQuestionnaire:server.includes("SAFE_PROJECT_CONFIG_KEYS")&&server.includes("'cuestionario'"),
  liveCompositionPreservesDurableQuestionnaire:apply.includes("identity.projectConfig.cuestionario||{}")
};
const failed=Object.entries(checks).filter(([,ok])=>!ok).map(([k])=>k);
console.log(JSON.stringify({decision:failed.length?'FAIL_PREI4_PROJECT_QUESTIONNAIRE_CONFIG_SOURCE':'PASS_PREI4_PROJECT_QUESTIONNAIRE_CONFIG_SOURCE',checks,failed,writes:0,deploys:0,production:false},null,2));
if(failed.length)process.exit(1);
