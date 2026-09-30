# Auditoria forense V87 CXOrbia TyA

Fecha: 2026-07-05

## Contexto

Paula adjunto `Prototype development request CXOrbia V87.zip` como nueva candidata de Claude. La instruccion fue auditar con alto nivel de detalle, priorizar lo critico para produccion, no asumir avances, acumular pendientes y continuar solo si no hay bloqueo critico.

## Base de comparacion

- ZIP anterior disponible: `Prototype development request CXOrbia V86.zip`.
- ZIP nuevo: `Prototype development request CXOrbia V87.zip`.
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama backend/documental: `docs-tya-v6-v71-audit`.
- PR: #7 draft/open/no merge.
- Ultima baseline viva antes de este ZIP: ultima candidata auditada de continuidad backend, no source lock final ni produccion.

## Resultado ejecutivo

V87 no trae delta real de archivos frente a V86.

- Archivos app V86: 97.
- Archivos app V87: 97.
- Agregados: 0.
- Eliminados: 0.
- Modificados por contenido: 0.
- Hash ZIP V86: `2d05c58457d9426b69e46facbe8aa2b7db540d7c5fb4c1aa0b07e11a973bd43b`.
- Hash ZIP V87: `26a9ac226ffe731f44e1c2d020fff5542496f07dbd68d5bbc96f354273a557d3`.

Interpretacion: el contenedor ZIP tiene hash distinto, pero el contenido de `app/` es identico al ZIP anterior. Por metodologia, esto se trata como reempaque/reupload sin cambios de contenido y no cambia la baseline viva.

## Validaciones tecnicas ejecutadas localmente

- Total archivos JS revisados con `node --check`: 61.
- Fallas de sintaxis JS: 0.
- `index.html` scripts totales: 61.
- Scripts locales: 59.
- Scripts externos: 2.
- Scripts locales faltantes: 0.
- Scripts locales duplicados: 0.
- JS no cargados por `index.html`: `docs/migration/sample-fields.js` y `sw.js`.
- Mojibake detectado: solo una mencion documental intencional en `docs/AUDITORIA-ENTREGA-CLAUDE.md`, checklist de mojibake; no se detecto mojibake operativo nuevo.

## Decision de baseline

No se empalma V87 como nueva baseline porque no hay delta real frente a V86. Se conserva la baseline auditada vigente y backend seguro continua sobre la ultima baseline auditada valida.

V87 no debe presentarse como version correctiva completada. Puede documentarse como reupload/paquete sin cambios de contenido.

## Hallazgo critico para produccion

Aunque la estructura no esta rota, los P0 visibles siguen vivos. Para produccion, estos textos son criticos porque prometen acciones reales que los gates no permiten todavia: sincronizacion HR, envio de WhatsApp, envio de correo, sincronias automaticas y movimiento de liquidaciones.

Estos textos pueden inducir a error operativo y no deben pasar a produccion si la plataforma no tiene Make/HR/email/WhatsApp/pagos reales activos y autorizados.

### P0 vivos por archivo

1. `modules/postulaciones.js`
   - Linea 134: `Aprobada · WhatsApp enviado al shopper`.
   - Linea 157: `Aprobada · WhatsApp enviado`.
   - Linea 175: `Nueva fecha autorizada · shopper notificado · HR sincronizada`.
   - Linea 185: `Asignación actualizada · HR sincronizada`.

2. `modules/dashboard.js`
   - Linea 62: `Correo enviado a ... shopper(s) (Make/Outlook)`.
   - Linea 242: `WhatsApp enviado (Make)`.

3. `core/topbar.js`
   - Linea 111: `Correo enviado a ...`.

4. `modules/correo.js`
   - Lineas 237 y 266: `Correo enviado` cuando `conn` es verdadero y `Correo guardado en Enviados · se despachará al conectar tu cuenta` cuando no lo es. Debe revisarse contra el gate provider/mailbox: si no hay proveedor real activo, no debe decir enviado ni enviado a carpeta real.

5. `modules/academia.js`
   - Linea 166: `Sincronía automática`, `sincroniza la HR externa (Google Sheets)` y `mueve la liquidación`.

6. `core/automations.js`
   - Linea 22: plantilla/titulo `Cuestionario enviado`.
   - Linea 149: catalogo evento `cuestionario: Cuestionario enviado`.
   - Nota: aunque sea data/config interna, puede alimentar UI, logs, notificaciones o Academia; debe alinearse a `cuestionario completado/realizado pendiente revision`.

7. `core/manuales-data.js`
   - Linea 147: manual visible indica seguimiento hasta `cuestionario enviado`.

8. `core/liquidacion.js`
   - Linea 7: comentario `cuestionario enviado -> pendiente_submitir`. Es menor por ser comentario, pero conviene alinearlo para evitar que vuelva a propagarse a UI/docs.

## P0 confirmado aun no resuelto

