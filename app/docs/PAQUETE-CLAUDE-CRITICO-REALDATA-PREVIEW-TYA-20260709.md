# Paquete Claude critico - Real-data preview TyA Phase A

Fecha: 2026-07-09  
Bloque: paquete Claude corto y priorizado  
Estado: listo para usar cuando Claude tenga capacidad.

## 1. Objetivo

Consolidar solo lo critico para Claude/prototipo derivado de los ultimos bloques backend de real-data preview TyA.

Este paquete no pide redisenar ni reescribir el prototipo. Prioriza copy honesto, visibilidad de estados y administrabilidad minima para que el frontend no prometa produccion real cuando solo existe preflight/preview.

## 2. Contexto que Claude debe respetar

- Frontend aprobado: no reescribir arquitectura.
- `CX.data` debe conservar interfaz.
- Cinépolis es proyecto normal configurable, no logica global hardcodeada.
- Level 0, Level 1 y Level 2 son preview/source-safe, no import real.
- No hay produccion, deploy, import real, Firestore writes, HR writes, Make, Gemini ni pagos reales.
- No se debe mostrar ni pedir PII: DPI, banco, telefono, email, nombre shopper crudo, HR URL/fileId.

## 3. Tareas criticas para Claude

### Tarea 1 - Estados honestos de fuente/datos

Agregar o ajustar copy/estado visual para distinguir claramente:

- demo;
- Level 0 manifest-only;
- Level 1 visitas sanitizadas;
- Level 2 preview operacional;
- staging/importado;
- produccion.

Regla: si solo hay preflight o preview, no usar textos como `importado`, `sincronizado`, `produccion`, `pagado`, `enviado`, `Gemini activo` o `HR sincronizada`.

### Tarea 2 - Fuente HR configurable por proyecto

En administracion de proyecto, preparar UI/placeholder para Fuente de Hoja de Ruta:

- tipo de fuente: Google Sheets privado / Excel / carga manual;
- estado: no conectado / manifest-only / preview sanitizado / staging / importado;
- boton o accion futura: probar conexion;
- vista segura de tabs detectados sin mostrar URL/fileId;
- alerta si dashboard intenta crear visitas.

No conectar realmente providers desde UI.

### Tarea 3 - Cinépolis como proyecto normal configurable

Evitar cualquier hardcode global. Cinépolis debe aparecer como proyecto TyA con configuracion de:

- paises GT/HN;
- monedas GTQ/HNL;
- HR source;
- cuestionario configurable;
- reglas de quincena/franja;
- certificacion;
- pagos/liquidaciones.

Si hay copy o UI que lo trate como caso unico, moverlo a configuracion/estado visual.

### Tarea 4 - Certificaciones preservadas y shoppers opacos

En UI, cuando el backend indique Level 2:

- shoppers pueden mostrarse como perfiles opacos/sanitizados si no hay mapeo seguro;
- `review_required` debe verse claro;
- certificaciones ya presentadas deben mostrarse como preservadas o pendientes de mapeo;
- no pedir retomar certificacion a un shopper certificado/preservado sin regla explicita.

No mostrar DPI, email, telefono, banco ni nombre crudo si no esta autorizado.

### Tarea 5 - Liquidaciones/pagos como control, no pago final

Ajustar copy visual para liquidaciones:

- `payment_control_preview` = control de pago / candidato;
- `submitted_liquidation_candidate` = candidato por submitido;
- `requiresFinanceCrosscheck` = requiere cruce financiero;
- `pagado` solo con auditoria/evidencia/fuente financiera validada.

Junio debe verse como pagos/liquidaciones pendientes o en control, no como visitas pendientes si ya fueron ejecutadas.

## 4. Academia/manuales

Academia debe explicar de forma operable:

- que es Level 0/1/2;
- que significa `review_required`;
- diferencia entre preview, staging, importado y produccion;
- como configurar fuente HR sin exponer URL/fileId;
- por que no se muestran PII;
- como se preservan certificaciones;
- como se interpretan liquidaciones/pagos en control.

## 5. No hacer Claude

Claude no debe:

- conectar Firestore/Auth/Storage/Make/Gemini;
- activar import real;
- tocar reglas de seguridad;
- hardcodear Cinépolis;
- reescribir `CX.data`;
- parchar datos en modulos UI;
- mostrar PII;
- prometer que preview es produccion.

## 6. Archivos/modulos probablemente impactados

Solo si Claude debe tocar UI, revisar con cuidado:

- `app/modules/proyectos.js`
- `app/modules/diagnostico.js`
- `app/modules/administrabilidad.js`
- `app/modules/dashboard.js`
- `app/modules/shoppers.js`
- `app/modules/certificaciones.js` o modulo equivalente si existe
- `app/modules/finanzas.js`
- `app/modules/academia.js`

Cualquier cambio debe ser pequeno, auditable y sin tocar backend providers.

## 7. Criterios de aceptacion

- El usuario entiende si esta viendo demo, Level 0, Level 1, Level 2, staging o produccion.
- No hay copy de acciones reales si solo hay preview.
- Cinépolis sigue configurable.
- No aparece PII.
- Certificaciones preservadas no se repiten sin regla.
- Pagos no aparecen pagados sin evidencia.
- Academia explica el flujo.

## 8. Clasificacion

- Reusable CXOrbia: si. Niveles de preview, fuente configurable y copy honesto sirven para futuros tenants.
- Exclusivo cliente: parcial. TyA/Cinépolis, GT/HN, junio y HR actual son contexto cliente.
- Claude/prototipo: si. Este paquete es para frontend/UX copy/estados.
- Academia: si. Requiere manuales y entrenamiento operativo.
- Sin impacto Claude: no.

## 9. Relacion con backend

Este paquete se deriva de:

- preflight local real-data preview;
- Level 0 manifest-only;
- Level 1 visitas sanitizadas;
- Level 2 operacional sanitizado;
- GO/NO-GO runtime DEV preview.

No autoriza runtime switch ni produccion.
