/* ============================================================
   CXOrbia · Source lock / BUILD_ID único — Bloque E (corrección V101,
   20260711: "source lock verificable, exclusiones declaradas
   correctamente, no usar nombre V100 para un source lock V101")

   Historial: el archivo anterior a esta corrección apuntaba a
   docs/MANIFEST-V100-CORRECCION.json (103 archivos) mientras el
   paquete V101 realmente tenía 118 — 15 archivos quedaban fuera sin
   que la nota lo dijera (solo mencionaba 2 exclusiones). Ese
   manifest V100 se conserva en el ZIP como evidencia histórica,
   pero YA NO es la fuente del BUILD_ID activo.

   Ahora: BUILD_ID es el SHA-256 (truncado a 16 hex) de
   docs/MANIFEST-V101-CORRECCION.json, generado sobre el contenido
   REAL de app/ en esta entrega (104 archivos fuente). Las
   exclusiones están listadas EXPLÍCITAMENTE dentro del propio
   manifest (`exclusionesDeclaradas`), con su razón cada una —
   nunca se afirma "cobertura total" sin decir qué quedó fuera.

   Excepción documentada (no oculta): `core/build-lock.js` y `sw.js`
   se excluyen del manifest que produce este BUILD_ID por la misma
   razón de siempre — un archivo que declara el sello de versión no
   puede incluirse en su propio hash sin crear una referencia
   circular. Esta es la misma convención que usan los pipelines de
   build reales para sus archivos de stamp/versión.

   Este BUILD_ID debe regenerarse (junto con el manifest) en cada
   entrega nueva.
   ============================================================ */
var CX_SOURCE_LOCK = {
  manifestFile: 'docs/MANIFEST-V101-CORRECCION.json',
  aggregateSha256: '20740dc2f921095c7f3bd5ef086c8876d36f5d3f7a1155d13c1e252530fc3461',
  fileCount: 104,
  generatedAt: '2026-07-11',
  previousManifest: 'docs/MANIFEST-V100-CORRECCION.json (histórico, conservado en el ZIP, ya no es la fuente del BUILD_ID activo)',
  note: 'BUILD_ID = primeros 16 hex del aggregateSha256 de docs/MANIFEST-V101-CORRECCION.json (regenerado tras cerrar 2 pendientes de Academia). Excluye core/build-lock.js y sw.js (referencia circular) y evidencia/artefactos generados después del hash (manifest propio, reporte, capturas de smoke) — ver "exclusionesDeclaradas" dentro del manifest para la lista completa y su razón. Verificable re-hasheando los 104 archivos listados.',
};
var CX_BUILD_ID = CX_SOURCE_LOCK.aggregateSha256.slice(0,16);

/* En el contexto de la app normal, expone también CX.BUILD_ID para que cualquier
   pantalla de diagnóstico pueda mostrarlo (p.ej. junto al indicador de modo de datos). */
if (typeof window !== 'undefined') {
  window.CX = window.CX || {};
  window.CX.BUILD_ID = CX_BUILD_ID;
  window.CX.SOURCE_LOCK = CX_SOURCE_LOCK;
}
