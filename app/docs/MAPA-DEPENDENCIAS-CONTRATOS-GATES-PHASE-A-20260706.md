# Mapa dependencias contratos y gates Phase A - CXOrbia TyA

Fecha: 2026-07-06

## Objetivo

Mapear dependencias entre contratos Phase A y gates de salida para evitar saltos prematuros a source lock, backend real, import, proveedores o produccion.

## Estado general

Seguimos en Phase A. Este mapa es documental y no activa runtime.

## Cadena de salida segura

1. P0 frontend corregido por Claude.
2. Nueva candidata auditada de forma forense.
3. Source lock aprobado.
4. Readiness local revisado.
5. Conexion backend DEV controlada.
6. Import real solo con autorizacion.
7. Proveedores reales solo con gates.
8. Produccion solo con decision explicita.

## Dependencias por contrato

| Contrato | Depende de | Gate bloqueante | Salida esperada |
|---|---|---|---|
| Estado operacional proyecto | tenant/proyecto definido | source lock | readiness por proyecto |
| Ruteo cuestionario | estado operacional | P0 textos y source lock | fuente de cuestionario clara |
| Evidencias | estado operacional | reglas Storage y source lock | evidencia trazable sin datos sensibles |
| Cierre operativo | visita/cuestionario/submit | import y revision | liquidacion controlada |
| Asignaciones | postulaciones/HR | Make apagado hasta gate | no duplicar visitas |
| Postulaciones | asignaciones | backend gate | decision preview segura |
| Outbox | postulaciones/asignaciones/academia | proveedor apagado | cola preview honesta |

## Bloqueos actuales

- P0 frontend pendiente.
- Source lock no aprobado.
- Readiness local no ejecutado.
- Backend real no conectado.
- Import real no autorizado.
- Proveedores reales no activos.
- Produccion no autorizada.

## Regla

Ningun contrato por si solo autoriza ejecucion real. Todo debe pasar por gates en orden.
