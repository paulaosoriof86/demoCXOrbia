# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-01  
**Estado:** `C6_READONLY_RUNTIME_PASS_EXCEPT_CLIENT_CREDENTIAL__HOLD_NO_AUTH_WRITE_NO_DEPLOY_NO_PRODUCTION`

## 1. Estado protegido

- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft/open/no merge.
- Corte 3 FROZEN; R17N 1,406/1,406 no repetir.
- HR viva observada: 14 periodos, junio 2025–julio 2026, 616 visitas y 208 shoppers.
- Agosto 2026 todavía no existe en HR.
- Producción intacta.

Los conteos son una fotografía de la revisión viva, no invariantes permanentes.

## 2. Contratos prevalentes

### Fuente

HR viva gobierna periodos, visitas, estados y asignaciones. Firestore protegido solo enriquece identidad, perfil y certificación por crosswalk exacto.

### Finanzas

- directo/local: regalías únicamente si se configuran;
- delegado: regalías 0 y comisión de coordinación compartida;
- regional: distribución regional configurable, sin regalías locales por defecto;
- sin modelo: `unconfigured`, fail-closed.

Cinépolis se declara delegado desde su `projectConfig`, con Q60 GT/L200 HN al shopper y regalías 0. El honorario del shopper nunca se usa como ingreso delegado.

## 3. Root fixes acumulativos comprobados

- entrada humana única `authenticated-human-canonical`;
- guard contra clic antes del wrapper oficial de Auth;
- guard específico para que la tarjeta Shopper protegida no ejecute `pickShopperDev()`;
- HR dinámica y read model canónico;
- modelo financiero por configuración, no por nombre;
- guard de comisión delegada fail-closed;
- carril técnico estable con `cxDevEntryAuth` y `technical-auth-e2e-isolated`;
- módulos UI y `app.js` preservados.

## 4. Gates PASS

- static cumulative contract;
- immediate-click login guard;
- live HR dynamic canonical state;
- domain/finance/shopper/reservations;
- Staff humano con Auth/claims;
- Shopper humano con Auth/claims e identidad exacta;
- carril técnico Staff/Shopper aislado;
- tres recargas y nueva pestaña;
- ruta integrada Cliente Usuario + Contraseña.

Resultados humanos:

- Staff: rol `coordinador`, namespace `staff`, 14 periodos, 616 visitas, reloads y nueva pestaña estables.
- Shopper: rol `shopper`, namespace `shopper`, una visita propia comprobada, 14 periodos, 616 visitas, reloads y nueva pestaña estables.
- Credenciales/tokens expuestos: 0.

Julio observado: 44 visitas, 43 realizadas, 41 cuestionarios, 37 submitidas y 1 fuera de rango.

## 5. HOLD exacto

Decisión vigente:

`HOLD_C6_EXISTING_CLIENT_CREDENTIAL_NOT_FOUND`.

La búsqueda read-only encontró:

- 4 registros candidatos;
- 3 usuarios Auth correspondientes;
- 0 cuentas con claims válidos `cliente/client` para tenant `tya` y proyecto `cinepolis`;
- 0 hashes válidos;
- 0 sign-ins Cliente.

No se creó ni modificó ninguna cuenta. Auth writes, cambios y resets de contraseña permanecen en cero.

## 6. Siguiente bloque exacto bloqueado por autorización

`SNAPSHOT AUTH CLIENT → MATERIALIZE ONE CLIENT CREDENTIAL DEV → CLAIMS TENANT/PROJECT/ROLE → IDEMPOTENCY → CLIENT AUTH HUMAN → 3 RELOADS + NEW TAB → READBACK → ROLLBACK PROOF → EVIDENCE`.

Este bloque implica Auth write y requiere autorización específica de Paula. Hasta entonces no corresponde deployar, congelar Corte 6, abrir agosto ni habilitar postulaciones.

## 7. Estado seguro

Hosting deploys 0; Cloud Run 0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes 0; password changes/resets 0; merge=false; producción=false.
