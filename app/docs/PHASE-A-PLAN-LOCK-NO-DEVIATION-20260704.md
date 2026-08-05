# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Corrección prevalente:** 2026-08-04  
**Estado:** `V6_DERIVED_FILES_PROVISIONALLY_MATERIALIZED__EMPALME_NOT_COMPLETED__LAB_SOURCE_CONTRACT_PASS__CLOUD_V7_1_HOLD__NO_DEPLOY__NO_PRODUCTION`

## 1. Objetivo

Poner en producción un primer corte operativo sobre una sola baseline acumulativa:

`ADMIN/OPERACIONES + SHOPPER`.

Portal Cliente continúa en carril paralelo y no bloquea este primer corte.

## 2. Estado frontend

No existe empalme V6 aprobado/completado.

Cloud V7.1 fue auditada y quedó:

`HOLD_NO_SEND_TO_EMPALME`.

P0:

1. `#login` mantiene flex/centrado/padding heredados bajo 900 px;
2. clipping lateral y contenido fuera del scroll real en 390/412 px;
3. evidencias de viewport incompletas e inválidas.

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

## 4. Laboratorio — source contract PASS

Materializado:

- contrato del runner;
- schema de evidencia;
- matriz Admin/Operaciones + Shopper;
- fingerprints;
- política `AUDIT-*`;
- cleanup exacto;
- gate source-only;
- integración del gate al perfil source/static acumulativo.

Ejecución comprobada:

- run `30971991900`;
- artifact `8916850770`;
- digest `sha256:75953c600b68450a11cfac6667ac5b5cfa8eceea5c94a6a0856850a501e77dd8`.

Decisiones:

```text
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

No se ejecutaron navegador, runtime, credenciales, provider reads/writes ni deploy.

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
CLOUD V7.2
→ DELTA ESTRECHO + MANIFEST + EVIDENCIAS
→ EXECUTION_LANE_READY
→ AUDITORÍA FINAL
→ GO SIN P0
→ CODEX SOLO EMPALME
→ SOURCE/STATIC FINAL + GATE LAB
→ ÚNICO HOSTING DEV AUTORIZADO
→ LABORATORIO REAL
→ CLEANUP EXACTO
→ CHECKPOINT VISUAL HUMANO
→ FREEZE DEL SLICE
→ CUTOVER AUTORIZADO
```

## 7. Prohibiciones

- no describir materialización provisional como empalme;
- no enviar candidata HOLD a Codex;
- no empalme fragmentado;
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

- **Reusable CXOrbia:** runner combinado, contratos, schema, fingerprints y cleanup.
- **Exclusivo TyA:** release slice y matriz operativa.
- **Cloud/prototipo:** corrección frontend V7.2.
- **Academia:** laboratorio visible y trazabilidad.
- **Sin impacto producción:** source-only.
