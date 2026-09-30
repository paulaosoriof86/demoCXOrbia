# Reporte de corrección V107 — CXOrbia (paquete post-V105/V106, 20260711)

**Baseline:** `app/` V106 (build previo, manifest V106 — retirado, ver abajo).
**Manifest único vigente:** `docs/MANIFEST-V107-CORRECCION.json` — 126 archivos, aggregate
`8c590c99c0966243f3b05b41a01df2a8f9376645fd16c4177553cd2f94eb67bd`, verificable con
`node docs/verify-manifest.mjs` (ejecutado desde dentro de `app/`).

Los manifests V100–V106 se retiraron del ZIP (superados) para mantener una única identidad de
build; el historial narrativo de cada ronda permanece en sus `REPORTE-CORRECCION-V*.md`.

## Hecho y verificado esta ronda

1. **Portal Cliente — sin síntesis fuera de demo.** `core/cliente-data.js`: `prev` (tendencia),
   `nps` y `responsable` de sucursal ya no se fabrican con ruido determinístico fuera de modo
   demo — antes se rellenaban incluso cuando el score era real. Ahora quedan `null`/`—` con
   badge "pendiente de fuente" (`cliente.js` actualizado para no imprimir `null` literal).
   `resumen()` ya no promedia NPS si alguna sucursal tiene `nps:null`.
2. **Cache por modo.** `sucursales()` ahora usa clave `proyecto::modo` — antes solo `proyecto`,
   así que alternar demo/real dentro de la misma sesión podía servir una lista calculada bajo el
   modo anterior.
3. **Lote de pago con id estable.** `modules/finanzas.js`: el id de lote real (`#LOTE-N`) ya no
   depende del índice de iteración — se deriva de un hash `proyecto+fecha`, estable aunque
   cambie el orden/cantidad de otros lotes en la misma vista.
4. **Beneficios exige shopper autenticado.** `modules/beneficios.js`: se retiró el fallback a
   `sh1` — sin `shopperId` real en la sesión, la vista muestra un estado vacío honesto en vez de
   heredar los beneficios de un shopper fijo.
5. **Permisos por acción — auditado end-to-end.** Se revisó cada call-site de
   `CX.permissions.gate/can` en `modules/` (finanzas, cert, diagnostico, automatizaciones,
   integraciones, postulaciones, dashboard, academia): todos ya pasan contexto real
   (`CX.permissions.ctx({...})` con projectId/pais/entityId según corresponda) — no quedó ningún
   `gate('acción', {}, ui)` con contexto vacío.
6. **Certificación — auditado end-to-end.** `modules/cert.js` ya exige un segundo actor
   (revisor) elegido de un roster real (no texto libre), distinto de quien generó el banco, y
   respeta el lifecycle `draft/pending_review → approved_preview → confirmed/published` —
   `pending_backend` no habilita el examen; la práctica en preview no dispara evento operativo.
   Documentado honestamente como simulación de segundo actor (sin sesiones concurrentes reales
   en este prototipo frontend).
7. **Academia — modelo de scope + revisión humana (contrato nuevo).**
   - `CX.acadData.addCourse` ahora registra `creador` (identidad de sesión) y acepta `scope`
     opcional: `{tenantId, projectId, pais, rol, modulo, paquete, nivel}` — cada eje es una lista;
     vacío/ausente = global para ese eje.
   - `CX.acadData.visibleFor(course, ctx)` filtra la lista de cursos por scope efectivo; quien
     tiene el permiso de gestión (`academy.edit`) sigue viendo todos los cursos para administrar.
   - Editor de alcance añadido al modal "Editar curso" (solo cursos personalizados) — campos de
     proyecto/país/rol/nivel/módulo/paquete.
   - `setCourseState` ahora exige, al pasar a `en_revision`, un **revisor** distinto del
     `creador`, y al pasar a `aprobado`, un **aprobador** distinto del creador y del revisor
     (separación de funciones). La UI pide la identidad desde un roster real (mismo patrón que
     certificación), nunca texto libre, y bloquea con motivo claro si no se cumple.
   - Verificado en vivo (creación de curso de prueba, transición a "en_revision" sin actor
     seleccionado → bloqueada con toast; con actor → transición correcta).

