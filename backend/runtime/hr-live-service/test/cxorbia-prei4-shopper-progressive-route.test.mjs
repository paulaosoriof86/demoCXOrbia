#!/usr/bin/env node
import fs from 'node:fs';
const q=fs.readFileSync('app/modules/cuestionario-shopper.js','utf8');
const m=fs.readFileSync('app/modules/misvisitas.js','utf8');
const checks={
  visitSpecificNeverFallsBackToGeneral:q.includes("const url = esPorVisita ? ((visita&&")&&!q.includes("hrQuestionnaireLink)||cfg.url"),
  externalQuestionnaireRequiresProviderAck:q.includes("shopper-external-questionnaire-complete")&&q.includes("ackAware:true")&&q.includes("providerAck===true"),
  internalQuestionnaireRequiresProviderAck:q.includes("shopper-internal-questionnaire-submit")&&q.includes("data.submitQuestionnaire")&&q.includes("providerAck===true"),
  assignedStageHasSchedule:m.includes("if(kind==='asignada')actions=")&&m.includes('data-sched="${v.id}"'),
  scheduledStageActivatesRealized:m.includes("else if(kind==='agendada')actions=")&&m.includes('data-done="${v.id}"'),
  realizedPendingActivatesQuestionnaire:m.includes('data-quest="${v.id}"'),
  completedQuestionnaireRemovesQuestionnaireAction:m.includes("else if(facets(v).questionnaire)actions=")&&m.includes("data-questionnaire-complete")
};
const failed=Object.entries(checks).filter(([,ok])=>!ok).map(([k])=>k);
console.log(JSON.stringify({decision:failed.length?'FAIL_PREI4_SHOPPER_PROGRESSIVE_ROUTE_SOURCE':'PASS_PREI4_SHOPPER_PROGRESSIVE_ROUTE_SOURCE',checks,failed,writes:0,deploys:0,production:false},null,2));
if(failed.length)process.exit(1);
