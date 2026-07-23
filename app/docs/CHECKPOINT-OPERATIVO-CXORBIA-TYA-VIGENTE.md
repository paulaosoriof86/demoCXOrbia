# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-23  
**Estado:** `V174_R20_M1_TECHNICAL_PASS_HOSTING_DEV_DEPLOYED_VISUAL_REVIEW_PENDING`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama obligatoria: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- No nueva rama, PR, `main` ni force push.
- Producción, merge, imports, pagos y writes reales: no ejecutados.

## 2. V174 y source lock

- Package SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- Commit funcional V174: `b21e494d127fb4b902de5576e3fab0292362b097`.
- Corrección focalizada V174: `0acdc6772f2d4a7743dea0992a4279241dcb79d7`.
- Source-lock funcional final: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- Aggregate vigente: `ab11bc47dfd096cbe6a110db250c46e656c2dc9760ad832c07958b6c9a886818`.
- Manifest y `app/core/build-lock.js`: regenerados y verificados.
- Backend, adapters live, contratos operativos, overlays y `CX.data`: preservados.

## 3. Gates técnicos

PASS antes del Hosting DEV:

- builder y variantes R20;
- inventario source-safe;
- HR live in-place;
- contexto, histórico y reportes;
- proyecto, periodo y KPI R20;
- Corte 2A canonical;
- M1 regression lock;
- verificador V174 sobre source lock final.

## 4. Hosting DEV ejecutado

- Autorización actual: `correcto, procede`.
- Alcance: Hosting DEV visual solamente.
- Cloud Run redeploy: no.
- Workflow run: `30027204176`.
- Job: `89274577170`.
- Artifact: `8571796399`.
- Artifact digest: `sha256:50ef940bb7ab52f0fac318cd23f6c4e233f4581fee0a1035c8d936abb7e42a9e`.
- Firebase Hosting DEV: deploy SUCCESS.
- URL: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible&fresh=1`.
- Build-lock remoto = build-lock local: PASS.
- Endpoint HR vivo predeploy y postdeploy: PASS.
- Runtime read/source-safe: PASS.
- HR writes, Firestore/Auth/Storage writes, imports, pagos y producción: 0/false.

## 5. Lectura remota comprobada

- Periodos: 14.
- Visitas históricas: 616.
- Cada periodo: 44 visitas.
- Split por periodo: GT 34 + HN 10.
- Julio 2026: 44 visitas, 43 asignadas, 1 sin asignar, 29 realizadas, 28 cuestionarios, 20 submitidas y 0 pagos confirmados.
- Cambio de periodo: 14/14 periodos con 44 filas.

## 6. HOLD no bloqueante para revisión visual

El gate remoto mostró `sourceAccessMode=public_gviz_csv_cache_busted` en la telemetría de la aplicación, aunque el endpoint same-origin respondió `runtimeRead=true`, `sourceSafe=true`, `periods=14`, `visits=616` y revisión fresca estable.

Clasificación: pendiente técnico de identidad/label de fuente para cierre productivo; no impide abrir el Hosting DEV ni comprobar visualmente datos y navegación.

## 7. Phase A

- M1/Corte 1: PASS técnico.
- V174/Corte 2A: PASS técnico.
- HR viva e histórico: desplegados en DEV y verificables visualmente.
- Estado actual: `TECHNICAL_PASS_HOSTING_DEV_VISUAL_PENDING`.
- Próximo bloque: revisión visual focalizada por Paula; solo un NO GO reproducible abre corrección.

## 8. Revisión visual exacta

1. Login y roles.
2. Proyecto y periodo.
3. Dashboard e histórico.
4. Visitas de julio: 44, GT 34/HN 10 y estados coincidentes con HR.
5. Portal Admin, Cliente y Shopper.
6. Reportes y Academia.

## 9. Clasificación

- **Reusable CXOrbia:** source lock, despliegue DEV de composite exacto y evidencia remota.
- **Exclusivo cliente:** conteos HR TyA/Cinépolis GT-HN.
- **Claude/prototipo:** V174 preservada; no se solicita nueva candidata.
- **Academia:** lectura viva, integridad histórica y separación entre gate técnico y validación visual.
- **Sin impacto Claude:** workflow de Hosting DEV, Firebase target y evidencia de Actions.

## 10. Estado seguro

Sin merge, deploy productivo, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
