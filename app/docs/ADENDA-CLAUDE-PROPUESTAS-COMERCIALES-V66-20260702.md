# ADENDA PARA CLAUDE — PROPUESTAS COMERCIALES Y PLANTILLAS

Fecha: 2026-07-02
Base: CXOrbia V66 + paquete principal + anexo punto a punto.

## Propósito

Esta adenda complementa el paquete ya enviado a Claude. El módulo Comercial, CRM, Costos y Propuestas debe profundizarse para que sea útil en un prototipo SaaS comercializable y no quede como una ficha superficial.

## Principio

La propuesta T&A/Spectrum sirve como referencia estructural. No debe copiarse como contenido fijo ni convertir el producto en algo exclusivo de TyA. CXOrbia debe permitir plantillas por tenant, consultora, cliente, país, moneda y marca.

## Requerimientos para el prototipo

1. Administrador de plantillas comerciales.
2. Cargar plantilla propia de la consultora.
3. Plantilla por defecto CXOrbia si no hay plantilla del tenant.
4. Identificar secciones fijas y variables.
5. Mapear datos: cliente, contacto, país, industria, alcance, rondas, visitas, moneda, costos, vigencia y condiciones.
6. Crear propuesta desde CRM, pipeline o ficha 360 del cliente.
7. Usar documentos y levantamiento cargados en la ficha del cliente.
8. Conectar visualmente propuesta con costos, presupuesto, finanzas, proyectos, documentos, reuniones y seguimiento.
9. Crear vista previa editable por secciones.
10. Permitir regenerar o editar cada sección.
11. Versionar propuestas.
12. Guardar borrador, enviada, en negociación, ganada, perdida o vencida.
13. Registrar responsable comercial y próximos seguimientos.
14. Convertir propuesta ganada en proyecto/programa con cliente, países, periodos, visitas base, presupuesto, reportes y portal cliente.
15. Mantener todo en mock/local con badges de pendiente backend cuando aplique.

## Estructura mínima de propuesta

- Portada con marca.
- Nuestro entendimiento.
- Contexto del cliente e industria.
- Objetivo del programa.
- Alcance, cobertura, rondas y visitas.
- Escenarios y metodología.
- Perfil de evaluadores.
- Cuestionario, instructivo y evidencias.
- Control de calidad.
- Reportes, plataforma y seguimiento.
- Propuesta económica.
- Condiciones comerciales.
- Confidencialidad.
- Próximos pasos.

## Propuesta económica

Debe incluir setup fee, costos unitarios, cantidad de visitas, cantidad de rondas, moneda, impuestos, reembolsos, descuentos, margen estimado, total mensual, total del periodo, vigencia, plazo de pago, condiciones por visitas fallidas y notas comerciales.

## Historial y analítica

El módulo debe mostrar tablero de propuestas: total, borradores, enviadas, negociación, ganadas, perdidas, monto proyectado, monto ganado, tasa de conversión, tiempo promedio de cierre, próximas tareas, propuestas vencidas y análisis por responsable, industria y etapa.

## Sincronización con backend

Claude debe preparar la UI sin tocar backend protegido. Debe indicar claramente qué queda como mock y qué requiere backend: plantillas, documentos en Storage, historial, versiones, envío por canales, reuniones, conversión a proyecto, costos, auditoría y permisos.

## Criterio de aceptación

No basta con un formulario simple. Debe poder probarse visualmente el flujo completo: crear propuesta desde CRM, seleccionar plantilla, completar datos, editar secciones, revisar propuesta económica, guardar versión, cambiar estado, registrar seguimiento y convertir en proyecto cuando sea ganada.