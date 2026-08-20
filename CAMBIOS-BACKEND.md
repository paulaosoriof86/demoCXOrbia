# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4-PROTECTED-RUNTIME-CLOSED-38`

**Avance formal:** **85% / 15%**. I1–I4 `PASS/FROZEN`; I5 preproducción/go-live activo. El porcentaje es avance del plan, no autorización de producción.

## 2026-08-19 — I4 CIERRE TERMINAL · SAME-BUILD RUNTIME + FINANCE EQUIVALENCE

### 1. Hosting DEV autorizado y consumido
Se materializó una sola vez el producto exacto `f9802fdd498934a8e7729fa5c7d18341bec1cd71` en Firebase Hosting DEV.

Evidencia:
- run `32328316954`;
- job `96303971844`;
- artifact `9392151808`;
- `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`;
- paridad exacta local/remota del adapter protegido;
- 1 deploy DEV, 0 provider/data/Auth/Firestore/HR/Storage/Make/Gemini/payment writes.

### 2. Staff/Admin runtime provider-backed PASS
Se ejecutó el cierre read-only sobre la misma build desplegada.

Evidencia:
- run `32329139725`;
- artifact `9392431939`;
- `PASS_READONLY_POST_GATES`;
- `PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY`;
- autoridad HR/plataforma, exact crosswalk, legal receipt y estabilidad reload/new-tab PASS;
- inventario vivo observado: 15 periodos, 660 visitas, 200 shoppers; crosswalk protegido 209;
- 0 writes, 0 deploy adicional, 0 merge, 0 producción.

El intento multirrol previo que encontró el estado histórico de contraseña Shopper no produjo reset ni write y se clasifica deuda del harness, no regresión del producto.

### 3. Shopper preservado sin reproceso
No se repitió login Shopper ni se modificaron credenciales. Se reutiliza el checkpoint real congelado `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`. La ejecución Staff confirmó reutilización de perfil/membership/crosswalk/history y blobs protegidos sin cambio; `historicalShopperAccessThisRun=0`, `passwordResetsThisRun=0`.

### 4. Equivalencia financiera cerrada sin rerun redundante
`app/data/tya-payment-history-source-safe.js` conserva el mismo blob `088c68680177c470a4539622e1694128dd211d85` en el source desplegado `f9802f...` y en la rama.

La comparación `f9802f... → 8831723a...` mostró únicamente:
- `.github/cxorbia-gate-requests/request.json`;
- `backend/config/i3-11-identity-link-runtime-bridge-rules-hosting-dev.json`.

No hubo cambios en `app/`; por tanto la cadena financiera desplegada es byte-equivalente a la fuente congelada.

Verdad canónica preservada:
- mayo 2026: 44/44 pagadas;
- junio 2026: 2/44 pagadas, 42 pendientes;
- Q451 confirmado en junio;
- `liquidada != pagada`;
- 0 lotes ejecutables creados.

`R16D` se conserva como PASS de review source-safe, pero no reemplaza la autoridad histórica de pago más reciente.

### 5. Deriva de gate-state corregida
Durante el cierre se detectó que ambos requests one-shot ya ejecutados seguían persistidos como `enabled=true / consumed=false`. Se corrigió directamente en la rama viva:
- Staff request: `consumed=true`, `enabled=false`, evidencia terminal run `32329139725`;
- Hosting request: `consumed=true`, `enabled=false`, `actualHostingDeploys=1`, evidencia terminal run `32328316954`.

Commits de corrección de estado:
- `246cc1dd61886911dfdeb36555effb514d587a2f`;
- `8831723a4cf3e656b3dddd1ed5c72b45f0dc2ec8`.

No se tocó `app/`, proveedor ni datos. Esto elimina el riesgo de reruns accidentales.

### 6. Academia
Se creó `app/docs/ACADEMIA-ADDENDUM-I4-PROTECTED-RUNTIME-CLOSE-20260819.md`. No se reconstruyó Academia. Se documentó la alineación con autoridad runtime única, identidad exacta, HR/plataforma, estados financieros honestos y command/provider ACK.

### 7. Cierre formal
I4 queda `PASS/FROZEN`. El score formal pasa **60% → 85%** y la frontera única queda:

`I5_PREPRODUCTION_AND_GO_LIVE`

Subestado activo sin nueva autorización:

`I5_1_PREPRODUCTION_READINESS_AND_UAT_PLAN_READONLY`

### 8. Próximo bloque
Preparar en read-only regresión transversal, scopes/RBAC, aislamiento tenant/proyecto, seguridad/PII/secrets, rollback/checkpoint y matriz UAT. No desplegar PREPROD ni PRODUCCIÓN sin autorización específica.

### 9. Clasificación
- **Reusable CXOrbia:** same-build equivalence, one-shot consumption, single-authority runtime y exact identity.
- **Exclusivo TyA:** HR Cinépolis y verdad financiera Mayo/Junio.
- **Claude/prototipo:** sin tarea frontend nueva por I4.
- **Academia:** alineación documentada; no reconstrucción.
- **Sin impacto Claude:** gate-state, source lock, evidencia y documentación.

### 10. Seguridad
I4 consumió exactamente 1 Hosting DEV autorizado. Cierre documental: 0 segundo deploy, 0 merge, 0 producción, 0 provider/data/HR/Auth/Storage writes, 0 Make/Gemini y 0 ejecución bancaria.

---

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

No se incrementó 60% en ese momento hasta completar gate runtime/E2E real de la misma build; ese gate queda cerrado en la sección superior de este documento.

### 7. Seguridad
0 provider writes, 0 merge, 0 producción, 0 Make/Gemini, 0 pagos. No se declara deploy de ese bloque source.

### 8. Clasificación
- **Reusable CXOrbia:** single-authority boot lock + verificador canónico no dependiente de checkpoints obsoletos.
- **Exclusivo TyA:** HR Cinépolis y cifras financieras de validación.
- **Claude/prototipo:** sin cambio frontend; no nueva candidata.
- **Academia:** alineada al cierre I4.
- **Sin impacto Claude:** QA/docs/backend adapter.
