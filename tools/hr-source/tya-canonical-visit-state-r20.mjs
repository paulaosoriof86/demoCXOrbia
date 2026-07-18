#!/usr/bin/env node
/*
  CXOrbia TyA Phase A — motor canónico histórico de estados de visita R20.

  La HR entrega evidencias ortogonales. Ningún consumidor debe reconstruir el
  ciclo solamente desde `estado`. La misma regla se aplica a todos los periodos
  detectados; liquidación y pago requieren evidencia financiera independiente.
*/
const ISO_DATE=/^20\d{2}-[01]\d-[0-3]\d$/;

export function normalizedText(value){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();}
export function hasValue(value){if(value===true)return true;if(value===false||value==null)return false;return String(value).trim()!=='';}
export function validIsoDate(value){if(!hasValue(value))return false;const text=String(value).trim();if(!ISO_DATE.test(text))return false;const date=new Date(text+'T12:00:00Z');return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===text;}
export function periodYear(periodKey){const match=String(periodKey||'').match(/^(20\d{2})-[01]\d$/);return match?Number(match[1]):null;}
export function dateReview(field,value,periodKey){if(!hasValue(value))return null;if(!validIsoDate(value))return field+'_invalid_date';const expected=periodYear(periodKey);const actual=Number(String(value).slice(0,4));if(expected&&Math.abs(actual-expected)>1)return field+'_outside_period_year';return null;}

function acceptedDate(field,value,periodKey,reviewReasons){const issue=dateReview(field,value,periodKey);if(issue){reviewReasons.add(issue);return null;}return hasValue(value)?String(value).trim():null;}
function explicitFinancialConfirmation(visit,kind){
  if(kind==='payment')return visit.paymentConfirmed===true||visit.paymentState==='confirmed'||hasValue(visit.paymentConfirmedAt)||hasValue(visit.paymentSourceRef)||hasValue(visit.paymentEvidence);
  return visit.liquidationState==='confirmed'||hasValue(visit.liquidationConfirmedAt)||hasValue(visit.liquidationEvidence);
}

export function deriveCanonicalVisitState(visit){
  const control=normalizedText(visit.controlDia||visit.control||visit.statusRaw);
  const reviewReasons=new Set(Array.isArray(visit.reviewReasons)?visit.reviewReasons:[]);
  const scheduledDate=acceptedDate('scheduled',visit.agendada,visit.periodKey,reviewReasons);
  const realizedDate=acceptedDate('realized',visit.realizada,visit.periodKey,reviewReasons);
  const questionnaireDate=acceptedDate('questionnaire',visit.cuestFecha,visit.periodKey,reviewReasons);
  const submittedDate=acceptedDate('submitted',visit.submittedAt,visit.periodKey,reviewReasons);

  const hasShopper=visit.hasShopper===true||hasValue(visit.shopperId)||hasValue(visit.shopperCode);
  const controlPendingAssignment=control.includes('p x asignar');
  const controlPendingSchedule=control.includes('p x agendar');
  const outOfRange=control.includes('fuera');
  const cancelled=visit.cancelled===true||visit.cancelada===true||['cancelada','cancelled','archivada'].includes(normalizedText(visit.estado));

  if(controlPendingAssignment&&hasShopper)reviewReasons.add('control_pending_assignment_but_shopper_present');
  if(controlPendingSchedule&&!hasShopper)reviewReasons.add('control_pending_schedule_but_shopper_missing');
  if(scheduledDate&&!hasShopper)reviewReasons.add('scheduled_date_without_shopper');
  if((realizedDate||questionnaireDate||submittedDate)&&!hasShopper)reviewReasons.add('execution_evidence_without_shopper');
  if(questionnaireDate&&!realizedDate)reviewReasons.add('questionnaire_without_realized_date');
  if(submittedDate&&!questionnaireDate)reviewReasons.add('submitted_without_questionnaire_date');

  // Evidencia posterior cierra la progresión sin inventar las fechas que falten.
  const submitted=Boolean(submittedDate||visit.submit===true||visit.submissionState==='confirmed_hr'||visit.workflowState==='submitted_by_tya');
  const questionnaireCompleted=Boolean(questionnaireDate||submitted);
  const realized=Boolean(realizedDate||questionnaireCompleted);
  const assigned=Boolean(hasShopper);
  const scheduled=Boolean(assigned&&scheduledDate);
  const liquidationConfirmed=explicitFinancialConfirmation(visit,'liquidation');
  const paymentConfirmed=explicitFinancialConfirmation(visit,'payment');
  const liquidationCandidate=submitted;

  let operationalStage='pending_assignment';
  let presentationState='disponible';
  if(assigned){operationalStage='pending_schedule';presentationState='asignada';}
  if(scheduled){operationalStage='pending_realization';presentationState='agendada';}
  if(realized){operationalStage='pending_questionnaire';presentationState='realizada';}
  if(questionnaireCompleted){operationalStage='pending_submission';presentationState='cuestionario';}
  if(submitted){operationalStage='submitted_complete';presentationState='submitida';}
  if(liquidationConfirmed)presentationState='liquidada';
  if(paymentConfirmed)presentationState='pagada';
  if(outOfRange&&!realized)presentationState='fuera_rango';
  if(cancelled){operationalStage='cancelled';presentationState='cancelada';}

  const assignmentState=assigned?'assigned':'unassigned';
  const schedulingState=scheduled?'scheduled':(assigned?'pending_schedule':'not_applicable');
  const executionState=realized?'realized':(scheduled?'pending_realization':'not_realized');
  const questionnaireState=questionnaireCompleted?'completed':(realized?'pending':'not_available');
  const submissionState=submitted?'confirmed_hr':(questionnaireCompleted?'pending_tya_submit':'not_submitted');
  const liquidationState=liquidationConfirmed?'confirmed':(liquidationCandidate?'candidate_pending_financial_match':'not_eligible');
  const paymentState=paymentConfirmed?'confirmed':(liquidationCandidate?'not_confirmed':'not_eligible');
  return {assigned,scheduled,realized,questionnaireCompleted,submitted,outOfRange,cancelled,liquidationCandidate,liquidationConfirmed,paymentConfirmed,assignmentState,schedulingState,executionState,questionnaireState,submissionState,liquidationState,paymentState,operationalStage,presentationState,controlPendingAssignment,controlPendingSchedule,reviewRequired:reviewReasons.size>0,reviewReasons:[...reviewReasons].sort()};
}

