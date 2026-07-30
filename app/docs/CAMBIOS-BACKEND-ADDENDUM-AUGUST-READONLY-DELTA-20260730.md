# CAMBIOS-BACKEND — addendum Agosto · refresh HR y delta read-only

**Fecha:** 2026-07-30  
**Estado:** `AUG_GT34_DELTA_TECH_READY__HN_SOURCE_COUNTRY_MISMATCH__NO_UNASSIGNED_VISITS__NO_WRITES`

## Refresh HR vivo
Se ejecutó reconciliación source-safe cache-busted contra la HR viva, sin provider writes.

Resultado de fuente actual:
- periodos detectados:15;
- histórico hasta julio preservado:14 periodos /616 visitas;
- agosto detectado:68 filas aparentes;
- `AGOSTO 26` GT:34 filas;
- `AGOSTO 26 HN`:34 filas aparentes.

## Gate país vs pestaña
El gate independiente de consistencia confirma:
- `AGOSTO 26` GT:34/34 con país GT, mismatch0;
- `AGOSTO 26 HN`:34/34 contienen país GT, mismatch34.

Decisión fuente: `HOLD_COUNTRY_TAB_MISMATCH` para HN. No se relabelan filas por nombre de pestaña ni se inventan 10 HN.

## Delta-only provider compare
Se agregó un plan read-only que compara agosto contra Firestore canónico y resuelve shopperRefs mediante el mapping R17N existente.

Resultado técnico GT:
- Firestore actual:616 visitas;
- periodo2026-08 todavía no existe;
- candidatos GT aceptados34;
- nuevos34;
- ya existentes0;
- source shopper refs28;
- mappings canónicos28/28;
- perfiles target existentes28/28;
- identity gaps0;
- histórico protegido:1,406 writes no se reabre.

Decisión: `PASS_AUGUST_GT34_DELTA_TECH_READY__HN_HOLD_SOURCE_COUNTRY_MISMATCH`.

## Gate operativo para publicación
El mismo refresh muestra que esas34 filas GT no están en estado disponible:
- assigned34;
- unassigned0;
- scheduled34;
- realized34;
- submitted27;
- questionnaire7.

`releaseReadiness=NO_UNASSIGNED_VISITS_IN_ACCEPTED_SOURCE`.

Por lo tanto el delta GT es técnicamente identificable, pero **no puede publicarse como visitas disponibles** sin alterar/inventar el estado de la fuente. Tampoco se puede materializar HN porque la pestaña HN contiene34 filas marcadas GT.

## Causa operacional / fail-closed
La fuente HR de agosto todavía no representa el lote nuevo publicable. El backend no debe convertir visitas asignadas/realizadas en disponibles ni convertir filas GT de una pestaña HN en HN silenciosamente.

La corrección de raíz requerida está en la fuente operativa de agosto: `AGOSTO 26` debe reflejar las visitas reales a publicar y `AGOSTO 26 HN` debe contener las filas HN correctas. Una vez corregida la fuente, el gate read-only se repite y el delta se recalcula automáticamente.

## Seguridad
Este bloque hizo únicamente lecturas de HR/Firestore y cambios de herramientas/evidencia/docs. HR writes0; Firestore writes0; Auth writes0; Rules0; Hosting0; producción=false; merge=false; PII exportada0.

## Siguiente bloque exacto
`CORREGIR/ACTUALIZAR FUENTE HR AGOSTO → REFRESH READ-ONLY AUTOMÁTICO → EXPECT GT34/HN10 + ESTADOS PUBLICABLES → DELTA PLAN → AUTORIZACIÓN WRITE SOLO DELTA`.

No se solicita PowerShell, Firebase Console ni reproceso histórico.