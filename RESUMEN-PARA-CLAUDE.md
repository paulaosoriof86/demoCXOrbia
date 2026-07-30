# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `P0_C6_CREDENTIAL_CONTINUITY_ROOT_CAUSE_FIXED__NAMESPACED_DRYRUN91_PASS__IMPORT_AND_EXISTING_HOSTING_REDEPLOY_PREPARED_STATIC_PASS__WAITING_SINGLE_COMBINED_AUTHORIZATION__NO_PRODUCTION`

## 1. No reabrir
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL:1,406/1,406 Firestore data writes/readback; no repetir.
- Corte5 `CX.data`: `cinepolis`,14 periodos,616 visitas, `currentPeriodId=2026-07`, source=firestore/fallback=false PASS.
- Corte6 previo: claims5/5 + Rules PASS; Hosting DEV existente1/1 consumido.
- No nueva candidata, rama, PR, Firebase o Hosting por rutina.

## 2. P0 de acceso — causa raíz
Firebase Auth real es obligatorio como autoridad backend, pero el formulario `Correo + Contraseña` no respeta el contrato de acceso existente de TyA.

Contrato correcto:
- visible: `Tipo de acceso + Usuario + Contraseña`;
- provider: Firebase Auth detrás del adapter;
- namespaces: `staff` / `shopper`;
- email Firebase interno determinístico y no visible;
- claims determinan rol/tenant/project/shopperId;
- no selección visual de rol como autorización.

El parser legacy original también deduplicaba username globalmente. Se corrigió: staff y shopper no colisionan entre sí; solo se colapsa duplicado shopper si coinciden username normalizado + legacyId + mismo hash.

## 3. Evidencia source-safe actual
- shoppers fuente282;
- grupos de credencial shopper seguros109;
- exact duplicate records collapsed93;
- ambiguous duplicate groups18 /records77 HOLD;
- missing password2 /login1 HOLD;
- staff4: superadmin1/coordinador2/demo1;
- bundle cifrado113;
- credencial/PII legible en repo0.

Dry-run provider read-only corregido:
- input113;
- elegibles91 = shopper88 + super1 + coordinador2;
- shopper exact legacy match88;
- HOLD21 shopper sin perfil canónico exacto por `legacyShopperId`;
- HOLD1 demo role;
- UID/email collisions0/0;
- `FAIL_CLOSED_NO_OVERWRITE`;
- provider/Auth/Firestore/Rules/Hosting writes0.

El plan antiguo de12 está superseded; no usar.

## 4. Backend preparado — NO EXECUTE
`app/core/backend-browser-auth.js` ya implementa el contrato visible namespaced sin tocar `app/modules/*`.

Import Auth preparado y apagado:
- máximo91;
- no reset de contraseñas;
- no deletes/overwrite;
- hash SHA256 rounds1;
- readback91/91;
- static/no-write PASS.

Hosting DEV adicional preparado y apagado:
- mismo project/site/target;
- solo si Auth import readback PASS;
- un único redeploy adicional;
- remote verify;
- static/no-write PASS.

## 5. Claude — regla actual
**No nueva candidata. No rediseñar login. No mover Auth/claims/Firestore/Rules a `app/modules/*`.**

La corrección reusable de producto es:
- el usuario no tiene por qué ver un email técnico;
- el tipo de acceso puede resolver namespace;
- `Usuario + Contraseña` se mantiene como contrato de TyA;
- provider Auth queda encapsulado;
- conflictos de identidad quedan HOLD, nunca automezcla.

Solo abrir tarea adicional de frontend si la visual posterior al redeploy demuestra P0 reproducible localizado.

## 6. P1/P2 preservado
- PDF sin gráfica final;
- Excel sin formato final;
- reportKit/exportaciones transversales;
- copy de fuentes/readiness.

No bloquean Phase A salvo evidencia P0.

## 7. Agosto
Fuente materializada hasta julio. `Agosto HN` HOLD por inconsistencia país/tab. Tras FREEZE Corte6: refresh HR → resolver HOLD → materializar solo delta agosto → preprod/cutover.

## 8. Academia/manuales
Actualizar: Auth real detrás del login, namespace staff/shopper, usuario ≠ email obligatorio, recuperación/cambio, tenant/proyecto/rol, shopperId exacto, dedupe seguro, import/readback y fail-closed.

## 9. Estado seguro
PR #7 draft/open/no merge. Bloque credential-continuity actual: Auth imports0; password resets0; deletes0; Firestore data writes0; Rules0; Hosting adicional0; Storage/HR/legacy/payments/Make/Gemini0; producción=false; PII/credenciales crudas0.
