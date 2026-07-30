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
- Hosting DEV de visualización existente = `cxorbia-backend-dev.web.app`, target `cxorbia-dev`.
- `tya-plataforma` = legacy a retirar + Hosting/URL pública final.
- sandbox C4 = no destino.
- proyecto padre `cinepolis`; meses son periodos.
- no crear otro Firebase/Hosting por rutina.

### Materialización y consumidor — PASS
R17N FINAL: 1,406/1,406 Firestore writes y 1,406/1,406 readback, mismatch 0. Grupos: foundation16 + legacy profiles120 + HR-current profiles5 + certifications77 + visits616 + liquidation controls572.

Identidad: 208/208 refs ready →194 perfiles canónicos únicos; 616/616 visitas con nombre real/target válido; 77/77 certificaciones con shopper válido.

P0 `P0_PROVEN_C5_CXDATA_PERIOD_MODEL_MISMATCH` corregido en `app/core/backend-firebase.js`. Re-smoke `30544595440`: source=firestore, fallback=false, projects=1, periods=14, visits=616, currentProjectId=cinepolis, currentPeriodId=2026-07, interface/read-only PASS, blockers=0.

### Preflight visual Corte 5
Paula autorizó un único redeploy **del Hosting DEV ya existente**. El preflight confirmó el mismo proyecto/target pero detuvo antes de desplegar:
- Hosting nuevo: no;
- Firebase nuevo: no;
- deploy: 0/1;
- autorización Hosting consumida: no.

Causa: Firestore real protegido exige Firebase Auth/claims; el login visible actual es selector de rol/sesión local, no autenticación provider. Publicar credenciales/tokens o PII en Hosting está prohibido. La autorización vigente excluye Auth writes/Rules deploy.

### Regla de identidad para producto/frontend
- source-safe protege repo/log/evidencia; no anonimiza la plataforma;
- Admin/Operativo deben ver identidad real conforme RBAC/Rules;
- Shopper solo su propia identidad/visitas/certificaciones;
- Cliente solo alcance permitido;
- no usar nombre como llave única de merge;
- no mostrar `Shopper protegido` como identidad permanente si backend ya expone nombre real.

### Próxima intervención de Claude
No nueva candidata.

Pendiente real: login Firebase auténtico compatible con la sesión/rol/persona/scope de CXOrbia. El selector de perfiles/demo no puede conceder acceso a Firestore protegido. No hardcodear passwords/tokens ni simular Auth.

Backend prepara primero la reconciliación Auth/RBAC exacta. Claude interviene con tarea focalizada por archivo/flujo cuando esté cerrada la matriz o si aparece P0 frontend reproducible.

### Backlog P1/P2
PDF/gráficas, Excel/formato, reportKit/copy y equivalencia de exportaciones siguen no bloqueantes.

### Academia/manuales
Fuente viva vs snapshot; identidad real vs source-safe; autenticación vs selección de rol; proyecto padre vs periodo; readback vs consumidor runtime; preflight fail-closed; write/readback; liquidación/control ≠ pago; RBAC y PII por rol.

### Estado seguro
Firestore writes históricos autorizados: 1,406. Bloque actual: Hosting deploy=0; Auth/Storage/HR/legacy writes=0; Rules/Functions deploy=0; deletes=0; pagos=0; merge=false; producción=false; Make/Gemini=0.
