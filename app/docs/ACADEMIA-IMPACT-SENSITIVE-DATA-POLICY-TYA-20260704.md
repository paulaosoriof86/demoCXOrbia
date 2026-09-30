# Academia impact - Sensitive data policy TyA

Fecha: 2026-07-04

## Bloque relacionado

- `app/contracts/sensitive-data-policy-phase-a.tya.contract.json`
- `tools/migration/tya-sensitive-data-policy-validator.mjs`
- `app/docs/SENSITIVE-DATA-POLICY-PHASE-A-TYA-20260704.md`

## Objetivo Academia

Convertir la politica de datos sensibles en aprendizaje operativo por rol. Academia debe explicar que informacion puede verse, que informacion esta protegida, que nunca se sube al repo y que requiere autorizacion.

## Rutas por rol

### Shopper

Debe aprender:

- que datos propios puede ver;
- que datos no se muestran por seguridad;
- por que Mis beneficios muestra montos pero no banco;
- como reportar un dato incorrecto;
- que significa dato protegido o pendiente de validacion.

### Admin

Debe aprender:

- que datos nunca se suben al repo;
- que fuentes deben sanitizarse;
- como interpretar referencias opacas;
- cuando enviar una fila a revision manual;
- como evitar exponer informacion privada al shopper.

### Ops / coordinador

Debe aprender:

- como trabajar con preview source-safe;
- como detectar columnas sensibles;
- como escalar inconsistencias;
- como explicar estados honestos sin prometer integraciones reales.

### Finanzas

Debe aprender:

- como revisar pagos sin exponer banco;
- como manejar estados de pago visibles;
- que informacion financiera es interna;
- cuando se requiere autorizacion adicional.

### Superadmin / consultora / aliado

Debe aprender:

- como configurar politica por tenant/proyecto;
- que rutas privadas requieren reglas;
- que integraciones deben mantenerse apagadas hasta gate;
- que Gemini/Make/correo no deben recibir datos sensibles sin autorizacion.

## Manuales a crear o actualizar

1. Manual de datos sensibles.
2. Manual de import seguro.
3. Manual de pagos sin exposicion bancaria.
4. Manual de evidencias y adjuntos privados.
5. Manual de trazabilidad de comunicaciones.
6. Manual de revision manual.

## Lecciones requeridas

### Leccion 1 - Que datos son sensibles

Debe explicar categorias:

- identidad;
- banco/pagos;
- legal/NDA;
- contacto crudo;
- comunicaciones crudas;
- adjuntos/evidencias privadas.

### Leccion 2 - Que se permite en Phase A

Debe explicar:

- solo datos operativos minimos;
- referencias opacas;
- source-safe preview;
- sin datos reales crudos;
- sin escrituras reales hasta autorizacion.

### Leccion 3 - Como revisar una fuente antes de importarla

Debe incluir pasos:

1. confirmar si es sintetica/sanitizada;
2. revisar que no tenga documentos/banco/NDA/adjuntos crudos;
3. revisar metadata `sourceSafe=true`;
4. validar con herramienta backend cuando aplique;
5. enviar a revision manual si hay duda.

### Leccion 4 - Que ve el shopper

Debe explicar:

- datos visibles permitidos;
- montos y estados permitidos;
- datos protegidos no visibles;
- diferencia entre pendiente, revision y pagado;
- privacidad de otros shoppers.

### Leccion 5 - Integraciones y datos sensibles

Debe explicar:

- Make no debe recibir datos sensibles mientras el gate este apagado;
- Gemini no debe procesar documentos crudos sensibles;
- correo real no debe mostrarse como enviado si no esta conectado;
- adjuntos privados requieren Storage/reglas aprobadas.

## Checklists interactivos

### Antes de importar fuente

- La fuente es sintetica o sanitizada.
- No contiene documentos de identidad.
- No contiene banco/cuenta.
- No contiene NDA firmado.
- No contiene adjuntos crudos.
- No contiene cuerpos de correo/WhatsApp crudos.
- Tiene metadata source-safe.
- Si hay duda, se envia a revision manual.

### Antes de mostrar datos al shopper

- Solo ve sus propios registros.
- No ve banco.
- No ve documentos.
- No ve notas internas.
- No ve auditoria interna.
- Estados son honestos.
- Montos no revelan informacion de otros shoppers.

### Antes de activar una integracion

- Payload revisado.
- No incluye campos sensibles.
- Gate autorizado.
- Logs no guardan cuerpos crudos.
- Existe rollback.
- Existe responsable.

## Glosario requerido

- sourceSafe
- isSyntheticOrSanitized
- containsRawSensitiveData
- referencia opaca
- dato protegido
- dato privado
- dato visible
- manual_review_required
- gate
- rol restringido
- Storage privado
- Firestore privado

## Notificaciones Academia

Cuando esta politica pase a UI, Academia debe notificar:

- manual nuevo de datos sensibles;
- checklist nuevo de import seguro;
- cambios en Mis beneficios por privacidad;
- cambios en correo/comunicaciones;
- contenido pendiente de revision humana si IA ayuda a redactar.

## Estado seguro

Documento academico. No activa runtime, no escribe Firestore/Storage/HR, no ejecuta integraciones y no cambia frontend.
