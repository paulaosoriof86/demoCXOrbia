# CXOrbia - ejecucion obligatoria

Este archivo se lee antes de cualquier accion en el repositorio.

## Fuentes obligatorias

1. `app/docs/ADDENDUM-MAESTRO-ARQUITECTURA-DEFINITIVA-CARRIL-EMPALMES-CXORBIA-20260717.md`.
2. `backend/contracts/integration-lane-architecture-lock-v1.json`.
3. `app/docs/ADDENDUM-MAESTRO-EJECUCION-DIRECTA-EMPALMES-CXORBIA-20260716.md`.
4. `app/docs/ADDENDUM-MAESTRO-CARRIL-OPERATIVO-LOCAL-REUTILIZABLE-CXORBIA-20260717.md`.
5. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` y PR #7.

## Arquitectura definitiva

Las candidatas completas solo se empalman en un workspace que contenga el ZIP y el checkout Git autenticado.

Flujo obligatorio: Claude Design entrega ZIP; ChatGPT audita y genera plan JSON; el integrador local aplica el delta; Git crea commit/push; ChatGPT verifica; Paula valida visualmente.

Codex es apoyo puntual, no requisito por candidata. El conector GitHub no transporta candidatas completas.

Antes de empalmar ejecutar:

`node tools/qa/assert-integration-architecture-lock.mjs`

Despues ejecutar el preflight de `tools/integration/`. Un FAIL detiene el proceso sin rutas alternativas.

## Regla de ejecucion

Con auditoria PASS/GO y sin P0, aplicar el delta auditado sobre `docs-tya-v6-v71-audit` mediante el carril local deterministico. Preservar backend, contratos, adapters, tools, overlays y docs. Generar manifest, build-lock, registro, commit y push. Ejecutar gates por tenant/proyecto antes de DEV o produccion.

## Multi-tenant y multi-proyecto

El motor pertenece a CXOrbia. Cada tenant es multi-proyecto, sin proyecto global por defecto, y toda seleccion es explicita.

TyA es el tenant actual. Cinepolis es solo su primer proyecto operativo; nunca es default ni logica global. Sus cifras, HR, cuestionarios, pagos, certificaciones y reglas quedan en un perfil opcional. Los proximos proyectos TyA se crean/configuran desde la plataforma. Otros tenants reutilizan el motor con politicas propias.

## Prohibiciones

No usar blobs/trees del conector, workflows transportadores, Drive, Base64, copias manuales archivo por archivo, nuevas ramas/PR o nuevas metodologias como carril de candidatas completas.

No declarar empalme completo sin commit/push, manifest y build-lock verificables.

## Control de cambios

La arquitectura solo cambia con P0 demostrado, evidencia reproducible, compatibilidad multi-tenant/multi-proyecto, autorizacion expresa de Paula y actualizacion conjunta del addendum, contrato, validador y este archivo.

## Lock actual

V156 esta `AUDITED_GO_READY_DIRECT_APPLY`, con 35 archivos modificados y 0 eliminados. Sigue pendiente fisicamente hasta tener commit/push y build-lock V156 verificables.
