# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-14 14:00 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__I1_PASS__I2_PASS__I3_RESET2_CONSUMED__HISTORICAL_NAV_FALSE_NEGATIVE_LOCALIZED__LEGAL_GATE_AWARE_HARNESS_PASS__GO_LIVE_35__PROVIDER_GATE_REQUIRED`

## 1. Lectura obligatoria y prevalente

1. `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md`
2. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`
3. `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`
4. `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`
5. `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`
6. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`
7. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
8. `AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`
9. `ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md` — actualizado a I3 legal-gate-aware.
10. `SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`
11. `SOURCE-LOCK-ITERATION3-STOP-RETRY-POST-CREDENTIAL-RECOVERY-ADMIN-LOGIN-POINTER-20260814.md` — blocker histórico/cerrado.
12. `SOURCE-LOCK-ITERATION3-HARNESS-DURABILITY-PASS-20260814.md`
13. `SOURCE-LOCK-ITERATION3-HISTORICAL-LEGAL-GATE-AWARE-HARNESS-PASS-20260814.md` — lock prevalente del subgate histórico.
14. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`
15. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, PR #7 y HEAD vivo.

## 2. Decisión vigente

I1 e I2 están cerradas y no se reprocesan. I3 continúa en la misma candidata `docs-tya-v6-v71-audit` / PR #7. No nueva candidata, rama, PR, Auth rebuild ni reauditoría general.

El segundo gate durable autorizado por Paula fue consumido una única vez en run `31835742956`, job `94881540163`.

PASS antes del STOP_RETRY:

- mismo único Shopper histórico exacto;
- un nuevo credential reset exacto autorizado;
- UID/claims/shopperId/profile/history preservados;
- other identities modified `0`;
- membership/crosswalk exactos reconciliados;
- proxy del source exacto activo;
- contexto Firebase Shopper autenticado y `CX_PROTECTED_AUTH_HR_AUTHORITY.applied===true` alcanzados.

El run se detuvo esperando `#nav-aprendizaje`; Admin/new Shopper quedó SKIPPED y no se creó checkpoint histórico sanitizado.

## 3. Causa source del falso negativo localizada

El E2E histórico imponía Academia/Certificación como prerrequisito incondicional antes de cerrar identidad + HR + historia. Sin embargo, `CX.app.enter()` puede diferir `CX.router.mount()` cuando `CX.confidencialidad.pending(CX.session.role)` está activo.

Por tanto, un primer acceso con NDA/confidencialidad pendiente puede tener Auth/HR/historia válidos sin que todavía existan los nodos `#nav-aprendizaje` / `#nav-cert`. El harness no distinguía esos estados.

## 4. Harness legal-gate-aware — PASS source-only

`tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs` ahora:

- valida primero Auth exacto, scope, identity, reviewQueue, HR authority, sourceRef e historia;
- consulta el mismo `CX.confidencialidad.pending('shopper')` del producto;
- si el gate legal está pendiente, exige que el diálogo legal sea visible, preserva el principal y difiere rutas sin declararlas PASS;
- si no hay gate legal pendiente, Academia y Certificación siguen siendo obligatorias;
- jamás acepta/firma/guarda NDA automáticamente;
- no usa force-click ni write APIs.

Source gate: `PASS_I3_HISTORICAL_LEGAL_GATE_AWARE_SOURCE`.

## 5. Seguridad

La autorización `...-03` quedó consumida/parked. No hubo retry automático. Admin/new Shopper no corrió.

Después del run, la corrección fue solo source/docs: cero nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes, deploy, merge o producción.

## 6. Porcentaje

**GO-LIVE: 35% completado / 65% pendiente.** I3 no suma sus 25 puntos hasta PASS completo.

## 7. Siguiente gate exacto

`PAULA_REVIEW_REQUIRED_FOR_I3_LEGAL_GATE_AWARE_HISTORICAL_CHECKPOINT_AND_ADMIN_NEW_SHOPPER_RESUME`.

No se autoriza nueva candidata, Auth rebuild, aceptación legal automatizada, HR/Make/Storage/pagos, deploy, merge ni producción.
