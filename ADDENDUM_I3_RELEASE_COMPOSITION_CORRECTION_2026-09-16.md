# ADDENDUM — Corrección de composición I3 — 2026-09-16

## Alcance
Corrección focal dentro del carril **CXOrbia Recovery**. No crea una metodología, candidata, rama, repositorio ni Firebase nuevos. No modifica el `CXORBIA_RELEASE_INTEGRITY_LOCK_2026-09-16` congelado.

## BEFORE
La certificación final de I3 estaba fragmentada: Shopper, DEV certification, Gate 20 y Gate 21 vinculaban `PRODUCT_SOURCE_SHA` históricos distintos (`c733131...`, `8775b1c...`, `bd2a519...`, `53683d0...`). Esto permitía demostrar gates válidos sobre fuentes diferentes sin demostrar una única release certificable.

## Error demostrado
Clasificación: `RELEASE_COMPOSITION_FAILURE`.

La comparación de lineage confirmó que los cuatro deltas aprobados relevantes están contenidos en el HEAD canónico congelado `b94911a4748c03c2e604415e8a97ee091da96218`. No falta reimplementar esos deltas; el defecto reside en la configuración de certificación que conserva punteros históricos independientes.

## AFTER
Se congela una única fuente de producto para el cierre I3:

- `I3_CERTIFICATION_SOURCE_SHA=b94911a4748c03c2e604415e8a97ee091da96218`
- `I3_CERTIFICATION_SOURCE_TREE=e3efd4afa9ffcb973e66e40e08798eba4e6c0f34`
- build input: `git archive $I3_CERTIFICATION_SOURCE_SHA`
- un único build de runtime para esa fuente;
- DEV Hosting servido desde el mismo archive;
- Shopper P0/E2E, Gate 20 y Gate 21 deben comprobar esa misma fuente/build;
- Gate 21 debe fingerprintar el artefacto generado por el run de certificación, no reconstruirlo;
- I4 deberá desplegar exactamente ese artefacto y la imagen inmutable certificada, sin rebuild.

## MODULE_TRUTH_MATRIX focal
| Delta | Evidencia histórica | Estado en `b94911a4748c03c2e604415e8a97ee091da96218` | Clasificación |
|---|---|---|---|
| Shopper credencial/sesión | `c733131344111f498c830ec5e380c49c88d89d40` | contenido | `MATCH` |
| runtime legal/cache | `8775b1cccbc4a97e87e7996cf409bc1f490d0ccd` | contenido | `MATCH` |
| reconciliación HR | `53683d0e7bb62e90de3ca4b8063db9e85f5d40ee` | contenido | `MATCH` |
| Gate 20 predicate | `bd2a519db5ebd08f17d47827997056db795c8c09` | contenido | `MATCH` |
| configuración de certificación por SHA independiente | workflows I3 | no compuesta | `APPROVED_NOT_COMPOSED` |

## Causa
Los gates evolucionaron incrementalmente y conservaron su SHA histórico como autoridad local. La equivalencia parcial entre árboles fue usada como sustituto de una identidad única de release.

## Efecto
La certificación pasa de equivalencia entre fuentes históricas a identidad única de fuente, build y artefacto.

## Invariantes preservados
- rama canónica única `recovery/cxorbia-phase-a-20260831`;
- producción `DO_NOT_TOUCH` hasta `I3=GO` + autorización expresa;
- no reimportación de datos;
- no reapertura de I0/I1/I2 ni gates PASS sin drift;
- secretos fuera de logs/artefactos;
- Shopper conserva contrato mínimo operativo aprobado;
- un FAIL focal no autoriza auditoría general.

## Regla prevalente de composición
Desde este addendum queda prohibido que Gate 20, Gate 21, Shopper u otro gate terminal de I3 defina un `PRODUCT_SOURCE_SHA` independiente. Todos deben resolver la fuente desde `I3_CERTIFICATION_SOURCE_SHA` y demostrar paridad material con el artefacto certificado.
