# Lógicas TyA / Cinépolis aclaradas por V6 + V7.1

Fecha: 2026-07-03  
Estado: documento funcional para backend y migración.  
Restricción: no código viejo, no UI vieja, no hardcode global.

## 1. Dictamen ejecutivo

La plataforma anterior y los paquetes V6 + V7.1 sí cumplieron parcialmente el propósito de aclarar lógicas de negocio que estaban pendientes para CXOrbia.

Aclararon con buen nivel:
- Qué fuente manda para cada tipo de dato.
- Cómo interpretar la hoja de ruta histórica.
- Cómo separar histórico cerrado vs preparación.
- Cómo usar RTDB como trazabilidad operativa, no como fuente principal de visitas.
- Qué eventos operativos existían: postulación, fecha propuesta, visita realizada, cuestionario marcado, notificaciones y atención de alertas.
- Qué casos no se deben importar automáticamente.

No aclararon completamente:
- La conexión viva a la hoja de ruta externa.
- El mecanismo técnico de lectura/escritura en vivo.
- La resolución definitiva de codificación RTDB V7.1.
- La fuente real independiente de marcaciones de cuestionario, porque `questionnaire_marks.csv` duplica `postulations.csv`.
- La conciliación financiera final, porque liquidaciones requieren cruce con Excel externo.

Conclusión:
- Para reglas de negocio, V6 + V7.1 son útiles y suficientes para diseñar el modelo CXOrbia.
- Para lectura viva de HR, aún falta construir un conector controlado `HR Live Connector` con preview, mapeo, validación, write-back y rollback.

## 2. Fuente de verdad por dominio

| Dominio | Fuente principal | Fuente secundaria | Decisión |
|---|---|---|---|
| Visitas | HR V6 | RTDB solo referencia | HR manda. |
| Fechas programadas | HR V6 | RTDB postulations | HR manda; RTDB sirve para trazabilidad. |
| Fechas realizadas | HR V6 | RTDB postulations | HR manda; RTDB valida evento shopper/plataforma. |
| Cuestionario completado | HR V6 | RTDB candidates | HR manda para histórico; RTDB queda como candidato. |
| Submitido | HR V6 | Ninguna | Submitido lo hace TyA. |
| Liquidación base | HR V6 | Excel financiero externo | No es deuda final sin Excel. |
| Shoppers | HR + RTDB | Dedupe manual | No fusionar automático. |
| Postulaciones | RTDB V7.1 | HR para vincular visita | Importar como eventos/trazabilidad. |
| Notificaciones | RTDB V7.1 | Resolver destinatarios | Historial primero; activas solo con destinatario canónico. |
| Certificaciones | RTDB V7.1 | No aplica | 0 migrables limpias. |

## 3. Hoja de Ruta HR: lectura funcional

La HR no debe tratarse como una tabla simple sin reglas. Cada fila representa una visita planificada u operativa, con campos funcionales que definen el estado de la visita.

Campos clave detectados en `migration_visits_master_hr.csv`:
- `visitKey`: llave natural normalizada.
- `periodo`: periodo de origen, por ejemplo `ABRIL_26`, `JUNIO_26_HN`.
- `periodo_migracion`: `historico` o `preparacion`.
- `pais`: Guatemala / Honduras.
- `id_cinema`: identificador de cine.
- `sucursal`: cine/sucursal.
- `franja`: WK / WKND / variantes.
- `quincena`: QUINCENA 1 / QUINCENA 2.
- `shopper_asignado`: nombre del shopper en HR.
- `telefono`, `email`: datos de contacto de HR.
- `disponible_desde`: fecha desde la cual se puede operar/agendar.
- `fecha_programada`: fecha agendada.
- `fecha_realizada`: fecha de visita realizada.
- `fecha_cuestionario`: fecha de cuestionario completado/marcado.
- `fecha_submitido`: fecha o marca de submitido TyA.
- `liquidado`: señal base para liquidación.
- `estado`: estado operativo derivado o normalizado.
- `source_tab`, `source_row`: trazabilidad exacta de origen.

## 4. Interpretación de estados operativos

Reglas derivadas:

1. Si no hay shopper asignado:
   - Estado funcional: pendiente por asignar.
   - No debe aparecer como visita lista para shopper.

2. Si hay shopper asignado y no hay fecha programada:
   - Estado funcional: pendiente por agendar.
   - Shopper puede proponer/agendar según reglas del proyecto.

3. Si hay fecha programada y no hay fecha realizada:
   - Estado funcional: agendada.
   - La plataforma debe permitir seguimiento, reprogramación o validación de rango.

4. Si hay fecha realizada y no hay cuestionario:
   - Estado funcional: realizada / pendiente cuestionario.
   - Se habilita acceso a T&A Online o acción de marcar cuestionario, según rol.

5. Si hay cuestionario y no hay submitido:
   - Estado funcional: cuestionario completado / pendiente submitido TyA.
   - No debe tratarse como liquidación final.

6. Si hay submitido:
   - Estado funcional: submitido.
   - Se habilita cálculo de liquidación candidata.

