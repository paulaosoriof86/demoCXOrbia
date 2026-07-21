# PENDIENTES-PROTOTIPO.md

> Lista viva de mejoras del prototipo CXOrbia. Actualizada 2026-07-21.
> P0 crítico · P1 importante · P2 posterior · [TyA] específico · [CX] reusable.

## CORTE 1B — V172 EMPALMADA

### Resuelto y preservado

- [Backend] HR viva read-only confirmada con cambios reales.
- [Backend] Refresco al cargar, `pageshow` y sondeo de 15 segundos desplegados.
- [Backend] Cuatro reportes operativos live preservados.
- [Claude/CX] V172 conserva reportKit, reportes multiformato, branding, gráficas, multiproyecto, Panorama, add-ons, Novedades y las correcciones principales de V170/V171.
- [Gobierno] Se retractó el supuesto bloqueo por falta de checkout local; no constituye P0 ni justifica nueva metodología.

### P0 identidad Shopper — resuelto en V172

- [PASS] `misvisitas.js`: sin fallback `sh1`; sin identidad, cero filas y cero acciones.
- [PASS] Sin `visitsForShopper`, usa `[]`; nunca abre `data.visitas()` global.
- [PASS] `reservas.js`: sin identidad, cero reservas y acciones.
- [PASS] `midia.js`: Mi Día y cronograma filtran exclusivamente por `shopperId`.
- [PASS] `app.js`: `sh1` únicamente bajo guard demo explícito; live/real conserva `shopperId:null`.
- [PASS] Shopper A ve solo A; Shopper B ve solo B; sin identidad no existe fuga.

### Pendiente operativo inmediato

- [PASS] `APPLY_DELTA_DIRECTLY` de V172 en `docs-tya-v6-v71-audit`.
- [PASS] Manifest, build-lock y verificador del build empalmado.
- [Empalme] Commit/push atómico y registro de `HEAD_AFTER`.
- [QA] Post-gates de regresión y equivalencia PDF/XLSX/PPTX.
- [DEV] Publicar Hosting DEV y ejecutar validación visual Admin/Cliente/Shopper.
- [Gobierno] Retirar workflow temporal después del PASS y congelar Corte 1 solo con `APROBADO`.

### P1/P2 preservados

- [QA visual] Verificar legibilidad y equivalencia final PDF/XLSX/PPTX.
- [Academia] Documentar selección de rol vs autenticación y diferencia entre oportunidades y visitas privadas después de aprobación visual.

### Fuente vigente

- `app/docs/AUDITORIA-CANDIDATA-V172-CORTE1B-20260721.md`.

### Cierre pendiente

`COMMIT/PUSH ATÓMICO V172 → POST-GATES → HOSTING DEV → VALIDACIÓN VISUAL → RETIRAR WORKFLOW TEMPORAL → FREEZE CORTE 1`
# Pendientes vigentes — V172 HR in-place

Estado: `V172_HR_INPLACE_APPLIED_PENDING_REMOTE_DEV_GATES`.

Completado localmente:
- Aplicación exacta de `files/`.
- Verificación SHA de los 14 archivos acumulados V172.
- `node --check` de 21 JS/MJS.
- PASS gate HR in-place local.
- Manifest/build-lock/verificador V172 regenerados.

Pendiente operativo:
- Commit/push atómico.
- Cloud Run DEV HR.
- Hosting DEV R22.
- Gate remoto con cambio HR ya existente reflejado sin `location.reload`, sin pantalla blanca y misma `sourceRevision` en Dashboard, KPI, Liquidaciones y Reportes.

Prohibiciones vigentes: no producción, no merge, no writes, no Make/Gemini, no pagos.
