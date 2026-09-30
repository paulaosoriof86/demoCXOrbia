# Reauditoría y empalme — Prototipo CXOrbia V96

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Objetivo

Auditar V96 profundamente contra V95, V94, V93, V92, V91, paquete FULL enviado a Claude, reauditorías previas y mejoras backend post-paquete; definir si puede quedar como source lock para continuar backend Phase A TyA.

## Estadística forense

V96 contra V95:

- 0 archivos agregados.
- 0 archivos eliminados.
- 10 archivos modificados.
- 125 líneas agregadas.
- 16 líneas eliminadas.

V96 contra V91 acumulado:

- 30 archivos modificados.
- 2089 líneas agregadas.
- 233 líneas eliminadas.

## Validación técnica

- 100 archivos extraídos.
- 63 archivos JS revisados con `node --check`.
- 0 errores de sintaxis JS.
- 63 scripts locales en `index.html`.
- 0 scripts locales faltantes.
- `manifest.webmanifest` JSON válido.
- 49 registros `CX.module(...)`.
- 0 módulos duplicados.

## V96 sí cerró

- Scope de proyecto/cliente llega a sesión desde usuario invitado.
- Router aterriza cliente/coordinador/proyecto asignado en su scope.
- `projectsFor()` y `scopedProyectos()` respetan `scopeProjectId`.
- Roles custom ya no quedan full-access si no tienen matriz, salvo P0 residual por módulos sin categoría.
- Edición de usuario incluye proyecto y cliente.
- HR Source candidates usan llave estable, `sourceRef`, `auditRef` y opción limpiar candidatos.
- Diagnóstico muestra origen/referencia de candidatos.
- Postulaciones cambia WhatsApp enviado a preparado preview.
- Automatizaciones mejora copy de integraciones principales.

## P0 residual

`CX.roleCanAccess()` sigue devolviendo `true` cuando un módulo no está en `CX.MOD_CAT`. Esto deja incompleto el fail-closed. Módulos de navegación sin categoría que deben revisarse:

- `administrabilidad`
- `diagnostico`
- `hrsource`
- `saas`
- `novedades`
- `cli_*`

Acción: Claude debe categorizar módulos o cambiar módulo desconocido a fail-closed con allowlist explícita.

## P1 residual

- Scope cliente multi-proyecto: `scopeCliente` sin `scopeProjectId` aterriza en primer proyecto de marca.
- Copy menor residual: revisar textos operativos que digan conectado/vincular/enviar si no hay backend real.
- Botones `wa.me`: rotular como borrador manual externo, no envío automático.

## Impacto Phase A TyA

V96 permite continuar empalme backend sobre el prototipo vivo, pero no permite GO de conexión real. Sigue bloqueado cualquier Auth real, Firestore write, import real, pago, HR writeback, Make/Gemini o producción hasta cerrar gates.

## Impacto reusable CXOrbia

V96 fortalece el patrón multi-tenant: proyecto/periodo, roles/personas/scopes, HR Source, reviewQueue, candidates y PWA/branding. TyA debe mantenerse como configuración/seed y no como hardcode.

## Validación visual pendiente

Falta smoke visual por roles: admin, coordinador/aliado/custom, cliente y shopper. Revisar Proyectos, Usuarios, HR Source, Diagnóstico, Shoppers, Dashboard, Visitas, Finanzas, Academia y copy de integraciones/outbox.

## Estado seguro

Documentación/auditoría/source lock solamente. No deploy, no producción, no backend real, no Auth real, no Firestore write, no import real, no pagos, no HR writeback, no Make/Gemini y no datos sensibles.
