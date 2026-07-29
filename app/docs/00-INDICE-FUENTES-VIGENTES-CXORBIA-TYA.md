# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN__ARCHITECTURE_CORRECTED__CANONICAL_BACKEND_INVENTORY_PASS__PHASEA_GAP_RECONCILED__ANOMALY_READONLY_PROBE_ACTIVE__NO_DATA_WRITES`

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
10. `app/docs/CAMBIOS-BACKEND-ADDENDUM-ARQUITECTURA-CANONICAL-BACKEND-20260729.md`;
11. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-ARQUITECTURA-CANONICAL-BACKEND-20260729.md`;
12. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-ARQUITECTURA-CANONICAL-BACKEND-20260729.md`;
13. `app/docs/ACADEMIA-IMPACTO-ARQUITECTURA-CANONICAL-BACKEND-20260729.md`;
14. baseline/freeze Corte 3;
15. PR #7 y HEAD vivo.

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
- Debe reutilizarse y completar únicamente faltantes.

### `cxorbia-tya-dev-260729-c4` — sandbox técnico Corte 4
- Se creó por una interpretación incorrecta de “base vieja”.
- Fue útil para descubrir/corregir VIS-01/VIS-02/VIS-02B.
- No es destino de materialización Phase A.
- No se replica allí el tenant TyA existente.

### Hosting público TyA
- Se conserva la dirección pública actual de los shoppers para el cutover final.
- Se reemplazará la app legacy por CXOrbia cuando Phase A/gates estén completos.
- Se verificará la identidad técnica del Hosting antes del cutover; no se asume.

## 4. Corte 3 — congelado
- `FROZEN_ACTIVE_BASELINE`.
- Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- Source lock HR: 14 periodos, junio 2025–julio 2026, 44 por periodo = 616 visitas.
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
- remote diagnostic PASS con 0 pageerrors;
- visual humana Admin/Shopper vacío correcta.

Estos resultados se trasladan al camino canónico; no justifican otra base.

## 6. Inventario read-only canónico — PASS
Evidencia: `CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.*`.

Confirmado en `cxorbia-backend-dev` sin provider writes ni PII:
- Auth users: 17;
- custom claims por tenant/proyecto/rol/shopper ya existen;
- 83 rutas de colección, traversal completo/no truncado;
- tenant: 1;
- clients: 3;
- projects: 29;
- visits: 619;
- questionnaires: 557;
- shoppers: 215;
- liquidations: 255;
- postulations: 3;
- applications: 1;
- notifications: 20;
- shopperBenefits: 572;
- certifications: 0 colecciones localizadas;
- shoppers con campos embebidos de certificación/curso/Academia: 0.

Conclusión: el backend canónico ya contiene una parte sustancial de Phase A. Reconstruirlo en otro Firebase sería reproceso.

## 7. Reconciliación Phase A — PASS incremental
Evidencia: `CANONICAL-BACKEND-PHASEA-GAP-LATEST.*` con decisión `PASS_GAP_RECONCILED_INCREMENTAL_PHASEA_REQUIRED`.

- Proyectos canónicos esperados: 28; encontrados: 26.
- Faltan `cinepolis-julio-26` y `cinepolis-julio-26-hn` = 44 visitas esperadas.
- En los 26 proyectos encontrados hay 574 visitas; deberían ser 572.
- Excesos localizados por conteo: `cinepolis-abril-26` 35/34 y `cinepolis-junio-26-hn` 11/10.
- Hay 3 proyectos no canónicos/piloto con 45 visitas: `julio-pilot`, `r1`, `tya-piloto`.
- Esas 45 visitas no se borran por inferencia; se separan del histórico HR canónico.
- Si se revisan los 2 excesos y se materializan las 44 de julio 2026, el histórico canónico queda exactamente en 616.
- Certificaciones están ausentes y requieren refresh legacy dirigido.
- Los shoppers legacy deben compararse contra los 215 existentes; no recrearse.

## 8. Gate vivo único
`PROBE READ-ONLY DE LOS 2 EXCESOS → CERRAR MAPA YA-EXISTE/FALTA → REFRESH LEGACY SHOPPERS+CERTIFICACIONES → DRY-RUN DELTA/IDEMPOTENCIA → AUTORIZACIÓN DE WRITES SOLO PARA FALTANTES → SMOKE CX.data CANÓNICO → CORTES 6–8 / CUTOVER EN HOSTING PÚBLICO ACTUAL`.

Prompt preparado: `PROMPT-REFRESH-DELTA-LEGACY-TYA-SHOPPERS-CERTIFICACIONES-20260729.md`.

No nueva base, no nueva candidata, no PowerShell, no materialización duplicada.

## 9. Claude/prototipo y Academia
- Claude: no nueva candidata por esta corrección; preservar fixes core/entrypoint.
- Academia: distinguir legacy/origen, backend canónico, sandbox y Hosting/cutover; migración incremental.
- Reusable CXOrbia: sí; inventario primero, delta después, sandbox no equivale a destino.
