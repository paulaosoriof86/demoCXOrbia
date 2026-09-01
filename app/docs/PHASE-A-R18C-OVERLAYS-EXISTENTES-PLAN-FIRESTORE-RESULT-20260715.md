# Phase A R18C — overlays existentes aplicados al plan Firestore V131

Fecha: 2026-07-15

Decisión: **PASS_EXISTING_R11D_R14C_CERTIFICATION_OUTPUTS_APPLIED_TO_PLAN**

## Objetivo

Integrar al plan completo de materialización los resultados TyA ya aprobados, sin repetir reconciliaciones:

- R11D: gap/revisión de referencias shopper;
- R14C: conciliación financiera real contra HR viva;
- R18B: aplicación fail-closed de overlays existentes;
- certificaciones: conservar HOLD hasta fuente de carryover confirmada.

## Resultado verificable

- Plan: `phasea_9f67df19a2b9cd2f`.
- Plan SHA-256: `4701f7bf0cca578702f1e2415a2e9822daf8e6f06da1c4d53bd0d2d4c4865086`.
- Rutas SHA-256: `10967cfeed6ed5b0dffd87fd964a23557b73b5ade57f31a154862abd793607a7`.
- Operaciones: 1,421.
- Lotes: 4, con máximo de 400 operaciones.
- Periodos: 14.
- Visitas: 616.
- Shoppers protegidos: 216.
- Liquidaciones candidatas: 572.

## Overlays conservados sin reproceso

- 196 enlaces financieros exactos R14C aplicados a visitas.
- 196 enlaces financieros exactos R14C aplicados a controles de liquidación.
- 92 ítems financieros de revisión preservados.
- 1 ítem de revisión shopper R11D preservado.
- 0 identidades shopper inventadas.
- 0 enlaces de visita faltantes.
- R11D y R14C no fueron recalculados.

Los 196 enlaces son controles financieros exactos, no pagos. Quedan con:

- `paymentState: pending_financial_review`;
- `paymentConfirmed: false`;
- `paid: false`;
- `lotEligible: false`;
- evidencia de fecha/lote/actor todavía requerida.

## Certificaciones

- Fuente materializable: 0 registros.
- Carryover confirmado: 0.
- Solicitudes automáticas repetidas: 0.
- 216 shoppers quedan protegidos por HOLD hasta revisar la fuente real de certificaciones ya presentadas.

## Validación

El workflow completó correctamente:

1. fixture de regresión;
2. sintaxis;
3. lectura HR viva source-safe;
4. canonicalización R18A;
5. aplicación R18B sin reproceso;
6. construcción del plan completo;
7. aplicación de overlays al plan;
8. validación final;
9. publicación de evidencia reproducible.

Run: `29424007188`.

## Estado seguro

- `writes:false`;
- `imported:false`;
- `production:false`;
- 0 operaciones de pago;
- 0 lotes de pago;
- 0 operaciones de certificación;
- sin deploy;
- sin Make/Gemini;
- sin datos sensibles.
