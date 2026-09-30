# PENDIENTES PROTOTIPO — ADDENDUM CORTE 4 HOSTING DEV PASS

Fecha: 2026-07-29

## Resuelto

- [PASS] Firebase nuevo/vacío verificado.
- [PASS] Web App DEV.
- [PASS] Firestore `us-central1`.
- [PASS] Rules read-only desplegadas/verificadas.
- [PASS] Authentication inicializado.
- [PASS] protected CX.data smoke: `source=firestore`, `empty=true`, `fallbackUsed=false`, writes=0.
- [PASS] cleanup Auth: users=0 y Email/Password deshabilitado.
- [PASS] Hosting DEV Corte 4: exactamente 1 deploy autorizado.
- [PASS] remote proof y entrypoint.
- [PASS] autorización Hosting one-shot consumida/congelada.

## Pendiente inmediato

- [VISUAL] Paula valida el runtime DEV publicado.
- [GATE] Si aparece P0 reproducible, corrección focalizada únicamente.
- [FREEZE] Si no aparece P0, congelar Corte 4.
- [IAM] Retirar roles temporales elevados y dejar runner en Viewer.
- [NEXT] Iniciar Corte 5 materialización DEV con dry-run/idempotencia.

## Backlog no bloqueante preservado

PDF sin gráfica, formato Excel básico, reportKit/copy y demás P1/P2 ya documentados permanecen backlog transversal. No reabren Corte 3 ni bloquean este freeze salvo evidencia nueva P0.

## Prohibiciones vigentes

Sin producción, merge, imports/materialización real antes de Corte 5, pagos/lotes, Make/Gemini live ni nueva candidata frontend por inferencia.
