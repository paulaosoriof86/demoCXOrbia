#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const provider=read('backend/runtime/cxorbia-shopper-command-provider-v1.mjs');
const shoppers=read('app/modules/shoppers.js');
const academy=read('app/modules/academia.js');
const css=read('app/styles/layout.css');
const checks=[];
const pass=(name,fn)=>{fn();checks.push({name,pass:true});};

pass('multiple strong principals require unique canonical visible-login keeper',()=>{
  assert(provider.includes('canonicalLoginStrong.length!==1'));
  assert(provider.includes("shopperCredentialRule(canonical)"));
  assert(provider.includes("SHOPPER_IDENTITY_MULTIPLE_PASSWORD_PROOF_PRINCIPALS"));
});
pass('ambiguous multiple strong principals remain fail closed',()=>{
  const strongBlock=provider.slice(provider.indexOf('const strong=principalRows.filter'),provider.indexOf("const linkId='irl_",provider.indexOf('const strong=principalRows.filter')));
  assert(strongBlock.includes("throw new Error('SHOPPER_IDENTITY_MULTIPLE_PASSWORD_PROOF_PRINCIPALS')"));
});
pass('Admin explicit identity flow supports multiple selected aliases',()=>{
  assert(shoppers.includes('id="manualAliases" multiple'));
  assert(shoppers.includes('selectedRows=()=>[...aliasSel.selectedOptions]'));
  assert(shoppers.includes("aliases=allIds.filter(id=>id!==canonical)"));
  assert(shoppers.includes("admin_manual_same_human_confirmation"));
});
pass('Admin identity merge remains human confirmed and non-fuzzy',()=>{
  assert(shoppers.includes('id="manualConfirm"'));
  assert(shoppers.includes('La plataforma no fusiona automáticamente'));
});
pass('Academy assigns course tone by visible course index',()=>{
  assert(academy.includes('filtered.map((c,courseIndex)=>'));
  assert(academy.includes("toneOrder[courseIndex%toneOrder.length]"));
});
pass('Academy frozen palette is solid and contains eight distinct tones',()=>{
  const toneLines=css.split(/\r?\n/).filter(l=>/cx-academy-course-card\.tone-/.test(l));
  assert(toneLines.length>=8);
  assert(toneLines.every(l=>!l.includes('linear-gradient')));
  const values=toneLines.map(l=>(l.match(/--acad-tone:([^}]+)/)||[])[1]).filter(Boolean);
  assert(new Set(values).size>=8);
});

const result={decision:'PASS_I3_V221_IDENTITY_ACADEMY_SOURCE_PROOF',checksPassed:checks.length,checksFailed:0,sourceOnly:true,writes:0,deploys:0,production:false};
process.stdout.write(JSON.stringify(result,null,2)+'\n');
