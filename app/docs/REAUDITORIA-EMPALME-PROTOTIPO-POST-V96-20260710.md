# Reauditoría y empalme — Prototipo CXOrbia post-V96

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Objetivo

Auditar profundamente la candidata post-V96 contra V96, cadena V95-V91, paquete FULL enviado a Claude, reauditorías previas y mejoras backend post-paquete; definir si puede quedar como source lock operativo actualizado para continuar backend Phase A TyA.

## Estadística forense

Post-V96 contra V96:

- 0 archivos agregados.
- 0 archivos eliminados.
- 11 archivos modificados.
- 63 líneas agregadas.
- 36 líneas eliminadas.

Archivos modificados principales:

- `app/core/config.js`
- `app/core/data.js`
- `app/core/router.js`
- `app/core/topbar.js`
- `app/modules/automatizaciones.js`
- `app/modules/cliente.js`
- `app/modules/correo.js`
- `app/modules/crm.js`
- `app/modules/dashboard.js`
- `app/modules/postulaciones.js`
- `app/docs/CAMBIOS-CLAUDE-CANDIDATE-COMPLETO-POST-SYNTHETIC-COVERAGE-20260708.md`

## Validación técnica

- 100 archivos extraídos.
- 63 archivos JS revisados con `node --check`.
- 0 errores de sintaxis JS.
- 63 scripts locales en `index.html`.
- 0 scripts locales faltantes.
- `manifest.webmanifest` JSON válido.
- 49 registros `CX.module(...)`.
- 0 módulos duplicados.

## Sí cerró

- `CX.MOD_CAT` ahora incluye `hrsource`, `novedades`, `saas`, `diagnostico` y `administrabilidad`.
- `roleCanAccess()` ya no devuelve `true` para módulo sin categoría.
- Coordinador/aliado/custom quedan gobernados por matriz y default seguro.
- `clientProjects()` permite detectar varios proyectos de un mismo cliente.
- Router conserva proyecto activo si pertenece al cliente.
- Portal cliente muestra selector de proyecto cuando hay más de uno.
- WhatsApp manual quedó más honesto en Topbar, Dashboard, Cliente, Correo, CRM, Postulaciones y Automatizaciones.

## P1 residual

- Módulos `cli_*` no están en `CX.MOD_CAT`. No bloquea porque el shell cliente tiene acceso propio, pero debe categorizarse para permisos cliente granulares.
- El fallback `CX.MOD_CAT[id] || 'cfg'` evita apertura total, pero no es fail-closed absoluto si un rol futuro recibe `cfg`. Antes de producción real, desconocido debería ser `false` salvo allowlist explícita.
- Soporte y Mis Visitas conservan algunos textos de WhatsApp que deben rotularse como borrador manual/fallback.
- HR Source puede mejorar el label `Conectado` a `Conectado por backend`.

## Impacto Phase A TyA

La candidata permite continuar empalme backend sobre el prototipo vivo, pero no permite GO de conexión real. Sigue bloqueado cualquier Auth real, Firestore write, import real, pago, HR writeback, Make/Gemini o producción hasta cerrar gates.

## Impacto reusable CXOrbia

Fortalece el patrón multi-tenant con permisos fail-closed, cliente multi-proyecto, estados honestos de canales externos y separación prototipo/backend real.

## Validación visual pendiente

Falta smoke visual por roles: admin, coordinador/aliado/custom, cliente y shopper. Revisar Proyectos, Usuarios, HR Source, Diagnóstico, Shoppers, Dashboard, Visitas, Finanzas, Academia, Soporte, Mis Visitas y copy de integraciones/outbox.

## Estado seguro

Documentación/auditoría/source lock solamente. No deploy, no producción, no backend real, no Auth real, no Firestore write, no import real, no pagos, no HR writeback, no Make/Gemini y no datos sensibles.