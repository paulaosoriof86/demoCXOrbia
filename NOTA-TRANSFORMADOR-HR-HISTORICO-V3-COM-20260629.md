# NOTA-TRANSFORMADOR-HR-HISTORICO-V3-COM-20260629

## Contexto

Los intentos de transformacion HR historico con Node/xlsx no dejaron JSON transformado en `firebase/private-output` aunque algunos mensajes finales de PowerShell imprimieron cierre positivo.

## Decision

Para evitar bloqueo por dependencias locales de Node se continua con un transformador local PowerShell usando Excel COM en modo lectura. Este enfoque lee el XLSX multihoja completo desde `firebase/private-input/hr-tya-historico-sync.xlsx` y genera JSON local sin escribir Firestore.

## Alcance

- Lee hojas mensuales GT/HN.
- Omite dashboards.
- Deduplica shoppers por pais y nombre normalizado.
- Reconstruye visitas, cuestionarios y liquidaciones desde HR.
- Omite telefonos, correos, documentos, evidencias y observaciones.

## Restricciones

- No Firestore.
- No Hosting.
- No merge.
- No produccion.
- No cambios en `/app/modules`.
