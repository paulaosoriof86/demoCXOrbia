# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_CREDENTIAL_CONTINUITY_AUTH91_READBACK_PASS__HOSTING_DEV_REDEPLOY1_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

## 1. No reabrir
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL:1,406/1,406 Firestore data writes/readback; no repetir.
- Corte5 `CX.data`: `cinepolis`,14 periodos,616 visitas, `currentPeriodId=2026-07`, source=firestore/fallback=false PASS.
- Corte6 previo: claims5/5 + Rules PASS; Hosting DEV previo1/1 consumido.
- No nueva candidata, rama, PR, Firebase o Hosting por rutina.

## 2. Contrato de acceso corregido
Firebase Auth continúa como autoridad backend, pero TyA conserva el contrato visible `Tipo de acceso + Usuario + Contraseña`.

- namespaces: `staff` / `shopper`;
- email Firebase interno determinístico y no visible;
- claims: tenant/project/role/namespace y shopperId exacto;
- no selección visual de rol como autorización;
- no password/token/UID persistido en UI.

El dedupe global por username quedó descartado: staff y shopper pueden compartir username legítimamente.

## 3. Activación real ya ejecutada
### Auth
`PASS_EXACT_AUTH_IMPORT_READBACK`.
- importadas91;
- readback91/91;
- Auth17→108;
- shopper88 + super1 + coordinador2;
- password resets0;
- deletes0;
- overwrite0;
- Firestore/Rules/Hosting writes durante import0.

### Hosting DEV
Ejecutado **solo después** del readback91/91.
`PASS_EXISTING_HOSTING_DEV_CREDENTIAL_CONTINUITY_REMOTE_VERIFIED`.
- mismo site `cxorbia-backend-dev` / target `cxorbia-dev`;
- deploy adicional1/1;
- browser-auth PASS;
- entrypoint PASS;
- proof PASS;
- username/password namespaced PASS;
- preservedLegacyAuthUsers91;
- nuevo Firebase/Hosting0;
- Firestore/Rules/Storage/HR/legacy/payments/functions/Make/Gemini0.

## 4. Evidencia source-safe / HOLD
- source shopper282;
- credential groups109;
- exact duplicates collapsed93;
- ambiguous groups18 /records77 HOLD;
- 21 shoppers sin match canónico exacto HOLD;
- demo role1 HOLD;
- PII/credencial legible en repo0.

El plan antiguo de12 está superseded; no usar.

## 5. Claude — regla actual
**No nueva candidata. No rediseñar login. No tocar `app/modules/*`.**

La corrección reusable ya está en el adapter backend/browser. Solo abrir tarea frontend si la visual inmediata demuestra un P0 reproducible localizado. El proveedor/email técnico no debe hacerse visible.

## 6. P1/P2 preservado
- PDF sin gráfica final;
- Excel sin formato final;
- reportKit/exportaciones transversales;
- copy de fuentes/readiness.

No bloquean Phase A salvo evidencia P0.

## 7. Siguiente validación
Ahora corresponde validar visualmente el ingreso con **credenciales TyA existentes**, sin pedir passwords por chat. Si pasa, se congela Corte6.

Después: `refresh HR → resolver Agosto HN → materializar solo delta agosto → preprod/cutover`.

## 8. Academia/manuales
Registrar que Auth91/91 y el redeploy DEV ya pasaron. Enseñar namespace/tipo de acceso, usuario ≠ email provider, recuperación/cambio, scopes, shopperId exacto, dedupe seguro, fail-closed y troubleshooting.

## 9. Estado seguro
PR #7 draft/open/no merge. Auth imports91/readback91; password resets0; deletes0; Firestore data writes0; Rules0; Hosting adicional1; Storage/HR/legacy/payments/functions/Make/Gemini0; producción=false; PII/credenciales crudas0.
