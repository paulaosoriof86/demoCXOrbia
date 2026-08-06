# SOURCE LOCK — C6 equivalent universe provider read-only v2.2

**Fecha:** 2026-08-06  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**HEAD previo al workflow:** `bd284e60408a0be78dd78d263e316529e16bdea2`  
**Workflow commit:** `cfca1f94f0980cd16c354423af82b0d3d2b766d4`  
**Source integration commit:** `8fe5ad6dd185cce5ea3cdac06892f3144e8e5f0f`  
**Contrato:** `cxorbia.c6.shopper-deterministic-suffix.v2.2`  
**Universo:** `shopper-equivalent-universe-v1`

## Alcance autorizado

Una única ejecución provider read-only para:

1. validar población exacta de 340 perfiles;
2. validar crosswalk estable `101 mapped / 8 unmapped`;
3. construir referencia y planner con el mismo universo de población, actividad, linking y completitud;
4. reconciliar ambos conjuntos;
5. exportar vectores de procedencia por miembro únicamente para grupos añadidos o eliminados;
6. regenerar candidate fingerprints y señales source-safe para multi-Auth;
7. recalcular métricas pre-consenso, completadas por consenso y residuales;
8. regenerar un plan no superpuesto de exactamente 340 filas;
9. aplicar `STOP_RETRY` sin segundo intento ante cualquier HOLD, drift, identidad métrica inválida, procedencia incompleta, empate multi-Auth, colisión de sufijo o login objetivo.

## Source lock técnico

```text
planner blob=c652688456a99c0933c846b412bdf9fa32a79cf2
classifier blob=1d91bb1fcee785ba181aa7545996a7ec18125992
helper blob=618446436847a59c03174dab987ac7a48d1f8a50
contract blob=a0745a8e3ad85ee64f87ade6a537709717bb5261
canonical blob=2c96e6911b4b3f427ef1a073903575fb7a5d5886
```

El workflow valida los blobs, el commit de integración y el contrato antes de abrir la credencial DEV.

## Salida source-safe

Los artifacts permitidos contienen:

- reporte saneado;
- plan 340 source-safe;
- matriz de grupos sin member vectors globales;
- member vectors solo dentro de `equivalentUniverse.reconciliation.deltaGroups`;
- candidate fingerprints, scores y señales booleanas;
- resumen de validación y decisión.

No se exportan nombres, apellidos, logins, correos, UID, contraseñas ni PII.

## Seguridad

```text
provider execution maximum=1
second attempt=0
automaticRetry=false
provider writes=0
Auth/password/membership/Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

La ejecución no autoriza repair Auth, aplicación parcial, deploy, merge ni producción. El request y el trigger deberán quedar consumidos/congelados después del resultado, sea PASS o HOLD.
