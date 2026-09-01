# CAMBIOS BACKEND — C6 Shopper Login Collision Classification HOLD

**Fecha:** 2026-08-05  
**Clasificación:** Reusable CXOrbia · Exclusivo TyA · Sin impacto visual Claude

## Alcance ejecutado

Se creó y gateó el clasificador source-safe para:

- 109 grupos candidatos con el mismo `nombre.apellido`;
- 238 perfiles incluidos en esos grupos;
- un perfil con dos candidatos Auth;
- validación de apellido únicamente mediante campo explícito, login legacy o fuente técnica;
- clasificación activo/histórico;
- plan primario no superpuesto para 340 perfiles.

## Archivos source

- `tools/qa/cxorbia-c6-shopper-login-collision-classification.mjs`
  - blob `ef95c59442728be6a326b8240c3f74ae9a3551af`;
- `tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs`
  - blob `9633a1db7fa071cf21350f27e7bb7d0cf00b1591`;
- manifiesto activo repinado sin modificar módulos ni producto.

## Source/static

```text
run=31061161498
job=92489240097
artifact=8952153534
digest=sha256:ec793ef97bc8c4fd57df6e5b412aa108324dec65a1aa0af3f0622f78d9cf2a64
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

## Revisión provider read-only

```text
run=31061262965
job=92489532791
artifact=8952193087
digest=sha256:4eaf9354e4ed15996237af74fcea05c5b99bc2ec97f1be063dc8d8e52f1dc95f
HOLD_C6_SHOPPER_LOGIN_COLLISION_CLASSIFICATION
```

## Resultado

```text
109 grupos / 238 perfiles
39 grupos resueltos: un activo canónico + históricos preservados
64 grupos: personas activas técnicamente distintas con el mismo login visible
141 identidades activas afectadas
6 grupos con apellido técnico no verificable
83 perfiles activos sin apellido técnico verificado
125 perfiles históricos sin apellido técnico verificado
1 perfil multi-Auth aún empatado
```

Plan no ejecutable:

```text
CREATE_AUTH=5
UPDATE_AUTH=3
NO_OP=45
HOLD=162
PRESERVE_NO_AUTH=125
TOTAL=340
planDigest=bb82bbf6f7b2a1335668287dc631fa8de73ba39197f07f4e85e014ee9f41af57
```

## STOP_RETRY

El request fue consumido. No se aplicó ninguna regla de desambiguación ni se realizó segundo intento.

## Estado seguro

Auth/password/membership/Firestore/Rules/Storage/HR writes, Hosting, Cloud Run, Make, Gemini, pagos, merge y producción: `0/false`.

## Siguiente bloque exacto

Decisión de tenant sobre la regla mínima para los 64 grupos de personas activas distintas, más completar source-safe los 83 apellidos técnicos activos y resolver el perfil multi-Auth, antes de cualquier write.
