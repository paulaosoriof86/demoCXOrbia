# ACADEMIA — IMPACTO R20/M1 TECHNICAL PASS

**Fecha:** 2026-07-23  
**Estado:** `DOCUMENTADO_NO_BLOQUEANTE`

## Contenido reusable a incorporar

### Fuente viva y snapshot

- La HR es la fuente operacional.
- Un snapshot sirve para arrancar y validar, pero la lectura viva se actualiza mediante `sourceRevision`.
- `fresh=1` solicita una lectura fresca y no debe provocar reload completo.
- El último dato válido permanece visible mientras se actualiza.

### Encabezados por contrato

- No se programa una regla especial para un mes.
- Las hojas pueden usar `full_identity` o `tab_scoped_compact`.
- País e identidad se resuelven según la variante declarada.
- Si la estructura es ambigua, el sistema debe detenerse y revisar; nunca adivinar.

### Identidad de visita

- `visitId/hrRowId`, `sourceTab` y `sourceRow` son evidencia de identidad.
- La ausencia de `ID CINEMA` no autoriza inventarlo.
- Nunca deduplicar por nombre o coincidencia visual.

### Estados operativos

Deben enseñarse por separado:

- asignación;
- agendamiento;
- realización;
- cuestionario;
- submitido;
- candidatura de liquidación;
- liquidación confirmada;
- pago confirmado.

Una visita submitida no está automáticamente pagada.

### Ausencia distinta de cero

- `0`: fuente confirmó valor cero.
- `null`: la fuente no entregó el dato.
- Un gate nunca debe convertir ausencia en cero para conseguir PASS.

### Evidencia y decisiones

- PASS técnico: contratos y comportamiento automatizado aprobados.
- Validación visual: una persona confirma que la experiencia y los datos visibles son correctos.
- Freeze: baseline aprobada después de ambos.
- Producción: autorización y cutover separados.

## Caso TyA documentado

El run read-only validó 14 periodos, 28 tabs y 616 visitas, con proyecto/periodo/KPIs/histórico coherentes. Estos números ilustran evidencia actual y no deben enseñarse como constantes del producto.

Julio 2026 mostró 44 visitas, 43 asignadas, 29 realizadas, 28 cuestionarios y 20 submitidas. La Academia debe aclarar que una nueva lectura puede cambiar estos conteos sin cambiar el contrato.

## Roles

- **Admin/Operativo:** interpretar estados, sourceRevision, conflictos y gates.
- **Cliente:** distinguir dato confirmado, pendiente de fuente y no aplicable.
- **Shopper:** comprender identidad, disponibles, asignadas y privacidad fail-closed.
- **Equipo técnico:** mantener atomicidad, hashes, source lock y cero writes no autorizados.

## Impacto actual

No se modifica `app/modules/academia.js` en este bloque. La incorporación curricular queda pendiente P1/P2 y no bloquea Phase A ni producción controlada.

## Clasificación

- **Reusable CXOrbia:** todo el contenido conceptual.
- **Exclusivo cliente:** ejemplo TyA/GT/HN.
- **Claude/prototipo:** incorporación futura, no requerida ahora.
- **Academia:** impacto directo documentado.
- **Sin impacto Claude:** ejecución de runners y artifacts.
