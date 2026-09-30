# Estado de uso de fuentes reales TyA hacia CXOrbia

Fecha: 2026-07-03
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Respuesta ejecutiva

La base real y las logicas utiles de la plataforma anterior SI fueron analizadas, mapeadas y convertidas en plan/preview/contrato seguro. Todavia NO fueron importadas a Firestore ni convertidas en datos operativos definitivos.

La razon no es falta de avance, sino seguridad: los documentos actuales identifican bloqueantes que impiden escribir datos reales sin riesgo de contaminar CXOrbia o romper la escalabilidad.

## Que si se utilizo

### HR / Hoja de Ruta

Se utilizo como fuente principal para:

- visitas,
- fechas,
- submitidos,
- disponibilidad,
- estados operativos,
- base candidata de liquidaciones,
- periodos,
- pais,
- sucursales,
- reglas de quincena y franja.

La HR manda para visitas, fechas, submitidos y base de liquidaciones.

### RTDB / plataforma anterior

Se utilizo como complemento para:

- shoppers,
- postulaciones,
- marcas/candidatos de cuestionario,
- notificaciones,
- trazabilidad operativa.

No se migro codigo viejo, UI vieja, reglas Firebase viejas, secretos ni raw RTDB completo.

### Logicas TyA / Cinepolis

Se documentaron y se estan preservando como reglas de negocio, especialmente:

- HR como fuente de verdad operativa,
- submitido hecho por TyA,
- liquidaciones como candidatas hasta cruce financiero,
- deduplicacion por llave natural,
- no fusionar shoppers automaticamente,
- notificaciones no activas hasta resolver destinatarios,
- exclusion o revision de registros conflictivos.

## Que NO se ha hecho todavia

- No se importo base real a Firestore.
- No se ejecuto escritura DEV.
- No se activo adapter real global.
- No se hizo deploy.
- No se paso a produccion.
- No se migraron datos bancarios/DPI sin politica definida.
- No se convirtieron liquidaciones candidatas en deuda final.
- No se activaron notificaciones reales.

## Por que no se ha importado aun

Bloqueantes actuales:

1. PII shoppers / DPI: definir exclusion, cifrado o coleccion privada.
2. `questionnaire_marks` duplicado: excluir o deduplicar contra postulaciones.
3. Encoding RTDB V7.1: corregir mojibake o excluir textos afectados.
4. Notificaciones sin destinatario resuelto: mantener como historial hasta mapear recipients.
5. Fila adicional `JUNIO_26_HN`: confirmar descarte o correccion.
6. Liquidaciones sin cruce financiero externo: no crear deuda final sin validacion.
7. Reglas Firestore/Auth/Storage reales: validar antes de escritura.
8. Runner de escritura DEV: debe crearse separado y auditarse antes de ejecutar.
9. Rollback DEV: debe probarse antes de escribir.
10. Autorizacion explicita de Paula: obligatoria para cualquier escritura DEV.

## Estado correcto del trabajo

Estamos en fase de:

1. Base visual V75 empalmada.
2. Documentacion y contratos actualizados.
3. Staging/preview y mapeo de datos reales preparados.
4. Gates bloqueantes identificados.
5. Backend seguro/DEV pendiente de escritura autorizada.

## Proxima ruta acelerada sin sacrificar estabilidad

### Bloque A - cerrar fuente real y staging canonico

- Consolidar staging canónico desde HR + RTDB limpio.
- Separar datos importables, historicos, descartados y revision requerida.
- Mantener todo con `tenantId=tya`, `programId=cinepolis`, `projectId`, `periodId`, `country`.

### Bloque B - resolver bloqueantes sin escritura

- Politica PII/DPI.
- Deduplicacion shoppers.
- Exclusion `questionnaire_marks` duplicado.
- Tratamiento encoding RTDB.
- Tratamiento notificaciones como historial.
- Confirmacion fila extra HN.
- Liquidaciones solo candidatas.

### Bloque C - runner DEV auditado

- Crear runner de escritura DEV separado.
- Modo default: dry-run.
- Modo write bloqueado por frase de autorizacion.
- Generar `importBatchId` y rollback plan.

### Bloque D - importacion piloto DEV autorizada

Solo cuando Paula autorice explicitamente:

- cargar piloto pequeno,
- validar pantallas operativas/shoppers,
- revisar seguridad multi-tenant,
- confirmar rollback,
- ampliar por lotes.

## Estado seguro

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- Produccion: 0.
- canImport: false.
- executeAllowed: false.
