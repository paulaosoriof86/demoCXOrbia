# ACADEMIA — ADDENDUM PLAN UNIFICADO PHASE A · NO DESVIACIÓN

**Fecha:** 2026-08-17  
**Última sincronización:** 2026-08-17 15:12 -06:00  
**Estado:** `ALIGNED__I3_5_PROVIDER_CROSSWALK_REQUIRED__I3_6_HARNESS_SOURCE_FIXED`

## Regla

Cortes 0B→8, S1→S6 e I1→I5 son una sola ruta. Cada cambio funcional PASS revisa manual, curso/lección, checklist, errores, glosario, ruta por rol y notificaciones.

## Aprendizaje vigente

I3.4 confirma que una asignación HR no es una postulación de plataforma.

I3.5A confirma que un identificador source-safe puede parecer técnico y aun derivar de un dato humano. `shp-*`/shopperCode derivados de texto HR no son anclas canónicas independientes. Una identidad canónica requiere autoridad técnica exacta independiente y, cuando no existe una relación materializada, debe pasar por validación/provider-backed crosswalk con revisión fail-closed; nunca nombre/email/teléfono/WhatsApp/username/hash derivado como atajo.

Los contratos de candidatos dejan `shopperIdentityLinkCandidates` como `not_written`; por ello un candidato source-safe no equivale a identidad materializada.

I3.6 preserva no reproceso: evidencia historical Shopper PASS se reutiliza. El defecto de checkout shallow del harness fue corregido source-only para traer la referencia congelada; no se repite login/reset.

I3.7 durable legal provider receipt permanece PASS; consentimiento nunca se automatiza.

## Progreso

Formal 35%/65% por scoring integral de I3. Operativamente I3.1/.2/.3/.4/.7 PASS y I3.6 product/evidence PASS; I3.5 provider crosswalk es la frontera actual.

## Fuente

`SOURCE-LOCK-I3-5A-NO-INDEPENDENT-CROSSWALK-I3-6-HARNESS-SOURCE-FIX-20260817.md`.

## Siguiente

`I3.5B_PROVIDER_BACKED_EXACT_CROSSWALK_VALIDATE_AND_MATERIALIZE_ONE_TARGET` bajo gate explícito: primero exact authority validation, luego máximo un link si está probado, con ACK/readback.

Clasificación: Reusable CXOrbia = sí; Exclusivo cliente = target agosto TyA; Claude/prototipo = no UI/fuzzy patch; Academia = actualizado; Sin impacto Claude = harness/provider gate.
