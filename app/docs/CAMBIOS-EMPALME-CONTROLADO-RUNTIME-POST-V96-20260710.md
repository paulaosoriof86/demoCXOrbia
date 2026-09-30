# Cambios — empalme controlado del runtime post-V96

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Objetivo

Empalmar en la rama activa el runtime exacto del source lock operativo post-V96, preservando las adiciones backend/preview útiles, sin desplegar, sin activar proveedores y sin conectar Auth/Firestore.

## Fuente y autorización

- Paquete: `Prototype development request.zip`.
- SHA-256: `80feb7c7809d28657b5eec243aa187f678c023ecd471a9f9404e52d285bd2663`.
- Autorización: Paula indicó expresamente `procede con el empalme`.
- Alcance autorizado: modificación controlada de runtime en la rama y validaciones.
- Alcance no autorizado: deploy, producción, Auth/Firestore real, imports, writes, HR writeback, Make, Gemini, Storage y pagos.

## Cambios de runtime

Commit principal:

- `86e592db3f9f8016080302a852bfd194097b2074` — `feat(cxorbia): empalma runtime source lock post-V96`.

Resultado:

- 37 archivos runtime sustituidos/controlados;
- 67 de 67 archivos del source lock coinciden por SHA-256;
- 27 archivos adicionales backend/patch preservados;
- ningún archivo adicional fue eliminado a ciegas;
- el source lock post-V96 quedó efectivamente empleado en la rama.

## Herramientas creadas

- `tools/empalme/post-v96-delta10/chunk-01.txt` a `chunk-09.txt`;
- `tools/empalme/tya-apply-post-v96-source-lock.sh`;
- `.github/workflows/cxorbia-post-v96-runtime-empalme.yml`;
- `backend/config/phase-a-post-v96-empalme-request.source-safe.json`.

Estas herramientas validaron autorización, hashes, conjunto exacto de archivos, sintaxis, scripts, manifest, service worker, charset, preservación de extras y workflow de deploy manual-only antes de generar el commit.

## Gates alineados al source lock post-V96

Se actualizaron únicamente validadores/workflows, no lógica del prototipo:

- `tools/migration/tya-phase-a-rc-smoke-gate.mjs`;
- `tools/release/tya-rc-phase-a-predeploy-gate.mjs`;
- `tools/qa/tya-phase-a-visual-smoke.mjs`;
- `.github/workflows/cxorbia-phase-a-visual-smoke.yml`;
- `tools/release/tya-rc-phase-a-drift-gate.mjs`;
- `.github/workflows/cxorbia-rc-phase-a-drift-gate.yml`;
- `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml`.

El SHA runtime validado quedó fijado en:

`86e592db3f9f8016080302a852bfd194097b2074`

## Resultado técnico final

Gates en `success`:

- Source Lock Post-V96 Runtime Verify;
- DEV Auth Firestore Readiness Post-V96;
- RC Phase A Smoke Gate;
- RC Phase A Predeploy Gate;
- Phase A Visual Smoke;
- RC Phase A Drift Gate.

Validaciones:

- runtime: 67/67;
- scripts locales: 61;
- scripts faltantes: 0;
- scripts duplicados: 0;
- JavaScript revisados: 91;
- errores de sintaxis: 0;
- módulos activos: 49;
- módulos activos duplicados: 0;
- requisitos semánticos post-V96: 9/9;
- material sensible detectado: 0;
- roles visuales probados: admin, coordinador, aliado, custom, cliente y shopper — todos abrieron shell/vista.

## Advertencias conservadas

- 36 coincidencias del scanner histórico de copy requieren clasificación P1; no son activación de proveedor.
- 27 archivos adicionales requieren decisión futura de consolidación/reubicación.
- El smoke `custom` contó botones descendientes y requiere verificación focalizada por ruta/acción.
- Coordinador y aliado mostraron `Admin del proyecto`; debe confirmarse contra la matriz funcional antes de crear claims reales.

## Estado seguro

- sin merge;
- sin deploy nuevo;
- sin producción;
- sin Auth real;
- sin Firestore reads/writes;
- sin imports;
- sin `CX.data` runtime switch;
- sin HR writeback;
- sin Make/Gemini/Storage;
- sin pagos reales;
- sin datos sensibles crudos.

## Clasificación

- **Reusable CXOrbia:** source-lock hashing, empalme determinístico, preservación de extras, drift fail-closed y deploy manual-only.
- **Exclusivo cliente:** contenido y reglas TyA/Cinépolis del paquete.
- **Claude/prototipo:** P1 de copy/permisos y consolidación de patches.
- **Academia:** actualización de rutas/manuales/cursos por rol y preservación de patches Academia.
- **Sin impacto Claude:** hashes, empaquetado, CI y validadores internos.
