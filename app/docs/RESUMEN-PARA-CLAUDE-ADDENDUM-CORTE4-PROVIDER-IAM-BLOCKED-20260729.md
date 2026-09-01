# RESUMEN PARA CLAUDE — Corte 4 provider IAM — 2026-07-29

## Estado

- Corte 3: `FROZEN_ACTIVE_BASELINE`.
- Corte 4: hardening read-only PASS; creación del proyecto nuevo bloqueada por IAM.
- No V183. No R33. No cambio de candidata.

## Backend que debe preservarse

- interfaz pública `CX.data`;
- guard read-only/fail-closed;
- cero fallback silencioso a mock/localStorage;
- `cxorbia-backend-dev` excluido como base nueva;
- candidato `cxorbia-tya-dev-260729-c4` todavía no creado/conectado;
- Rules candidate no desplegado.

## Regla frontend

No mostrar “conectado” ni “listo” para Firestore. El estado honesto es `Proveedor pendiente · bloqueo IAM`. No llamar Firebase directamente desde módulos UI y no habilitar escrituras.

## Sin tareas frontend nuevas

El bloqueo es externo de IAM. Claude no debe intentar resolverlo modificando módulos, creando una candidata o reintroduciendo una base existente.
