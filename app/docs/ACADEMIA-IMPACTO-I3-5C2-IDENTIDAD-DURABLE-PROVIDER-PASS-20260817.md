# ACADEMIA — IMPACTO I3.5C-2 · IDENTIDAD DURABLE PROVIDER-BACKED

**Fecha:** 2026-08-17 16:31 -06:00  
**Estado:** `PASS__PERIOD_INDEPENDENT_PROVIDER_BACKED_IDENTITY`

## Aprendizaje confirmado por ejecución real

La identidad de un Shopper no debe reestablecerse al cambiar de período. El run `32076682895` materializó un único vínculo provider-backed y demostró que el mismo registro resuelve agosto y septiembre sin crear un segundo link.

## Evidencia operacional

- provider ACK/readback: PASS;
- identityLinks `0→1`;
- agosto: PASS;
- septiembre: PASS;
- mismo canonical: PASS;
- mismo link: PASS;
- segundo link creado: `false`.

## Conceptos para manuales/cursos

1. **Período operativo ≠ identidad.**
2. **Authority durable:** una adjudicación exacta puede convertirse en autoridad persistida y auditable.
3. **Multi-proyecto:** el scope del vínculo puede ser project-specific o tenant-wide según la fuente; no depende del nombre del proyecto en código.
4. **Multi-tenant:** nunca se reutiliza un vínculo entre tenants.
5. **Alta desde plataforma:** un Shopper nuevo debe salir con Auth, claims, membership, profile e identity link `platform_created` en el mismo cierre lógico controlado.
6. **Fail-closed:** ausencia o conflicto de autoridad no se resuelve por similitud de PII.

## Impacto en rutas por rol y notificaciones

- Administración: una eventual revisión/adjudicación debe ser única por relación técnica, no por período.
- Shopper: cambio de período no debe pedir nueva identidad ni nueva autenticación si su principal sigue vigente.
- Notificaciones: no deben generarse alertas duplicadas de identidad por cada período; solo ante una nueva relación técnica sin autoridad o un conflicto real.

## Fuente

`SOURCE-LOCK-I3-5C2-PERIOD-INDEPENDENT-LINK-PASS-I3-5-I3-6-CLOSED-20260817.md`.
