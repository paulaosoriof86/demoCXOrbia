# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Última sincronización:** 2026-08-18 11:51 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-ROOT-CAUSE-RECOVERY-01`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__I3_11C_IDENTITY_LINK_APPLICABILITY_HOLD__GO_LIVE_35__NO_PRODUCTION`

## Regla de lectura obligatoria

Este índice es el único punto de entrada para continuidad. Antes de planear, auditar, modificar, pedir información, ejecutar un gate o cerrar un bloque, se debe leer en este orden:

1. `app/docs/CXORBIA-EXECUTION-STATE.json` — estado machine-readable actual;
2. `app/docs/SOURCE-LOCK-CXORBIA-TYA.md` — lock técnico estable;
3. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md` — checkpoint humano vigente;
4. `app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md` — plan Phase A vigente, corregido y congelado;
5. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`;
6. evidencia exacta indicada por `CXORBIA-EXECUTION-STATE.json`;
7. PR #7 vivo.

Además permanecen vigentes como marco maestro, sin sustituir el estado operativo machine-readable:
- `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md` o su versión actualizada activa;
- `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`;
- `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`;
- `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`;
- addendum vigente de ejecución directa/empalmes file-aware.

## Prevalencia y antidesincronización

- Los documentos fechados de source lock, checkpoints, addenda y evidencias anteriores son **historia de auditoría**, no instrucciones ejecutables, salvo que este índice los marque expresamente como activos.
- Ante contradicción entre una fuente histórica y `CXORBIA-EXECUTION-STATE.json`, prevalece el estado canónico sincronizado con evidencia viva y source lock estable.
- Si el HEAD/evidencia demuestra un estado más nuevo que cualquiera de las fuentes canónicas, se declara `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`. Se sincroniza documentación antes de cualquier provider/runtime action.
- Un gate ejecutado pero no sincronizado queda en `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`; no autoriza el siguiente gate.
- El verificador obligatorio es `tools/verify-cxorbia-source-truth-sync.mjs`.

## Carril único

Repo `paulaosoriof86/demoCXOrbia`; rama única `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

No nueva candidata/rama/PR/workflow/metodología. Para candidata frontend GO y sin P0 demostrado: solo `APPLY_DELTA_DIRECTLY` sobre la rama viva, únicamente cuando `EXECUTION_LANE_READY` esté demostrado en la misma sesión.

## Estado técnico real al sincronizar

Último HEAD de evidencia previo a este sync: `528d5f0ba51e9712fee79ca0025b3dbcdf74e163`.

Formal: I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25` hasta cierre integral; I4 `0/25`; I5 `0/15` = **35% / 65%**.

Operativamente:
- I3.1→I3.8 PASS;
- I3.9/I3.10 congelados PASS/no rerun;
- Firestore Rules I3.11C **PASS, verificado y consumido**, run `32163552089`;
- Staff/Admin runtime estable con membership, 15 períodos, 660 visitas y superficies operativas montadas;
- bloqueo vivo: `I3_11C_EXPECTED_PROVIDER_LINK_NOT_IN_APPLICABLE_RUNTIME_SET`.

Target exacto:
- live `shp-57d2e3769946`;
- canonical esperado `TYA_GT_0C0BA8856E`;
- prior link `irl_3ed1b9a65d36c5873c1306bae1621e9d`;
- provider links aplicables globales `1`;
- provider links aplicables al target `0`;
- agosto canonical `0`;
- agosto residual live `2`.

La evidencia actual no permite afirmar todavía si el link target fue eliminado, desactivado, re-scopeado o mutado.

## Frozen / no reprocesar

I1/I2; I3.1→I3.10 PASS/frozen según corresponda; Historical Shopper run `31906391682`; TARGET_B Admin existente; request08; I3.5B; I3.5C-2; I3.8; Rules I3.11C consumidas; HR 15/660 sin reimport; Finance V2/historical sin rebuild; legal V0.4 durable sin autoaceptación.

No crear otro Admin ni otro Shopper como workaround. No resetear/reacceder al Historical Shopper. No volver a desplegar Rules por la causa ya cerrada.

## Evidencia activa

Principal:
`app/docs/evidence/I3-11C-STAFF-READONLY-CLOSE-LATEST.json`.

Antecedentes exactos:
- `app/docs/evidence/ITERATION3-I3-5C2-PERIOD-INDEPENDENT-LINK-MATERIALIZATION-LATEST.json`;
- `app/docs/evidence/ITERATION3-I3-8-NEW-SHOPPER-PROVIDER-BACKED-LATEST.json`.

## Siguiente frontera exacta

`NEW_AUTH_REQUIRED_FOCAL_PROVIDER_IDENTITY_LINK_READONLY_ADJUDICATION_NO_WRITES`

Único objetivo: leer focalmente el prior target link y el único link actualmente aplicable para clasificar `deleted | deactivated | re_scoped | mutated | intact_but_nonapplicable`.

Sin nueva autorización exacta: cero provider read adicional. En ese bloque: Auth/user/password/Firestore-data/Rules/Hosting/CloudRun/HR/Storage/Make/Gemini/pagos/merge/producción = `0`; Historical Shopper access = `0`; retry automático = `false`.

## Camino completo a producción y después

1. Adjudicación focal read-only del identity link.
2. Si se demuestra drift corregible: un único gate de corrección exacta, readback inmediato y cierre integral I3 con `2` visitas agosto canonical y `0` residuales.
3. I3 PASS → formal **60%**.
4. I4 en cortes operativos visibles: documentos/certificación/disponibles/postulación/asignación; agenda/reprogramación/cancelación/ejecución/cuestionario/revisión; finanzas/liquidaciones/pagos/multi-proyecto/configuración; Academia/manuales/roles/notificaciones en paralelo.
5. I5: freeze sin P0 → SHA/manifest/build-lock/verificador → preproducción → rollback → same-build E2E → autorización expresa → producción/cutover/smoke → baseline productivo activo.
6. Post-producción: se mantiene este mismo protocolo de source truth, atomic gate close y verificación; go-live no cierra la evolución del producto.

## Producto no-code y comercializable — lock transversal

TyA es el primer tenant y Cinépolis el primer proyecto/configuración de validación. Ninguno puede convertirse en lógica global.

Todo nuevo tenant/proyecto debe evolucionar hacia configuración declarativa para país/moneda/timezone/locale; fuente de HR/roadmap y mapping; cuestionarios; documentos/reglas/certificación; postulaciones/asignación; agenda/reprogramación/cancelación; ejecución/evidencias/revisión; liquidación/pagos; roles/scopes/notificaciones; integraciones/gates; Academia/manuales/rutas.

Fuentes objetivo de roadmap: Google Sheets, Excel, CSV, API, plataforma nativa, import manual y proveedor/link externo. Flujo objetivo de alta de proyecto: `configurar fuente → mapear → dry-run → validar → activar`, sin parchear código por proyecto.

Los hallazgos reusable/tenant/project, los cambios requeridos por Claude/prototipo y el impacto en Academia deben registrarse en cada bloque.
