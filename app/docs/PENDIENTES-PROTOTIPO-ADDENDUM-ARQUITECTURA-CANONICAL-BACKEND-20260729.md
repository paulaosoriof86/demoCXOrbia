# PENDIENTES PROTOTIPO — Arquitectura backend TyA corregida

**Fecha:** 2026-07-29

## No es pendiente de frontend
La corrección legacy vs backend canónico no requiere rediseño ni nueva candidata.

## Pendientes vivos de prototipo / Claude
1. Preservar en futuras candidatas los fixes core de fail-closed/empty-backend/role-switch/asset-integrity.
2. Mantener **Proyecto** y **Periodo** como conceptos distintos; meses/países no deben aparecer como proyectos independientes en el producto.
3. Cuando una fuente tenga conflicto (caso `AGOSTO 26 HN`), mostrar estado honesto de revisión/bloqueo y no datos aparentemente válidos.
4. Cuando el carryover de certificaciones esté materializado, no pedir nuevamente certificación ya presentada/aprobada salvo regla explícita del proyecto.
5. No mostrar copy técnico de backend en producción final.
6. Backlog heredado no bloqueante: PDF con gráficas, Excel con formato, reportKit/copy.

## Backend/operación, no Claude
- inventario de `cxorbia-backend-dev`: PASS;
- reconciliación Phase A incremental: PASS;
- dos registros extra/stale localizados, todavía sin write;
- HR viva: 15 periodos / 684 visitas; julio GT/HN consistente;
- `AGOSTO 26 HN`: HOLD por 34 filas con País=GT;
- plan canónico offline R6/R16D: PASS, 1 proyecto padre / 14 periodos / 616 visitas / 572 liquidaciones;
- R16E provider compare read-only pendiente de autorización exacta;
- refresh legacy shoppers/certificaciones pendiente;
- cutover final conserva Hosting público actual.

## Regla antirreproceso
- No crear nueva base ni nueva candidata para resolver una confusión documental de identidad de proyecto.
- No remodelar frontend para reflejar estructuras Firestore antiguas antes del provider compare canónico.
- No materializar agosto HN mientras la fuente siga contradictoria.
