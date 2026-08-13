# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-13 05:21 -06:00  
**Estado:** `M8_PASS__PHASE_A_96__M9_PROVIDER_PRECUTOVER_NEXT__NO_PRODUCTION`

## Bloque ejecutado

Se cerró `M8 — Human validation + rollback ready` mediante una ejecución real de Chromium sobre DEV, con principal canónico `B=admin`, HR viva, siete rutas requeridas, dos reconciliaciones frescas y rollback-readiness fail-closed. No se registró aceptación de confidencialidad en nombre del usuario: el gate humano quedó intacto y la validación downstream utilizó únicamente instrumentación QA efímera en navegador.

## M8 — PASS

Request `m8-human-validation-rollback-ready-20260813-08` → commit `098cc860ce497a1e1017528ef6072ef218753fa0` → run `31694998731` / job `94430661554` / artifact `9178957729` / digest `sha256:296a404470dc692d2b01679550d2e19b3429ca281f7c9333655ebf3bb8b1f85b`.

Decisión final: `PASS_M8_HUMAN_VALIDATION_ROLLBACK_READY_READONLY`.

PASS demostrado:
- principal `admin/staff/tya/cinepolis`, membership verificada;
- `runtimeSourceMode=live_hr_runtime`;
- HR viva `2025-06 → 2026-08`, 15 periodos y 660 visitas;
- `protectedProfiles=197`, `identityMapSize=211`, `identityReviewCount=0`;
- duplicados de visitas=0 y duplicados de shopperId=0;
- siete rutas PASS: dashboard, proyectos, visitas, postulaciones, certificación, financiero y Academia;
- separación de roles PASS: Admin ve Financiero y no expone Beneficios Shopper;
- dos reconciliaciones HR frescas PASS, 660→660→660, agregados=0, eliminados=0;
- console/page/HTTP/request errors=0;
- source/build lock preservado y runtime app parity con M7=true;
- rollback source gate `PASS_M8_ROLLBACK_READINESS_SOURCE_GATE` con estado `READY_FAIL_CLOSED_FOR_M9_PROVIDER_CAPTURE`.

## Causa raíz de la cláusula de confidencialidad

Se aisló y cerró el bucle: `CX.confidencialidad.pending(admin)` era el gate esperado anterior al montaje del router. El mecanismo de aceptación es browser-local; QA no aceptó la cláusula, no escribió localStorage y no alteró el producto. Para validar la lógica posterior al gate sin registrar consentimiento, se montó el router únicamente en la sesión efímera QA y se dispararon los handlers de navegación DOM bajo el overlay esperado. El producto y la experiencia humana normal quedaron intactos.

## Archivos creados/tocados en este cierre

- `tools/qa/tya-m8-human-validation-rollback-ready-browser-v2.mjs`: correcciones focales del instrumento M8; sin cambio de producto/UI.
- `.github/workflows/cxorbia-m8-human-validation-readonly.yml`: ejecución final M8 sobre el workflow existente.
- `backend/config/m8-human-validation-readonly-execute.json`: request one-shot M8 final; no volver a ejecutar M8 tras PASS salvo drift reproducible.
- `app/docs/evidence/m8-human-validation-rollback-ready-31694998731.json`: evidencia durable sanitizada.
- índice/checkpoint/tracker/CAMBIOS/RESUMEN/PENDIENTES: actualización a M8 PASS / Phase A 96%.

No se modificó `/app/modules`, `/app/core`, UI visual ni la interfaz pública de `CX.data` para cerrar M8.

## Seguridad

Confidentiality consent by QA=false; browser localStorage writes by QA=0; provider writes=0; Hosting deploys=0; Cloud Run deploys=0; Auth/Firestore/HR/Rules/Storage writes=0; Make/Gemini/pagos=0; merge=false; producción=false; credenciales/tokens expuestos=false.

## Progreso Phase A

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=5/5 | M8=3/3 | M9=0/3 | M10=0/1`

**TOTAL CERTIFICADO=96% | RESTANTE=4% | DELTA CERTIFICADO M8=+3 puntos.**

## No reabrir

C6/M7, Exact Write V2, private handoff, D rebase, provider snapshot, Auth340, SKIP13, MultiAuth, HR/M4 y M8 quedan cerrados salvo drift nuevo reproducible.

## Siguiente frontera exacta

`M9`: primero capturar en modo provider read-only la release/version exacta actualmente productiva y verificar una ruta de rollback soportada por el proveedor, ligando cualquier promoción futura al source/build lock exacto probado por M8. Si capture o rollback capability no pueden verificarse, STOP antes de producción. La promoción productiva sigue requiriendo gate explícito independiente. Después, `M10` será smoke/freeze final.

## Clasificación

- **Reusable CXOrbia:** patrón de validación downstream detrás de gates humanos sin registrar consentimiento y rollback fail-closed.
- **Exclusivo cliente:** TyA DEV, tenant `tya`, proyecto `cinepolis`, HR viva 2025-06→2026-08.
- **Claude/prototipo:** cero cambio frontend requerido; no tocar módulos por el gate de confidencialidad.
- **Academia:** puede documentarse el gate humano de confidencialidad y la validación de las siete rutas, sin mecanismos internos QA.
- **Sin impacto Claude:** workflow/runner/evidencia/rollback-readiness backend.
