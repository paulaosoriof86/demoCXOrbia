# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-01  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_STATIC_LIVE_HR_STAFF_SHOPPER_TECHNICAL_AUTH_PASS__CLIENT_ROUTE_PASS__NO_EXISTING_CLIENT_CREDENTIAL__HOLD_NO_DEPLOY_NO_PRODUCTION`

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
9. evidencia `CORTE6-LIVE-HR-DOMAIN-READONLY-AUDIT-LATEST.json`;
10. evidencia `CORTE6-HUMAN-LOGIN-WRAPPER-DIAGNOSTIC-LATEST.json`;
11. evidencia `CORTE6-UNIFIED-AUTH-RUNTIME-READONLY-LATEST.json`;
12. evidencia `CORTE6-EXISTING-CLIENT-CREDENTIAL-SELECTION-LATEST.json`;
13. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker, PR #7 y HEAD vivo.

## 3. Regla prevalente de fuente

La HR viva es autoridad para **todos los periodos detectados**, no únicamente el mes actual y nunca números congelados de cortes anteriores.

Fotografía observada en el gate vigente:

- 14 periodos desde junio 2025 hasta julio 2026;
- 616 visitas;
- 208 shoppers;
- no existe agosto 2026 en HR.

Julio 2026 observado:

- 44 visitas;
- 43 realizadas;
- 41 cuestionarios completados;
- 37 submitidas;
- 1 fuera de rango;
- GT 34 / HN 10.

Estos conteos describen la revisión actual y no son límites permanentes. Agosto solo puede aparecer cuando exista en HR o como fuente platform-origin autorizada y reconciliada.

## 4. Regla prevalente de modelo financiero

El modelo se selecciona por configuración de cada proyecto, nunca por el nombre del cliente o del proyecto:

- `directo/local_invoicing`: facturación local; regalías solo si el proyecto las configura;
- `delegado/delegated_coordination`: sin facturación local; regalías 0; comisión de coordinación compartida;
- `regional/regional_coordination`: distribución regional configurable; regalías locales 0 por defecto;
- `unconfigured`: fail-closed; no se calculan ingresos, regalías ni margen.

Cinépolis es delegado por su `projectConfig` vigente:

- honorario Shopper GT: Q60;
- honorario Shopper HN: L200;
- regalías: 0;
- comisión y reparto: configurables, sin valores inventados.

Contratos reusables:

- `app/adapters/tya-project-financial-model-contract-v1.js`;
- `app/adapters/tya-delegated-coordination-finance-guard-v1.js`.

## 5. Gates de Corte 6 ya comprobados

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
- Auth técnica Staff/Shopper aislada;
- tres recargas y nueva pestaña;
- ruta integrada de Cliente Usuario + Contraseña.

Root fixes de Auth incorporados:

- guard temporal contra clic antes del wrapper oficial;
- guard específico para impedir que la tarjeta Shopper protegida ejecute `pickShopperDev()`;
- contrato técnico estable `cxDevEntryAuth` + `technical-auth-e2e-isolated`.

## 6. HOLD exacto vigente

Decisión acumulativa:

`HOLD_C6_EXISTING_CLIENT_CREDENTIAL_NOT_FOUND`.

La búsqueda read-only examinó cuatro registros candidatos y tres usuarios Auth existentes, pero encontró cero cuentas con claims válidos de Cliente para tenant `tya` y proyecto `cinepolis`; no hubo hash ni sign-in Cliente válido.

Se preservó:

- Auth writes 0;
- cambios de contraseña 0;
- resets 0;
- credenciales/tokens expuestos 0.

No corresponde crear o resetear una credencial Cliente sin autorización específica.

## 7. Gate vivo restante

Con autorización separada:

`SNAPSHOT AUTH CLIENT SCOPE → MATERIALIZE ONE CLIENT CREDENTIAL IN DEV → CLAIMS TENANT/PROJECT/ROLE → IDEMPOTENCY → CLIENT HUMAN AUTH → 3 RELOADS + NEW TAB → READBACK → ROLLBACK PROOF → CUMULATIVE EVIDENCE`.

Hasta entonces:

- Corte 6 no se congela;
- no se solicita ni ejecuta deploy DEV;
- no se abre agosto;
- no se habilitan postulaciones;
- no merge ni producción.

## 8. Warnings frontend documentados para Claude

1. incorporar `Regional` en `app/modules/proyecto-wizard.js`;
2. corregir el copy delegado en `app/modules/finanzas.js`;
3. nunca permitir que una ruta protegida Shopper vuelva a usar `pickShopperDev()`.

## 9. Estado seguro

Hosting deploys 0; Cloud Run 0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes 0; password changes/resets 0; merge false; producción false.
