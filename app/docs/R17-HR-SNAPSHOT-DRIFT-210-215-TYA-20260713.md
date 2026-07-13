# R17 — drift de snapshot HR TyA 210 → 215

Fecha: 2026-07-13

## Hallazgo

Durante la revisión humana, la URL Hosting DEV desplegada mostró 210 shoppers source-safe.

Un nuevo build read-only de la HR, ejecutado después de la revisión, produjo:

- 14 periodos;
- 616 visitas;
- 215 referencias shopper protegidas;
- periodo actual JUL 2026;
- 44 visitas del periodo.

El smoke visible anterior esperaba 210 y falló con:

`shopper_count_mismatch:215/210`

Run: `29292760530`.

Artifact digest:

`sha256:15bacc20bb40b8c989db4f326102414e4e7e2cb78f19de58ad91a95ded882bfc`

## Interpretación

Esto confirma que la URL desplegada no está consultando la HR en runtime. Sirve un snapshot generado en el deploy anterior, mientras un build read-only posterior ya observa una cantidad diferente.

No se concluye todavía que 215 sea la población histórica definitiva. El baseline histórico protegido era 213 y el snapshot desplegado mostraba 210. La diferencia 210/213/215 requiere reconciliación por referencias opacas, no por nombre.

## Decisión

`HOLD_SHOPPER_REFERENCE_DRIFT_210_213_215`

- no actualizar la UI a 215 por conteo ciego;
- no inventar, fusionar ni eliminar shoppers;
- comparar referencias estables por fuente/periodo/país;
- separar altas nuevas reales, duplicados/variantes y referencias históricas ausentes;
- conservar certificaciones ya presentadas cuando exista enlace estable.

## Impacto

- **Reusable CXOrbia:** snapshot debe exponer `sourceSnapshotAt`; runtime debe indicar si está sincronizado o desactualizado.
- **Exclusivo cliente:** reconciliación TyA 210/213/215.
- **Claude/prototipo:** mostrar conteo como snapshot y estado pendiente de reconciliación; no fijar 210/213/215 en UI.
- **Academia:** explicar drift de snapshot y reconciliación por llave estable.
- **Sin impacto Claude:** lectura HR, hashes y artifact.

## Estado seguro

Read-only/source-safe. Sin PII, writes, imports, deploy, reglas, Functions, pagos o producción.
