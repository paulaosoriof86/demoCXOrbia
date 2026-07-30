# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `P0_C6_CREDENTIAL_CONTINUITY_ROOT_CAUSE_FIXED__NAMESPACED_DRYRUN91_PASS__WAITING_COMBINED_AUTHORIZATION__NO_PRODUCTION`

Este archivo registra pendientes frontend reales y dependencias backend que condicionan cuándo Claude debe intervenir.

## 1. No reabrir
- Corte1 /2A /3: FROZEN/APROBADO.
- Corte3: `CXORBIA-TYA-CORTE3-V182-20260729`.
- R17N FINAL:1,406/1,406 data writes/readback; no repetir.
- Corte5: CX.data project/period resuelto y re-smoke PASS.
- Corte6 previo: claims5/5 + Firestore Rules PASS + Hosting DEV existente1/1 consumido.
- No nueva candidata/base/Hosting/rama/PR.

## 2. P0 de login — backend corregido en fuente, pendiente materialización Auth + redeploy
Problema reproducible: el DEV mostró `Correo + Contraseña`, distinto del contrato histórico/funcional `Usuario + Contraseña`.

Decisión:
- no crear Gmail nuevo;
- no obligar a usar cuentas técnicas DEV;
- conservar Firebase Auth como autoridad interna;
- visible: `Tipo de acceso + Usuario + Contraseña`;
- namespaces `staff` / `shopper`;
- provider/email técnico oculto.

`app/core/backend-browser-auth.js` ya refleja este contrato; no se tocó `app/modules/*`.

## 3. Dependencia backend exacta antes de visual
Dry-run source-safe:
- elegibles Auth91 = shopper88 + super1 + coordinador2;
- 21 shopper credentials sin perfil canónico exacto HOLD;
- demo role HOLD;
- collisions0;
- no-overwrite.

Pendiente únicamente por gate de proveedor:
`AUTORIZAR → IMPORT AUTH MÁX91/READBACK → SI PASS REDEPLOY ADICIONAL MISMO HOSTING DEV → VISUAL CON CREDENCIALES EXISTENTES`.

No pedir password por chat.

## 4. Claude — intervención actual
**Ninguna nueva candidata.**

No rediseñar el acceso ni crear un sistema paralelo. Después del smoke, solo abrir tarea si aparece P0 visual reproducible. El patrón reusable a preservar es adapter de identidad: login del producto separado del identificador provider.

## 5. P1/P2 no bloqueante
- PDF/gráficas.
- Excel/formato.
- `reportKit`/exportaciones transversales.
- copy de fuentes/readiness.

## 6. Agosto
- Fuente materializada hasta julio.
- `Agosto HN` sigue HOLD por inconsistencia país/tab.
- Después del FREEZE Corte6: refresh HR → resolver HOLD → materializar solo delta agosto.
- No rematerializar histórico.

## 7. Academia/manuales
Auth real detrás del adapter; tipo de acceso/namespace; usuario ≠ email obligatorio; tenant/proyecto; shopperId exacto; mínimo privilegio; dedupe seguro; conflictos a revisión; recuperación y cambio de acceso.

## 8. Estado seguro
PR #7 draft/open/no merge. Bloque credential-continuity actual: Auth imports0; password resets0; deletes0; Firestore data writes0; Rules0; Hosting adicional0; Storage/HR/legacy/payments/Make/Gemini0; producción=false; PII/credenciales crudas0.
