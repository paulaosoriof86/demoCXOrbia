# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-13 09:53 -06:00  
**Estado:** `M9_CUTOVER_SMOKE_FAIL__ROLLBACK_PASS__PHASE_A_96`

## Resultado M9

Se ejecutó la única promoción autorizada del build M8 `ecc725866acc3eb8`. La promoción se completó, pero el smoke inmediato no certificó M9 porque el runner reutilizado exigía flags exclusivos del carril DEV y falló en `M8_ENTRY_LANE_FLAGS_INVALID` antes de completar la validación productiva.

El mismo run reveló además un error de sintaxis en el bloque automatizado que debía encadenar el rollback. No hubo segundo intento de promoción.

## Rollback autorizado

La porción de rollback incluida expresamente en la autorización vigente se ejecutó después en un bloque separado y quedó verificada con decisión `PASS_M9_AUTHORIZED_CONDITIONAL_ROLLBACK`.

Producción volvió a servir la versión pre-cutover capturada `a9670bb8a19862cd`; el root respondió HTTP 302 hacia `/index-backend-dev.html`. Promociones consumidas=1; rollbacks=1; segunda promoción=0.

Evidencia durable: `app/docs/evidence/m9-production-cutover-rollback-20260813.json`.

## Seguridad

Cloud Run deploys=0; Auth/Firestore/HR/Rules/Storage writes=0; Make/Gemini/pagos=0; merge=false; secretos/tokens expuestos=false.

## Progreso Phase A

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=5/5 | M8=3/3 | M9=0/3 | M10=0/1`

**TOTAL CERTIFICADO=96% | RESTANTE=4% | DELTA CERTIFICADO=0.**

M9 permanece abierto porque el smoke productivo no dio PASS. El rollback seguro preserva el estado anterior, pero no concede los 3 puntos.

## Siguiente frontera exacta

No repetir la promoción bajo el gate ya consumido. Primero debe cerrarse un smoke productivo read-only compatible con la entrada real, sin depender de flags DEV y sin mutar producción. Solo después correspondería un futuro gate productivo separado.

## Clasificación

- **Reusable CXOrbia:** rollback verificado y separación entre fallo del producto y fallo del instrumento de smoke.
- **Exclusivo cliente:** target y versión TyA.
- **Claude/prototipo:** cero cambios en `/app/modules` o UI.
- **Academia:** continuidad operacional, cutover fail-closed y rollback verificado.
- **Sin impacto Claude:** QA, gates, evidencia y documentación M9.
