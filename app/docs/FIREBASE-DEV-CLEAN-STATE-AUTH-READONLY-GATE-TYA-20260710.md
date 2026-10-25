# Firebase DEV clean-state + Auth configuration read-only gate

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Objetivo

Preparar la verificación externa y estrictamente read-only de que el proyecto Firebase DEV de CXOrbia continúa nuevo, limpio y separado antes de crear usuarios, claims, documentos, reglas o conexiones reales.

Este bloque prepara el gate; **no ejecuta la consulta al proveedor**. La ejecución queda bloqueada hasta autorización explícita separada de Paula.

## Destino esperado

- proyecto: `cxorbia-backend-dev`;
- bucket: `cxorbia-backend-dev.firebasestorage.app`;
- target Hosting: `cxorbia-dev`;
- entorno: DEV;
- sin importación legacy;
- sin producción.

## Verificaciones preparadas

La futura ejecución comprobará y reportará únicamente conteos, disponibilidad y booleanos:

1. coincidencia de proyecto y dominio de service account;
2. cantidad de usuarios Auth, sin UID/correo/teléfono/nombre/claims;
3. configuración Auth mediante booleanos de email, anónimo y teléfono;
4. colecciones raíz Firestore y detección de cualquier documento sin leer campos;
5. cantidad de bases Firestore, sin nombres/ubicaciones;
6. existencia de objetos Storage con `maxResults=1`, sin nombres/metadatos;
7. existencia de Functions con `pageSize=1`, sin nombres/configuración;
8. cantidad de releases de reglas, sin nombres ni contenido.

## Decisiones posibles

### `CLEAN_STATE_VERIFIED_READ_ONLY`

Todos los checks obligatorios están disponibles y Auth, Firestore, Storage y Functions no contienen recursos de negocio.

### `NONEMPTY_REVIEW_REQUIRED`

Se detecta al menos un usuario, contenido Firestore, objeto Storage o Function. El flujo se detiene para revisión; nunca borra ni sobrescribe.

### `INCONCLUSIVE_PERMISSION_OR_API`

Falta visibilidad read-only de un check obligatorio. No se infiere que el entorno esté limpio.

### `TARGET_MISMATCH_HARD_STOP`

Proyecto, bucket o service account no coinciden. Se detiene antes de leer datos del proveedor.

## Seguridad del runner

- workflow `workflow_dispatch` únicamente;
- confirmación exacta `VERIFY_FIREBASE_DEV_READ_ONLY`;
- secret fuera del repo;
- credencial temporal con limpieza `always()`;
- artifact limitado a reporte sanitizado;
- respuestas crudas no se persisten;
- no se muestran identificadores;
- no hay métodos POST/PUT/PATCH/DELETE;
- no hay Firebase deploy, gcloud write, imports o producción.

## Archivos

- `backend/contracts/phase-a-firebase-dev-clean-state-read-only-gate-v1.json`;
- `backend/config/phase-a-firebase-dev-clean-state-read-only.source-safe.json`;
- `tools/release/tya-firebase-dev-clean-state-read-only.mjs`;
- `tools/release/tya-firebase-dev-clean-state-read-only-gate-validate.mjs`;
- `.github/workflows/cxorbia-firebase-dev-clean-state-read-only-run.yml`;
- `.github/workflows/cxorbia-firebase-dev-clean-state-read-only-gate.yml`.

## Impacto Phase A TyA

Antes de conectar HR, shoppers históricos, certificaciones carryover, liquidaciones de junio, reviewQueue o `CX.data`, se confirmará que el entorno DEV no contiene residuos de otra app, usuarios heredados, datos o funciones inesperadas.

No se consulta ni modifica HR, shoppers, certificaciones, liquidaciones, evidencias o datos TyA.

## Legacy útil

Se conserva la regla comprobada de auditar antes de importar y de no sobrescribir silenciosamente. No se copia base, Auth, código ni datos de la plataforma vieja.

## Clasificación

- **Reusable CXOrbia:** clean-state read-only, reporte count-only, inconcluso no equivale a limpio, cero borrado automático.
- **Exclusivo cliente:** no hay datos TyA dentro del gate.
- **Claude/prototipo:** estados limpio/no vacío/inconcluso/bloqueado con copy honesto.
- **Academia:** lectura del gate, autorización del proveedor y no-deletion policy.
- **Sin impacto Claude:** APIs, secret temporal, run/artifact internos.

## Estado seguro

- proveedor no consultado;
- sin credenciales usadas;
- sin Auth users/claims;
- sin Firestore/Storage/Functions reads reales;
- sin writes/deletes;
- sin rules/Hosting deploy;
- sin import;
- sin producción.

## Siguiente punto

Ejecutar la consulta read-only únicamente después de autorización explícita separada de Paula. Si queda limpia, el siguiente bloque será el dry-run de identidades DEV opacas; si no, se abrirá revisión sin borrar ni modificar nada.
