# Resumen para Claude — baseline V106 empalmada con Phase A R8

## Baseline futura

Claude deberá continuar exclusivamente sobre el frontend V106. No debe regresar a V103/V104 ni importar R5/R6/R8. ChatGPT/Codex harán auditoría y empalme posterior.

## Hecho — no reabrir

- Histórico excluye el periodo activo por defecto.
- `pending_backend` no habilita certificación.
- Práctica preview no emite evento operativo.
- Dashboard eliminó las dos KPIs fabricadas `cumplimiento+6/+8` fuera de demo.
- Permisos geo-sensibles fallan cerrado si falta país para usuarios con scope.
- Archivo de visita sustituye hard-delete inicial.
- Historial de estados visible con empty state.
- Copy puntual WhatsApp Dashboard condicionado por gate.

## Parcial o pendiente

1. Manifest/identidad única y smoke reproducible.
2. Portal Cliente sin síntesis fuera de demo.
3. Aislamiento demo con procedencia/namespace, sin borrar datos reales.
4. Pago/lote solo con evidencia financiera completa y lote estable.
5. Beneficios restringido al shopper autenticado.
6. Contexto real en call-sites de permisos.
7. Certificación con segundo actor autenticado y lifecycle completo.
8. Métricas financieras con fuente o `pending_source`.
9. Historial: pago confirmado solo con evidencia completa.
10. Copy residual y manuales alineados.
11. Academia según contrato profundo R8.
12. Smoke source-safe, roles sensibles, Cliente, Academia y 360/390/412 px.

## Backend reusable a reflejar, no implementar

- tenant/proyecto/periodo separados;
- modos demo/source-safe/connected/pending source;
- llaves estables y reviewQueue;
- liquidación ≠ pago;
- práctica/carryover ≠ certificación confirmada;
- dry-run ≠ materialización;
- outbox/requested ≠ envío confirmado;
- soft-delete, motivo, auditRef y restauración;
- permisos por acción/entidad;
- estados R6/R8: plan preparado, preflight validado, pendiente target limpio, pendiente autorización, materializando, confirmado, fallido y rollback requerido.

## No tocar

`core/tya-phase-a-*`, `data/tya-*`, `index-tya-phase-a-source-safe.html`, `backend/`, `tools/`, `.github/workflows/`, snapshots, adapters, importadores reales, Firebase, Make, Gemini y datos TyA.
