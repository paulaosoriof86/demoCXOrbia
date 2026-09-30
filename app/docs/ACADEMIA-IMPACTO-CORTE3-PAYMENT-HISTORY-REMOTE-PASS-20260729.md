# ACADEMIA — Impacto Corte 3 histórico de pagos — 2026-07-29

## Estado pedagógico

La implementación está técnica y remotamente PASS; la publicación final en manuales/cursos se completa después del `APROBADO` visual de Paula.

## Contenido aprobado para incorporar

### Cadena operacional-financiera

`visita → liquidación → conciliación/revisión financiera → pago confirmado → grupo histórico o lote`

Cada etapa es independiente. Una visita realizada no prueba pago; una liquidación exacta no prueba pago; una revisión financiera puede coexistir con un pago confirmado.

### Histórico de pagos source-safe

- Se conserva evidencia de pagos anteriores sin subir Excel crudo, PII o datos bancarios.
- Se usan `tenantId`, `projectId`, `periodKey`, `visitId` y `hrRowId`.
- Nunca se empareja únicamente por nombre.
- Los grupos históricos son inmutables y no ejecutables.
- Un grupo histórico no es un lote creado por CXOrbia.

### Fecha y precisión

Cuando la fuente solo informa el día de pago, se conserva:

- `paidAt=null`;
- `paidAtPrecision=source_day_only`;
- `paidDay` original.

No se inventa mes, hora o timestamp completo.

### Caso TyA

- Mayo 2026: 44 pagos completos, CxP cero, dos revisiones financieras preservadas.
- Junio 2026: dos pagos confirmados y 42 pendientes.
- GTQ y HNL permanecen separados.

## Manuales/cursos a actualizar después del freeze

- Finanzas y Dashboard.
- Movimientos y Tesorería.
- Liquidaciones y Lotes.
- Mis Beneficios Shopper.
- Importación/migración source-safe.
- Errores frecuentes: revisión ≠ impago; pago ≠ lote; fecha parcial ≠ fecha inventada.

## Sin impacto de operación

No se ejecutaron pagos, lotes, imports, writes, Make ni Gemini.
