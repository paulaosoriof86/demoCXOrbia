#!/usr/bin/env node
/*
  Entrada de compatibilidad R15G.

  La implementación vigente vive en `tya-build-live-hr-source-safe-r20.mjs`.
  Cuando no existe acceso Sheets API, GViz se consulta por `gid` tomado de un
  inventario source-safe verificado mediante Drive/Sheets metadata. Así se
  evita que Google devuelva silenciosamente la primera hoja para un nombre de
  tab inexistente. El inventario contiene solo títulos/gids, nunca filas o PII.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const originalFetch=globalThis.fetch;
const inventoryFile=path.resolve('backend/contracts/tya-hr-tab-inventory-r20-v1.json');

if(!process.env.FIREBASE_SERVICE_ACCOUNT_JSON){
  if(!fs.existsSync(inventoryFile))throw new Error(`R20 tab inventory missing: ${inventoryFile}`);
  const inventory=JSON.parse(fs.readFileSync(inventoryFile,'utf8'));
  if(inventory.contractId!=='tya-hr-tab-inventory-r20-v1'||!Array.isArray(inventory.tabs)||!inventory.tabs.length){
    throw new Error('R20 tab inventory identity/content mismatch.');
  }
  const tabByTitle=new Map(inventory.tabs.map(tab=>[String(tab.title||'').trim(),tab]));

  globalThis.fetch=async (input,init)=>{
    const target=typeof input==='string'?input:input?.url;
    try{
      const parsed=new URL(target);
      if(parsed.pathname.includes('/gviz/tq')){
        const requested=String(parsed.searchParams.get('sheet')||'').trim();
        const tab=tabByTitle.get(requested);
        if(!tab){
          return new Response('sheet_not_in_verified_inventory',{status:404,headers:{'content-type':'text/plain'}});
        }
        parsed.searchParams.delete('sheet');
        parsed.searchParams.set('gid',String(tab.gid));
        return originalFetch(parsed.toString(),init);
      }
    }catch{}
    return originalFetch(input,init);
  };
}

try{
  await import('./tya-build-live-hr-source-safe-r20.mjs');
}finally{
  globalThis.fetch=originalFetch;
}
