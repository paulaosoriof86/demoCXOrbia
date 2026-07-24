# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-24  
**Estado:** `V174_ACTIVE_BASELINE_CORTE3_HOSTING_DEV_DEPLOYED_REMOTE_LIVE_SMOKE_PENDING_NO_PRODUCTION`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama obligatoria: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- No nueva rama, PR, `main` ni force push.
- Producción, merge, imports, pagos y writes reales: no ejecutados.

## 2. Baseline V174 preservada

- V174/M1/Corte 1/Corte 2A: PASS técnico y visual aprobado.
- Package SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- Commit funcional V174: `b21e494d127fb4b902de5576e3fab0292362b097`.
- Source lock visual: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- Módulos V174, lectura HR source-safe, adapters y `CX.data`: preservados.
- Gate de preservación R24: PASS, 0 drift funcional prohibido.

## 3. Identidad estable de visita

Versión: `tya-stable-visit-id-r20-row-identity-v1`.

Campos canónicos:

`tenantId + projectId + periodKey + country + sourceRow`.

Cinema, shopping, quincena, franja, shopper, fechas y montos no forman parte de la identidad.

## 4. Corte 3 — conciliación y snapshot canónico

- visitas HR: 616;
- filas financieras: 247;
- vínculos exactos: 209;
- filas sin vínculo exacto: 38;
- montos canónicos listos: 207;
- revisiones de vínculo: 79;
- revisiones de monto: 2;
- evidencias candidatas de ledger: 37;
- pagos confirmados: 0;
- lotes: 0.

Los conflictos no se resolvieron ni sobrescribieron silenciosamente.

## 5. Adapter único DEV

- Snapshot: `app/data/tya-financial-canonical-source-safe*.js`.
- Adapter: `app/adapters/tya-financial-canonical-source-safe-adapter.js`.
- `CX.data` conserva su interfaz.
- Finanzas y Beneficios consumen `CX.liq.forProject()` desde la misma verdad.
- `visitContract()` falla cerrado con `paymentState=pending_source_confirmation`.
- No se modificaron `app/modules/**`, `app/core/**` ni `app/index.html` en Git.

## 6. Gate técnico UI/export — PASS

- Perfil: `CORTE3_CANONICAL_FINANCE_UI_EXPORT_R23`.
- Target HEAD validado: `357cdbc73467344557c0da113262bba4f6a976fc`.
- Request commit: `f415f23eb974b664181d1f618aa47e79ac99ed94`.
- Run: `30074835544`.
- Job: `89423207982`.
- Artifact: `8589444193`.
- Digest: `sha256:06188dc26dcba0a4e0b9b6fc4119ed32ca31d38462a6e513f177ab84cdba0deb`.
- Estado: `PASS_READONLY_POST_GATES`.

## 7. Primer preflight de Hosting — HOLD seguro

- Run `30098219557`, job `89497455866`.
- Autorización exacta: PASS.
- Fallo: verificador V174 full-app obsoleto incluyó documentación mutable y entry DEV aprobado.
- Deploy ejecutado: no.
- Causa raíz documentada y gate R24 aplicado.

## 8. Hosting DEV — desplegado

- Run: `30098823043`.
- Job: `89499452079`.
- Artifact: `8598747476`.
- Digest: `sha256:88d201f834ce1237384de5c916f8cce65442e4255a710e58a9ade64e3707b016`.
- Step de deploy Hosting DEV: success.
- URL: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible&fresh=1`.
- Build-lock remoto: coincide.
- Endpoint HR previo y remoto: ready, source-safe, 14 periodos y 616 visitas.
- Snapshot financiero remoto: ready.
- Adapter financiero remoto: ready.
- Cloud Run deploy: 0.

## 9. HOLD del smoke remoto y causa raíz

El gate R23 terminó HOLD en la comparación `44/42`:

- 44 visitas HR live;
- 42 filas financieras exactas;
- 2 filas operativas no exactas expuestas deliberadamente como revisión fail-closed.

Las dos filas adicionales cumplen:

- `reviewRequired=true`;
- `financialSourceStatus=pending_or_review`;
- `liquidationState=pending_financial_source`;
- `paymentState=pending_source_confirmation`;
- `paymentConfirmed=false`.

No son filas canónicas, no están pagadas y no entran a lotes. El problema estaba en reutilizar una expectativa del snapshot congelado sobre el runtime live.

Causa raíz:

`FROZEN_SNAPSHOT_GATE_CONFLATED_EXACT_CANONICAL_ROWS_WITH_LIVE_FAIL_CLOSED_REVIEW_ROWS`.

## 10. Corrección focalizada

- Gate nuevo: `tools/qa/tya-corte3-remote-live-finance-smoke-r25-gate.mjs`.
- Workflow existente con `executionMode=remote_smoke_only`.
- La siguiente ejecución no redespliega Hosting.
- Exige 42 exactas + 2 revisiones fail-closed, 0 pagos y 0 diferencias de monto.

## 11. Pendientes reales

- Ejecutar solicitud aislada `remote_smoke_only`.
- Obtener smoke remoto R25 PASS.
- Validación visual de Paula.
- PDF real: verificar gráfica.
- Excel real: verificar formato operativo.
- Responsive parcial y copy `sourceAccessMode`: P1/P2 preservados.

## 12. Siguiente bloque exacto

`SOLICITUD AISLADA REMOTE_SMOKE_ONLY → SMOKE REMOTO R25 → VALIDACIÓN VISUAL DE PAULA → CORRECCIÓN FOCALIZADA SI APLICA → FREEZE CORTE 3`.

No iniciar Corte 4 antes del freeze.

## 13. Clasificación

- **Reusable CXOrbia:** preservación de runtime separada de docs; snapshot vs live; revisiones fail-closed; smoke-only sin redeploy.
- **Exclusivo cliente:** conteos y conciliación TyA/Cinépolis.
- **Claude/prototipo:** sin corrección de módulos; pendientes P1/P2 preservados.
- **Academia:** fila exacta, fila en revisión, liquidación y pago son conceptos diferentes.
- **Sin impacto Claude:** workflow, gates y evidencias.

## 14. Estado seguro

Hosting DEV actualizado; sin producción, merge, Cloud Run deploy, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live, lotes ni pagos.
