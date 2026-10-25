# Tracker Phase A — candidata V105 / build interno V106

## Completado

- Gate de identidad frontend correcto.
- Delta V104→candidata verificado.
- Estructura y sintaxis: PASS.
- Manifest V105 y V106: FAIL reproducible.
- Smoke incluido evaluado con alcance real.
- Pruebas semánticas de Cliente, pagos, permisos y fixtures.
- Auditoría específica de Beneficios, Certificación, Finanzas, Historial, copy y Academia.
- Paquete neto para Claude preparado sin reabrir HECHO.
- R5 y plan Firestore R6 preservados.

## Avances a preservar

Histórico activo, preview financiero, fecha de pago, fail-closed geo, pending_backend de certificación, práctica sin evento, dos KPIs Dashboard, Historial de estados y archivo auditado.

## En progreso — Claude

- identidad/manifest;
- Portal Cliente source-honest;
- aislamiento seguro de fixtures;
- evidencia de pagos/lotes y privacidad Beneficios;
- permisos con contexto;
- certificación y segundo actor;
- Finanzas/copy;
- Academia explícita;
- smoke faltante y estados R6.

## Backend protegido

- R5 source-safe permanece baseline operativa.
- R6 plan Firestore permanece PASS y sin ejecución.
- No se usa la Firebase DEV no limpia.

## Gate

Candidata: HOLD.  
Empalme/source lock: HOLD.  
R6 plan: PASS.  
Materialización/deploy/import/producción: HOLD.

## Siguiente bloque exacto

1. Entregar a Claude el paquete neto y la respuesta cerrada de Academia.
2. Recibir una única candidata frontend completa.
3. Auditar solo el delta y verificar pendientes netos.
4. Empalmar contra R5/R6 solo si pasa.
5. Repetir smoke source-safe, roles, Cliente, Academia y móvil.
6. Continuar executor hard-disabled/base nueva limpia por carril backend.
