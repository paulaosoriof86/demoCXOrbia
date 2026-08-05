# Auditoría de reconciliación del lock canónico V7.2-P0F1

**Fecha:** 2026-08-05  
**Decisión final:** `TECHNICAL_PASS_PENDING_DEV_VISUAL`

## Causa raíz

El gate de composición permanecía fail-closed y comparaba tres autoridades V6 ya sustituidas por el empalme auditado V7.2-P0F1:

- `app/app.js`;
- `app/styles/layout.css`;
- `app/core/build-lock.js`.

No existía una regresión funcional nueva. El FAIL era una autoridad de lock desactualizada.

## Evidencia preservada

P0F1 quedó empalmada en `33d6f4f14272f82dca9d9c7c0cc119a9f89619bd`. Los dos overrides V6 no tocados y los cuatro archivos adicionales conservaron sus blobs exactos.

## Correctivo aplicado

Se conservó una copia byte a byte del overlay V6 histórico y la ruta estable consumida por el gate pasó a ser un alias activo compatible. Mantiene los campos base exigidos por el gate v2 y agrega procedencia explícita de P0F1. Solo cambian las tres autoridades auditadas.

El gate no se relajó: continúa verificando igualdad exacta de blobs, assets, orden de carga, roles, report kit, dependencias, secretos y Laboratorio.

## Carril y causa raíz del primer intento

La aplicación se realizó mediante `CXORBIA_ATOMIC_APPLY_RUNNER`, sin Codex.

El primer run `31009291341` se detuvo porque evidencia transitoria `.tmp/` aparecía como delta no autorizado. No produjo commit funcional. Se corrigió `.gitignore` y se emitió un request nuevo con parent actualizado.

## Aplicación válida

- run atómico: `31009497155`;
- commit funcional: `fb8d8897bb24f2f634bc5594dca4e8d610daf910`;
- push directo: PASS;
- request consumido/eliminado: PASS.

## Gates finales

- run: `31009570981`;
- artifact: `8931809583`;
- digest: `sha256:db3a8adb2e2c39f5825d359382b737fd97c9821d5828f6808c5d1c82b82b0c8f`;
- composición: `53/53` base y `4/4` adicionales;
- failures: `0`;
- Lab source contract: PASS;
- secretos: `0`;
- repositorio sin delta posterior: PASS.

## Estado seguro

Sin cambio funcional adicional, deploy, provider writes, Make/Gemini, pagos, merge o producción.
