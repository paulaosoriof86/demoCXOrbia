#!/usr/bin/env node
/*
  Entrada de compatibilidad R15G.

  La implementación vigente vive en `tya-build-live-hr-source-safe-r20.mjs`.
  Cuando no existe credencial de Sheets API, este wrapper usa el XLSX público
  únicamente para descubrir nombres reales de tabs —nunca para leer sus filas—
  y bloquea el comportamiento de GViz que devuelve silenciosamente otra hoja
  cuando se consulta un nombre inexistente.
*/
import crypto from 'node:crypto';
import process from 'node:process';
import {
  unzipXlsx,
  sharedStrings,
  workbookSheets
} from './tya-hr-source-xlsx-lite.mjs';

const originalFetch=globalThis.fetch;
const spreadsheetId=process.env.CXORBIA_HR_LIVE_SHEET_ID||'1h307t37LxM1nZNh_9Odt6wHUQhROG6cYbsbMKr48vU4';
let validTabNames=null;

if(!process.env.FIREBASE_SERVICE_ACCOUNT_JSON){
  const nonce=`${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  const url=`https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx&_cxmeta=${nonce}`;
  const response=await originalFetch(url,{redirect:'follow',headers:{'Cache-Control':'no-cache, no-store, max-age=0','Pragma':'no-cache','Expires':'0'}});
  const buffer=Buffer.from(await response.arrayBuffer());
  if(!response.ok||buffer.length<4||buffer[0]!==0x50||buffer[1]!==0x4b){
    throw new Error(`R20 tab inventory HOLD: XLSX metadata unavailable HTTP ${response.status}`);
  }
  const files=unzipXlsx(buffer);
  sharedStrings(files); // valida estructura compartida aunque no se lean filas.
  validTabNames=new Set(workbookSheets(files).map(sheet=>String(sheet.name||'').trim()));
  if(!validTabNames.size)throw new Error('R20 tab inventory HOLD: workbook has no sheets.');

  globalThis.fetch=async (input,init)=>{
    const target=typeof input==='string'?input:input?.url;
    try{
      const parsed=new URL(target);
      if(parsed.pathname.includes('/gviz/tq')){
        const requested=String(parsed.searchParams.get('sheet')||'').trim();
        if(!validTabNames.has(requested)){
          return new Response('sheet_not_in_workbook_inventory',{status:404,headers:{'content-type':'text/plain'}});
        }
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
