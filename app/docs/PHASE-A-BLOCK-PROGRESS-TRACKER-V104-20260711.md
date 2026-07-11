# Tracker Phase A — candidata V104

## Completado

- Recepción y gate de identidad de V104.
- Comparación forense V103→V104.
- Validación estructural: 67 JS/MJS, 0 errores, 49 módulos únicos.
- Verificación de manifest: FAIL reproducible.
- Verificación de evidencia de smoke: ausente.
- Pruebas semánticas de Portal Cliente, liquidación/pago y permisos multipaís.
- Evaluación de las cuatro correcciones anteriores.
- Creación del paquete acumulado frontend-only para Claude.
- Documentación de patrones reutilizables, mejoras R5, Academia y pendientes.

## Avances V104 a preservar

- Histórico excluye activo.
- Guards parciales null-safe y demo.
- `pagada_preview` sin fecha de realización.
- eliminación de `countries[0]`.
- archivo inicial de visitas con auditoría.

## En progreso — Claude

- integridad de entrega/manifest/smoke;
- source honesty y aislamiento de fixtures;
- pagos/lotes, certificación y permisos;
- Dashboard, historial y copy;
- Academia acumulada y responsive.

## Backend protegido

R5 sigue operativo y no cambia. V104 no se empalma hasta aprobar la siguiente candidata.

## Fuentes reales pendientes

Continúan pendientes los dos exports limpios de pagos/movimientos y certificaciones para dry-run real. No pedir nuevamente reglas ya documentadas.

## Gate

V104 HOLD. Predeploy HOLD. Import/materialización HOLD.

## Siguiente bloque exacto

1. Claude corrige V104 con el paquete acumulado.
2. Recibir nueva candidata completa.
3. Auditar contra V104 y contra R5.
4. Empalmar de tres vías solo si pasa.
5. Repetir smoke source-safe, roles y móvil.
6. Continuar dry-run real al recuperar las fuentes limpias.
