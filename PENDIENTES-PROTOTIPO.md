# PENDIENTES-PROTOTIPO.md

Lista viva de pendientes detectados durante backend/migración. No modificar UI aquí; solo documentar para corrección posterior.

## 2026-06-27

### P0 — Separar prototipo comercializable y tenant T&A

- Estado: definido.
- Detalle: `demoCXOrbia` es el repo del prototipo modular aprobado y seguirá como plataforma comercializable. T&A será el primer tenant real.

### P0 — Confirmar base `main` antes de sincronizar PR #1

- Estado: dictamen técnico emitido; plan de sync preparado; pendiente confirmación visual/funcional.
- Acción sugerida: usar `PLAN-SINCRONIZACION-MAIN-PR1.md` y `CHECKLIST-POST-SYNC-PR1.md` solo después de confirmar la base.

### P1 — Validaciones locales combinadas

- Estado: resultado local recibido por captura; sin fallo visible.
- Detalle: `RESULTADO-VALIDACIONES-LOCALES-PAULA-20260628.md` documenta la salida visible: dry checks finalizados y validaciones locales finalizadas.
- Acción sugerida: conservar bloqueo de acciones reales hasta autorización del gate siguiente.

### P1 — Publicación reglas Firestore DEV

- Estado: completado en Firebase DEV.
- Detalle: `RESULTADO-PUBLICACION-REGLAS-DEV.md` documenta salida visible con `Deploy complete!` para `firebase.cmd deploy --only firestore:rules --project cxorbia-backend-dev`.
- Restricciones vigentes: no se creó Auth, no se asignaron claims, no se cargó seed, no se activó adapter, no se publicó Hosting y no se tocó producción.
- Acción sugerida: preparar el gate de usuarios DEV ficticios y claims, pero no ejecutarlo sin autorización separada de Paula.

### P1 — Advertencia reglas Firestore DEV

- Estado: detectada, no bloqueante.
- Detalle: Firebase reportó `[W] 51:14 - Unused function: canAccessProject.` durante la compilación de `firestore.rules`.
- Acción sugerida: revisar en fase de limpieza de reglas sin modificar permisos funcionales todavía.

### P1 — Archivos locales generados por emulador/validación

- Estado: pendiente de limpieza local.
- Detalle: PowerShell mostró `?? firebase/emulator-rules/node_modules/` y `?? firebase/emulator-rules/package-lock.json` después del deploy.
- Acción sugerida: no commitear esos archivos; limpiarlos o excluirlos localmente antes de nuevos commits desde PowerShell.

### P1 — Storage pendiente por Blaze

- Estado: pendiente.
- Acción sugerida: no conectar Storage viejo como backend vivo.

### P1 — Adapter Firestore para `CX.data`

- Estado: scaffold creado, desactivado.
- Detalle: `CX.BACKEND.enabled` sigue en `false`.
- Acción sugerida: activar solo en DEV/preview controlado después de reglas, seed y autorización.

### P1 — Riesgos de asincronía `CX.data`

- Estado: documentado.
- Acción sugerida: revisar módulos después del evento `backend-ready` cuando se active DEV.

### P1 — Persistencia financiera DEV

- Estado: documentado, no implementado.
- Acción sugerida: no crear adapter financiero hasta validar reglas, seed, adapter base y comportamiento de `CX.finStore`.

### P2 — Datos reales T&A

- Estado: pasó de bloqueado a pipeline preparado para validación local y piloto DEV.
- Acción sugerida: usar `PLAN-MIGRACION-TYA-REAL-DEV.md`. No cargar toda la base ni tocar producción.

## 2026-06-28

### P1 — Preview visual controlado del adapter DEV

- Estado: completado como validación visual local controlada.
- Detalle: `RESULTADO-PREVIEW-CONTROLADO-ADAPTER-DEV.md` documenta que el preview abrió correctamente con insignia `Preview backend DEV`, sin pantalla en blanco y sin datos reales reportados.
- Observación importante: Paula observó los 3 proyectos ficticios del prototipo (`Proyecto Retail`, `Proyecto Banca`, `Proyecto Restaurantes`), no solamente el seed Firestore DEV de 1 proyecto. Por eso este gate valida que el preview no rompe la UI, pero no debe tomarse aún como validación final de render exclusivo desde Firestore DEV.
- Acción sugerida: repetir validación visual con datos Firestore DEV después de que Claude actualice/corrija la base del prototipo y se confirme el punto único de conexión.

