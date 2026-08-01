# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_HUMAN_VISUAL_P0_PROVEN__DOMAIN_FINANCE_SHOPPER_PORTAL_FIX_PASS__LIVE_HR_AUDIT_PASS__PENDING_DEV_DEPLOY__NO_PRODUCTION`

## 1. Repo/destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- DEV `cxorbia-backend-dev`; Hosting DEV `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocada.

## 2. Baseline protegida — no reabrir
- Corte3 FROZEN; R17N1,406/1,406;616 visitas +572 liquidaciones +77 certificaciones. No repetir.
- Corte5:14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil protegido Firestore120 docs/329 campos WRITE+READBACK PASS.
- Finanzas/pagos canónicos source-safe preservados.

## 3. Human visual — FAIL P0
El Hosting anterior pasó assets/idempotencia, pero las capturas probaron:
- Dashboard44/40 correcto y fases con7 realizadas;
- comparativo histórico vacío;
- saltos de contenido/sidebar;
- fuente210 shoppers frente a219 filas e identidades divididas;
- perfiles completos sin campos mínimos/certificación/histórico;
- portal Shopper Activas1/Historial0/Beneficios vacío;
- periodos financieros desincronizados;
-33 submitidas omitidas de Liquidaciones.

El PASS anterior se conserva como evidencia técnica, no como freeze. Corte6 sigue abierto.

## 4. Causas raíz
- máquinas de estado literales duplicadas;
- perfiles protegidos sin crosswalk exacto anexados a operación;
- watcher con select DOM separado del modelo y scroll equivocado;
- completitud por flag heredado;
- portal reducido a una visita por estado;
- identidad/periodo/finanzas sin read model único;
- switch de liquidación sin `submitida`.

## 5. Root fix en rama viva — no desplegado
- `tya-cumulative-read-model-v2.js`;
- `tya-canonical-state-semantics-v2.js`;
- `tya-live-source-refresh-watch-v2.js`;
- `tya-c6-domain-consistency-bridge.js`;
- `tya-canonical-finance-read-model-v2.js`;
- `tya-canonical-shopper-portal-v2.js`;
- gates de dominio, finanzas y portal Shopper;
- `app/index-backend-dev.html` conectado al runtime v2.

No se modificó `/app/modules/*` ni `/app/core/*`.

Contratos:
- HR manda periodos/visitas/estado;
- una faceta canónica alimenta KPIs, fases, detalles, portal y liquidaciones;
- unmatched profiles quedan fuera de operación y en review queue;
- no dedupe por nombre/teléfono/email;
- perfil completo exige nombre+contacto+usuario+contraseña;
- portal usa identidad exacta e histórico completo;
- certificación y datos exactos se muestran cuando existen;
- toda visita realizada entra a Liquidaciones; sin fuente exacta queda visible y bloqueada para lote/pago;
- mismo contenido HR no rerenderiza;
- cambio real genera1 apply+1 compose+1 render preservando `.content`, `#rail`, periodo, proyecto y vista.

## 6. Gates finales — PASS
Evidencia v5:
- `PASS_C6_CANONICAL_DOMAIN_CONSISTENCY`;
- `PASS_C6_CANONICAL_FINANCE_LIQUIDATION_COMPLETENESS`;
- `PASS_C6_CANONICAL_SHOPPER_PORTAL_CONTRACT`;
- `PASS_C6_LIVE_HR_ROW_LEVEL_CANONICAL_STATE`.

HR viva:
-14 periodos/616 visitas/208 shoppers;
-JUL44=GT34/HN10;
-realizadas40;
-cuestionario38;
-submitidas33;
-liquidationCandidates33;
-fuera de rango accionable1;
-evidencia histórica7;
-duplicate visit/shopper IDs0.

## 7. Límites honestos
El patrón existente permite derivar username/password en lectura solo para identidad canónica exacta; no crea Auth ni persiste credenciales. WhatsApp debe existir en HR/perfil protegido; no se fabrica.

Reportes y Reservas no tienen una regresión específica demostrada por estas capturas. Deben incluirse en el próximo smoke integral antes de congelar Corte6.

## 8. Gate exacto
El código está en GitHub, no en Hosting DEV. La autorización anterior está consumida.

`AUTORIZACIÓN FRESCA 1x HOSTING DEV → REMOTE SMOKE SEMÁNTICO INTEGRAL → HUMAN VISUAL ACUMULATIVA → FREEZE C6 → AGOSTO`.

No Cloud Run ni data/provider writes previstos.

## 9. Estado seguro
Bloque actual: Hosting0; Cloud Run0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes0; nuevos Firebase/Hosting0; merge=false; producción=false.

## 10. Documentación vigente
- addenda P0/domain, Finanzas/Liquidaciones y Portal Shopper;
- Academia de dominio/estados;
- evidencia P0 humana y auditoría v5;
- índice, Phase A, Claude, pendientes, tracker y PR#7.
