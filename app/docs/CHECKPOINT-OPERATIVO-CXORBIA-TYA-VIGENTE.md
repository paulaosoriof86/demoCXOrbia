# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-04  
**Estado:** `V6_DERIVED_FILES_PROVISIONALLY_MATERIALIZED__EMPALME_NOT_APPROVED_NOT_COMPLETED__CLOUD_V7_HOLD__LAB_SOURCE_ONLY_PREPARED__NO_DEPLOY__NO_PRODUCTION`

## 1. Corrección obligatoria

No existe un empalme V6 aprobado y completado.

La rama viva contiene archivos derivados de V6 materializados provisionalmente, pero Paula no validó ni cerró ese empalme. La documentación anterior que decía `V6 empalmada` fue incorrecta y queda sustituida por este checkpoint.

## 2. Carril vigente

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- producción `tya-plataforma` intacta;
- deploy DEV: 0.

## 3. Cloud V7

- ZIP: `Prototype development request V7.zip`;
- SHA-256: `e834a5797230d246504e325cb7b3e3a48e44086b08a75f4a857470c89faad261`;
- archivos: 259;
- decisión: `HOLD_NO_SEND_TO_EMPALME`.

P0 comprobados:

1. el paquete completo sobrescribiría archivos vivos distintos de runtime, Shoppers y Finanzas;
2. el Login responsive se superpone en tablet y móvil.

Claude trabaja únicamente la corrección frontend estrecha.

## 4. Trabajo adelantado por ChatGPT

Sin interferir con Claude quedó materializado source-only:

### Contrato del runner

`backend/contracts/tya-dev-scenario-lab-runner-v1.json`

Define:

- cinco perfiles de prueba;
- estados Auth→cleanup;
- límites máximos de entidades `AUDIT-*`;
- fingerprints inicial/final;
- cleanup exacto;
- gates previos;
- modo actual sin ejecución ni writes.

### Schema de evidencia

`backend/contracts/tya-dev-scenario-lab-evidence-schema-v1.json`

Exige:

- source HEAD exacto;
- runId `AUDIT-*`;
- perfiles/pasos;
- fingerprints;
- cleanup;
- capturas con SHA-256;
- cero secretos, credenciales, PII y producción.

### Gate source-only

`tools/qa/tya-dev-scenario-lab-source-contract-gate.mjs`

Queda preparado para integrarse al próximo source/static final. No se ejecutó todavía mediante runner remoto.

### Matriz operativa

`MATRIZ-EJECUCION-LABORATORIO-ADMIN-SHOPPER-20260804.md`

Cierra el recorrido futuro de:

- Hoja de Ruta/Dashboard;
- Visitas/Disponibles;
- Postulaciones/ficha;
- asignación;
- Shoppers;
- Reservas;
- Finanzas;
- Mi Perfil/certificaciones/Mis Visitas/histórico/pagos Shopper;
- tres recargas/nueva pestaña;
- exportaciones;
- cleanup.

## 5. Dependencias antes de ejecutar el Laboratorio

1. delta Claude estrecho y corregido;
2. auditoría GO sin P0;
3. empalme aprobado/completado;
4. source/static final PASS;
5. único Hosting DEV autorizado;
6. autorización aplicable de escrituras temporales `AUDIT-*`;
7. snapshot de proveedor y cleanup exacto.

## 6. Carril de aplicación

```text
EXECUTION_LANE_READY_FOR_APPLY = false
V7_GO = false
SEND_TO_EMPALME = false
```

No se aplicará ningún delta antes de recibir la entrega corregida y completar el carril.

## 7. Siguiente secuencia

```text
CLAUDE ENTREGA DELTA ESTRECHO
→ AUDITORÍA FINAL
→ GO SIN P0
→ EMPALME APROBADO
→ SOURCE/STATIC FINAL + GATE DEL LABORATORIO
→ ÚNICO HOSTING DEV
→ LABORATORIO REAL
→ CLEANUP EXACTO
→ VALIDACIÓN HUMANA
→ CUTOVER AUTORIZADO
```

## 8. Estado seguro

- empalme V6 aprobado/completado: no;
- empalme V7: 0;
- browser/runtime: 0;
- provider reads/writes: 0;
- entidades `AUDIT-*`: 0;
- Hosting/Cloud Run: 0;
- Auth/Firestore/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge/producción: 0.

## 9. Clasificación

- **Reusable CXOrbia:** contrato, schema, gate, fingerprints y cleanup.
- **Exclusivo TyA:** matriz Admin/Operaciones + Shopper.
- **Claude/prototipo:** sin impacto; continúa frontend responsive.
- **Academia:** estructura visible y reproducible de prueba.
- **Sin impacto producción:** preparación source-only.
