# Empalme controlado del runtime post-V96

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Autorización

Paula autorizó explícitamente proceder con el empalme del runtime del source lock operativo post-V96. La autorización cubrió únicamente el empalme controlado en la rama y sus validaciones. No autorizó deploy, producción, Auth/Firestore real, imports, writes, HR writeback, Make, Gemini, Storage ni pagos.

## Ejecución

Se aplicó el source lock `Prototype development request.zip` post-V96 mediante un orquestador one-shot y verificaciones criptográficas.

- SHA-256 del ZIP auditado: `80feb7c7809d28657b5eec243aa187f678c023ecd471a9f9404e52d285bd2663`.
- Commit de runtime empalmado: `86e592db3f9f8016080302a852bfd194097b2074`.
- Mensaje: `feat(cxorbia): empalma runtime source lock post-V96`.
- Archivos runtime reemplazados/controlados: 37.
- Archivos adicionales backend/patch preservados: 27.

El proceso restauró desde el commit V96 conocido los archivos cuyo contenido no cambió en el source lock y superpuso únicamente los 10 archivos modificados por la candidata post-V96. No se sustituyó la rama a ciegas ni se eliminaron archivos adicionales.

## Validaciones previas al commit

El orquestador solo permitió crear el commit después de:

1. verificar el SHA-256 del paquete delta reconstruido;
2. verificar el SHA-256 del archivo comprimido;
3. ejecutar el gate de los 67 hashes del source lock;
4. validar sintaxis de todos los JavaScript bajo `app`;
5. comprobar scripts locales de `index.html`, sin faltantes ni duplicados;
6. validar `manifest.webmanifest`;
7. comprobar service worker y charset UTF-8;
8. confirmar que el workflow de deploy DEV continúa manual-only;
9. confirmar que los 27 archivos adicionales permanecen presentes;
10. confirmar que el conjunto de cambios runtime era exactamente el conjunto esperado de 37 archivos.

## Alineación de gates

Los validadores históricos todavía exigían overlays V91 que no forman parte del source lock post-V96. Se alinearon sin modificar el frontend:

- `tools/migration/tya-phase-a-rc-smoke-gate.mjs`;
- `tools/release/tya-rc-phase-a-predeploy-gate.mjs`;
- `tools/qa/tya-phase-a-visual-smoke.mjs`;
- `.github/workflows/cxorbia-phase-a-visual-smoke.yml`.

La alineación corrigió falsos positivos por módulos adicionales no cargados, claves públicas de Firebase tratadas erróneamente como secretos, service worker en la prueba visual y selectores de shell basados en `offsetParent`.

## Resultados finales de CI

Head validado al cierre técnico del bloque: `5f65ed2625e0e523cdc903994cc67a3dd9ec978c`.

Todos los gates relevantes terminaron en `success`:

- Source Lock Post-V96 Runtime Verify — run `29106409037`;
- DEV Auth Firestore Readiness Post-V96 — run `29106409032`;
- RC Phase A Smoke Gate — run `29106409023`;
- RC Phase A Predeploy Gate — run `29106409031`;
- Phase A Visual Smoke — run `29106409077`;
- RC Phase A Drift Gate — run `29106409150`.

### Source lock y smoke técnico

- runtime: `67/67` hashes coinciden;
- scripts locales de `index.html`: 61;
- scripts locales faltantes: 0;
- scripts locales duplicados: 0;
- JavaScript revisados con `node --check`: 91;
- errores de sintaxis: 0;
- registros `CX.module(...)` activos: 49;
- módulos activos duplicados: 0;
- requisitos semánticos post-V96: 9/9;
- material sensible real detectado: 0;
- archivos adicionales runtime preservados: 27.

El RC smoke quedó `GO_WITH_WARNINGS_RC_PHASE_A_POST_V96`. Las advertencias no activan proveedores ni bloquean el empalme:

- 36 coincidencias del scanner histórico de copy para revisión P1;
- 27 archivos adicionales preservados y reportados.

### Predeploy

El predeploy quedó `GO_WITH_WARNINGS_PREDEPLOY_NOT_DEPLOY_AUTHORIZATION`:

