# Academia module change sync gate

Fecha: 2026-07-04

## Decision

Cada vez que se complemente, corrija, amplie o conecte un modulo, se debe revisar y documentar el impacto en Academia.

Esto aplica tanto si el cambio es de backend, contrato, flujo, texto, modulo visual, integracion, automatizacion, rol, permiso, importador o dato operativo.

## Regla permanente

Un cambio de modulo no queda completo si no se reviso su impacto en:

- manuales del modulo;
- cursos relacionados;
- rutas de aprendizaje por rol;
- guias paso a paso;
- errores frecuentes;
- checklist de validacion;
- glosario;
- temas disponibles para solicitar capacitacion;
- valor operativo y comercial del modulo.

## Instruccion futura para Claude

Cuando Claude reciba un paquete o candidato nuevo, debe revisar puntualmente:

1. Que archivos se modificaron.
2. Que modulos cambiaron.
3. Que roles son afectados.
4. Si los manuales y cursos relacionados fueron actualizados.
5. Si la ruta de aprendizaje por rol quedo alineada.
6. Si los cambios operativos tienen explicacion paso a paso.
7. Si los beneficios, valores agregados o paquetes comerciales quedaron documentados cuando aplica.
8. Si `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` y `CAMBIOS-BACKEND.md` o addendum quedaron actualizados.

Si falta documentacion de Academia, Claude debe reportarlo como pendiente, no asumir que esta completo.

## Contrato creado

- `app/contracts/module-academy-sync-gate.tya.contract.json`

## Validador creado

- `tools/migration/tya-module-academy-sync-gate-validator.mjs`

El validador revisa que el contrato contenga:

- checklist obligatorio por cambio de modulo;
- roles a revisar;
- activos de Academia a revisar;
- plantilla minima de revision;
- hard stops.

No conecta backend real, no escribe Firestore, no modifica runtime y no usa Gemini real.

## Plantilla minima por cambio de modulo

Cada cambio debe responder:

1. Modulo cambiado.
2. Archivos cambiados.
3. Resumen del cambio.
4. Impacto Phase A.
5. Impacto Phase B.
6. Roles afectados.
7. Manuales a actualizar.
8. Cursos a actualizar.
9. Lecciones nuevas necesarias.
10. Terminos de glosario necesarios.
11. Temas de capacitacion a agregar.
12. Valor comercial si aplica.
13. Estado de documentacion.
14. Riesgos abiertos.

## Relacion con documento maestro

Este addendum debe considerarse extension del documento maestro de continuidad.

En futuras conversaciones, al leer el documento maestro y los documentos recientes del repo, este gate debe estar incluido en los documentos vivos a revisar para no perder la regla de Academia.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin Firestore writes.
- Sin deploy.
- Sin produccion.
- Sin Gemini real.
- Sin import real.
