# RC Smoke Gate V91 Academia Coverage

Fecha: 2026-07-08  
Bloque: ampliar smoke gate con cobertura focalizada V91 Academia/Diagnostico/Administrabilidad  
Estado: seguro, sin deploy, sin produccion.

## 1. Objetivo

Avanzar hacia RC Phase A controlada reforzando el smoke gate automatizado con cobertura de los empalmes V91.

La prioridad es no depender solo de una revision visual manual para detectar regresiones basicas de:

- index/script loading;
- production copy guard;
- Academia admin actions;
- Crear con IA estable;
- Diagnostico & Readiness;
- Administrabilidad;
- Service Worker/cache V91.

## 2. Archivo actualizado

- `tools/migration/tya-phase-a-rc-smoke-gate.mjs`

## 3. Nuevas validaciones agregadas

### Documentos V91 requeridos

Se agregaron como documentos requeridos:

- baseline V91 incremental;
- auditoria forense V91;
- source lock candidata V91 controlada;
- empalme V91 batches 1 a 5.

### Scripts V91 requeridos en index

Se valida que `app/index.html` cargue:

- `core/v91-modules.js`;
- `modules/diagnostico.js`;
- `modules/administrabilidad.js`;
- `modules/academia-admin-actions.js`;
- `modules/academia-create-ai-stable.js`.

Tambien se valida orden:

- `academia-admin-actions.js` despues de `academia.js`;
- `academia-create-ai-stable.js` despues de `academia-admin-actions.js`.

### Academia admin actions

Se valida que `app/modules/academia-admin-actions.js` contenga señales minimas de:

- editar;
- duplicar;
- versionar;
- archivar;
- motivo obligatorio;
- auditRef;
- localStorage;
- wrapper de `CX.modules.aprendizaje`.

### Crear con IA estable

Se valida que `app/modules/academia-create-ai-stable.js` contenga señales minimas de:

- `#acadNew`;
- copy honesto de Gemini real no activo;
- estado `in_review`;
- source `ai_draft_preview`;
- motivo/auditRef;
- localStorage;
- wrapper de `CX.modules.aprendizaje`.

### Diagnostico y Administrabilidad

Se valida presencia de terminos minimos en:

- `app/modules/diagnostico.js`;
- `app/modules/administrabilidad.js`.

### Service Worker V91

Se valida:

- cache `cxorbia-v2`;
- purge de cache anterior;
- estrategia network-first.

## 4. Lo que no valida

Este gate no reemplaza smoke visual humano/consola.

No valida:

- clicks reales en navegador;
- estilos responsive exactos;
- persistencia visual real despues de refresh;
- service worker instalado en navegador real;
- problemas de cache ya existentes en navegador de Paula;
- integraciones reales.

## 5. Impacto Phase A

Ayuda a acelerar Phase A porque bloquea regresiones obvias antes del smoke visual humano. Permite saber rapidamente si un cambio rompe scripts, orden de carga, guard, Academia, Diagnostico, Administrabilidad o Service Worker.

## 6. Pendientes vivos

- Esperar nuevo run del smoke gate ampliado.
- Corregir causa raiz si aparece hard fail.
- Si pasa, avanzar a smoke visual/consola humano focalizado.
- Mantener limpieza fuente P0 modulo por modulo como pendiente.
- Mantener profundizacion de Academia por rol/manual/checklist/glosario como pendiente.

## 7. Clasificacion obligatoria

- Reusable CXOrbia: si. Smoke gate V91 reusable para futuros clientes y candidatas.
- Exclusivo cliente: no. No contiene datos TyA reales.
- Claude/prototipo: si. Valida que mejoras locales de Claude/ChatGPT sigan cargadas.
- Academia: si. Agrega checks focalizados de Academia admin actions y Crear con IA.
- Sin impacto Claude: no. Debe quedar documentado para paquete Claude como gate replicable.

## 8. Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge.
- Sin import real.
- Sin pagos reales.
- Sin provider real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
- Sin datos sensibles.
