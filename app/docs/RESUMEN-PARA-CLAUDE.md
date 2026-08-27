# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-27  
**Estado:** `PHASE_A_100_FROZEN__F6_CLOSED_PASS__NEXT_F7_INTEGRAL_READINESS__NO_UI_REBUILD`

## Estado canónico

- PHASE_A = `100/100`.
- PRODUCTION_REAL_READINESS = `90/100`.
- F5 = `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`.
- F6 = `CLOSED_PASS_IMMUTABLE`.
- NEXT = `F7_INTEGRAL_READINESS`.
- Release ID = `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

Autoridad viva: `backend/config/cxorbia-phase-a-continuity-lock.json` + manifest F6 + evidencia terminal F6. El master plan V1.1 está congelado y no se reescribe sin nuevo PCR.

## Release exacto que Claude debe respetar

- functional source SHA `f9802fdd498934a8e7729fa5c7d18341bec1cd71`;
- runtime source SHA `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`;
- Cloud Run revision `cxorbia-live-hr-dev-00013-rns`;
- image digest `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`;
- Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`;
- Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

## No tocar / no reconstruir

Claude no debe:

- reconstruir Phase A ni reinterpretar F5/F6 como pendientes;
- tocar `/app/modules` o `/app/core` desde backend para “resolver” readiness;
- crear otra candidata/rama/PR/workflow;
- hardcodear TyA o Cinépolis como arquitectura global;
- convertir HR assignment en postulation;
- inventar mappings de identidad por nombre/email/teléfono/WhatsApp/username;
- mostrar integraciones, pagos, Make o Gemini como activos si no tienen gate real;
- alterar el release congelado por mejoras visuales o documentación.

Un ajuste frontend posterior se documenta por archivo/módulo y se aplica conforme al carril `APPLY_DELTA_DIRECTLY` solo cuando exista una candidata auditada GO sin P0.

## Qué sí debe verificar F7 en frontend/UX y contenido

Sin modificar el release durante la auditoría, F7 debe comprobar que lo visible sea coherente con el comportamiento real para cada rol y proyecto:

- Auth/RBAC y estados de acceso;
- HR viva e histórica;
- shoppers y perfiles;
- postulaciones;
- certificaciones presentadas;
- visitas, agendamiento, reprogramación, cancelación y cuestionarios;
- liquidaciones/pagos y sus estados reales;
- multi-proyecto y configuración por tenant/proyecto;
- sincronización HR↔plataforma;
- mensajes de error, loading, empty states y estados honestos;
- evidencias y trazabilidad;
- observabilidad visible cuando corresponda;
- responsive/usabilidad sin promesas falsas de backend.

## Academia

F7 debe validar que Academia refleje el release real, no un flujo aspiracional. Debe comprobar:

- rutas por rol;
- cursos/manuales por módulo;
- pasos operativos concretos;
- estados esperados y errores frecuentes;
- certificaciones y reglas configurables por proyecto;
- notificaciones y cambios de producto;
- separación entre funciones disponibles, bloqueadas y futuras.

No se requiere rediseñar Academia en F7 salvo defecto demostrado; cualquier mejora queda documentada para una candidata frontend posterior.

## Hallazgo de mecanismo no bloqueante

El predeploy read-only run `33085991102` falló porque el servicio local intentó arrancar sin `firebase-admin`. Clasificación: `MECHANISM_P1_NON_BLOCKING`. No hubo provider mutation ni deploy. No es defecto de UI ni motivo para reabrir F6.

## Siguiente frontera

`F7_INTEGRAL_READINESS`.

Salida válida: `GO` o `GO_WITH_WARNINGS` sin P0 demostrado; `HOLD/NO_GO` únicamente con evidencia reproducible.
