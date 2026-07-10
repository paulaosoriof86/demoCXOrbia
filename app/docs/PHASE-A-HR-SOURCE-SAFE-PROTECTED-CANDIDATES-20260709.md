# Phase A HR source-safe protected candidates

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Adelantar Phase A real aplicado a TyA convirtiendo la HR viva source-safe en candidatos protegidos de import/lectura: shopper refs, identity links, certificaciones conservables, liquidaciones, lotes de pago, reviewQueue y auditEvents.

Este bloque no lee HR privada en vivo, no escribe Firestore, no activa Auth, no importa datos reales y no toca produccion. Usa solo payload source-safe ya generado por la lectura HR viva.

## Archivos agregados

- `backend/contracts/phase-a-hr-source-safe-to-protected-candidates-v1.json`
- `backend/config/phase-a-hr-source-safe-to-protected-candidates.source-safe.json`
- `backend/adapters/hr-source-safe-to-protected-candidates.preview.mjs`
- `tools/release/tya-hr-source-safe-protected-candidates-validate.mjs`

## Por que esto si adelanta Phase A

Hasta ahora teniamos:

- HR viva multihoja source-safe;
- esquema protegido Firestore;
- roles/personas/scopes;
- adapter de lectura protegida;
- gates de Auth y reglas draft.

Faltaba el puente funcional entre la HR viva source-safe y los futuros datos protegidos. Este bloque prepara ese puente sin escribir nada.

## Entrada

Acepta payload source-safe de:

- `app/data/tya-hr-source-safe-periods.js`;
- JSON source-safe generado por builder;
- futuro payload generico tenant/proyecto.

El payload debe tener:

- `tenantId`;
- `projectId`;
- `periods`;
- `visits`;
- `shoppers`;
- `sourceSafe: true`;
- `production: false`.

## Salidas candidatas

Genera candidatos source-safe para:

- `shopperPublicRefs`;
- `shopperIdentityLinkCandidates`;
- `certificationCarryoverCandidates`;
- `protectedLiquidationCandidates`;
- `protectedPaymentBatchCandidates`;
- `reviewQueueCandidates`;
- `auditEventCandidates`.

Ninguna salida se escribe en Firestore.

## Comando seguro

```bash
node tools/release/tya-hr-source-safe-protected-candidates-validate.mjs --out .tmp/hr-source-safe-protected-candidates
```

El comando genera:

- `protected-candidates-report.json`;
- `protected-candidates-report.md`;
- `protected-candidates-preview.source-safe.json`.

No llama Firebase, no llama Firestore, no llama Auth, no escribe datos, no despliega reglas y no contiene datos sensibles.

## Reglas de seguridad

Bloquea o marca NO_GO si detecta:

- payload no source-safe;
- payload de produccion;
- falta de tenant/proyecto;
- campos sensibles prohibidos;
- datos crudos como nombre completo, correo, telefono, documento, banco, NDA, source privada, workbook o tokens.

## Impacto Phase A TyA

Este bloque prepara el camino para convertir la HR viva en objetos protegidos de operacion real:

- referencias publicas source-safe de shoppers;
- candidatos de identidad para vincular shopper real con usuario Auth;
- certificaciones ya presentadas como carryover candidate;
- liquidaciones como preview/review antes de pago;
- lotes de pago preparados, sin ejecucion real;
- reviewQueue para conflictos;
- auditEvents para trazabilidad.

## Impacto reusable CXOrbia

El patron sirve para nuevos tenants y nuevos proyectos: cualquier source viva debe pasar primero por source-safe candidates antes de escribir protegido.

## Impacto Claude/prototipo

Claude debe representar esto genericamente:

- fuente viva genera candidatos;
- candidatos no son import real;
- reviewQueue antes de escribir;
- certificaciones y liquidaciones preservables;
- datos completos solo con Auth/roles;
- mensajes honestos: `dry-run`, `source-safe`, `pendiente review`, `no escrito`.

## Impacto Academia

Academia debe explicar:

- source-safe payload;
- protected candidates;
- por que dry-run no es import real;
- como reviewQueue evita sobrescritura silenciosa;
- como se preservan certificaciones;
- como se preparan liquidaciones sin ejecutar pagos;
- por que no se expone PII.

## Estado seguro

Contrato/config/adapter/script validador solamente. No HR privada live read, no Firestore, no Auth, no writes, no import real, no produccion, no pagos, no HR writeback, no Make/Gemini y no datos sensibles.
