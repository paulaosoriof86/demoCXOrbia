#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { applyCanonicalVisitState } from '../hr-source/tya-canonical-visit-state-r20.mjs';

const args=process.argv.slice(2);
const valueOf=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0&&args[i+1]?args[i+1]:fallback;};
const outDir=path.resolve(valueOf('--out','.tmp/tya-postulation-eligibility-r21'));
fs.mkdirSync(outDir,{recursive:true});

function schedulingEligibility(v,proposedDate){
  const reasons=[];
  const iso=value=>/^20\d{2}-[01]\d-[0-3]\d$/.test(String(value||''));
  const date=String(proposedDate||'');
  const facets=v?.canonicalFacets||{};
  if(!v)return {ok:false,reasons:['visit_missing']};
  if(facets.assigned)reasons.push('visit_already_assigned');
  if(facets.eligibilityBlocked)reasons.push(v.availabilityState||'eligibility_blocked');
  if(!iso(v.disponibleDesde))reasons.push('available_from_missing_or_invalid');
  if(!iso(date))reasons.push('proposed_date_invalid');
  if(iso(v.disponibleDesde)&&iso(date)&&date<v.disponibleDesde)reasons.push('before_available_from');
  if(iso(v.measurementWindowStart)&&iso(date)&&date<v.measurementWindowStart)reasons.push('before_measurement_window');
  if(iso(v.measurementWindowEnd)&&iso(date)&&date>v.measurementWindowEnd)reasons.push('after_measurement_window');
  if(iso(date)){
    const day=new Date(date+'T12:00:00Z').getUTCDay();
    const weekend=day===0||day===6;
    if(v.franjaCode==='WKND'&&!weekend)reasons.push('requires_weekend');
    if(v.franjaCode==='WK'&&weekend)reasons.push('requires_weekday');
  }
  return {ok:reasons.length===0,reasons:[...new Set(reasons)]};
}

const q2={periodKey:'2026-07',measurementWindowId:'q2',measurementWindowLabel:'QUINCENA 2',measurementWindowStart:'2026-07-16',measurementWindowEnd:'2026-07-31',tenantId:'tya',projectId:'cinepolis',hasShopper:false,shopperId:null,shopperCode:null,shopper:null};
const visits=[
  {...q2,id:'gt-santa-clara-q2',sucursal:'MC. Santa Clara',availableFromRaw:'P1Q',disponibleDesde:null,franja:'Fin de semana',franjaCode:'WKND'},
  {...q2,id:'gt-plaza-americas-q2',sucursal:'MC. Plaza Américas',availableFromRaw:'2026-07-25',disponibleDesde:'2026-07-25',franja:'Fin de semana',franjaCode:'WKND'},
  {...q2,id:'gt-carcha-q2',sucursal:'MC. Carchá',availableFromRaw:'2026-07-17',disponibleDesde:'2026-07-17',franja:'Semana',franjaCode:'WK'},
  {...q2,id:'hn-altara-q2',sucursal:'C. Altara',availableFromRaw:'2026-07-20',disponibleDesde:'2026-07-20',franja:'Semana',franjaCode:'WK'},
  {...q2,id:'hn-juticalpa-q2',sucursal:'C. Mall Premier Juticalpa',availableFromRaw:'2026-07-20',disponibleDesde:'2026-07-20',franja:'Semana',franjaCode:'WK'}
].map(applyCanonicalVisitState);

const unassigned=visits.filter(v=>v.assignmentState==='unassigned');
const available=visits.filter(v=>v.canonicalFacets?.available===true);
const blocked=visits.filter(v=>v.canonicalFacets?.eligibilityBlocked===true);
assert.equal(unassigned.length,5);
// Recovery authority: every genuinely unassigned visit is postulable.
// Dependencies/date constraints govern scheduling, not publication of vacancies.
assert.equal(available.length,5);
assert.equal(blocked.length,0);
const santa=visits.find(v=>v.id==='gt-santa-clara-q2');
assert.equal(santa.availabilityState,'eligible_with_schedule_dependency');
assert.equal(santa.availabilityDependency,'previous_measurement_window');
assert.equal(santa.disponibleDesde,null);
assert.equal(santa.canonicalFacets.available,true);

const plaza=visits.find(v=>v.id==='gt-plaza-americas-q2');
assert.deepEqual(schedulingEligibility(plaza,'2026-07-21'),{ok:false,reasons:['before_available_from','requires_weekend']});
assert.deepEqual(schedulingEligibility(plaza,'2026-07-25'),{ok:true,reasons:[]});
assert.deepEqual(schedulingEligibility(plaza,'2026-08-01'),{ok:false,reasons:['after_measurement_window']});
const carcha=visits.find(v=>v.id==='gt-carcha-q2');
assert.deepEqual(schedulingEligibility(carcha,'2026-07-18'),{ok:false,reasons:['requires_weekday']});
assert.deepEqual(schedulingEligibility(carcha,'2026-07-17'),{ok:true,reasons:[]});
assert.ok(schedulingEligibility(santa,'2026-07-18').reasons.includes('available_from_missing_or_invalid'));

const report={schemaVersion:'1.1.0',gate:'tya-postulation-eligibility-r21',decision:'PASS_R21_POSTULATION_VS_SCHEDULING_SEPARATION',observed:{unassigned:unassigned.length,postulable:available.length,blockedPostulation:blocked.length,scheduleDependencyVisit:santa.sucursal,scheduleDependency:santa.availabilityDependency},assertions:{allUnassignedPostulable:true,dependencyDoesNotHideVacancy:true,nullAvailabilityBlocksScheduling:true,beforeAvailableFromRejected:true,measurementWindowRejected:true,weekendRuleRejected:true,weekdayRuleRejected:true,validDatesAccepted:true},sourceSamples:['JULIO 26','JULIO 26 HN'],safeState:{readOnly:true,writes:false,imports:false,deploy:false,production:false,providers:false,payments:false,piiIncluded:false}};
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'),`# R21 postulation and scheduling eligibility gate\n\nDecision: **${report.decision}**\n\n- Sin asignar: ${report.observed.unassigned}\n- Postulables: ${report.observed.postulable}\n- Postulaciones bloqueadas: ${report.observed.blockedPostulation}\n- Dependencia de programación: ${report.observed.scheduleDependencyVisit} · ${report.observed.scheduleDependency}\n`,'utf8');
console.log(JSON.stringify(report,null,2));
