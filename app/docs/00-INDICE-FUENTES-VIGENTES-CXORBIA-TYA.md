# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-02  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_AUTH_RUNTIME_ALL_ROLES_PASS__CLIENT_CREDENTIAL_MATERIALIZED__PENDING_FRESH_DEV_DEPLOY_AUTHORIZATION__NO_PRODUCTION`

## 1. Repositorio y destinos

- Repo `paulaosoriof86/demoCXOrbia`.
- Rama viva `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- Hosting DEV existente `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción `tya-plataforma`: intacta.

## 2. Fuentes obligatorias vigentes

1. reglas maestras y addenda activos;
2. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
3. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
4. `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`;
5. `ADDENDUM-MAESTRO-C6-BASELINE-CANONICA-UNICA-Y-CUTOVER-20260801.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-RECUPERACION-BASELINE-ACUMULATIVA-UNICA-20260801.md`;
7. `CAMBIOS-BACKEND-ADDENDUM-C6-MODELO-DELEGADO-COMISION-20260801.md`;
8. `CAMBIOS-BACKEND-ADDENDUM-C6-AUTH-RUNTIME-Y-HOLD-CLIENTE-20260801.md`;
9. `CAMBIOS-BACKEND-ADDENDUM-C6-CREDENCIAL-CLIENTE-MATERIALIZADA-20260802.md`;
10. evidencia `CORTE6-LIVE-HR-DOMAIN-READONLY-AUDIT-LATEST.json`;
11. evidencia `CORTE6-HUMAN-LOGIN-WRAPPER-DIAGNOSTIC-LATEST.json`;
12. evidencia `CORTE6-UNIFIED-AUTH-RUNTIME-READONLY-LATEST.json` como estado previo read-only;
13. evidencia prevalente `CORTE6-CLIENT-AUTH-MATERIALIZATION-LATEST.json`;
14. evidencias de snapshot, apply, idempotencia, readback, runtime y rollback Cliente;
15. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker, PR #7 y HEAD vivo.

## 3. Regla prevalente de fuente

La HR viva es autoridad para todos los periodos detectados.

Fotografía observada:

- 14 periodos desde junio 2025 hasta julio 2026;
- 616 visitas;
- 208 shoppers;
- agosto 2026 ausente.

Julio 2026 observado:

- 44 visitas;
- 43 realizadas;
- 41 cuestionarios completados;
- 37 submitidas;
- 1 fuera de rango;
- GT 34 / HN 10.

Los conteos son fotografía, no invariantes. Agosto solo puede aparecer desde HR o como fuente platform-origin autorizada y reconciliada.

## 4. Modelo financiero prevalente

- `directo/local_invoicing`: regalías solo si el proyecto las configura;
- `delegado/delegated_coordination`: regalías 0 y comisión de coordinación compartida;
- `regional/regional_coordination`: distribución regional configurable;
- `unconfigured`: fail-closed.

Cinépolis:

- modelo delegado desde `projectConfig`;
- honorario Shopper GT Q60 / HN L200;
- regalías 0;
- comisión y reparto configurables;
- honorario Shopper nunca usado como ingreso delegado.

## 5. Gates de Corte 6 comprobados

PASS:

- static cumulative contract;
- click inmediato protegido por Auth;
- HR viva dinámica;
- dominio y máquina canónica de estados;
- Finanzas contractuales;
- Portal Shopper;
- Reservas fail-closed;
- Auth humana Staff;
- Auth humana Shopper;
- Auth humana Cliente;
- Auth técnica Staff/Shopper aislada;
- tres recargas y nueva pestaña;
- idempotencia y readback Cliente;
- rollback exacto probado.

Decisión acumulativa:

`PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`.

## 6. Credencial Cliente materializada

La autorización específica produjo:

- snapshot previo con 0 cuentas Cliente válidas;
- 1 credencial Cliente creada;
- 2 Auth writes autorizados: creación de usuario + claims;
- `role=cliente`;
- `authNamespace=staff`;
- `tenantId=tya`;
- alcance exclusivo `cinepolis`;
- contraseña y tokens no expuestos;
- password changes/resets 0.

La repetición idempotente produjo 0 writes.

El runtime Cliente comprobó:

- 14 periodos;
- 616 visitas;
- junio 2025 a julio 2026;
- tres recargas estables;
- nueva pestaña estable.

## 7. Incidente y rollback del primer intento

El primer intento autenticó correctamente, pero no completó `CX.app.enter()`. El workflow eliminó el usuario creado y restauró el preestado.

Se corrigió la causa raíz en `app/adapters/tya-c6-shopper-auth-click-guard-v1.js`, sin modificar `app.js` ni módulos UI.

El segundo intento quedó PASS.

## 8. Gate vivo restante

`SOLICITAR AUTORIZACIÓN FRESCA DE UN ÚNICO DEPLOY HOSTING DEV → PARIDAD REMOTA → AUTH STAFF/CLIENTE/SHOPPER → HR/DATABASE/FINANCE/SHOPPER/CLIENTE → 3 RELOADS + NEW TAB → VALIDACIÓN HUMANA → APROBADO C6 → FREEZE`.

Hasta nueva autorización:

- no deploy DEV;
- no agosto;
- no postulaciones;
- no merge;
- no producción.

## 9. Warnings frontend para Claude

1. incorporar `Regional` en `app/modules/proyecto-wizard.js`;
2. corregir el copy delegado en `app/modules/finanzas.js`;
3. nunca permitir que una ruta protegida Shopper vuelva a usar `pickShopperDev()`;
4. preservar la transición Cliente post-Auth sin mover Auth a módulos UI.

## 10. Estado seguro

Credenciales Cliente creadas 1; Auth writes autorizados 2; password changes/resets 0; Hosting/Cloud Run deploys 0; Firestore/Rules/Storage/HR/Make/Gemini/pagos writes 0; credenciales/tokens expuestos 0; merge false; producción false.
