# Baseline auditada de continuidad V91 incremental CXOrbia

Fecha: 2026-07-08  
Fuente: `Prototype development request CXOrbia V91.zip`  
SHA256 fuente: `c6fe10ebcdd379a98f3cfb38065434321933cbf4fe4755df50ec8fe2f1cad6f8`  
Estado: baseline auditada de continuidad incremental, no source lock final, no produccion.

## 1. Decision metodologica

V91 queda fijada como la ultima baseline auditada de continuidad para el trabajo incremental.

Esto significa:

- se trabaja sobre V91 y no sobre versiones anteriores;
- V91 es la version viva de continuidad para empalme controlado;
- los pendientes encontrados no bloquean trabajar sobre V91;
- los pendientes se documentan y se corrigen por bloques;
- V91 no es source lock final ni produccion;
- no se debe volver a usar una version anterior como base salvo bloqueo critico nuevo documentado.

## 2. Por que no es source lock final

V91 aun tiene pendientes vivos:

- Academia admin actions visibles incompletas;
- boton `Crear con IA` pendiente de smoke funcional;
- copy P0 residual en algunos modulos;
- posible necesidad de empalmar `app/app.js` y `app/sw.js` por cache/PWA;
- docs del ZIP no deben reemplazar docs vivos del repo;
- pagos/HR/integraciones/correo requieren pasada adicional de copy honesto.

Estos pendientes se documentan y se corrigen incrementalmente, no obligan a retroceder de version.

## 3. Regla para los siguientes bloques

Todo bloque siguiente debe partir de esta baseline:

1. Mantener cambios V91 ya empalmados.
2. Preservar protecciones existentes del PR, especialmente `core/production-copy-guard.js`.
3. Empalmar por batches controlados.
4. No reemplazar documentos vivos por documentos viejos del ZIP.
5. No declarar resuelto lo que siga pendiente.
6. Documentar cada pendiente que falte en Claude/prototipo, backend reusable y Academia.
7. Mantener gates apagados y estados honestos.

## 4. Estado actual del empalme

Batch 1 empalmado:

- `app/modules/diagnostico.js`;
- `app/modules/administrabilidad.js`;
- `app/core/v91-modules.js`;
- `app/index.html` actualizado preservando `core/production-copy-guard.js`.

Pendiente de empalme/revision:

- `app/app.js`;
- `app/sw.js`;
- `app/modules/academia.js`;
- modulos con copy P0 residual;
- smoke visual y gates del head actual.

## 5. Clasificacion obligatoria

- Reusable CXOrbia: si. La regla incremental aplica a cualquier cliente y evita reprocesos.
- Exclusivo cliente: no. V91 es una baseline del tenant actual pero la metodologia es producto.
- Claude/prototipo: si. Claude debe corregir pendientes sobre esta baseline, no reiniciar desde versiones anteriores.
- Academia: si. Academia profunda y admin actions siguen pendientes sobre V91.
- Sin impacto Claude: no. Impacta paquete y auditoria de nuevas candidatas.

## 6. Estado seguro

Sin deploy.  
Sin produccion.  
Sin merge.  
Sin import real.  
Sin pagos reales.  
Sin provider real.  
Sin Firestore/Auth/Storage real.  
Sin HR writes.  
Sin Make/Gemini real.  
Sin datos sensibles.