## Auditado, sin cambios de código (ya cumplía)

- Lifecycle de certificación y sus guards (`pending_backend`, práctica preview sin evento).
- Todos los call-sites de permisos con contexto (no se encontró ningún gate con `{}`).
- Histórico excluyendo periodo activo por defecto, fail-closed geo-sensible, Dashboard sin
  fabricar `% a tiempo/QA` fuera de demo, Historial de estados de visitas.

8. **Copy residual — re-certificación.** `modules/cert.js`: el modal de re-certificación afirmaba
   "Notificar por WhatsApp/correo (Make) y en su panel" con el checkbox marcado por defecto, y el
   toast final decía "· notificados" — ambos daban a entender un envío externo real. Corregido a
   "Notificar en su panel (in-app)" con nota explícita de que el envío real por WhatsApp/correo vía
   Make está pendiente de conexión backend por tenant; el toast ahora dice "notificado in-app
   (envío real por WhatsApp/correo pendiente de backend)". Auditado el resto de automatizaciones.js
   (webhook de Make, alertas de pendientes) — ya honesto, sin cambios.
9. **Estados UI del plan de materialización (R6) — auditado, ya honesto.** `modules/diagnostico.js`
   ("Diagnóstico & Readiness") ya representa el plan con estados `GO_READY`/`WARNING_READY`/
   `NO_GO_BLOCKER` por módulo y por dominio, contratos con gate `off`/`preview` (nunca "conectado"
   real), un GO/NO-GO explícito con Firestore/Auth real marcados `false`, y ningún botón que
   ejecute una acción real de backend — todo queda en preview. No se encontró contradicción ni
   botón activo indebido; no requirió cambios de código.

10. **Evidencia de smoke multi-viewport (360/390/412) — resuelto con proxy honesto.** Este entorno
    no permite redimensionar el viewport real ni capturar contenido de iframes anidados (limitación
    de herramienta, ya documentada). En vez de repetir el intento fallido o fabricar una captura
    falsa, se aplicó una prueba de proxy declarada: se inyectaron temporalmente las reglas CSS
    exactas de los breakpoints móviles de forma incondicional, se forzó html/body a 360/390/412px,
    y se midió `scrollWidth` real de cada elemento en 9 pantallas (incluyendo las 3 de shopper).
    Esto encontró y permitió corregir **dos causas raíz reales** de overflow horizontal:
    - `.card-h` (cabecera título + controles, ej. Cronograma de "Mi Día") sin `flex-wrap` —
      corregido en `styles/layout.css` dentro de `@media(max-width:480px)`.
    - Topbar (breadcrumb + badge "Demo · ✅ Listo" + 3 botones) sin límite de ancho — breadcrumb
      ahora trunca con ellipsis y el badge (redundante con el indicador del rail) se oculta en
      este rango. Corregido en el mismo breakpoint.
    Tras el fix: **0 elementos de página con overflow en 360/390/412px** en las 9 pantallas
    probadas, 0 errores de consola. El overflow contenido dentro de `table.tbl` (scroll horizontal
    intencional) se preservó sin cambios — nunca se usó `overflow-x:hidden` global. Evidencia
    completa en `docs/smoke-v107/SMOKE-MULTIVIEWPORT-PROXY-20260711.json`, con metodología,
    hallazgos y limitación declarada explícitamente (esta prueba no sustituye un dispositivo real).

## Pendiente honesto

Ninguno de los pendientes de la ronda anterior queda abierto. Recomendación: validar en un
dispositivo/navegador real (o BrowserStack/Chrome DevTools) antes de considerar el punto 360/390/412
100% concluyente — la prueba de proxy es sólida pero no reemplaza un viewport nativo.

Manifest V107 recalculado tras `styles/layout.css` + nueva evidencia — aggregate final:
`011dc6e780b6657b9f8f19b190160ab63d529ea0b6efd9e25d6e248a6389cadf` (127 archivos).
