#!/usr/bin/env node
import crypto from 'node:crypto';

function required(value,name){
  const text=String(value??'').trim();
  if(!text)throw new Error(`stable_visit_id_${name}_required`);
  return text;
}

export function buildStableVisitId({tenantId='tya',projectId='cinepolis',periodKey,country,sourceRow}){
  const tenant=required(tenantId,'tenant').toLowerCase();
  const project=required(projectId,'project').toLowerCase();
  const period=required(periodKey,'period');
  if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(period))throw new Error(`stable_visit_id_period_invalid:${period}`);
  const countryCode=required(country,'country').toUpperCase();
  if(!/^[A-Z]{2}$/.test(countryCode))throw new Error(`stable_visit_id_country_invalid:${countryCode}`);
  const row=Number(sourceRow);
  if(!Number.isInteger(row)||row<1)throw new Error(`stable_visit_id_source_row_invalid:${sourceRow}`);
  const canonical=`${tenant}|${project}|${period}|${countryCode}|${row}`;
  const suffix=crypto.createHash('sha256').update(canonical).digest('hex').slice(0,10);
  return `hr_${period}_${countryCode.toLowerCase()}_${row}_${suffix}`;
}

export function stableVisitIdentityVersion(){return 'tya-stable-visit-id-r20-row-identity-v1';}
