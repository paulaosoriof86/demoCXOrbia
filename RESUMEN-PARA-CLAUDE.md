# RESUMEN-PARA-CLAUDE.md

## ESTADO VIGENTE — 2026-07-30

### Baseline / arquitectura
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Corte 3 FROZEN: `CXORBIA-TYA-CORTE3-V182-20260729`; no V183/R33.
- `cxorbia-backend-dev` = backend DEV canónico; reutilizar.
- `tya-plataforma` = legacy actual a retirar y Hosting/URL pública a conservar para cutover.
- `cxorbia-tya-dev-260729-c4` = sandbox, no destino.
- No nueva base Firebase.

### Identidad real del shopper
`source-safe` sanitiza repo/log/evidencia; NO anonimiza el producto.

La plataforma final debe mostrar identidad real y datos operativos reales a roles autorizados bajo Auth/RBAC/Rules. `Shopper protegido`/hash no es identidad permanente. Nombre visible sí; name-only automerge no.

### HR viva actual hasta julio
El snapshot del 13-jul con 210 refs quedó superado.

Fuente actual:
- 14 periodos;
- 616 visitas;
- 208 refs shopper;
- +2 / -4 / 206 intersección vs snapshot viejo;
- PII en repo=0; writes=0.

### Crosswalk actual
- 201/208 refs → shopper canónico existente por identidad transaccional exacta.
- 7/208 requerían reconciliación real.
- Las 7 tienen identidad real en HR viva.
- 2 → perfil legacy create-candidate.
- 5 → perfil nuevo desde identidad HR actual.
- 0 HOLD de identidad actual.

### Legacy shoppers/certificaciones
Read-only `tya-plataforma/tya_shoppers_extra`:
- 149 shoppers únicos;
- 120 profile create-candidates;
- 22 stable-linked existing con updates HOLD;
- 7 profile HOLD;
- 78 certificaciones útiles;
- 77 certification create-candidates +1 HOLD.

### R17N FINAL — NO EXECUTE
- identity: 208/208 ready = 201 existing +2 legacy-create link +5 HR-current create;
- foundation 16;
- legacy profile creates 120;
- HR-current profile creates 5;
- certification creates 77;
- visits 616;
- liquidation controls 572;
- **exactReadyWrites = 1,406**;
- idempotencia offline PASS;
- `executeAllowed=false`;
- writes ejecutados=0.

HOLD/excluido: tenant1, existing-profile updates22, legacy profile holds7, cert hold1, Agosto HN, deletes, pagos, Auth/Storage/HR writes, deploy, merge, producción.

### Correcciones metodológicas
- Status del offline gate ahora depende de `job.status`; artefacto viejo no puede producir PASS falso.
- Path `hrImports` corregido al scope proyecto.
- R14C financiero histórico tiene shoppers=210; no forzar. Conservar 247 filas, 196 links exactos por visitId y 51 reviews para ejecución posterior.

### Claude NO debe
- crear candidata nueva;
- reabrir V182/Corte 3;
- volver a 210 refs/9 pendientes como verdad actual;
- resolver identidad desde UI;
- deduplicar por nombre;
- crear nueva base;
- activar providers/pagos/imports desde UI.

### Próxima intervención Claude
Ninguna por rutina. Después de materialización/smoke, validar que Admin/Operativo y Shopper rendericen identidad real autorizada y no placeholders, sin duplicados.

Backlog P1/P2 preservado: PDF gráfica, Excel formato, reportKit, copy específico de fuentes.

### Siguiente bloque exacto backend
`AUTORIZACIÓN EXACTA DE 1,406 WRITES DEV → MATERIALIZACIÓN IDEMPOTENTE → POST-COMPARE/SMOKE CX.data + IDENTIDAD REAL → CORTES 6–8 → CUTOVER tya-plataforma`.

## Estado seguro
Firestore/Auth/Storage/HR/legacy writes=0; deploy=0; merge=false; producción=false; pagos/lotes/Make/Gemini=0.
