# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_HUMAN_VISUAL_P0_PROVEN__CANONICAL_DOMAIN_AND_FINANCE_FIX_CODE_PASS__LIVE_HR_ROW_AUDIT_PASS__PENDING_DEV_DEPLOY__NO_PRODUCTION`

## 1. Repo/destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Hosting DEV site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocada.

## 2. Baseline protegida — no reabrir
- Corte3 FROZEN; R17N 1,406/1,406;616 visitas +572 liquidaciones +77 certificaciones. No repetir.
- Corte5: cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil protegido Firestore120 docs/329 campos WRITE+READBACK PASS, mismatches0.
- Finanzas/pagos canónicos source-safe preservados.

## 3. Hosting anterior y reclassificación
La autorización `chat-20260731-c6-stable-cumulative-hosting-02` fue consumida con exactamente1 Hosting DEV y provider/data writes0. El remote smoke confirmó paridad de assets e idempotencia sintética, pero **no probó consistencia semántica transversal**. Permanece como evidencia técnica, no como cierre de Corte6.

## 4. Human visual — P0 probado
Las capturas posteriores al deploy demostraron:
- KPIs superiores JUL correctos:44 visitas, GT34/HN10, realizadas40, cuestionario38, submitidas33, fuera de rango accionable1;
- flujo por fases mostrando solo7 realizadas;
- comparativo MAY/JUN vacío;
- salto de contenido y sidebar durante refresh;
- fuente210 shoppers frente a219 filas, con identidad/histórico dividido;
- perfiles completos sin campos mínimos, credenciales/WA/histórico;
- certificación no visible en Admin;
- Shopper Paula: Activas1/Historial0/Beneficios vacío pese a histórico visible en Admin;
- periodo MAY visible con contenido financiero/liquidaciones de JUL;
- Finanzas históricas sin proyección coherente a Movimientos/Liquidaciones/Beneficios;
- Liquidaciones mostrando solo7 filas porque33 visitas submitidas eran omitidas por un switch literal.

Corte6 continúa FAIL y no se congela.

## 5. Causas raíz
- varias máquinas de estado antiguas coexistían con `canonicalFacets`;
- el composer anterior anexaba perfiles protegidos no vinculados exactamente al listado HR;
- el watcher restauraba selects DOM fuera del modelo y preservaba contenedores de scroll equivocados;
- “perfil completo” dependía de flags, no de campos reales;
- `Mis Visitas` elegía como máximo una visita por estado literal;
- periodo, identidad y finanzas no compartían una única proyección canónica;
- `CX.liq.estadoFromVisita` no reconocía `submitida`, por lo que la mayoría del ciclo financiero desaparecía.

## 6. Root fix en rama viva — todavía no desplegado
Nuevos:
- `app/adapters/tya-cumulative-read-model-v2.js`;
- `app/adapters/tya-canonical-state-semantics-v2.js`;
- `app/adapters/tya-live-source-refresh-watch-v2.js`;
- `app/adapters/tya-c6-domain-consistency-bridge.js`;
- `app/adapters/tya-canonical-finance-read-model-v2.js`;
- `tools/qa/tya-c6-domain-consistency-regression-gate.mjs`;
- `tools/qa/tya-c6-canonical-finance-read-model-gate.mjs`.

Tocado:
- `app/index-backend-dev.html` para cargar el nuevo runtime DEV.

No se modificó `/app/modules/*` ni `/app/core/*`.

Contratos:
- HR manda periodos/visitas/estado operativo;
- una sola faceta canónica alimenta KPIs, fases, detalle, portal Shopper y liquidaciones;
- perfiles sin crosswalk exacto quedan fuera del listado operacional y pasan a revisión;
- no dedupe por nombre/teléfono/email;
- perfil completo exige nombre+contacto+usuario+contraseña;
- mismo contenido HR no produce render;
- cambio real produce un apply+compose+render preservando `.content`, `#rail`, periodo, proyecto y vista;
- fuera de rango histórico y accionable son conceptos separados;
- toda visita realizada entra a Liquidaciones; una submitida sin cruce queda visible y bloqueada para lote/pago.

## 7. Gates finales — PASS
La evidencia read-only v4 registra:
- `PASS_C6_CANONICAL_DOMAIN_CONSISTENCY`;
- `PASS_C6_CANONICAL_FINANCE_LIQUIDATION_COMPLETENESS`;
- `PASS_C6_LIVE_HR_ROW_LEVEL_CANONICAL_STATE`.

Sobre HR viva:
-14 periodos;
-616 visitas;
-208 shoppers HR;
-JUL44: GT34/HN10;
-realizadas40;
-cuestionario38;
-submitidas33;
-liquidationCandidates33;
-fuera de rango accionable1;
-evidencias históricas fuera de rango7;
-duplicateVisitKeys0;
-duplicateShopperIds0.

El gate financiero representativo prueba40 visitas realizadas presentes en Liquidaciones,33 submitidas no omitidas,5 pendientes de submit,2 pendientes de cuestionario, fuentes exactas preservadas y ejecución de pagos deshabilitada.

Evidencia: `app/docs/evidence/CORTE6-LIVE-HR-DOMAIN-READONLY-AUDIT-LATEST.json`.

## 8. Identidad, credenciales y WhatsApp
El patrón configurable existente permite derivar username/password en la vista DEV únicamente para identidades canónicas exactas. Esto no crea Auth ni persiste contraseñas.

WhatsApp debe venir de HR/perfil protegido; no se fabrica. Complementar/materializar perfiles, credenciales, contacto, historial o certificación en Firestore/Auth requiere un write plan y autorización futura específica.

## 9. Gate exacto
El código correctivo está en GitHub, no en Hosting DEV. La autorización anterior está consumida y no se reutiliza.

Secuencia:
`AUTORIZACIÓN FRESCA 1x HOSTING DEV → REMOTE SMOKE SEMÁNTICO → HUMAN VISUAL ACUMULATIVA → FREEZE C6 → AGOSTO`.

No Cloud Run previsto para este root fix. Ningún deploy se ejecuta sin autorización fresca.

## 10. Estado seguro
Bloque actual: Hosting0; Cloud Run0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes0; nuevos Firebase/Hosting0; merge=false; producción=false.

## 11. Documentación vigente
- `CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-P0-CANONICAL-DOMAIN-ROOT-FIX-20260731.md`;
- `CAMBIOS-BACKEND-ADDENDUM-C6-FINANZAS-LIQUIDACIONES-CANONICAS-20260731.md`;
- `ACADEMIA-IMPACTO-C6-DOMINIO-CANONICO-Y-ESTADOS-ACCIONABLES-20260731.md`;
- evidencias P0, dominio, finanzas y auditoría HR viva;
- índice, Phase A, tracker, Claude y pendientes reconciliados.
