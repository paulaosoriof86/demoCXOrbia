# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-23  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V174_R20_M1_CORTE2A_FUNCTIONAL_PASS_SOURCE_LOCK_CLOSURE_PENDING_NO_DEPLOY`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- `main`, nueva rama/PR y force push: prohibidos.
- Hosting DEV, producción, imports y writes reales: no ejecutados en este bloque.

## 2. Lectura obligatoria

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA.md`.
3. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`.
4. Addenda vigentes de Academia, patrones reutilizables y antidesvío.
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
7. `app/docs/VALIDACION-VISUAL-Y-LOCK-ANTI-REGRESION-CORTE1-M1-20260722.md`.
8. `app/docs/AUDITORIA-CANDIDATA-V174-CORTE2A-SOURCE-LOCK-20260722.md`.
9. `app/docs/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json`.
10. `backend/contracts/cxorbia-controlled-runners-v1.json`.
11. CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES, Academia, tracker, PR #7 y HEAD vivo.

## 3. Lock prevalente

Para candidatas frontend `GO` sin `P0_PROVEN`:

`AUDIT_LANE_READY → AUDITED_GO → APPLY_DELTA_DIRECTLY → COMMIT/PUSH ATÓMICO → POST-GATES → VALIDACIÓN VISUAL → FREEZE`

Carril de aplicación permitido:

- checkout Git autenticado nativo; o
- `CXORBIA_ATOMIC_APPLY_RUNNER`.

Carril de gates con navegador permitido:

- entorno local completo y reproducible; o
- `CXORBIA_READONLY_POST_GATES_RUNNER`.

Continúan prohibidos Contents API secuencial para delta funcional, reconstrucción manual, workflows genéricos, `incoming/`, Drive/Base64 manual, PowerShell/CMD para Paula, copias manuales y nueva candidata cuando la actual ya quedó auditada GO.

## 4. V174 y Phase A

- Package SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- Commit funcional V174: `b21e494d127fb4b902de5576e3fab0292362b097`.
- Corrección focalizada V174: `0acdc6772f2d4a7743dea0992a4279241dcb79d7`.
- M1/Corte 1: preservado.
- Corte 2A canonical: PASS.
- Backend, adapters live, contratos operativos, overlays y `CX.data`: preservados.
- Honorario, boleto y combo: `0` confirmado se conserva; ausencia permanece `null`.

## 5. Corrección R20 aplicada en remoto

La causa raíz quedó corregida en la rama viva:

`R20_INVENTORY_BUILDER_NOT_USING_CANONICAL_HEADER_VARIANT_RESOLVER`

El builder vigente:

- reutiliza `headerVariants` del contrato R20;
- admite únicamente variantes declaradas `full_identity` y `tab_scoped_compact`;
- obtiene país desde columna o tab según la variante;
- conserva identidad por `hrRowId/sourceTab/sourceRow` cuando `ID CINEMA` no existe;
- respeta `contextualMissingAllowedIn`;
- aplica `coalesce_equal_or_single_nonempty` y bloquea conflictos;
- no contiene hardcode mensual para aceptar encabezados;
- publica `public_gviz_gid_verified_inventory` solo después de verificar inventario, conteos y cache-busting por GID.

## 6. Fuente HR viva verificada

Ejecución read-only autorizada:

- Run: `30016360952`.
- Job: `89237272004`.
- Artifact: `8567304475`.
- Digest: `sha256:b7b65933e1f81002dfac8ca65a2b1415d57e1158b87e755e9bd7706253dede57`.
- Source HEAD probado: `96bf7db74a144a3ddb27635933d3860658198719`.
- Request commit: `0c7002c30ff88e8863b86acce56e72d9f1ba772c`.

Inventario actual observado:

- 14 periodos: junio 2025 a julio 2026.
- 28 tabs.
- 616 visitas.
- GT: 476.
- HN: 140.
- 209 shoppers source-safe.
- 28 nonces únicos: cache-busting por cada GID.
- `JULIO 26`: `full_identity` en la lectura actual.
- `JULIO 26 HN`: `full_identity` en la lectura actual.
- El contrato conserva soporte fail-closed para `tab_scoped_compact`; no se fija una variante por nombre de mes.

Totales históricos actuales:

- 615 asignadas y 1 sin asignar.
- 614 programadas.
- 600 realizadas.
- 597 cuestionarios completados.
- 533 submitidas.
- 533 candidatas de liquidación pendientes de fuente financiera.
- 0 liquidaciones confirmadas por fuente financiera.
- 0 pagos confirmados.
- 0 conflictos en revisión.

Julio 2026 observado por navegador:

- 44 visitas: 34 GT + 10 HN.
- 43 asignadas y 1 sin asignar.
- 43 programadas.
- 29 realizadas.
- 28 cuestionarios completados.
- 20 submitidas.
- 8 pendientes de submitir.
- 1 cuestionario pendiente.
- 20 candidatas de liquidación.
- 0 pagos confirmados.

Estos conteos son evidencia de la lectura actual; no son constantes hardcodeadas del producto.

## 7. Lectura viva preservada

`PASS_TYA_LIVE_HR_INPLACE_REFRESH_GATE` confirmó:

- `fresh=1` omite TTL;
- snapshot aplicado en memoria;
- proyección reconstruida;
- `sourceRevision` actualizado;
- cero `location.reload()`.

No se modificaron en la corrección R20:

- `backend/runtime/hr-live-service/server.mjs`;
- `app/adapters/tya-live-source-inplace-apply.js`;
- `CX.data`;
- módulos V174.

## 8. Gates técnicos

PASS en el composite exacto del run `30016360952`:

1. propuesta de source lock V174/R20;
2. sintaxis del builder;
3. variantes R20;
4. builder de inventario R20;
5. build source-safe R18A;
6. HR live in-place;
7. contexto/histórico/reportes Corte 1;
8. runtime frontend de reportes;
9. proyecto/periodo/KPI/histórico R20 con Playwright/Chromium;
10. Corte 2A canonical;
11. M1 regression lock.

Único HOLD del run:

- `tya-v174-corte2a-empalme-directo-verify.mjs`, exclusivamente porque manifest/build-lock anteriores no incluían todavía la corrección R20, documentación vigente y build generado.

No existe HOLD funcional de HR, visitas, periodos, KPIs, reportes, Corte 2A o M1.

## 9. Source lock de cierre

Propuesta reproducible generada:

- file count: `1890`.
- aggregate SHA-256: `cdce7c1026a78d639ed887f19151e43ba142397359cbcab5b6ce93676a6c4123` para el app probado antes de reconciliar esta documentación.

Como los documentos vivos forman parte del aggregate, el cierre correcto es:

1. reconciliar índice/checkpoint/CAMBIOS/RESUMEN/PENDIENTES/Academia;
2. regenerar manifest/build-lock sobre el HEAD documental final;
3. reejecutar el perfil read-only completo;
4. declarar `TECHNICAL_PASS_PENDING_VISUAL` solo cuando el verificador final pase.

## 10. Siguiente bloque exacto

`RECONCILIAR DOCUMENTACIÓN VIVA → REGENERAR SOURCE LOCK FINAL → RERUN R20 + M1 + CORTE2A + VERIFICADOR → TECHNICAL_PASS_PENDING_VISUAL → AUTORIZACIÓN HOSTING DEV → FRESH=1 + SMOKE REMOTO → VALIDACIÓN VISUAL → FREEZE PHASE A`.

## 11. Estado seguro

Sin merge, Hosting DEV nuevo, deploy productivo, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live, pagos ni conexión a la base vieja.
