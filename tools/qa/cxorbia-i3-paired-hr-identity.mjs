import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

export async function pairedHrHeaders(runId,probe,env=process.env){
  if(!/^[A-Za-z0-9_-]{1,100}$/.test(runId||'')||
    !['seal-meta','seal-json','canonical-before','canonical-json','canonical-after'].includes(probe)||
    env.HOSTING_URL!=='https://cxorbia-backend-dev.web.app'||
    runId!==(env.CXORBIA_PAIRED_BUILD_ID||env.GITHUB_RUN_ID)||
    Boolean(env.CXORBIA_PAIRED_BUILD_ID)===Boolean(env.GITHUB_RUN_ID))throw Error('AUTH_FAILURE:PAIRED_HR_EXECUTOR');
  const audience=env.HOSTING_URL+'/qa/hr/'+runId+'/'+probe;
  const usable=token=>{
    if(typeof token!=='string'||token.length>8192||!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))return false;
    try{
      const c=JSON.parse(Buffer.from(token.split('.')[1],'base64url'));
      return c.aud===audience&&c.email_verified===true&&typeof c.email==='string'&&c.sub&&c.exp>Date.now()/1000+30;
    }catch{return false;}
  };
  // This local check prevents a partial release. The service independently
  // validates Google's signature, issuer, audience, expiry and the budget grant.
  let token;
  try{token=execFileSync('gcloud',['auth','print-identity-token','--audiences='+audience],
    {encoding:'utf8',stdio:['ignore','pipe','ignore'],timeout:15000}).trim();}catch{}
  if(!usable(token)&&env.CXORBIA_PAIRED_BUILD_ID){
    const endpoint=new URL('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity');
    endpoint.searchParams.set('audience',audience);endpoint.searchParams.set('format','full');
    const r=await fetch(endpoint,{headers:{'Metadata-Flavor':'Google'},redirect:'error',signal:AbortSignal.timeout(5000)});
    if(r.ok&&r.headers.get('Metadata-Flavor')==='Google')token=(await r.text()).trim();
  }
  if(!usable(token))throw Error('AUTH_FAILURE:PAIRED_HR_IDENTITY');
  return {'x-cxorbia-probe':probe,'x-cxorbia-run':runId,'x-cxorbia-run-identity':token};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  // The owning shell redirects stdout to a mode-0600 ephemeral curl header file.
  if(process.stdout.isTTY)throw Error('AUTH_FAILURE:PAIRED_HR_PRIVATE_PIPE_REQUIRED');
  if(process.argv[2]==='--preflight'){
    for(const probe of ['seal-meta','seal-json','canonical-before','canonical-json','canonical-after'])
      await pairedHrHeaders(process.argv[3],probe);
    process.exit(0);
  }
  const headers=await pairedHrHeaders(...process.argv.slice(2));
  for(const [name,value] of Object.entries(headers))process.stdout.write(name+': '+value+'\n');
}
