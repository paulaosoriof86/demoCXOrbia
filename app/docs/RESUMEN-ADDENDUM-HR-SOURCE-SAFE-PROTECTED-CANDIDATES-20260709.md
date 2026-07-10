# Resumen addendum HR source-safe protected candidates

Fecha: 2026-07-09

## Resumen

Se agrega un puente backend dry-run entre HR/source-safe y futuros datos protegidos.

El objetivo es adelantar Phase A TyA sin exponer informacion privada ni escribir base real. La HR viva ya puede generar payload source-safe; este bloque transforma ese payload en candidatos revisables para el backend protegido.

## Candidatos preparados

- shopperPublicRefs;
- shopperIdentityLinkCandidates;
- certificationCarryoverCandidates;
- protectedLiquidationCandidates;
- protectedPaymentBatchCandidates;
- reviewQueueCandidates;
- auditEventCandidates.

## Decisiones

- Los candidatos no son import real.
- Cualquier ambiguedad va a reviewQueue.
- Liquidaciones y lotes son preview/review, no pago real.
- Certificaciones historicas se tratan como carryover candidate antes de pedir repeticion.
- Perfil completo requiere Auth/RBAC.

## Pendiente real

Ejecutar dry-run con payload source-safe generado por la HR viva y revisar reporte antes de cualquier escritura Firestore.

## Estado

Seguro, sin writes, sin produccion y sin informacion sensible.
