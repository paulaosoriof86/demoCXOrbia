# RECONSTRUCCIÓN ACUMULATIVA — FAMILIA A — ADDENDUM OVERLAYS Y CX.DATA

**Fecha:** 2026-08-02  
**Estado:** `FAMILY_A_OVERLAY_PROVENANCE_ACTIVE__SOURCE_ONLY__NO_DEPLOY`

## 1. Propósito

Registrar las capas que modifican el comportamiento del shell y de `CX.data` sin cambiar necesariamente los módulos UI. Estas capas deben formar parte de la candidata acumulativa, de sus gates y de la validación visual; no pueden tratarse como infraestructura invisible o neutral.

## 2. Runtime protegido

### `app/core/backend-protected-dev-mode.js`

Blob actual:

`83b262c0fc0a42be5c2f5e2b42381c884d50ee5c`

Comportamiento:

- activa únicamente el runtime protegido DEV;
- conserva Firebase Auth/claims como autoridad;
- deshabilita writes;
- fija tenant `tya` y proyecto `cinepolis`;
- declara preservación de la interfaz `CX.data`;
- normaliza aliases del perfil protegido sin match por nombre;
- reemplaza en memoria `CX.data.visitsForShopper()` y `CX.data.shopperStats()`.

Conclusión:

No es solo configuración. Es un overlay funcional que cambia resultados usados por módulos Shopper y Dashboard.

Clasificación provisional:

`PRESERVE_WITH_CXDATA_BEHAVIOR_GATE__PENDING_HUMAN_VISUAL`.

## 3. Continuidad de sesión

### `app/core/backend-protected-dev-session-continuity.js`

Blob actual:

`00f2b3d1e92ad6154853282a8881163cf9e6ca5d`

Comportamiento:

- fuerza persistencia Firebase LOCAL en el runtime protegido;
- no guarda credenciales, tokens ni UID;
- no omite claims ni Rules;
- logout explícito permanece real.

Clasificación provisional:

`PRESERVE_TECHNICAL__VISUAL_LOGIN_REFRESH_LOGOUT_GATE_REQUIRED`.

La aprobación visual debe verificar que no reaparece el login en recargas/nueva pestaña y que el logout/cambio de cuenta siguen funcionando.

## 4. Read guard Firestore

### `app/core/backend-cxdata-read-guard.js`

Blob actual:

`0ad6d8bdaade9a6a8b494297df7b7ddd3187d805`

Comportamiento:

- normaliza visitas, shoppers, postulaciones y proyectos;
- sustituye `CX.data.projects`, `shoppers`, `_visitas` y `_posts`;
- puede modificar `currentProjectId`;
- contiene traducciones legacy de estados;
- mapea `paid/pagada` a presentación `liquidada` en su tabla base.

Riesgo:

Puede colapsar pago confirmado y liquidación si prevalece después de la semántica canónica, o producir una verdad distinta según orden de carga.

Clasificación provisional:

`RECONCILIATION_REQUIRED__CANONICAL_STATE_PRECEDENCE_GATE`.

## 5. Guard read-only Corte 4

### `app/core/backend-cxdata-readonly-corte4.js`

Blob actual:

`3ad9c3db4f998a9edd23aaf7d2de8a8d8cc192f6`

Comportamiento:

- bloquea writes y preserva métodos públicos;
- mantiene lógica histórica para:
  - carril humano source-safe;
  - Firestore protegido vacío/fail-closed;
- puede vaciar las colecciones de `CX.data` y cambiar estados de fuente;
- puede declarar `humanVisualSourceSafe` o `connected` según la ruta efectiva.

Riesgo:

El runtime C6 vigente exige una única ruta humana autenticada y HR viva como autoridad. Esta capa anterior no puede degradar la candidata final a un shell source-safe o vacío.

Clasificación provisional:

`PRESERVE_WRITE_GUARD__RECONCILE_LANE_PRECEDENCE`.

## 6. Compositor canónico acumulativo

### `app/adapters/tya-cumulative-read-model-v2.js`

Comportamiento confirmado:

- HR conserva periodos, visitas y estado operacional;
- fuentes protegidas enriquecen solo identidad exacta, certificación y facetas financieras;
- matching por IDs, aliases exactos, HR row y coordenadas de fuente;
- no matching por nombre;
- conflictos pasan a review queue;
- genera facetas canónicas y resumen por periodo.

