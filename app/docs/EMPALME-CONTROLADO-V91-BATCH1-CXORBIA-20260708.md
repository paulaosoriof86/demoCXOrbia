# Empalme controlado V91 - Batch 1 CXOrbia

Fecha: 2026-07-08  
Fuente: `Prototype development request CXOrbia V91.zip`  
SHA256 fuente: `c6fe10ebcdd379a98f3cfb38065434321933cbf4fe4755df50ec8fe2f1cad6f8`  
Estado: empalme parcial controlado, no produccion.

## 1. Objetivo

Iniciar el empalme de la candidata V91 como ultima baseline auditada de continuidad, sin aceptar blockers ni reemplazar archivos vivos que protegen el PR.

## 2. Archivos creados

- `app/modules/diagnostico.js`
- `app/modules/administrabilidad.js`
- `app/core/v91-modules.js`
- `app/docs/EMPALME-CONTROLADO-V91-BATCH1-CXORBIA-20260708.md`
- `app/docs/CAMBIOS-EMPALME-CONTROLADO-V91-BATCH1-20260708.md`

## 3. Archivos actualizados

- `app/index.html`

## 4. Que se empalmo

### Diagnostico & Readiness

Se agrego `app/modules/diagnostico.js` desde V91.

Este modulo muestra, todo en preview:

- synthetic runner;
- readiness por dominio;
- bandeja de conflictos;
- contratos y gates;
- sourceRefs opacas;
- revision humana;
- produccion no autorizada.

### Administrabilidad

Se agrego `app/modules/administrabilidad.js` desde V91.

Este modulo muestra, todo en preview:

- matriz de dominios administrables;
- NDA versionado;
- planes versionados;
- reglas y gates;
- motivos obligatorios;
- provider pendiente/gate apagado.

### Registro controlado de navegacion

Se agrego `app/core/v91-modules.js` para registrar Diagnostico y Administrabilidad sin reemplazar `app/core/config.js` completo.

Motivo: evitar empalme ciego de `config.js` y reducir riesgo de regresion en configuracion viva.

El archivo:

- registra `diagnostico` y `administrabilidad` en `CX.MODULES`;
- agrega categorias `cfg`;
- fuerza `moduleEnabled` true para ambos;
- reordena la seccion Configuracion del admin para incluirlos.

### Index preservando guard

Se actualizo `app/index.html` para:

- cargar `core/v91-modules.js` despues de `core/config.js`;
- conservar `core/production-copy-guard.js` despues de `core/ui.js`;
- cargar `modules/diagnostico.js` y `modules/administrabilidad.js` al final de modulos.

## 5. Que NO se empalmo en este batch

No se reemplazo masivamente `/app/core` ni `/app/modules`.

No se empalmaron todavia:

- `app/app.js`;
- `app/sw.js`;
- `app/modules/academia.js`;
- modulos con copy P0 residual;
- docs del ZIP V91.

Motivos:

- evitar perder protecciones del PR actual;
- evitar reemplazar documentos vivos por docs viejos;
- mantener empalme incremental y auditable;
- corregir primero los blockers detectados.

## 6. Pendientes vivos despues del batch

1. Verificar gates del nuevo head.
2. Hacer smoke visual de Diagnostico y Administrabilidad.
3. Revisar si conviene empalmar `app/app.js` y `app/sw.js` de V91 por cache/PWA.
4. Corregir P0 copy residual.
5. Resolver Academia admin actions visibles.
6. Revisar `Crear con IA` en Academia.
7. No reemplazar docs vivos con docs del ZIP.

## 7. Clasificacion obligatoria

- Reusable CXOrbia: si. Diagnostico, readiness y administrabilidad son patrones reutilizables para otros clientes.
- Exclusivo cliente: no. No contiene datos TyA reales ni hardcode cliente unico.
- Claude/prototipo: si. Se empalman modulos frontend de Claude, pero quedan pendientes P0.
- Academia: si. Administrabilidad refuerza necesidad de explicar versionado, gates, NDA y planes.
- Sin impacto Claude: no aplica; hay impacto visual/prototipo.

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
