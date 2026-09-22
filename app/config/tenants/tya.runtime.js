/* CXOrbia PRE-I4 · public tenant runtime projection.
   This is tenant configuration, not module logic. The logo is the official T&A Consultores asset.
   Browser-local storage is not authoritative for tenant identity. */
window.CX_TENANT_RUNTIME_CONFIG = Object.freeze({
  schemaVersion:'cxorbia.tenant-runtime-config.v1',
  tenantId:'tya',
  tenantName:'T&A Consultores',
  countries:Object.freeze(['GT','HN']),
  activeProjectIds:Object.freeze(['cinepolis']),
  defaultProjectId:'cinepolis',
  sourceAuthority:'tenant_runtime_config',
  localStorageTruth:false,
  branding:Object.freeze({
    displayName:'T&A Consultores',
    clientTag:'Consultora · Field Operations',
    logoUrl:'https://tyaconsultores.com/wp-content/uploads/2023/05/logo.png',
    logoSourceRef:'https://tyaconsultores.com/',
    logoAuthority:'tenant_runtime_config',
    theme:'corporate_light'
  })
});
