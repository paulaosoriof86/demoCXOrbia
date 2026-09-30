# RECONSTRUCCIÓN ACUMULATIVA — FAMILIA A: SHELL Y RUNTIME

**Fecha de apertura:** 2026-08-02  
**Estado:** `FAMILY_A_INVENTORY_ACTIVE__SOURCE_ONLY__NO_DEPLOY`

## 1. Objetivo

Cerrar la proveniencia y compatibilidad de la base transversal antes de seleccionar módulos funcionales:

- entrada humana;
- shell;
- tenant/marca;
- navegación y rutas;
- Proyecto y Periodo;
- `CX.data`;
- HR;
- Auth y claims;
- adapters que alteran el runtime;
- orden de carga DEV;
- cache/refresh;
- identidad de build.

## 2. Entradas existentes

### `app/index.html`

- blob: `3855486bdddcfcdc2c702f08b2a640d99717d980`;
- shell comercial/base;
- carga core y módulos sin la cadena completa de backend DEV.

Clasificación provisional:

`PRESERVE_BASE_SHELL__NOT_DEV_RUNTIME_AUTHORITY`.

### `app/index-backend-dev.html`

- blob: `62959a6607585d57ade9011ea4206b07c7f4a502`;
- entrada DEV canónica actual;
- usa el mismo conjunto de módulos que `index.html` y agrega la cadena Auth/HR/Firestore/Finanzas/adapters;
- declara carril humano autenticado acumulativo y carril técnico E2E separado;
- no es un shell reducido por inventario, pero todavía debe demostrarse que sus adapters no sustituyen o degradan módulos aprobados.

Clasificación provisional:

`DEV_CANONICAL_ENTRY__DEPENDENCY_RECONCILIATION_REQUIRED`.

## 3. Shell base inspeccionado

| Archivo | Blob actual | Estado provisional |
|---|---|---|
| `app/app.js` | `d509d08bd20dd2e44fa414e0b4d2819dd18f7c36` | V182 exacta presente; overlays Auth pendientes |
| `app/styles/layout.css` | `2cea8372cad099cb4610b93744824e4596b04adc` | V182 exacta presente |
| `app/core/config.js` | `0bf7b6c1daded062806d90e03ba2c5d67ac1fe63` | navegación/roles en proveniencia |
| `app/core/router.js` | `fdd3c91c1428d49413fb305ed464dffdc6ea3e13` | resolver de navegación V171, revisar aprobaciones |
| `app/core/store.js` | `c6921e26773c866ba0b0ac0b725f4660e47742a5` | sesión/event bus/persistencia; dependencia crítica |
| `app/core/data.js` | `3a679020205617e44126ec586e0022edc70b0512` | demo genérica; solo fallback, nunca autoridad final |
| `app/core/data-source.js` | `6149dff1d91b83af007badbaafdef63f00c34d1f` | indicador único de fuente; revisar copy/estados |
| `app/core/hr.js` | `d29605947a7b455119d74ddcf29ac34c4720e437` | motor HR genérico; dedupe por llaves estables |
| `app/core/permissions.js` | `bedc4f8bbc80dba9f03e34ec6bbcf9cfeeb2a1d5` | acciones sensibles fail-closed |
| `app/core/build-lock.js` | `717dd4a40e3a24c380089cf22596e04fc8c25da1` | V174/R20 obsoleto; reemplazar al final |

## 4. Cadena DEV de autoridad y sesión

### `app/core/backend-config-preview-dev.js`

- blob: `b307ffa435001ba9970fb07784b7c80070eec6fb`;
- define dos carriles DEV mutuamente excluyentes:
  - humano visual;
  - runtime protegido técnico;
- no se carga en `index.html`; sí en `index-backend-dev.html`.

Estado provisional:

`PRESERVE_CONTRACT__VERIFY_EFFECTIVE_LANE`.

### `app/core/backend-browser-auth.js`

- blob: `d052a4b62e5320817d42055946e94de463914b24`;
- Firebase Auth como autoridad;
- prohíbe pantalla paralela;
- login normal como único punto visible;
- sesión válida restaurada silenciosamente.

Evidencia humana/técnica previa:

- doble login rechazado;
- root fix de single-login con PASS remoto posterior.

Estado provisional:

`APPROVED_CONTRACT_PRESENT__RUNTIME_CHAIN_VERIFY`.

### `app/core/backend-firebase.js`

- blob: `2c619c2a691e8de2033eca683e638414eddeb146`;
- mantiene interfaz estable `CX.data`;
- no toca módulos UI;
- alcance de proyecto/periodo antes del render;
- lectura protegida por principal Firebase.

Estado provisional:

`PRESERVE__CXDATA_INTERFACE_GATE_REQUIRED`.

### `app/adapters/tya-protected-auth-hr-authority-bridge-v2.js`

- blob: `4ff03ce4a4ab3cc680be32cc71f32d406cdb9307`;
- Auth/claims define principal y scope;
- HR viva preserva todos los periodos/visitas;
- Firestore solo enriquece identidad/perfil/certificación/finanzas;
- no dedupe por nombre;
- nueva pestaña y sesión restaurada se reconcilian.

Evidencia previa:

- Staff/Shopper/Cliente remoto PASS;
- Shopper exacto con `ownVisits=1`.

Estado provisional:

`APPROVED_TECHNICAL_PRESENT`.

### `app/adapters/tya-c6-unified-human-runtime-v1.js`

- blob: `7c00752d9a34209366f3c328ea3e5f5fddb4e1db`;
- declara recuperación frente a carril fragmentado/reducido;
- exige misma entrada visible, HR como autoridad y adapters canónicos activos.

