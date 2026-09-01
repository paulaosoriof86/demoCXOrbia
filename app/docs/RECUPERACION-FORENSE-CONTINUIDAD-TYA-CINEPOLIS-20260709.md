# Recuperacion forense de continuidad TyA / Cinepolis

Fecha: 2026-07-09  
Bloque: recuperacion de trabajo previo real para retomar produccion Phase A  
Estado: documental, sin runtime, sin import real.

## 1. Proposito

Recuperar la trazabilidad del trabajo ya realizado sobre TyA/Cinepolis para evitar reiniciar, pedir nuevamente la HR o desviarse hacia infraestructura abstracta.

Este documento no crea nueva logica. Reordena evidencia existente del repo y define la ruta inmediata hacia produccion real Phase A.

## 2. Fuentes recuperadas

Se recuperaron como fuentes vivas del repo:

1. `app/docs/ESTADO-LECTURA-HR-HISTORICO-Y-LOGICAS-TYA-20260703.md`
2. `app/docs/LOGICAS-TYA-CINEPOLIS-HR-V6-V7_1-20260703.md`
3. `app/docs/HR-FUENTE-VIVA-TYA-GOOGLE-SHEETS-20260703.md`
4. `app/docs/RESULTADO-HR-SOURCE-PRIVATE-FULL-FLOW-20260703.md`
5. `app/docs/MAPEO-PLAN-IMPORTACION-TYA-V6-V7_1-20260703.md`
6. `app/docs/RESULTADO-LOCAL-DRY-RUN-TYA-V6-V7_1-20260703.md`
7. `app/docs/RESULTADO-SHOPPER-REFERENCE-REVIEW-SUMMARY-TYA-20260703.md`
8. `app/docs/TODAY-PRODUCTION-CUTOVER-REALITY-TYA-20260704.md`
9. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`
10. `app/docs/ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`

## 3. Hallazgo principal

La lectura real de HR no estaba perdida ni era un tema nuevo.

Existe documentacion que confirma:

- la HR viva de TyA/Cinepolis fue confirmada como Google Sheets;
- contiene 30 tabs: 28 operativos y 2 dashboards;
- se verificaron columnas canonicas y variaciones de encabezado;
- se preparo lectura XLSX multi-tab;
- Paula ejecuto un full flow privado local que logro leer HR viva como `live_xlsx_tab`;
- no hubo Firestore writes, imports, deploy ni produccion;
- el siguiente paso correcto ya era staging canonico, no volver a pedir HR.

## 4. HR viva y estructura recuperada

Segun `HR-FUENTE-VIVA-TYA-GOOGLE-SHEETS-20260703.md`:

- Titulo verificado: `HR Guatemala - Sincronizacion Google Sheets`.
- Fuente: Google Sheets.
- URL y fileId no deben publicarse en repo.
- Cada proyecto debe tener campo/configuracion de HR viva.
- La HR contiene 30 tabs:
  - 28 tabs operativos por periodo/pais;
  - `DASHBOARD`;
  - `DASHBOARD HN`.

Tabs operativos documentados:

- JUNIO 25 / JUNIO 25 HN;
- JULIO 25 / JULIO 25 HN;
- AGOSTO 25 / AGOSTO 25 HN;
- SEPTIEMBRE 25 / SEPTIEMBRE 25 HN;
- OCTUBRE 25 / OCTUBRE 25 HN;
- NOVIEMBRE 25 / NOVIEMBRE 25 HN;
- DICIEMBRE 25 / DICIEMBRE 25 HN;
- ENERO 26 / ENERO 26 HN;
- FEBRERO 26 / FEBRERO 26 HN;
- MARZO 26 / MARZO 26 HN;
- ABRIL 26 / ABRIL 26 HN;
- MAYO 26 / MAYO 26 HN;
- JUNIO 26 / JUNIO 26 HN;
- JULIO 26 / JULIO 26 HN.

Total documentado: 617 filas operativas consistentes con V6.

## 5. Columnas HR recuperadas

Columnas canonicas documentadas:

- Pais;
- ID CINEMA;
- CIUDAD;
- DIRECCION;
- Shopping;
- Franja Horaria;
- Formato de Cine;
- Tipo de Combo;
- Tipo de Compra;
- Metodo de Pago;
- Quincena;
- Shopper Asignado;
- Telefono;
- Mail;
- Disponible a partir de / Fecha programada segun periodo;
- Fecha programada;
- Control dia s/franja horaria;
- Fecha realizada;
- Control Realizada;
- Cuestionario completado;
- Control Cuest completado;
- Precio de boleto;
- Precio de combo;
- N Encuesta;
- Honorarios;
- Revisor;
- Control GT;
- Observaciones de revision;
- Fecha submitido;
- Control Submitida;
- Liquidado;
- Correo Enviado;
- Recomendaciones Enviadas;
- Recomendaciones Cuestionario;
- Envio de escenario cuando aplica.

Variaciones recuperadas:

- Tabs 2025 usan `Fecha programada` y no siempre `Disponible a partir de`.
- Tabs 2026 incorporan `Disponible a partir de`.
- Hay variaciones de espacios, saltos de linea y nombres.
- El conector debe normalizar encabezados y no depender de texto exacto.

## 6. Logicas operativas recuperadas

De `LOGICAS-TYA-CINEPOLIS-HR-V6-V7_1-20260703.md` y `ESTADO-LECTURA-HR-HISTORICO-Y-LOGICAS-TYA-20260703.md`:

- Cada fila HR representa una visita planificada u operativa.
- Sin shopper asignado: pendiente por asignar.
- Shopper asignado sin fecha programada: pendiente por agendar.
- Fecha programada sin realizada: agendada.
- Fecha realizada sin cuestionario: pendiente cuestionario.
- Cuestionario sin submitido: pendiente submitido TyA.
- Submitido habilita liquidacion candidata.
- Liquidado requiere cruce financiero antes de definitivo.
- Q1 y Q2 no son equivalentes ni independientes.
- Q2 depende de Q1 realizada/submitida cuando aplica.
- Si Q1 no esta realizada/submitida, Q2 queda bloqueada como pendiente por visita previa.
- `Disponible desde` debe ser dinamico.
- Honduras normalmente tiene 10 visitas.
- `JUNIO 26 HN` queda en revision por fila adicional/diferencia.
- `JULIO 26` queda como preparacion, no historico cerrado.

## 7. Plataforma actual / legacy util recuperado

La plataforma actual y RTDB anterior fueron utilizadas como complemento, no como base tecnica a copiar.

Recuperado:

- RTDB complementa trazabilidad de shoppers, postulaciones, notificaciones y marcas candidatas de cuestionario.
- HR manda para visitas, fechas, submitidos y base de liquidaciones.
- Shoppers vienen de HR + RTDB con dedupe manual.
- Postulaciones/notificaciones sirven como historial/trazabilidad.
- Questionnaire marks no debe importarse como fuente independiente si duplica postulaciones.
- Liquidaciones requieren HR + Excel financiero externo.

Descartado/bloqueado:

- No copiar codigo viejo.
- No conectar base vieja.
- No migrar raw RTDB completo.
- No importar DPI crudo.
- No usar questionnaire_marks como fuente independiente si es duplicado.
- No activar notificaciones vivas sin resolver destinatario canonico.

## 8. Dry-run y issues recuperados

El dry-run V6/V7.1 se ejecuto localmente y fue exitoso como dry-run, sin carga.

Issues criticos documentados:

1. `shoppers.csv` contiene DPI o dato sensible equivalente. Requiere descarte, cifrado o staging restringido.
2. `questionnaire_marks.csv` es identico a `postulations.csv`; no debe usarse como fuente independiente.

Gates aun vigentes:

- politica DPI/datos sensibles;
- cuestionarios duplicados o fuente separada;
- mojibake/encoding RTDB;
- destinatarios canonicos de notificaciones;
- revision de `JUNIO 26 HN`;
- cruce financiero externo para liquidaciones.

## 9. Shoppers y referencias recuperadas

Resultado recuperado de `RESULTADO-SHOPPER-REFERENCE-REVIEW-SUMMARY-TYA-20260703.md`:

- Reference review rows: 661.
- Candidate rows: 276.
- Canonical rows: 276.
- Duplicate review rows: 276.
- Con canonicalShopperId: 661.
- Matched known canonical: 0.
- Unmatched canonical: 661.
- Strict blockers: 661.

Dictamen recuperado:

- `SHOPPER_REVIEW` sigue en `review_required`.
- No significa 661 shoppers nuevos.
- Probable confusion entre IDs de evento/fila y IDs canonicos de shopper.
- Siguiente bloque pendiente: diagnostico sanitizado de disponibilidad de campos de referencia.

## 10. Produccion/cutover recuperado

`TODAY-PRODUCTION-CUTOVER-REALITY-TYA-20260704.md` definio que la salida debe estabilizar lo ya trabajado y no redisenar backend completo.

Mantener activo:

- HR completo;
- lectura/control de visitas reales;
- asignaciones HR/plataforma;
- shoppers existentes;
- certificaciones ya presentadas;
- creacion/configuracion de nuevo proyecto desde plataforma si el flujo existe.

Validar antes de publicar:

- visitas disponibles no deben incluir asignadas;
- asignacion desde HR se refleja en plataforma;
- asignacion desde plataforma no duplica al aparecer en HR;
- shopper certificado no repite prueba;
- pagos pendientes de junio separados de pagados hasta mayo.

## 11. Estado real vs runtime actual

El runtime actual `app/core/data.js` sigue mostrando demo/mock como fuente visible.

Pero eso no invalida el trabajo previo. La conclusion correcta es:

- el trabajo HR/legacy real existe y esta documentado;
- la lectura HR viva fue probada localmente en preview multi-tab;
- la app runtime aun no parece estar usando esa fuente como datos visibles finales;
- el siguiente bloque no es volver a pedir HR, sino conectar el puente de real-data preview/staging detras de `CX.data`, con gate y sin tocar modulos.

## 12. Prioridad inmediata corregida

No continuar con infraestructura general hasta cerrar este camino:

1. Construir/ubicar runner de staging canonico sobre HR viva ya documentada.
2. Normalizar tabs operativos vs dashboard.
3. Normalizar periodos/paises/quincenas.
4. Generar manifest source-safe sin PII.
5. Mapear proyecto Cinepolis como proyecto normal configurable.
6. Preparar bridge de preview real-data detras de `CX.data` sin reemplazar modulos.
7. Validar UI solo en URL o entorno real verificable.

## 13. Pendiente Claude/prototipo derivado

Claude debe recibir paquete corto cuando corresponda:

1. Formulario proyecto debe tener Fuente de Hoja de Ruta con tipo, URL privada, probar conexion, estados y preview.
2. Proyectos/periodos deben mostrar Cinepolis como proyecto normal configurable, no hardcodeado.
3. UI debe distinguir demo, preview real, staging sanitizado, importado y produccion.
4. UI debe mantener copy honesto: no conectado/no importado/no sincronizado hasta gate.
5. Academia/manuales deben explicar configuracion HR, mapeo, errores de columnas y revision humana.

## 14. Siguiente bloque exacto

Crear `RECUPERACION-RUNBOOK-STAGING-CANONICO-HR-TYA-CINEPOLIS-20260709.md` y, si no existe ya, un validador/runner que tome la lectura HR viva ya probada/documentada y produzca manifest source-safe para:

- tabs operativos;
- dashboards excluidos;
- periodos;
- pais;
- quincena;
- filas esperadas/revision;
- columnas canonicas;
- issues criticos;
- bloqueos antes de importacion.

## 15. Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin import real.
- Sin Firestore writes.
- Sin Auth real.
- Sin Storage real.
- Sin Make real.
- Sin Gemini real.
- Sin base vieja conectada.
- Sin datos sensibles en repo.
