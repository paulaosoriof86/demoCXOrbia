# PENDIENTES PROTOTIPO — V159 PREFLIGHT SEMÁNTICO

Fecha: 2026-07-17

## Cerrado

- Empalme V159.
- Gates estructurales.
- Preflight semántico estático de proyecto/periodo/HR/histórico.
- Restauración exacta de workflows/gate alterados durante el intento fallido.
- Comparación neta contra el checkpoint técnico previo: cero archivos modificados.
- P0 demostrado: no.

## Pendiente exacto

1. Ejecutar el workflow manual R15G restaurado con `DEPLOY_DEV_ROOT_R15G`.
2. Publicar únicamente el build V159 exacto en Hosting DEV.
3. Ejecutar browser gate de proyecto/periodo/KPI/histórico.
4. Ejecutar smoke remoto Admin, Shopper, Cliente y Academia.
5. Validar visualmente login, tenant, proyecto, periodos, histórico, visitas y cambio real de datos.
6. Clasificar cualquier hallazgo por capa antes de enviarlo a Claude.
7. Congelar `ACTIVE_BASELINE` si no existe P0.

## No reabrir

No solicitar V160 ni reabrir backend, adapter, mapping, importadores, contratos, empalme o auditoría general desde cero.

No existe pendiente frontend nuevo derivado de la restauración técnica.
