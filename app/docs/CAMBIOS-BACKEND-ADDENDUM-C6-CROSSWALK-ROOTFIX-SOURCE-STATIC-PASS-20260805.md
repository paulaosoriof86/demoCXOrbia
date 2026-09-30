# CAMBIOS BACKEND — Addendum C6 Crosswalk Root Fix Source/Static PASS

**Fecha:** 2026-08-05  
**Estado:** `PASS_C6_DETERMINISTIC_SUFFIX_CROSSWALK_ROOTFIX_SOURCE_STATIC`  
**Repo/rama:** `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge

## Clasificación del bloque

- **Reusable CXOrbia:** propagación genérica de llaves técnicas y gate de paridad del crosswalk.
- **Exclusivo cliente TyA:** referencia estable actual `101 mapped / 8 unmapped` y población esperada de 340 perfiles.
- **Claude/prototipo:** sin modificación de módulos, diseño, Login o `CX.data`.
- **Academia:** requiere actualizar explicación del contrato de identidad y controles de migración.
- **Sin impacto Claude:** ejecución source/static, workflow, evidencia y documentación.

## Archivos creados

- `app/docs/SOURCE-LOCK-C6-DETERMINISTIC-SUFFIX-CROSSWALK-ROOTFIX-20260805.md`;
- `tools/qa/cxorbia-c6-shopper-deterministic-suffix-crosswalk-rootfix-source-only.mjs`;
- `.github/workflows/cxorbia-c6-shopper-deterministic-suffix-crosswalk-rootfix-source-only.yml` — carril alterno no utilizado;
- `backend/config/corte6-shopper-deterministic-suffix-crosswalk-rootfix-source-only-request.json` — request alterno no ejecutado;
- `app/docs/evidence/CORTE6-SHOPPER-DETERMINISTIC-SUFFIX-CROSSWALK-ROOTFIX-SOURCE-STATIC-PASS-LATEST.json`.

## Archivos modificados

- `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
- `.github/workflows/cxorbia-c6-shopper-deterministic-suffix-readonly.yml` — carril conocido convertido temporalmente en gate source-only;
- `backend/config/corte6-shopper-deterministic-suffix-readonly-request.json` — consumido con PASS y cero provider reads.

## Correctivo aplicado

1. `link()` preserva la fuente enlazada con su `basis`.
2. `link()` llama `propagateLinkedSourceTechKeys(relationIndex, source, shopperId)`.
3. Cada `TECH_KEY` de HR, visita, certificación o liquidación enlazada alimenta el crosswalk.
4. Se congeló la referencia estable `101/8` como precondición del próximo provider gate.
5. Se agregó `credentialCrosswalkParity` y se exige para `readyForAuthRepair`.
6. Se agregó hard stop `credential_crosswalk_drift:mapped/unmapped`.
7. Se agregó fixture de propagación de `legacyId` y `sourceKey`.
8. Se preservó la política de sufijo 4/6/8 y el esquema de una operación primaria por cada una de las 340 filas.

## Gates y evidencia

```text
run=31066003792
job=92503740935
source commit=6160ef89b75bcdf9068c210810c528d3c6d13db1
source SHA-256=3200b8833b3af10a27e0493df992836f99d3e78668f2265269d2bd0c74640568
PASS_C6_DETERMINISTIC_SUFFIX_CROSSWALK_ROOTFIX_SOURCE_STATIC
PASS_C6_DETERMINISTIC_SUFFIX_SOURCE_STATIC
```

La primera ejecución source-only `31065882519` no creó commit ni consumió el request: falló por dependencia estática `firebase-admin` ausente. Se corrigió el workflow, se publicó estado veraz y se retomó el mismo bloque sin provider read.

## Estado seguro

Provider reads/writes, Auth, contraseñas, memberships, Firestore, Rules, Storage, HR, Hosting, Cloud Run, Make, Gemini, pagos, merge y producción: `0/false`.

## Pendiente real

La paridad `101/8` está codificada y probada como gate, pero todavía no fue revalidada contra Firebase después del fix. Los resultados provider 65/142, 12 apellidos y un empate multi-Auth continúan provisionales.

## Siguiente bloque exacto

Nueva autorización puntual para una sola revalidación provider read-only del crosswalk corregido; verificar 101/8, recalcular apellidos, colisiones, multi-Auth y plan de 340 filas; STOP_RETRY ante cualquier residual y detenerse antes de todo write o deploy.
