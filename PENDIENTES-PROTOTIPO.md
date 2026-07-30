# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_CREDENTIAL_CONTINUITY_AUTH91_READBACK_PASS__HOSTING_DEV_REDEPLOY1_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

Este archivo registra pendientes frontend reales y dependencias backend que condicionan cuándo Claude debe intervenir.

## 1. No reabrir
- Corte1 /2A /3: FROZEN/APROBADO.
- Corte3: `CXORBIA-TYA-CORTE3-V182-20260729`.
- R17N FINAL:1,406/1,406 data writes/readback; no repetir.
- Corte5: CX.data project/period resuelto y re-smoke PASS.
- Corte6 previo: claims5/5 + Firestore Rules PASS + Hosting DEV previo1/1 consumido.
- No nueva candidata/base/Hosting/rama/PR.

## 2. P0 login — backend y provider ya corregidos
El problema `Correo + Contraseña` se corrigió sin crear Gmail ni sistema paralelo.

Contrato desplegado en DEV:
- `Tipo de acceso + Usuario + Contraseña`;
- namespaces `staff` / `shopper`;
- Firebase Auth interno;
- provider/email técnico oculto;
- no `app/modules/*` modificado.

## 3. Activación provider ya PASS
Auth exacto:
- imported91;
- readback91/91;
- Auth17→108;
- shopper88 + staff3;
- reset/delete/overwrite0.

Hosting DEV condicionado:
- ejecutado solo tras `PASS_EXACT_AUTH_IMPORT_READBACK`;
- mismo site/target;
- deploy adicional1;
- remote browserAuth/entrypoint/proof/namespaced login PASS;
- nuevo Firebase/Hosting0;
- Firestore/Rules/Storage/HR/legacy/payments/functions/Make/Gemini0.

## 4. Pendiente inmediato — visual humana
Validar ingreso con credenciales TyA ya existentes en el DEV publicado. No pedir password por chat.

Si PASS: `FREEZE CORTE6`.

Si aparece un P0 visual reproducible: localizar archivo/módulo y corregir focalizadamente. No pedir nueva candidata por rutina.

## 5. Claude — intervención actual
**Ninguna nueva candidata.**

No rediseñar el acceso ni crear un sistema paralelo. Solo intervenir si la visual demuestra un P0 frontend reproducible. El patrón reusable es adapter de identidad: login de producto separado del identificador provider.

## 6. P1/P2 no bloqueante
- PDF/gráficas.
- Excel/formato.
- `reportKit`/exportaciones transversales.
- copy de fuentes/readiness.

## 7. HOLD de identidad preservado
- 21 shopper credentials sin perfil canónico exacto.
- demo role1.
- ambiguous groups18/77 registros.

No resolver por nombre o coincidencia visual; revisión humana.

## 8. Agosto
- Fuente materializada hasta julio.
- `Agosto HN` sigue HOLD por inconsistencia país/tab.
- Después del FREEZE Corte6: refresh HR → resolver HOLD → materializar solo delta agosto.
- No rematerializar histórico.

## 9. Academia/manuales
Auth real detrás del adapter; tipo de acceso/namespace; usuario ≠ email obligatorio; tenant/proyecto; shopperId exacto; mínimo privilegio; dedupe seguro; conflictos a revisión; recuperación/cambio; readback y troubleshooting.

## 10. Estado seguro
PR #7 draft/open/no merge. Auth imports91/readback91; password resets0; deletes0; Firestore data writes0; Rules0; Hosting adicional1; Storage/HR/legacy/payments/functions/Make/Gemini0; producción=false; PII/credenciales crudas0.
