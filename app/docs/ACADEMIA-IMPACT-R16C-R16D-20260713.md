# Academia — impacto R16C y R16D

Fecha: 2026-07-13

## Lección operativa principal

Academia debe enseñar que un registro de control no equivale a una fuente financiera ni a un pago confirmado.

Flujo correcto:

1. La HR crea el control operativo de la visita.
2. El control de liquidación representa que la visita puede pasar por revisión financiera.
3. R14C enlaza una fila financiera solo por llave estable.
4. Una coincidencia exacta sigue siendo control financiero, no pago.
5. Los casos sin enlace exacto pasan a revisión.
6. El pago solo cambia a confirmado con evidencia y gate posterior.

## Datos del caso TyA

- 616 visitas canónicas;
- 572 controles de liquidación;
- 247 filas financieras;
- 196 overlays exactos;
- 376 controles pendientes de fuente exacta;
- 51 filas financieras en revisión;
- 92 ítems en cola financiera total;
- 210 shoppers live, 213 referencias históricas;
- 213 certificaciones pendientes de fuente;
- 0 pagos inferidos.

## Por rol

### Admin/operativo

- interpretar `pending_exact_source_link`;
- revisar conflictos sin sobrescribir;
- no marcar paid por fecha o estado liquidada;
- excluir reviewQueue de lotes.

### Shopper

- ver pago confirmado únicamente cuando exista confirmación real;
- no ver una fila de control como depósito realizado.

### Superadmin

- revisar lotes, auditoría y rollback antes de autorizar materialización;
- distinguir cuota proveedor de error de negocio.

## Errores frecuentes

- sumar controles y filas financieras como si fueran la misma entidad;
- enlazar por nombre o monto;
- inferir certificación;
- borrar registros existentes por diferencia de conteo;
- repetir lecturas proveedor automáticamente hasta agotar cuota.

## Clasificación

- **Reusable CXOrbia:** currículo de conciliación y materialización.
- **Exclusivo cliente:** cifras TyA/Cinépolis.
- **Claude/prototipo:** futuro backfill P1, no P0.
- **Academia:** contenido de este documento.
- **Sin impacto Claude:** cuota, hashes y workflows manual-only.

## Estado

Documento de backfill. No modifica Academia, no activa Gemini y no publica cursos.
