# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-12 18:00 -06:00  
**Estado:** `C6_RUNTIME_10_STOP_RETRY_MEMBERSHIP_RECONCILE_BLOCKED__HOSTING_1_OF_1__PHASE_A_88`

## Pendiente vivo único de continuidad

```text
SOURCE-ONLY membership failure subcode capture · provider=0
→ demostrar error/code exacto del reconcile/handoff
→ corregir únicamente la causa reproducible
→ preflight actualizado PASS
→ nueva autorización HOSTING_RUNTIME_ONCE Staff
→ M7
→ M8
→ M9
→ M10
```

## Ya implementado y no reabrir

- Exact Write V2/canonical readback.
- Formulario único `#loginForm/#lgUser/#lgPass/#lgSubmit`.
- Action explícita/fail-closed.
- Selector Staff dedicado sin Shopper/HR/Firestore.
- Shell Hosting con `bash -n`, sin heredocs anidados.
- Submit QA canónico por Enter desde `#lgPass`.
- Wiring Staff fail-closed contra `tenants/tya/users/{uid}`.
- Handoff authority-ready → membership reverify → stale-empty reconcile → `CX.app.enter()` existente.
- Preflight v4 antes de provider.
- D technical-login rebase/private handoff, Auth340, SKIP13, MultiAuth, HR y M4/static.

No reabrir sin drift reproducible.

## Resultado runtime 10

Run `31652523820`, job `94299776053`, artifact `9163167746`, digest `sha256:be83f65bf5484858fa42844ede9f56f0952bcef06a775fd4244524cc5880799f`.

- preflight Staff v4: PASS;
- Google Cloud auth: PASS;
- selector Staff: PASS (`coordinador`, Shopper/Cliente=false);
- source parity: PASS;
- Hosting DEV: **deploy físico PASS, 1/1 consumido**;
- remote parity: PASS exact=true;
- submit: ejecutado;
- contexto Staff: PASS (`coordinador/staff/tya/cinepolis`);
- HR authority: PASS, **15 periodos / 660 visitas / 211 shoppers**, duplicados=0;
- membership final: FAIL-CLOSED (`membershipVerified=false`, source=null);
- frontend handoff: `blocked`;
- stale empty: backend=true, Corte4=true;
- shell: `appOn=false`, `loginHidden=false`;
- artifact=`FAIL_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`;
- nuevos writes=0; producción=false.

Frontera causal: `C6_CANONICAL_MEMBERSHIP_RECONCILE_BLOCKED_POST_AUTHORITY__EXACT_SUBCODE_NOT_CAPTURED`.

El artifact actual no expone de forma sanitizada el subcódigo exacto de `reconcile(ctx)`, por lo que no debe abrirse otro Hosting hasta identificarlo.

`STOP_RETRY` aplicado: provider ya inició; no rerun, no segundo request, no segundo Hosting bajo esta autorización.

## Pendiente inmediato

Bloque source-only/cero provider para capturar `CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF.error`, `CX_C6_LIVE_USER_ADMIN_WIRING.status/code`, `context.membershipVerified` y `session.user.membershipVerified`. Con esa evidencia se corrige únicamente la causa exacta y se prepara un nuevo one-shot. No reauditar producto ni reabrir gates cerrados.

## Pendiente frontend heredado separado

`app/modules/cliente-extra.js`: PDF print, XLSX y PPTX. No bloquea este proof C6.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**88% certificado | 12% restante | delta certificado runtime 10=+0%.**

## Claude / Academia

Cero cambios a `/app/modules` o UI visual en este cierre. No pedir candidata. Academia se actualiza únicamente después del runtime Staff PASS.
