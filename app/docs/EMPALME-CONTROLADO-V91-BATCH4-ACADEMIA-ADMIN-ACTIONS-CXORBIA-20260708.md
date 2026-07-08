# Empalme controlado V91 - Batch 4 Academia admin actions CXOrbia

Fecha: 2026-07-08  
Fuente: auditoria forense V91 + baseline incremental V91  
Estado: parche visible incremental, no produccion.

## 1. Objetivo

Resolver el blocker visible de Academia detectado en la auditoria V91: la pantalla no mostraba acciones administrativas claras para cursos.

Este batch trabaja sobre V91 como baseline incremental. No retrocede de version y no reemplaza `academia.js` completo; agrega un patch controlado y auditable.

## 2. Archivos creados

- `app/modules/academia-admin-actions.js`
- `app/docs/EMPALME-CONTROLADO-V91-BATCH4-ACADEMIA-ADMIN-ACTIONS-CXORBIA-20260708.md`
- `app/docs/CAMBIOS-EMPALME-CONTROLADO-V91-BATCH4-ACADEMIA-ADMIN-ACTIONS-20260708.md`

## 3. Archivos actualizados

- `app/index.html`

## 4. Que se agrego a Academia

El patch agrega acciones visibles en tarjetas de cursos para administrador:

- Editar;
- Duplicar;
- Versionar;
- Cambiar estado;
- Archivar;
- Ver auditoria local;
- Ver/restaurar archivados.

Cada accion critica exige motivo obligatorio y registra trazabilidad local con `auditRef`.

## 5. Estados cubiertos

- Borrador;
- En revision;
- Publicado preview;
- Archivado.

## 6. Politica de seguridad / honestidad

- No hay backend real.
- No hay publicacion real.
- No hay Storage real.
- No hay Gemini real obligatorio.
- No hay borrado irreversible.
- No se toca certificacion historica.
- No se toca progreso historico de cursos completados.
- Los cursos base no se sobreescriben: si se editan, se crea una version editable.

## 7. Por que se uso patch y no reemplazo completo de Academia

La candidata V91 trae Academia grande y aun requiere profundizacion. Reemplazar `academia.js` completo sin smoke podria crear regresiones grandes.

Este patch:

- resuelve el blocker visible de acciones administrativas;
- evita reescribir el modulo completo;
- se carga despues de `academia.js`;
- envuelve `CX.modules.aprendizaje`;
- inyecta acciones tras cada render;
- conserva el contenido actual de Academia;
- mantiene el empalme incremental y auditable.

## 8. Pendientes que siguen vivos

Este batch mejora administrabilidad visible, pero no cierra todo Academia.

Pendientes:

1. Smoke visual completo de Academia.
2. Verificar que `Crear con IA` original quede funcional o reemplazarlo por handler estable.
3. Profundizacion de Academia pendiente por Claude: rutas por rol, manuales, cursos, checklists y contenido reusable completo.
4. Convertir este patch en implementacion nativa dentro de `academia.js` cuando haya capacidad, si mejora estabilidad.
5. Revisar manuales/checklists/glosario para acciones equivalentes fuera de tarjetas de curso.

## 9. Impacto Phase A

El admin ya puede ver acciones claras para gestionar cursos sin esperar a Claude:

- crear/versionar contenidos operativos;
- archivar cursos viejos;
- duplicar cursos para otro rol/proyecto;
- cambiar estado con motivo;
- auditar cambios.

Esto ayuda a Phase A porque Academia deja de verse como solo consumo y empieza a ser operable desde plataforma.

## 10. Clasificacion obligatoria

- Reusable CXOrbia: si. Patron reusable para administracion de Academia por tenant/proyecto/rol.
- Exclusivo cliente: no. No contiene datos TyA reales ni logica unica de cliente.
- Claude/prototipo: si. Es patch visual/prototipo que Claude debe incorporar nativamente si vuelve a tener capacidad.
- Academia: si. Corrige administrabilidad visible, pero la profundizacion de contenido sigue pendiente.
- Sin impacto Claude: no. Debe quedar en paquete Claude como mejora local y pendiente de consolidacion.

## 11. Estado seguro

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
