# Auditoria complementaria V86 - delta vs acumulado Codex

Fecha: 2026-07-04

## Motivo

Paula compartio reporte de Codex con cambios que parecian no coincidir con la auditoria V86. Se reviso de nuevo el ZIP V86 contra V85/V84/V82 para separar:

1. Cambios reales nuevos de V86 frente a V85/V84.
2. Cambios acumulados heredados desde V82/V83/V84 que Codex reporta correctamente, pero que no son nuevos de V86.
3. Pendientes que siguen vivos aunque Claude/Codex los mencione como atendidos.

## Conclusion honesta

La auditoria V86 original fue correcta como delta V86 vs V85/V84: V86 modifica 3 archivos (`modules/academia.js`, `modules/dashboard.js`, `modules/misvisitas.js`).

Pero el reporte de Codex es principalmente acumulado desde una base anterior: incluye cambios ya existentes en V82/V83/V84, no necesariamente cambios nuevos de V86. Faltaba explicarlo de forma mas clara para evitar confusion.

## Comparacion por version

### V82 -> V83

- Agregados: 0.
- Eliminados: 0.
- Modificados: 2.
- Modificados: `app/modules/academia.js`, `app/styles/layout.css`.

### V83 -> V84

- Agregados: 1: `app/docs/ADDENDUM-V87-PHASE-A.md`.
- Eliminados: 0.
- Modificados: 3.
- Modificados: `app/modules/academia.js`, `app/modules/postulaciones.js`, `app/modules/revision-admin.js`.

### V84 -> V85

- Agregados: 0.
- Eliminados: 0.
- Modificados: 0.

### V85 -> V86

- Agregados: 0.
- Eliminados: 0.
- Modificados: 3.
- Modificados: `app/modules/academia.js`, `app/modules/dashboard.js`, `app/modules/misvisitas.js`.

### V82 -> V86 acumulado

- Agregados: 1: `app/docs/ADDENDUM-V87-PHASE-A.md`.
- Eliminados: 0.
- Modificados: 6.
- Modificados: `app/modules/academia.js`, `app/modules/dashboard.js`, `app/modules/misvisitas.js`, `app/modules/postulaciones.js`, `app/modules/revision-admin.js`, `app/styles/layout.css`.

## Respuesta punto por punto al reporte Codex

| Punto Codex | Estado real en V86 | Lectura |
|---|---|---|
| Se agrega `app/modules/revision-admin.js` | El archivo ya existe desde V82 en los ZIP disponibles; fue modificado en V84 y no cambio en V86. | Codex probablemente compara contra una base anterior a V82 o contra `main` local. No es cambio nuevo de V86. |
| Se carga ese modulo desde `index.html` | `index.html` esta igual desde V82 a V86. | Carga existente/heredada, no cambio nuevo de V86. |
| Se agregan `ADDENDUM-V82`, `ADDENDUM-V87`, `RESUMEN-PARA-CLAUDE` | `ADDENDUM-V82` y `RESUMEN-PARA-CLAUDE` existen desde V82; `ADDENDUM-V87` aparece en V84; ninguno cambia en V86. | Es acumulado, no delta V86. |
| Se actualiza `PENDIENTES-PROTOTIPO.md` | El archivo existe desde V82 y no cambia entre V82 y V86. | En el ZIP V86 no hay cambio frente a V82/V84/V85. |
| `revisionStore` y estados canonicos | Estan presentes en `revision-admin.js`, pero no son nuevos de V86. | Heredado de V82/V84 segun version disponible. |
| Estructura backend-ready en revision admin | Esta presente; V84 agrego mejoras `status`, `projectId`, `hrRowId`. | Correcto como avance acumulado, no nuevo V86. |
| HR-driven no permite submitido sin nota/ref HR | Existe como logica acumulada en revision admin. | No es cambio nuevo V86. |
| Academia gran ampliacion | Gran ampliacion real viene de V83/V84; V86 solo mejora una frase puntual. | Codex resume acumulado. |
| Cuestionario shopper unifica modos y link por visita | `cuestionario-shopper.js` no cambia desde V82 a V86. | Existia antes; no es correccion nueva V86. Ademas aun queda texto `cuestionario enviado`. |
| Proyecto wizard qMode y visitLinkField | `proyecto-wizard.js` no cambia desde V82 a V86. | Existia antes; no nuevo V86. |
| Dashboard cambia correo enviado por borrador preparado | Parcialmente verdadero en V86: algunos toasts cambiaron, pero quedan otros `Correo enviado` y `WhatsApp enviado`. | Cambio nuevo parcial V86. |
| Postulaciones handler syncHR | Cambio real de V84; no nuevo V86. | Sigue pendiente eliminar `HR sincronizada` y `WhatsApp enviado`. |
| Layout.css marca Academia/manuales | Cambio real de V83, no V86. | Acumulado. |
| app.js copy PWA | `app.js` no cambia desde V82 a V86. | No nuevo V86. |
| novedades nvBanner / saas-console V79 | Ambos archivos no cambian desde V82 a V86. | No nuevo V86. |

## Puntos que siguen pendientes aunque Codex los reporte como atendidos

1. `modules/cuestionario-shopper.js` sigue teniendo texto visible `marca la visita como cuestionario enviado`.
2. `modules/postulaciones.js` sigue teniendo `HR sincronizada`.
3. `modules/postulaciones.js` sigue teniendo `WhatsApp enviado`.
4. `modules/dashboard.js` sigue teniendo `WhatsApp enviado (Make)` en una accion.
5. `modules/dashboard.js` sigue teniendo `Correo enviado a ... shopper(s)` en seleccion masiva.
6. `modules/academia.js` sigue teniendo `Sincronía automática`, `sincroniza la HR externa` y `mueve la liquidación`.
7. En V86 no aparecen `availableFrom`, `outboxStatus`, `mailboxId`, `formVersion`, `externalFolderRef` ni `crmEntityId`, por lo que los bloques backend recientes aun no estan reflejados profundamente en prototipo/Academia.

## Decision metodologica

- La auditoria V86 debe leerse como delta frente a V85/V84.
- El reporte Codex debe leerse como acumulado desde una base anterior.
- Para evitar reproceso, V86 se mantiene como candidata auditada de continuidad backend, no source lock final.
- Cuando Claude vuelva, debe recibir el paquete V86 y pedir V87 correctiva sobre V86.

## Estado seguro

- No se modifico frontend.
- No se hizo deploy.
- No se hizo merge.
- No se activo runtime.
- No se leyo ni importo fuente real.
- No se escribio Firestore, HR, Storage, Make, Gemini, correo ni pagos.
- No se procesaron datos sensibles.
