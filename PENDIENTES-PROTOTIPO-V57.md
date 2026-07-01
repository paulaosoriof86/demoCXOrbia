# PENDIENTES-PROTOTIPO-V57.md

Pendientes para Claude/prototipo después de revisar V57. No incluir aquí fallas de integración backend/local.

## Resuelto o mejorado en V57 según documentación del prototipo

- IA multi-proveedor: Gemini, OpenAI, Anthropic y endpoint propio.
- `CX.ai.ask` existe y puede llamar proveedor real si hay key configurada.
- PWA auto-install y favicon basado en logo de consultora.
- Roles nuevos `coordinador` y `aliado` con `scopeCountry`.
- Login white-label con logo cliente, países y “Desarrollado por CXOrbia”.
- Mis Visitas y Mis Beneficios filtran por shopper autenticado usando `shopperId`.
- CxC/CxP clickeables con detalle, edición y cambio de estado.
- Importador renombrado a “Migración de cliente” genérico.
- Documentos/Recursos con lector real, visor pantalla completa y embebido.
- Usuarios: edición y correo con cualquier dominio.
- Academia/manuales más profunda, con manuales visibles in-app.
- Reportes CSV real.
- Importador Excel con SheetJS.
- Recursos + Academia permiten embebido inline.
- Pago de lote genera movimiento por shopper.
- Cuestionario interno sincroniza estado de visita.

## P0 — Pendientes críticos que siguen para Claude

1. Acciones operativas persistibles: botones que solo hacen toast deben ejecutar acción real o decir pendiente backend honestamente.
2. Postulaciones: solicitar ajuste, gestión de visitas aprobadas, reasignar con buscador, sincronía shopper sin duplicación y notificaciones bidireccionales.
3. Reservas/asignación: detectar visitas disponibles sin shopper en HR, cargar escenarios por periodo y cruzar reserva con postulación.
4. Academia profunda: cursos con lecciones extensas, quiz por lección, crear/editar/eliminar categorías y lecciones, manuales por rol/proyecto.
5. Finanzas profunda: movimiento por shopper, proyecto y país; impuestos por país; remesas a CxC; financiamientos con concepto; importador de movimientos; históricos reales al cambiar de mes.
6. Clientes vs Cuentas CRM: unificar/vincular la misma ficha y sincronizar con proyectos/propuestas.
7. IA real no hardcodeada: revisar que análisis, set-up, hoja de ruta, documentos e importador usen `CX.ai.ask` y no simulaciones fijas.

## P1 — Pendientes importantes para Claude

1. Botón “Asignar responsable” en gestión interna: notifica y aparece en Mi Día hasta gestionar.
2. Reportes: crear con IA, elegir columnas, editar y descargar.
3. Certificación: crear con IA desde instructivo, banco de preguntas real, recertificación con notificación.
4. Soporte: bandeja con datos vivos y cambio de estado que notifica al solicitante.
5. Set-up inteligente: preguntar qué ítems generar y permitir edición profunda.
6. Configuración: cada opción debe tener crear con IA/importar/editar/eliminar y listas desplegables administrables.
7. Marketing: generación mensual por IA con temáticas, embudo, objetivo, CTA, hashtags y herramienta.
8. Automatizaciones e integraciones: autoadministrables, plantillas ricas, activar/configurar real.
9. Dashboard operativo: KPIs contra HR mapeada, comparativo sin hardcode, avance real vs ideal por país.

## TyA específico que debe seguir observado

- HR por proyecto con write-back sin duplicar.
- Importador financiero de hojas TyA/TyA HN/Liquidación.
- Honorarios por país desde configuración, no hardcodeados.
- Boleto + combo como reembolsos operativos en flujo T&A → Paula → shopper.

## Hallazgo de calidad/UTF-8 para Claude

- `app/modules/aprendizaje.js` contiene un posible carácter roto en fallback de icono. Revisar si el archivo sigue vigente o eliminar/corregir desde Claude. No corregir desde backend si no corresponde a integración.
