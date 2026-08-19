# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**SYNC_EPOCH:** `CXORBIA-20260819-I4A-VISIBLE-SMOKE-RETRY1-DOCUMENT-SELECTOR-HOLD-23`  
**Avance formal:** **60% completado / 40% pendiente**. I1 `15/15`, I2 `20/20`, I3 `25/25 FROZEN`, I4 `0/25`, I5 `0/15`.

## Último resultado real
I4-A retry1 run `32280348780`: el correctivo Service Worker funcionó hasta llevar la Shopper sintética por Firebase Auth → contexto Shopper → membership verified → app visible → HR authority `15 periodos / 660 visitas`. Sin page errors, console errors ni backend write attempts.

La ejecución se detuvo en Documentos por un selector de prueba demasiado genérico (`[data-doc]` eligió el `div` antes del botón). La ruta ya estaba visible; por tanto no hay defecto de Documentos demostrado.

## Preservado
Historical Shopper, I3, Admin TARGET_B, HR 15/660, Finance V2/historical y legal no se reabren.

## Siguiente bloque exacto
`NEW_AUTH_REQUIRED_I4A_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE_RETRY2__STABLE_SURFACE_SELECTORS__NO_SW` — autorizado por el turno actual; mismo scope seguro, un intento.
