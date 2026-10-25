# Validador dry-run TyA V6 + V7.1

Fecha: 2026-07-03
Estado: implementado en rama `docs-tya-v6-v71-audit`.

## Archivo agregado

- `tools/migration/tya-dry-run-validator.ps1`

## Propósito

Validar los paquetes de migración TyA V6 + V7.1 antes de cualquier carga a Firestore.

El validador:
- extrae V6 y V7.1 en carpeta temporal;
- expande ZIPs internos recursivamente;
- cuenta visitas, submitidos, liquidaciones candidatas, shoppers, postulaciones, notificaciones y certificaciones;
- revisa archivos faltantes;
- escanea extensiones no permitidas y posibles secretos;
- detecta DPI en shoppers;
- detecta si `questionnaire_marks.csv` es igual a `postulations.csv`;
- detecta mojibake candidato en RTDB;
- marca `JUNIO 26 HN` con 11 filas;
- recuerda que liquidaciones requieren cruce financiero externo;
- genera reporte Markdown y JSON;
- copia el reporte Markdown al portapapeles.

## Seguridad

No importa datos.
No escribe Firestore.
No hace deploy.
No toca frontend.
No imprime PII cruda en el reporte.
No sube CSV crudos al repositorio.

## Uso local esperado

Ejecutar el script desde la raíz del repo, pasando las rutas locales de los ZIP V6 y V7.1 descargados.

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\migration\tya-dry-run-validator.ps1 -V6Zip "RUTA_LOCAL_V6.zip" -V71Zip "RUTA_LOCAL_V7_1.zip" -HrLiveXlsx "RUTA_LOCAL_HR.xlsx"
```

## Gates antes de importar

La importación sigue bloqueada hasta resolver:
- política DPI;
- `questionnaire_marks.csv` duplicado;
- codificación/mojibake RTDB;
- destinatarios canónicos de notificaciones;
- revisión de `JUNIO 26 HN`;
- cruce de liquidaciones con Excel financiero externo.