- `cuestionario enviado` sigue apareciendo en codigo/config/docs.
- `HR sincronizada` sigue apareciendo en UI operativa.
- `WhatsApp enviado` sigue apareciendo en UI operativa.
- `Correo enviado` sigue apareciendo en UI operativa.
- `Sincronía automática` sigue apareciendo en Academia.
- `sincroniza la HR externa` sigue apareciendo en Academia.
- `mueve la liquidación` sigue apareciendo en Academia.

## Senales backend recientes que siguen ausentes en prototipo

Busqueda en V87 arrojo 0 apariciones para estas señales recientes:

- `availableFrom`
- `outboxStatus`
- `mailboxId`
- `formVersion`
- `externalFolderRef`
- `crmEntityId`

Esto confirma que la candidata todavia no incorpora semanticamente los ultimos bloques backend: notification outbox, mailbox por usuario, CRM external folder refs, formulario dinamico versionado, visit lifecycle y readiness.

## Que si esta bien de la candidata

1. La estructura `app/` se mantiene.
2. No hay archivos eliminados frente al ZIP anterior.
3. No hay scripts faltantes en `index.html`.
4. No hay scripts locales duplicados.
5. No hay fallas de sintaxis JS con `node --check`.
6. `modules/revision-admin.js` contiene separacion de cuestionario/revision/submitido/liquidacion y no contiene `Cuestionario enviado` operativo.
7. `modules/postulaciones.js` tiene handler para `syncHR` con texto de pendiente backend, pero coexiste con toasts P0 que aun dicen `HR sincronizada` y `WhatsApp enviado`.

## Que no se puede dar por resuelto

El archivo `docs/ADDENDUM-V87-PHASE-A.md` declara correcciones P0, pero el paquete V87 no trae delta frente a V86 y los textos P0 siguen presentes en archivos operativos. Por tanto, la afirmacion de correccion debe tratarse como incompleta o heredada, no como cierre real del P0.

## Priorizacion para produccion

### P0 obligatorio antes de produccion

1. Reemplazar todos los textos visibles de envio/sync real por estados honestos:
   - `WhatsApp fallback manual`, `copia lista`, `pendiente confirmacion manual`.
   - `Correo draft`, `correo preparado`, `proveedor pendiente`, `registro manual`.
   - `HR sync pendiente`, `preview`, `requiere revision`, `gate apagado`.
   - `liquidacion candidata`, `pago pendiente`, `movimiento preview`, `revision manual`.
   - `cuestionario realizado/completado`, `pendiente revision`, `pendiente submitido`.

2. No declarar produccion lista mientras existan textos visibles que prometen acciones reales sin gate activo.

3. Corregir Academia solo en los textos P0 minimos; no expandir cursos ni contenido profundo si Claude esta por perder capacidad.

### P1 importante, no necesariamente bloqueante si P0 queda corregido

1. Incorporar señales backend recientes en UI/readiness cuando corresponda: `availableFrom`, `outboxStatus`, `mailboxId`, `formVersion`, `externalFolderRef`, `crmEntityId`.
2. Readiness dashboard debe separar preview ready, prototype pending, backend pending, missing input, review required y real gate off.
3. Ranking/scoring debe mostrarse como apoyo de revision, no decision automatica.
4. Liquidaciones/Mis beneficios debe separar honorario, Boleto, Combo, reembolso total, total, estado de pago, lote y movimiento individual.
5. Academia profunda queda pendiente para bloque posterior; no debe impedir la correccion P0 minima para salida controlada.

## Bloques backend recientes que deben acumularse para Claude

Claude debe recibir que backend ya agrego/documento los siguientes bloques:

1. CRM external folder refs preview.
2. Shopper communication history preview.
3. Shopper ranking/scoring preview.
4. Project/tenant rule versioning preview.
5. Rule change changelog/notification preview.
6. Release readiness snapshot preview.
7. Synthetic input pack preview.
8. Synthetic fixtures manifest Phase A.

Las señales minimas para incorporar son: `availableFrom`, `outboxStatus`, `mailboxId`, `formVersion`, `externalFolderRef`, `crmEntityId`.

## Estado seguro de esta auditoria

- Auditoria local/documental del ZIP.
- Sin cambios frontend aplicados por backend.
- Sin deploy.
- Sin merge.
- Sin produccion.
- Sin import real.
- Sin Firestore/HR/Storage writes.
- Sin Make/Gemini/email/WhatsApp real.
- Sin pagos reales.
- Sin datos sensibles.

## Decision final

V87 no queda como nueva baseline porque no trae cambios de contenido frente a V86.

Para produccion, hay P0 criticos de honestidad operativa que deben corregirse antes de publicar. Si Claude solo tiene poca capacidad, debe enfocarse exclusivamente en estos textos P0 y no en ampliar Academia.

Backend seguro puede continuar en documentacion/validadores/gates, pero no se debe declarar production ready ni source lock final hasta que se reciba una candidata con P0 corregidos y sea auditada nuevamente.
