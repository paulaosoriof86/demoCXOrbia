# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-22  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**PHASE_A:** `98/100`

## Fuente funcional y proveedor

Source funcional congelado: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. Source-fix G2-B aislado: `1d2cfecba0a89b637398d747a628e549d9823c68`.

Producción canónica: project `cxorbia-backend-dev`; Hosting `cxorbia-backend-dev`; Cloud Run `cxorbia-live-hr-dev` us-central1.

**Revisión Cloud Run actual:** `cxorbia-live-hr-dev-00011-f2f`, creada exclusivamente por CP119 config containment; misma imagen/service account que `00010-n78`, sin Cloud Build ni Hosting deploy ni cambio de source funcional.

## Plan lock

Plan blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`; SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`; fase F0. El plan no cambió. `providerMutationAuthorizedNow=false`.

## Runtime provider-write actual

El HTTP mutation surface de `hr-live-service` queda clasificado 3/3:
- user-admin: product write activo, Firebase ID token + tenant exacto + `super`;
- legal: CP119-contained, provider responde 423 antes de auth;
- G2-B synthetic: deshabilitado en provider y bloqueado por el plan.

El server rechaza otros non-GET con 405.

## Source authority histórica nueva

CP124 demuestra que `tools/empalme/tya-apply-post-v96-source-lock.sh` puede reescribir source histórico, crear commit y pushear la rama viva sin current master plan/continuity lock/current authorization.

CP125 demuestra que `phase-a-v105-v106-empalme-request.source-safe.json` conserva `authorized=true` sin terminalización y el materializador asociado puede reemplazar 70 rutas runtime históricas.

Estos artefactos **no cambian el source lock vigente** y no se ejecutan. Se reservan para tombstone/inertización F1.

## G2-B histórico vs proveedor actual

Receipt G2-B conserva baseline/after histórico `00010-n78` y decisión `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; no se reescribe. Provider actual es `00011-f2f` por CP119, por lo que el readiness anterior es stale y F3 debe revalidar antes de cualquier futura recuperación.

## F0

125 hallazgos; 28 HOLD/P0 acumulados; CP093 y CP119 contenidos; 26 residuales. Exhaustividad 2/4.

## Próximo

Continuar F0 read-only sobre `backend/config`, execute markers/aliases/ledgers y provider/tool write entrypoints restantes. No tocar G2-B.
