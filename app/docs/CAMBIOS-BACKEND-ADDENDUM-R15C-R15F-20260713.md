# Cambios backend — R15C a R15F

Fecha: 2026-07-13

## Corrección de rumbo

Se canceló como ruta activa la creación de `cxorbia-tya-dev-260713-r15a`. La evidencia histórica y la reconciliación real confirmaron que `cxorbia-backend-dev` es el entorno DEV existente de CXOrbia.

## Archivos nuevos

### R15C

- `backend/config/phase-a-firebase-existing-dev-provenance-r15c.source-safe.json`
- `backend/config/phase-a-firebase-existing-dev-provenance-r15c-result.source-safe.json`
- `tools/release/tya-firebase-existing-dev-provenance-reconcile-r15c.mjs`
- `.github/workflows/cxorbia-firebase-existing-dev-provenance-r15c.yml`

### R15D

- `backend/config/phase-a-cxdata-firestore-readonly-r15d.source-safe.json`
- `backend/config/phase-a-cxdata-firestore-readonly-r15d-result.source-safe.json`
- `backend/adapters/firebase-cxdata-readonly-r15d.mjs`
- `tools/release/tya-cxdata-firestore-readonly-smoke-r15d.mjs`
- `.github/workflows/cxorbia-cxdata-firestore-readonly-r15d.yml`

### R15E

- `tools/release/tya-firestore-canonical-drift-r15e.mjs`
- `.github/workflows/cxorbia-firestore-canonical-drift-r15e.yml`

### R15F

- `tools/release/tya-source-safe-binding-build-r15f.mjs`

### Source lock/gates

- `tools/release/tya-source-lock-v110-union-verify.mjs`

## Archivos modificados

- `.github/workflows/cxorbia-phase-a-source-safe-visual-smoke-tya.yml`
- `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml`
- `.github/workflows/cxorbia-source-lock-post-v96-runtime-verify.yml`
- `.github/workflows/cxorbia-phase-a-rc-smoke.yml`
- `.github/workflows/cxorbia-rc-phase-a-predeploy-gate.yml`
- `tools/release/tya-rc-phase-a-drift-gate.mjs`
- `tools/release/tya-rc-phase-a-predeploy-gate.mjs`
- `tools/migration/tya-phase-a-rc-smoke-gate.mjs`

## Qué cambió

- Se comprobó read-only la procedencia del Firebase DEV existente.
- Se implementó un adapter Firestore read-only compatible con 19/19 miembros `CX.data` requeridos.
- Todos los métodos de escritura del facade permanecen fail-closed.
- Se clasificó el drift entre Firestore existente y la fuente canónica TyA.
- Se creó binding determinístico source-safe únicamente en la copia de build.
- Se preservó intacto el árbol V110 comprometido.
- Se sustituyeron validadores post-V96 obsoletos por el manifest V110 unión de 1,426 archivos.
- Drift, predeploy y RC smoke quedaron verdes, con 40 hallazgos P1 de copy todavía acumulados.

## Impacto Phase A

Avanza operación real porque ya existe una ruta demostrada para:

- usar el Firebase correcto;
- leer Firestore sin mutarlo;
- comparar Firestore con HR/finanzas canónicas;
- ejecutar visualmente la app con 616 visitas TyA source-safe;
- preparar la futura materialización sin cambiar módulos UI.

## Clasificación

- **Reusable CXOrbia:** reconciliación de procedencia, adapter provider-injected read-only, facade compatible, writes fail-closed, drift canónico y binding de build.
- **Exclusivo cliente:** conteos TyA/Cinépolis, 616 visitas, 210/213 shoppers, R14C y reglas de junio.
- **Claude/prototipo:** no hay P0 nuevo; debe conservar el bridge y copy honesto.
- **Academia:** explicar DEV existente, fuente canónica, materialización y diferencia entre read-only y producción.
- **Sin impacto Claude:** workflows, digests, service-account sanity, reportes sanitizados y gates internos.

## Estado seguro

Sin cambios en `/app/modules`, sin cambio comprometido en `app/index.html`, sin writes, imports, deploy, producción, Make, Gemini ni pagos.
