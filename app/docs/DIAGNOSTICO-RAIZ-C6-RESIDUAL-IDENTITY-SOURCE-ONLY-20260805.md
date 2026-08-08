# C6 — Clasificación source-only de causa raíz residual

**Fecha:** 2026-08-05  
**Decisión:** `PASS_C6_RESIDUAL_IDENTITY_ROOT_CAUSE_CLASSIFICATION_SOURCE_ONLY_WITH_HOLDS`

## Conclusión ejecutiva

- El crosswalk 101/8 permanece válido.
- Los 12 fingerprints no prueban una colisión de identidad: son `NO_C6_INSUFFICIENT_EVIDENCE` y deben permanecer HOLD.
- El fingerprint multi-Auth sí es `C6_CONFIRMED`: existen al menos dos candidatos sin discriminador técnico único.
- `83` y `12` son etapas distintas de la misma población: `83 = 71 completados por consenso + 12 restantes`.
- `64/141` y `65/142` no son agregados directamente comparables porque cambió la regla de apellido y cambió el namespace de fingerprints. El gate rígido de 64 es un defecto.

## Matriz de los 12 fingerprints

| Fingerprint | Clasificación C6 | Causa técnica demostrada | Correctivo mínimo no operativo |
|---|---|---|---|
| `cc941934f90032aa48e8` | No-C6 / insuficiente | `complete=false`, basis `unresolved`, sin baseLogin/targetLogin ni estado de conflicto exportado; el artefacto no prueba que falte específicamente apellido | mantener HOLD; separar first/surname/password; exportar conteos y bases source-safe |
| `9ed0cdabf3794b7ccf21` | No-C6 / insuficiente | `complete=false`, basis `unresolved`, sin baseLogin/targetLogin ni estado de conflicto exportado; el artefacto no prueba que falte específicamente apellido | mantener HOLD; separar first/surname/password; exportar conteos y bases source-safe |
| `3451d618b5d6307b87da` | No-C6 / insuficiente | `complete=false`, basis `unresolved`, sin baseLogin/targetLogin ni estado de conflicto exportado; el artefacto no prueba que falte específicamente apellido | mantener HOLD; separar first/surname/password; exportar conteos y bases source-safe |
| `80d716626b85e14778ea` | No-C6 / insuficiente | `complete=false`, basis `unresolved`, sin baseLogin/targetLogin ni estado de conflicto exportado; el artefacto no prueba que falte específicamente apellido | mantener HOLD; separar first/surname/password; exportar conteos y bases source-safe |
| `8aea97650e97902f7616` | No-C6 / insuficiente | `complete=false`, basis `unresolved`, sin baseLogin/targetLogin ni estado de conflicto exportado; el artefacto no prueba que falte específicamente apellido | mantener HOLD; separar first/surname/password; exportar conteos y bases source-safe |
| `32e2de62067ab6ecfb7b` | No-C6 / insuficiente | `complete=false`, basis `unresolved`, sin baseLogin/targetLogin ni estado de conflicto exportado; el artefacto no prueba que falte específicamente apellido | mantener HOLD; separar first/surname/password; exportar conteos y bases source-safe |
| `b31bdc0c7514acbe25ba` | No-C6 / insuficiente | `complete=false`, basis `unresolved`, sin baseLogin/targetLogin ni estado de conflicto exportado; el artefacto no prueba que falte específicamente apellido | mantener HOLD; separar first/surname/password; exportar conteos y bases source-safe |
| `4a59de15805804cbe398` | No-C6 / insuficiente | `complete=false`, basis `unresolved`, sin baseLogin/targetLogin ni estado de conflicto exportado; el artefacto no prueba que falte específicamente apellido | mantener HOLD; separar first/surname/password; exportar conteos y bases source-safe |
| `cfbd0c519e59f40c6239` | No-C6 / insuficiente | `complete=false`, basis `unresolved`, sin baseLogin/targetLogin ni estado de conflicto exportado; el artefacto no prueba que falte específicamente apellido | mantener HOLD; separar first/surname/password; exportar conteos y bases source-safe |
| `540c9e6b71440b393365` | No-C6 / insuficiente | `complete=false`, basis `unresolved`, sin baseLogin/targetLogin ni estado de conflicto exportado; el artefacto no prueba que falte específicamente apellido | mantener HOLD; separar first/surname/password; exportar conteos y bases source-safe |
| `c01e0f344901f03e78d2` | No-C6 / insuficiente | `complete=false`, basis `unresolved`, sin baseLogin/targetLogin ni estado de conflicto exportado; el artefacto no prueba que falte específicamente apellido | mantener HOLD; separar first/surname/password; exportar conteos y bases source-safe |
| `729eb0480d5ec2266a20` | No-C6 / insuficiente | `complete=false`, basis `unresolved`, sin baseLogin/targetLogin ni estado de conflicto exportado; el artefacto no prueba que falte específicamente apellido | mantener HOLD; separar first/surname/password; exportar conteos y bases source-safe |

## Multi-Auth

Fingerprint `7cc28c78de9bfda01d14`: **C6 confirmado**. Tiene nombre source-safe por consenso y login objetivo único, pero al menos dos Auth siguen empatados bajo los discriminadores permitidos. No se debe seleccionar por conveniencia ni por antigüedad.

## Separación de causas

| Hallazgo | Clase | Diagnóstico |
|---|---|---|
| `83` frente a `12` | Error de métrica | `83 = 71 + 12`; el planner llama `initial` a un valor calculado después del consenso |
| 71 completados por consenso | Cambio legítimo de clasificación | Regla autorizada y source-safe; puede mover perfiles entre grupos |
| `65/142` frente a `64/141` | Cambio de modelo + defecto de gate | misma población, distinta regla; no debe existir gate rígido `==64` |
| 12 `technical_surname_unresolved` | Defecto de diagnóstico | la etiqueta se aplica a `complete=false` y puede conflar nombre, apellido o semilla de contraseña |
| 1 multi-Auth | Estado real C6 | empate técnico persistente; fail-safe correcto |

## Distribuciones

- Estable 64/141: `{2: 55, 3: 6, 4: 2, 5: 1}` por número de identidades activas.
- Actual 65/142: `{2: 56, 3: 6, 4: 3}` por número de perfiles activos completos.
- Sin un fingerprint de grupo estable entre versiones no se puede identificar source-safe qué perfil migró entre los grupos de 5, 4 y 2.

## Correctivo mínimo propuesto, no aplicado

1. Separar `preConsensusIncompleteActiveProfiles`, `completedByConsensus` y `remainingIncompleteActiveProfiles`.
2. Para cada HOLD exportar solo booleanos y conteos: primer nombre, apellido, semilla de contraseña, candidatos explícitos/técnicos/consenso, bases y conflicto.
3. Mantener el multi-Auth en STOP_RETRY y exportar vector de señales por candidato sin UID, correo ni PII.
4. Sustituir el gate rígido `collisionGroups === 64` por reconciliación de conjuntos con un fingerprint de grupo estable y la misma versión de algoritmo.
5. Detenerse antes de cualquier provider read o repair.

## Estado seguro

Provider reads/writes, Auth/password/membership/Firestore/Rules/Storage/HR writes, deploy, Make, Gemini, pagos, merge y producción: `0/false` en este bloque.
