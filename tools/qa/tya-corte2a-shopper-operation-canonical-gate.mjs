#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=process.cwd();
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const files={
  visits:'app/modules/visitas.js',
  posts:'app/modules/postulaciones.js',
  bridge:'app/core/tya-phase-a-source-safe-preview.js',
  contract:'backend/contracts/phase-a-corte2a-shopper-operation-canonical-v1.json'
};
const blockers=[];
const warnings=[];
const add=(arr,code,file,observed,expected)=>arr.push({code,file,observed,expected});

for(const rel of Object.values(files)) if(!fs.existsSync(path.join(root,rel))) add(blockers,'required_file_missing',rel,false,true);

if(!blockers.length){
  const visits=read(files.visits);
  const posts=read(files.posts);
  const bridge=read(files.bridge);
  const contract=JSON.parse(read(files.contract));

  if(!visits.includes('visitFacets')) add(blockers,'visits_canonical_facets_missing',files.visits,'visitFacets absent','visible state/filter/detail/export consume canonical facets');
  if(visits.includes('ui.estadoBadge(v.estado)')) add(blockers,'visits_raw_state_visible',files.visits,'ui.estadoBadge(v.estado)','canonical visible-state projection');
  if(/estado\s*:\s*v\.estado/.test(visits)) add(blockers,'visits_raw_state_exported',files.visits,'estado:v.estado','canonical exported state/facets');
  if(visits.includes('location.reload')) add(blockers,'document_reload_forbidden',files.visits,true,false);
  if(!visits.includes('sourceRevision')) add(blockers,'visits_export_revision_missing',files.visits,false,true);

  if(posts.includes('<button class="btn btn-ghost btn-sm">⤓ Exportar</button>')) add(blockers,'postulations_export_unwired',files.posts,'button without id/listener','implemented filtered active-period export');
  if(!/sourceRevision/.test(posts)) add(blockers,'postulations_export_revision_missing',files.posts,false,true);
  if(/📞\s*\$\{x\.phone\}/.test(posts)) add(blockers,'protected_phone_fallback_missing',files.posts,'raw x.phone interpolation','safe source-aware fallback');
  if(posts.includes('HR sincronizada')) add(blockers,'unauthorized_write_claim',files.posts,'HR sincronizada','read-only honest copy');
  for(const choice of ['Conservar fecha','Cambiar fecha','Pendiente de agendamiento']){
    if(!posts.toLowerCase().includes(choice.toLowerCase())) add(blockers,'reassignment_date_choice_missing',files.posts,choice+' absent',choice+' explicit option');
  }
  if(posts.includes('location.reload')) add(blockers,'document_reload_forbidden',files.posts,true,false);

  if(/honorario\s*:\s*v\.honorario\s*\|\|\s*0/.test(bridge)) add(blockers,'missing_honorarium_collapsed_to_zero',files.bridge,'v.honorario||0','preserve null/absence');
  if(/boleto\s*:\s*v\.boleto\s*\|\|\s*0/.test(bridge)) add(blockers,'missing_ticket_collapsed_to_zero',files.bridge,'v.boleto||0','preserve null/absence');
  if(/comboAmt\s*:\s*v\.comboAmt\s*\|\|\s*0/.test(bridge)) add(blockers,'missing_combo_collapsed_to_zero',files.bridge,'v.comboAmt||0','preserve null/absence');

  const mustPreserve=contract?.m1FrozenBaseline?.invariants||[];
  if(mustPreserve.length<8) add(warnings,'contract_invariants_too_short',files.contract,mustPreserve.length,'at least 8 frozen M1 invariants');
}

const report={
  ok:blockers.length===0,
  decision:blockers.length?'HOLD_CORTE2A_SHOPPER_OPERATION_CANONICAL':'PASS_CORTE2A_SHOPPER_OPERATION_CANONICAL',
  blockers,
  warnings
};
const outDir=path.join(root,'.tmp/tya-corte2a-shopper-operation-canonical');
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'),`# Corte 2A shopper operation canonical gate\n\n- Decision: \`${report.decision}\`\n- Blockers: ${blockers.length}\n- Warnings: ${warnings.length}\n\n## Blockers\n\n${blockers.length?blockers.map(x=>`- ${x.code}: ${x.file}`).join('\n'):'- None'}\n\n## Warnings\n\n${warnings.length?warnings.map(x=>`- ${x.code}: ${x.file}`).join('\n'):'- None'}\n`,'utf8');
console.log(JSON.stringify(report,null,2));
if(blockers.length) process.exit(1);
