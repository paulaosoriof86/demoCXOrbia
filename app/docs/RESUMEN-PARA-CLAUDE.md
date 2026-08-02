# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `C6_AUTH_RUNTIME_ALL_ROLES_PASS__CLIENT_CREDENTIAL_MATERIALIZED__PENDING_FRESH_DEV_DEPLOY_AUTHORIZATION`

## 1. Baseline única

Claude debe continuar sobre el HEAD vivo de `docs-tya-v6-v71-audit`. No puede crear una versión paralela, shell reducido ni escoger módulos aislados.

La HR viva observada contiene 14 periodos desde junio 2025 hasta julio 2026, 616 visitas y 208 shoppers. Agosto todavía no existe. Los conteos son fotografía, no contrato permanente.

## 2. Contrato acumulativo comprobado

PASS:

- entrada humana `authenticated-human-canonical`;
- Firebase Auth/claims para Staff, Cliente y Shopper;
- HR viva dinámica;
- Firestore exacto para identidad/perfil/certificación;
- dominio/Finanzas/Portal Shopper/Reservas canónicos;
- tres recargas y nueva pestaña;
- carril técnico Staff/Shopper aislado;
- materialización, idempotencia, readback y rollback Cliente.

Decisión:

`PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`.

## 3. Credencial Cliente vigente

Existe una única credencial Cliente DEV con:

- `role=cliente`;
- `authNamespace=staff`;
- `tenantId=tya`;
- alcance exclusivo `cinepolis`.

La contraseña no se almacena en repo/evidencias y no debe incorporarse a UI, fixtures o documentación.

La creación produjo 2 Auth writes autorizados. La segunda aplicación fue idempotente con 0 writes. Password changes/resets: 0.

## 4. Regresiones que no se pueden repetir

- entrada humana sin Auth real;
- clic rápido que use el handler directo antes del wrapper oficial;
- tarjeta Shopper protegida ejecutando `pickShopperDev()`;
- autenticación Cliente exitosa sin completar `CX.app.enter()`;
- Shopper sin identidad;
- carril técnico sin `cxDevEntryAuth` o `technical-auth-e2e-isolated`;
- KPI/fases divergentes;
- histórico/comparativo incompleto;
- Cliente y Finanzas degradados;
- regalías globales;
- clasificación por nombre;
- honorario Shopper usado como ingreso delegado.

## 5. Contratos Auth protegidos

- `app/adapters/tya-c6-unified-human-runtime-v1.js`: guard temporal contra clic antes del wrapper oficial.
- `app/adapters/tya-c6-shopper-auth-click-guard-v1.js`: impide `pickShopperDev()` y completa la transición Cliente después de Auth.
- `app/adapters/tya-dev-technical-auth-e2e-v1.js`: carril técnico aislado.
- `app/core/backend-browser-auth.js`: autoridad del login visible.

Claude no debe mover Auth a módulos UI, crear otro login ni reintroducir selección directa de Shopper.

## 6. Modelo financiero por proyecto

Backend soporta:

- `directo/local_invoicing`;
- `delegado/delegated_coordination`;
- `regional/regional_coordination`;
- `unconfigured` fail-closed.

Cinépolis:

- delegado desde `projectConfig`;
- Q60 GT / L200 HN al shopper;
- regalías 0;
- comisión y reparto configurables;
- honorario Shopper nunca es ingreso delegado;
- margen solo con comisión/distribución exactas.

## 7. Ajustes frontend exactos para Claude

### `app/modules/proyecto-wizard.js`

- conservar directo/delegado;
- agregar `Regional`;
- mostrar regalías solo para directo;
- no duplicar contratos backend.

### `app/modules/finanzas.js`

- sustituir “honorario recibido menos lo pagado al shopper”;
- describir comisión de coordinación y distribución configurable;
- mostrar `pending_or_review` cuando falte fuente exacta.

### `app/app.js`

- preservar UI aprobada;
- no volver a usar `pickShopperDev()` en una ruta protegida;
- no asumir que autenticar equivale a completar la transición visual.

## 8. Gate antes de freeze

Pendiente únicamente:

`AUTORIZACIÓN FRESCA DE UN ÚNICO DEPLOY HOSTING DEV → PARIDAD REMOTA → GATE ACUMULATIVO STAFF/CLIENTE/SHOPPER → VALIDACIÓN HUMANA → APROBADO C6 → FREEZE`.

No nueva candidata, rama, PR, Firebase, Hosting, deploy, merge ni producción sin autorización.

## 9. Academia

Actualizar manuales para enseñar:

- diferencia entre rol visible, principal autenticado y transición visual completada;
- Staff, Cliente y Shopper tienen gates separados;
- DEV no autoriza bypass de Auth;
- materialización idempotente, readback y rollback;
- fuente viva y modelo financiero por proyecto.
