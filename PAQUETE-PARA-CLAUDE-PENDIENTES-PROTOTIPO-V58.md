# CXOrbia - Paquete para Claude V58

Fecha: 2026-07-01
Base vigente: `Prototype development request CXOrbia V58.zip`
Archivo principal de pendientes: `PENDIENTES-PROTOTIPO-V58.md`

## Objetivo

Este paquete resume únicamente lo que Claude debe corregir o mejorar en el frontend/prototipo. No incluye tareas de backend.

Claude debe trabajar sobre V58 o sobre el prototipo más reciente entregado por Paula, conservando todos los avances visuales y funcionales ya aprobados.

## Límite de responsabilidad

Claude corrige frontend/prototipo. No debe tocar ni revertir:

- Reglas Firestore.
- Scripts Firebase.
- Loaders, seeds, validators o herramientas de carga.
- Helpers locales ignorados.
- Archivos de output local ignorados.
- `app/index-backend-dev.html`.
- Configuración técnica de backend.

Si una mejora requiere backend real, debe dejarlo documentado como dependencia y no simular datos reales.

## P0 para la próxima versión de Claude

1. Limpiar TyA/Cinépolis de demos ajenos.
   - No mostrar Banca, Restaurantes ni Cliente Banca dentro de TyA.
   - No mezclar tema visual de banca con TyA.
   - Demos solo como sandbox o plantilla separada.

2. Quitar avisos técnicos visibles.
   - No mostrar etiquetas como demo, Firebase, backend, beta, núcleo, diagnóstico, localStorage o similares en UI final.

3. Corregir UTF-8 real.
   - Sin símbolos corruptos.
   - Revisar `app/modules/aprendizaje.js` y cualquier archivo con caracteres rotos.
   - Mantener UTF-8 sin BOM.

4. Corregir README/preview local.
   - No recomendar Python.
   - Usar preview con Node o método aprobado.

5. Consolidar NDA/confidencialidad por rol y versión.
   - No volver a textarea único.
   - Editor por rol, versión, historial, vista previa, aceptación/reaceptación y exportable.

6. Hacer Configuración autoadministrable.
   - Proyectos, países, monedas, honorarios, reembolsos, franjas, quincenas, sucursales, escenarios, roles, plantillas, NDA y estados.

7. Periodo dinámico.
   - No julio fijo.
   - Selector de periodo que actualice HR, dashboard, postulaciones, visitas, beneficios, certificaciones y finanzas.

8. HR viva TyA/Cinépolis.
   - País, quincena, franja, `Disponible desde`, Q1/Q2, estados, filtros, visitas clicables y sin duplicados.

9. Dashboard/KPIs correctos.
   - KPIs desde HR mapeada.
   - Drill debajo de KPIs o modal amplio.
   - Certificaciones KPI abre detalle.
   - Ranking top 5 y criterios visibles.
   - No sumar GTQ/HNL ni multiplicar liquidaciones.

10. Postulaciones completas.
    - Vista total, agrupable por sucursal, shopper, estado, país y quincena.
    - Aprobar, rechazar, stand-by, ajuste, reprogramar, reasignar, historial y notificaciones.

11. Flujo shopper estable.
    - Postulación/asignación, instructivo, agendar, reprogramar, confirmar, realizada, cuestionario, revisión/submitido, beneficios.
    - Botones funcionales o mensaje honesto.

12. Perfil shopper funcional.
    - Visitas realizadas, certificaciones, beneficios, historial, puntaje, NDA y documentos.

13. Responsables, Mi Día y notificaciones.
    - Asignar responsable, gestionar, reabrir si sigue pendiente, exportar pendientes, tablón con contador y drill.

14. Filtros reales.
    - Dashboard, HR, postulaciones, visitas, shoppers, certificaciones, finanzas, recursos, academia, CRM y soporte.

15. Importador genérico CXOrbia.
    - TyA debe ser plantilla específica, no lógica fija.
    - Validaciones, registros descartados y fallback honesto si no hay IA configurada.

16. Proyectos autoadministrables.
    - Crear/editar/desactivar proyectos con países, monedas, periodos, sucursales, escenarios, honorarios, cuestionarios, manuales, certificaciones, recursos, responsables y portal cliente.

## Reglas TyA/Cinépolis que el prototipo debe reflejar

- GT y HN separados.
- Quincena 1 y 2 separadas.
- Franja WK/WKND.
- `Disponible desde` dinámico.
- Q1 usa submitido Q2 anterior cuando exista.
- Q2 usa submitido Q1.
- Q2 restringe desde día 16 al fin de mes.
- `P x Agendar` solo con shopper asignado.
- `P x visita previa` en Q1 si no existe Q2 previa.
- Evidencias video/foto según proyecto.
- Combo JUMBO como reembolso cuando aplique.
- Cuestionario menor a 48 horas como control operativo.
- Fuera de rango debe activar reprogramación.

## Errores que no debe reintroducir

- Mezclar TyA con Banca/Restaurantes/demo.
- Mostrar notas técnicas en UI final.
- Romper UTF-8.
- Duplicar títulos o secciones.
- Perder módulos existentes al mejorar otro.
- Mandar el detalle de KPI al final de la página sin contexto.
- Dejar botones sin acción ni explicación honesta.
- Dejar Configuración sin funcionar.
- Filtrar postulaciones solo por pendientes cuando se necesita vista total.
- Cambiar visual aprobado sin necesidad.
- Rehacer arquitectura o convertir a framework.
- Introducir datos reales en demo/prototipo.
- Tocar backend protegido.

## Entrega esperada de Claude

Claude debe devolver:

- Prototipo corregido basado en V58 o versión más reciente.
- Lista de archivos tocados.
- Cambios por módulo.
- Confirmación de que no perdió avances del prototipo.
- Confirmación de que no tocó backend protegido.
- `CAMBIOS-PROTOTIPO.md` actualizado o creado.
- `PENDIENTES-PROTOTIPO.md` actualizado.
- Nota clara de dependencias reales de backend, sin simularlas.

## Referencia completa

Ver `PENDIENTES-PROTOTIPO-V58.md` para el detalle completo y priorizado.
