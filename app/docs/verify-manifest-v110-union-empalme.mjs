#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const ROOT=process.cwd();const M=JSON.parse(await readFile(path.join(ROOT,'docs/MANIFEST-V110-UNION-EMPALME-R1.json'),'utf8'));const sha=b=>createHash('sha256').update(b).digest('hex');let diffs=0;const entries=[];for(const f of M.files){let b;try{b=await readFile(path.join(ROOT,f.path));}catch(e){console.error('DIFERENCIA faltante',f.path);diffs++;continue;}const h=sha(b);if(h!==f.sha256||b.length!==f.size){console.error('DIFERENCIA',f.path);diffs++;}entries.push(f.path+':'+h);}const agg=sha(Buffer.from(entries.join('\n'),'utf8'));if(agg!==M.aggregateSha256){console.error('DIFERENCIA aggregate',agg);diffs++;}console.log('Archivos verificados:',M.files.length);console.log('Aggregate recalculado:',agg);console.log(diffs?'Diferencias: '+diffs:'0 diferencias');process.exit(diffs?1:0);
