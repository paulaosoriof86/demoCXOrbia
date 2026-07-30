# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `CORTE6_TECH_PASS__HUMAN_AUTH_VISUAL_PENDING__NO_FRONTEND_P0_PROVEN__NO_PRODUCTION`

Este archivo registra pendientes frontend reales y dependencias backend que condicionan cuándo Claude debe intervenir.

## 1. No reabrir
- M1 / Corte 1 / Corte 2A / Corte 3: FROZEN/APROBADO.
- Corte 3: `CXORBIA-TYA-CORTE3-V182-20260729`.
- R17N FINAL: 1,406/1,406 data writes/readback; no repetir.
- Corte 5: P0 proyecto/periodo resuelto y re-smoke PASS.
- Corte 6 Auth/RBAC: claims 5/5 PASS; operador7/cliente2/shopper3 ready.
- Firestore Rules: deploy/readback PASS.
- Hosting DEV existente: 1/1 deploy consumido, entrypoint remoto PASS.
- No nueva candidata/base/Hosting/rama/PR.

## 2. Dependencia viva — visual humana autenticada
Usar el URL DEV canónico:
`https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis`

Validar con cuentas DEV existentes:
1. Admin/Ops: proyecto/periodo/histórico/navegación.
2. Cliente: solo proyecto autorizado.
3. Shopper exacto: identidad real, historial y disponibles autorizadas.
4. Shopper no vinculado: sin acceso por inferencia.
5. Sin regresiones de postulaciones, visitas, certificación, finanzas, Academia/manuales.
6. Sin copy técnico de claims/provider/source-safe.

No compartir credenciales por chat.

## 3. Claude — intervención actual
**Ninguna por rutina. No solicitar nueva candidata.**

Solo abrir tarea si la visual demuestra P0 reproducible localizado en archivo/módulo/flujo. No mover Auth/claims/Firestore/Rules a UI.

## 4. P1/P2 no bloqueante
- PDF/gráficas.
- Excel/formato.
- `reportKit`/exportaciones transversales.
- copy de fuentes/readiness.

## 5. Agosto
- Fuente materializada hasta julio.
- `Agosto HN` sigue HOLD por inconsistencia país/tab.
- Después del PASS visual: FREEZE → refresh HR → resolver HOLD → materializar solo delta agosto.
- No rematerializar histórico.

## 6. Academia/manuales
Auth real vs selector; tenant/proyecto; shopperId exacto; mínimo privilegio; visita disponible segura; conflicto a revisión; CLI vs API; contenido estático exacto vs rewrite.

## 7. Estado seguro
PR #7 draft/open/no merge. Corte6: Auth claim writes5; usuarios nuevos/password/deletes0; Firestore data writes0; Rules release1 verificada; Hosting DEV1/1; Storage/HR/legacy0; pagos/Make/Gemini0; producción=false.
