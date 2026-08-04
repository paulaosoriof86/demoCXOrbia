# COMPARACIÓN SHAs PHASE A — BLOQUE 4 · AUTORIDADES Y COMPOSICIÓN

**Fecha:** 2026-08-04  
**Estado:** `PASS_5_REMAINING_FUNCTIONAL_AUTHORITIES_CLOSED__COMPLETE_LOAD_ORDER_INVENTORIED__NO_PRODUCTION`

## 1. Fuente y carril

- repo: `paulaosoriof86/demoCXOrbia`;
- rama: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- HEAD de entrada: `3be7763cdcbf446e8747b32818932bf77c026c3c`;
- source lock C6 desplegado: `b908daa8c9cce0bd1c06cb05e3aceb9ff1b98beb`;
- árbol `app/` C6 bloqueado: `ef0b80be9ff828f7e5d29f8b5732a3d6e8a284aa`.

La comparación GitHub entre el source lock C6 y el HEAD de entrada confirmó 31 commits posteriores, todos fuera del árbol funcional `app/`. Por tanto, el árbol `app/` vivo preserva exactamente el árbol desplegado C6.

## 2. Autoridades funcionales restantes

### 2.1 Ficha de visita

Archivo:

`app/modules/visita-detalle.js`

Blob vivo:

`ad819a540ae92a076902185d75878ea7e716bc8c`

Comparación:

- exacto en V161C: `ab862d2e2a92993238ee96d214c7024fccb22c1a`;
- exacto en source lock V174 aprobado: `d057d77c9117d9d451cfc9a6563083b78b926d57`;
- exacto en source lock C6 desplegado.

Decisión:

`PRESERVAR_FICHA_V174_V161C_EXACT__NO_RESTORE`.

### 2.2 Revisión Admin

Archivo:

`app/modules/revision-admin.js`

Blob vivo:

`41fcea495c1e23e7ecee43a637b45002124ea3c9`

Linaje:

- el módulo faltante fue restaurado desde V89 por un P0 estructural de carga;
- el smoke RC posterior eliminó el hard fail y pasó;
- el blob vivo coincide exactamente con el source lock V174 aprobado;
- el mismo blob está preservado en el árbol C6 desplegado.

Decisión:

`PRESERVAR_REVISION_ADMIN_V174_EXACT_AFTER_V89_RESTORE__NO_RESTORE`.

### 2.3 Documentos

Archivo:

`app/modules/documentos.js`

Blob vivo:

`28c302761f22807ed5ebcb1f04cd1d12827652dd`

Comparación:

- exacto en V161C;
- exacto en V174 aprobado;
- exacto en C6 desplegado.

Decisión:

`PRESERVAR_DOCUMENTOS_UI__STORAGE_REAL_CONTINUA_GATEADO`.

La presencia del módulo no autoriza uploads/downloads reales, URLs públicas ni exposición de DPI, banco, NDA o evidencia sensible.

### 2.4 Costos

Archivo:

`app/core/costos.js`

Blob vivo:

`7f0c4547a68b8bafebae0652b8de5c8e27114a0c`

Comparación:

- exacto en V161C;
- exacto en V174 aprobado;
- exacto en C6 desplegado.

Decisión:

`PRESERVAR_COSTOS_EXACTO__NO_RESTORE`.

Costos permanece dentro de Finanzas completa y debe probarse en el gate acumulativo; no se reemplaza por la implementación Emergent.

### 2.5 Motor del Portal Cliente

Archivo:

`app/core/cliente-data.js`

Blob vivo:

`3e2ac5716d711a7a883886085399ca04c614de77`

Comparación:

- V161C contenía un blob anterior: `f5522cc28ac53d65429847544451c07a957ab29f`;
- V174 aprobado contiene exactamente el blob vivo;
- C6 preserva el mismo resultado funcional.

Decisión:

`PRESERVAR_CLIENTE_DATA_V174_EXACT__NO_RESTORE_V161C`.

## 3. Resultado acumulado de recuperación

Se cierran las cinco autoridades restantes sin restauración.

Resultado:

`29_UNIQUE_PRESERVE_OR_RECONCILE_DECISIONS_CLOSED__0_RESTORE_REQUIRED`.

