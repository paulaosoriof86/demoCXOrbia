# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-13 12:24 -06:00
**Estado:** `OWNER_VISIBLE_DEV_LAB_HOSTED__VISUAL_ACCEPTANCE_PENDING__REAL_TYA_CUTOVER_NOT_EXECUTED`

## Bloque ejecutado 2026-08-13 — laboratorio visible pre-go-live

Se avanzó desde planificación a ejecución real en DEV.

### Archivos creados/tocados

- `app/dev-validation/index.html` — nueva superficie DEV visible de pruebas; commit `0083be8c2be8b0deb15bbe5e7f8f8410f972dbc1`.
- `backend/config/corte6-dev-root-entrypoint-hosting-execute.json` — request one-shot para publicar el laboratorio exclusivamente en `cxorbia-backend-dev`; commit `68d8af9a4bf6373696b281dbc5a9ac94c2bbfffb`.
- `app/docs/evidence/owner-visible-dev-validation-lab-20260813.json` — evidencia durable del bloque.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`, `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` e índice vigente — continuidad.

### Publicación DEV comprobada

Workflow `CXOrbia C6 DEV Root Entrypoint Hosting`:
- run `31730303749`;
- job `94548821932`;
- conclusión `SUCCESS`;
- artifact `9192996410`;
- digest `sha256:1302982ffc68e2d9aedf39dafdce0514d70a0f11e362ab3cc5b731c98dab9474`.

El paso `Execute one Hosting deploy and Staff-only runtime gates` terminó `SUCCESS`.

### Qué hace el laboratorio

- Se abre directamente desde Hosting DEV en `/dev-validation/index.html`.
- Ejecuta y muestra en pantalla `PASS/FAIL/BLOCKED` y bitácora temporal.
- Lee HR viva en modo read-only; permite forzar lectura fresca con `fresh=1`.
- Muestra períodos, visitas, shoppers y conteo de disponibles derivado de la lectura actual.
- Comprueba entrypoint canónico, build/source lock y superficies de Dashboard, Proyectos, Visitas, Postulaciones, Certificación, Finanzas y Academia.
- Embebe `/index-backend-dev.html` para que Paula pueda iniciar sesión y comprobar el mismo runtime DEV, rol, tenant, proyecto, período, fuente y navegación visible.

### Qué NO se ejecutó

El E2E que requiere escrituras sintéticas temporales no se presenta como completado: queda `BLOCKED_PENDING_SEPARATE_TEMPORARY_WRITE_AND_CLEANUP_GATE`. No se crearon postulaciones, asignaciones, liquidaciones ni pagos de prueba.

## Evidencia técnica DEV preservada

M1–M10 siguen siendo PASS de calificación técnica DEV. Build calificado `ecc725866acc3eb8`. La publicación del laboratorio no convierte ese 100% en go-live real TyA.

## Seguridad

- Cero Cloud Run deploy adicional.
- Cero HR writes.
- Cero Auth/Firestore/Rules/Storage writes.
- Cero Make/Gemini/pagos.
- Cero merge.
- Cero cutover del dominio/hosting real vigente de TyA.

## Clasificación

- **Reusable CXOrbia:** patrón Finanzas de laboratorio visible trasladado a CXOrbia sin copiar lógica financiera.
- **Exclusivo cliente:** TyA/Cinépolis y reconciliación HR viva.
- **Claude/prototipo:** no se modificaron `/app/modules` ni `/app/core`; hallazgos visuales se documentarán focalizadamente.
- **Academia:** se comprueba publicación del módulo y se validará acceso/ruta por rol con Paula.
- **Sin impacto Claude:** deploy DEV, workflow/evidencia y documentación.
