# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Corrección prevalente:** 2026-08-04  
**Estado:** `V6_DERIVED_FILES_PROVISIONALLY_MATERIALIZED__EMPALME_NOT_COMPLETED__CLOUD_V7_HOLD__LAB_SOURCE_ONLY_PREPARED__NO_DEPLOY__NO_PRODUCTION`

## 1. Objetivo

Poner en producción un primer corte operativo sobre una sola baseline acumulativa:

`ADMIN/OPERACIONES + SHOPPER`.

Portal Cliente continúa en carril paralelo y no bloquea este primer corte.

## 2. Estado real de la candidata frontend

No existe un empalme V6 aprobado/completado.

Cloud V7 fue auditada y quedó:

`HOLD_NO_SEND_TO_EMPALME`.

P0:

1. paquete completo fuera del alcance estrecho;
2. Login responsive superpuesto en tablet y móvil.

## 3. Arquitectura de validación

```text
AUTH_READY
→ CLAIMS_READY
→ MEMBERSHIP_READY
→ DATA_READY
→ SHELL_READY
→ ROUTE_READY
→ VIEW_READY
→ DOMAIN_READY
→ SCENARIO_READY
→ SCENARIO_EXECUTED
→ CROSS_MODULE_VERIFIED
→ CLEANUP_VERIFIED
```

## 4. Trabajo adelantado source-only

Ya quedaron preparados:

- contrato del runner del Laboratorio;
- schema de evidencia;
- matriz Admin/Operaciones + Shopper;
- fingerprints;
- política `AUDIT-*`;
- cleanup exacto;
- gate source-only.

No se ejecutaron navegador, runtime, provider reads/writes ni deploy.

## 5. Primer release slice

Validar después del único deploy DEV:

- Hoja de Ruta e histórico;
- Dashboard;
- Visitas y Disponibles;
- Postulaciones y ficha;
- Shoppers;
- Reservas/asignación;
- Finanzas Phase A;
- Mi Perfil, certificaciones, Mis Visitas, histórico y pagos Shopper.

## 6. Secuencia obligatoria

```text
CLAUDE CORRIGE V7
→ DELTA ESTRECHO + MANIFEST + EVIDENCIAS
→ EXECUTION_LANE_READY
→ AUDITORÍA FINAL
→ GO SIN P0
→ APPLY_DELTA_DIRECTLY
→ SOURCE/STATIC FINAL + GATE DEL LABORATORIO
→ ÚNICO HOSTING DEV AUTORIZADO
→ LABORATORIO REAL
→ CLEANUP EXACTO
→ CHECKPOINT VISUAL HUMANO
→ FREEZE DEL SLICE
→ CUTOVER AUTORIZADO
```

## 7. Prohibiciones

- no describir materialización provisional como empalme;
- no enviar ZIP completo a Codex;
- no empalme fragmentado ni selección improvisada;
- no runtime antes de candidata final y deploy único;
- no datos `AUDIT-*` sin autorización aplicable y snapshot;
- no segundo deploy ni reintento automático;
- no Make/Gemini/pagos sin bloque propio;
- no producción antes de cleanup y validación humana.

## 8. P0 que sí bloquean

- app no inicia;
- Admin/Operaciones o Shopper no autentican;
- HR viva inconsistente;
- ruta esencial inexistente;
- pérdida/corrupción/fuga cross-tenant;
- secreto expuesto;
- write/deploy no autorizado;
- flujo operativo Phase A imposible;
- cleanup no restaura el baseline.

## 9. Estado seguro

- empalme aprobado/completado: no;
- Hosting/Cloud Run: 0;
- browser/runtime: 0;
- provider writes: 0;
- entidades `AUDIT-*`: 0;
- merge/producción: 0.

## 10. Clasificación

- **Reusable CXOrbia:** control plane, runner contract, evidence schema, fingerprints y cleanup.
- **Exclusivo TyA:** release slice y matriz operativa.
- **Claude/prototipo:** corrección frontend V7.
- **Academia:** laboratorio visible y trazabilidad.
- **Sin impacto producción:** preparación source-only.
