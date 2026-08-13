# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-13 12:24 -06:00
**Estado:** `OWNER_VISIBLE_DEV_LAB_HOSTED__READONLY_VISUAL_ACCEPTANCE_PENDING__REAL_CUTOVER_PENDING`

## Estado vivo

- Repo `paulaosoriof86/demoCXOrbia`.
- Rama `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- M1–M10: calificación técnica DEV completa.
- Build técnico calificado `ecc725866acc3eb8`.
- DEV root `https://cxorbia-backend-dev.web.app/`.
- Laboratorio visible publicado en `/dev-validation/index.html`.
- Commit del laboratorio `0083be8c2be8b0deb15bbe5e7f8f8410f972dbc1`.
- Commit de ejecución Hosting DEV `68d8af9a4bf6373696b281dbc5a9ac94c2bbfffb`.
- Run Hosting DEV `31730303749`, job `94548821932`: `SUCCESS`.
- Artifact `9192996410`, digest `sha256:1302982ffc68e2d9aedf39dafdce0514d70a0f11e362ab3cc5b731c98dab9474`.

## Avance real de esta iteración

Ya no estamos únicamente en planificación. Se implementó y publicó un laboratorio DEV visible para que Paula abra el servidor de pruebas y observe la ejecución, siguiendo el patrón reutilizable de Finanzas.

La superficie visible:
1. ejecuta controles read-only al cargar;
2. genera bitácora PASS/FAIL/BLOCKED en la misma pantalla;
3. consulta HR viva mediante el endpoint DEV read-only y permite `fresh=1`;
4. muestra períodos, visitas, shoppers y visitas disponibles calculadas desde la lectura recibida;
5. verifica entrypoint canónico, build/source lock y superficies Dashboard, Proyectos, Visitas, Postulaciones, Certificación, Finanzas y Academia;
6. incorpora la plataforma DEV canónica en la misma superficie para login humano;
7. permite comprobar sesión, rol, tenant, proyecto, período, fuente y navegación visible después del login.

## Pendiente inmediato

1. Paula abre `/dev-validation/index.html` y observa la ejecución read-only real.
2. Paula inicia sesión dentro de la plataforma DEV embebida y pulsa `Comprobar sesión y módulos visibles`.
3. Se registra `APROBADO` o una diferencia reproducible.
4. El E2E que requiere escrituras sintéticas temporales permanece `BLOCKED` hasta un gate separado con cleanup exacto; no se simula como PASS.
5. Después de aceptación visual y del E2E autorizado que corresponda, se prepara el gate separado de cutover real TyA.

## Corrección de alcance preservada

El 100% M1–M10 corresponde a calificación técnica DEV. La plataforma actual de TyA todavía no ha sido reemplazada y el dominio/hosting real vigente no ha recibido cutover.

## Seguridad

Este bloque publicó exclusivamente Hosting DEV. Cero Cloud Run deploy adicional, cero HR/Auth/Firestore/Rules/Storage writes, cero Make/Gemini/pagos, cero merge y cero cutover real TyA.

## Clasificación

- Reusable CXOrbia: laboratorio visible de aceptación pre-go-live y bitácora ejecutable en Hosting DEV.
- Exclusivo cliente: TyA/Cinépolis, HR viva, shoppers, visitas y módulos Phase A.
- Claude/prototipo: el laboratorio no parchea módulos del producto; cualquier diferencia visual se documentará por archivo/módulo.
- Academia: la superficie comprueba que Academia esté publicada; contenido y rol se validan en aceptación humana.
- Sin impacto Claude: workflow, evidencia, gate y documentación de seguridad.
