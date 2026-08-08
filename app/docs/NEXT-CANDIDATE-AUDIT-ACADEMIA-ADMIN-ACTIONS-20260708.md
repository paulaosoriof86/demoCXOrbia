# Proxima candidata Claude - Auditoria obligatoria de Academia y acciones administrativas

Fecha: 2026-07-08  
Origen: hallazgo visual reportado por Paula durante trabajo backend  
Estado: pendiente obligatorio para auditar la proxima candidata Claude.

## 1. Motivo

Paula compartio una captura de Academia donde se observan botones como Manuales, selector de rol, Crear con IA, Cargar recurso y + Categoria, pero no se ve una opcion visible para borrar, archivar, duplicar o versionar cursos.

Este hallazgo no debe quedar solamente como regla general de Academia editable. En la proxima candidata de Claude debe auditarse como punto operativo puntual del modulo.

## 2. Riesgo metodologico detectado

El requisito de Academia editable ya existia en el addendum maestro, pero no habia quedado suficientemente aterrizado como hallazgo visual especifico de la pantalla actual.

Correccion metodologica:

- Toda regla general de addenda que impacte un modulo visible debe convertirse en pendiente operativo para Claude.
- Toda captura que confirme una ausencia funcional debe quedar documentada por modulo, accion esperada y criterio GO/NO GO.
- El paquete Claude debe incluir requisitos por pantalla cuando la ausencia sea visible.
- No basta decir 'Academia editable'; debe indicarse exactamente que acciones faltan y donde.

## 3. Auditoria obligatoria cuando llegue la proxima candidata

Al recibir la proxima candidata Claude, auditar Academia antes de aceptar el ZIP.

Validar:

1. Si existe accion visible para crear curso.
2. Si existe accion visible para editar curso.
3. Si existe accion visible para archivar curso.
4. Si existe accion visible para borrar controlado o soft-delete.
5. Si existe accion visible para duplicar curso.
6. Si existe accion visible para versionar curso.
7. Si existen estados borrador, en revision, publicado y archivado.
8. Si se solicita motivo para acciones criticas.
9. Si se respeta revision humana antes de publicar contenido generado por IA.
10. Si las acciones estan limitadas por rol/permisos.
11. Si se conserva historial de contenidos ya completados o certificaciones asociadas.
12. Si manuales/checklists/glosario tienen acciones equivalentes.
13. Si Academia explica en manuales la diferencia entre borrar, archivar, duplicar y versionar.
14. Si no se promete borrado real/backend real si solo existe UI preview.

## 4. Criterio GO

La candidata puede avanzar si:

- muestra o documenta claramente acciones administrativas de Academia;
- prefiere archivar/soft-delete sobre borrado irreversible;
- exige motivo y confirmacion para acciones criticas;
- conserva cursos completados, certificaciones y trazabilidad;
- no activa backend real ni datos reales;
- actualiza manuales/cursos/checklists de Academia con profundidad operativa.

## 5. Criterio NO GO

La candidata debe devolverse si:

- Academia sigue sin acciones visibles ni documento de pendiente;
- simula borrado real sin backend/gate;
- elimina contenido historico sin confirmacion;
- publica contenido IA sin revision humana;
- rompe cursos existentes;
- trata Academia superficialmente;
- no documenta cambios por archivo/modulo.

## 6. Donde debe quedar reflejado

- `PENDIENTES-PROTOTIPO.md`
- `RESUMEN-PARA-CLAUDE.md`
- paquete Claude acumulado siguiente, si se genera uno nuevo
- reporte de auditoria de la candidata
- checklist GO/NO GO antes de aceptar ZIP

## 7. Estado seguro

Este documento no cambia UI, no activa backend, no modifica Academia y no autoriza deploy ni produccion.
