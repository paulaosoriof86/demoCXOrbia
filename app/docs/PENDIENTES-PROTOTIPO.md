# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-12 15:05 -06:00  
**Estado:** `C6_LIVE_USER_ADMIN_RUNTIME_SCOPE_CORRECTED__PROOF_PENDING__PHASE_A_88`

## Pendiente vivo único de continuidad

```text
C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF
→ M7
→ M8
→ M9
→ M10
```

## Wiring C6 ya implementado en source

- `app/adapters/tya-c6-live-user-admin-membership-wiring-v1.js` permanece implementado.
- `app/index-backend-dev.html` mantiene el orden Auth bridge → membership wiring → Firebase backend.
- Staff queda fail-closed contra la membresía canónica `tenants/tya/users/{uid}` antes del consumo backend.
- Cero módulos UI tocados en la corrección actual.

## Causa raíz de orquestación corregida

El proof autorizado es Staff/admin-only, pero el carril intentaba seleccionar Staff + Shopper + Client y el runtime acumulativo exigía las tres personas. El Shopper quedaba en `HOLD_SHOPPER_R109_U104_V1_D1_H0_S0_M616_L208_P194`.

Ya quedó corregido, únicamente para `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`:

- selector privado Staff-only;
- Client selector omitido;
- runtime limitado a Staff/admin y paridad de raíz;
- validación explícita de reload y new-tab para Staff;
- Shopper/Client genéricos preservados fuera de este action.

## Ya no está pendiente

- Diagnosticar selector Shopper como causa del proof Staff: cerrado.
- Diagnosticar segunda dependencia en runtime wrapper: cerrado.
- Corregir selector + orquestación + wrapper para el action Staff/admin-only: cerrado a nivel source.
- C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE V2: PASS, consumido, no segundo intento.
- Canonical/cumulative readback: PASS.
- D technical-login rebase, private handoff, Auth340, SKIP13, MultiAuth, HR y M4/static: no reabrir sin drift reproducible.

## Pendiente inmediato

Rearmar idempotentemente el request one-shot contra el HEAD corregido y ejecutar el **mismo único Hosting DEV ya autorizado**. No repetir selectores Shopper/Client para este action.

Hosting DEV consumido en esta corrección: `0/1`.

## Pendiente frontend heredado, separado de C6

El gate R18A mantiene tres faltantes en `app/modules/cliente-extra.js`: PDF print, export XLSX y export PPTX. Se clasifica Claude/prototipo y no es causa del wiring ni motivo para reabrir Staff.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**88% certificado | 12% restante. Delta certificado de esta iteración: +0%.**

Hubo avance técnico real eliminando la causa raíz del bucle, pero el porcentaje permanece hasta certificar el runtime remoto.

## Claude / Academia

No pedir nueva candidata. No tocar frontend desde backend. Academia se actualiza al certificar el comportamiento real de roles/administración en el proof Staff.
