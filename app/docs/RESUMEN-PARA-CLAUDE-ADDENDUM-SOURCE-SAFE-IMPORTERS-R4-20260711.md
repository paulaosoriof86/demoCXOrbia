# RESUMEN PARA CLAUDE — importadores source-safe R4

Backend ya produce candidatos, `reviewQueue`, `auditEvents`, estados y fuentes para pagos y certificaciones. Claude no debe crear otro importador ni reconstruir dedupe.

Pendiente frontend:

- mostrar archivo, formato, fuente y estado dry-run;
- mostrar aceptados, duplicados colapsados, conflictos, campos sensibles excluidos y blockers;
- pago aceptado en dry-run no significa pago aplicado;
- carryover aceptado en dry-run no significa certificación materializada;
- acción final `pending_backend` hasta persistencia autorizada;
- no mostrar datos privados en previews o logs;
- abrir conflictos por llave estable y motivo.

Estados sugeridos: `dry_run_accepted`, `pending_review`, `conflict`, `pending_materialization`, `confirmed`.
