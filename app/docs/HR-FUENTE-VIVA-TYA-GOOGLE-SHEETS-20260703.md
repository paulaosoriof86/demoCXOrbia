# HR fuente viva TyA / Cinépolis — Google Sheets

Fecha: 2026-07-03  
Estado: referencia viva confirmada por Paula y verificada con conector Google Drive.  
Rama documental: `docs-tya-v6-v71-audit`.  
Restricción: no se commitea la URL completa ni datos crudos porque el repositorio es público y la hoja contiene PII operativa.

## 1. Fuente confirmada

Paula compartió nuevamente la HR viva de TyA / Cinépolis como Google Sheets.

Metadatos verificados:
- Título: `HR Guatemala - Sincronizacion Google Sheets`.
- Creada: `2025-05-29T05:42:11.487Z`.
- Modificada: `2026-07-03T04:10:15.639Z`.
- Contiene datos operativos con nombres, teléfonos, sucursales, fechas y estados.

Decisión de seguridad:
- La URL completa y el fileId completo no se publican en el repo.
- El link debe guardarse como configuración privada del proyecto/tenant en Firestore DEV o Secret Manager, no como literal en código ni documentación pública.
- En CXOrbia, cada proyecto debe tener un campo configurable para su HR viva.

## 2. No se perdió el trabajo previo

Se reconoce como contexto ya trabajado:
- Cada proyecto debe leer su propia HR.
- La plataforma debe permitir crear un proyecto normal y asociarle una HR viva.
- TyA/Cinépolis usa HR externa como fuente viva inicial.
- A futuro, CXOrbia debe tener HR nativa colaborativa.
- Shoppers pueden crearse desde HR, postulación o registro directo.
- Las asignaciones pueden venir de HR, backoffice o postulaciones aprobadas.
- La lógica de HR y Cinépolis no debe convertirse en hardcode global de CXOrbia.

## 3. Estructura física de la HR viva verificada

La hoja contiene 30 tabs:
- 28 tabs operativos por periodo/país.
- 2 dashboards: `DASHBOARD`, `DASHBOARD HN`.

Tabs operativos verificados:

| Tab | Filas operativas detectadas |
|---|---:|
| JUNIO 25 | 34 |
| JUNIO 25 HN | 10 |
| JULIO 25 | 34 |
| JULIO 25 HN | 10 |
| AGOSTO 25 | 34 |
| AGOSTO 25 HN | 10 |
| SEPTIEMBRE 25 | 34 |
| SEPTIEMBRE 25 HN | 10 |
| OCTUBRE 25 | 34 |
| OCTUBRE 25 HN | 10 |
| NOVIEMBRE 25 | 34 |
| NOVIEMBRE 25 HN | 10 |
| DICIEMBRE 25 | 34 |
| DICIEMBRE 25 HN | 10 |
| ENERO 26 | 34 |
| ENERO 26 HN | 10 |
| FEBRERO 26 | 34 |
| FEBRERO 26 HN | 10 |
| MARZO 26 | 34 |
| MARZO 26 HN | 10 |
| ABRIL 26 | 34 |
| ABRIL 26 HN | 10 |
| MAYO 26 | 34 |
| MAYO 26 HN | 10 |
| JUNIO 26 | 34 |
| JUNIO 26 HN | 11 |
| JULIO 26 | 34 |
| JULIO 26 HN | 10 |

Total detectado: 617 filas operativas, consistente con V6.

## 4. Columnas canónicas verificadas

Columnas base observadas en la HR viva:

- País
- ID CINEMA
- CIUDAD
- DIRECCIÓN / DIRECCIÓN
- Shopping / Shopping
- Franja Horaria
- Formato de Cine
- Tipo de Combo
- Tipo de Compra
- Método de Pago
- Quincena
- Shopper Asignado
- Telefono
- Mail
- Disponible a partir de / Fecha programada según periodo
- Fecha programada
- Control día s/ franja horaria
- Fecha realizada
- Control Realizada
- Ccuestionario completado
- Control Cuest completado
- Precio de boleto
- Precio de combo
- N° Encuesta
- Honorarios
- Revisor
- Control GT
- Observaciones de revisión
- Fecha submitido
- Control Submitida
- Liquidado
- Correo Enviado
- Recomendaciones Enviadas
- Recomendaciones Cuestionario
- Envío de escenario, en tabs 2026 cuando aplica.

Variaciones detectadas:
- Tabs 2025 usan `Fecha  programada` y no siempre incluyen `Disponible a partir de`.
- Tabs 2026 incorporan `Disponible a partir de`.
- Algunas columnas tienen espacios, saltos de línea o variación de nombre.
- El conector debe normalizar encabezados, no depender de texto exacto.

## 5. Mapeo hacia CXOrbia

Cada proyecto CXOrbia debe permitir guardar conexión HR:

```json
{
  "tenantId": "tya",
  "programId": "cinepolis",
  "projectId": "cinepolis",
  "hrSource": {
    "type": "google_sheets",
    "visibility": "private_config",
    "urlSecretRef": "tenants/tya/projects/cinepolis/secrets/hrSourceUrl",
    "spreadsheetTitle": "HR Guatemala - Sincronizacion Google Sheets",
    "tabsPattern": "{MES} {YY} / {MES} {YY} HN",
    "lastVerifiedAt": "2026-07-03"
  }
}
```

No guardar `url` literal en archivos públicos.

## 6. Contrato de lectura viva

El backend debe leer la HR viva por proyecto y producir preview, no escribir directo a operación.

Flujo:

```text
Proyecto CXOrbia normal
→ campo/configuración HR viva
→ HR Live Connector Google Sheets
→ preview por periodo/país
→ validadores
→ migrationBatch/hrReadBatch
→ Firestore DEV
→ CX.data adapter
```

## 7. Lógicas preservadas para HR viva

- Guatemala normal: 34 visitas por periodo.
- Honduras normal: 10 visitas por periodo.
- Total mensual normal: 44.
- `JUNIO 26 HN` tiene 11 filas y debe ir a revisión.
- `JULIO 26` / `JULIO 26 HN` son preparación, no histórico cerrado.
- Submitido viene de HR/TyA.
- Liquidación requiere submitido y cruce financiero externo.
- Q1/Q2 y disponibilidad deben parametrizarse como reglas del programa Cinépolis.

## 8. Pendiente técnico inmediato

Crear el primer conector dry-run de HR viva:
- toma la configuración privada del proyecto;
- lee tabs;
- normaliza columnas;
- genera conteos por tab;
- identifica errores de schema;
- distingue permisos/404/hoja vacía;
- no escribe Firestore;
- no expone PII en logs públicos.

## 9. Pendiente para Claude/prototipo

El formulario de proyecto debe contemplar una sección `Fuente de Hoja de Ruta` con:
- tipo de fuente: Google Sheets / Excel Online / carga manual;
- campo de URL visible solo a roles autorizados;
- botón `Probar conexión`;
- estado honesto: conectado, pendiente backend, error permisos, hoja no encontrada, columnas cambiadas;
- selector de tabs/periodos detectados;
- preview antes de importar.

Claude no debe conectar directamente el frontend a Google Sheets. Solo debe dejar la UI y contratos preparados.
