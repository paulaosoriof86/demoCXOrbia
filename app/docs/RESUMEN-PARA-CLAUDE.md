# RESUMEN-PARA-CLAUDE.md

## ESTADO VIGENTE — 2026-07-30

**Estado:** `CORTE6_AUTH_RBAC_RULES_PASS__HOSTING_DEV_REDEPLOY1OF1_VERIFIED_DIRECT_ENTRYPOINT__WAITING_HUMAN_AUTH_VISUAL__NO_PRODUCTION`

### Baseline no reabrir
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Corte 3 `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- R17N FINAL: 1,406/1,406 Firestore data writes/readback PASS; no repetir.
- Corte 5 `CX.data`: project=`cinepolis`, periods=14, visits=616, currentPeriod=`2026-07`, source=firestore/fallback=false PASS.
- No V183/R33, nueva candidata, base, Hosting, rama o PR por rutina.

### Corte 6 backend — PASS
Ya existe autenticación Firebase real en el entrypoint DEV protegido:
- `app/core/backend-browser-auth.js`: Email/Password interactivo, SESSION, claims como autoridad;
- `app/core/backend-config-preview-dev.js`: sin password/email persistidos;
- `app/core/backend-firebase.js`: lecturas por principal autenticado;
- `app/index-backend-dev.html`: carga Auth real antes del adapter;
- `firestore.rules`: `status` canónico + compatibilidad `estado` legacy para disponible shopper.

Proveedor:
- claims 5/5 actualizados: 2 cliente +3 shopper exactos;
- cuarto shopper sin vínculo: no tocado;
- usuario nuevo/password/delete: 0/0/0;
- readiness: operador7, cliente2, shopper3;
- Firestore data writes Corte6: 0;
- Rules deploy verificado por API oficial.

### Hosting DEV — desplegado y verificado
Se reutilizó el Hosting DEV existente `cxorbia-backend-dev`, target `cxorbia-dev`.
- nuevo Firebase/Hosting: 0/0;
- único redeploy autorizado: 1/1, consumido;
- release `sites/cxorbia-backend-dev/releases/1785431702100000`;
- version `sites/cxorbia-backend-dev/versions/b00728c729452665`, FINALIZED;
- remote proof/config/browser Auth y `/index-backend-dev.html`: PASS.

Firebase CLI tenía dos dependencias de permisos que no reflejaban fallas del API real: Rules `firebaserules.rulesets.test` y Hosting API Keys Viewer. Se usaron APIs oficiales con permisos ya existentes, sin ampliar IAM.

El root `/` sirve `app/index.html` por precedencia de contenido estático exacto antes de rewrites. Esto no bloquea; el URL DEV canónico es:
`https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis`

### Claude — intervención actual
**Ninguna por rutina. No solicitar nueva candidata.**

Ahora corresponde validación humana autenticada. Solo si aparece un P0 reproducible se abre tarea focalizada por archivo/módulo/flujo. No mover Auth/claims/Rules/backend a módulos UI.

Validar visualmente:
1. Admin/Ops: `cinepolis`, periodos/histórico y navegación correcta.
2. Cliente: solo proyecto autorizado.
3. Shopper exacto: identidad real, historial propio y disponibles autorizadas.
4. Shopper no vinculado: sin ampliación por inferencia.
5. Sin regresión en postulaciones, visitas, certificación, finanzas, Academia/manuales.
6. Sin copy técnico de claims/provider/source-safe.

No pedir ni recibir credenciales por chat; se ingresan directamente en navegador.

### Backlog P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones fuera de Dashboard;
- copy de fuentes/readiness.

No bloquean Corte6/agosto/cutover salvo que se demuestre P0 Phase A.

### Agosto
Fuente actual llega a julio. `Agosto HN` continúa HOLD por inconsistencia país/tab. Después de PASS visual: freeze Corte6 → refresh HR → resolver HOLD → materializar solo delta agosto.

### Academia/manuales
Actualizar Auth real vs selector local; tenant/proyecto; shopperId exacto; mínimo privilegio; visitas disponibles protegidas; CLI vs API proveedor; exact-static vs rewrite.

### Estado seguro
Corte6: Auth claim writes5; usuarios nuevos/password/deletes0; Firestore data writes0; Rules release1 verificada; Hosting DEV1/1; Storage/HR/legacy0; pagos/Make/Gemini0; merge=false; producción=false.
