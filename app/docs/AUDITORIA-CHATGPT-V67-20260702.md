# AUDITORIA CHATGPT V67 - 2026-07-02

Archivo auditado: Prototype development request CXOrbia V67.zip
Base comparada: V66 aplicada y paquete V66 previo.

## Resultado ejecutivo

V67 es tecnicamente segura para aplicar de forma controlada, pero no debe aplicarse como overlay completo con documentacion incluida. El ZIP contiene 92 archivos, igual que V66, y frente a V66 solo cambia 4 archivos de codigo. No incluye backend protegido, reglas Firebase, Hosting, seeds ni credenciales.

El avance real de V67 es pequeno y parcial frente a la auditoria V66. No resuelve todavia el backlog profundo reportado por Paula ni la adenda de propuestas/CRM. Si se autoriza, debe aplicarse solo como overlay parcial de los 4 archivos cambiados, preservando la documentacion viva del repo.

## Validacion tecnica

- Archivos en ZIP/app: 92.
- JS revisados con node --check: 59 OK.
- UTF-8: OK.
- BOM: no detectado.
- Backend protegido incluido: NO.
- app/index-backend-dev.html: NO incluido.
- app/core/backend-*.js: NO incluidos.
- firestore.rules, firebase.json, .firebaserc: NO incluidos.
- index.html no carga backend protegido.
- modules/rutas.js y modules/aprendizaje.js no se cargan desde index.html.

## Archivos cambiados frente a V66

- app/core/router.js: agrega indicador de fuente de datos en sidebar y re-render por evento project.
- app/modules/finanzas.js: agrega campos pagador/fuente o beneficiario y proyecto destino al modal de registro de movimiento.
- app/modules/postulaciones.js: cambia reasignacion a buscador/filtros de shoppers y registra log/emit al reasignar.
- app/modules/shoppers.js: agrega bloque explicativo del criterio de puntuacion en ficha shopper.

## Evaluacion contra los pendientes que Claude reporto

### V66-12 Finanzas
Estado: PARCIAL. Agrega pagador/beneficiario y proyecto destino al registro de movimiento, pero no completa tableros CxC/CxP con buscador, vencimientos de presupuesto, egreso por beneficiario al pagar lote ni sincronizacion completa de liquidaciones. Los nuevos campos no se muestran todavia en la tabla principal de movimientos.

### V66-1 Roles y alcance
Estado: ABIERTO. No se modifico configuracion, permisos ni administracion de alcance por representante, aliado, proyecto, pais, modulo, plan o add-on.

### V66-3/V66-4 Dashboard accionable y ficha visita
Estado: ABIERTO/PARCIAL HEREDADO. No hubo cambios en dashboard ni visitas. Siguen pendientes acciones por registro, WA/correo mock honesto, autorizacion fuera de rango con responsable/motivo, ficha de visita trazable y validacion de lupa/acciones.

### V66-7 Report builder
Estado: ABIERTO. No hubo cambios en reportes.

### V66-8 Ficha cliente 360
Estado: ABIERTO. No hubo cambios en cliente, cliente-extra ni cliente-insights.

### V66-13/V66-14 Propuestas, CRM prospecto y pipeline
Estado: ABIERTO. No hubo cambios en comercial.js ni crm.js. La adenda de propuestas comerciales sigue viva.

### V66-9 Wizard proyecto
Estado: ABIERTO. No hubo cambios en proyecto/proyecto-wizard.

### V66-10 HR/importador
Estado: ABIERTO. No hubo cambios en importador, HR ni hojas de ruta.

### V66-11 Academia
Estado: ABIERTO. No hubo cambios en academia, cursos, quizzes, certificaciones ni recursos.

### V66-15 Marketing
Estado: ABIERTO. No hubo cambios en marketing.

### V66-16 Configuracion
Estado: ABIERTO. No hubo cambios en configuracion.

### V66-17 Novedades/sincronia
Estado: ABIERTO. No hubo cambios en novedades, campanita, Mi Dia o sincronias de solicitudes.

## Mejoras reales de V67

1. Indicador de fuente de datos: demo/localStorage/importado/backend DEV.
2. Re-render del modulo activo cuando cambia project.
3. Buscador de shoppers al reasignar postulación.
4. Campos pagador/beneficiario y proyecto destino en movimientos.
5. Bloque explicativo de scoring shopper.

## Riesgos y observaciones

1. El indicador backend usa window.CX_BACKEND_DEV, pero esa variable no aparece definida en el ZIP; puede no detectar backend real.
2. El scoring shopper es explicativo; no hay motor de calculo, auditoria ni persistencia.
3. La reasignacion mejora busqueda, pero no valida disponibilidad, certificacion vigente, conflictos, pais/proyecto ni HR write-back completo.
4. Los campos financieros nuevos se guardan, pero la tabla principal no los muestra.
5. Acciones WA/correo heredadas siguen usando textos de enviado/Make o wa.me; deben pasar a mock honesto o pendiente backend.
6. Los documentos del ZIP no contienen la documentacion viva generada por ChatGPT despues de V66. No deben sobreescribirse docs actuales del repo.

## Recomendacion

Aplicar V67 solo como overlay parcial de codigo:

- app/core/router.js
- app/modules/finanzas.js
- app/modules/postulaciones.js
- app/modules/shoppers.js

No aplicar documentacion del ZIP y no tocar backend protegido.

## Pendientes que siguen vivos para Claude

Todos los puntos del anexo de cobertura V66 y de la adenda de propuestas continuan vivos, salvo los avances parciales indicados. No deben eliminarse del plan de trabajo hasta que se verifique funcionamiento completo en UI.