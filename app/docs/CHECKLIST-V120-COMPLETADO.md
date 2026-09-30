# CHECKLIST V120

- [x] PASS_COMPROBADO — Análisis IA: counts accepted/duplicates/conflicts/discarded por entidad.
- [x] PASS_COMPROBADO — HR clásica: diff() separa nuevos/dups/conflicts/discarded (antes conflicts se perdían como dup).
- [x] PASS_COMPROBADO — vista de confirmación muestra las 4 categorías + detalle HR vs. existente en conflictos.
- [x] PASS_COMPROBADO — probado en runtime con fixture: 1/1/1/1 exacto.
- [x] PASS_COMPROBADO — sintaxis, smoke 48×3, manifest 0 diffs.
- [ ] NO_ATENDIDO — vistas dry-run separadas para pagos/certificaciones/documentos (Importador solo cubre shopper/visita/cuestionario/cliente/HR).
- [ ] NO_ATENDIDO — resto de OLA2 (CRM/documentos/configuración tenant completos) y OLA3.
