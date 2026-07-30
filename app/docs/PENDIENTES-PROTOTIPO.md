# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `CORTE6_TECH_PASS__HUMAN_AUTH_VISUAL_PENDING__NO_FRONTEND_P0_PROVEN__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- M1 / Corte 1 / Corte 2A: FROZEN/APROBADO.
- Corte 3: `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- R17N FINAL: 1,406/1,406 Firestore data writes/readback; no repetir.
- Corte 5 proyecto/periodo: corregido, re-smoke PASS.
- Corte 6 Auth/RBAC: 5/5 claim updates PASS; operador7/cliente2/shopper3 ready.
- Firestore Rules: desplegada/readback PASS.
- Hosting DEV existente: deploy 1/1 consumido y entrypoint explícito remoto PASS.
- No V183/R33, nueva base, Hosting, rama o PR.

## 2. Pendiente vivo único — validación visual autenticada
No hay P0 frontend demostrado. Antes de abrir tarea Claude debe validarse con cuentas DEV existentes en:
`https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis`

Validar:
1. Admin/Ops: proyecto, periodos/histórico y navegación correcta.
2. Cliente: solo proyecto autorizado.
3. Shopper exacto: identidad real, historial propio y disponibles autorizadas.
4. Shopper no vinculado: no obtiene acceso por inferencia.
5. Sin regresión en postulaciones, visitas, certificación, finanzas, Academia/manuales y navegación.
6. Sin copy técnico de claims/provider/source-safe.

Las credenciales se ingresan solo en navegador; no se pegan en chat.

## 3. Claude — intervención actual
**Ninguna por rutina. No solicitar nueva candidata.**

Solo abrir tarea si la visual demuestra P0 reproducible y localizado. No mover Auth/claims/Rules/backend a módulos UI.

## 4. Pendientes P1/P2 no bloqueantes
- PDF: gráfica ausente al imprimir/exportar.
- Excel: formato básico/no final.
- `reportKit`: consolidación transversal y exportaciones fuera de Dashboard.
- copy de fuentes/readiness: mantener lenguaje humano, no técnico.

No bloquear Corte6/agosto/cutover por estos puntos salvo P0 demostrado.

## 5. Agosto — dependencia backend/fuente
- Fuente materializada termina julio 2026.
- `Agosto HN` sigue HOLD por inconsistencia país/tab.
- Después del PASS visual: FREEZE Corte6 → refresh HR → resolver HOLD → validar visitas → materializar solo delta agosto.
- No construir agosto manualmente desde frontend y no repetir histórico.

## 6. Holds preservados
- existing profile updates22;
- legacy holds7;
- certification hold1;
- Agosto HN;
- deletes;
- pagos/lotes;
- Make/Gemini/Storage reales.

## 7. Academia/manuales
Actualizar Auth real vs selector visual, claims tenant/proyecto, shopperId exacto, mínimo privilegio, visita disponible protegida, conflicto a revisión, CLI vs API y exact-static vs rewrite.

## 8. Estado seguro
Corte6: Auth claim writes5; usuarios nuevos/password/deletes0; Firestore data writes0; Rules release1 verificada; Hosting DEV1/1; Storage/HR/legacy0; pagos/Make/Gemini0; merge=false; producción=false.
