# Phase A protected Firestore rules DEV draft

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Avanzar backend mientras Claude trabaja, creando un draft estricto de reglas Firestore DEV para el esquema protegido de shoppers, certificaciones, liquidaciones, lotes, auditEvents y reviewQueue.

Este bloque no despliega reglas, no activa Auth, no conecta frontend, no habilita writes, no importa datos y no toca producción.

## Archivos agregados

- `backend/contracts/phase-a-protected-firestore-rules-dev-draft-v1.json`
- `backend/rules/firestore.phase-a-protected-dev.rules.draft`

## Base que reutiliza

Este bloque no reemplaza el draft previo `app/contracts/firestore-dev-staging.rules.draft`; agrega un draft protegido más estricto y alineado al esquema nuevo.

Extiende:

- `cxdata-firestore-phase-a-v1`
- `auth-rbac-phase-a-v1`
- `phase-a-protected-shopper-profile-dev-readiness-v1`
- `phase-a-protected-firestore-schema-dev-readiness-v1`
- `liquidations-payments-phase-a-v1`

## Por qué era necesario

El draft existente cubría aislamiento tenant/proyecto y colecciones Phase A generales, pero mantenía roles históricos como `admin`, `super` y `coordinador`.

El nuevo draft usa el modelo Phase A actualizado:

- `tenantAdmin`
- `projectAdmin`
- `financeAdmin`
- `certificationAdmin`
- `shopper`

Así evitamos mezclar permisos antiguos con el borde protegido que necesitamos para perfil shopper real.

## Superficie pública permitida

Solo una colección queda como public/source-safe:

`tenants/{tenantId}/shopperPublicRefs/{shopperRefId}`

Lectura permitida solo si el documento:

- tiene `publicSourceSafe: true`;
- coincide con `tenantId`;
- usa solo claves permitidas;
- no contiene campos prohibidos.

Campos permitidos:

- `tenantId`
- `shopperRefId`
- `country`
- `projectCounts`
- `periodCounts`
- `statusBucket`
- `certificationBucket`
- `paymentEligibilityBucket`
- `publicSourceSafe`
- `updatedAt`

## Protegido por Auth/RBAC

Quedan como lectura protegida futura:

- `tenants/{tenantId}/shoppers/{shopperId}/protected/{docId}`
- `tenants/{tenantId}/shopperIdentityLinks/{identityLinkId}`
- `tenants/{tenantId}/reviewQueue/{reviewId}`
- `tenants/{tenantId}/audit/protectedReads/{auditId}`
- `tenants/{tenantId}/projects/{projectId}/certificationAttempts/{attemptId}`
- `tenants/{tenantId}/projects/{projectId}/certificationCarryovers/{carryoverId}`
- `tenants/{tenantId}/projects/{projectId}/protectedLiquidations/{liquidationId}`
- `tenants/{tenantId}/projects/{projectId}/protectedPaymentBatches/{paymentBatchId}`

## Escrituras

Todas las escrituras quedan bloqueadas en este draft.

Motivo:

- Auth DEV todavía no está activo.
- No hay GO de writes.
- No hay import real.
- No hay GO financiero.
- No hay rollback probado para datos protegidos.

## Campos prohibidos

El draft bloquea campos sensibles como:

- password;
- privateKey;
- providerToken;
- refreshToken;
- privateWebhookUrl;
- documento crudo;
- DPI crudo;
- cuenta bancaria cruda;
- NDA crudo;
- workbook crudo;
- URL privada de fuente;
- recibos de pago en base64.

## Impacto Phase A

Este bloque prepara la frontera real de seguridad para poder avanzar después a Auth DEV y lectura protegida de shoppers, certificaciones y liquidaciones sin exponer datos personales en preview público.

## Impacto Claude/prototipo

Claude debe representar esto de forma genérica:

- datos públicos source-safe separados de datos protegidos;
- perfil completo bloqueado por Auth/RBAC;
- roles configurables por tenant/proyecto;
- mensajes honestos: `gate apagado`, `pendiente Auth`, `requiere acceso`, `preview source-safe`;
- no PII en preview público;
- no sugerir que reglas están desplegadas.

## Impacto Academia

Academia debe explicar:

- diferencia entre public source-safe y protected profile;
- por qué las reglas son draft y no producción;
- roles que pueden ver datos protegidos;
- por qué writes están bloqueados;
- campos prohibidos;
- auditEvents y reviewQueue.

## Clasificación

- Reusable CXOrbia: sí.
- Exclusivo cliente: no, patrón reusable.
- Claude/prototipo: sí.
- Academia: sí.
- Sin impacto Claude: no.

## Estado seguro

Documento/contrato/rules draft solamente. No deploy, no producción, no Auth real, no Firestore writes, no imports, no pagos, no HR writeback, no Make/Gemini y no datos sensibles.
