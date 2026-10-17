import fs from 'node:fs';
const input=process.env.D03_LOG_INPUT,output=process.env.D03_LOG_OUT;
if(!input||!output)throw Error('D03_LOG_PATH_REQUIRED');
const logs=JSON.parse(fs.readFileSync(input,'utf8'));
const rows=[];
for(const entry of Array.isArray(logs)?logs:[]){
 const source=[entry?.textPayload,entry?.jsonPayload?.message,entry?.jsonPayload?.log].filter(x=>typeof x==='string').join('\n');
 const marker='CXORBIA_CERT_VERTEX_SAFE_DIAGNOSTIC ';
 const at=source.indexOf(marker);if(at<0)continue;
 try{
  const raw=source.slice(at+marker.length).trim();
  const payload=JSON.parse(raw);
  rows.push({timestamp:String(entry.timestamp||''),providerStatus:Number(payload.httpStatus||0),code:String(payload.code||'').slice(0,80),attempt:Number(payload.attempt||0),finishReason:String(payload.finishReason||''),candidateCount:Number(payload.candidateCount||0),responseMimeType:String(payload.responseMimeType||''),transportMimeType:String(payload.transportMimeType||''),textChars:Number(payload.textChars||0),outputTokens:payload.outputTokens??null,groundingTextLogged:false});
 }catch(_){}
}
const result={schemaVersion:'cxorbia.i3.d03.safe-provider-diagnostic.v1',decision:rows.length?'PASS_D03_SAFE_PROVIDER_DIAGNOSTIC':'HOLD_D03_SAFE_PROVIDER_DIAGNOSTIC_UNAVAILABLE',classification:'PROVIDER_FAILURE',runNumber:1768,sourceSha:'a4434a1f223dd6da1468890c99db7339808c1cab',runtimeRevision:'cxorbia-live-hr-dev-00309-kvp',records:rows,readOnly:true,writes:0,deploys:0,production:false};
fs.mkdirSync(output.slice(0,output.lastIndexOf('/')),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
if(!rows.length)process.exitCode=2;
