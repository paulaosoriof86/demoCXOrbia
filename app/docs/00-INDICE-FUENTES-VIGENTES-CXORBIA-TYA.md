# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN__ARCHITECTURE_CORRECTED__CANONICAL_INVENTORY_PASS__PHASEA_GAP_PASS__ANOMALIES_EXACT__LIVE_HR_PASS_WITH_AUG_HN_HOLD__CANONICAL_PLAN_OFFLINE_PASS__R16E_READONLY_AUTH_PENDING__NO_DATA_WRITES`

## 1. Repositorio
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción, merge, imports, pagos y data writes reales: 0.

## 2. Orden de lectura vigente
1. este índice;
2. `ADDENDUM-CORRECCION-ARQUITECTURA-LEGACY-VS-CXORBIA-BACKEND-DEV-20260729.md`;
3. reglas maestras vigentes;
4. addendum de empalme directo/carril file-aware;
5. addenda de Academia, patrones y antidesvío;
6. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
7. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
8. `app/docs/evidence/CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.md`;
9. `app/docs/evidence/CANONICAL-BACKEND-PHASEA-GAP-LATEST.md`;
10. `app/docs/evidence/CANONICAL-BACKEND-ANOMALY-PROBE-LATEST.md`;
11. `app/docs/evidence/LIVE-HR-CURRENT-RECONCILIATION-LATEST.md`;
12. `app/docs/evidence/LIVE-HR-COUNTRY-TAB-CONSISTENCY-LATEST.md`;
13. `app/docs/evidence/CANONICAL-PLAN-REFRESH-OFFLINE-LATEST.md`;
14. `app/docs/CAMBIOS-BACKEND-ADDENDUM-ARQUITECTURA-CANONICAL-BACKEND-20260729.md`;
15. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-ARQUITECTURA-CANONICAL-BACKEND-20260729.md`;
16. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-ARQUITECTURA-CANONICAL-BACKEND-20260729.md`;
17. `app/docs/ACADEMIA-IMPACTO-ARQUITECTURA-CANONICAL-BACKEND-20260729.md`;
18. baseline/freeze Corte 3;
19. PR #7 y HEAD vivo.

La corrección de arquitectura de este índice prevalece sobre cualquier documento que llame a `cxorbia-backend-dev` “base anterior excluida”.

## 3. Distinción obligatoria de sistemas

### Legacy TyA Consultores — plataforma actual a retirar
- Es la plataforma operativa anterior con parches/fixes.
- Es origen únicamente de datos útiles y limpios.
- No se copia arquitectura, código, dashboard, parches ni lógica defectuosa.
- Refresh pendiente: shoppers y certificaciones nuevas/actualizadas; visitas continúan HR-first.

### `cxorbia-backend-dev` — backend DEV canónico de CXOrbia / tenant TyA
- Es el backend nuevo de CXOrbia trabajado desde junio.
- TyA es el primer tenant real.
- **No es la base legacy a excluir.**
- Se reutiliza; no se reconstruye en otro Firebase.

### `cxorbia-tya-dev-260729-c4` — sandbox técnico Corte 4
- Se creó por una interpretación incorrecta de “base vieja”.
- Fue útil para descubrir/corregir VIS-01/VIS-02/VIS-02B.
- No es destino de materialización Phase A.

### Hosting público TyA
- Se conserva la dirección pública actual de los shoppers para el cutover final.
- Se reemplazará la app legacy por CXOrbia cuando Phase A/gates estén completos.
- Se verificará la identidad técnica del Hosting antes del cutover; no se asume.

## 4. Corte 3 — congelado
- `FROZEN_ACTIVE_BASELINE`.
- Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- Source lock hasta julio: 14 periodos, junio 2025–julio 2026, GT34+HN10=44 por periodo = 616 visitas.
- Mayo: 44 pagadas / 0 pendientes / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- P1/P2 PDF/Excel/reportKit/copy no reabren Corte 3.

## 5. Sandbox Corte 4 — aprendizajes preservados
- no fallback demo/localStorage;
- backend vacío first-class;
- null-safety proyecto/período;
- role-switch limpia DOM;
- entrypoint sin scripts huérfanos;
- gate anti-dangling-script;
- remoto PASS con 0 pageerrors;
- visual humana Admin/Shopper vacío correcta.

No se materializa TyA en el sandbox.

## 6. Inventario read-only canónico — PASS
`cxorbia/canonical-backend-readonly-inventory=success`.

