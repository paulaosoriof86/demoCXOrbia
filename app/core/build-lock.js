/* ============================================================
   CXOrbia · Source lock / BUILD_ID único — corrección V110
   (paquete exclusivo V109→V110, 20260712).

   V110 corrige, sobre V109, los 2 P0 comprobados en
   02-EVIDENCIA-TECNICA-MINIMA-V109.md:

   P0 1 — Academia: CX.acadData.ctx() (V109) caía a
   project.countries cuando un shopper real no traía scopePaises
   (campo de invitados/roles de prueba, no de shoppers). En un
   proyecto GT/HN eso le daba a un shopper GT acceso equivalente a
   [GT,HN], viendo contenido HN fuera de su alcance. Ahora, para
   rol==='shopper', el país de acceso se resuelve SIEMPRE desde
   CX.data.getShopper(shopperId).pais — nunca project.countries; si
   no se puede resolver, paises=[] (fail-closed: contenido restringido
   por país no se confirma visible, contenido global sigue visible).

   P0 2 — Finanzas: payVisits() (V109) ya agrupaba homogéneamente por
   país/moneda (sin mezclar monedas), pero seguía PROCESANDO cualquier
   id recibido: visitas sin país/moneda, con monto NaN/Infinity/negativo
   o con id inexistente igual cambiaban a 'liquidada', recibían loteId
   y generaban movimiento 'Pagado' antes de que la vista pudiera avisar
   nada. Ahora cada id se valida ANTES de tocar cualquier estado (id
   presente, visita existente, proyecto coincidente, país presente,
   moneda presente, monto finito y no negativo); los inválidos van a
   reviewRequired sin cambiar estado, sin loteId/fecha y sin movimiento.
   Bug encontrado y corregido en esta misma ronda: (v.honorario||0)
   convertía NaN en 0 (NaN es falsy) — corregido validando
   Number.isFinite por componente antes de sumar.

   Manifest único vigente: docs/MANIFEST-V110.json (V100–V109 quedan
   retirados del conjunto vigente — el historial narrativo permanece
   en docs/REPORTE-CORRECCION-V*.md, sin tocar).
   ============================================================ */
var CX_SOURCE_LOCK = {
  manifestFile: 'docs/MANIFEST-V110.json',
  aggregateSha256: '8ccd1fc0b72b03f4119f949dac322a63db277bbd1770d86212df1b0f311962d0',
  fileCount: 138,
  generatedAt: '2026-07-12',
  previousManifest: 'docs/REPORTE-CORRECCION-V109.md (manifest V109 retirado del conjunto vigente)',
  note: 'BUILD_ID = primeros 16 hex del aggregateSha256 de docs/MANIFEST-V110.json, calculado sobre el contenido real de app/ en esta entrega (138 archivos). Excluye core/build-lock.js, docs/verify-manifest.mjs y el propio MANIFEST-V110.json (referencia circular) — ver exclusionesDeclaradas dentro del manifest. Verificable ejecutando docs/verify-manifest.mjs.',
};
var CX_BUILD_ID = CX_SOURCE_LOCK.aggregateSha256.slice(0,16);

if (typeof window !== 'undefined') {
  window.CX = window.CX || {};
  window.CX.BUILD_ID = CX_BUILD_ID;
  window.CX.SOURCE_LOCK = CX_SOURCE_LOCK;
}
