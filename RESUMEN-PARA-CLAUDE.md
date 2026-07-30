# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `CORTE6_AUTH_RBAC_RULES_PASS__HOSTING_DEV_REDEPLOY1OF1_VERIFIED_DIRECT_ENTRYPOINT__WAITING_HUMAN_AUTH_VISUAL__NO_PRODUCTION`

## 1. No reabrir
- Corte 3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL: 1,406/1,406 Firestore data writes/readback; no repetir.
- Corte 5 `CX.data`: `cinepolis`, 14 periodos, 616 visitas, `currentPeriodId=2026-07`, source=firestore/fallback=false PASS.
- No nueva candidata, rama, PR, Firebase o Hosting por rutina.

## 2. Corte 6 backend — PASS
- Firebase Auth real interactivo en `index-backend-dev.html`.
- Claims son autoridad; selector visual de rol no concede acceso backend.
- `CX.data` conserva su interfaz y carga por principal autenticado.
- 5/5 claims actualizados sobre cuentas existentes: cliente2 + shopper3 exactos.
- Cuarto shopper sin vínculo exacto: no tocado.
- Readiness: operador7, cliente2, shopper3.
- Usuario nuevo/password/delete: 0/0/0.
- Firestore data writes Corte6: 0.
- Firestore Rules `status` canónico + `estado` legacy: desplegada y readback PASS.

## 3. Hosting DEV existente — PASS técnico
- `cxorbia-backend-dev`, target `cxorbia-dev`.
- Nuevo Firebase/Hosting: 0/0.
- Redeploy autorizado: 1/1 consumido.
- Release `sites/cxorbia-backend-dev/releases/1785431702100000`.
- Version `sites/cxorbia-backend-dev/versions/b00728c729452665`, FINALIZED.
- Remote proof/config/browser Auth/entrypoint explícito: PASS.
- Root `/` sigue sirviendo `app/index.html` por precedencia de contenido estático exacto; no bloquea y no justifica redeploy.

URL DEV canónico:
`https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis`

No solicitar ni compartir credenciales por chat.

## 4. Claude — regla actual
**No nueva candidata. No intervención frontend por rutina.**

Abrir tarea focalizada solo si la validación humana autenticada demuestra P0 reproducible. No mover Auth/claims/Firestore/Rules a `app/modules/*`.

Validar:
1. Admin/Ops ve proyecto/periodo/histórico correcto.
2. Cliente solo proyecto autorizado.
3. Shopper exacto ve identidad/historial/disponibles autorizadas.
4. Shopper no vinculado no recibe acceso por inferencia.
5. Sin regresiones en postulaciones, visitas, certificación, finanzas, Academia/manuales y navegación.
6. Sin copy técnico de claims/provider/source-safe.

## 5. P1/P2 preservado
- PDF sin gráfica final;
- Excel sin formato final;
- reportKit/exportaciones transversales;
- copy de fuentes/readiness.

No bloquean Phase A salvo P0 demostrado.

## 6. Agosto
Fuente materializada hasta julio. `Agosto HN` HOLD por inconsistencia país/tab. Tras PASS visual: freeze Corte6 → refresh HR → resolver HOLD → materializar solo delta agosto.

## 7. Academia/manuales
Auth vs selector; tenant/proyecto; shopperId; mínimo privilegio; visitas disponibles protegidas; CLI vs API oficial; contenido estático exacto vs rewrite.

## 8. Estado seguro
PR #7 draft/open/no merge. Corte6: Auth claim writes5; usuarios nuevos/password/deletes0; Firestore data writes0; Rules release1 verificada; Hosting DEV1/1; Storage/HR/legacy0; pagos/Make/Gemini0; producción=false.
