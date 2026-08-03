# CAMBIOS BACKEND — A+B COMPOSICIÓN, MANIFEST Y GATES

**Fecha:** 2026-08-02  
**Estado:** `A_PLUS_B_SOURCE_ASSEMBLED__PRECHECK_PASS__EXACT_CHECKOUT_GATE_PENDING__NO_DEPLOY__NO_PRODUCTION`

## 1. Autorización

Paula autorizó el macro-bloque:

`PROVENIENCIA Y APROBACIONES A+B → SHAS OBJETIVO → DELTA ACUMULATIVO → GATES SOURCE-ONLY`.

No autorizó Hosting DEV, proveedores, merge ni producción.

## 2. Proveniencia cerrada

Se confirmó por Git blob que las superficies A+B actuales conservan la línea aprobada/preservada:

- M1/Corte 1: build visual `67c0943260f076f5686284ac509458ed5fd34dbd`;
- Corte 2A/V174: no modificó los módulos A+B;
- Corte 3/V182: preservado en `app/app.js` y `app/styles/layout.css`;
- fixes C6 posteriores: conservados como dependencias de runtime, no como sustituto de aprobación visual.

Módulos A+B que permanecen sin reescritura:

- `app/modules/dashboard.js`;
- `app/modules/crm.js`;
- `app/modules/clientes.js`;
- `app/modules/comercial.js`;
- `app/modules/marketing.js`;
- `app/modules/rutas.js`.

Dashboard conserva aprobación visual ancestral, pero el resultado compuesto requiere revalidación. CRM, Clientes, Comercial, Marketing y Hojas de Ruta permanecen `BEST_TECHNICAL_PENDING_VISUAL`.

## 3. Archivos funcionales creados o modificados

### Creado

`app/adapters/tya-ab-cumulative-composition-v1.js`

Commits:

- creación: `b8c5323b9887fc97375f805cec9320dfc8b9afa7`;
- corrección de mutabilidad/proveniencia: `4c5f0d829efe0094707235fab1472539d950b81e`.

Git blob final:

`9c0d76382531b8393cc0866ec694935a2a5e25a6`.

Función:

- opera únicamente en el carril humano autenticado canónico;
- preserva módulos frontend y la interfaz `CX.data`;
- retira de memoria los prospectos sintéticos conocidos de Clientes;
- retira contactos placeholder generados sin proveniencia;
- oculta fixtures CRM en conectado;
- conserva registros CRM creados por usuario con `dataOrigin=platform_user`;
- oculta fixtures de Marketing;
- conserva contenido de Marketing creado por usuario con proveniencia;
- alinea el mes de Marketing con el periodo activo;
- registra tenant/proyecto/periodo, HR authority y contrato financiero;
- no borra localStorage ni escribe proveedores.

### Modificado

`app/index-backend-dev.html`

Commit:

`90d6c045c9ad7aaee284ad69bbbb146fbbd09326`.

Git blob:

`b9a4aaf063d97305c3f4f53eba8f02b526d61761`.

Cambio:

- carga una sola vez `tya-ab-cumulative-composition-v1.js`;
- lo carga después de los módulos A+B y antes de los bridges C6;
- no altera la entrada, Auth, HR, portales, Finanzas ni módulos diferidos.

## 4. Manifest y gates

### Manifest creado

`app/docs/MANIFEST-A-B-CUMULATIVE-CANDIDATE-20260802.json`

Estado:

`SOURCE_ASSEMBLED_PENDING_GATES_AND_VISUAL`.

Contiene 23 archivos con:

- Git blob actual;
- origen/aprobación;
- estado honesto;
- acción preservar/validar/reconciliar;
- facts HR/Shopper/Cliente/Finanzas preservados.

### Gate source-only creado

`tools/qa/tya-ab-cumulative-candidate-source-gate.mjs`

Valida:

- existencia y Git blob de cada archivo del manifest;
- orden de carga;
- carga única del adapter;
- sintaxis;
- ausencia de llamadas ejecutables a proveedores;
- estado honesto de los módulos;
- unit gate;
- build-lock no falsamente congelado.

### Unit gate creado

`tools/qa/tya-ab-cumulative-composition-unit.mjs`

Resultado ejecutado sobre copia exacta del blob del adapter:

`PASS` — 23 verificaciones.

Incluye supresión de fixtures, preservación de registros reales/mutables, periodo, tenant/proyecto y contrato financiero delegado.

### Evidencia creada

`app/docs/EVIDENCE-A-B-CUMULATIVE-SOURCE-PRECHECK-20260802.json`

Estado:

`PASS_CONNECTOR_ASSISTED_PRECHECK_PENDING_EXACT_CHECKOUT_GATE_AND_VISUAL`.

El gate integral de checkout quedó listo, pero no se declara ejecutado: la sesión del conector dispone de contenidos GitHub, no de shell autenticado ni workflow-dispatch. Debe ejecutarse sobre checkout exacto antes de cualquier deploy.

## 5. Qué no se tocó

- módulos frontend A+B;
- `CX.data` público;
- HR/read model/canonical semantics;
- Auth/claims;
- Firestore/Rules/Storage;
- Finanzas canónica;
- experiencia Shopper;
- Portal Cliente y reportes;
- Academia;
- producción.

## 6. Impacto por clasificación

- **Reusable CXOrbia:** manifest por módulo/blob, supresión de fixtures por proveniencia y gate de composición.
- **Exclusivo cliente:** tenant `tya`, proyecto `cinepolis`, periodos HR y modelo delegado Q60/L200.
- **Claude/prototipo:** módulos preservados; validación visual pendiente; no hay reescritura frontend.
- **Academia:** actualizar después del Checkpoint Visual 1, no por precheck técnico.
- **Sin impacto Claude:** gate, evidence, hashes y continuidad.

## 7. Estado seguro

- Hosting deploy: 0;
- Cloud Run/Firestore/Auth/Rules/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: false.

## 8. Siguiente bloque exacto

`EXACT CHECKOUT A+B SOURCE GATE → STATIC/CUMULATIVE GATES → SOLO SI PASS, AUTORIZACIÓN DE UN HOSTING DEV → CHECKPOINT VISUAL 1 DE PAULA`.
