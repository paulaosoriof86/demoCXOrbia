# ADDENDUM PREVALENTE — I3 RUN 279 ADMIN READ-MODEL PROBE LOCK

**Fecha:** 2026-09-20  
**ID:** `CXORBIA-I3-RUN279-ADMIN-READMODEL-PROBE-20260920`  
**Estado:** `FROZEN_PREVALENT_UNTIL_EXACT_OWNER_PROVEN`

Run 279 (`35494022784`) mantuvo product source `16d1bc8649f358f72d9576d6e4c20bfa6b833272` / tree `74bec1dbb83681e94b17320ea3756fa926bbb912`.
Certificación principal: Step21 PASS, Step22 PASS, Step23 PASS, Gate20 PASS, artifact único PASS.
Live fixtures: 7/10, cleanup=true, builds=0, deploys=0, production=false. Gate21 skipped.

Diagnóstico Admin exacto del artifact:
- role=super, tenant=tya, projectIds=[cinepolis];
- cuatro shoppers sintéticos creados y login PASS;
- `CX.data.shoppers` Admin contiene 0/4;
- filas DOM contiene 0/4;
- detalle HN no puede abrirse porque la fila no existe;
- cross-project sí se bloquea con `SHOPPER_COMMAND_SCOPE_DENIED`.

Esto descarta que el fallo sea solo selector DOM. Todavía no prueba si el owner es demora de convergencia, carga Firestore Admin o recomposición posterior.

Única siguiente sonda permitida, control-only:
1. esperar 10 s por convergencia automática;
2. si sigue ausente, ejecutar una sola lectura `CX.backend.refresh()` sin writes;
3. capturar perfiles inmediatamente después de la lectura Firestore;
4. esperar nueva autoridad y capturar perfiles posteriores;
5. registrar authority.protectedProfiles, sourceMode/sourceRef y review queue.

No corregir producto antes de esa discriminación.
