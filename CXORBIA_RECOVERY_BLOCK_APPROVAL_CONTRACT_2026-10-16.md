# CXOrbia I3 — aprobación incremental y conservación acumulativa

**Fecha:** 2026-10-16. **Autoridad:** petición expresa de Paula de congelar el plan e iniciar; revisar cada bloque corregido sin esperar a todos. **Estado de este contrato:** FROZEN. **Producción:** DO_NOT_TOUCH.

## Regla de entrada
Leer `CXORBIA_RECOVERY_PLAN_FROZEN_2026-10-16_V1_1.json` y `CXORBIA_RECOVERY_EXECUTION_CURRENT.json`, resolver HEAD/descriptor/ledger/matriz vivos y recuperar el paquete custodiado por ID y SHA-256. No reconstruir el alcance desde conversaciones.

## Preview que sí puede presentarse
Un bloque entra a revisión cuando: existe contraejemplo y reparación focal probada, la prueba funcional de ese bloque pasa, se comprueban sus bytes efectivamente servidos en DEV y no queda un P0 que invalide esa revisión. Entregar URL del DEV existente, rol, ruta exacta, qué observar, resultado probado y límites. No esperar módulos independientes. No presentar una captura vieja o un enlace genérico como evidencia de una corrección nueva.

## Recibo de aprobación
Registrar módulo, funciones, tareas/VRM, rol, tenant/proyecto/periodo, source SHA, owner blobs, dependency blobs, configuración y revisión de fuente, digest/Hosting/runtime, expected/observed, evidencia funcional y visual, texto explícito de aprobación de Paula y fecha. No aprobar por ausencia de respuesta ni por una visita de la usuaria al enlace.

## Monotonicidad
La aprobación conserva validez si owners, dependencias relevantes, configuración y contrato siguen equivalentes. Un cambio relacionado exige BEFORE/AFTER y revalidación de ese alcance, no de toda la plataforma. Un nuevo hallazgo se agrega a la causa/tarea competente; ningún hallazgo previo se elimina, renumera o cierra por omisión. Los 274 VRM y los recibos humanos previos permanecen referenciados; F01-F16 no los sustituyen.

Los estados son OPEN → OWNER_PROVEN → SOURCE_FIXED → SOURCE_PROVEN → DEV_MATERIALIZED → LIVE_E2E_PASS → HUMAN_PASS. Evidencia documental, source, prueba real y aceptación humana no son intercambiables. El estado global sigue siendo GO/HOLD/NO_GO, nunca un porcentaje.

## Una sola candidata y artefacto final
Se permiten previews seriales de bloques sobre la única candidata acumulativa antes de certificar el artefacto final. No se abren ramas, candidatas ni workflows paralelos. Cada promoción de preview conserva los cambios aceptados y demuestra su identidad. Gate20/Gate21 y el cierre final corresponden al artefacto exacto que se publicará; no se reconstruye entre certificación e I4.

Esta decisión sustituye únicamente la espera al checkpoint humano único del lock del 06-10. No elimina las pruebas globales necesarias ni autoriza producción. Tampoco permite desplegar HEAD por rutina.

## Partes por bloque
En cada entrega indicar qué cambió realmente, qué pasó su gate, qué sigue abierto, cuántos frentes/condiciones faltan para producción y cuáles dependen de acceso externo. No convertir el número de tareas en duración ficticia. Cuando no haya un bloque recién corregido y probado, decirlo sin ofrecerlo como nuevo preview.

## Seguimiento y alcance futuro
Mantener explícitos I3, I4, estabilización y Fase B, incluido el seguimiento legal no bloqueante ya aprobado. No trasladar P0 esenciales a postproducción, ni funciones Fase A a evolución para fabricar GO. Las referencias históricas indexadas conservan su carácter de evidencia; no son órdenes para reabrir gates o volver a otra metodología.
