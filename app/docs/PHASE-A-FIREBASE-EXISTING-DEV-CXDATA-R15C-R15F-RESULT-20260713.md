# Phase A — Firebase DEV existente y CX.data read-only R15C–R15F

Fecha: 2026-07-13  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Decisión ejecutiva

Se corrige la ruta Firebase: **se conserva `cxorbia-backend-dev`**. No corresponde crear otro proyecto ni solicitar permisos de creación de proyectos.

La reconciliación read-only confirmó que Auth, Firestore y rules encontrados pertenecen al historial conocido de CXOrbia DEV. El proyecto puede seguir usándose como entorno DEV existente, con separación estricta entre:

1. procedencia del entorno;
2. lectura Firestore de referencia;
3. fuente canónica operativa TyA;
4. materialización futura;
5. deploy y producción.

La fuente canónica operativa actual continúa siendo **HR viva TyA multi-tab source-safe + control financiero R14C**. Firestore DEV queda como referencia read-only hasta reconciliar y materializar la fuente canónica mediante un gate posterior.

## R15C — procedencia Firebase DEV

Decisión: `PASS_WITH_REVIEW_EXISTING_CXORBIA_DEV_PROVENANCE_R15C`.

Resultado sanitizado:

- proyecto y dominio de service account coinciden;
- tenant `tya` existe;
- Auth: 17 usuarios, los 17 con dominio ficticio DEV conocido;
- 15 con estructura esperada de claims;
- 13 con claim tenant `tya`;
- 0 usuarios deshabilitados;
- 0 usuarios sin clasificar;
- una colección raíz Firestore, únicamente `tenants`;
- clientes: 3;
- proyectos: 29;
- shoppers: 215;
- notificaciones: 20;
- shopperBenefits: 572;
- dos proyectos históricos conocidos presentes, con 36 y 8 visitas;
- un release de rules;
- 0 bloqueos y 0 ítems de revisión de procedencia.

Evidencia:

- run: `29273096228`;
- artifact digest: `sha256:9e101e564b539a5ba988987edb76dec1a3662d754aa7d45c1031ef42483578ec`.

No se persistieron correos, identificadores, campos de documentos, respuestas crudas ni credenciales.

## R15D — adapter CX.data Firestore read-only

Decisión: `PASS_WITH_REVIEW_READONLY_CXDATA_ADAPTER_FALLBACK_R15D`.

Resultado:

- facade `CX.data`: 19/19 miembros requeridos;
- lecturas sincrónicas compatibles;
- 29 proyectos;
- 215 shoppers;
- 619 visitas;
- 3 postulaciones;
- 0 certificaciones materializadas;
- 255 liquidaciones;
- 572 shopperBenefits;
- 0 campos prohibidos expuestos;
- 7 métodos de escritura probados y bloqueados;
- 0 escrituras ejecutadas.

El proyecto canónico `cinepolis` todavía no existe materializado con esa llave en Firestore; el smoke seleccionó un proyecto histórico conocido como fallback. Esto valida el adapter, pero **no autoriza convertir Firestore en fuente canónica**.

Evidencia:

- run: `29273404696`;
- artifact digest: `sha256:4d4259de299651a4c85a9dea4b527a6f9b1aaa717e15ca66ebad1596c12f4250`.

## R15E — clasificación de drift canónico

Decisión vigente: `HOLD_FIRESTORE_AS_CANONICAL_SOURCE_SAFE_BINDING_PREPARED_R15F`.

Diferencias reales:

- Firestore visitas: 619; HR canónica: 616; delta: +3;
- Firestore shoppers: 215; HR live source-safe: 210; delta: +5;
- histórico protegido shoppers: 213; Firestore: +2;
- Firestore liquidaciones: 255; control financiero R14C: 247; delta: +8;
- Firestore certificaciones: 0; población carryover pendiente de fuente: 213;
- proyecto canónico `cinepolis`: no materializado con esa llave en Firestore.

Consecuencia:

- Firebase DEV sí pertenece a CXOrbia;
- Firestore puede consultarse read-only;
- Firestore no puede sustituir todavía la fuente TyA canónica;
- no se borran ni sobrescriben datos;
- los conflictos y diferencias pasan a reconciliación/materialización futura.