### P1 — Configuración del prototipo

- Estado: pendiente para Claude/frontend.
- Detalle: Paula reportó que `Configuración` no funciona correctamente durante la revisión visual del preview.
- Acción sugerida: Claude debe corregirlo en el prototipo/frontend. ChatGPT backend no debe parchar `/app/modules`.

### P1 — Módulos incompletos del prototipo

- Estado: pendiente para Claude/frontend.
- Detalle: Paula reportó que hay módulos todavía incompletos o pendientes de desarrollo, atribuibles al estado actual del prototipo y a trabajo pendiente de Claude.
- Acción sugerida: documentar para continuidad y no mezclar estas mejoras con el PR backend.

### P0 — Migración real T&A por piloto DEV

- Estado: pipeline preparado; falta export limpio local.
- Detalle: se crearon herramientas para validar, transformar y cargar un piloto DEV desde `firebase/private-input/tya-export-real.json` hacia `firebase/private-output/` y Firestore DEV.
- Acción sugerida: ejecutar primero validación local. La carga piloto DEV requiere autorización expresa separada. La carga total sigue bloqueada hasta validar piloto.

## 2026-06-30 — Revisión prototipo V55

### P0 — Acciones operativas persistibles

- Estado: pendiente frontend/backend por contrato.
- Detalle: V55 refuerza que aprobar, rechazar, reprogramar, reasignar, pagar lote, marcar realizada, marcar cuestionario, asignar responsable y cerrar soporte no deben quedar como toasts o cambios locales dispersos.
- Acción sugerida: Claude debe preparar UI con punto central futuro `CX.data.performOperationAction(...)`; ChatGPT backend ya tiene scaffold `app/core/backend-operational-actions.js` y debe conectarlo solo en preview DEV cuando corresponda.

### P0 — IA real no hardcodeada

- Estado: parcialmente preparado en frontend V55; pendiente backend seguro.
- Detalle: V55 usa `CX.ai.ask(prompt, opts)` y proveedores Gemini/OpenAI/Anthropic/custom. El backend debe evitar exponer keys privadas en frontend.
- Acción sugerida: mantener estados honestos si no hay key/backend. No prometer análisis real si solo hay heurística local.

### P0 — Mis Visitas / Mis Beneficios por `shopperId`

- Estado: resuelto en prototipo V55, pendiente de validación con Firestore DEV.
- Detalle: V55 filtra por shopper autenticado. La migración debe garantizar `shopperId` canónico en visitas, beneficios y liquidaciones.
- Acción sugerida: después de cargar `shopperBenefits`, validar lectura por shopper y confirmar que no hay fallback global.

### P0 — Finanzas profundo

- Estado: parcialmente preparado; pendiente backend por fases.
- Detalle: V55 exige CxC/CxP editables, beneficios separados de lotes, movimientos reales, conciliación y reembolsos cliente/franquicia.
- Acción sugerida: no mezclar pago real con beneficio calculado. Cargar primero `shopperBenefits` calculados y luego validar lotes/movimientos en un gate separado.

### P0 — Clientes vs Cuentas CRM

- Estado: pendiente de consolidación.
- Detalle: V55 enlaza propuestas, proyectos y tareas a la ficha CRM, pero backend debe evitar duplicar cliente/cuenta/proyecto.
- Acción sugerida: modelar `accounts/clients`, `contacts`, `proposals`, `crmTasks` y timeline por tenant antes de activar persistencia real.

### P1 — Academia, manuales y recursos

- Estado: V55 agrega `manuales-data.js`, manuales pantalla completa y recursos del proyecto.
- Detalle: requiere Storage para archivos pesados y Firestore para manuales, cursos, progreso y evidencia de lectura.
- Acción sugerida: no conectar archivos a Storage viejo; esperar diseño de Storage DEV.

### P1 — White-label / PWA

- Estado: V55 mejora logo, favicon, banderas, `sw.js` y PWA.
- Detalle: para producción real, logo/favicon deben persistir en Storage o en una URL segura por tenant.
- Acción sugerida: backend debe persistir `brand.logo`, `brand.countries[]`, tema y assets por tenant.

### P1 — Scope por país para coordinador/aliado

- Estado: roles existen en V55; filtrado real pendiente.
- Detalle: coordinador/aliado deben ver solo país(es) autorizados.
- Acción sugerida: preparar claims/campos `countryScope[]` y reglas Firestore antes de crear estos usuarios reales.