Punto sensible:

El normalizador de perfiles conserva campos de credenciales protegidas si ya existen en el payload. No los inventa, pero la candidata debe demostrar que esos campos no se exponen en UI, evidencia, logs ni exportaciones no autorizadas.

Clasificación provisional:

`PRESERVE_CANONICAL_COMPOSER__SENSITIVE_FIELD_EXPOSURE_GATE`.

## 7. Semántica canónica de estados

### `app/adapters/tya-canonical-state-semantics-v2.js`

Blob actual:

`c85be3537cfa80a2f0565ca074d71ecef68d53a2`

Comportamiento:

- distingue evidencia histórica de fuera de rango frente a caso accionable no resuelto;
- conserva evidencia de auditoría;
- KPIs cuentan únicamente casos accionables;
- transforma el read model sin writes.

Clasificación provisional:

`PRESERVE__ORDER_AFTER_CUMULATIVE_COMPOSER_REQUIRED`.

## 8. Bridge de consistencia de dominio

### `app/adapters/tya-c6-domain-consistency-bridge.js`

Comportamiento observado:

- activo en carril humano full visual;
- reemplaza en memoria múltiples métodos de `CX.data`;
- instala facetas, buckets, KPIs, stats Shopper, certificación y fase operativa;
- instala facades de Finanzas;
- parchea la presentación del Dashboard y otras superficies sin modificar los módulos base;
- deriva credenciales de patrón DEV para perfiles canónicos cuando faltan en el objeto visible.

Riesgos:

1. El mejor estado visual puede depender de este bridge, no del módulo fuente.
2. La derivación de credenciales no debe aparecer en producción ni ser necesaria para la operación humana final.
3. Al parchear DOM y métodos después de cargar módulos, puede ocultar que el módulo base está desactualizado.
4. La reconstrucción debe decidir qué lógica queda como adapter reusable y qué corrección debe existir en el contrato canónico, sin parchar UI desde backend.

Clasificación provisional:

`RECONCILIATION_REQUIRED__NO_UI_PATCH_AS_FINAL_AUTHORITY__PRESERVE_VALID_DOMAIN_LOGIC`.

## 9. Decisión de Familia A en este punto

No se restaura ni elimina todavía ninguna capa. Se reconstruye la precedencia completa para evitar perder PASS reales o consolidar parches transitorios como producto final.

Gates obligatorios antes del primer build A+B:

- inventario exacto de la interfaz pública `CX.data` antes/después de overlays;
- una sola autoridad de proyecto y periodo;
- una sola semántica de estados;
- HR como autoridad operacional;
- Auth/Firestore solo como overlay exacto;
- cero exposición de credenciales/PII;
- cero segundo shell o navegación;
- cero parche DOM como sustituto del mejor módulo fuente;
- entrada, refresh, nueva pestaña y logout;
- mismos KPIs y estados en CRM Ops Leads, Dashboard y hoja de ruta.

## 10. Validación visual vinculante

Familia A no quedará aprobada visualmente por este análisis. Se integrará con Familia B y se presentará a Paula en el **Checkpoint Visual 1** sobre un solo build acumulativo:

- entrada/login;
- tenant/proyecto/periodo;
- navegación;
- HR y estado de fuente;
- CRM Ops Leads;
- Dashboard;
- hoja de ruta.

## 11. Siguiente acción exacta

`INVENTARIAR INTERFAZ CX.DATA + PROYECTO/PERIODO + NAVEGACIÓN EFECTIVA + SERVICE WORKER/CACHE → DEFINIR PRECEDENCIA OBJETIVO → CERRAR FAMILIA A → ABRIR FAMILIA B`.

## 12. Estado seguro

- cambios funcionales: 0;
- Hosting deploy: 0;
- Cloud Run: 0;
- Firestore/Auth/HR/Rules/Storage writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.

## 13. Clasificación

- **Reusable CXOrbia:** composición de read models, gates de interfaz y precedencia de overlays.
- **Exclusivo cliente:** TyA/Cinépolis, HR y credenciales legacy.
- **Claude/prototipo:** la mejor UI no puede depender de un parche DOM oculto.
- **Academia:** documentar fuente, Auth, sesión, estados y troubleshooting reales.
- **Sin impacto Claude:** blobs, orden de carga y evidencia source-only.