# CAMBIOS BACKEND — Corrección arquitectura legacy vs backend canónico

**Fecha:** 2026-07-29  
**Estado:** `ARCHITECTURE_CORRECTED__CANONICAL_INVENTORY_PASS__PHASEA_GAP_PASS__ANOMALIES_EXACT__LIVE_HR_REFRESH_PASS_WITH_AUG_HN_HOLD__CANONICAL_PLAN_OFFLINE_PASS__NO_DATA_WRITES`

## Qué se corrigió
- Se eliminó la interpretación que trataba `cxorbia-backend-dev` como “base vieja/excluida”.
- La plataforma legacy a retirar es TyA Consultores actual; de ella solo se recuperan datos útiles limpios.
- `cxorbia-backend-dev` es backend DEV canónico de CXOrbia con TyA como primer tenant.
- `cxorbia-tya-dev-260729-c4` es sandbox técnico Corte 4, no destino de materialización.
- Se conserva el Hosting público actual para cutover final.

## Archivos creados/tocados
- `app/docs/ADDENDUM-CORRECCION-ARQUITECTURA-LEGACY-VS-CXORBIA-BACKEND-DEV-20260729.md`.
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
- `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
- `app/core/backend-config.js`: identidad canónica/sandbox corregida; `enabled=false`, writes deshabilitados.
- `tools/qa/cxorbia-canonical-backend-readonly-inventory.mjs` + workflow/request.
- `tools/qa/cxorbia-canonical-backend-phasea-gap-reconcile.mjs` + workflow/request.
- `tools/qa/cxorbia-canonical-backend-anomaly-probe.mjs` + workflow/request.
- `tools/qa/tya-hr-country-tab-consistency-current.mjs` + workflow/request.
- `.github/workflows/cxorbia-live-hr-current-reconcile.yml` + request.
- `.github/workflows/cxorbia-canonical-plan-refresh-offline.yml` + request.
- evidencias `CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.*`, `CANONICAL-BACKEND-PHASEA-GAP-LATEST.*`, `CANONICAL-BACKEND-ANOMALY-PROBE-LATEST.*`, `LIVE-HR-CURRENT-RECONCILIATION-LATEST.*`, `LIVE-HR-COUNTRY-TAB-CONSISTENCY-LATEST.*`, `CANONICAL-PLAN-REFRESH-OFFLINE-LATEST.*`.
- `app/docs/PROMPT-REFRESH-DELTA-LEGACY-TYA-SHOPPERS-CERTIFICACIONES-20260729.md`.
- addenda Claude/PENDIENTES/Academia de arquitectura canónica.

## Inventario read-only — PASS
`cxorbia/canonical-backend-readonly-inventory=success`.

Sin PII ni provider writes:
- Auth users=17, claims tenant/proyecto/rol/shopper presentes;
- 83 rutas Firestore, no truncadas;
- clients=3;
- projects=29;
- visits=619;
- questionnaires=557;
- shoppers=215;
- liquidations=255;
- postulations=3;
- applications=1;
- notifications=20;
- shopperBenefits=572;
- certifications=0;
- shoppers con campos de certificación/curso/Academia=0.

## Reconciliación Phase A — PASS incremental
`cxorbia/canonical-backend-phasea-gap=success` con `PASS_GAP_RECONCILED_INCREMENTAL_PHASEA_REQUIRED`.

- Source lock congelado hasta julio: 14 periodos × 44 = 616 visitas.
- Proyectos period-country esperados/encontrados en la materialización antigua: 28/26.
- Faltan `cinepolis-julio-26` y `cinepolis-julio-26-hn` = 44 visitas.
- Proyectos period-country encontrados: 574 visitas vs 572 esperadas.
- Pilotos/no canónicos: `julio-pilot` 1, `r1` 36, `tya-piloto` 8 = 45 visitas; no se borran por inferencia.

## Probe de excesos — PASS read-only y candidatos exactos
`cxorbia/canonical-backend-anomaly-probe=success`.

### Abril 2026
- 35/34.
- Registro extra inequívocamente sintético: `sprint5-visit-mutation-no-real-data`, sin sourceRow/sourceKey/sourceSheet.
- No se ha borrado; requiere autorización de write para limpiar.

### Junio 2026 HN
- Firestore: sourceRows 2..12 = 11.
- HR viva actual: sourceRows 2..11 = 10.
- Candidato stale exacto: `hr-58fb469666080189`, sourceRow 12.
- No se ha borrado; cualquier limpieza será una operación explícita y autorizada.

## HR viva actual — PASS con bloqueo focalizado agosto HN
`cxorbia/live-hr-current-reconcile=success`.

Fuente viva source-safe actual:
- periodos detectados=15;
- tabs=30;
- visitas=684;
- referencias shopper protegidas=236;
- junio 2026 HN=10;
- julio 2026 GT=34;
- julio 2026 HN=10;
- agosto 2026 GT=34;
- agosto 2026 HN=34 según tab.

Gate específico `cxorbia/live-hr-country-tab-consistency` detectó `HOLD_COUNTRY_TAB_MISMATCH` exclusivamente para `AGOSTO 26 HN`:
- pestaña `AGOSTO 26 HN`: 34 filas visitables;
- columna País cruda: GT=34, HN=0;
- todas las filas 2..35 son mismatch para una pestaña HN.

Por tanto:
- julio 2026 está source-safe y puede entrar al próximo dry-run;
- **agosto HN queda excluido de cualquier materialización/sync** hasta corregir o confirmar la fuente;
- agosto GT no se mezcla con HN;
- este hallazgo no reabre Corte 3 ni obliga a recrear backend.

## Plan canónico existente — refresh offline PASS
`cxorbia/canonical-plan-refresh-offline=success`.

Se reutilizaron los builders existentes R6/R16D, sin provider calls ni writes:
- plan base `phasea_2f71daec3e68dfa1`;
- overlay R16D `r16d_f471a6b486f3a269b0dd`;
- 1,415 operaciones;
- tenant=1;
- proyecto padre `cinepolis`=1;
- periodos=14;
- shoppers=210;
- visitas=616;
- liquidaciones=572;
- certificaciones=0;
- pagos=0.

Esto confirma que la arquitectura canónica aprobada sigue siendo **proyecto padre `cinepolis` → periodos → visitas**, no 28 proyectos separados por mes/país. La materialización period-country existente en `cxorbia-backend-dev` es referencia/estado previo que debe compararse y reutilizarse donde corresponda, no tratarse como modelo final por defecto.

## Shoppers/certificaciones
- 215 shoppers ya existen: no recrear.
- HR viva protege 236 referencias shopper, pero esa diferencia NO equivale automáticamente a 21 shoppers faltantes; requiere diff por llave estable.
- Certificaciones no están materializadas ni embebidas: refresh legacy dirigido obligatorio.
- Prompt de refresh sanitizado preparado; exporta shoppers+certificaciones, no visitas, código ni parches.

## Impacto Phase A
- Se evita reconstruir TyA en otro Firebase.
- Corte 5 = materialización incremental/reconciliada dentro de `cxorbia-backend-dev`, no recreación completa.
- Julio 2026 es faltante HR demostrado y source-safe.
- Dos registros stale/test están localizados pero todavía sin write.
- Certificaciones legacy son faltante demostrado.
- Shopper refresh se compara contra 215 existentes.
- Agosto HN queda bloqueado por fuente, sin contaminar el corte de julio.

## Seguridad
- Firestore/Auth/Storage/HR writes: 0.
- Hosting/deploy: 0 en este bloque.
- Producción/merge: false.
- Make/Gemini/pagos: 0.

## Clasificación
- **Reusable CXOrbia:** inventario previo, reconciliación contra source lock, separación de pilotos, delta idempotente, gate país-vs-pestaña HR.
- **Exclusivo TyA:** proyectos/periodos/legacy/Hosting y mismatch `AGOSTO 26 HN`.
- **Claude/prototipo:** preservar fixes core; no nueva candidata.
- **Academia:** migración incremental, cutover, carryover de certificaciones y manejo fail-closed de fuente inconsistente.
- **Sin impacto Claude:** probes provider/read-only y refresh offline del plan.

## Siguiente gate
`COMPARADOR READ-ONLY DEL PLAN CANÓNICO R16D CONTRA cxorbia-backend-dev → CLASIFICAR create/update/noop/review → PRODUCIR WRITE PLAN EXACTO, SIN EJECUTARLO → REFRESH LEGACY SHOPPERS/CERTS → PEDIR AUTORIZACIÓN SOLO PARA WRITES EXACTOS`.
