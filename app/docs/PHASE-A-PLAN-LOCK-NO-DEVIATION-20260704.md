# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**SYNC_EPOCH:** `CXORBIA-20260819-I4C-HR-SYNC-SOURCE-READY-32`

Secuencia obligatoria I1→I2→I3→I4→I5. Progreso formal actual **60% completado / 40% pendiente** porque I4 no tiene subpesos formales.

Frozen: I1/I2/I3/I4-A/I4-B, Historical Shopper, TARGET_B Admin, HR `15 periodos / 660 visitas`, Finance V2/historical y legal v0.4.

I4-C source/readiness queda PASS: se reutiliza lifecycle provider, HR source-safe y Make outbox; se agrega contrato/adapter/verifier bidireccional. Matching exacto por tenant/proyecto/visit/hrRow/shopper, origen/estado de sync explícitos, no dedupe por nombre, conflictos a revisión humana.

Verifier source-only: 8/8 PASS, 0 provider/HR/Make/platform writes.

Siguiente frontera exacta: `I4C_MAKE_HR_PROVIDER_BINDING_EXTERNAL_CONFIGURATION_REQUIRED`.

No existe binding live de Make/HR en las fuentes accesibles. No sustituir Make por integración paralela ni activar HR writes sin configuración segura y gate. Tras cerrar I4-C: I4-D Finanzas → I4-E multi-proyecto/no-code → I4-F Academia → I5.
