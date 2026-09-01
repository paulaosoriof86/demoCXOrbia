# CAMBIOS-BACKEND — RC15 F4 G2-B RECOVERY — 2026-08-26

**Bloque:** `F4_G2B_RECOVERY_ONE_SHOT`  
**Estado terminal:** `CLOSED_PASS_RECOVERY_PASS_FULL_READONLY_RECERTIFIED`  
**PHASE_A:** `98/100`  
**PRODUCTION_REAL_READINESS:** `81/100`

## Secuencia causal completa

1. `1f636b79954ab0a5474f7f1ca16a7701c0f64edf`: reactivación focal del workflow existente; run `33027014684` skipped antes de job por `job if` frágil. Sin provider side effect.
2. `3b4cd772bb36418cfacd6798fdfb25bba2e05175`: autoridad F4 PASS; source validation falló por aserción sobre archivo equivocado.
3. Incidente histórico de materialización: `39680648...` creó `__noop__`; restaurado inmediatamente por fast-forward `6c770487...`, delta neto cero y sin provider effect.
4. `1a5006dc46003517358411c7bd7681951f81e85d`: corrigió ownership; otro `grep` frágil produjo falso negativo.
5. `7f4e51dcfa7c1d275b788d369e3c1b0b3e8691c9`: REPAIR-4 sustituyó greps por validación semántica Node.
6. Run F4 `33032334162`: autoridad, source, GCP y provider preflight PASS.
7. `af59bc65bf36d0c43cd14bd23eea007b1dc79ed7`: consumo único del lease al iniciar Cloud Build.
8. Build `79883a26-7118-4fa7-9947-3198a45b1661` PASS; Cloud Run `00012-gw9` PASS; smoke directo PASS; Hosting deploy PASS.
9. Readback inmediato Hosting falló por contenido no estabilizado. Se cerró correctamente como `MECHANISM_P0 — POST_HOSTING_READBACK_NOT_STABILIZED`, sin `PRODUCT_P0`.
10. `e8a2b75cdacb6a199aa7a4b9808058e00161208d`: materializó el STOP terminal y bloqueó replay/F5.
11. Paula autorizó el siguiente bloque read-only con `continúa con el siguiente bloque`.
12. `ed282aa8932d259cf5340f8007fc22fa90b2ef34`: el mismo workflow existente se reconvirtió en certificador read-only y se agregó autorización estructurada `F4-G2B-READONLY-RECERTIFICATION-20260826-01`. Delta exacto: solo workflow + auth; sin runtime/source/producto.
13. Run `33034673610`: **SUCCESS completo**. No hizo Build, deploy, update, lease ni comando sintético autenticado.

## Resultado terminal de recertificación

Artefacto `9631562023`, digest `sha256:53beff90e3766c3aa491b2c300a2ef0e85b83d59bd1ad071ebf280eb3737e342`.

PASS:
- Cloud Run revision `cxorbia-live-hr-dev-00012-gw9`;
- image digest `sha256:4e2cd8cbd8d7b28a2abada2ea5060b58691f5582e871220afe141c4824027970`;
- 100% tráfico;
- health G2-B ready/enabled/synthetic-only;
- Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`;
- Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`;
- source adapter SHA-256 = remote adapter SHA-256 = `9d69d0d0db42e3f2b93cc893f2da1ed0b2e753403d3f46a9a8537dbe994c82b0`;
- Hosting API POST no autenticado = 401 `G2B_SYNTHETIC_AUTHORIZATION_REQUIRED`;
- residuo sintético = cero en visits/postulations/receipts/audit/shoppers/Auth.

Decisión acumulativa: `F4_READONLY_RECERTIFICATION_PASS_FULL` y `RECOVERY_PASS_FULL`.

## Seguridad

Intento mutante original: Build 1/1, Run update 1/1, Hosting deploy 1/1, lease consumido una vez.  
Recertificación: provider mutations=0, Build=0, Run update=0, Hosting deploy=0, lease issue/reuse=0, authenticated synthetic commands=0, Firestore/Auth/Storage/HR/datos/credenciales/pagos/Rules/Make/Gemini/merge=0.

Durante este bloque se produjo una segunda llamada equivocada contra la rama histórica preexistente `__invalid_noop__`: creó `backend/config/__temp_never_use__` vacío y fue eliminado inmediatamente en esa misma rama. No tocó la rama viva, no creó rama/PR y no produjo provider side effect. Delta neto cero.

## Clasificación

- **Reusable CXOrbia:** post-deploy certification con stabilization polling, exact source hash, release binding y readback cero-residuo.
- **Exclusivo cliente TyA:** release F4 sobre `cxorbia-backend-dev`.
- **Claude/prototipo:** sin cambio frontend funcional.
- **Academia:** sin impacto funcional.
- **Sin impacto Claude:** workflow read-only, autoridad, evidencia y docs.

## Siguiente exacto

`F5_WAITING_EXPLICIT_SYNTHETIC_ACCEPTANCE_AUTHORIZATION`.

F5 requiere autorización específica nueva; no se inicia por continuidad automática.
