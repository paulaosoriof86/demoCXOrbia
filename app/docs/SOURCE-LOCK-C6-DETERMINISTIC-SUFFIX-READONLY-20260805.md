# SOURCE LOCK — C6 DETERMINISTIC TECHNICAL SUFFIX READ-ONLY

**Fecha:** 2026-08-05  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Estado:** SOURCE PREPARED · PROVIDER READ-ONLY PENDING

## Autorización vigente

Paula autorizó una única ejecución read-only para:

- adoptar `DETERMINISTIC_TECHNICAL_SUFFIX` solo en los 64 grupos de personas activas distintas;
- preservar `nombre.apellido` cuando exista un único titular técnico inequívoco;
- asignar a los demás un sufijo estable, no PII, derivado de `tenantId + shopperId`;
- expandir el sufijo de 4 a 6 u 8 caracteres únicamente ante colisión;
- completar source-safe los 83 apellidos técnicos activos;
- resolver el perfil multi-Auth mediante señales técnicas combinadas;
- regenerar un plan no superpuesto de 340 filas;
- detenerse antes de cualquier write o deploy.

## Source autorizado

- `backend/contracts/c6-shopper-deterministic-suffix-v1.json`;
- `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
- `.github/workflows/cxorbia-c6-shopper-deterministic-suffix-readonly.yml`.

## Reglas

```text
default visible login = nombre.apellido
exception = nombre.apellido.<suffix>
suffix = sha256(tenantId + NUL + shopperId), 4/6/8
raw names/logins/emails/passwords/UIDs in evidence = false
one primary operation per profile = true
plan executable = false
```

## Hard stops

- empate multi-Auth residual;
- apellido activo sin resolución source-safe;
- colisión del sufijo después de 8 caracteres;
- target login no único;
- variación de los conteos contractuales esperados;
- cualquier intento de provider write, Auth/password/membership/Firestore/Rules/Storage/HR write, deploy, pago, merge o producción.

## Estado seguro

No se modificaron `/app/modules`, `/app/core`, Login, `CX.data`, HR, datos provider ni producción. La única ejecución provider permitida se disparará mediante un request config-only y quedará consumida sin retry automático.
