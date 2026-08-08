# Auditoria integral candidata V85 Claude - CXOrbia TyA

Fecha: 2026-07-04
Candidata auditada: `Prototype development request CXOrbia V85.zip`
Baseline comparado: `Prototype development request CXOrbia V84.zip`

## Decision

V85 no queda aceptada como source lock. Aunque el ZIP tiene SHA distinto al ZIP V84, el contenido extraido es identico a V84. No hay archivos agregados, eliminados ni modificados. Por lo tanto, los puntos que Claude reporta como solucionados no aparecen aplicados en el paquete recibido.

## Hashes ZIP

- V84: `09722e4ff1c5c9461d08671dc3e1f0457ececccdd3ad79a04311a7b9ade34c03`
- V85: `042d62a47cfc3f6eadb624b4d0cf6ca42b324be15aa2c1c63b3ab13871d3219f`

El ZIP fue reempaquetado o generado con metadatos distintos, pero el arbol de archivos extraido no cambio.

## Comparacion forense de contenido

- Archivos `app/` V84: 97.
- Archivos `app/` V85: 97.
- Archivos agregados: 0.
- Archivos eliminados: 0.
- Archivos modificados: 0.
- Hashes de archivos extraidos: identicos.

## Validacion tecnica V85

- JS revisados con `node --check`: 61.
- Fallas JS: 0.
- Scripts cargados por `index.html`: 61.
- Scripts locales: 59.
- Scripts locales faltantes: 0.
- Scripts duplicados: 0.

## P0 que siguen vivos en V85

1. `modules/cuestionario-shopper.js` sigue con texto visible `marca la visita como cuestionario enviado`.
2. `modules/postulaciones.js` sigue con toasts `HR sincronizada`.
3. `modules/misvisitas.js` sigue prometiendo que cada accion sincroniza hoja de ruta y mueve liquidacion.
4. `modules/dashboard.js` y `modules/postulaciones.js` siguen usando `WhatsApp enviado`.
5. `modules/academia.js` sigue con `Sincronia automatica`, `sincroniza la HR externa` y `mueve la liquidacion`.
6. `docs/ADDENDUM-V87-PHASE-A.md` sigue dentro de la candidata con versionado residual V87/Base V86 aunque el ZIP recibido dice V85.

## Senales revisadas

| Senal | Conteo V85 | Lectura |
|---|---:|---|
| `cuestionario enviado` | 9 | Sigue presente. |
| `HR sincronizada` | 3 | Sigue presente. |
| `WhatsApp enviado` | 4 | Sigue presente. |
| `Sincronia automatica` / `Sincronía automática` | 1 | Sigue presente. |
| `sincroniza la HR externa` | 1 | Sigue presente. |
| `mueve la liquidacion/liquidación` | 1 | Sigue presente. |
| `availableFrom` | 0 | No incorporo visit lifecycle/reservas. |
| `outboxStatus` | 0 | No incorporo notification outbox. |
| `mailboxId` | 0 | No incorporo email/user mailbox. |
| `formVersion` | 0 | No incorporo ficha dinamica/versionado. |

## Que conserva de V84

Como el contenido es identico, conserva avances parciales de V84:

- `revision-admin.js` con `status`, `projectId`, `hrRowId` y texto realizado/completado.
- Mejoras parciales de Academia.
- Handler honesto de `syncHR`.

## Evaluacion Academia

No hay cambios en Academia frente a V84. Siguen vigentes los pendientes:

1. Falta profundizar notification outbox.
2. Falta email/user mailbox.
3. Falta ficha dinamica/versionado.
4. Falta assignment sync/conflicts en contenido profundo.
5. Falta visit lifecycle/reservas con `availableFrom`, franja, quincena y override.
6. Siguen textos que prometen sincronizacion automatica, HR externa y liquidacion.
7. Checklists siguen sin interactividad/persistencia real.

## Decision para Claude

Pedir V86 correctiva real sobre V85/V84. Debe generar cambios efectivos en archivos y no solo reportar que estan solucionados.

## Estado seguro de esta auditoria

- No se aplico ningun cambio frontend desde backend.
- No hubo deploy.
- No hubo merge.
- No se activo runtime.
- No se leyo ni importo fuente real.
- No se escribio Firestore, HR, Storage, Make, Gemini, correo ni pagos.
- No se procesaron datos sensibles.
