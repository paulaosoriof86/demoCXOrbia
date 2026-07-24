# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-24  
**Estado:** `V174_ACTIVE_BASELINE_CORTE3_CANONICAL_FINANCE_UI_EXPORT_TECHNICAL_PASS_PENDING_HOSTING_DEV_VISUAL_NO_PRODUCTION`

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
- Hosting DEV anterior preservado: 14 periodos, 616 visitas y 34 GT/10 HN por periodo.
- Módulos V174, lectura HR source-safe, adapters y `CX.data`: preservados.

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
- Entrada: `app/index-backend-dev.html`.
- `CX.data` conserva su interfaz.
- Finanzas y Beneficios consumen `CX.liq.forProject()` desde la misma verdad.
- `visitContract()` falla cerrado con `paymentState=pending_source_confirmation`.
- No se modificaron `app/modules/**`, `app/core/**` ni `app/index.html` en el bloque de gate.

## 6. Gate remoto UI/export — PASS

- Perfil: `CORTE3_CANONICAL_FINANCE_UI_EXPORT_R23`.
- Target HEAD validado: `357cdbc73467344557c0da113262bba4f6a976fc`.
- Request commit: `f415f23eb974b664181d1f618aa47e79ac99ed94`.
- Run: `30074835544`.
- Job: `89423207982`.
- Artifact: `8589444193`.
- Digest: `sha256:06188dc26dcba0a4e0b9b6fc4119ed32ca31d38462a6e513f177ab84cdba0deb`.
- Estado: `PASS_READONLY_POST_GATES`.
- Commit status: `cxorbia/readonly-post-gates/overall = success`.

Comprobaciones principales:

- fuente visible y snapshot financiero listos;
- 14 periodos y 616 visitas;
- mayo 2026: 44 visitas HR y 42 filas financieras exactas;
- 2 casos no exactos conservados en revisión;
- 42/42 filas financieras del periodo consumidas por UI;
- 32 GT y 10 HN;
- 0 pagos y 0 lotes;
- 0 diferencias de monto;
- export spec: 2 países, 8 columnas y 2 puntos de gráfica;
- Beneficios: honorarios, reembolsos, por cobrar y pagado;
- shopper controlado: 3 liquidaciones y 0 pagadas.

## 7. Correcciones focalizadas del carril

1. Se restauró el binding source-safe V174 en la entrada DEV.
2. Se corrigió el generador R15G que cortaba un texto en un punto y coma interno y producía JavaScript inválido.
3. Se agregó validación sintáctica obligatoria del adapter generado.
4. Se bloquearon service workers en el gate para impedir recargas destructivas del navegador.
5. Se separó inventario HR de filas financieras exactas.
6. Se demostró que el falso delta provenía únicamente de `.tmp/`.
7. `.tmp/` se excluye localmente con `.git/info/exclude`; el guard de archivos rastreados permanece intacto.

## 8. Pendientes reales

- Hosting DEV del mismo build: requiere autorización específica.
- Smoke remoto del mismo build.
- Validación visual de Paula.
- PDF real: verificar gráfica.
- Excel real: verificar formato operativo.
- Responsive parcial y copy `sourceAccessMode`: P1/P2 preservados.

## 9. Siguiente bloque exacto

`AUTORIZACIÓN ESPECÍFICA DE HOSTING DEV → PUBLICAR EL MISMO BUILD → SMOKE REMOTO → VALIDACIÓN VISUAL DE PAULA → CORRECCIÓN FOCALIZADA SI APLICA → FREEZE CORTE 3`.

No iniciar Corte 4 antes del freeze.

## 10. Clasificación

- **Reusable CXOrbia:** adapter único, pagos fail-closed, separación inventario/filas financieras, review queues, gate UI/export y evidencia efímera sin debilitar guardas.
- **Exclusivo cliente:** conteos y conciliación TyA/Cinépolis.
- **Claude/prototipo:** sin corrección de módulos demostrada; pendientes P1/P2 de PDF, Excel, responsive y copy de fuente.
- **Academia:** inventario, vínculo exacto, revisión, liquidación, pago, honorario, boleto, combo y exportación como conceptos separados.
- **Sin impacto Claude:** correcciones de runner, build, service worker del gate y `.tmp/`.

## 11. Estado seguro

Sin merge, Hosting nuevo, deploy productivo, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live, lotes ni pagos.
