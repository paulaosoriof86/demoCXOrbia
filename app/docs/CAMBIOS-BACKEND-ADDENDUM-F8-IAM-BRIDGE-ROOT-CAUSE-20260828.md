# CAMBIOS BACKEND — ADDENDUM F8 IAM BRIDGE ROOT CAUSE — 2026-08-28

## Estado del bloque

Phase A permanece `100/100`; `PRODUCTION_REAL_READINESS` permanece `95/100`. F8 no está cerrado y la autorización de backup/restore/cutover continúa sin consumir.

## Causa raíz resuelta / frontera restante

1. Se demostró que el bloqueo de transporte no era una indisponibilidad general de GCP. El workflow existente conserva una identidad DEV válida y el primer F8 real autenticó correctamente.
2. El primer F8 real se detuvo antes de mutar por `F8_HOSTING_CERTIFIED_ADAPTER_DRIFT`. La sonda read-only demostró que el asset vivo coincide con el source funcional congelado, runtime congelado y rama actual; el defecto estaba en el fingerprint heredado promovido por F6 sin readback provider.
3. Se creó `backend/config/cxorbia-phase-a-release-manifest-errata-v1.json` como overlay de corrección, sin reescribir el manifest histórico ni cambiar el release.
4. Se comprobó que el bucket default anunciado por Firebase no existe. Se localizó un bucket GCS real en el mismo proyecto, `US/STANDARD`, y la identidad DEV posee permisos de objeto necesarios. El executor v6 ahora solo acepta buckets realmente listados por GCS, con metadata, ubicación compatible y permisos verificados.
5. El capability preflight identifica una única brecha restante: faltan `datastore.databases.export`, `import`, `create`, `delete` y `datastore.operations.get`; `datastore.databases.getMetadata` ya está concedido.
6. La identidad DEV no tiene `resourcemanager.projects.setIamPolicy`. El probe v2 no encontró ninguna service account determinística existente que pueda impersonarse efímeramente desde DEV y que aporte esa capacidad. Resultado: `HOLD_F8_NO_EXISTING_AUTOMATED_IAM_BRIDGE`.
7. Paula autorizó de forma explícita y excepcional un binding temporal condicionado de `roles/datastore.owner` sobre la identidad DEV existente, máximo 120 minutos, solo para F8 y con revocación obligatoria tras pass/failure. Evidencia: `RC15-F8-TEMP-DATASTORE-OWNER-AUTHORIZATION-LATEST.json`.
8. El rerun read-only `33187198967`, attempt 2, validó en CI el executor v6 con `node --check` PASS y confirmó la misma frontera de cinco permisos. Artifact `9692747900`, digest `sha256:6a0e816e8208ccad7c2c78bf9547881d1aafc4d70dd3819ef5fd1a3f5a97ede2`.

## Archivos creados/tocados en este bloque

- `backend/config/cxorbia-phase-a-release-manifest-errata-v1.json` — corrección overlay del fingerprint F6; release intacto.
- `.github/workflows/cxorbia-phase-a-live-hr-runtime-predeploy.yml` — reutilización controlada del workflow existente para F8/read-only; no se creó workflow nuevo.
- `backend/config/cxorbia-f8-provider-transport-execute.json` — marker histórico single-use del primer intento real; no reutilizar.
- `tools/release/tya-f8-backup-restore-cutover-one-shot.mjs` — executor v6: errata exacta + bucket GCS real/verificado + consumo solo al export.
- `tools/qa/tya-f8-hosting-adapter-drift-rootcause-readonly.mjs` — sonda de fingerprint.
- `tools/qa/tya-f8-cutover-capability-readonly.mjs` — preflight completo de permisos/bucket/bridge.
- `tools/qa/tya-f8-existing-iam-bridge-readonly.mjs` — probe v2 de puente IAM existente sin credenciales persistentes.
- `app/docs/evidence/RC15-F8-TEMP-DATASTORE-OWNER-AUTHORIZATION-LATEST.json` — autorización excepcional vigente.
- `app/docs/evidence/RC15-F8-IAM-BRIDGE-ROOT-CAUSE-LATEST.json` — evidencia consolidada de causa raíz y frontera restante.

## Incidente de control-plane

Durante exploración de capacidades del conector se creó accidentalmente la rama `__invalid_should_not_create__` apuntando a un HEAD existente. No contiene trabajo único, no se creó PR, nunca fue ni será carril de trabajo y no altera la rama viva. El conector disponible no expone eliminación de refs. Queda registrada como inerte/no autoritativa; la única rama viva sigue siendo `docs-tya-v6-v71-audit`.

## Seguridad / efectos

Hasta este corte: provider writes=0; IAM writes=0; backup/export=0; restore=0; cutover=0; deploy=0; rebuild=0; release reimport=0; data/Auth/HR/Storage/Rules/pagos/Make/Gemini writes=0; legacy DB access=false; autorización F8 consumida=false.

## Gate posterior obligatorio antes de visualización humana

Después de F8 PASS y de verificar la revocación del binding temporal, ejecutar `F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`. Debe identificar la última versión **aprobada** de cada módulo y verificar source canónico versus Hosting vivo para `app/modules/**`, `app/core/**` relevante, entrypoints, scripts, adapters y rutas. Cualquier mismatch bloquea la invitación a visualizar.

## Clasificación

- **Reusable CXOrbia:** fingerprint certification con readback real; errata inmutable; preflight acumulativo; selección de bucket por inventario GCS real; consumo single-use ligado a primera mutación; auditoría transversal de linaje antes de visualización.
- **Exclusivo cliente TyA:** IDs/proyecto/release/rutas y dataset operativo TyA.
- **Claude/prototipo:** sin modificación funcional de frontend; futura auditoría F8.5 únicamente.
- **Academia:** sin cambio funcional; F8.5 deberá registrar impacto si encuentra divergencia.
- **Sin impacto Claude:** este bloque es backend/control-plane salvo la futura certificación read-only de fuentes frontend.

## Siguiente bloque exacto

`F8_HUMAN_OWNER_APPLY_AUTHORIZED_TEMP_CONDITIONAL_DATASTORE_OWNER_THEN_READONLY_CAPABILITY_RECHECK`.

No crear credencial, service account, nuevo workflow, nueva rama/PR ni ampliar el rol. Tras el grant humano: recheck read-only; solo si los seis permisos y bucket verificado pasan, crear successor marker single-use y ejecutar F8. Al terminar o fallar F8: revocación inmediata del binding y verificación, luego F8.5.