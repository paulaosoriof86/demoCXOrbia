# CAMBIOS BACKEND — CORRECCIÓN DEFINITIVA DE METODOLOGÍA DE EMPALME

Fecha: 2026-07-17

## Diagnóstico

Se detectó contaminación documental y ejecutable: coexistían la metodología directa basada en Orbit, ya aprobada el 2026-07-16, y un carril local posterior con ZIP + checkout + `incoming/` + plan JSON + `.cmd`. El segundo carril contradijo la regla prevalente, trasladó acciones manuales a Paula y reabrió una candidata V156 que ya estaba GO.

## Corrección aplicada

- Se reforzó `app/docs/ADDENDUM-MAESTRO-EJECUCION-DIRECTA-EMPALMES-CXORBIA-20260716.md` como fuente única, definitiva y prevalente.
- Se actualizó `AGENTS.md` para exigir el método directo basado en Orbit.
- Se reemplazó el contenido de `backend/contracts/integration-lane-architecture-lock-v1.json` por el lock `cxorbia-orbit-direct-repository-apply-v1`.
- Se actualizó `tools/qa/assert-integration-architecture-lock.mjs` para validar la aplicación directa y bloquear la reaparición del carril local.
- Se eliminaron los dos addenda incompatibles del 2026-07-17.
- Se eliminaron los entry points y utilidades del carril local revocado: `run-latest.mjs`, `CXORBIA-EMPALMAR-ULTIMA-CANDIDATA.cmd`, `workspace-preflight.mjs`, `empalme-candidate.mjs`, `lib.mjs` y su README.
- Se preservaron las políticas multi-tenant/multi-proyecto, porque no constituyen transporte local y siguen siendo reutilizables como reglas de producto/tenant.

## Regla vigente

Cuando una candidata alcanza `AUDITED_GO_READY_DIRECT_APPLY`, la única operación válida es `APPLY_DELTA_DIRECTLY` sobre `docs-tya-v6-v71-audit`, seguida por manifest, build-lock, documentación, commit/push, gates post-empalme y validación visual.

No se permite carpeta `incoming/`, plan `EMPALME-*.json`, `.cmd`, PowerShell, descargas, descompresión, copias manuales, workflow transportador, rama/PR adicional, reauditoría general ni metodología nueva.

## Phase A

La corrección elimina el bloqueo metodológico y devuelve el siguiente bloque a la operación real: empalmar V156 directamente, verificar su identidad runtime y ejecutar gates sobre configuración, proyecto/periodo, histórico, HR, shoppers, certificaciones y liquidaciones.

## Preservado

Backend, contratos funcionales, adapters, overlays TyA, datos source-safe, seguridad, multi-tenant, multi-proyecto, selección explícita de proyecto, Cinépolis como proyecto no-default y estado seguro sin producción.

## Clasificación

- **Reusable CXOrbia:** máquina de estados, aplicación directa, lock antidesvío y validador.
- **Exclusivo cliente:** gates y cifras TyA/Cinépolis.
- **Claude/prototipo:** V156 continúa como candidata frontend GO; no se solicita otra candidata.
- **Academia:** documentar proyecto vs periodo y cambios visuales reales después del empalme.
- **Sin impacto Claude:** eliminación del carril local, contrato y validador metodológico.

## Estado seguro

Sin merge, deploy, producción, imports reales, Firestore/HR writes, Make/Gemini live, Storage real ni pagos. V156 aún no está físicamente empalmada.