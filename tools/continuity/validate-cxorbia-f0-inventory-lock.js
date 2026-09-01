#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..','..');
const fail=m=>{console.error(`F0_INVENTORY_LOCK_BLOCKED: ${m}`);process.exit(2);};
let lock;try{lock=JSON.parse(fs.readFileSync(path.join(root,'app/docs/evidence/RC15-F0-INVENTORY-LOCK-LATEST.json'),'utf8'));}catch(e){fail(`lock_read:${e.message}`);}
if(lock.status!=='LOCKED_FOR_M2'||lock.masterPlanId!=='CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1')fail('lock_identity');
const source=lock.sourceSnapshot||{};
const git=(args)=>{const r=cp.spawnSync('git',args,{cwd:root,encoding:'utf8'});if(r.status!==0)fail(`git:${args.join(' ')}:${(r.stderr||'').trim()}`);return (r.stdout||'').trim();};
if(git(['show','-s','--format=%T',source.head])!==source.tree)fail('source_head_tree_drift');
const roots=lock.roots||[], excluded=new Set(lock.governanceExclusions||[]);
const entries=(ref)=>{const out=git(['ls-tree','-r',ref,'--',...roots]);return out.split(/\r?\n/).filter(Boolean).filter(line=>{const tab=line.indexOf('\t');if(tab<0)return true;return !excluded.has(line.slice(tab+1));}).sort();};
const a=entries(source.head),b=entries('HEAD');
if(a.length!==b.length)fail(`inventory_count_drift:${a.length}:${b.length}`);
for(let i=0;i<a.length;i++)if(a[i]!==b[i])fail(`inventory_content_or_membership_drift:${a[i]}::${b[i]}`);
if(lock.progressAtLock?.classifiedFindings!==142||lock.progressAtLock?.currentResidualHolds!==30)fail('progress_lock_drift');
console.log('F0_INVENTORY_LOCK_PASS');
console.log(`sourceHead=${source.head}`);
console.log(`sourceTree=${source.tree}`);
console.log(`lockedEntries=${a.length}`);
console.log('next=M2_FINITE_F0_CLOSURE');
