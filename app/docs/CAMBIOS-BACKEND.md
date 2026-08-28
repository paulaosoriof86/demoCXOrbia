# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-28  
**Estado:** `F8_IAM_METADATA_P1_RECONCILED_NONBLOCKING__PRECUTOVER_READONLY_NEXT__PHASE_A_100__PROD_READINESS_95`

## 2026-08-28 — F8 · corrección antidesvío: IAM metadata vuelve a su severidad P1

### Resultado

Se continuó desde `F8_REQUIRE_SECURE_OWNER_EXECUTION_BRIDGE` y se revisó la autoridad terminal, no solo la clasificación local del último intento IAM.

Hallazgo determinante:

- F7 cerró `GO_WITH_WARNINGS`, P0=`0`.
- La brecha de provider IAM/secrets se registró como `F7-P1-002`, severidad P1.
- F8 ya confirmó Cloud Run/revisión congelada, IAM de Cloud Run, APIs 4/4, cuotas 4/4, `plaintextSensitiveKeyCount=0` y `secretBackedEnvCount=0`.
- El único readback faltante es listar metadata de Secret Manager por ausencia de `secretmanager.secrets.list`.
- No se leyó ni exportó ningún payload de secreto.
- El master plan F8 congelado no convierte ese listado específico en criterio terminal de cutover.

Conclusión: la clasificación de mecanismo que llevó a construir/buscar un puente Owner elevó indebidamente un P1 a bloqueo. Bajo la regla vigente `P1/P2 se documentan y no bloquean`, `F7-P1-002` queda preservado como warning no bloqueante. El puente Owner/IAM se retira del camino crítico.

### Investigación histórica focalizada cerrada

Se verificó que los workflows históricos con nombres de credential/identity bridge reutilizan el mismo `FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV` o material de transporte relacionado; no representan una sesión humana Owner ni una ruta OIDC/WIF. Tampoco existe plugin/conector GCP/IAM disponible. Este hallazgo se conserva como explicación de mecanismo, pero ya no justifica crear infraestructura IAM para cerrar un P1.

### Evidencia nueva

`app/docs/evidence/RC15-F8-IAM-METADATA-NONBLOCKING-RECONCILIATION-LATEST.json`.

Decisión: `PASS_RECONCILE_IAM_METADATA_HOLD_TO_NONBLOCKING_P1`.

Clasificación: `F7_P1_002_RECONCILED_NONBLOCKING__NO_PRODUCT_P0`.

### Estado seguro

PHASE_A=`100/100`; PRODUCTION_REAL_READINESS=`95/100`; release F6 intacto `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

Provider/IAM/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=`0`; deploy/rebuild/reimport/merge=`0`.

No se creó workflow, rama, PR, WIF, service account, credencial ni binding IAM. El intento temporal IAM anterior sigue consumido y replay=`false`.

### Archivos reconciliados

- `backend/config/cxorbia-phase-a-continuity-lock.json` → schema `4.2.0`;
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/PRODUCTION-REAL-PROGRESS-LOCK-CXORBIA-TYA.md`;
- `app/docs/evidence/RC15-F8-IAM-METADATA-NONBLOCKING-RECONCILIATION-LATEST.json`;
- `app/docs/RESUMEN-PARA-CLAUDE.md`;
- `app/docs/PENDIENTES-PROTOTIPO.md`;
- `app/docs/CAMBIOS-BACKEND.md`.

### Clasificación obligatoria

- **Reusable CXOrbia:** una limitación de observabilidad/metadata P1 no debe promoverirse a P0 sin evidencia de impacto de producto; el control-plane debe respetar severidad y autoridad terminal.
- **Exclusivo cliente:** proyecto provider `cxorbia-backend-dev` y su capacidad IAM actual.
- **Claude/prototipo:** sin cambio UI, sin candidata nueva y sin reauditoría frontend.
- **Academia:** sin impacto funcional; P2 de profundidad continúa no bloqueante.
- **Sin impacto Claude:** reconciliación de seguridad/control-plane/evidencia.

## Siguiente bloque exacto

`F8_BOUNDED_LOAD_FAILURE_READONLY_CHECK`.

Debe ser acotado, read-only, contra el release congelado y sin generar datos ni mutaciones. Después se llega a la frontera de backup/export + restore/cutover, donde cualquier mutación requerirá autorización explícita específica.

## Antecedentes preservados

El intento IAM single-use run `33118612042` sigue siendo evidencia válida de que el principal DEV no tiene `resourcemanager.projects.setIamPolicy`; grantAttempted=false, metadata readback=false y providerWrites=0. La identidad humana Owner observada también se conserva como evidencia administrativa, pero ninguna de las dos exige acción adicional para el camino crítico actual.

La incidencia transitoria previa `app/docs/CONTINUITY-NOOP.txt` quedó reconciliada y el archivo no existe en el árbol vivo.
