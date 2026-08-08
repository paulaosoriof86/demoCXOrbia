# Reporte de corrección — V110
Fecha: 2026-07-12 · Base: V109 (bloqueada para empalme por 2 P0 comprobados) · Entrega: V110

Este reporte cubre EXCLUSIVAMENTE el alcance de
`00-INSTRUCCION-UNICA-CLAUDE-V109-A-V110.md`: los dos P0 comprobados en
`02-EVIDENCIA-TECNICA-MINIMA-V109.md`. No se reconstruyó el prototipo, no se volvió a
una versión anterior a V109 y no se amplió el alcance. Se preservó todo lo cerrado en
V109 (Portal Cliente con `Number.isFinite`, umbral crítico unificado, lotes completos
separados por país/moneda, IDs determinísticos, responsive móvil, Beneficios sin
fallback, certificaciones con copy honesto, cache demo/real, manifest/verificador,
shell y navegación).

## P0 1 — Academia: shopper solo ve contenido de su país real

**Causa raíz confirmada:** `CX.acadData.ctx()` (V109) usaba
`u.scopePaises` si existía, y si no caía a `project.countries` — TODOS los países del
proyecto activo. En un proyecto GT/HN, un shopper real (sin `scopePaises`, que es un
campo de usuarios invitados/roles de prueba, no de shoppers) recibía
`paises:['GT','HN']` y podía ver contenido restringido a HN aunque él fuera de GT. La
prueba "multipaís" de V109 validó que el PROYECTO no rompía el filtro, pero nunca
validó el país REAL de un shopper individual dentro de ese proyecto — ese fue el hueco.

**Corrección — `modules/academia.js`, `CX.acadData.ctx()`:**
- Para `rol==='shopper'`: se resuelve `shopperId` desde la sesión y se busca el
  shopper en la fuente canónica (`CX.data.getShopper(shopperId)`); `paises` se fija a
  `[shopper.pais]` — el país REAL del shopper, nunca `project.countries`.
- Si el shopper no puede resolverse (id inválido/ausente) o no tiene país registrado,
  `paises=[]` — fail-closed: un curso restringido por país queda sin confirmar
  (`axisOkMulti` trata lista vacía como "sin país conocido" → no visible), pero
  contenido GLOBAL (sin restricción de país en su `scope`) sigue visible sin cambios.
- `scopePaises` se preserva SOLO para invitados/roles de prueba no-shopper (p.ej. un
  revisor multipaís simulado desde Configuración → Usuarios) — no se usa para
  resolver el país de un shopper real.
- `project.countries` como fallback general se conserva únicamente para roles no
  shopper sin `scopePaises` (admin/otros viendo catálogo general) — el bug estaba
  específicamente en aplicarlo a shoppers reales.
- Sin cambios en `visibleFor()`/KPIs: al seguir alimentándose de `ctx().paises`, la
  corrección se propaga automáticamente a KPIs, lecciones, avance, categorías y
  certificados — un curso oculto por país sigue sin afectarlos (mismo mecanismo de
  V109, ya verificado).

**Pruebas ejecutadas (runtime real, no solo lectura de código):**
1. Shopper GT real (`CX.data.getShopper` con `pais:'GT'`) → `ctx().paises=['GT']` →
   ve curso `scope.pais:['GT']`, NO ve curso `scope.pais:['HN']`.
2. Shopper HN real → `ctx().paises=['HN']` → ve curso HN, NO ve curso GT (simétrico).
3. Shopper con `shopperId` no resoluble → `ctx().paises=[]` → NO ve ningún curso
   restringido por país.
4. Curso sin restricción de país (`scope:{}`) → visible para el shopper sin país
   resoluble Y para el shopper GT (contenido global no se ve afectado).
5. `admin`/`super` con `canManageTop` sigue viendo el catálogo completo (mecanismo
   `visibleCourses = canManageTop ? courses : courses.filter(...)`, sin cambios).
6. 0 errores de consola durante las pruebas anteriores.

Resultado exacto de la corrida (misma sesión, sin reload entre pasos):
`shGTpais:"GT"`, `shHNpais:"HN"`, `ctxGT.paises:["GT"]`, `ctxHN.paises:["HN"]`,
`ctxNoPais.paises:[]`, `gtSeesGT:true`, `gtSeesHN:false`, `hnSeesHN:true`,
`hnSeesGT:false`, `noPaisSeesGT:false`, `noPaisSeesGlobal:true`, `gtSeesGlobal:true`.

## P0 2 — Finanzas: datos incompletos no se liquidan ni pagan

**Causa raíz confirmada:** `payVisits()` (V109) agrupaba homogéneamente por
país/moneda (usando `'—'` como marcador cuando faltaban) y por eso YA NO sumaba
monedas distintas entre sí — pero seguía **procesando** cualquier id recibido:
cambiaba `estado` a `liquidada`, asignaba `loteId`/fecha y creaba un movimiento
`Pagado`, incluso para visitas sin país, sin moneda, con monto `NaN`/negativo o con id
inexistente. La vista mostraba después "Revisión requerida" para esos grupos, pero el
daño de estado ya había ocurrido antes de que la UI pudiera advertir nada.

**Corrección — `core/data.js`, `payVisits(ids, fechaPago, referencia)`:**
Antes de agrupar o tocar cualquier estado, cada id se valida por separado:
- id presente (no vacío/null) → si no, `reviewRequired` con motivo `"ID de visita
  ausente"`;
