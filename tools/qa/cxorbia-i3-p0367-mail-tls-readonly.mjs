import fs from 'node:fs';
import {probeMailTls} from '../../backend/runtime/hr-live-service/mailbox-pop3.mjs';
const policy=JSON.parse(fs.readFileSync(new URL('../../backend/config/mailbox-provider-policy.source-safe.json',import.meta.url),'utf8'));
const tenantId=process.env.CXORBIA_MAIL_PROBE_TENANT||'tya';
const providers=policy.tenants[tenantId]?.providers||[];
if(providers.length!==1)throw Error('MAIL_PROBE_EXACT_PROVIDER_REQUIRED');
const provider=providers[0];
const targets=[{host:provider.host,port:provider.port,protocol:'pop3'},{host:provider.smtpHost,port:provider.smtpPort,protocol:'smtp'}];
const results=[];
for(const target of targets){try{results.push({ok:true,...await probeMailTls(target)});}catch(error){results.push({...target,ok:false,error:/^MAIL_[A-Z_]+$/.test(error.code||'')?error.code:'MAIL_PROBE_FAILED',credentialCommands:0,messageReads:0,sendAttempts:0,deletionCommands:0});}}
const result={schemaVersion:1,owner:'P0367',scope:'STRICT_TLS_GREETING_ONLY_NO_CREDENTIALS',observedAt:new Date().toISOString(),pass:results.every(row=>row.ok&&row.certificateVerified&&row.implicitTls&&row.greetingAccepted),results,credentialCommands:0,messageReads:0,providerMutations:0,sends:0,deletes:0,mailboxConnected:false,domainClosure:false};
const output=process.env.CXORBIA_MAIL_TLS_PROBE_OUT;
if(output)fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n',{mode:0o600});
process.stdout.write(JSON.stringify(result)+'\n');
if(!result.pass)process.exitCode=2;
