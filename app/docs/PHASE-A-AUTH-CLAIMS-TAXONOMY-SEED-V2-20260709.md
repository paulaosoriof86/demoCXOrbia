# Phase A Auth claims taxonomy seed v2

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Corregir el plan de claims DEV para usar la taxonomia completa de personas operativas, roles tecnicos y scopes.

Este bloque no activa Auth, no crea usuarios, no escribe claims, no conecta frontend, no escribe Firestore y no toca produccion.

## Archivos agregados

- `backend/contracts/phase-a-auth-dev-claims-taxonomy-seed-v2.json`
- `backend/config/phase-a-auth-dev-claims-taxonomy-seed.source-safe.json`
- `tools/release/tya-auth-dev-claims-taxonomy-seed-validate.mjs`

## Por que era necesario

La matriz previa de claims cubria roles minimos, pero no representaba representantes, coordinadores, franquiciados/franquicia, cliente/marca evaluada y estructura por pais/proyecto.

Este bloque convierte la taxonomia operativa en templates de claims source-safe y validables.

## Decision tecnica

No se inflan los custom claims con todos los cargos. El claim futuro queda pequeno:

- `tenantId`
- `role`
- `personaType`
- `scope`
- `permissionsVersion`
- `projectIds` opcional
- `countryIds` opcional
- IDs opacos opcionales: `shopperId`, `clientId`, `staffId`, `franchiseId`, `representativeId`

## Templates cubiertos

- tenantOwner
- franchiseOwner
- countryRepresentative
- operationsCoordinator
- projectCoordinator
- fieldRepresentative
- financeOperator
- certificationOperator
- clientBrandAdmin
- clientBrandViewer
- shopperEvaluator

## Roles tecnicos cubiertos

- tenantAdmin
- projectAdmin
- financeAdmin
- certificationAdmin
- clientAdmin
- clientViewer
- shopper

## Comando seguro

```bash
node tools/release/tya-auth-dev-claims-taxonomy-seed-validate.mjs --out .tmp/auth-claims-taxonomy-seed
```

El comando genera reporte JSON/MD y no llama Firebase, no escribe Auth, no escribe Firestore y no despliega reglas.

## Que valida

- contrato en estado `draft_safe_not_connected`;
- safeState sin Auth, users, claims, frontend, writes, imports ni produccion;
- templates para todas las personas operativas Phase A;
- ausencia de correos, passwords, telefonos, nombres reales, secretos y campos sensibles;
- mapping persona -> rol tecnico;
- scope permitido por persona;
- roles con scope de proyecto incluyen `projectIds`;
- shopper incluye `shopperId` opaco;
- gates futuros de write/deploy/produccion siguen bloqueados;
- roles nuevos de cliente quedan advertidos antes de activacion.

## Impacto Phase A

Este bloque adelanta Auth DEV real porque deja una matriz de claims validable para la estructura operativa completa antes de tocar usuarios reales.

## Impacto Claude/prototipo

Claude debe representar:

- personas operativas configurables;
- roles tecnicos separados de cargos visibles;
- scopes por tenant, pais, proyecto y propio perfil;
- representantes, coordinadores, franquicia, cliente y shoppers;
- estados honestos si Auth sigue gate-off.

## Impacto Academia

Academia debe explicar:

- diferencia entre persona operativa, rol tecnico y scope;
- por que los claims se mantienen pequenos;
- que puede ver/hacer cada persona;
- como se valida el plan antes de escribir claims;
- por que no se usan correos, telefonos, passwords ni nombres reales en fixtures.

## Estado seguro

Contrato/config/script validador solamente. No activa Auth, no crea usuarios, no escribe claims, no conecta frontend, no escribe Firestore, no import real, no produccion, no pagos, no HR writeback, no Make/Gemini y no datos sensibles.
