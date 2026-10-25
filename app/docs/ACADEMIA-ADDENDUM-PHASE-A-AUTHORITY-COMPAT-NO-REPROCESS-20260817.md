# ACADEMIA — ADDENDUM PHASE A AUTHORITY COMPAT / NO REPROCESS

**Fecha:** 2026-08-17 13:05 -06:00  
**Estado:** `DOCUMENTATION_ONLY__NO_COURSE_CONTENT_CHANGE`

## Patrón reusable CXOrbia

1. **Proyecto raíz vs periodo:** un scope de autorización puede identificar el proyecto/programa (`cinepolis`) mientras el read model almacena filas de periodo (`cinepolis-2026-08`). Los niveles no se comparan como si fueran el mismo ID; la relación debe ser explícita y exacta.
2. **Fuente operacional vs evento de plataforma:** una asignación presente en HR no equivale a una postulación creada por un Shopper. Cada entidad conserva su autoridad y semántica.
3. **No reproceso:** un histórico Auth/Shopper/Finance previamente certificado permanece congelado. Una nueva revisión HR se compone sobre ese checkpoint; no se destruye ni recrea para incorporar un periodo nuevo.
4. **Fail-closed financiero:** una visita sin fuente financiera exacta queda en revisión; no invalida históricos conciliados ni habilita pago.
5. **Identidad:** solo crosswalk/llaves técnicas exactas; no nombre, email, teléfono, username o similitud.

## Impacto en Academia

Sin cambio en contenido de Academia, certificaciones presentadas, rutas de aprendizaje ni aceptación legal en este bloque. Estos patrones deben incorporarse después a manuales técnicos/administrativos para explicar autoridad de datos, periodos y trazabilidad.

## Seguridad

Cero Auth/Firestore/HR/Rules/Storage/Make/Gemini/payment writes; sin deploy/merge/producción.
