# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-24  
**Estado:** `V174_ACTIVE_BASELINE_CORTE3_HOSTING_DEV_REMOTE_LIVE_SMOKE_PASS_PENDING_PAULA_VISUAL_NO_PRODUCTION`

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
- Gate de preservación R24: PASS, 1890/1895 hashes exactos, cinco drifts permitidos no funcionales y 0 drift funcional prohibido.

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
- Target HEAD: `357cdbc73467344557c0da113262bba4f6a976fc`.
- Request commit: `f415f23eb974b664181d1f618aa47e79ac99ed94`.
- Run: `30074835544`.
- Job: `89423207982`.
- Artifact: `8589444193`.
- Digest: `sha256:06188dc26dcba0a4e0b9b6fc4119ed32ca31d38462a6e513f177ab84cdba0deb`.
- Estado: `PASS_READONLY_POST_GATES`.

## 7. Causas raíz cerradas en el carril Hosting

### Preflight V174

`STALE_FULL_APP_HASH_INCLUDED_MUTABLE_DOCS_AND_APPROVED_DEV_ENTRY`

El verificador antiguo mezclaba runtime protegido, documentación viva y entry DEV. Se sustituyó por gate R24 sin permitir drift en módulos/core/index funcional.

### Smoke snapshot/live

`FROZEN_SNAPSHOT_GATE_CONFLATED_EXACT_CANONICAL_ROWS_WITH_LIVE_FAIL_CLOSED_REVIEW_ROWS`

El snapshot congelado exponía 42 filas exactas; el runtime live muestra además dos revisiones operativas explícitas. Gate R25 valida esa diferencia sin tratarlas como canónicas ni pagadas.

## 8. Hosting DEV — desplegado

- URL: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible&fresh=1`.
- Run: `30098823043`.
- Job: `89499452079`.
- Artifact: `8598747476`.
- Digest: `sha256:88d201f834ce1237384de5c916f8cce65442e4255a710e58a9ade64e3707b016`.
- Deploy Hosting DEV: success.
- Build-lock remoto: coincide.
- Endpoint HR remoto: source-safe, 14 periodos y 616 visitas.
- Snapshot/adapter financiero remoto: ready.
- Cloud Run deploy: 0.

## 9. Remote live smoke R25 — PASS

- Request commit: `cf86e115dde490fbb8c1d407482413411c9079e8`.
- Run: `30099476156`.
- Job: `89501621499`.
- Artifact: `8598990578`.
- Digest: `sha256:09c69c975a0933368b346d27218386b28421616adc039f3a37caf16ca8bbba12`.
- Contexto observable: `cxorbia/corte3-hosting-dev-visual = success`.
- Decisión: `PASS_CORTE3_HOSTING_DEV_AND_REMOTE_LIVE_SMOKE`.
- Ejecución: `remote_smoke_only`.
- Hosting redesplegado en este run: no.

Comprobaciones remotas:

- `visibleReady=true`;
- `financeReady=true`;
- 14 periodos y 616 visitas;
- mayo: 44 visitas;
- 42 filas exactas;
- 2 revisiones fail-closed;
- 32 exactas GT y 10 HN;
- 0 diferencias de monto;
- 0 pagos y 0 lotes;
- dashboard y exportación visibles;
- reporte: 2 filas, 8 columnas y 2 puntos de gráfica;
- Beneficios: cuatro KPI y detalle;
- shopper controlado: 3 liquidaciones y 0 pagadas.

Las dos revisiones conservan `reviewRequired=true`, `pending_financial_source`, `pending_source_confirmation` y `paymentConfirmed=false`.

## 10. Pendientes reales

- Validación visual de Paula en Admin y Shopper.
- PDF real: verificar gráfica y datos.
- Excel real: verificar formato operativo y datos.
- Responsive parcial.
- Copy visible de fuente.
- Corrección focalizada solo si aparece diferencia reproducible.
- Aprobación y freeze Corte 3.

## 11. Siguiente bloque exacto

`VALIDACIÓN VISUAL DE PAULA → CORRECCIÓN FOCALIZADA SI APLICA → REVALIDACIÓN PUNTUAL → APROBADO → FREEZE CORTE 3`.

No iniciar Corte 4 antes del freeze.

## 12. Clasificación

- **Reusable CXOrbia:** gate R24, overlay R24, smoke R25, revisiones fail-closed y modo smoke-only.
- **Exclusivo cliente:** conteos y conciliación TyA/Cinépolis.
- **Claude/prototipo:** sin corrección de módulos; P1/P2 visuales pendientes.
- **Academia:** inventario, vínculo exacto, revisión, liquidación, pago y DEV/producción separados.
- **Sin impacto Claude:** workflow, gates, requests y artifacts.

## 13. Estado seguro

Hosting DEV actualizado; sin producción, merge, Cloud Run deploy, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live, lotes ni pagos.
