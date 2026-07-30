# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-30  
**Estado:** `CORTE6_AUTH_RBAC_RULES_PASS__HOSTING_DEV_REDEPLOY1OF1_VERIFIED_DIRECT_ENTRYPOINT__WAITING_HUMAN_AUTH_VISUAL__NO_PRODUCTION`

## 1. Repositorio y destinos fijos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Hosting DEV existente: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- URL visual DEV canónico: `https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis`.
- Hosting público final: `tya-plataforma`; no tocar todavía.
- No nueva base/Hosting/rama/PR/candidata.

## 2. Baseline que no se reabre
- Corte 3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL DEV: 1,406/1,406 Firestore data writes y readback, mismatch0.
- Materializado: foundation16 + perfiles125 + certificaciones77 + visitas616 + controles liquidación572.
- Corte 5 `CX.data`: P0 proyecto/periodo corregido; re-smoke PASS source=firestore, fallback=false, projects1, periods14, visits616, currentProjectId=`cinepolis`, currentPeriodId=`2026-07`.
- No repetir los 1,406 writes.

## 3. Corte 6 Auth/RBAC — ejecutado y verificado
Autorización consumida en conversación actual: `Autorizo Corte 6: máximo 5 claims Auth + deploy exclusivo de Firestore Rules.`

Resultado:
- 5/5 custom-claim updates sobre usuarios existentes;
- 2 cliente +3 shopper con vínculo exacto;
- proyecto stale `tya`/`tya-piloto` normalizado a `cinepolis`;
- cuarto shopper sin vínculo exacto: no tocado;
- usuarios nuevos/password changes/deletes: 0/0/0;
- Auth readback: operadores ready7, clientes ready2, shoppers ready3, familias requeridas PASS.

Runtime seguro activo en el entrypoint DEV:
- `app/core/backend-browser-auth.js`: Firebase Email/Password interactivo, persistencia SESSION, claims como autoridad;
- `app/core/backend-config-preview-dev.js`: sin credenciales persistidas/fallback;
- `app/core/backend-firebase.js`: lecturas acotadas al principal autenticado;
- interfaz `CX.data` preservada;
- `app/modules/*` no reescrito por backend.

## 4. Firestore Rules — PASS
- Fuente desplegada reconoce `status='disponible'` y compatibilidad `estado` legacy.
- Firebase CLI falló por falta de `firebaserules.rulesets.test`, no por falta de permisos de creación/actualización de Rules.
- Se ejecutó por API oficial Firebase Rules sin ampliar IAM.
- Ruleset/release/readback SHA exacto: PASS.
- Firestore data writes en Corte 6: 0.

## 5. Hosting DEV existente — único redeploy consumido
La autorización previa del mismo Hosting DEV fue reutilizada, no solicitada nuevamente.

Resultado:
- nuevo Firebase: 0;
- nuevo Hosting: 0;
- Hosting deploy executions: **1/1**;
- autorización consumida: true;
- Firebase CLI quedó bloqueado por dependencia API Keys Viewer (`apikeys.keys.*`);
- diagnóstico read-only confirmó Hosting core IAM PASS;
- sin cambios IAM, el único deploy autorizado se ejecutó por API oficial Firebase Hosting;
- release `sites/cxorbia-backend-dev/releases/1785431702100000`;
- version `sites/cxorbia-backend-dev/versions/b00728c729452665`, FINALIZED;
- remote Corte6 proof/config/browser-auth/`index-backend-dev.html`: PASS.

El root `/` no es el entrypoint canónico porque Firebase Hosting prioriza el archivo estático exacto `app/index.html` sobre rewrites. Esto es no bloqueante; no autoriza otro deploy. La validación debe usar `/index-backend-dev.html`.

## 6. Gate vivo único — visual humana autenticada
`HUMAN_AUTHENTICATED_VISUAL_VALIDATION_ADMIN_OPS_CLIENT_SHOPPER`.

Validaciones requeridas:
1. Admin/Operativo ve `cinepolis`, 14 periodos/histórico correcto y navegación operativa.
2. Cliente solo ve su proyecto autorizado.
3. Shopper vinculado entra con identidad real, historial propio y disponibles autorizadas.
4. Shopper no vinculado no recibe acceso por inferencia.
5. Sin regresión en postulaciones, visitas, certificación, finanzas, Academia/manuales y navegación.
6. Sin copy técnico de claims/provider/source-safe en UI normal.

Las credenciales se ingresan solo directamente en navegador. No enviarlas por chat.

## 7. Agosto
- Fuente materializada llega hasta julio 2026: 14 periodos/616 visitas.
- `Agosto HN` sigue HOLD por inconsistencia país/tab.
- Después de PASS visual: FREEZE Corte6 → refresh HR → resolver HOLD → materializar solo delta agosto.
- No rematerializar histórico.

## 8. Claude / prototipo
- No nueva candidata.
- Solo abrir tarea localizada si la visual autenticada demuestra un P0 reproducible.
- P1/P2 preservados: PDF sin gráfica, Excel sin formato final, reportKit/exportaciones y copy de fuentes.

## 9. Academia
Actualizar manuales/rutas con:
- Auth real ≠ selector local de rol;
- claims tenant/proyecto como autoridad;
- `shopperId` exacto;
- visita disponible protegida;
- fail-closed y revisión humana;
- diferencias entre dependencia CLI y permisos reales del API;
- Hosting: contenido estático exacto precede rewrites.

## 10. Clasificación
- `Reusable CXOrbia`: browser Auth gate, principal-scoped reads, claims fail-closed, Rules canónicas, diagnóstico/API oficial Hosting.
- `Exclusivo cliente`: tenant `tya`, proyecto `cinepolis`, scopes stale, Agosto HN.
- `Claude/prototipo`: sin tarea hasta visual.
- `Academia`: Auth/RBAC, mínimo privilegio, Hosting/Rules gates.
- `Sin impacto Claude`: runners, requests, IDs release/version y evidencia source-safe.

## 11. Estado seguro
R17N previo: 1,406 Firestore data writes ya cerrados. Corte6: Auth claim writes5; usuarios nuevos/password/deletes0; Firestore data writes0; Rules release1 verificada; Hosting DEV1/1; Storage/HR/legacy0; payments0; Make/Gemini0; merge=false; producción=false; PII/secrets crudos0.

## 12. Siguiente bloque exacto
`VISUAL AUTENTICADA ADMIN/OPS/CLIENTE/SHOPPER → si PASS, FREEZE CORTE6 → REFRESH/RESOLVER AGOSTO → MATERIALIZAR SOLO DELTA AGOSTO → PREPROD/CUTOVER`.