- `firebase.json` apunta a `app`;
- el proyecto por defecto continúa siendo `cxorbia-backend-dev`;
- el target Hosting DEV está configurado;
- no hay scripts backend activados en `index.html`;
- el workflow de deploy permanece manual-only;
- no tiene triggers `push`, `pull_request` ni `schedule`;
- exige `DEPLOY_DEV_ROOT`;
- el gate criptográfico se ejecuta antes de cualquier acceso Firebase;
- `deploymentAuthorization` permanece en `false`.

### Smoke visual por rol

Los seis perfiles abrieron shell y vista sin errores de página:

- admin: pass;
- coordinador: pass;
- aliado: pass;
- custom: pass;
- cliente: pass;
- shopper: pass.

No hubo pantallas blancas, errores JavaScript críticos ni overlays NDA persistentes. El service worker fue bloqueado solo dentro de la prueba para evitar que una recarga invalide el monkeypatch del NDA.

Quedó una advertencia visual para revisión focalizada: el selector automatizado contó 30 botones descendientes durante la sesión `custom`. La captura muestra el shell de Academia y no permite concluir por sí sola que haya acceso efectivo a módulos administrativos. Debe verificarse por rutas/acciones contra la matriz de permisos antes de Auth real.

Las capturas de coordinador y aliado muestran el grupo `Admin del proyecto`. Esto puede corresponder al alcance `projectAdmin` previsto por la matriz, pero debe confirmarse contra la decisión funcional de Paula antes de crear claims reales. No se alteró el frontend para imponer una interpretación desde backend.

## SHA runtime validado

El drift gate quedó alineado al commit de runtime:

`86e592db3f9f8016080302a852bfd194097b2074`

Los cambios posteriores aceptados por el gate son únicamente documentación, validadores, workflows explícitos, contratos/adapters preview, configuración `*.source-safe.json` y reglas `*.rules.draft`. Cualquier cambio futuro en `app` vuelve a exigir hash, smoke y actualización controlada del SHA.

El workflow manual de Hosting DEV también referencia este SHA, pero no se ejecutó ni queda autorizado.

## Impacto Phase A TyA

El empalme alinea la rama con el prototipo post-V96 que cerró el P0 estático de permisos, cliente multi-proyecto y copy más honesto. Permite continuar después con Auth/Firestore DEV limpio, pero no los activa.

Protege los dominios ya trabajados:

- HR como fuente operacional;
- shoppers históricos;
- certificaciones carryover;
- liquidaciones y pagos de junio;
- proyecto Cinépolis configurable dentro del tenant TyA;
- reviewQueue y auditEvents;
- futuro switch único de `CX.data`.

## Adiciones preservadas

Los 27 archivos adicionales de backend/patch permanecen en la rama, pero el `index.html` del source lock no los activa automáticamente. Deben revisarse y consolidarse después, sin romper la identidad del source lock.

Incluyen adapters/bridges backend deshabilitados o preview, guards, source-safe preview, módulos V91, rutas y patches incrementales de Academia.

## Clasificación

- **Reusable CXOrbia:** orquestador de empalme con hashes, conjunto exacto de archivos, preservación de extras, validadores alineados y drift fail-closed.
- **Exclusivo cliente:** reglas y contenido TyA/Cinépolis contenidos en el source lock.
- **Claude/prototipo:** consolidación futura de patches, P1 de permisos/copy y revisión visual focalizada de scopes.
- **Academia:** revisar manuales, cursos y rutas por rol contra el runtime empalmado; preservar acciones administrativas/Crear con IA como pendientes de consolidación.
- **Sin impacto Claude:** empaquetado, hashes, CI, verificación de sintaxis y control de deploy manual-only.

## Estado seguro

- sin merge;
- sin deploy nuevo;
- sin producción;
- sin Auth real, usuarios o claims;
- sin Firestore reads/writes;
- sin import real;
- sin `CX.data` runtime switch;
- sin HR writeback;
- sin Make/Gemini/Storage;
- sin pagos reales;
- sin datos sensibles crudos.

## Decisión

El empalme runtime post-V96 queda **completado y técnicamente validado**, pero no equivale a GO de producción ni a autorización de activación DEV.

El siguiente bloque es preparar la activación Auth/Firestore DEV limpia sobre este runtime, manteniendo providers y writes apagados, y ejecutar primero una comprobación focalizada de permisos por ruta para coordinador, aliado y custom antes de materializar claims.
