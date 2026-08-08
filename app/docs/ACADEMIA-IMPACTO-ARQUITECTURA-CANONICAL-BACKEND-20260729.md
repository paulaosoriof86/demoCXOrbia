# ACADEMIA — Impacto arquitectura backend canónica TyA

**Fecha:** 2026-07-29

## Patrón reusable
1. Diferenciar siempre **sistema legacy/origen de migración**, **backend canónico del producto**, **sandbox de prueba** y **Hosting público**.
2. “Backend poblado” no equivale a “legacy contaminado”; primero se inventaría y se clasifica el origen de esos datos.
3. Un sandbox puede servir para descubrir P0 sin convertirse en destino de producción.
4. Migración incremental: reutilizar lo ya materializado y cargar solo delta/faltantes.
5. Cutover: preservar URL pública cuando el negocio lo requiere, con smoke y rollback.
6. Proyecto y periodo son entidades distintas: un mes/ronda no debe convertirse en proyecto por conveniencia de una materialización anterior.
7. Una fuente inconsistente debe quedar fail-closed/review; nunca presentarse como dato confiable.

## Caso TyA
- legacy TyA: origen de shoppers/certificaciones útiles, sistema a retirar;
- HR: fuente principal de visitas/operación;
- `cxorbia-backend-dev`: backend DEV canónico del primer tenant TyA;
- sandbox Corte 4: evidencia técnica, no backend destino;
- Hosting público actual: URL a conservar en producción;
- plan canónico: proyecto padre `cinepolis` → periodos → visitas;
- julio 2026: GT34/HN10 consistente;
- `AGOSTO 26 HN`: HOLD de fuente porque sus 34 filas tienen País=GT.

## Contenido que debe reflejar Academia
### Proyecto vs periodo
- Proyecto: configuración padre de cliente, países, monedas, HR, cuestionario, certificación, pagos e integraciones.
- Periodo: mes/ronda operativo dentro del proyecto.
- Cambiar periodo no crea otro proyecto ni altera la configuración padre.

### Certificaciones
- Conservar historial presentado/aprobado/reprobado cuando la fuente legacy lo confirme.
- No pedir repetición por pérdida de carryover.
- Diferenciar `fuente pendiente`, `presentada`, `aprobada`, `reprobada` y `requiere revisión`.

### Calidad de fuente
- Enseñar que `AGOSTO 26 HN` está bloqueado por inconsistencia país-pestaña hasta corrección.
- Checklist operativo: verificar proyecto, periodo, país, conteos y estado de fuente antes de sincronizar/materializar.
- Un HOLD de fuente protege operación; no es equivalente a visita cancelada ni a fallo del shopper.

### Migración/cutover
- Inventario read-only antes de writes.
- Provider compare `create/update/noop/review`.
- Writes solo por delta autorizado.
- Smoke + rollback antes de reemplazar la app legacy en la misma URL pública.

## Rutas/manuales
Agregar este patrón a arquitectura, migración, QA, troubleshooting, configuración de proyecto y operación Admin/Coordinador. Mantener Manual y Curso como objetos distintos y actualizar checklists/glosario/errores frecuentes.

## Clasificación
- **Reusable CXOrbia:** sí.
- **Exclusivo TyA:** IDs, HR y caso agosto HN.
- **Claude/prototipo:** sin nueva candidata; preservar modelo proyecto-periodo y estados honestos.
