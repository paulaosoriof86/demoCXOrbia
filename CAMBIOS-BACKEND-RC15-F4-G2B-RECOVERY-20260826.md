# CAMBIOS-BACKEND — RC15 F4 G2-B RECOVERY — 2026-08-26

**Bloque:** `F4_G2B_RECOVERY_ONE_SHOT`  
**Estado terminal:** `TERMINAL_STOP_MECHANISM_P0_POST_HOSTING_READBACK_NOT_STABILIZED`  
**PHASE_A:** `98/100`  
**PRODUCTION_REAL_READINESS:** `76/100`

## Secuencia causal completa

1. `1f636b79954ab0a5474f7f1ca16a7701c0f64edf`: reactivación focal del mismo workflow bajo autoridad F4. Run `33027014684` quedó `skipped` antes de job por un `job if` frágil. Cero provider/lease/build/deploy.
2. `3b4cd772bb36418cfacd6798fdfb25bba2e05175`: eliminación del `job if`. Run `33027275374`: autoridad F4 PASS; source validation falló antes de GCP por una aserción sobre archivo equivocado.
3. Incidente de materialización: `39680648d300c2069085fc1ab6443463f64cf161` creó accidentalmente `__noop__`; se restauró inmediatamente por fast-forward `6c770487e89c7fe365b9ae86c840ae1dc1a03a50`. Tree neto restaurado, sin force push ni provider side effect.
4. `1a5006dc46003517358411c7bd7681951f81e85d`: corrigió ownership de la aserción. Run `33028658553`: autoridad PASS, pero otro `grep` frágil sobre regex produjo falso negativo antes de GCP/provider/lease.
5. `7f4e51dcfa7c1d275b788d369e3c1b0b3e8691c9`: `REPAIR-4`, sustitución de greps por validador Node semántico. El run `33032334162` pasó autoridad + source-fix + GCP + provider preflight.
6. `af59bc65bf36d0c43cd14bd23eea007b1dc79ed7`: el runner consumió el lease single-use exactamente en el borde de la primera mutación, después del preflight PASS.

## Resultado del único intento F4

- Provider preflight READ_ONLY: PASS; revisión inicial `cxorbia-live-hr-dev-00011-f2f`; residuo sintético preflight 0 en visits/postulations/receipts/audit/shoppers/Auth.
- Cloud Build 1/1: PASS. Build `79883a26-7118-4fa7-9947-3198a45b1661`.
- Image digest: `sha256:4e2cd8cbd8d7b28a2abada2ea5060b58691f5582e871220afe141c4824027970`.
- Cloud Run update 1/1: PASS. Revisión `cxorbia-live-hr-dev-00012-gw9`, 100% tráfico.
- Cloud Run direct smoke: PASS. Health G2-B ready/enabled/synthetic-only; POST no autenticado 401 `G2B_SYNTHETIC_AUTHORIZATION_REQUIRED`.
- Hosting deploy 1/1: PASS; release reportado completo a `2026-08-27T02:10:47.4141157Z`.
- Hosting post-readback: FAIL. Empezó `2026-08-27T02:10:47.4560513Z` y terminó con exit 1 `2026-08-27T02:10:47.7764434Z`.
- Provider post-readback: NOT_EXECUTED.

## Forense del STOP

Artefacto `9630749950`, digest `sha256:cff4f04ad10347ebdafe6389a128edc1cc3d88fcb2a993c61d326006b9f178cc`, contiene 13 archivos. `firewall.remote.js` existe, pero no contiene `YES_PAULA_20260820_G2B_SYNTHETIC` ni `cxorbia-command-http-transport-v1.js`. El source-fix exacto `1d2cfecba0a89b637398d747a628e549d9823c68` sí contiene ambos.

El artefacto no contiene `g2b-hosting-unauthorized.json`, por lo que el run falló durante la validación del adapter estático y **antes** de ejecutar el POST de prueba contra Hosting.

Causa terminal: `MECHANISM_P0 — POST_HOSTING_READBACK_NOT_STABILIZED`. El mecanismo de verificación no esperaba/reintentaba por mismatch de contenido ni ligaba la respuesta al release recién desplegado. La evidencia no demuestra `PRODUCT_P0`; tampoco permite certificar el estado de Hosting después de la propagación.

## Seguridad / budget terminal

Lease `F4-G2B-PROVIDER-LEASE-20260826-01`: consumido single-use. Cloud Build=1/1, Cloud Run update=1/1, Hosting deploy=1/1, automatic retry=0/0. No se ejecutó comando sintético autenticado.

Firestore/Auth/Storage/HR externa/datos reales/credenciales/pagos/Rules/Make/Gemini/merge = 0. El residuo sintético preflight fue certificado en cero; el post-recovery no quedó certificado porque el provider post-readback no se ejecutó.

Durante este cierre documental hubo una llamada equivocada sobre la rama histórica preexistente `__invalid_noop__` que creó el archivo vacío `__should_not_use__`; fue eliminado inmediatamente en esa misma rama. No tocó `docs-tya-v6-v71-audit`, no creó rama/PR y no tuvo side effect provider.

## Clasificación

- **Reusable CXOrbia:** post-deploy certification debe tener stabilization/content retry y binding al release antes de declarar mismatch terminal.
- **Exclusivo cliente TyA:** run F4 G2-B y proyecto `cxorbia-backend-dev`.
- **Claude/prototipo:** sin modificación frontend funcional.
- **Academia:** sin impacto funcional.
- **Sin impacto Claude:** control-plane/evidence/docs.

## Siguiente exacto

No reintentar F4, no emitir otro lease, no iniciar F5. Estado: `WAITING_EXPLICIT_PLAN_CHANGE_OR_READONLY_RECERTIFICATION_DECISION`. Cualquier nueva mutación provider requiere autorización explícita y el cambio de plan correspondiente; una eventual recertificación read-only no puede desplegar ni reutilizar el lease consumido.
