/* ============================================================
   CXOrbia · Source lock / BUILD_ID único — corrección V113
   (paquete exclusivo V112→V113, 20260714 — cierre real de las 2 tareas P0).

   V113 corrige, sobre V112, las 2 tareas señaladas por auditoría independiente
   en PAQUETE-CLAUDE-CXORBIA-V112-A-V113-FASTLANE-FAIL-CLOSED-20260714:

   TAREA 1 — Proyecto/periodo, corrección real (V112 seguía teniendo
   currentProjectId como getter derivado del periodo, project()===period(), y
   DOS definiciones de setProgram() donde la segunda pisaba la primera).
   Ahora: currentProjectId y currentPeriodId son dos campos de almacenamiento
   reales; project() devuelve un objeto con id=currentProjectId (programKey
   real) + activePeriodId, distinto de period() (entrada cruda del periodo);
   una sola definición de setCurrentProject()/setCurrentPeriod()/alias de
   programa; periodSel usa exclusivamente setCurrentPeriod() (valida
   pertenencia al proyecto activo); projSel usa setCurrentProject()/alias.

   Efecto de segundo orden corregido (no listado explícitamente por la
   auditoría, pero requerido para no romper el resto de la plataforma): ~30
   archivos leían data.project().id esperando el id del PERIODO (para filtrar
   visitas/postulaciones/documentos/HR/liquidaciones/Academia/permisos) — se
   migraron a data.period() (mismo contenido, id de periodo correcto).
   project() queda reservado para lo que de verdad es proyecto/programa.

   TAREA 2 — Manifest regenerado desde el contenido FINAL (después de la
   Tarea 1 y su efecto de segundo orden), 0 diferencias.

   Manifest único vigente: docs/MANIFEST-V113.json (V100–V112 quedan retirados
   del conjunto vigente — el historial narrativo permanece en
   docs/REPORTE-CORRECCION-V*.md, sin tocar).
   ============================================================ */
var CX_SOURCE_LOCK = {
  manifestFile: 'docs/MANIFEST-V113.json',
  aggregateSha256: '924c02a262fe72ff29b1bdac30a4744b70a11fad157dc597cb6e4d2c7e10f4b1',
  fileCount: 145,
  generatedAt: '2026-07-14',
  previousManifest: 'docs/MANIFEST-V112.json (manifest V112 retirado del conjunto vigente)',
  note: 'BUILD_ID = primeros 16 hex del aggregateSha256 de docs/MANIFEST-V113.json, calculado sobre el contenido real de app/ en esta entrega (145 archivos). Excluye core/build-lock.js, docs/verify-manifest.mjs y el propio MANIFEST-V113.json (referencia circular). Verificable ejecutando docs/verify-manifest.mjs.',
};
var CX_BUILD_ID = CX_SOURCE_LOCK.aggregateSha256.slice(0,16);

if (typeof window !== 'undefined') {
  window.CX = window.CX || {};
  window.CX.BUILD_ID = CX_BUILD_ID;
  window.CX.SOURCE_LOCK = CX_SOURCE_LOCK;
}
