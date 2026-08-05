# Auditoría de reconciliación del lock canónico V7.2-P0F1

**Fecha:** 2026-08-05  
**Decisión:** `AUDITED_GO_DIRECT_RUNNER_APPLY`

## Causa raíz

El gate de composición permanecía fail-closed y comparaba tres autoridades V6 ya sustituidas por el empalme auditado V7.2-P0F1:

- `app/app.js`;
- `app/styles/layout.css`;
- `app/core/build-lock.js`.

No existía una regresión funcional nueva. El FAIL era una autoridad de lock desactualizada.

## Evidencia preservada

P0F1 quedó empalmada en `33d6f4f14272f82dca9d9c7c0cc119a9f89619bd`. Los dos overrides V6 no tocados y los cuatro archivos adicionales conservaron sus blobs exactos.

## Correctivo

Se conserva una copia byte a byte del overlay V6 histórico y la ruta estable consumida por el gate pasa a ser un alias activo compatible. Mantiene los campos base que exige el gate v2 y agrega procedencia explícita de P0F1. Solo cambia las tres autoridades auditadas.

El gate no se relaja: continúa verificando igualdad exacta de todos los blobs, assets, orden de carga, roles, report kit, dependencias, secretos y Laboratorio.

## Carril

La aplicación se realiza mediante `CXORBIA_ATOMIC_APPLY_RUNNER`. Codex no participa. El request es de una sola ejecución, con parent, hashes, allowlist, commit funcional único y push directo.

## Estado seguro

Sin cambios funcionales adicionales, deploy, provider writes, Make/Gemini, pagos, merge o producción.
