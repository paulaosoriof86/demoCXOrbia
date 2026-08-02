# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-02  
**Estado:** `C6_AUTH_RUNTIME_ALL_ROLES_PASS__CLIENT_CREDENTIAL_MATERIALIZED__PENDING_FRESH_DEV_DEPLOY_AUTHORIZATION__NO_PRODUCTION`

## 1. Estado protegido

- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft/open/no merge.
- Corte 3 FROZEN; R17N 1,406/1,406 no repetir.
- HR viva observada: 14 periodos, junio 2025–julio 2026, 616 visitas y 208 shoppers.
- Agosto 2026 todavía no existe en HR.
- Producción intacta.

## 2. Contratos prevalentes

### Fuente

HR viva gobierna periodos, visitas, estados y asignaciones. Firestore protegido solo enriquece identidad, perfil y certificación por crosswalk exacto.

### Finanzas

- directo/local: regalías únicamente si se configuran;
- delegado: regalías 0 y comisión de coordinación compartida;
- regional: distribución regional configurable;
- `unconfigured`: fail-closed.

Cinépolis conserva Q60 GT/L200 HN al shopper, modelo delegado y regalías 0.

## 3. Root fixes acumulativos comprobados

- entrada humana única `authenticated-human-canonical`;
- guard contra clic antes del wrapper oficial de Auth;
- guard Shopper contra `pickShopperDev()`;
- transición Cliente post-Auth completada con `CX.app.enter()`;
- HR dinámica y read model canónico;
- modelo financiero por configuración;
- guard de comisión delegada fail-closed;
- carril técnico estable;
- módulos UI y `app.js` preservados.

## 4. Gates PASS

- static cumulative contract;
- immediate-click login guard;
- live HR dynamic canonical state;
- domain/finance/shopper/reservations;
- Staff humano con Auth/claims;
- Shopper humano con Auth/claims e identidad exacta;
- Cliente humano con Auth/claims y alcance exacto;
- carril técnico Staff/Shopper aislado;
- tres recargas y nueva pestaña;
- idempotencia y readback Cliente;
- rollback exacto probado.

Decisión acumulativa:

`PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`.

## 5. Credencial Cliente

Autorización ejecutada:

- una única credencial Cliente DEV;
- 2 Auth writes: creación + claims;
- `role=cliente`;
- `authNamespace=staff`;
- `tenantId=tya`;
- alcance exclusivo `cinepolis`;
- cuenta habilitada;
- sign-in por contraseña PASS;
- password changes/resets 0;
- credenciales/tokens expuestos 0.

La segunda aplicación fue idempotente con 0 writes.

## 6. Runtime Cliente

- 14 periodos;
- 616 visitas;
- junio 2025 a julio 2026;
- proyecto `cinepolis`;
- periodo `cinepolis-2026-07`;
- tres recargas estables;
- nueva pestaña estable.

## 7. Primer intento y rollback

El primer intento creó y leyó correctamente la cuenta, pero no completó la transición visual al Portal Cliente. El workflow ejecutó rollback real y eliminó el usuario, restaurando el preestado.

Se corrigió la causa raíz y el segundo intento quedó PASS.

## 8. Siguiente bloque exacto

`AUTORIZACIÓN FRESCA PARA UN ÚNICO DEPLOY DEL HOSTING DEV EXISTENTE → PARIDAD REMOTA → GATE ACUMULATIVO REMOTO STAFF/CLIENTE/SHOPPER → VALIDACIÓN HUMANA → APROBADO C6 → FREEZE`.

No existe autorización vigente para deploy.

## 9. Estado seguro

Credenciales Cliente creadas 1; Auth writes autorizados 2; password changes/resets 0; Hosting/Cloud Run deploys 0; Firestore/Rules/Storage/HR/Make/Gemini/pagos writes 0; merge=false; producción=false.
