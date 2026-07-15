/* ============================================================
   CXOrbia Ã‚Â· Source lock / BUILD_ID ÃƒÂºnico Ã¢â‚¬â€ correcciÃƒÂ³n V131
   (paquete exclusivo V114Ã¢â€ â€™V131, 20260714 Ã¢â‚¬â€ cierre total de la lista
   priorizada del gate V121: Importador + Dashboard).

   Manifest ÃƒÂºnico vigente: docs/MANIFEST-V131.json.
   Los 3 contratos aditivos (ctx, sourceContract, visitContract) tienen
   consumidores reales probados en runtime en todos los mÃƒÂ³dulos
   identificados por el gate V121. Ver docs/REPORTE-CORRECCION-V131.md.
   ============================================================ */
var CX_SOURCE_LOCK = {
  manifestFile: 'docs/MANIFEST-V131.json',
  aggregateSha256: '5c478297550dde19bfc85b3e7ea9e12c7300a6245bcf3869949f0047fb19d4e0',
  fileCount: 180,
  generatedAt: '2026-07-14',
  previousManifest: 'docs/MANIFEST-V130.json (retirado del conjunto vigente)',
  note: 'BUILD_ID = primeros 16 hex del aggregateSha256 de docs/MANIFEST-V131.json, calculado sobre el contenido real de app/. Excluye core/build-lock.js, docs/verify-manifest.mjs y el propio MANIFEST-V131.json. Verificable con docs/verify-manifest.mjs.',
};
var CX_BUILD_ID = CX_SOURCE_LOCK.aggregateSha256.slice(0,16);
if (typeof window !== 'undefined') {
  window.CX = window.CX || {};
  window.CX.BUILD_ID = CX_BUILD_ID;
  window.CX.SOURCE_LOCK = CX_SOURCE_LOCK;
}
