# Auditoria integral candidata V86 Claude - CXOrbia TyA

Fecha: 2026-07-04
Candidata auditada: `Prototype development request CXOrbia V86.zip`
Baseline comparado: `Prototype development request CXOrbia V85.zip` / V84.

## Decision

V86 si contiene cambios reales frente a V85/V84, pero no queda aceptada como source lock final ni candidata lista para produccion. Se acepta como baseline auditada de continuidad para backend protegido: se puede seguir backend en contratos, docs, validators y gates sobre esta decision, sin tocar modulos UI.

## Resultado tecnico

- Archivos `app/` V85: 97.
- Archivos `app/` V86: 97.
- Archivos agregados: 0.
- Archivos eliminados: 0.
- Archivos modificados: 3.
- Modificados: `modules/academia.js`, `modules/dashboard.js`, `modules/misvisitas.js`.
- JS revisados con `node --check`: 61.
- Fallas JS: 0.
- Scripts cargados por `index.html`: 61.
- Scripts locales: 59.
- Scripts locales faltantes: 0.
- Scripts duplicados: 0.

## Que si atendio V86

### 1. Mis visitas

`modules/misvisitas.js` corrige el texto principal del aiBox:

- cambia `enviar cuestionario` por `completar cuestionario`;
- ya no afirma que cada accion sincroniza la HR y mueve liquidacion como hecho real;
- ahora indica que la sincronia con hoja de ruta y movimiento de liquidacion se reflejan cuando sync/backend este activo;
- marca el flujo como preview/pendiente backend.

Esto atiende parcialmente un P0 de V84/V85.

### 2. Dashboard

`modules/dashboard.js` corrige algunos toasts:

- `WhatsApp enviado via Make` pasa a `WhatsApp preparado via Make ... gate activo`;
- correo individual pasa a `Borrador de correo preparado`;
- recordatorio masivo pasa a `Recordatorio masivo preparado ... pendiente backend`.

Esto mejora la honestidad de estados, pero no limpia todo el modulo.

### 3. Academia

`modules/academia.js` corrige una frase del flujo operativo:

- cambia `WhatsApp automatico` por notificacion preparada al shopper por WhatsApp/in-app segun configuracion, pendiente backend.

Esto es mejora semantica, pero minima.

## Que no atendio V86

### P0 todavia vivo

1. `modules/cuestionario-shopper.js` sigue diciendo `marca la visita como cuestionario enviado`.
2. `modules/postulaciones.js` sigue diciendo `HR sincronizada` en toasts visibles.
3. `modules/postulaciones.js` sigue diciendo `WhatsApp enviado` en aprobaciones.
4. `modules/dashboard.js` conserva `WhatsApp enviado (Make)` en accion manual de WA.
5. `modules/dashboard.js` conserva `Correo enviado a n shopper(s)` en seleccion masiva.
6. `modules/academia.js` conserva `Sincronia automatica`, `sincroniza la HR externa` y `mueve la liquidacion`.
7. `docs/ADDENDUM-V87-PHASE-A.md` sigue con versionado residual dentro de candidata V86; debe revisarse en la proxima candidata.

## Conteo de senales V86

| Senal | Conteo total V86 | Lectura |
|---|---:|---|
| `cuestionario enviado` | 14 | Sigue presente en modulos/core/docs; flujo shopper visible sigue pendiente. |
| `HR sincronizada` | 3 | Sin mejora frente a V85. |
| `WhatsApp enviado` | 3 | Mejora parcial: baja de 4 a 3. |
| `Correo enviado` | 4 | Mejora parcial: baja de 6 a 4. |
| `Sincronia/Sincronía automatica` | 1 | Sigue en Academia. |
| `sincroniza la HR externa` | 1 | Sigue en Academia. |
| `mueve la liquidacion/liquidación` | 1 | Sigue en Academia. |
| `availableFrom` | 0 | Falta visit lifecycle/reservas. |
| `outboxStatus` | 0 | Falta notification outbox. |
| `mailboxId` | 0 | Falta email/user mailbox. |
| `formVersion` | 0 | Falta ficha dinamica/versionado. |
| `externalFolderRef` | 0 | Falta CRM external folder refs. |
| `crmEntityId` | 0 | Falta CRM external folder refs. |

## Evaluacion Academia

V86 mejora solo una frase. No cumple todavia el addendum de Academia profunda:

1. Falta profundizar notification outbox.
2. Falta email/user mailbox.
3. Falta ficha dinamica/versionado.
4. Falta CRM external folder refs.
5. Falta assignment sync/conflicts.
6. Falta visit lifecycle/reservas con `availableFrom`, franja, quincena y override.
7. Siguen textos que prometen sincronia automatica, HR externa y liquidacion.
8. Checklists siguen sin interactividad/persistencia real.

## Empalme metodologico

V86 queda como candidata auditada de continuidad backend, no como source lock final. El backend puede continuar sobre esta decision porque los siguientes bloques son seguros, documentales y sin runtime: contratos, validadores, docs y gates.

## Decision para Claude

Pedir V87 correctiva sobre V86. Debe conservar las mejoras reales de V86 y corregir los P0 restantes.

## Estado seguro de esta auditoria

- No se aplico ningun cambio frontend desde backend.
- No hubo deploy.
- No hubo merge.
- No se activo runtime.
- No se leyo ni importo fuente real.
- No se escribio Firestore, HR, Storage, Make, Gemini, correo ni pagos.
- No se procesaron datos sensibles.