## R15F — binding source-safe de build

Se creó un binder determinístico que modifica únicamente la copia de build, no la fuente V110 comprometida en Git.

Orden validado:

1. payload HR source-safe;
2. `core/data.js`;
3. bridge `core/tya-phase-a-source-safe-preview.js`;
4. boot de la aplicación.

Decisión del binder: `PASS_SOURCE_SAFE_BINDING_BUILD_R15F`.

Smoke visual source-safe:

- decisión: `PASS_WITH_REVIEW_SOURCE_SAFE_VISUAL_SMOKE`;
- 14 periodos;
- 616 visitas;
- 210 shoppers live source-safe;
- GT: 476;
- HN: 140;
- junio: 44/44 visitas con evidencia de ejecución;
- 13/13 rutas Admin, Cliente y Shopper;
- 0 errores de página;
- 0 errores de consola;
- 0 blockers;
- única advertencia: `shopper_count_drift_review:210/213`.

Evidencia:

- run: `29273880997`;
- artifact digest: `sha256:f4a4d5cbddbe2bfb0b55feede15ffb1b90d4edceb604bfc5dacdd071f331a9e6`.

## Gates V110 corregidos

Se retiró el ruido de validadores que todavía comparaban V110 contra hashes post-V96.

Resultados actuales:

- source lock V110 unión: `PASS`;
- 1,426/1,426 archivos verificados;
- 0 faltantes;
- 0 diferencias;
- 0 inesperados;
- aggregate SHA-256 verificado;
- drift gate: `success`;
- predeploy: `GO_WITH_WARNINGS_PREDEPLOY_NOT_DEPLOY_AUTHORIZATION`;
- RC smoke: `GO_WITH_WARNINGS_RC_PHASE_A_V110`;
- 99 archivos JavaScript sin errores de sintaxis;
- 49 módulos registrados, 49 únicos;
- 0 scripts duplicados o faltantes;
- R15F preparado;
- advertencia P1 acumulada: 40 hallazgos del scanner de copy, no activación de proveedor ni P0 runtime.

Evidencias finales:

- source lock run: `29274357691` y validaciones posteriores success;
- drift run: `29274359399`, success;
- predeploy run: `29274847953`, success;
- predeploy digest: `sha256:6ec0b85692dcd7650a39605328b3cacb7dfda43e9cb1f0cd9002097c46e49f8e`;
- RC smoke run: `29274846600`, success;
- RC smoke digest: `sha256:1d793b79d71520bbb6c89d7ff269e5bcd5ed0700caf99a858e2ea4fff7544297`.

Un gate predeploy verde **no autoriza deploy**.

## Pendientes operativos preservados

- shopper source gap: 210/213, sin match por nombre;
- finanzas R14C: 196 enlaces exactos de 247 filas;
- finanzas reviewQueue: 51 filas;
- junio: 27 filas financieras encontradas y 17 GT faltantes;
- certificaciones carryover: 213 shoppers pendientes de fuente materializable;
- 0 pagos confirmados por inferencia;
- Firestore canónico/materialización: HOLD;
- Auth/claims nuevos: HOLD;
- deploy: HOLD;
- producción: HOLD.

## Siguiente bloque exacto

Preparar el **plan de materialización canónica dry-run** contra el mismo `cxorbia-backend-dev`, usando llaves estables, sin ejecutar escrituras. Debe separar:

- registros create/update/noop/review;
- proyecto `cinepolis` configurable;
- 616 visitas HR;
- 210 shoppers live y gap 3 en review;
- certificaciones carryover sin inventar aprobaciones;
- 247 filas financieras con 51 en revisión;
- rollback, auditoría y batch boundaries.

## Estado seguro

- sin proyecto Firebase nuevo;
- sin borrado o limpieza;
- sin writes Auth/claims/Firestore/Storage;
- sin import real;
- sin deploy;
- sin producción;
- sin Make/Gemini;
- sin pagos;
- sin PII o credenciales expuestas.
