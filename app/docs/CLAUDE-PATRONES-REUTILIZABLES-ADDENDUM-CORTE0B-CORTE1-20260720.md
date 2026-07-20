# Claude — addendum de fixes y patrones reutilizables Corte 0B/Corte 1

Fecha: 2026-07-20
Estado: `REGISTRO_VIVO_OBLIGATORIO`

Este addendum complementa `CLAUDE-PATRONES-REUTILIZABLES-BACKEND-PRODUCTO-CXORBIA-20260707.md` y consolida los fixes locales que deben reflejarse en el prototipo comercializable.

## Registro acumulado

### 1. Proyecto y periodo separados

- Problema: mezclar proyecto y ronda alteraba KPI, histórico y rutas.
- Solución: proyecto padre y `periodId` estable por ronda.
- Reusable: todo tenant maneja proyecto y periodo como dimensiones distintas.
- UX/multirol: cambiar periodo actualiza KPI, filas, detalle y exportación sin perder scope.
- Academia: explicar Proyecto vs. Periodo.
- Estado: aplicado en V161C/R21.

### 2. Source-safe y PII protegida

- Problema: el DEV podía depender de workbook crudo o datos personales.
- Solución: payload mínimo con `sourceSafe:true`, origen visible y PII excluida.
- Reusable: toda fuente externa pasa por proyección segura antes del frontend.
- UX: mostrar `Pendiente de fuente` y referencias protegidas, nunca rellenar datos.
- Estado: aplicado; datos autorizados quedan para Cortes 4/6.

### 3. Estados canónicos separados

- Problema: un estado único mezclaba asignación, agenda, ejecución, cuestionario, submitido, liquidación y pago.
- Solución: facetas independientes y progresión verificable.
- Reusable: submitido no equivale a liquidado ni pagado.
- UX: todos los roles consumen la misma verdad.
- Academia: flujo completo de estados y errores.
- Estado: aplicado y cubierto por R20/R21.

### 4. Cruce financiero antes del pago

- Problema: una visita submitida podía aparentar pago.
- Solución: `submitido -> cruce/validación -> lote -> pago confirmado -> egreso`.
- Reusable: no inferir pagos; Lotes vacío sin fuente.
- Estado: separación aplicada; cierre Corte 3.

### 5. Elegibilidad antes de disponibilidad

- Problema: visitas bloqueadas podían aparecer disponibles.
- Solución: proyecto activo + periodo + asignación + ventana + perfil + certificación + reglas configurables.
- Reusable: ambigüedad falla cerrado y pasa a revisión.
- Exclusivo TyA: Q1/Q2 y reglas Cinépolis.
- Estado: gate aplicado; ciclo completo Corte 2.

### 6. Niveles de datos shopper

- Problema: el prototipo inventaba contacto, rating o estado cuando solo existía una referencia.
- Solución: `protected_reference`, `operational_profile`, `full_authorized_profile`.
- Reusable: no mostrar `null`, ids internos ni fixtures como datos reales.
- Estado: source-safe aplicado; UI/Auth pendientes Cortes 2/6.

### 7. Histórico separado del periodo activo

- Problema: la consulta histórica incluía el periodo activo por defecto.
- Solución: excluir activo salvo selección explícita y filtrar por país/estado.
- Reusable: operación actual e histórico son vistas distintas.
- Estado: implementado; validación visual Corte 1 pendiente.

### 8. Reportes por contexto único

- Problema: botones de exportación no compartían una fuente real.
- Solución: `window.CX_TYA_CORTE1_REPORTS` con tenant, proyecto, periodo, país y sucursal.
- Archivos: contrato Corte 1, builder y gates fuente/navegador.
- Reusable: todos los formatos usan las mismas filas y el mismo scope.
- Estado: backend PASS; consumidor frontend pendiente.

### 9. Matriz de capacidades de reportes

- Problema: la UI prometía scorecard, benchmark, planes y brechas sin fuente suficiente.
- Solución: catálogo `available` o `pending_source`.
- Disponibles: resumen operativo, estado por sucursal, cobertura por país y tendencia por periodo.
- Pendientes: scorecard validado, planes de acción y brechas/capacitación.
- Reusable: una tarjeta solo se habilita si existe contrato de datos.
- Estado: implementado en contrato/builder/gate; UI pendiente.

### 10. Exportaciones reales

- Problema: PDF/Excel/PPT solo mostraban mensajes demo.
- Solución definida: PDF imprimible, XLSX real con SheetJS y PPTX real con dependencia local revisada.
- Contrato: `phase-a-corte1-report-frontend-consumer-v1.json`.
- Gate: `tya-corte1-report-frontend-consumer-acceptance.mjs`.
- Reusable: un solo dataset para todos los formatos; nombre de archivo con proyecto, periodo, país y reporte.
- Estado: `REPLICABLE_CLAUDE_INMEDIATO`.

### 11. Rol visual no equivale a autorización

- Problema: “Ver como” podía interpretarse como seguridad real.
- Solución: preview hasta Corte 6; bloquear scope regional/sucursal si no hay mapping estable.
- Reusable: UI de rol para prueba, Auth/RBAC para acceso.
- Estado: contrato definido; implementación visual pendiente.

### 12. Recursos contextuales

- Corte 1: catálogo, origen y vínculo tenant/proyecto/periodo.
- Corte 2: entrega por visita, escenario y certificación.
- Corte 6: permisos.
- Corte 7: Storage, versionado, evidencias y sincronización.
- Reusable: recurso contextual, versionado y visible dentro de plataforma.

### 13. Certificaciones preservables

- Estados: draft, revisión, práctica preview, confirmada y publicada.
- Funciones: buscar certificados/no certificados, preservar presentadas, solicitar una certificación concreta, excepción autorizada, re-certificación e intentos.
- Reusable: certificación como entidad por tenant/proyecto, no como badge decorativo.
- Estado: cierre funcional Corte 2; permisos Corte 6; sincronización Corte 7.

### 14. Build y evidencia del mismo hash

- Solución: manifest, build-lock, aggregate, adapters de build y artifacts con digest.
- Reusable: fuente, gate, Hosting DEV y revisión visual corresponden al mismo build.
- Estado: aplicado.

### 15. Sincronización con llaves estables

- Llaves: `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`.
- Reusable: no deduplicar por nombre; conflicto a revisión; idempotencia antes de producción.
- Estado: contratos preparados; activación futura.

## Tarea Claude inmediata

- Archivo: `app/modules/cliente-extra.js`.
- Módulo: `cli_reportes`.
- Contrato: `backend/contracts/phase-a-corte1-report-frontend-consumer-v1.json`.
- Fuente: `window.CX_TYA_CORTE1_REPORTS`.
- Gate: `tools/qa/tya-corte1-report-frontend-consumer-acceptance.mjs`.
- Resultado: PDF/XLSX/PPTX reales, tarjetas pendientes honestas y alcance coherente.

## Clasificación

- Reusable CXOrbia: puntos 1–15, salvo reglas TyA explícitamente marcadas.
- Exclusivo cliente: HR, Q1/Q2, países, montos y reglas Cinépolis.
- Claude/prototipo: consumidor de reportes, copy, estados y responsive.
- Academia: Proyecto/Periodo, estados, fuente, reportes, certificaciones y recursos.
- Sin impacto Claude: gates, manifests, digests y controles internos.

Estado seguro: sin merge, producción, importaciones, escrituras reales, Make/Gemini live ni pagos.
