# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN__ARCHITECTURE_CORRECTED__CANONICAL_INVENTORY_PASS__PHASEA_GAP_PASS__ANOMALIES_EXACT__LIVE_HR_PASS_WITH_AUG_HN_HOLD__CANONICAL_PLAN_OFFLINE_PASS__R16E_READONLY_AUTH_PENDING__NO_DATA_WRITES`

## 1. Repositorio y seguridad
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción/merge/imports/pagos y provider writes reales: 0 en este bloque.

## 2. Corrección de arquitectura vinculante
“Base anterior/base vieja” = **plataforma legacy TyA Consultores actualmente operativa y destinada a retiro**. No significa `cxorbia-backend-dev`.

1. Legacy TyA: solo origen de datos útiles limpios.
2. `cxorbia-backend-dev`: backend DEV canónico de CXOrbia, TyA primer tenant; reutilizar.
3. `cxorbia-tya-dev-260729-c4`: sandbox de validación; no materializar Phase A allí.
4. Hosting público actual TyA: conservar URL en cutover final.

Prevalece `ADDENDUM-CORRECCION-ARQUITECTURA-LEGACY-VS-CXORBIA-BACKEND-DEV-20260729.md`.

## 3. Corte 3 — FROZEN / ACTIVE_BASELINE
- Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- Source lock hasta julio: 14 periodos, junio 2025–julio 2026, GT34+HN10=44 por periodo, total 616.
- HR remota y finanzas/pagos técnicamente validados.
- Mayo: 44 pagadas / 0 pendientes / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- P1/P2 PDF/Excel/reportKit/copy no reabren Corte 3.

## 4. Sandbox Corte 4 — aprendizaje técnico preservado
En `cxorbia-tya-dev-260729-c4` se corrigieron VIS-01/VIS-02/VIS-02B: fail-closed sin demo, empty-backend, null-safety, role-switch limpio y asset-integrity. Remoto 0 pageerrors; visual humana Admin/Shopper vacío correcta.

No se materializa TyA allí.

## 5. Inventario canónico `cxorbia-backend-dev` — PASS
Evidencia `CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.*`.

Sin provider writes ni PII:
- Auth users=17, claims de tenant/proyecto/rol/shopper presentes;
- 83 rutas de colección, traversal no truncado;
- tenants=1;
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

Conclusión: ya existe materialización sustancial de TyA; reconstruir en otro Firebase sería reproceso.

## 6. Reconciliación Phase A — PASS incremental
`cxorbia/canonical-backend-phasea-gap=success`; decisión `PASS_GAP_RECONCILED_INCREMENTAL_PHASEA_REQUIRED`.

- Source lock esperado: 14 periodos / 616 visitas.
- Materialización period-country previa: 28 proyectos esperados / 26 encontrados.
- Faltan `cinepolis-julio-26` y `cinepolis-julio-26-hn` = 44 visitas.
- 26 proyectos encontrados: 574 visitas vs 572 esperadas.
- Pilotos/no canónicos: `julio-pilot` 1, `r1` 36, `tya-piloto` 8 = 45 visitas separadas; no borrar por inferencia.

### Excesos localizados exactamente
- Abril 2026: `sprint5-visit-mutation-no-real-data`; registro sintético sin sourceRow/sourceKey/sourceSheet.
- Junio 2026 HN: Firestore `hr-58fb469666080189`, sourceRow 12; HR viva actual solo tiene sourceRows 2..11.

No se ha borrado ni corregido ningún documento. Cualquier cleanup requiere autorización de write.

## 7. HR viva actual — PASS con HOLD focalizado agosto HN
`cxorbia/live-hr-current-reconcile=success`.

Fuente source-safe actual:
- periodos detectados=15;
- tabs=30;
- visitas=684;
- referencias shopper protegidas=236;
- junio 2026 HN=10;
- julio 2026 GT=34;
- julio 2026 HN=10;
- agosto 2026 GT=34;
- agosto 2026 HN=34 según la pestaña.

Gate `cxorbia/live-hr-country-tab-consistency` dejó HOLD exclusivo para `AGOSTO 26 HN`:
- 34 filas visitables;
- columna País=GT en las 34;
- filas 2..35 contradicen el país HN de la pestaña.

Regla: **agosto HN no se materializa ni sincroniza** hasta corregir o confirmar la fuente. Julio 2026 no queda bloqueado por este hallazgo.

## 8. Plan canónico existente — refresh offline PASS
`cxorbia/canonical-plan-refresh-offline=success`; provider calls=0; writes=0.

Se reutilizaron los builders R6/R16D existentes:
- plan base `phasea_2f71daec3e68dfa1`;
- overlay `r16d_f471a6b486f3a269b0dd`;
- operaciones=1,415;
- tenant=1;
- proyecto padre `cinepolis`=1;
- periodos=14;
- shoppers=210;
- visitas=616;
- liquidaciones=572;
- certificaciones=0;
- pagos=0.

Esto confirma que el modelo aprobado es **proyecto padre `cinepolis` → periodos → visitas**, no 28 proyectos separados por mes/país. Los 29 project docs actuales se comparan/reutilizan donde corresponda; no se preservan automáticamente como modelo final solo porque estén poblados.

## 9. Shoppers/certificaciones — faltante real
- Backend canónico ya tiene 215 shoppers: no recrear.
- HR viva protege 236 referencias shopper, pero la diferencia no equivale automáticamente a shoppers faltantes; requiere diff por llave estable.
- Certificaciones materializadas=0 y no están embebidas en shopper.
- Refresh legacy dirigido obligatorio para shoppers nuevos/actualizados + historial de certificaciones presentadas/aprobadas/reprobadas.
- Prompt listo: `PROMPT-REFRESH-DELTA-LEGACY-TYA-SHOPPERS-CERTIFICACIONES-20260729.md`.

## 10. Ruta real hacia producción
`LEGACY TYA (delta shoppers/certs) + HR VIVA → cxorbia-backend-dev / tenant tya → materialización incremental/idempotente → smoke/Auth/sync → preprod/rollback → cutover sobre Hosting público actual`.

## 11. Gate real siguiente
El siguiente gate ya existe en repo: **R16E provider compare read-only** contra `cxorbia-backend-dev`.

Debe:
1. reconstruir/reusar el plan canónico aprobado;
2. consultar únicamente documentos planificados y campos allowlisted;
3. clasificar `create/update/noop/review`;
4. preservar extras existentes, sin deletes;
5. producir write plan/autorización posterior;
6. ejecutar **0 writes**.

El contrato histórico de R16E exige autorización read-only exacta antes de llamar al proveedor. No se ejecuta bajo una autorización ambigua.

Siguiente estado esperado:
`R16E READ-ONLY PASS → WRITE PLAN EXACTO SIN EJECUTAR → REFRESH LEGACY SHOPPERS/CERTS → DRY-RUN DELTA/IDEMPOTENCIA → AUTORIZACIÓN SOLO DE WRITES EXACTOS → SMOKE CX.data CANÓNICO → CORTES 6–8`.

## 12. Estado seguro
No PowerShell para Paula, nueva candidata, nueva base, Hosting/deploy, Firestore/Auth/Storage/HR writes, import, Make/Gemini, pagos, merge ni producción en este gate.

## 13. Claude/prototipo y Academia
- Claude: preservar fixes core/entrypoint; no nueva candidata por esta corrección.
- Academia: migración incremental, separación legacy/backend/sandbox, proyecto vs periodo, carryover de certificaciones y fail-closed ante fuente inconsistente.
- Reusable CXOrbia: inventario previo + provider compare + delta idempotente + writes solo autorizados.