- visita existente en `_visitas` → si no, `"Visita no encontrada"`;
- `projectId` presente y coincidente con `currentProjectId` → si no, `"Proyecto
  ausente o no coincide con el periodo activo"`;
- país presente → si no, `"País ausente"`;
- moneda presente → si no, `"Moneda ausente"`;
- cada componente de monto (`honorario`/`boleto`/`comboAmt`) que esté presente debe
  ser **finito** (`Number.isFinite`) — si alguno es `NaN`/`Infinity`, `"Monto total no
  finito (NaN/Infinity)"`;
- el monto total (solo de componentes finitos) debe ser `>=0` → si no, `"Monto total
  negativo"`.

Los registros que fallan cualquier validación van a `reviewRequired` (con `id` y
`motivo`) y **nunca** entran a `visitasValidas`: no cambian de estado, no reciben
`loteId`/fecha, no generan movimiento (`CX.finStore.addMov`) ni automatización
(`CX.automations.fire('pago', …)`), y no se suman a `porPais`/`detalle`. Solo los
registros válidos siguen el flujo de agrupación homogénea + ID determinístico de
V109, sin cambios de fondo ahí. `payVisits()` ahora devuelve también
`reviewRequired` en su resultado.

**Corrección de UI — `modules/finanzas.js` (2 sitios que llaman a `payVisits`):**
El toast ya no asume que todo lo enviado se pagó: si `r.reviewRequired.length`, se
añade un segmento explícito ("N en revisión requerida (dato incompleto, no
pagada(s))") y el toast cambia a tono `warn` — nunca se presenta una revisión
pendiente como pago ejecutado.

**Bug encontrado y corregido durante la propia verificación de este P0:** la primera
versión de la validación de monto usaba `(v.honorario||0)+(v.boleto||0)+(v.comboAmt||0)`
— pero `NaN||0` se evalúa a `0` en JS (NaN es falsy), así que un monto `NaN` se
"lavaba" a `0` (finito, válido) y se colaba como pagado, justo el defecto que este P0
pedía cerrar. Se corrigió validando cada componente con `Number.isFinite` ANTES de
sumar (no después), y se re-ejecutaron todas las pruebas para confirmar el cierre real.

**Pruebas ejecutadas (runtime real):** batch mixto de 10 ids en una sola llamada a
`payVisits()`: sin país, sin moneda, sin ambos, monto `NaN`, monto `Infinity`, monto
negativo, id inexistente, id `null`, más 1 visita GT/GTQ válida y 1 HN/HNL válida.
Resultado real: `pagadas:2` (solo las 2 válidas), `reviewRequired` con 8 entradas y
motivo correcto en cada una, los 6 registros inválidos con datos permanecen en estado
`cuestionario` (sin `loteId`), `movDelta:2` (solo 2 movimientos nuevos, ninguno para
los inválidos). Determinismo re-confirmado sobre el mismo par GT/HN tras resetear su
estado y volver a pagar: mismo `loteId` en ambas corridas. GT y HN no comparten lote
(`sameLoteMixed:false`).

## Evidencia y versionado V110

- `core/build-lock.js` → V110, aggregate y fileCount recalculados sobre el contenido
  real de esta entrega.
- `docs/MANIFEST-V110.json` → hashes SHA-256 reales de cada archivo declarado.
- `docs/verify-manifest.mjs` → apunta a `MANIFEST-V110.json`.
- `docs/smoke-v110/SMOKE-CRITICOS-V110.json` → resultado de las pruebas reales de
  ambos P0 + runtime de los 48 módulos en Admin/Cliente/Shopper.

**Prueba ejecutada:** navegación real (`CX.app.selectRole(role)` + `CX.router.nav(id)`)
por los 48 módulos registrados en `CX.modules`, para Admin, Cliente y Shopper — 0
errores de navegación, 0 errores de consola (`window.onerror`) en los 3 roles.

**Limitación honesta sobre `verify-manifest.mjs` (igual que V109, sin cambios):** ese
script está escrito para Node (`node:fs/promises`, `node:crypto`) y este entorno de
trabajo no dispone de una terminal/runtime Node para invocarlo literalmente con
`node docs/verify-manifest.mjs`. Se ejecutó la MISMA lógica (SHA-256 por archivo +
agregado sobre `path:hash` ordenado) directamente sobre los archivos reales del
manifest, en varios lotes — 0 diffs, aggregate recalculado idéntico al declarado. La
ejecución literal del `.mjs` vía Node no se hizo en esta ronda; queda disponible para
que cualquiera con Node la corra como confirmación independiente adicional.

## Checklist — ver `docs/CHECKLIST-V110-COMPLETADO.md` (cada ítem PASS con referencia
a la evidencia de esta sección).

## Alcance — confirmado

No se tocó `/backend`, `/tools`, `/.github`, Firebase/Firestore/Auth real/Storage,
Make/Gemini, HR/migración, importadores, reglas/gates, deploy/producción, pagos
reales ni datos sensibles. Únicamente se modificaron: `modules/academia.js`
(`CX.acadData.ctx()`), `core/data.js` (`payVisits()`), `modules/finanzas.js` (2
toasts), más los artefactos de evidencia/versionado de esta sección.

## Pendientes honestos

- Ninguno dentro del alcance de los 2 P0 de esta ronda. Los pendientes ya
  documentados en V109 (evidencia visual en píxeles de viewports móviles, límite de
  herramienta) no cambian y no se reabrieron aquí.
