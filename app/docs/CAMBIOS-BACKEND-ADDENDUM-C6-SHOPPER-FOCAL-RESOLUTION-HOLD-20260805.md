# CAMBIOS BACKEND — C6 Shopper Focal Resolution HOLD

**Fecha:** 2026-08-05  
**Clasificación:** Reusable CXOrbia · Exclusivo TyA · Sin impacto visual Claude

## Alcance ejecutado

Se corrigió exclusivamente el resolver source-safe para:

- derivar `nombre.apellido` desde el perfil exacto únicamente después del binding por `shopperId` o claves técnicas;
- aceptar apellido explícito, login técnico o nombre completo del perfil enlazado;
- comparar las dos candidatas Shopper de Paula por estado, actividad, visitas, HR, credencial, Auth y claims;
- reconciliar `21/30/28` y la lectura actual mediante conjuntos de fingerprints;
- recalcular colisiones reales;
- mantener una operación primaria por cada uno de los 340 perfiles.

## Archivos source modificados

1. `tools/qa/cxorbia-c6-shopper-identity-resolution-review.mjs`
   - blob anterior: `f4c1b0c778ba8395b7553100c4f08481cd3f57c1`;
   - blob vigente: `6ca283662a84bdf4b99eb19cfd8325d33a26dd7b`;
   - commit: `fbd0284acdfb1d322fe281f8c439843f30935a70`.

2. `tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs`
   - blob anterior: `fd4969858bbc6ade6bc69d0a6ee40dfca70488d3`;
   - blob vigente: `5cfbdcc5d3eea719eded3b31e06823a500c6109a`;
   - commit: `d36953c3507761166478ada529d791131c9057f4`.

3. `app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`
   - se repinaron exclusivamente resolver y dispatcher;
   - source commit: `f91acb97f913cd8a445f9e73407a594c284b4fff`;
   - estado final del bloque documentado en commit `9f2f29de730a61637171b9021b3f469382e2538c`.

No se modificaron módulos, diseño, Login, `CX.data` ni lógica de negocio.

## Source/static — PASS

```text
run=31059576130
job=92484349960
artifact=8951552902
digest=sha256:5ae40b1a338d9594ffc3368477673677f2462ddd14e0e2b2d313dbf0b6e5311a
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

## Única revisión provider read-only — HOLD

```text
run=31059688423
job=92484697881
artifact=8951593943
digest=sha256:fcaba14c38c2fcc1014563ac0edadc33bd40370511189dd01d511f5ff6176326
HOLD_C6_SHOPPER_IDENTITY_RESOLUTION_REVIEW
```

## Resultados

La corrección eliminó el falso bloqueo anterior de 109 nombres incompletos. Quedaron:

```text
canonical login collision groups=109
profiles inside those groups=238
multiple Auth candidate profiles=1
canonical names still incomplete=3
unresolved profiles=241
```

Distribución de grupos `nombre.apellido`:

```text
94 grupos de 2 perfiles
11 grupos de 3 perfiles
3 grupos de 4 perfiles
1 grupo de 5 perfiles
```

Ningún grupo presentó un ancla técnica compartida suficiente para fusionión automática. Se requiere clasificación técnica grupo por grupo entre alias históricos y personas activas distintas.

## Paula

La comparación source-safe resolvió las dos candidatas:

```text
resolution=RESOLVED_ACTIVE_PROFILE_VS_HISTORICAL_BY_TECHNICAL_ACTIVITY
active candidate: status active + 1 credential + canonical name complete
historical candidate: 6 historical visits + 0 credential + no current active state
```

No se creó Auth Shopper ni se modificó la identidad Staff.

## Baseline por conjuntos

```text
historical reference=109 / 21 / 30 / 28
current mapped=101
current unmapped=8
missing Auth=21
login exceptions=16
password exceptions=18
all fingerprint sets complete=true
```

## Plan no superpuesto, no ejecutado

```text
CREATE_AUTH=6
UPDATE_AUTH=2
NO_OP=10
HOLD=241
PRESERVE_NO_AUTH=81
TOTAL=340
planDigest=ec16fb653bb8bf57a499b1ddc26ed8e64bd32ddb3d3debfac9eef6f2882efc40
```

## STOP_RETRY y seguridad

Cero Auth/password/membership/Firestore/Rules/Storage/HR writes, deploy, Cloud Run, Make, Gemini, pagos, merge o producción. No se exportaron nombres, logins, contraseñas ni UID.

## Siguiente bloque exacto

Clasificar source-safe los 109 grupos de login visible, el perfil con dos Auth y los tres nombres incompletos; resolver primero activo vs histórico y detenerse ante cualquier grupo de personas activas distintas que requiera una regla mínima de desambiguación del tenant.
