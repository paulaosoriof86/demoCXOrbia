# CXOrbia - Paquete para Claude V58

Fecha: 2026-07-01

Claude debe trabajar sobre el prototipo CXOrbia V58 y conservar sus avances: PWA, login white-label, manuales, Academia, recursos del proyecto, CRM 360, propuestas vinculadas, CxC/CxP, pago por shopper, IA multi-proveedor y roles coordinador/aliado.

## Limite de responsabilidad

Claude corrige frontend/prototipo. El backend V57 se mantiene separado en la rama release/cxorbia-tya-rc-20260630 y no debe revertirse.

## Correcciones P0

1. README.md debe indicar preview local con Node, no Python.
2. Corregir caracter corrupto en modules/aprendizaje.js linea 100.
3. Importador debe ser generico CXOrbia; TyA debe quedar como plantilla/import especifico.
4. Importador/IA debe usar CX.ai.ask cuando haya configuracion y fallback honesto cuando no exista.
5. En tenant TyA no debe aparecer proyecto ni demo banca.
6. Con backend Firestore conectado, la UI no debe mostrar localStorage/demo.
7. Datos reales TyA no deben entrar como semillas demo.

## Pendientes funcionales vigentes

- HR dinamico por proyecto, pais, periodo y quincena.
- Importador financiero TyA GT/HN y liquidaciones.
- Honorarios y reembolsos por pais configurables.
- Postulaciones completas con aprobar, rechazar, stand-by, ajuste, reprogramar y reasignar.
- Dashboard operativo con KPIs reales y drill.
- Finanzas con monedas separadas e historico mensual.
- Certificaciones con banco real y recertificacion.
- Ranking shoppers con criterios visibles.
- Mis beneficios con detalle.
- Manuales/cursos editables con recursos.
- Soporte con bandeja viva.

## Estado backend que debe respetarse

El ultimo smoke backend valido reglas, Auth y parte de tenant isolation. Aun falta resolver tenants/tya/projects, servidor Node estable, HTTP 200 y module render smoke. No se carga base TyA completa hasta cerrar gate.

## Entrega esperada

Proxima version del prototipo corregida, con bitacora, pendientes actualizados, lista de archivos tocados y confirmacion de que no revirtio backend V57.
