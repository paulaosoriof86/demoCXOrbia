# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-13 11:18 -06:00
**Estado:** `DEV_TECHNICAL_QUALIFICATION_100__VISUAL_ACCEPTANCE_PENDING__REAL_CUTOVER_PENDING`

## Estado vivo

- Repo `paulaosoriof86/demoCXOrbia`.
- Rama `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- M1–M10: calificación técnica DEV completa.
- Build DEV `ecc725866acc3eb8`.
- DEV release `1786638785456000`.
- DEV version `cd1e5b7d42cb846b`, `FINALIZED`.
- DEV root verificado: `https://cxorbia-backend-dev.web.app/`.

## Corrección de alcance

El 100% certificado previamente corresponde a la **calificación técnica DEV / pre-go-live**, no al reemplazo de la plataforma actual de TyA. No se ha ejecutado el cutover sobre el hosting real vigente de TyA y la plataforma actual permanece sin reemplazar.

## Siguiente bloque obligatorio

Con Paula visualizando el DEV:
1. validar tenant TyA, proyecto y módulos por rol;
2. ejecutar flujos E2E con datos exclusivamente sintéticos y aislados;
3. reconciliar HR viva read-only: periodos, shoppers, visitas y visitas disponibles actuales;
4. validar estabilidad/reload y consistencia entre módulos;
5. solo si todo pasa, preparar gate separado para el cutover real TyA.

No usar datos sintéticos como fuente final. Cero escritura a HR. Cero merge. Cero cutover real hasta aceptación visual.

## Clasificación

- Reusable CXOrbia: aceptación visual previa a cutover y separación DEV/producción real.
- Exclusivo cliente: validaciones TyA/Cinépolis y HR viva.
- Claude/prototipo: cualquier hallazgo visual se documenta; no se parchea desde backend.
- Academia: validar ruta/módulo visible por rol cuando corresponda.
- Sin impacto Claude: corrección semántica de estado y evidencia técnica.
