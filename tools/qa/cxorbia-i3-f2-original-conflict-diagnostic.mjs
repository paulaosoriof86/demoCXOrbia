/* Read-only, privacy-safe diagnostic for exact original Excel durable visit joins.
 * No raw source rows, shopper names, contact data or stable IDs are logged.
 */
import {parseTab} from '../hr-source/tya-build-live-hr-source-safe-r20.mjs';
const str=x=>String(x??'').trim();
const norm=x=>str(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const keys=[['cinemaId','quincena','escenario'],['sucursal','quincena','escenario'],['sucursal','quincena','escenario','tipoCombo']];
const scoped=(x,scope)=>str(x.country||x.pais).toUpperCase()===scope.countryCode
 && str(x.periodId||x.measurementPeriodId||(x.periodKey?scope.projectId+'-'+x.periodKey:''))===scope.periodId;
const select=(x,fields)=>fields.map(k=>norm(x[k]??x.hrManaged?.[k]));
export async function diagnoseOriginalVisitJoin({db,plan,readings,columnMap,cinemaRegistry}={}){
 if(!db?.collection||!plan?.bindings||!Array.isArray(readings)||!columnMap||!cinemaRegistry)
  throw Error('MAPPING_FAILURE:F2_DIAGNOSTIC_SCOPE_MISSING');
 const snapshots=await db.collection('tenants').doc(plan.scope.tenantId).collection('projects')
   .doc(plan.scope.projectId).collection('visits').get();
 const durable=snapshots.docs.map(x=>({...x.data(),id:x.id}));
 const groups={},failures=[],counts={MATCH:0,NEW_UNMATCHED:0,KEY_AMBIGUOUS:0},seen=new Set();
 for(const {binding,response} of readings){
  const scope=binding.scope,periodKey=scope.periodId.slice(-7),country=scope.countryCode;
  const period=groups[country+'|'+periodKey]||{country,period:periodKey,source:0,durable:durable.filter(x=>scoped(x,scope)).length,conflicts:0};
  groups[country+'|'+periodKey]=period;
  for(const tab of response.privateProviderRows){
   const ws=binding.privateProvider.worksheets.find(x=>x.worksheetId===tab.worksheetId);
   if(!ws)throw Error('MAPPING_FAILURE:F2_DIAGNOSTIC_TAB_DRIFT');
   const parsed=parseTab({country,key:periodKey,year:Number(periodKey.slice(0,4)),month:Number(periodKey.slice(5)),
     tabTitle:ws.worksheetName,label:periodKey,fullLabel:periodKey},tab.values,columnMap,cinemaRegistry);
   if(parsed.issues.some(x=>x.severity==='critical'))throw Error('MAPPING_FAILURE:F2_DIAGNOSTIC_PARSER_DRIFT');
   period.source+=parsed.visits.length;
   const pool=durable.filter(x=>scoped(x,scope));
   for(const row of parsed.visits){
    const matches=keys.map(cols=>pool.filter(d=>{
      const a=select(row,cols),b=select(d,cols);
      return a.every(Boolean)&&a.every((v,i)=>v===b[i]);
    }));
    const cards=matches.map(m=>m.length);
    const unique=matches.every(m=>m.length===1&&m[0]===matches[0][0]);
    const empty=matches.every(m=>m.length===0);
    const kind=unique?'MATCH':empty?'NEW_UNMATCHED':'KEY_AMBIGUOUS';
    counts[kind]++;
    if(kind==='KEY_AMBIGUOUS'){
      period.conflicts++;
      const sameId=matches.filter(m=>m.length===1).map(m=>str(m[0].id));
      const evidence={country,period:periodKey,sourceRow:row.sourceRow,
        cardinalities:cards,cause:cards.some(x=>x>1)?'DUPLICATE_KEY_GROUP':
          cards.some(x=>x===0)?'PARTIAL_KEY_MISMATCH':
            new Set(sameId).size>1?'KEY_GROUPS_DIFFERENT_OWNER':'UNKNOWN'};
      if(failures.length<30)failures.push(evidence);
    }
    const alias=country+'|'+periodKey+'|'+row.sourceRow;
    if(seen.has(alias))throw Error('MAPPING_FAILURE:F2_DIAGNOSTIC_DUPLICATE_ROW');
    seen.add(alias);
   }
  }
 }
 return {decision:counts.KEY_AMBIGUOUS?'HOLD_EXACT_VISIT_MATCHING_KEYS':'PASS_EXACT_VISIT_JOIN_READONLY',
  sourceRowsChecked:Object.values(groups).reduce((n,x)=>n+x.source,0),durableRowsAvailable:durable.length,
  countryPeriodsChecked:Object.keys(groups).length,counts,conflictsByCountryPeriod:Object.values(groups)
    .filter(x=>x.conflicts).map(x=>({country:x.country,period:x.period,source:x.source,durable:x.durable,conflicts:x.conflicts})),
  firstConflicts:failures,rowsExposed:false,personalDataExposed:false,writes:0,production:false};
}
