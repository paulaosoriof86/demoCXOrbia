# ACADEMIA — IMPACTO LEGACY SHOPPERS/CERTIFICACIONES R17N

Fecha: 2026-07-29

## Conceptos que deben quedar reflejados
- **Perfil canónico vs referencia de asignación:** HR puede traer una referencia operativa protegida que todavía no está enlazada a un perfil de shopper.
- **Identidad estable:** ID/código estable o evidencia transaccional exacta prevalecen; nombre solo nunca permite dedupe automático.
- **Carryover de certificaciones:** una certificación ya presentada debe conservar intento, estado, score disponible y trazabilidad, evitando duplicar espejos de recuperación.
- **Fill-missing-only:** un dato legado puede completar un campo vacío, pero no debe sobreescribir silenciosamente un valor canónico no vacío.
- **Review:** conflictos de identidad/fuente pasan a revisión; no se resuelven por semejanza visual.

## Caso TyA documentado
- 149 shoppers únicos recuperados del legacy.
- 78 certificaciones útiles.
- 30 recovery mirrors colapsados.
- 22 perfiles vinculados por transformación determinística del mismo ID técnico.
- 6 coincidencias solo por nombre y 1 conflicto de fuente permanecen HOLD.
- 210 referencias HR no tienen crosswalk técnico directo con los shoppers existentes; siguiente aprendizaje: resolver mediante identidad exacta de una transacción/visita cuando exista.

## Rutas por rol / notificaciones
- Admin/coordinación: debe entender estados `linked`, `pending_crosswalk`, `review_required` cuando la capa productiva los exponga.
- Shopper: nunca mostrar mensajes que sugieran que debe recertificarse si existe carryover válido.
- Notificaciones: no disparar solicitudes de certificación mientras el enlace de identidad esté en HOLD.

No modifica contenido frontend en este bloque; queda como requisito de sincronización futura de Academia/manuales.
