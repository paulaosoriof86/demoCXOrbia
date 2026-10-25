# Phase A TyA — integridad operativa de periodos e histórico

Fecha: 2026-07-11
Baseline: V103 empalmada con Phase A.

## Problema recuperado de la validación visual previa

La HR ya estaba sanitizada y separada en 14 periodos, pero el runtime heredado seguía tratando todos los periodos source-safe como `activo` porque `periodState()` caía al valor local por defecto. Esto podía hacer que Histórico/Periodos aparentaran mezcla operativa aun cuando las 616 visitas ya tenían IDs de periodo únicos.

## Cambio operativo

Se agregó `core/tya-phase-a-period-history-integrity.js`, cargado solamente por la entrada source-safe local empalmada. Antes de que los módulos consuman la data:

- valida secuencia mensual continua;
- valida IDs únicos de periodo y visita;
- valida 44 visitas por periodo;
- valida 34 GT + 10 HN;
- valida tabs HR por periodo/país;
- valida que cada visita apunte al periodo correcto;
- marca 13 periodos históricos como `cerrado` y julio 2026 como único `activo`;
- expone `visitsForPeriod`, `historicalPeriodsForProgram` y `historicalVisitsForProgram`;
- bloquea y vacía la hidratación source-safe si existe drift estructural, sin caer a demo.

En GitHub se agregaron además contrato, snapshot source-safe sanitizado, validador reproducible y workflow CI. El payload completo y la entrada source-safe continúan dentro del runtime empalmado local, no fueron sustituidos por el placeholder del repo.

## Resultado real

- 14 periodos;
- 13 históricos cerrados;
- 1 activo: 2026-07;
- 44 visitas activas;
- 572 visitas históricas;
- cada periodo: GT 34 + HN 10;
- cero cruces de visita entre periodos;
- 18 warnings de columna `disponibleDesde` faltante en tabs antiguos, tratados como warning, no como dato inventado.

## Límite

No modifica módulos UI. Histórico todavía puede listar el periodo activo porque ese filtro visual pertenece a Claude/prototipo; el backend ya entrega estado correcto y métodos separados.

## Estado seguro

Sin deploy, import, Firestore/Auth/Storage writes, HR writeback, Make/Gemini, pagos ni producción.
