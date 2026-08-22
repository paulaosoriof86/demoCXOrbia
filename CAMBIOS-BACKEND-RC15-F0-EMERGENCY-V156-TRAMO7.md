# CAMBIOS-BACKEND — RC15 F0 EMERGENCY V156 / TRAMO 7

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## P0 probado y autorización

Se demostró un P0 de control-plane fuera del HEAD vivo: un commit documental sobre PR #7 disparó el run `32534531824`, `CXOrbia V156 Direct Empalme`, usando el workflow histórico que seguía presente en la rama base `release/cxorbia-tya-rc-20260630`.

Ese workflow histórico tenía `pull_request/synchronize`, `contents:write`, acceso al secret DEV, descarga de un delta V156 desde Drive protegido, aplicación potencial de 35 archivos y `git push` directo a `docs-tya-v6-v71-audit`. El run observado no llegó a aplicar ni pushear porque falló el SHA histórico antes de esos pasos. Ese fallo accidental no se acepta como control de seguridad.

Paula autorizó en la conversación vigente el `PLAN_CHANGE_REQUEST` de emergencia `RC15-PCR-EMERGENCY-V156-BASE-WORKFLOW-INERTIZATION-20260821-01`, exclusivamente para inertizar esa superficie, sin provider writes, deploy, datos, producción, merge ni cambios funcionales del prototipo.

## Contención ejecutada

La rama de control-plane/base avanzó de `4a85e7e4d0eb31691d7b77e3551ed7cafabb5984` a:

`fc7ead694ccdb01bee79856d47a761d34c8d88b9`

Commit: `fix(rc15): inert historical V156 PR synchronize writer`.

Delta exacto: **1 archivo**:

- `.github/workflows/cxorbia-v156-atomic-promotion.yml`

El workflow quedó reducido a una cápsula histórica inerte:
- sin trigger `push`;
- sin trigger `pull_request` ni `synchronize`;
- `contents:read`;
- sin service-account secret;
- sin descarga Drive;
- sin materialización V156;
- sin commit/push;
- sin deploy;
- único job con `if: false`.

El nuevo blob del workflow es `fe7691a6e53d51ff6a73a5df340541ba84d99594`. La comparación de la rama base confirma un único commit y un único archivo modificado respecto de `4a85e7...`. No se observaron workflow runs asociados al commit de contención.

## PLAN_CHANGE_REQUEST y plan congelado

El plan maestro no se reescribió, no se sustituyó y no cambió de versión. Su identidad permanece:
- Git blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`;
- SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`;
- versión `1.0.0`;
- fase `F0_SYSTEMIC_AUDIT`.

La excepción autorizada se registra como contención de emergencia dentro de F0 y no altera la secuencia F0→F10 ni reabre G2-B.

## F0 continuado — Tramo 7

La clasificación canónica avanza de **92 a 106 hallazgos**.

Se han descubierto acumulativamente **24 superficies HOLD/P0**. Una de ellas, `RC15-CP-093`, quedó contenida de inmediato por la autorización de emergencia; quedan **23 HOLD residuales** pendientes del tratamiento conjunto posterior.

### Nuevos hallazgos

- `RC15-CP-093` — **P0 probado y contenido**: autoridad V156 sobrevivía en la rama base del PR y podía reingresar por `pull_request/synchronize`. Contención: commit `fc7ead...`, workflow inerte.
- `RC15-CP-094` — **HOLD residual**: `tya-hr-country-tab-consistency-current.yml` + request `live-hr-country-tab-consistency.json` conserva `enabled=true`, `contents:write`, acceso al secret DEV, live HR/provider reads y commit de evidence/registry sin continuity-lock/consumed-ledger actual.
- `RC15-CP-095` — prototype baseline atomicity: read-only/static validator.
- `RC15-CP-096` — R17 semantic gate: remote/browser read-only, artifacts-only.
- `RC15-CP-097` — RC drift gate: source/read-only validator.
- `RC15-CP-098` — source-lock post-V96: read-only manifest verifier.
- `RC15-CP-099` — liquidation/certification source-safe: read-only projection validator.
- `RC15-CP-100` — historical V110 RC smoke: manual historical read-only diagnostic.
- `RC15-CP-101` — Phase A visual smoke: local browser/read-only validation.
- `RC15-CP-102` — source-safe runtime guard: read-only validator.
- `RC15-CP-103` — Corte4 entrypoint script integrity: repository/status gate, no source/provider write.
- `RC15-CP-104` — VIS02 remote diagnostic: public HTTP/browser/status-only.
- `RC15-CP-105` — VIS02 script probe: public HTTP/status-only.
- `RC15-CP-106` — VIS02B final remote diagnostic: public HTTP/browser/status-only.

## Nueva precisión de causa raíz

RC15 demuestra ahora una séptima clase del problema de gobierno: **la autoridad ejecutable histórica puede sobrevivir en la rama base del PR y reactivarse por sincronización aunque el workflow ya no exista en el HEAD vivo**. Esto explica por qué una iteración documental podía disparar trabajo histórico aparentemente cerrado.

El modelo de solución sigue siendo único: terminar F0 exhaustivo; F1 tombstone conjunto de las autoridades residuales; F2 enforcement de plan + continuity lock + consumed ledger/current read authority antes de credenciales, provider/HR/legacy access o repo mutation; solo después F3/F4 de G2-B bajo nueva autorización expresa.

## Incidente de herramienta

Durante la contención se preparó correctamente un tree y el commit objeto `d2a3edf6377b130f3b6206959f4a42eb31b3aee7`, pero no se llegó a enlazar a ningún ref. La escritura efectiva del único archivo autorizado terminó haciéndose mediante actualización individual y produjo `fc7ead...`. El commit `d2a3...` queda dangling, sin ref y sin efecto sobre rama, proveedor o datos. Se documenta porque ninguna desviación de herramienta debe ocultarse.

## Seguridad y efectos

En esta contención y continuación F0:
- provider writes = 0;
- Cloud Build = 0;
- Cloud Run deploy = 0;
- Hosting deploy = 0;
- Firestore/Auth/Storage/HR writes = 0;
- datos reales = 0;
- recovery G2-B = 0;
- synthetic stage = 0;
- Make/Gemini = 0;
- pagos = 0;
- merge = false;
- frontend funcional = sin cambios.

## Clasificación

- **Reusable CXOrbia:** control de autoridad también sobre rama base del PR; inertización estructural; enforcement previo a acceso sensible.
- **Exclusivo TyA:** workflow histórico V156, HR country-tab y requests TyA.
- **Claude/prototipo:** sin cambios en `/app/modules`, `/app/core` ni UI.
- **Academia:** sin cambio funcional; se mantiene como requisito transversal del plan.
- **Sin impacto Claude:** contención control-plane, evidence y documentación.

## Siguiente exacto

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE`.

No iniciar F1 mientras los cuatro flags de exhaustividad sigan false. No tocar G2-B, recovery ni synthetic stage.
