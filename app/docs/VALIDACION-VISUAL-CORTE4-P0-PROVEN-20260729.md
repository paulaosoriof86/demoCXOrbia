# Validación visual Corte 4 — P0 PROVEN

**Fecha:** 2026-07-29  
**Estado:** `P0_PROVEN__CORTE4_FREEZE_BLOCKED`

## Evidencia visual de Paula

La URL canónica de Hosting DEV abrió correctamente, pero el runtime publicado incumple el contrato de Corte 4:

- pantalla de acceso muestra `Demo comercial · datos ficticios`;
- status visible: `Fuente: localStorage/demo`;
- status visible: `Auth: pendiente`;
- status visible: `Proyecto: proyecto retail`;
- status visible: `Proyectos: 3 · Visitas: 108 · Shoppers: 18 · Postulaciones: 48`;
- al entrar como Administración aparecen `Proyecto Retail`, `Proyecto Banca`, `Proyecto Restaurantes` y KPIs/demo;
- el Dashboard Operativo muestra `44` visitas y datos ficticios de JUL 26.

Esto contradice directamente el contrato vigente de Corte 4, que exige backend nuevo vacío, `fallbackToMockOnReadError=false`, `fallbackToLocalStorageOnEmpty=false` y `emptyBackendMustRenderAsEmpty=true`.

## P0 reproducible

`P0-C4-VIS-01 — FORBIDDEN_DEMO_FALLBACK_ON_AUTH_PENDING`

Reproducción:

1. abrir la URL canónica de Corte 4 Hosting DEV;
2. no existe usuario Auth permanente ni Email/Password habilitado, por diseño después del protected smoke;
3. el preview intenta autenticación DEV;
4. la credencial temporal no existe;
5. el runtime cae en `localStorage/demo` y conserva/renderiza seeds ficticios.

## Causa raíz técnica localizada

El conflicto está en la cadena backend, no en los módulos UI:

- `app/core/backend-config-preview-dev.js` activa `devPreviewAuth.enabled=true`;
- `app/core/backend-firebase.js::ensurePreviewAuth()` exige una credencial temporal almacenada;
- si falta la credencial, `backend-firebase.js` marca explícitamente `localStorage/demo` y lanza error;
- su `catch` vuelve a marcar `localStorage/demo` y declara que la UI sigue con mock/localStorage;
- esto es incompatible con `failClosedOnReadError=true` de Corte 4 y explica exactamente el status observado por Paula.

La credencial no debe reintroducirse: el protected smoke ya comprobó lectura autenticada y luego limpió el principal temporal. La corrección debe hacer que Hosting DEV sin principal temporal permanezca vacío/fail-closed y nunca vuelva a demo/localStorage.

## Alcance permitido de la corrección

Corrección backend focalizada únicamente. No nueva candidata, no rediseño UI, no PowerShell, no nueva rama/PR, no base nueva adicional, no reactivación de datos TyA.

Archivos candidatos a revisar como causa:

- `app/core/backend-firebase.js`;
- `app/core/backend-cxdata-readonly-corte4.js`;
- `app/core/backend-preview-status.js` solo para asegurar que el status refleje el estado real después de corregir la fuente.

No tocar `/app/modules` salvo evidencia adicional P0 independiente.

## Gate posterior obligatorio

Después de una autorización explícita para la corrección:

`PATCH FOCALIZADO → GATE LOCAL/ESTÁTICO → HOSTING DEV CONTROLADO → VALIDACIÓN VISUAL`.

PASS visual requerido:

- no `localStorage/demo`;
- no proyectos/visitas/shoppers/postulaciones ficticios;
- backend vacío renderizado como vacío o estado fail-closed honesto;
- cero writes;
- Corte 3 preservado.

## Estado seguro

Corte 3 sigue FROZEN. Corte 4 no se congela. No hubo producción, merge, materialización, Firestore document writes, Auth users permanentes, Storage/HR writes, pagos, Make ni Gemini.