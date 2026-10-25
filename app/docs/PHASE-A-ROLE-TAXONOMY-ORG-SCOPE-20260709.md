# Phase A role taxonomy org scope

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Corregir la brecha detectada: la matriz minima anterior cubria roles tecnicos, pero no representaba completo el organigrama operativo real ni los futuros tenants/proyectos.

Este bloque agrega una taxonomia reusable de personas, roles tecnicos y scopes para representantes, coordinadores, franquiciados, cliente/marca evaluada, finanzas, certificaciones y shoppers/evaluadores.

## Archivos agregados

- `backend/contracts/phase-a-role-taxonomy-org-scope-v1.json`
- `backend/config/phase-a-role-taxonomy-personas.source-safe.json`
- `tools/release/tya-role-taxonomy-org-scope-validate.mjs`

## Decision tecnica

No se debe inflar Firebase custom claims con cada titulo operativo. El modelo correcto separa:

- `personaType`: lenguaje operativo/Academia/UI.
- `role`: rol tecnico para RBAC.
- `scope`: limite de acceso.
- `tenantId`: tenant.
- `countryIds` y `projectIds`: alcance real.
- `permissionsVersion`: version de permisos.
- IDs opcionales opacos: `shopperId`, `clientId`, `staffId`, `franchiseId`, `representativeId`.

## Personas Phase A cubiertas

- `tenantOwner`: dueno/administrador principal del tenant.
- `franchiseOwner`: franquicia/franquiciado.
- `countryRepresentative`: representante por pais/territorio.
- `operationsCoordinator`: coordinacion operativa.
- `projectCoordinator`: coordinacion por proyecto.
- `fieldRepresentative`: representante operativo/de campo.
- `financeOperator`: finanzas/liquidaciones.
- `certificationOperator`: certificaciones/bancos de preguntas.
- `clientBrandAdmin`: cliente/marca evaluada con acceso administrativo limitado.
- `clientBrandViewer`: cliente/marca evaluada solo lectura.
- `shopperEvaluator`: shopper/evaluador.

## Roles tecnicos

- `tenantAdmin`
- `projectAdmin`
- `financeAdmin`
- `certificationAdmin`
- `clientAdmin`
- `clientViewer`
- `shopper`

`platformAdmin` y `support` quedan definidos, pero no son default Phase A.

## Scopes

- platform.
- tenant.
- country.
- tenantProject.
- tenantProjectOrCountry.
- ownTenantOrProject.
- tenantOrProjectSupport.

## Por que esto importa para TyA y para el prototipo

Para TyA, permite modelar representantes, coordinadores y estructura por pais/proyecto sin dar acceso excesivo.

Para el prototipo, evita hardcodear una organizacion especifica y deja preparada la creacion de nuevos tenants, nuevos proyectos y estructuras distintas de cliente/franquicia/operacion.

## Validador funcional

Se agrego:

```bash
node tools/release/tya-role-taxonomy-org-scope-validate.mjs --out .tmp/role-taxonomy
```

El validador no llama Firebase, no escribe Auth, no escribe Firestore, no hace deploy y no contiene datos sensibles. Revisa que:

- exista taxonomia de personas;
- existan roles tecnicos;
- cada persona Phase A tenga template source-safe;
- no haya campos sensibles en templates;
- los mappings persona -> role sean coherentes;
- las rutas principales tengan personas asignadas;
- el contrato Auth base siga cubriendo los roles minimos;
- los nuevos roles cliente queden advertidos para actualizar antes de activacion.

## Impacto Claude/prototipo

Claude debe representar esto de forma generica:

- roles/personas configurables por tenant/proyecto;
- no usar solo `admin/shopper` si la operacion requiere representantes, coordinadores, franquiciados y cliente;
- UI de permisos por persona + scope;
- rutas por rol/persona;
- mensajes honestos si una persona existe como template pero Auth real sigue gate-off;
- no hardcodear nombres ni estructura TyA.

## Impacto Academia

Academia debe explicar:

- diferencia entre persona operativa y rol tecnico;
- que puede hacer un representante;
- que puede hacer un coordinador;
- que puede hacer un franquiciado/franquicia;
- que puede ver cliente/marca evaluada;
- que ve shopper/evaluador;
- scopes por tenant, pais, proyecto y propio perfil;
- por que los claims deben mantenerse pequenos.

## Estado seguro

Contrato/config/script validador solamente. No activa Auth, no escribe claims, no conecta frontend, no escribe Firestore, no produccion, no import real, no pagos, no HR writeback, no Make/Gemini y no datos sensibles.
