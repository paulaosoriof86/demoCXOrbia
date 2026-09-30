# Phase A local builder execution control TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Definir el control para una futura ejecucion local del builder source-safe Phase A, de forma que cuando se necesite computador exista un solo flujo seguro, sin rutas manuales dispersas y sin reprocesos.

Este bloque no pide ejecutar nada ahora. No genera output local. No activa runtime.

## Archivos agregados

- `backend/contracts/phase-a-local-builder-execution-control-v1.json`
- `tools/contracts/tya-phase-a-local-builder-execution-control-validate.mjs`

## Principios

- Flujo de un solo bloque/comando cuando Paula tenga computador.
- Local only.
- No datos privados en chat.
- No output `.tmp` commiteado.
- No runtime.
- No writes.
- No imports.
- No deploy.
- No produccion.
- Solo Phase A real TyA.
- No repetir Level 0/1.
- No pedir otra vez insumos ya documentados.

## Contratos requeridos antes de una corrida local

- `backend/contracts/phase-a-source-safe-input-builder-contract-v1.json`
- `backend/contracts/phase-a-realdata-domain-readiness-pack-v1.json`
- `backend/contracts/phase-a-source-safe-domain-mapping-v1.json`
- `backend/contracts/phase-a-cxdata-dev-adapter-contract-v1.json`
- `backend/contracts/phase-a-accumulated-readiness-gate-v1.json`

## Inputs locales cuando se necesiten

### `hrSourceSafeReportPath`

Ruta local al reporte HR source-safe/full-flow. No puede ser HR cruda, Excel crudo, CSV crudo, base vieja, fixture ni `.tmp` tratado como original.

### `sanitizedTyaExportPath`

Ruta local opcional a export TyA original sanitizado, sin DPI, banco, email, telefono ni nombre crudo.

### `projectConfigPath`

Ruta local opcional a configuracion source-safe si no se usa contrato repo.

## Outputs locales permitidos

Solo bajo `.tmp`:

- `.tmp/source-safe/tya-phase-a-domains.source-safe.local.json`
- `.tmp/tya-phase-a-realdata-domain-readiness-pack/phase-a-realdata-domain-readiness-pack-report.json`
- `.tmp/tya-phase-a-realdata-domain-readiness-pack/phase-a-realdata-domain-readiness-pack-report.md`

No se commitean.

## Plan de comando unico futuro

Cuando se necesite computador, el bloque debe:

1. Confirmar ruta del repo.
2. Confirmar rama `docs-tya-v6-v71-audit`.
3. Validar contrato builder source-safe.
4. Validar contrato realdata readiness pack.
5. Ejecutar builder local solo si existen inputs source-safe.
6. Validar output con readiness pack.
7. Escribir reportes solo en `.tmp`.
8. Imprimir verdict y siguiente accion.

No debe:

- hacer `git add .tmp`;
- commitear output local;
- subir datos privados;
- habilitar adapter;
- cambiar runtime;
- escribir Firestore;
- escribir HR;
- desplegar;
- llamar Make/Gemini;
- ejecutar pagos.

## Assertions de seguridad

- Output no commiteado.
- Input source-safe.
- Sin marcadores sensibles.
- Reglas Phase A preservadas.
- Sin side effects de runtime.

## Hard stops

- Rama/repo incorrecto.
- Contrato requerido faltante.
- Pedir datos privados en chat.
- HR cruda detectada.
- Marcador sensible detectado.
- Base vieja detectada.
- Fixture marcado como real.
- `.tmp` marcado como original.
- Output local commiteado.
- Adapter habilitado.
- Runtime conectado.
- Write Firestore/HR.
- Import.
- Deploy.
- Make/Gemini.
- Pago.
- Reproceso Level 0/1.

## Validador

Uso tecnico futuro:

```bash
node tools/contracts/tya-phase-a-local-builder-execution-control-validate.mjs --out .tmp/tya-phase-a-local-builder-execution-control
```

El validador solo revisa el contrato de control. No ejecuta builder.

## Impacto Claude/prototipo

Claude no debe representar esto como datos ya cargados. Debe mostrar estados honestos si el flujo local aun no se ha ejecutado o si el dry-run no ha pasado.

## Impacto Academia

Academia debe explicar por que un flujo local source-safe existe antes del runtime, por que no se sube `.tmp`, por que no se comparten datos privados por chat y por que una corrida local no equivale a import ni produccion.

## Estado seguro

- Sin cambios en `/app/modules` o `/app/core`.
- No se pidio comando a Paula.
- Builder no ejecutado.
- Output local no commiteado.
- Adapter no habilitado.
- Sin runtime conectado.
- Sin import de dominios.
- Sin deploy.
- Sin produccion.
- Sin Firestore/Auth/Storage.
- Sin HR writes.
- Sin Make/Gemini.
- Sin correos/WhatsApp reales.
- Sin pagos reales.
- Sin import real.
- Sin datos sensibles.
