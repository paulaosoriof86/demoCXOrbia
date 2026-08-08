# Lista revision candidata P0

Fecha: 2026-07-05

## Uso

Aplicar cuando Claude entregue un ZIP nuevo.

## Revision minima

1. Confirmar que el ZIP tiene cambios reales.
2. Confirmar que corrige textos P0.
3. Confirmar que no agrega promesas operativas nuevas.
4. Confirmar que no toca backend.
5. Confirmar que no rompe carga de scripts.
6. Confirmar que no introduce errores de sintaxis.
7. Confirmar que no cambia reglas Phase A sin documentar.
8. Confirmar que pendientes de Academia quedan documentados.

## Decision

- `candidate_for_empalme`: puede empalmarse.
- `manual_review_required`: revisar antes.
- `no_real_delta`: no aporta cambio real.
- `critical_blocker`: no usar.

## Regla

No hay source lock hasta auditoria aprobada.
