# Phase A protected Firestore schema DEV readiness

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Avanzar backend mientras Claude trabaja, definiendo el esquema protegido Firestore necesario para perfiles completos de shoppers, certificaciones, liquidaciones, lotes de pago, auditoria y reviewQueue.

Este bloque no conecta Firestore real, no activa Auth, no escribe datos, no expone datos sensibles y no toca produccion.

## Archivos agregados

- `backend/contracts/phase-a-protected-firestore-schema-dev-readiness-v1.json`
- `backend/config/phase-a-protected-firestore-collections.source-safe.json`

## Base que reutiliza

Este bloque no reinicia contratos. Extiende:

- `cxdata-firestore-phase-a-v1`
- `auth-rbac-phase-a-v1`
- `phase-a-protected-shopper-profile-dev-readiness-v1`
- `liquidations-payments-phase-a-v1`

La regla base sigue intacta: `CX.data` conserva interfaz estable y el backend entra por un unico punto de switch cuando pasen gates.

## Colecciones publicas source-safe

Solo se permite una superficie publica/source-safe:

- `tenants/{tenantId}/shopperPublicRefs/{shopperRefId}`

Campos permitidos:

- referencia opaca;
- pais;
- conteos por periodo/proyecto;
- bucket de estado;
- bucket de certificacion;
- bucket de elegibilidad de pago.

Campos prohibidos en preview publico:

- nombre completo;
- correo;
- telefono;
- documento;
- banco;
- NDA;
- fuente privada;
- workbook crudo.

## Colecciones protegidas

Se definen como contrato, no como escritura real:

- `tenants/{tenantId}/shoppers/{shopperId}/protected/profile`
- `tenants/{tenantId}/shopperIdentityLinks/{identityLinkId}`
- `tenants/{tenantId}/projects/{projectId}/certificationAttempts/{attemptId}`
- `tenants/{tenantId}/projects/{projectId}/certificationCarryovers/{carryoverId}`
- `tenants/{tenantId}/projects/{projectId}/protectedLiquidations/{liquidationId}`
- `tenants/{tenantId}/projects/{projectId}/protectedPaymentBatches/{paymentBatchId}`
- `tenants/{tenantId}/audit/protectedReads/{auditId}`
- `tenants/{tenantId}/reviewQueue/{reviewId}`

## Por que estas colecciones son necesarias

Phase A necesita:

- shopper full profile protegido;
- preservar certificaciones ya presentadas;
- evitar pedir certificaciones repetidas si ya estan validadas;
- mostrar liquidaciones y estado de pago sin ejecutar pago real;
- auditar lecturas protegidas;
- resolver conflictos de identidad, certificacion, asignacion y pago en reviewQueue.

## Reglas de acceso

- `tenantAdmin`: puede ver perfil protegido, identity links, certificaciones, liquidaciones, lotes, reviewQueue y auditoria.
- `projectAdmin`: vista acotada al proyecto.
- `financeAdmin`: liquidaciones y lotes; perfil financiero seguro sin banco crudo.
- `certificationAdmin`: intentos, carryovers y perfil seguro para certificacion.
- `shopper`: solo su propio perfil, certificaciones, liquidaciones y visitas.

## Escrituras bloqueadas

- Lecturas DEV protegidas: bloqueadas hasta configurar Auth DEV.
- Escrituras DEV protegidas: bloqueadas hasta GO explicito y rollback.
- Import writes: bloqueado hasta dry-run y reviewQueue.
- Payment state writes: bloqueado hasta GO financiero y auditoria.
- Produccion: bloqueada.

## Audit requirements

Toda lectura protegida debe registrar:

- actorUserId;
- rol;
- motivo;
- entityType;
- entityId;
- timestamp;
- source.

Todo enlace de identidad requiere sourceRef, confidence/status y revision si hay ambiguedad.

## Impacto Phase A

Este bloque permite avanzar hacia la vista real protegida de shoppers sin contaminar el preview publico. Tambien prepara el control de certificaciones y liquidaciones sin escribir datos reales todavia.

## Impacto Claude/prototipo

Claude debe representar esto de forma generica:

- preview publico source-safe;
- perfil completo bloqueado por Auth/RBAC;
- roles configurables por tenant/proyecto;
- estados honestos: `gate apagado`, `requiere acceso`, `pendiente Auth`, `reviewQueue`;
- no PII en preview publico;
- certificaciones preservadas como estado configurable;
- liquidaciones/pagos como estado auditado sin ejecucion real.

## Impacto Academia

Academia debe explicar:

- diferencia entre referencia publica y perfil protegido;
- roles y permisos de lectura;
- reviewQueue;
- auditEvents;
- certification carryover;
- liquidaciones/pagos sin ejecucion real;
- por que no se expone PII en preview.

## Clasificacion

- Reusable CXOrbia: si.
- Exclusivo cliente: no, es patron reusable.
- Claude/prototipo: si, debe representarlo sin hardcodear cliente/proyecto.
- Academia: si.
- Sin impacto Claude: no.

## Estado seguro

Documento/config/contrato solamente. No activa Firestore, no activa Auth, no escribe claims, no conecta frontend, no importa datos, no pagos, no HR writeback, no Make/Gemini, no produccion, no datos sensibles.
