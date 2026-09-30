# C6 AUTH DUPLICATE — MATRIZ HUMANA MÍNIMA DE OWNERSHIP

**Fecha:** 2026-08-10  
**Estado:** `PAULA_MINIMUM_OWNERSHIP_DECISION_REQUIRED`  
**Modo:** source-safe · no provider · no repair  
**HEAD al inicio del bloque:** `21b112fb11a4690246550bdd51f7937c386cfaf2`

## 1. Regla de decisión

Esta matriz no identifica personas ni infiere ownership. Solo presenta disposiciones técnicamente válidas usando los fingerprints ya congelados.

Opciones:

- `KEEP_ONE_MEMBER`: Paula elige exactamente un candidate fingerprint del par como keeper. La evidencia source-safe no puede hacerlo por sí sola.
- `RETIRE_BOTH_IF_CANONICAL_EXTERNAL_EXISTS`: ambos miembros del par quedan destinados a retiro posterior únicamente si Paula confirma que existe y debe prevalecer un principal canónico externo. No ejecuta retiro.
- `PRESERVE_BOTH_PENDING_OWNER_MAPPING`: ambos quedan sin cambios y el conflicto continúa en HOLD hasta tener owner mapping humano.
- `CANONICAL_EXTERNAL_KEEP_HISTORICAL_PAIR_NONCANONICAL_PENDING_RETIRE`: aplicable cuando el principal canónico externo ya está demostrado; se clasifica el par histórico como no canónico pendiente de un repair separado.

## 2. Grupo `1acdcb3782b7cf351056` · super

Members congelados:

- `6dee7f31c738218ce63a`
- `b561d9c46660715e214f`

Evidencia source-safe: ambos son legacy/pre-import, namespace `NONE`, equivalentes bajo los discriminadores autorizados y ninguno coincide con la clase staff canónica importada.

Decisiones válidas:

1. `KEEP_ONE_MEMBER` → requiere que Paula elija uno de los dos fingerprints.
2. `PRESERVE_BOTH_PENDING_OWNER_MAPPING` → no requiere distinguir members.
3. `RETIRE_BOTH_IF_CANONICAL_EXTERNAL_EXISTS` → requiere confirmación humana de que un principal canónico externo representa al owner correcto de este grupo.

**No existe selección automática válida.**

## 3. Grupo `2c4d19f2b066835473d3` · admin

Members congelados:

- `aa5cbada6c5388ee1d8b`
- `f8405e17df357c121ccc`

Evidencia source-safe: ambos son legacy/pre-import, namespace `NONE`, equivalentes bajo los discriminadores autorizados y ninguno coincide con la clase staff canónica importada.

Decisiones válidas:

1. `KEEP_ONE_MEMBER` → requiere que Paula elija uno de los dos fingerprints.
2. `PRESERVE_BOTH_PENDING_OWNER_MAPPING`.
3. `RETIRE_BOTH_IF_CANONICAL_EXTERNAL_EXISTS` → requiere confirmación humana del principal canónico externo correspondiente.

**No existe selección automática válida.**

## 4. Grupo `54225792eeb65f6739c0` · ops

Members congelados:

- `ce178298b2df136541d4`
- `19937aedc77af3404bdc`

Evidencia source-safe: ambos son legacy/pre-import, namespace `NONE`, equivalentes bajo los discriminadores autorizados y ninguno coincide con la clase staff canónica importada.

Decisiones válidas:

1. `KEEP_ONE_MEMBER` → requiere que Paula elija uno de los dos fingerprints.
2. `PRESERVE_BOTH_PENDING_OWNER_MAPPING`.
3. `RETIRE_BOTH_IF_CANONICAL_EXTERNAL_EXISTS` → requiere confirmación humana del principal canónico externo correspondiente.

**No existe selección automática válida.**

## 5. Grupo `ae2f920fe6d9ce1fdd82` · Cliente

Members históricos congelados:

- `ca9e2f644334833ab572`
- `360af509dcdcd1880f04`

Aquí sí existe una ancla externa demostrada: el Cliente canónico actual es un principal separado con fingerprint source-safe `6a74d2b7c77f7b3f026b9ad0bef86183bc4e028b67f429ee36ab772587e5953c`, namespace `staff`, scope `tya/cinepolis`, sign-in/readback/idempotencia y membresía PASS.

Decisiones válidas:

1. `CANONICAL_EXTERNAL_KEEP_HISTORICAL_PAIR_NONCANONICAL_PENDING_RETIRE` → conservar el principal externo ya validado como único canónico y clasificar ambos históricos como no canónicos pendientes de repair posterior.
2. `RETIRE_BOTH_IF_CANONICAL_EXTERNAL_EXISTS` → equivalente en intención, sin ejecutar retiro.
3. `PRESERVE_BOTH_PENDING_OWNER_MAPPING` → conservar los dos históricos sin cambios además del canónico externo.
4. `KEEP_ONE_MEMBER` → exige que Paula elija exactamente uno de los dos históricos; la evidencia no puede escogerlo.

## 6. Entrada humana mínima requerida

Responder solamente con una decisión por grupo. Formato sugerido:

```text
1acd = <opción>
2c4d = <opción>
5422 = <opción>
ae2f = <opción>
```

Si se elige `KEEP_ONE_MEMBER`, agregar el fingerprint exacto del miembro elegido. Si se elige `RETIRE_BOTH_IF_CANONICAL_EXTERNAL_EXISTS` para A–C, confirmar además que existe un principal canónico externo correcto para ese grupo.

## 7. Seguridad

```text
providerReads=0
providerWrites=0
AuthWrites=0
IAMWrites=0
FirestoreReads/Writes=0/0
HRReads/Writes=0/0
RulesWrites=0
StorageWrites=0
PREWRITE=false
Activation=false
newSmoke=false
Make=0
Gemini=0
payments=0
deploys=0
merge=false
production=false
```

No se usaron antigüedad, orden, nombre, email crudo, UID, shopperId, metadatos temporales ni inferencia visual.
