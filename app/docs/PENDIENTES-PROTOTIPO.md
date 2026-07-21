# PENDIENTES-PROTOTIPO.md

> Lista viva de mejoras del prototipo CXOrbia. Actualizada 2026-07-20.
> P0 crítico · P1 importante · P2 posterior · [TyA] específico · [CX] reusable.

## 🔴 P0/P1 ACTUAL — CORTE 1 CON HR VIVA CONFIRMADA

### Resuelto por backend/adapters

- [Backend] La lectura HR viva quedó confirmada: fecha de cuestionario actualizó KPI y asignación HR retiró una visita disponible del shopper.
- [Backend] La revisión excluye timestamps volátiles y no debe provocar recargas falsas.
- [Backend] La carga inicial usa bootstrap/cache y la comprobación fresca ocurre de forma controlada.
- [Backend] La proyección live de reportes está integrada en DEV.
- [Gobierno] No pedir nueva candidata ni reabrir empalme, histórico, estados, shoppers o Finanzas.

### Validación visual inmediata

- [CX] Confirmar que la página no se recargue cuando la HR no cambió.
- [CX] Confirmar una sola actualización al existir un cambio real.
- [CX] Confirmar cuatro reportes operativos disponibles con PDF, Excel y PPT habilitados.
- [CX] Confirmar KPI, modal, histórico y reportes sobre la misma revisión y facets.
- [TyA] Confirmar que `Sin submitir` no muestre filas como `Pend. cuestionario` cuando ya existe cuestionario.

### Frontend focalizado — Panorama

- [Claude/CX] `app/core/cliente-data.js`: invalidar cache por periodo y revisión live.
- [Claude/CX] `app/modules/cliente.js`: separar resultados operativos de score, NPS y secciones pendientes.
- [Claude/CX] `app/modules/cliente-insights.js`: revisar comparativos cuando corresponda.
- [Claude/CX] Al cambiar MAY/JUN/JUL, mostrar realizadas, cuestionarios, submitidas, cobertura y tendencia del periodo seleccionado.
- [Claude/CX] Sin score validado, usar `Pendiente de fuente` sin ceros que parezcan resultados.
- [Claude/CX] Cuando dos periodos compartan el mismo universo, explicar qué cambió y qué no tiene fuente.

### Frontend focalizado — Reportes y diseño

- [Claude/CX] `app/modules/cliente-extra.js`: exportaciones y presentación del portal cliente.
- [Claude/CX] `app/modules/operacion-extra.js`: `Reportes & KPIs` administrativo y personalización visible.
- [Claude/CX] Portal cliente: exportaciones deben usar periodo, país, sucursal, rol y revisión live activos.
- [Claude/CX] Administración: edición real de columnas, orden, notas y alcance.
- [Claude/CX] Imprimir/exportar el artefacto del reporte, no la página completa.
- [Claude/CX] Aplicar logo, colores y tipografía configurados por tenant, con fallback CXOrbia.
- [Claude/CX] Incorporar gráficas de avance, cobertura, tendencia y distribución cuando correspondan.
- [Claude/CX] Aplicar el estándar a admin, cliente, shopper y demás roles según permisos.
- [Claude/CX] No fijar el diseño ni la lógica a TyA/Cinépolis.

### Estados honestos

- [CX] Planes de acción continúa pendiente hasta su fuente real.
- [CX] Brechas y capacitación continúa pendiente hasta resultados por sección.
- [CX] Scorecard de marca continúa pendiente hasta scores validados.
- [CX] No inferir score, NPS, planes ni brechas desde conteos operativos.
- [CX] No fijar conteos operativos en código o gates.

### Academia y gobierno

- [Academia] Actualizar después de la validación visual: lectura viva, revisión estable, periodos, fuente ausente y exportación por rol.
- [Academia] Explicar la diferencia entre HR operativa y resultados del cuestionario.
- [Backend] Retirar el workflow temporal de `main` después del cierre DEV y antes del freeze.
- [Gobierno] Corte 1 solo se congela con `APROBADO` de Paula.

## 🔴 P0 HISTÓRICO PROTEGIDO

- [CX] Mantener migración tenant-safe, acceso técnico protegido y contenido comercial sin jerga interna.
- [Claude] No cambiar identificadores o contratos internos sin evidencia nueva.
- [Academia] Mantener contenido técnico solo para audiencia interna protegida.

## ✅ RESUELTOS Y PRESERVADOS

- White-label, temas, roles y permisos.
- Operación, postulaciones, reservas, shoppers y visitas disponibles.
- Finanzas reconciliadas e importador Excel.
- CRM, clientes, propuestas y marketing.
- Academia, manuales, certificaciones, recursos y soporte.
- Configuración, usuarios, setup y gobierno.

## 🟡 PENDIENTES POSTERIORES

- Gestión completa de periodos e histórico comparativo.
- Importador HR con detección de proyecto, periodo y duplicados.
- Centro de actualizaciones SaaS.
- Sincronía global de proyecto, periodo y país.
- Fichas ampliadas de periodo, visita y sucursal.
- Persistencia, autenticación, evidencias e integraciones cuando llegue su bloque autorizado.

## Siguiente bloque exacto

`REVALIDAR DEV ESTABILIDAD Y REPORTES → CORRECCIONES FRONTEND FOCALIZADAS → RETIRAR WORKFLOW TEMPORAL → FREEZE CORTE 1`

## Estado seguro

Sin merge ni producción. Importaciones reales, automatizaciones externas y pagos permanecen en espera.
