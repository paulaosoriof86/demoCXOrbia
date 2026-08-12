# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-12 17:16 -06:00  
**Estado:** `C6_RUNTIME_07_STOP_RETRY_NESTED_HEREDOC_PRE_HOSTING__PHASE_A_88__SOURCE_REPAIR_APPLIED__NO_PRODUCTION`

## Estado vivo

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Exact Write V2: PASS cerrado/no repetible.
- Producción: intacta.
- Phase A certificado: **88%**; restante **12%**.

## One-shot runtime 07

Request `c6-live-user-admin-membership-runtime-proof-20260812-07`, target `64816601f2cf780c6bc2b315a963d0318d38872b`, request commit `c5588f22751b0200fc7d70996cf4bd6214af3a95`.

- run `31649967019`;
- job `94291913408`;
- artifact `9162195599`;
- digest `sha256:91af7648302218477177f7e2785b4b32bea517e2cdebe0b41cc60d082136891e`.

Antes del fallo:
- autorización exacta: PASS;
- `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT`: PASS;
- Google Cloud DEV auth: PASS;
- selector privado Staff dedicado: PASS;
- role seleccionado: `coordinador`;
- Shopper/Cliente selection: false;
- Auth/password writes: 0.

## STOP_RETRY y causa raíz

El paso `Execute one Hosting deploy and Staff-only runtime gates` falló antes de source gate, Firebase deploy y runtime. Bash reportó `here-document ... wanted NODE` y `syntax error: unexpected end of file`.

Clasificación: `PREFLIGHT_SHELL_SYNTAX_COVERAGE_GAP__NESTED_HEREDOC_INDENTATION`.

El preflight anterior validaba Node/contratos/selectores, pero no compilaba con `bash -n` el bloque shell real de Hosting. Por eso el error sobrevivió al preflight aunque el carril lógico Staff estuviera correcto.

Artifact decisivo: `FAIL_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`; `deploy.attempted=false`, Hosting=0, source=null, runtime=null. El workflow exterior aparece `success` porque el paso execute captura el exit code con `continue-on-error`; para certificación prevalece el artifact sanitizado, no el verde exterior.

`STOP_RETRY` aplicado: no rerun, no segundo request, no segundo Hosting.

## Reparación source-only posterior

Sin repetir la ejecución ni tocar provider después del STOP_RETRY:
- commit `66cffe4a0f236097264d2e0b2f361115464c8e34`: eliminó los heredocs anidados del subshell Hosting y los sustituyó por asserts `node -e`;
- commit `b024fd97cd7360a90a32041eb57bd0b003a029a2`: el preflight ahora extrae el script shell exacto de Hosting, exige `bash -n` PASS y bloquea reintroducción de heredoc anidado.

No se tocó `/app/modules` ni UI de producto. No se disparó nuevo workflow por estas reparaciones.

## Seguridad

- Hosting runtime 07: **0/1 físicamente consumido**.
- Nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes: `0`.
- Segundo Exact Write: `0`.
- Segundo intento: `0`.
- Secretos/tokens expuestos: `false`.
- Merge: `false`.
- Producción: `false`.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado runtime 07=+0%.** M7 no se cierra porque Hosting/runtime no fueron alcanzados.

## Siguiente bloque exacto

Por STOP_RETRY, el one-shot 07 está cerrado. Se requiere **nueva autorización explícita** para un nuevo `HOSTING_RUNTIME_ONCE` bound al HEAD vivo reparado. El preflight actualizado debe pasar `bash -n` antes de provider; solo después podrá ejecutarse máximo un Hosting DEV Staff-only. Con PASS real: cerrar M7 y continuar inmediatamente M8 → M9 → M10.

## Clasificación

- **Reusable CXOrbia:** preflight shell real `bash -n` y eliminación de heredocs anidados frágiles.
- **Exclusivo cliente:** próximo runtime Staff TyA en `cxorbia-backend-dev`.
- **Claude/prototipo:** cero frontend/producto modificado.
- **Academia:** sin cambio hasta runtime PASS.
- **Sin impacto Claude:** workflow, QA tooling, evidencia y docs.
