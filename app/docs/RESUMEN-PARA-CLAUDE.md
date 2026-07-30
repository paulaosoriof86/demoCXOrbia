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
R17N FINAL fue materializado en DEV con autorización exacta.

Resultado:
- Firestore writes: 1,406/1,406 autorizados;
- readback: 1,406/1,406;
- mismatch: 0;
- foundation 16;
- perfiles legacy 120;
- perfiles HR actuales 5;
- certificaciones 77;
- visitas 616;
- controles liquidación 572;
- identidad HR revalidada 208/208;
- 201/201 shoppers canónicos existentes tienen nombre real visible;
- 196 links financieros exactos preservados por visitId.

No se tocaron tenant update, 22 updates de perfiles existentes, 7 legacy holds, 1 cert hold, Agosto HN, deletes, pagos/lotes, Auth, Storage, HR, legacy RTDB, Hosting, merge ni producción.

### Causa raíz del preflight
Dos intentos previos quedaron HOLD `live_identity_207` con writes=0. Era un bug del gate: colapsaba espacios internos antes del hash, distinto al algoritmo R20. Se alineó el executor con R20 (`trim + lowercase`) y el preflight pasó 208/208 antes de escribir.

### Regla de identidad para producto/frontend
- source-safe protege repo/log/evidencia; no anonimiza la plataforma;
- Admin/Operativo deben ver identidad real conforme RBAC/Rules;
- no usar nombre como llave única de merge;
- no mostrar `Shopper protegido` como identidad permanente si backend ya expone nombre real;
- en el materializado actual los 201 targets canónicos existentes ya tienen nombre real visible y los 120+5 perfiles nuevos se escribieron con identidad real aplicable desde fuente.

### Lo que Claude NO debe hacer ahora
- no crear nueva candidata;
- no tocar backend/contracts/tools/workflows;
- no reabrir V182/Corte 3;
- no hardcodear Cinépolis;
- no crear fallback demo/local;
- no activar providers, Auth, pagos o sincronización real;
- no pedir recertificación a quien tenga carryover válido.

### Próxima intervención de Claude
Ninguna por rutina. Primero backend ejecutará `POST-COMPARE READ-ONLY → SMOKE CX.data CANÓNICO + IDENTIDAD REAL`.

Claude solo interviene si ese smoke demuestra un P0 frontend reproducible o después, para backlog P1/P2:
- PDF/gráficas de impresión;
- Excel con formato básico;
- consolidación reportKit/copy;
- cualquier ajuste visual exacto detectado en smoke.

### Academia/manuales
Actualizar posteriormente con:
- fuente viva vs snapshot;
- identidad real vs artefacto source-safe;
- preflight fail-closed;
- write idempotente + readback;
- liquidación/control ≠ pago;
- RBAC y visibilidad de PII por rol.

### Estado seguro
Firestore writes autorizados ejecutados: 1,406. Auth/Storage/HR/legacy writes=0; deletes=0; pagos=0; deploy=0; merge=false; producción=false; Make/Gemini=0.
