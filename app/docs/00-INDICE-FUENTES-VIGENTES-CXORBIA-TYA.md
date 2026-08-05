# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-04  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V6_DERIVED_FILES_PROVISIONALLY_MATERIALIZED__EMPALME_NOT_APPROVED_NOT_COMPLETED__CLOUD_V7_HOLD__LAB_SOURCE_ONLY_PREPARED__NO_DEPLOY__NO_PRODUCTION`

## 0. Corrección prevalente

La expresión anterior `V6 empalmada` fue incorrecta.

Lo comprobable es:

- archivos derivados de V6 fueron materializados provisionalmente en la rama viva;
- Paula no aprobó ni cerró el empalme;
- no existe empalme V6 completado;
- no existe deploy DEV ni producción.

## 1. Lock vigente

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- baseline acumulativa única;
- producción `tya-plataforma` intacta.

Codex únicamente puede empalmar un delta exacto después de auditoría GO y sin P0. ChatGPT audita, prepara gates y ejecuta runtime/deploy solo con autorización aplicable.

## 2. Fuentes activas — orden obligatorio

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `AUDITORIA-REAL-CANDIDATA-CLOUD-V7-20260804-HOLD.md`;
3. `CAMBIOS-BACKEND-ADDENDUM-LABORATORIO-SOURCE-ONLY-PREPARATION-20260804.md`;
4. `backend/contracts/tya-dev-scenario-lab-runner-v1.json`;
5. `backend/contracts/tya-dev-scenario-lab-evidence-schema-v1.json`;
6. `MATRIZ-EJECUCION-LABORATORIO-ADMIN-SHOPPER-20260804.md`;
7. `PROMPT-CLOUD-V7-CORRECCION-VISUAL-LOGIN-ORBIT-20260804.md`;
8. `CAMBIOS-BACKEND-ADDENDUM-CLOUD-V6-SOURCE-STATIC-PASS-20260804.md`;
9. `MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json` como evidencia provisional, no como prueba de empalme aprobado;
10. `CAMBIOS-BACKEND-ADDENDUM-FORENSIC-CONTROL-PLANE-STABILIZATION-20260804.md`;
11. contratos activos de runtime y release slice;
12. `METODOLOGIA-PRUEBAS-EN-PLATAFORMA-REUTILIZABLE-DESDE-FINANZAS-20260804.md`;
13. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
14. `RESUMEN-PARA-CLAUDE.md`;
15. `PENDIENTES-PROTOTIPO.md`;
16. PR #7 y HEAD vivo.

## 3. Auditoría Cloud V7

Paquete:

- `Prototype development request V7.zip`;
- SHA-256 `e834a5797230d246504e325cb7b3e3a48e44086b08a75f4a857470c89faad261`;
- 259 archivos.

Decisión:

```text
HOLD_NO_SEND_TO_EMPALME
```

P0 comprobados:

1. el ZIP completo sobrescribiría archivos vivos distintos de `index.html`, `build-lock.js`, Shoppers y Finanzas;
2. el responsive del Login se superpone en `768×1024`, `412×915` y `390×844`, ocultando encabezado, países, perfil y parte de la primera tarjeta.

## 4. Trabajo adelantado en paralelo

Mientras Claude corrige únicamente frontend, quedó preparado source-only:

- contrato del runner real del Laboratorio;
- schema de evidencia;
- gate source-only del contrato;
- matriz Admin/Operaciones + Shopper;
- fingerprints;
- límites `AUDIT-*`;
- cleanup exacto;
- decisiones PASS/FAIL/P0 cleanup.

No se ejecutaron navegador, runtime, provider reads/writes, datos temporales ni deploy.

## 5. Carril de aplicación

`EXECUTION_LANE_READY_FOR_APPLY = false`.

- ZIP extraído: sí;
- rama viva consultada por GitHub autenticado: sí;
- checkout local autenticado: no, por resolución DNS del contenedor;
- decisión HOLD suficientemente probada: sí;
- aplicación autorizada: no.

## 6. Siguiente secuencia

```text
CLOUD CORRIGE V7
→ ENTREGA DELTA ESTRECHO DE 2 ARCHIVOS + MANIFEST + EVIDENCIAS
→ EXECUTION_LANE_READY
→ AUDITORÍA COMPARATIVA FINAL
→ SOLO SI GO Y SIN P0: APPLY_DELTA_DIRECTLY
→ SOURCE/STATIC FINAL, INCLUYENDO GATE DEL LABORATORIO
→ ÚNICO HOSTING DEV AUTORIZADO
→ LABORATORIO REAL
→ CLEANUP
→ VALIDACIÓN HUMANA
→ CUTOVER AUTORIZADO
```

## 7. Estado seguro

- empalme V6 aprobado/completado: no;
- empalme V7: 0;
- navegador/runtime del Laboratorio: 0;
- datos `AUDIT-*`: 0;
- Hosting/Cloud Run: 0;
- provider writes: 0;
- Firestore/Auth/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge/producción: 0.
