import {execFileSync} from 'node:child_process';

const source=process.argv[2];
if(!/^[0-9a-f]{40}$/.test(source||''))throw new Error('SOURCE_SHA_REQUIRED');
const show=path=>execFileSync('git',['show',source+':'+path],{encoding:'utf8'});
const assert=(ok,code)=>{if(!ok)throw new Error('SOURCE_FAILURE:'+code);};

const admin=show('app/modules/administrabilidad.js');
const brand=show('app/modules/marca.js');
const config=show('app/modules/configuracion.js');

const adminGate=admin.indexOf("if(connectedTenantAuthority()){");
const adminReturn=admin.indexOf('return host;',adminGate);
const adminLocal=admin.indexOf('localStorage');
assert(adminGate>=0&&adminReturn>adminGate,'VRM194_ADMIN_CONNECTED_GATE_MISSING');
assert(adminLocal<0||adminReturn<adminLocal,'VRM194_ADMIN_LOCAL_AUTHORITY_PRECEDES_FAIL_CLOSED_RETURN');
assert(admin.includes("data-connected-admin-readonly=\"true\""),'VRM194_ADMIN_READONLY_MARKER_MISSING');

const brandGate=brand.indexOf("if(connectedTenantAuthority()){");
const brandReturn=brand.indexOf('return host;',brandGate);
const brandLocal=brand.indexOf('localStorage');
assert(brandGate>=0&&brandReturn>brandGate,'VRM194_BRAND_CONNECTED_GATE_MISSING');
assert(brandLocal<0||brandReturn<brandLocal,'VRM194_BRAND_LOCAL_AUTHORITY_PRECEDES_FAIL_CLOSED_RETURN');
assert(brand.includes("data-connected-brand-readonly=\"true\""),'VRM194_BRAND_READONLY_MARKER_MISSING');

assert(config.includes("if(connected){body.innerHTML='<div class=\"card card-p\" data-config-locked=\"tenant-brand\""),'VRM194_CONFIG_BRAND_LOCK_MISSING');
assert(config.includes("if(connected){body.innerHTML='<div class=\"card card-p\" data-config-locked=\"plan\""),'VRM194_CONFIG_PLAN_LOCK_MISSING');
assert(config.includes("if(connected){body.innerHTML='<div class=\"card card-p\" data-config-locked=\"nda\""),'VRM194_CONFIG_NDA_LOCK_MISSING');

process.stdout.write(JSON.stringify({
  decision:'PASS_VRM194_CONNECTED_TENANT_ADMIN_SOURCE_GATE',
  sourceSha:source,
  connectedAdminLocalTruth:false,
  connectedBrandLocalTruth:false,
  connectedConfigLocked:true,
  durableMutationFabricated:false,
  production:false
})+'\n');