En `cxorbia-backend-dev`, sin provider writes ni PII:
- Auth users=17 con claims tenant/proyecto/rol/shopper;
- 83 rutas de colección, traversal completo/no truncado;
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
- shoppers con campos embebidos de certificación/curso/Academia=0.

Conclusión: existe materialización sustancial; crear otra base sería reproceso.

## 7. Reconciliación Phase A — PASS incremental
`cxorbia/canonical-backend-phasea-gap=success` con `PASS_GAP_RECONCILED_INCREMENTAL_PHASEA_REQUIRED`.

- En la materialización antigua period-country: 28 proyectos esperados / 26 encontrados.
- Faltan julio 2026 GT+HN = 44 visitas.
- Encontradas 574 vs 572 esperadas para esos 26 proyectos.
- Pilotos/no canónicos: `julio-pilot`, `r1`, `tya-piloto` = 45 visitas; no borrar por inferencia.

### Excesos ya localizados exactamente
- Abril 2026: registro sintético `sprint5-visit-mutation-no-real-data`, sin sourceRow/sourceKey/sourceSheet.
- Junio 2026 HN: Firestore row 12 `hr-58fb469666080189`; HR viva actual solo tiene sourceRows 2..11.
- Ninguno se ha borrado. Cualquier cleanup requiere write autorizado.

## 8. HR viva actual — PASS con HOLD focalizado agosto HN
`cxorbia/live-hr-current-reconcile=success`.

- periodos detectados=15;
- tabs=30;
- visitas=684;
- referencias shopper protegidas=236;
- julio 2026 GT=34 y HN=10: source-safe;
- agosto 2026 GT=34;
- agosto 2026 HN aparece con 34 filas.

`cxorbia/live-hr-country-tab-consistency=error` / `HOLD_COUNTRY_TAB_MISMATCH`:
- `AGOSTO 26 HN` tiene 34 filas visitables, pero columna País=GT en las 34;
- todas las filas 2..35 contradicen el país de la pestaña.

Regla: **agosto HN no se materializa ni sincroniza** hasta corregir/confirmar la fuente. Julio no queda bloqueado por este problema.

## 9. Plan canónico existente — refresh offline PASS
`cxorbia/canonical-plan-refresh-offline=success`, provider calls=0, writes=0.

Reutiliza builders R6/R16D existentes:
- plan base `phasea_2f71daec3e68dfa1`;
- overlay `r16d_f471a6b486f3a269b0dd`;
- 1,415 operaciones;
- tenant=1;
- proyecto padre `cinepolis`=1;
- periodos=14;
- shoppers=210;
- visitas=616;
- liquidaciones=572;
- certificaciones=0;
- pagos=0.

Confirma modelo aprobado: **proyecto padre → periodos → visitas**. Los 29 project docs actuales no se toman automáticamente como modelo final por estar poblados.

## 10. Shoppers/certificaciones
- 215 shoppers ya existen en backend canónico: no recrear.
- HR viva protege 236 referencias shopper; no inferir “21 faltantes” sin diff de llave estable.
- Certificaciones materializadas=0: refresh legacy dirigido obligatorio.
- Prompt listo: `PROMPT-REFRESH-DELTA-LEGACY-TYA-SHOPPERS-CERTIFICACIONES-20260729.md`.

## 11. Gate vivo único
El siguiente gate técnico existente es **R16E provider compare read-only** contra `cxorbia-backend-dev`, que clasifica el plan canónico en `create/update/noop/review` y preserva extras sin borrarlos.

Su propio contrato histórico exige autorización explícita de este comparador read-only antes de llamar al proveedor. Por eso no se ha ejecutado bajo una autorización ambigua.

Secuencia:
`AUTORIZACIÓN R16E READ-ONLY → provider compare único → write plan exacto SIN ejecutar → refresh legacy shoppers/certs → dry-run delta/idempotencia → autorización de writes exactos → smoke CX.data canónico → Cortes 6–8 → cutover Hosting público actual`.

No nueva base, no nueva candidata, no PowerShell, no materialización duplicada.

## 12. Claude/prototipo y Academia
- Claude: no nueva candidata; preservar fixes core/entrypoint.
- Academia: distinguir legacy/backend canónico/sandbox/Hosting; migración incremental y fail-closed ante fuente inconsistente.
- Reusable CXOrbia: inventario primero, comparación después, writes solo por delta autorizado.
