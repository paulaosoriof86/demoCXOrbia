# Resumen acumulado para Claude futuro - RC V75

Fecha: 2026-07-03
Estado: Claude pausado por capacidad. Este documento queda preparado para cuando Paula pida el paquete completo.

## Regla para Claude futuro

Partir de la version visual mas reciente empalmada por ChatGPT/Codex, no de una version vieja. No reiniciar, no reemplazar todo el repo, no borrar backend ni docs. Trabajar como release candidate incremental.

## Lo que ChatGPT/Codex hizo y Claude debe respetar

1. Auditoria y documentacion del PR #7 sobre migracion TyA, HR viva, dry-run, staging preview, write plan, gates y rollback.
2. Documentacion viva:
   - `CAMBIOS-BACKEND.md`
   - `RESUMEN-PARA-CLAUDE.md`
   - `PENDIENTES-PROTOTIPO.md`
3. Backend/contratos que no deben borrarse:
   - `app/index-backend-dev.html`
   - `app/core/backend-config-preview-dev.js`
   - `app/core/backend-data-contract.js`
   - `app/core/backend-hr-source-bridge.js`
   - `tools/`
4. Auditorias RC:
   - V69
   - V70
   - V74
   - V75
5. Regla de seguridad: sin deploy, sin importacion, sin Firestore writes, sin produccion.

## Lo que V75 resolvio y debe conservarse

- HR Source con flujo seguro de `sourceRef` opaco.
- Finanzas con estados honestos: `Preview operativo` y `Candidatas · pend. cruce`.
- Automatizaciones con aviso de pendiente backend/server-side para Make, WhatsApp, correo e IA.
- API keys IA marcadas como no seguras desde navegador para produccion.

## Pendientes exclusivos de Claude/prototipo

1. Versionado visual V75 o superior, sin arrastrar V72 como version vigente.
2. SaaS Console profundo:
   - tenants,
   - proyectos/programas/periodos,
   - permisos por rol,
   - feature flags por tenant/plan/pais/modulo,
   - releases con targeting,
   - confirmacion de lectura,
   - rollback.
3. Wizard de propuestas comerciales:
   - cliente/prospecto,
   - vertical,
   - tipo de programa,
   - plantilla,
   - modulos,
   - alcance geografico,
   - usuarios/roles,
   - fases,
   - entregables,
   - precios/placeholders,
   - estados completos.
4. CRM Reuniones: marcar como pendiente backend/calendario o limitar mock.
5. Limpieza de `app/modules/rutas.js` si sigue duplicado con `operacion-extra.js`.
6. Profundidad adicional en Academia, Portal Cliente, Finanzas e Historico sin romper backend.

## Pendientes que NO son de Claude

- Adapter real `CX.data` a Firestore/Supabase.
- Auth real por roles.
- Storage real de evidencias.
- Gemini server-side.
- Make server-side.
- Registro secreto HR Source.
- Importacion DEV real.
- Reglas Firestore/Auth/Storage.
- Rollback por batchId.

## Entrega esperada cuando Claude vuelva

Un ZIP incremental, UTF-8, con solo mejoras de frontend/prototipo, que conserve lo ya empalmado y no borre backend/documentacion del PR #7.
