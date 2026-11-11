# ROLA Entertainment — contrato de configuración operacional propuesto

**Corte:** 2026-11-11, Guatemala. **Estado:** ESPECIFICACIÓN DE CONTINUIDAD; NO CONFIGURADO, NO PUBLICADO, SIN ALTAS DE USUARIOS NI HR. **Autoridad:** instrucciones de Paula 2026-11-11. Proyecto futuro de CXOrbia/Gravicentra CX en el mismo producto y tenant; no crear nueva plataforma, candidato, rama o despliegue. La salida operativa de Cinépolis y la certificación Phase A preceden la activación de ROLA.

## Decisiones de negocio preservadas

1. ROLA cubre auditorías en **Guatemala (GT), El Salvador (SV), Honduras (HN) y Nicaragua (NI)**. Una ronda **mensual**; unas **200–400 visitas combinadas** por mes, cantidad indicativa y no cuota fija.
2. El conjunto de cinemas/sucursales, el número de evaluaciones por sede y los shoppers **pueden variar cada mes**. La misma sede en octubre y noviembre **no es una visita duplicada**: cada visita tiene ciclo, asignación, fecha, cuestionario y resultado propios.
3. Cuestionario externo **TyAOnline**, según contrato operativo semejante al de Cinépolis; no fabricar bancos internos ni copiar cuestionarios de meses anteriores.
4. **Coordinadores por país:** cada uno accede y administra **únicamente** la operación y hoja de ruta autorizada de su país. Dirección central observa/agrega cuatro países; permisos garantizados en backend, proveedor, API y vista, no solo mediante ocultamiento visual.
5. Configuración totalmente **autoadministrable desde la plataforma**: proyecto, países, fuentes HR, período, establecimientos, volúmenes, cuestionario, coordinadores, asignaciones y auditoría. No entregar una característica cuya única configuración esté codificada.

## Arquitectura recomendada para decidir fuentes

**Un proyecto ROLA, cuatro fuentes operacionales nacionales**, cada una con pestañas o particiones mensuales. No se recomienda una sola hoja editable compartida para los cuatro países. El volumen estimado por sí solo no obliga a dividir Google Sheets, pero el control de acceso, responsabilidad local, versiones y fallos por país sí justifican separar fuentes.

| País | Registro de configuración requerido | Lectura del coordinador | Lectura de Dirección |
|---|---|---|---|
| GT | `country=GT`, `providerBindingId` propio, `period=YYYY-MM`, mapping y revisión | Solo GT | GT+SV+HN+NI |
| SV | `country=SV`, `providerBindingId` propio, `period=YYYY-MM`, mapping y revisión | Solo SV | GT+SV+HN+NI |
| HN | `country=HN`, `providerBindingId` propio, `period=YYYY-MM`, mapping y revisión | Solo HN | GT+SV+HN+NI |
| NI | `country=NI`, `providerBindingId` propio, `period=YYYY-MM`, mapping y revisión | Solo NI | GT+SV+HN+NI |

**Implementación:** el wizard actual ofrece periodicidad, varios países y enlace a cuestionario, pero el contrato `operationalSource` actualmente expone **un único** `providerBindingId/mappingRef` por proyecto; el sistema aún necesita un editor y persistencia de **fuentes por país y período**. Deben probarse permisos negativos de coordinadores también a nivel servidor. Esta propuesta no equivale a que ROLA ya esté configurado.

## Modelo mínimo por visita y período

- Identidad única de visita: `projectId + country + period + visitId`, con la sede y su cuota como atributos. **Nunca deduplicar por nombre del cinema/sucursal** ni trasladar implícitamente resultados entre meses.
- Planificación mensual: carga desde la revisión vigente de cada HR, reconciliación **solo del país/período** y de su autorización de origen; altas/bajas/cambios de cantidad por sede sin borrar las visitas realizadas o sometidas.
- Estados: pendiente de asignar, asignada/programada, reprogramada, realizada, cuestionario pendiente, submitted/validada y liquidación, según el contrato de Cinépolis que resulte certificado; no confundir “cuestionario enviado” con “visita realizada”.
- TyAOnline: referencia estable al cuestionario de la visita, captura de estado/fecha/evidencia de envío según integración autorizada; no publicar el contenido de otro país ni asumir sincronización bidireccional no probada.
- Trazabilidad por país: `sourceId`, hoja/pestaña, revisión/fecha de lectura, lote, actor, instante, recuentos, cambios y errores. Consolidado central **derivado**, nunca una segunda HR editable que genere doble autoridad.
- Permiso de coordinador: `projectId=ROLA && country in assignedCountries` comprobado en consultas, mutaciones, exportaciones, notificaciones, enlaces a HR, reportes y acciones API. Una asignación de varios países solo por autorización explícita de Dirección.

## Puertas funcionales para activar ROLA

1. **Cinépolis**: resolver las pruebas focales B1–B3 y B8; cerrar B9 y Gates20/21 sobre fuente/artefacto exactos sin eliminar PASS humano B4–B7. No mezclar el Gate de Cinépolis con la puesta en marcha de ROLA.
2. **ROLA configuración**: proyecto visible en Configuración; editor de 4 `operationalSources` con binding real por país/período y mapeo revisable, periodicidad mensual, cuotas dinámicas, TyAOnline y roles; guardar/reabrir/releer sin recurrir a código para operar.
3. **ROLA pruebas DEV**: una ronda simulada GT/SV/HN/NI con cuotas cambiantes, misma sede en distintos meses generando visitas distintas, actualizaciones idempotentes de HR, estados TyAOnline, ingresos/controles de cuatro coordinadores y pruebas negativas de acceso cruzado a hojas, visitas, exportes, URLs y API.
4. **ROLA habilitación LIVE**: fuente revisada, evidencia funcional/visual, seguridad multi-país y aprobación de Dirección; no habilitar por parecido con Cinépolis ni por éxito de CI aislado.

## Insumos de negocio todavía no suministrados/verificados

- Enlaces y estructura autorizados de las cuatro HR nacionales vigentes y su patrón de actualización mensual.
- Identidades y países de los coordinadores y alcance exacto de **edición** permitido (p.ej. asignar/reprogramar; no alterar la HR externa si esta es la fuente de verdad).
- Referencias y reglas de vínculo al cuestionario de TyAOnline por ronda; fechas de arranque y política de reembolso/honorarios ROLA si es distinta de Cinépolis.

**Seguridad:** cero escrituras a HR/Firestore/Auth/Storage/pagos; producción `tya-plataforma.web.app` `DO_NOT_TOUCH` en este corte. No declarar ROLA creado hasta observar guardado y readback real de su configuración en UI/backend.
