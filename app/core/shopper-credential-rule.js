/* CXOrbia — canonical Shopper credential rule v2.
   Single implementation shared by browser and Node provider.
   Contract:
   - username = first name + "." + first surname, lowercase, accents removed;
   - password = first name, accents removed, initial uppercase + "123*";
   - no secret persistence is performed by this module.
*/
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.CX_SHOPPER_CREDENTIAL_RULE=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const CREDENTIAL_RULE_VERSION='tya-shopper-primer-nombre-primer-apellido-v2';
  const DURABLE_CREDENTIAL_SWEEP_VERSION='cxorbia-durable-shopper-credential-sweep-v2';
  const CREDENTIAL_PASSWORD_PROOF_VERSION='cxorbia-shopper-password-proof-v2';
  const str=v=>String(v==null?'':v).trim();
  const arr=v=>Array.isArray(v)?v:[];
  const stripMarks=value=>str(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const loginPart=value=>stripMarks(value).toLowerCase().replace(/[^a-z0-9]+/g,'');
  const properFirst=value=>{const first=str(value).split(/\s+/).filter(Boolean)[0]||'';return first?first.charAt(0).toLocaleUpperCase('es-GT')+first.slice(1).toLocaleLowerCase('es-GT'):'';};
  const SURNAME_ARTICLES=new Set(['la','las','los']);
  const firstSurnameFromTokens=tokens=>{
    const xs=arr(tokens).map(str).filter(Boolean);if(!xs.length)return'';
    const first=stripMarks(xs[0]).toLowerCase();
    if(first==='de'){
      const second=stripMarks(xs[1]).toLowerCase();
      if(SURNAME_ARTICLES.has(second)&&xs[2])return xs.slice(0,3).join(' ');
      if(xs[1])return xs.slice(0,2).join(' ');
    }
    if(first==='del'&&xs[1])return xs.slice(0,2).join(' ');
    return xs[0];
  };
  const sameText=(a,b)=>stripMarks(a).toLowerCase().replace(/\s+/g,' ')===stripMarks(b).toLowerCase().replace(/\s+/g,' ');
  function shopperCredentialRule(profile={}){
    const full=str(profile.nombre||profile.name||profile.displayName||profile.fullName),tokens=full.split(/\s+/).filter(Boolean);
    const firstSource=str(profile.firstName||tokens[0]),first=str(firstSource).split(/\s+/).filter(Boolean)[0]||'';
    const explicitLast=str(profile.firstSurname||profile.primerApellido||profile.lastName||profile.apellido);
    const legacyRemainder=tokens.slice(1).join(' ');
    let last='';
    if(explicitLast&&!sameText(explicitLast,legacyRemainder))last=firstSurnameFromTokens(explicitLast.split(/\s+/));
    else{
      const start=tokens.length>=4?2:1;
      last=firstSurnameFromTokens(tokens.slice(start));
    }
    const firstLogin=loginPart(first),lastLogin=loginPart(last),passwordFirst=properFirst(stripMarks(first));
    if(!firstLogin||!lastLogin||!passwordFirst)return {ok:false,reason:'SHOPPER_CREDENTIAL_NAME_INCOMPLETE',login:null,password:null,ruleVersion:CREDENTIAL_RULE_VERSION};
    return {ok:true,login:firstLogin+'.'+lastLogin,password:passwordFirst+'123*',firstName:properFirst(first),lastName:last,firstSurname:last,ruleVersion:CREDENTIAL_RULE_VERSION};
  }
  return Object.freeze({CREDENTIAL_RULE_VERSION,DURABLE_CREDENTIAL_SWEEP_VERSION,CREDENTIAL_PASSWORD_PROOF_VERSION,shopperCredentialRule});
});