7. Si hay liquidado/pagado validado:
   - Estado funcional: liquidado/pagado.
   - Requiere cruce financiero antes de ser definitivo.

## 5. Reglas de quincena Cinépolis

Estas reglas son específicas del programa Cinépolis y deben quedar parametrizadas por proyecto/programa, no hardcodeadas como reglas globales de CXOrbia.

Reglas:
- Cada cine puede tener visitas por quincena.
- Q1 y Q2 no son equivalentes ni independientes.
- Q2 depende de Q1 realizada y submitida cuando aplica la restricción operativa.
- Si Q1 no está realizada/submitida, Q2 debe quedar bloqueada como pendiente por visita previa o equivalente.
- `disponible_desde` debe ser dinámico y depender de reglas del programa, submitidos previos y periodos.
- Las reglas deben configurarse en datos del proyecto/programa.

## 6. Disponible desde dinámico

Lo aclarado:
- `disponible_desde` existe en HR y debe leerse.
- No debe quedar fijo ni hardcodeado.
- Debe poder recalcularse cuando cambia submitido o estado de visita previa.

Pendiente técnico:
- Definir fórmula exacta configurable por programa:
  - días mínimos entre visitas;
  - dependencia Q1/Q2;
  - país;
  - franja;
  - periodo;
  - fecha de submitido;
  - excepciones por proyecto.

Recomendación CXOrbia:
- Guardar `availableFromRaw` desde HR.
- Guardar `availableFromComputed` desde motor de reglas.
- Guardar `availableFromReason` para trazabilidad.
- Si hay conflicto, mostrarlo en preview y no sobrescribir HR sin autorización.

## 7. Julio 2026

Regla aclarada:
- Julio 2026 existe en HR con 44 filas.
- Debe quedar como preparación.
- No se debe tratar como histórico cerrado ni como operación ejecutada.

Uso en CXOrbia:
- Crear preview de periodo en estado `preparation`.
- No activar como visitas realizadas.
- No crear liquidaciones finales.

## 8. JUNIO_26_HN

Regla aclarada:
- Honduras normalmente tiene 10 visitas.
- `JUNIO_26_HN` tiene 11 filas.
- La fila `source_row=12` presenta datos desplazados o no operativos.

Uso en CXOrbia:
- No importar automáticamente.
- Registrar en `discardedRecords` o `validationIssues`.
- Requiere confirmación humana.

## 9. RTDB: lógica operativa recuperada

V7.1 aclara que la plataforma anterior tenía trazabilidad útil:

Postulaciones:
- `postulations.csv` contiene 44 postulaciones/eventos.
- Todas son vinculables a HR por periodo, país, cine y quincena.
- No deben reemplazar HR; deben complementar historial operativo.

Cuestionarios:
- `questionnaire_marks.csv` no es fuente independiente porque duplica `postulations.csv`.
- `questionnaire_status_candidates.csv` puede usarse como señal candidata.
- La fuente definitiva histórica de cuestionario sigue siendo HR.

Notificaciones:
- `notifications.csv` contiene 216 registros parseados.
- Sirve para reconstruir alertas y trazabilidad.
- No debe importarse como notificación activa si no se resuelve destinatario.

Certificaciones:
- 0 registros migrables limpios.
- No hay que inventar certificaciones.

## 10. Lo que todavía falta para lectura viva de HR

La migración aclaró reglas, pero no resuelve por sí sola la lectura viva.

Falta definir:
- Ubicación real de la HR viva: Excel Online, Google Sheets, Drive, OneDrive u otra fuente.
- Método de autenticación seguro.
- ID del archivo o libro.
- Nombres de hojas/tabs vigentes.
- Rango de columnas vivo.
- Encabezados esperados.
- Tratamiento de fórmulas.
- Si CXOrbia puede escribir de vuelta o solo leer.
- Control de concurrencia cuando Paula/TyA editen HR mientras CXOrbia sincroniza.
- Logs de cambios.
- Manejo de errores: 403, 404, hoja vacía, columnas cambiadas, datos mal desplazados.

## 11. Contrato recomendado para HR Live Connector

El conector vivo debe devolver un resultado estructurado, no escribir directo a operación.

Salida mínima:

```json
{
  "source": "hr-live",
  "tenantId": "tya",
  "programId": "cinepolis",
  "periodsDetected": [],
  "visitsPreview": [],
  "submitidosPreview": [],
  "liquidationCandidates": [],
  "validationIssues": [],
  "discardedRecords": [],
  "sourceFingerprint": "checksum-or-version",
  "readAt": "ISO_DATE"
}
```

## 12. Respuesta a la duda de negocio

Sí, la otra plataforma sí ayudó a aclarar lógicas que estaban pendientes, especialmente para interpretar HR y reconstruir flujos operativos.

Pero no basta para resolver lectura en vivo. Para dejar de dar vueltas, el siguiente avance no debe ser otra lectura manual de HR, sino construir un conector vivo con:
- contrato de columnas;
- preview;
- validadores;
- reconciliación contra Firestore;
- write-back controlado;
- rollback;
- logs por lote.
