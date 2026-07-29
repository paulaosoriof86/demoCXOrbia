# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN__ARCHITECTURE_CORRECTED__CANONICAL_BACKEND_INVENTORY_PASS__PHASEA_GAP_RECONCILED__ANOMALY_READONLY_PROBE_ACTIVE__NO_DATA_WRITES`

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
- Source lock HR: 14 periodos, junio 2025–julio 2026, GT34+HN10=44 por periodo, total 616.
- HR remota y finanzas/pagos técnicamente validados.
- Mayo: 44 pagadas / 0 pendientes / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- P1/P2 PDF/Excel/reportKit/copy no reabren Corte 3.

## 4. Sandbox Corte 4 — aprendizaje técnico preservado
En `cxorbia-tya-dev-260729-c4` se corrigieron VIS-01/VIS-02/VIS-02B: fail-closed sin demo, empty-backend, null-safety, role-switch limpio y asset-integrity. Remoto 0 pageerrors; visual humana Admin/Shopper vacío correcta.

No se materializa TyA allí.

## 5. Inventario canónico `cxorbia-backend-dev` — PASS
Herramienta `tools/qa/cxorbia-canonical-backend-readonly-inventory.mjs`; evidencia `CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.*`.

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
- certifications=0 colecciones;
- shoppers con campos embebidos de certificación/curso/Academia=0.

Conclusión: ya existe materialización sustancial de TyA; reconstruir en otro Firebase sería reproceso.

## 6. Reconciliación contra source lock Phase A — PASS incremental
Gate `cxorbia/canonical-backend-phasea-gap=success`; decisión `PASS_GAP_RECONCILED_INCREMENTAL_PHASEA_REQUIRED`.

- Esperado: 28 proyectos país/periodo y 616 visitas.
- Encontrado: 26 proyectos canónicos.
- Faltan `cinepolis-julio-26` y `cinepolis-julio-26-hn` = 44 visitas.
- 26 proyectos encontrados: 574 visitas vs 572 esperadas.
- Excesos: `cinepolis-abril-26` 35/34 (+1), `cinepolis-junio-26-hn` 11/10 (+1).
- No canónicos/piloto: `julio-pilot` 1, `r1` 36, `tya-piloto` 8 = 45 visitas separadas.
- No se borra nada por inferencia.
- Resolver los 2 excesos + incorporar julio 2026 con 44 deja 616 canónicas, igual al source lock.

## 7. Shoppers/certificaciones — faltante real
- Backend canónico ya tiene 215 shoppers.
- No hay colección de certificaciones materializada.
- Ningún shopper tiene campos embebidos de certificación/curso/Academia.

Por ello:
- no recrear shoppers;
- obtener snapshot legacy sanitizado de shoppers + certificaciones;
- calcular diff por llave estable;
- importar únicamente shoppers faltantes/updates demostrables + certificaciones faltantes;
- no usar legacy para reimportar visitas ya HR-first.

Prompt listo: `PROMPT-REFRESH-DELTA-LEGACY-TYA-SHOPPERS-CERTIFICACIONES-20260729.md`.

## 8. Probe actual
Se lanzó probe read-only específico sobre los dos excesos para revisar `sourceRow/sourceKey/sourceSheet` sin PII y sin writes.

No se corrige ni elimina ningún documento hasta tener evidencia de llave HR y autorización de write.

## 9. Ruta real hacia producción
`LEGACY TYA (delta shoppers/certs) + HR VIVA → cxorbia-backend-dev / tenant tya → completar faltantes Phase A → smoke/Auth/sync → preprod/rollback → cutover sobre Hosting público actual`.

## 10. Siguiente bloque exacto
`CERRAR PROBE DE 2 EXCESOS → PREPARAR DRY-RUN DELTA JULIO 2026 + LEGACY SHOPPERS/CERTS → PEDIR AUTORIZACIÓN SOLO CUANDO HAYA WRITE PLAN EXACTO → CONTINUAR CORTES 5–8`.

No PowerShell para Paula, nueva candidata, nueva base ni Hosting/deploy en este gate.

## 11. Claude/prototipo y Academia
- Claude: preservar fixes core/entrypoint; no nueva candidata por este hallazgo.
- Academia: migración incremental, separación legacy/backend/sandbox, cutover sin cambio de URL.
- Reusable CXOrbia: inventario previo + gap reconciliation + delta idempotente.