El riesgo principal ya no es pérdida física de módulos. El riesgo restante es composición efectiva:

- orden de carga;
- dependencias;
- overlays tardíos;
- navegación por rol;
- mismo periodo/scope/sourceRevision;
- report kit y exportadores;
- recarga y nueva pestaña.

## 4. Report kit y exportadores

### Proveedor reusable

`app/modules/cliente-extra.js`

Declara `CX.reportKit` con:

- branding del tenant;
- editor de columnas;
- vista previa;
- PDF;
- XLSX;
- PPTX;
- notas;
- mismas filas/columnas por formato.

### Consumidores

- Admin `informes`: `app/modules/operacion-extra.js`;
- Shopper `mireportes`: `app/modules/operacion-extra.js`;
- Cliente `cli_reportes`: `app/modules/cliente-extra.js`;
- Finanzas: `app/modules/finanzas.js`.

### Dependencias

- SheetJS `0.20.3` desde CDN versionado;
- `app/vendor/pptxgenjs.min.js`;
- impresión del navegador para PDF.

### P1/P2 preservados

- algunas gráficas no aparecen en rutas de impresión PDF;
- presentación Excel todavía básica.

No bloquean el freeze mientras filas, alcance, periodo, fuente y estados sean correctos.

## 5. Orden efectivo de carga

`app/index-backend-dev.html` carga:

1. CSS y bootstrap del entrypoint;
2. Firebase browser SDK;
3. build-lock, config, store y `CX.data`;
4. fuentes source-safe y modelos financieros;
5. HR live, composer y semántica canónica;
6. Auth/sesión/Firestore read-only;
7. adapters financieros;
8. router y módulos Phase A;
9. módulos posteriores preservados;
10. overlays C6;
11. `app.js` al final.

Reglas confirmadas por inspección:

- `core/data.js` carga antes de módulos;
- adapters canónicos cargan antes de consumidores;
- módulos y `CX.reportKit` quedan registrados antes del primer render de `app.js`;
- `app.js` es el último script local.

## 6. Overlay superseded detectado

El entrypoint todavía carga:

`app/adapters/tya-ab-cumulative-composition-v1.js`

Ese archivo:

- pertenece a la metodología A+B anulada;
- referencia `MANIFEST-A-B-CUMULATIVE-CANDIDATE-20260802.json`, superseded;
- envuelve CRM/Clientes/Marketing y filtra fixtures en memoria;
- no escribe proveedor;
- no demuestra por sí solo una regresión Phase A.

Clasificación:

`P1_SUPERSEDED_LOADED_OVERLAY__NOT_P0_PROVEN`.

No se elimina ni modifica sin gate. El manifest final debe marcarlo explícitamente y el gate acumulativo debe demostrar si puede retirarse o debe sustituirse por un guard de composición Phase A completa.

## 7. Navegación multirol

Autoridades:

- `app/core/config.js`: registro de módulos y `CX.NAV`;
- `app/core/router.js`: construcción y navegación;
- `app/core/permissions.js`: acciones sensibles fail-closed;
- Firebase claims y bridge C6: principal, tenant, proyecto, países y shopper exacto.

El gate final debe cubrir:

- admin/coordinación;
- cliente;
- shopper;
- módulos requeridos por persona;
- no ampliación silenciosa de scopes;
- nueva pestaña/recarga;
- rutas no registradas fail-closed.

## 8. Decisión

No se requiere delta funcional todavía.

Siguiente paso:

`MANIFEST FINAL PHASE A COMPLETA → GATE SOURCE/STATIC ACUMULATIVO → DELTA ÚNICO SOLO SI EL GATE DEMUESTRA P0 O PÉRDIDA DE COMPOSICIÓN`.

## 9. Estado seguro

- archivos funcionales modificados: 0;
- deploy: 0;
- provider writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.

## 10. Clasificación

- **Reusable CXOrbia:** linaje exacto, report kit, orden de carga y gate multirol.
- **Exclusivo cliente:** TyA/Cinépolis, HR, GT/HN, Q60/L200 y modelo delegado.
- **Claude/prototipo:** no reescribir; solo delta visual portable posterior.
- **Academia:** documentar autoridad, scopes y composición después del PASS.
- **Sin impacto Claude:** blobs, source locks y gate source/static.
