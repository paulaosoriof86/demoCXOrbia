# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-12 17:17 -06:00  
**Estado:** `C6_RUNTIME_07_STOP_RETRY_PRE_HOSTING__SOURCE_REPAIR_APPLIED__PHASE_A_88`

## Pendiente vivo único de continuidad

```text
NEW HOSTING_RUNTIME_ONCE Staff sobre HEAD reparado
→ C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF
→ M7
→ M8
→ M9
→ M10
```

## Ya implementado y no reabrir

- Wiring Staff fail-closed contra `tenants/tya/users/{uid}`.
- Formulario único `#loginForm/#lgUser/#lgPass/#lgSubmit`.
- Exact Write V2/canonical readback.
- D technical-login rebase/private handoff.
- Auth340, SKIP13, MultiAuth, HR y M4/static.
- Action explícita/fail-closed; sin derivación por sufijo.
- Selector Staff dedicado sin Shopper/HR/Firestore.
- Smoke Staff dedicado sin transformaciones textuales.
- Preflight Staff antes de provider.
- Reparación shell del paso Hosting: sin heredocs Node anidados.
- Preflight ampliado: `bash -n` del script Hosting exacto antes de provider.

No reabrir sin drift reproducible.

## Resultado runtime 07

Run `31649967019`, job `94291913408`, artifact `9162195599`, digest `sha256:91af7648302218477177f7e2785b4b32bea517e2cdebe0b41cc60d082136891e`.

- preflight Staff: PASS;
- Google Cloud auth: PASS;
- selector Staff dedicado: PASS (`coordinador`);
- Hosting intentado=false;
- Hosting=`0/1`;
- runtime=null;
- artifact=`FAIL_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`;
- nuevos provider/data writes=0;
- producción=false.

Causa raíz: `PREFLIGHT_SHELL_SYNTAX_COVERAGE_GAP__NESTED_HEREDOC_INDENTATION`. Bash falló antes de source gate/deploy/runtime. No hay nuevo fallo demostrado de producto/Auth/Firestore/membership/HR.

`STOP_RETRY` aplicado: no rerun, no segundo request, no segundo Hosting.

## Reparación ya aplicada

- workflow `66cffe4a0f236097264d2e0b2f361115464c8e34`: heredocs anidados eliminados;
- preflight `b024fd97cd7360a90a32041eb57bd0b003a029a2`: extracción del shell real + `bash -n` PASS obligatorio + bloqueo de heredoc anidado.

No se ejecutó otro workflow después de la reparación.

## Pendiente inmediato

Nueva autorización explícita para un nuevo `HOSTING_RUNTIME_ONCE` Staff, bound al HEAD vivo reparado, con action exacta `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`. El preflight actualizado debe PASS antes de provider; luego máximo un Hosting DEV y runtime canónico con reload x3/new-tab. Ante fallo post-provider: `STOP_RETRY`.

## Pendiente frontend heredado separado

`app/modules/cliente-extra.js`: PDF print, XLSX y PPTX. No bloquea este proof C6.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**88% certificado | 12% restante | delta certificado runtime 07=+0%.**

## Claude / Academia

Cero cambio frontend en este bloque. No pedir candidata. Academia se actualiza únicamente después del runtime Staff PASS.
