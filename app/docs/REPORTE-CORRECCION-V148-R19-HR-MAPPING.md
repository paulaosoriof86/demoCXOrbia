# REPORTE DE CORRECCIÓN — V148 (paquete R19 Crítico 2 — mapping contract HR)

Baseline: `Prototype development request CXOrbia V147.zip`.

## Cambio
`modules/hr-source.js`: se agregan y persisten los campos exigidos por
el Crítico 2 que faltaban en la configuración de Hoja de Ruta:
- modo de sincronización (manual/programada/webhook);
- identificador del mapping contract;
- campo de link por visita;
- llaves estables (lista);
- flags de qué gobierna la HR (asignación/agenda/realización/
  cuestionario/submit).

`CX.hrSource.save()` amplía su whitelist para incluir estos campos
(sigue sin persistir URLs reales, solo metadatos del contrato, tal
como exige el resto del módulo).

Verificado en runtime: guardado con `hr-contract-v3` / sync
`programada` / link field / llaves / gobierna.asignacion=true —
`CX.hrSource.get()` devuelve exactamente esos valores.

## Gate técnico
- Sintaxis: PASS.
- Runtime: 0 errores, valores persistidos verificados por objeto.
- Manifest V148 regenerado, 0 diffs.

## Pendiente
- Gate de agregar Colombia con recarga: verificado manualmente en la
  sesión anterior (persiste bandera/moneda/filtros), no se agregó un
  test automatizado permanente.
- Crítico 1.A (gate MAY/JUN/JUL contra runtime source-safe real de
  Hosting DEV): no reproducible en este entorno de solo-demo.
