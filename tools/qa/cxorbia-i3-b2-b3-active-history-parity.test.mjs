import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const profileSource=readFileSync('app/adapters/tya-canonical-shopper-portal-v2.js','utf8');
const visitsSource=readFileSync('app/modules/misvisitas.js','utf8');

function activeCountFor(facets,period='cinepolis-2026-11'){
  const current={id:'cinepolis-2026-11',parentProjectId:'cinepolis',tenantId:'tya',periodKey:'2026-11'};
  const v={id:'qa-visit',visitId:'qa-visit',shopperId:'qa-shopper',periodId:period,
    periodKey:period==='cinepolis-2026-11'?'2026-11':'2026-10',sucursal:'Cinema QA',
    pais:'GT',realizada:facets.realized?'2026-11-04':'',canonicalFacets:facets};
  const shopper={id:'qa-shopper',nombre:'QA Shopper',pais:'GT'};
  const data={__identityMap:{},shoppers:[shopper],projects:[current],currentPeriodId:current.id,
    getShopper:()=>shopper,shopperStats:()=>({total:1,realizadas:0,submitted:0}),
    shopperHistoryVisits:()=>[v],visitsForShopper:()=>[v],visitFacets:x=>x.canonicalFacets,
    recordPeriodId:x=>x.periodId};
  const CX={modules:{},session:{user:{shopperId:shopper.id}},data,
    backendAuth:{context:()=>({authenticated:true,shopperId:shopper.id})}};
  const window={CX,CX_PROTECTED_AUTH_HR_AUTHORITY:{applied:true},addEventListener() {},
    CX_TYA_CUMULATIVE_READ_MODEL:{facets:x=>x.canonicalFacets}};
  const ui={el:()=>({innerHTML:'',querySelectorAll:()=>[],querySelector:()=>null}),
    ph:()=>'',bdg:x=>'<span>'+x+'</span>',empty:(_,text)=>text,
    kpi:(label,n)=>label+': '+n,money:(currency,n)=>currency+' '+n};
  vm.runInNewContext(profileSource,{CX,window,document:{addEventListener(){}},setTimeout() {}});
  const html=CX.modules.miperfil({data,ui}).innerHTML;
  const match=html.match(/data-tab="active"[^>]*>Activas (\d+)<\/button>/);
  assert.ok(match,'Mi Perfil must expose an active count tab');
  return Number(match[1]);
}

test('B2/B3 use one operational meaning: submitted but unpaid belongs in history, not active',()=>{
  assert.match(visitsSource,/const realized=mine\.filter\(v=>\{const f=facets\(v\);return isCurrentPeriod\(v\)&&f\.realized&&!f\.submitted/);
  assert.equal(activeCountFor({assigned:true,realized:true,submitted:true,paymentConfirmed:false}),0);
});

test('B2/B3 active includes genuinely unfinished assigned, scheduled and realized-not-submitted visits',()=>{
  const rows=[
    {assigned:true,scheduled:false,realized:false,submitted:false},
    {assigned:true,scheduled:true,realized:false,submitted:false},
    {assigned:true,scheduled:true,realized:true,submitted:false}
  ];
  for(const facets of rows)assert.equal(activeCountFor(facets),1,JSON.stringify(facets));
});

test('B2/B3 historical or other-period rows never become active',()=>{
  const rows=[
    {assigned:true,submitted:true,paymentConfirmed:false},
    {assigned:true,realized:true,submitted:true,paymentConfirmed:true},
    {assigned:true,liquidationConfirmed:true},
    {assigned:true,cancelled:true}
  ];
  for(const facets of rows)assert.equal(activeCountFor(facets),0,JSON.stringify(facets));
  assert.equal(activeCountFor({assigned:true},'cinepolis-2026-10'),0);
});
