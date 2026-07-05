# Go/no-go antes de ejecucion local - CXOrbia TyA

Fecha: 2026-07-05

## Objetivo

Definir el filtro previo antes de pedirle a Paula que ejecute comandos locales readiness.

## Estado actual

Paula no debe ejecutar nada ahora.

Solo se pedira ejecucion si se cumple un caso real de validacion local segura.

## GO: cuando si pedir ejecucion

Pedir ejecucion solo si se cumplen todas estas condiciones:

1. La carpeta local del repo esta confirmada.
2. Existen `app/` y `tools/` en esa carpeta.
3. La rama local es conocida.
4. El objetivo es preview o diagnostico local.
5. No hay produccion, deploy, merge ni import real.
6. No hay escrituras reales.
7. No hay proveedores reales.
8. No se espera copiar datos sensibles.
9. Paula ya recibio instruccion explicita: `Paula, ahora si ejecuta este bloque`.

## NO-GO: cuando no pedir ejecucion

No pedir ejecucion si:

- seguimos esperando candidata Claude P0;
- no se conoce la carpeta correcta;
- no se conoce la rama local;
- se pretende validar produccion;
- se pretende hacer deploy, merge o import real;
- se requiere proveedor real;
- se espera salida con datos sensibles;
- hay conflicto entre fuentes, repo, ZIP o documentos.

## Comandos preparados, no activos

```powershell
pwd
git branch --show-current
git status --short
node tools/migration/tya-local-readiness-consistency-check.mjs
node tools/migration/tya-local-readiness-preflight.mjs
node tools/migration/tya-phase-a-local-readiness-runbook.mjs
```

## Frase obligatoria antes de ejecutar

Paula solo debe ejecutar cuando reciba esta frase exacta:

`Paula, ahora si ejecuta este bloque`

Si esa frase no aparece, no ejecutar.

## Despues de ejecutar

Aplicar:

- `app/docs/CHECKLIST-SALIDAS-LOCALES-READINESS-20260705.md`
- `app/docs/TEMPLATE-REPORTE-LOCAL-READINESS-20260705.md`

## Decision actual

NO-GO. No pedir ejecucion local ahora. Mantener espera operativa controlada.
