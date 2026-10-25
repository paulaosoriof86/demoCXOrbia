# Plan staging canonico TyA

Fecha: 2026-07-03

## Estado

La lectura HR viva multi-tab ya quedo validada en preview. El siguiente paso es transformar esa cobertura en staging canonico seguro, sin escritura y sin deploy.

## Archivo tecnico creado

- `tools/migration/tya-build-canonical-staging-plan.mjs`

## Funcion

El script lee el reporte local del full flow HR, clasifica tabs, periodos, paises, filas y columnas, y genera salidas locales bajo:

```text
tmp/tya-canonical-staging
```

Salidas:

- `tyaCanonicalStagingPlan.json`
- `tyaCanonicalStagingPlan.md`

## Reglas

- Tabs operativos: meses/paises de HR.
- Tabs dashboard: excluir de visitas operativas.
- Periodos de preparacion: mantener fuera de historico cerrado.
- Periodos con diferencias de filas o columnas: revision requerida.

## Seguridad

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- Produccion: 0.
- canImport: false.
