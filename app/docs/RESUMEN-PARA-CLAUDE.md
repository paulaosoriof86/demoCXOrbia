# RESUMEN-PARA-CLAUDE.md

## ESTADO VIGENTE — 2026-07-30

### Baseline
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- Corte 3 `CXORBIA-TYA-CORTE3-V182-20260729` permanece FROZEN.
- No V183/R33; no nueva candidata por rutina.

### Arquitectura
- `cxorbia-backend-dev` = backend DEV canónico y reutilizado.
- `tya-plataforma` = legacy a retirar + Hosting/URL pública final.
- sandbox C4 = no destino de materialización.
- proyecto padre `cinepolis`; meses son periodos.

### Materialización backend — PASS
R17N FINAL fue materializado en DEV con autorización exacta:
- Firestore writes: 1,406/1,406;
- readback: 1,406/1,406;
- mismatch: 0;
- foundation16 + perfiles legacy120 + perfiles HR5 + certificaciones77 + visitas616 + controles liquidación572;
- identidad HR revalidada 208/208;
- 201/201 shoppers canónicos existentes con nombre real visible;
- 196 links financieros exactos por `visitId`.

No se tocaron tenant update, 22 updates de perfiles existentes, 7 legacy holds, 1 cert hold, Agosto HN, deletes, pagos/lotes, Auth, Storage, HR, legacy RTDB, Hosting, merge ni producción.

### Post-compare proveedor/identidad — PASS
- 1,406/1,406 rutas presentes;
- proyecto padre `cinepolis` presente;
- 14 periodos canónicos;
- 616 visitas;
- 572 controles de liquidación;
- 77 certificaciones;
- 208/208 refs shopper;
- 194/194 perfiles canónicos únicos esperados;
- 616/616 visitas con nombre real y target shopper existente;
- 77/77 certificaciones con shopper existente;
- placeholders demo 0;
- payments/lots 0/0.

### P0 backend Corte 5 — RESUELTO TÉCNICAMENTE
P0 histórico: `P0_C5_CXDATA_PERIOD_MODEL_MISMATCH`.

Archivo backend localizado: `app/core/backend-firebase.js`.

Causa:
- el adapter convertía los documentos raíz `tenants/tya/projects` en periodos;
- no leía `tenants/tya/projects/cinepolis/periods`;
- podía conservar `currentPeriodId` stale/no canónico.

Corrección autorizada, commit `96cb7601559a76595d6203724a4bcf2d0b35b390`:
- `CX.data.periods` consume la subcolección canónica del proyecto activo;
- los project docs ya no son periodos;
- un `currentPeriodId` inválido se sustituye por el periodo activo/último canónico;
- interfaz `CX.data` preservada;
- no se tocaron módulos UI.

### Re-smoke read-only final — PASS
Run `30544595440`; artifact `8760141578`.

Resultado exacto del consumidor:
- `source=firestore`;
- `fallbackUsed=false`;
- interfaz preservada;
- projects=1;
- periods=14;
- visits=616;
- currentProjectId=`cinepolis`;
- currentPeriodId=`2026-07`;
- IDs adapter = IDs canónicos;
- read-only/writeMode disabled;
- blockers 0.

El primer intento post-fix `30544254033` mostró `periods=0` por una omisión del harness QA: el fake Firestore no incluía la colección `periods` aunque el mismo gate ya la había leído del proveedor y validado en 14. Se corrigió solo la instrumentación QA en `21ce464772bfe6543b3672ad4b6d7deafd564adc`; no hubo segundo runtime fix ni data writes.

### Regla de identidad para producto/frontend
- source-safe protege repo/log/evidencia; no anonimiza la plataforma;
- Admin/Operativo deben ver identidad real conforme RBAC/Rules;
- no usar nombre como llave única de merge;
- `Shopper protegido` no debe quedar como identidad permanente si backend ya expone nombre real.

### Lo que Claude NO debe hacer ahora
- no crear nueva candidata;
- no tocar backend/contracts/tools/workflows;
- no reabrir V182/Corte 3;
- no hardcodear Cinépolis;
- no crear fallback demo/local;
- no duplicar periodos en UI ni volver al modelo mes=proyecto;
- no activar providers, Auth, pagos o sincronización real;
- no pedir recertificación a quien tenga carryover válido.

### Próxima intervención de Claude
Ninguna por rutina. El siguiente paso es backend/QA: binding DEV read-only al backend canónico + un único Hosting DEV controlado + validación visual/operativa con datos reales.

Claude solo interviene si esa validación demuestra un P0 frontend reproducible y localizado. Si no, se congela Corte 5 y sigue Corte 6 Auth/RBAC.

Backlog P1/P2 preservado:
- PDF/gráficas de impresión;
- Excel con formato básico;
- consolidación reportKit/copy;
- equivalencia de alcance entre exportaciones.

### Academia/manuales
Actualizar con:
- fuente viva vs snapshot;
- identidad real vs artefacto source-safe;
- proyecto padre vs periodo;
- readback del proveedor vs smoke del consumidor runtime;
- preflight fail-closed;
- write + readback + re-smoke;
- liquidación/control ≠ pago;
- RBAC y visibilidad de PII por rol.

### Estado seguro
R17N: 1,406 Firestore writes autorizados ya ejecutados. Fix/re-smoke: provider reads solamente; Firestore/Auth/Storage/HR/legacy writes=0; deletes=0; pagos=0; deploy=0; merge=false; producción=false; Make/Gemini=0.