export function applyCanonicalVisitState(visit){
  const c=deriveCanonicalVisitState(visit);
  return {...visit,hasShopper:c.assigned,estado:c.presentationState,canonicalState:c.operationalStage,operationalState:c.operationalStage,assignmentState:c.assignmentState,schedulingState:c.schedulingState,executionState:c.executionState,questionnaireState:c.questionnaireState,submissionState:c.submissionState,liquidationState:c.liquidationState,paymentState:c.paymentState,liquidationCandidate:c.liquidationCandidate,paymentControlOnly:c.liquidationCandidate&&!c.paymentConfirmed,paymentConfirmed:c.paymentConfirmed,outOfRange:c.outOfRange,reviewRequired:c.reviewRequired,reviewReasons:c.reviewReasons,canonicalFacets:{assigned:c.assigned,scheduled:c.scheduled,realized:c.realized,questionnaire:c.questionnaireCompleted,submitted:c.submitted,outOfRange:c.outOfRange,cancelled:c.cancelled,liquidationCandidate:c.liquidationCandidate,liquidationConfirmed:c.liquidationConfirmed,paymentConfirmed:c.paymentConfirmed}};
}

export function summarizeCanonicalPeriods(visits){
  const map=new Map();
  for(const visit of visits||[]){
    const key=String(visit.periodKey||'unknown');
    if(!map.has(key))map.set(key,{periodKey:key,total:0,assigned:0,unassigned:0,scheduled:0,pendingSchedule:0,realized:0,pendingQuestionnaire:0,questionnaireCompleted:0,pendingSubmission:0,submitted:0,liquidationCandidates:0,liquidationConfirmed:0,paymentConfirmed:0,outOfRange:0,reviewRequired:0,byCountry:{}});
    const row=map.get(key);const f=visit.canonicalFacets||deriveCanonicalVisitState(visit);
    row.total++;row.assigned+=f.assigned?1:0;row.unassigned+=f.assigned?0:1;row.scheduled+=f.scheduled?1:0;row.pendingSchedule+=f.assigned&&!f.scheduled&&!f.realized?1:0;row.realized+=f.realized?1:0;row.pendingQuestionnaire+=f.realized&&!f.questionnaire?1:0;row.questionnaireCompleted+=f.questionnaire?1:0;row.pendingSubmission+=f.questionnaire&&!f.submitted?1:0;row.submitted+=f.submitted?1:0;row.liquidationCandidates+=f.liquidationCandidate?1:0;row.liquidationConfirmed+=f.liquidationConfirmed?1:0;row.paymentConfirmed+=f.paymentConfirmed?1:0;row.outOfRange+=f.outOfRange?1:0;row.reviewRequired+=visit.reviewRequired===true?1:0;
    const country=visit.country||visit.pais||'unknown';row.byCountry[country]=(row.byCountry[country]||0)+1;
  }
  return [...map.values()].sort((a,b)=>a.periodKey.localeCompare(b.periodKey));
}

export function validateCanonicalHistory(visits,periods){
  const issues=[];const summaries=summarizeCanonicalPeriods(visits);const expected=new Set((periods||[]).map(item=>String(item.key)));const actual=new Set(summaries.map(item=>item.periodKey));
  for(const key of expected)if(!actual.has(key))issues.push({code:'period_without_visits',periodKey:key,severity:'blocker'});
  for(const s of summaries){if(s.submitted>s.questionnaireCompleted||s.questionnaireCompleted>s.realized||s.realized>s.total)issues.push({code:'non_monotonic_operational_chain',periodKey:s.periodKey,severity:'blocker',summary:s});if(s.paymentConfirmed>s.liquidationCandidates)issues.push({code:'payment_without_liquidation_candidate',periodKey:s.periodKey,severity:'blocker',summary:s});}
  return {decision:issues.some(item=>item.severity==='blocker')?'HOLD_CANONICAL_HISTORY':'PASS_CANONICAL_HISTORY',periodCount:summaries.length,periodKeys:summaries.map(item=>item.periodKey),summaries,issues};
}