Estado provisional:

`PRESERVE__MUST_PROVE_NO_MODULE_REPLACEMENT`.

## 5. Cadena HR live y refresh

### `app/core/tya-phase-a-source-safe-preview.js`

- blob: `2ac7e590940d3c6944f6dfb35f45dee2765b0503`;
- puente HR source-safe;
- proyecto padre y periodos separados;
- sin datos protegidos ni writes.

Estado provisional:

`PRESERVE__PERIOD_POLICY_AND_AUTHORITY_VERIFY`.

### `app/adapters/tya-live-source-inplace-apply.js`

- blob: `97769fd3125471ac60a30aecde0904d311f110d5`;
- aplica snapshot HR en memoria sin reload;
- contiene todavía valores de construcción heredados:
  - `modelo:'directo'`;
  - `isr:5`;
  - `regalias:10`.

Estos valores contradicen la configuración canónica de Cinépolis delegado/regalía 0 si llegaran a prevalecer. El PASS remoto demuestra que el contrato financiero posterior corrige la composición efectiva, pero la contradicción sigue físicamente presente y es un riesgo de orden de carga/regresión.

Estado:

`RECONCILIATION_REQUIRED__REMOVE_OR_NEUTRALIZE_LEGACY_DEFAULT_AT_FINAL_COMPOSITION`.

No se modifica todavía: primero se reconstruye toda la dependencia y se preserva el root fix remoto.

### `app/adapters/tya-live-source-refresh-watch-v2.js`

- blob: `0320fb7c1769ef11761e3fa5d107bfe47402b30c`;
- watcher estable sin trabajo funcional sobre la misma revisión;
- separa visual humano de E2E técnico;
- polling mínimo 15 s;
- no usa `location.reload()` según su contrato vigente.

Estado provisional:

`PRESERVE__VERIFY_WITH_SOURCE_REVISION_GATE`.

## 6. Contrato financiero transversal que afecta Familia A

### `app/adapters/tya-project-financial-model-contract-v1.js`

- blob: `333f5fd204cba2c53eefe8f98acb27a4502da166`;
- modelo por llave técnica `tenantId::projectId`;
- directo/delegado/regional;
- regalías solo con facturación local;
- delegado/regional sin regalías locales;
- valores no inventados;
- proyecto sin modelo explícito fail-closed.

Evidencia:

- root fix source-only PASS;
- remote PASS: 14 delegados, 0 directos, 0 sin configurar, 0 violaciones.

Estado:

`APPROVED_TECHNICAL_PRESENT__MUST_PREVAIL_OVER_LEGACY_DEFAULTS`.

## 7. Orden de carga DEV observado

La secuencia relevante de `index-backend-dev.html` es:

1. Firebase SDK/init;
2. snapshot HR source-safe;
3. core base;
4. `tya-phase-a-source-safe-preview.js`;
5. `tya-project-financial-model-contract-v1.js`;
6. core/data-source y dominio base;
7. fuentes financieras source-safe;
8. live apply + refresh;
9. read model y semántica canónica;
10. backend config/Auth/Firebase;
11. bridge Auth + HR;
12. `CX.data` guards/read-only;
13. adapters financieros canónicos;
14. router;
15. todos los módulos;
16. domain consistency, Shopper y Reservas guards;
17. unified human runtime;
18. `app.js`.

Implicación:

La candidata final no puede definirse solo por los archivos de `app/modules`. El comportamiento visible depende de una cadena extensa de adapters posteriores que puede sobrescribir datos, scopes, navegación y semántica.

## 8. Hallazgos Familia A hasta ahora

1. Existe un solo conjunto de módulos cargado en DEV, no un listado reducido.
2. Hay dos documentos HTML con roles distintos: base comercial y entrada DEV canónica.
3. El build-lock está desactualizado.
4. El archivo base `app.js` conserva V182 exacta.
5. Auth single-login y autoridad HR protegida están físicamente presentes y tienen PASS previo.
6. El adapter live source conserva defaults financieros heredados contradictorios, aunque el contrato posterior prevalece en el runtime remoto actual.
7. La integridad final debe gatear orden de carga, no solo SHA individual.

## 9. Pendientes para cerrar Familia A

- inventariar blobs y contratos de:
  - `backend-protected-dev-mode.js`;
  - `backend-protected-dev-session-continuity.js`;
  - `backend-cxdata-read-guard.js`;
  - `backend-cxdata-readonly-corte4.js`;
  - `tya-cumulative-read-model-v2.js`;
  - `tya-canonical-state-semantics-v2.js`;
  - `tya-c6-domain-consistency-bridge.js`;
- reconstruir commits/aprobaciones de config/router/store/proyecto-periodo;
- comprobar que no existe una segunda navegación efectiva;
- comprobar que `CX.data` mantiene exactamente su interfaz;
- definir qué defaults heredados se eliminan o neutralizan en el ensamblaje final;
- generar decisión final `PRESERVAR/RECONCILIAR/RESTAURAR` para cada dependencia.

## 10. Estado seguro

- cambios funcionales: 0;
- deploy: 0;
- provider writes: 0;
- merge: false;
- producción: false.

## 11. Clasificación

- **Reusable CXOrbia:** composición por capas, Auth detrás del producto y fuente canónica configurable.
- **Exclusivo cliente:** HR TyA/Cinépolis y configuración `tya::cinepolis`.
- **Claude/prototipo:** preservar entrada, navegación y shell aprobados.
- **Academia:** acceso, roles, fuente, proyecto/periodo y troubleshooting.
- **Sin impacto Claude:** orden de carga, blobs, gates y manifests.
