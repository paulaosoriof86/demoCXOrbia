# Pendientes prototipo — Addendum runtime source lock post-V96

Fecha: 2026-07-10

## P0 de continuidad antes de backend real

### Empalme runtime post-V96 no ejecutado

Estado:

- source lock post-V96 auditado y vigente;
- rama activa con 37 de 67 archivos runtime diferentes;
- 0 archivos faltantes;
- gate `NO_GO_SOURCE_LOCK_RUNTIME_NOT_EMPLOYED`;
- DEV/Auth/Firestore/runtime switch deben permanecer apagados.

Validación esperada:

- ejecutar empalme controlado en carril frontend autorizado;
- preservar mejoras backend safe-only y patches útiles;
- obtener 67/67 hashes coincidentes o documentar excepciones revisadas una por una;
- rerun de sintaxis, scripts de `index.html`, manifest/PWA y smoke por rol.

Responsable recomendado:

- Claude/frontend; o
- excepción explícita para que ChatGPT/Codex modifique runtime con auditoría previa y posterior.

## P0/P1 de consolidación durante empalme

1. Revisar 27 archivos runtime adicionales de la rama.
   - No borrarlos en lote.
   - Clasificar: backend disabled/preview, guard, patch frontend, ruta o residuo.
   - Preservar contratos/puntos de conexión que no rompan el source lock.

2. Resolver los cuatro archivos que conserva el drift gate:
   - `app/core/tya-phase-a-source-safe-preview.js`;
   - `app/data/tya-hr-source-safe-periods.js`;
   - `app/index.html`;
   - `app/sw.js`.

3. No actualizar el SHA validado hasta que el nuevo runtime pase:
   - hash gate;
   - JS syntax;
   - script manifest/index;
   - PWA/service worker;
   - smoke técnico y visual.

## P1 residual del prototipo post-V96

- `cli_*` debe tener categoría/allowlist explícita para permisos granulares de cliente.
- Módulo desconocido debe quedar `false` salvo allowlist explícita.
- Soporte y Mis Visitas deben rotular WhatsApp como borrador manual/fallback.
- HR Source debe diferenciar fuente configurada de conexión backend real.
- Confirmar selector multi-proyecto y proyecto activo en portal cliente.
- Confirmar que coordinador/aliado/custom no recibe módulos administrativos.

## Smoke obligatorio después del empalme

Roles:

- superadmin/admin;
- coordinador/aliado/custom;
- cliente con un proyecto;
- cliente con varios proyectos;
- shopper.

Módulos/flujos:

- Proyectos y Periodos;
- Usuarios/permisos;
- HR Source;
- Diagnóstico y Administrabilidad;
- Dashboard;
- Shoppers;
- Postulaciones/Visitas;
- Finanzas/Mis beneficios/liquidaciones;
- Academia;
- Soporte/Mis Visitas;
- integraciones/outbox y copy honesto.

## No pendientes desde cero

No reabrir ni pedir nuevamente:

- reglas HR/Q1/Q2;
- shoppers históricos;
- certificaciones carryover;
- junio como pagos/liquidaciones;
- reviewQueue/auditEvents;
- schema/rules DEV draft;
- protected reads;
- Auth/claims readiness;
- Make/Gemini/Storage/outbox gates;
- `CX.data` contract/bridge disabled.

## Estado seguro

Documento solamente. Sin cambios en módulos/core, sin runtime, sin import, sin writes, sin providers, sin deploy y sin producción.
