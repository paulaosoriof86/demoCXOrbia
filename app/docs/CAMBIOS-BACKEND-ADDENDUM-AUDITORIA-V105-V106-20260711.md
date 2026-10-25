# Cambios backend — addendum auditoría V105 / build interno V106

## Qué se hizo

- Auditoría forense de la nueva candidata frontend contra V104 y los pendientes acumulados.
- Validación estructural independiente: 132 archivos, 67 JS/MJS, 0 errores, 49 módulos únicos.
- Ejecución independiente del verificador de manifest: FAIL reproducible.
- Pruebas semánticas de Portal Cliente, liquidación/pago, permisos y cambio de modo.
- Revisión detallada de Finanzas, Beneficios, Certificación, Historial, copy y Academia.
- Traducción de patrones backend R5/R6 a requisitos frontend sin modificar backend.

## Hallazgos que afectan backend futuro

- `paymentSourceRef` solo no puede materializar pago.
- La purga indiscriminada no puede borrar datos legítimos al cambiar modo.
- Beneficios debe exigir identidad shopper antes de leer liquidaciones.
- Los permisos necesitan contexto exacto de la entidad.
- Certificación requiere segundo actor autenticado.
- La UI del plan R6 debe permanecer no ejecutable mientras HOLD.

## Estado

R5 y R6 permanecen protegidos. La candidata no fue empalmada. Sin cambios en módulos/core desde backend, sin Firebase/HR writes, sin import real, deploy, pagos o producción.

## Clasificación

- Reusable CXOrbia: evidencia de pago, provenance de fixtures, permisos contextuales, segundo actor y materialización por estados.
- Exclusivo TyA: ninguno incorporado en la candidata.
- Claude/prototipo: correcciones netas documentadas.
- Academia: addendum profundo y explícito.
- Sin impacto Claude: audit scripts y pruebas semánticas locales.
