# RC Phase A drift gate

Fecha: 2026-07-06

## Bloque completado

Se agrego un drift gate para proteger la decision de RC Phase A controlada despues de que pasaron el gate tecnico y el smoke visual.

## Problema que evita

Despues de validar runtime, se siguieron agregando documentos. Eso esta bien.

Pero si antes del corte se cambia runtime de nuevo, la evidencia anterior ya no basta. En ese caso se deben repetir los smoke gates y actualizar el SHA validado.

## Runtime validado

Ultimo runtime validado con smoke tecnico y visual:

- `a7fb4f00cf1adf1e6e92ee7b1de897cfdbacd374`

## Archivos creados

- `tools/release/tya-rc-phase-a-drift-gate.mjs`
- `.github/workflows/cxorbia-rc-phase-a-drift-gate.yml`
- `app/docs/RC-PHASE-A-DRIFT-GATE-20260706.md`

## Que valida

Compara `validatedRuntimeSha..HEAD` y permite solo cambios documentales/release:

- `app/docs/**`
- `docs/**`
- `README*`
- `.github/workflows/cxorbia-rc-phase-a-drift-gate.yml`
- `tools/release/tya-rc-phase-a-drift-gate.mjs`

Si detecta cambios de runtime posteriores al SHA validado, devuelve `NO_GO_DRIFT`.

## Workflow

Archivo:

- `.github/workflows/cxorbia-rc-phase-a-drift-gate.yml`

Ejecuta:

```bash
node tools/release/tya-rc-phase-a-drift-gate.mjs \
  --validated a7fb4f00cf1adf1e6e92ee7b1de897cfdbacd374 \
  --out .tmp/rc-phase-a-drift
```

## Criterio

### GO_DOCS_ONLY_AFTER_VALIDATION

Se puede mantener la decision RC Phase A si despues del SHA validado solo hay cambios permitidos/documentales.

### NO_GO_DRIFT

No se debe avanzar a corte si aparecen cambios en:

- `app/index.html`
- `app/app.js`
- `app/core/**`
- `app/modules/**`
- `app/styles/**`
- `app/manifest.webmanifest`
- cualquier runtime no permitido

En ese caso se debe repetir smoke tecnico y visual, y actualizar el SHA validado.

## Impacto Claude

No hay paquete Claude nuevo importante en este bloque.

Solo debe notificarse a Claude si se cambia runtime o UI real despues del SHA validado, o si aparece una regresion visual importante.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin proveedores reales, sin imports y sin datos sensibles.
