# ACADEMIA — ADDENDUM I4 PROTECTED RUNTIME CLOSE

**Fecha:** 2026-08-19  
**SYNC_EPOCH:** `CXORBIA-20260819-I4-PROTECTED-RUNTIME-CLOSED-38`  
**Estado:** `I4_ACADEMIA_ALIGNMENT_DOCUMENTED__NO_REBUILD_REQUIRED`

## Propósito

Alinear Academia con el comportamiento realmente probado al cerrar I4, sin reconstruir el módulo ni inventar nuevas capacidades.

## Evidencia preservada

- El módulo Academia ya existe y el smoke visual estructural vigente lo renderiza con cursos, lecciones, filtros y rutas por rol; no existe evidencia de P0 que obligue a reescribirlo.
- El source gate de Shopper exige ruta de Academia y certificación dentro del ciclo real.
- El runtime humano canónico probado mantiene Auth/claims/membership, identidad exacta, HR viva, overlays protegidos y `CX.data` bajo una sola autoridad.
- Finanzas mantiene la verdad congelada: mayo 2026 `44/44` pagadas; junio 2026 `2/44` pagadas, `42` pendientes y `Q451` confirmado; `liquidada != pagada`.

## Alineación que debe conservar el contenido

Manuales, cursos, checklists y rutas deben enseñar sin ambigüedad:

1. El carril humano real usa `app/index-backend-dev.html`; demo/source-safe no equivale a prueba provider-backed.
2. La identidad se resuelve por crosswalk exacto; `fuzzyMatching=false`; conflictos pasan a revisión.
3. HR es autoridad operacional y la plataforma conserva trazabilidad de asignaciones; una asignación HR no se convierte en postulación sintética.
4. Reload y nueva pestaña deben conservar la autoridad y contexto autorizados.
5. Liquidación y pago son estados distintos; no inferir pago por liquidación.
6. Mayo y junio deben enseñarse con la verdad financiera canónica indicada arriba, sin inventar fecha, lote o referencia de pago.
7. Acciones mutables deben pasar por command/provider ACK; un preview o gate read-only no es una ejecución real.
8. Los gates one-shot consumidos no se reintentan ni se presentan como acciones pendientes.

## Impacto por rol

- **Admin/Operativo:** autoridad HR/plataforma, revisión de conflictos, trazabilidad y estados financieros honestos.
- **Shopper:** identidad/perfil exactos, histórico, certificaciones ya presentadas, visitas y beneficios/pagos sin reproceso.
- **Cliente:** sin cambio funcional derivado de I4; mantener alcance autorizado.
- **Superadmin/Consultora:** distinguir evidencia provider-backed, source-safe y demo al diagnosticar.

## Pendiente en I5

Después de la validación PREPROD/UAT de la misma build, registrar únicamente diferencias reales de producción y publicar/notificar cambios de manuales o cursos si el comportamiento final difiere. No publicar contenido generado por IA sin revisión humana.

## Clasificación

- **Reusable CXOrbia:** enseñanza de autoridad runtime única, identidad exacta, estados honestos y command/provider ACK.
- **Exclusivo TyA:** cifras Mayo/Junio y flujo HR Cinépolis usado como caso operativo.
- **Claude/prototipo:** sin cambio frontend por I4.
- **Academia:** alineación documental; no reconstrucción.
- **Sin impacto Claude:** evidencia/gates y cierre de I4.

## Seguridad

Este addendum no ejecuta deploy, merge, producción, pagos, Auth/Firestore/HR/Storage writes, Make ni Gemini.
