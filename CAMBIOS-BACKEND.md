# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260819-PHASEA-PROTECTED-RUNTIME-CONVERGENCE-37`

**Avance formal:** **60% / 40%**. I4 cerrado → **85%**; I5/go-live → **100%**.

## 2026-08-19 — I4 SINGLE AUTHORITY + LIVE CHECKPOINT VERIFIER REALIGNMENT

### 1. Causa raíz metodológica cerrada
La continuidad tenía una contradicción real: índice de agosto en I4, pero checkpoint canónico de julio y ausencia de `EXECUTION-STATE`, `SOURCE-LOCK` y plan operativo unificado. Se reconciliaron esas autoridades y el tracker para impedir que nuevas conversaciones vuelvan a `CORTE_0B` o I3.

### 2. Causa raíz runtime localizada y corregida
`app/index-backend-dev.html` carga HR viva y composición protegida. El watcher HR podía aplicar source-safe directamente a `CX.data` después de Auth y antes de que `tya-protected-auth-hr-authority-bridge-v2.js` terminara la composición Auth + Firestore + HR. Se corrigió `app/adapters/tya-live-source-refresh-watch-v2.js` para:
- bloquear direct apply en `authenticated-human-canonical` hasta `CX_PROTECTED_AUTH_HR_AUTHORITY.applied === true`;
- conservar refresh HR después de establecer la autoridad;
- mantener `CX.dataSource.mode='connected'` y sourceRef canónico en el carril protegido;
- exponer `CX_TYA_LIVE_SOURCE_AUTHORITY_LOCK` para gates;
- no tocar módulos UI ni cambiar la interfaz pública `CX.data`.

### 3. Gate stale localizado
El workflow `CXOrbia Phase A Live Execution Checkpoint` llegó con éxito por todas las validaciones previas y falló solo en `Verify Phase A current operational checkpoint` por `CURRENT_CHECKPOINT_MARKER_MISSING:PR #7`. El verificador seguía exigiendo el plan 35%/65% e I3, aunque la autoridad vigente ya es I4 60%/40%. Esto se clasifica `VALIDATOR_STALE / DOCUMENTATION_STATE_DRIFT`, no regresión del producto.

Se realinea `tools/qa/verify-phase-a-live-execution-checkpoint.mjs` para validar fail-closed:
- repo, rama, PR #7, epoch y frontera I4 actuales;
- I1/I2/I3 frozen y tracker 60/40;
- existencia de las cuatro autoridades canónicas;
- `app/index-backend-dev.html` y orden watcher→bridge;
- lock de single-authority del watcher;
- sourceMode/sourceRef y evento canónico del bridge;
- preservación del harness histórico sin reabrirlo;
- cero writes/deploy/merge/producción.

### 4. Documentación sincronizada
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
- `app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`
- `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`
- `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`
- `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`
- `CAMBIOS-BACKEND.md`
- `RESUMEN-PARA-CLAUDE.md`
- `PENDIENTES-PROTOTIPO.md`

### 5. Evidencia post-push ya observada
- `Phase A Source Safe Runtime Guard`: PASS, blockers vacíos, writes/providers/production falsos.
- Workflow Hosting DEV automático: pasos de autorización/deploy saltados; no desplegó sin gate.
- Live Execution Checkpoint: único fallo previo localizado en verificador stale; validaciones I1/I2/I3 y source contracts anteriores pasaron.

### 6. Estado
`PROTECTED_RUNTIME_SINGLE_AUTHORITY_SOURCE_PATCHED_PENDING_RUNTIME_GATE`.

No se incrementa 60% hasta completar gate runtime/E2E real de la misma build.

### 7. Seguridad
0 provider writes, 0 merge, 0 producción, 0 Make/Gemini, 0 pagos. No se declara deploy de este bloque.

## Recovery vigente — 11-nov-2026 — VRM-328, RUN2437, Hosting DEV únicamente

Esta anotación Recovery prevalece sobre el corte histórico I4 anterior: no reabre I4 ni declara Phase A terminada.

- Fuente de producto preservada: `e2458f449ee76d965ee39effdb5790d2e6d45d8c` (árbol `4b331d8bda49fc8a4e0fd46d947cd629ff8000e1`), owner `app/adapters/tya-canonical-shopper-portal-v2.js`: Mi Perfil excluye visitas `submitted` de Activas, coherente con Mis Visitas. QA local source 70/70 dentro del conjunto 121/121 anterior.
- Workflow existente `CXOrbia Recovery I3 DEV Certification` RUN2437 (`43135308161`) y job `i3-current-source-hosting-dev`: `PASS_I3_CURRENT_SOURCE_HOSTING_DEV_ONLY`; nuevo Hosting `sites/cxorbia-backend-dev/versions/8dea702589084bcf`, previo `097e92b33464c10a`. 15 assets comparados byte a byte.
- Cloud Run **no** se reconstruyó ni desplegó: `cxorbia-live-hr-dev-00370-fl2`, mismo digest; sin reglas, HR, Firestore directo, pagos ni producción. La prueba de hash del archivo *específico* Shopper servido y el E2E con Shopper autenticado continúan pendientes; Chrome Admin NOV2026 fue observado.
- Control único acumulativo: descriptor, puntero, matriz `RECOVERY-I3-MODULE-TRUTH-MATRIX-20261111-V296.json`, ledger `CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V610_2026-11-11.json`, receipt `docs/checkpoints/CXORBIA_I3_VRM328_HOSTING_ONLY_DEV_RUN2437_ACK_20261111.json`. No cambian los 328 IDs ni se pierden los PASS humanos B4–B7.
- Academia/Claude: preservar experiencia y módulos aprobados, sin publicar nueva candidata ni declarar cursos o certificaciones completos por el deploy. B1/B2/B3/B8/B9 y Gate20/Gate21 permanecen HOLD hasta pruebas y recibos correspondientes.

### 8. Clasificación
- **Reusable CXOrbia:** single-authority boot lock + verificador canónico no dependiente de checkpoints obsoletos.
- **Exclusivo TyA:** HR Cinépolis y cifras financieras de validación.
- **Claude/prototipo:** sin cambio frontend; no nueva candidata.
- **Academia:** sin reapertura hasta cierre I4.
- **Sin impacto Claude:** QA/docs/backend adapter.
