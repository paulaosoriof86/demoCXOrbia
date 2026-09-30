# Evidence storage contract - CXOrbia Phase A

Fecha: 2026-07-08

## Bloque completado

Se creo contrato preview-only para evidencias de campo y Storage futuro.

Archivo creado:

- `tools/contracts/cxorbia-evidence-storage-contract.mjs`

## Objetivo Phase A

Phase A requiere evidencias por visita/proyecto, pero todavia no debe escribir en Storage real ni subir archivos reales al repo.

El contrato valida metadatos de evidencias sin aceptar bytes, base64, DPI, banco ni identidad sensible.

## Tipos de evidencia soportados

- `photo`;
- `video`;
- `audio`;
- `receipt`;
- `document`;
- `other_project_defined`.

## Acciones soportadas

- `preview_evidence_requirement`;
- `request_upload_slot`;
- `request_evidence_review`;
- `request_evidence_replacement`;
- `request_evidence_rejection`;
- `mark_evidence_accepted_preview`;
- `export_evidence_report`.

## Campos clave validados

- `tenantId`;
- `projectId`;
- `visitId`;
- `evidenceId` cuando aplica;
- `evidenceType`;
- `actorRole`;
- `auditRef`;
- `reason` para reemplazo o rechazo.

## Reglas de seguridad

El contrato bloquea:

- raw file payload;
- base64 embebido;
- `storageWrite: true`;
- `writeToDatabase: true`;
- `notifyReal: true`;
- `execute: true`;
- `containsDpi: true`;
- `containsBankData: true`;
- `containsSensitiveIdentity: true`.

El contrato no ejecuta Storage real, no guarda archivos y no llama proveedores.

## Llaves estables

- `tenantId`;
- `projectId`;
- `visitId`;
- `evidenceId`.

## Por que importa

Permite preparar evidencias para campo sin contaminar repo con archivos reales ni datos sensibles.

Tambien permite diferenciar:

- requisito de evidencia;
- slot solicitado;
- evidencia en revision;
- evidencia rechazada;
- reemplazo solicitado;
- evidencia aceptada en preview.

## Pendientes Claude/prototipo

Claude debe reflejar este patron sin conectar Storage real:

- badges de evidencia requerida/pendiente/revision/aceptada;
- no prometer carga real si Storage no esta activo;
- explicar formatos esperados por proyecto;
- pedir razon para reemplazo o rechazo;
- no mostrar datos sensibles;
- no pegar URLs reales ni archivos reales en demo;
- mantener copy honesto: `evidencia preparada` o `pendiente de gate`.

## Academia

Academia debe explicar:

- que evidencia puede ser foto/video/audio/recibo/documento segun proyecto;
- que preview no significa carga real;
- politicas basicas de retencion;
- por que no se suben archivos reales al repo;
- errores frecuentes: archivo equivocado, evidencia sensible, evidencia sin visita, reemplazo sin razon.

## Clasificacion

### Reusable CXOrbia

Si. Evidencias por proyecto/visita son reutilizables para field operations.

### Exclusivo cliente

No. Audio/video pueden aplicar a TyA, pero el contrato es generico.

### Claude/prototipo

Si. Requiere UI de estados, copy honesto y manejo de evidencias.

### Academia

Si. Afecta manuales, instructivos, politicas de evidencia y rutas por rol.

### Sin impacto Claude

No aplica.

## Estado seguro

Sin runtime app, sin deploy, sin produccion, sin Storage real, sin proveedores reales, sin base real, sin imports reales, sin notificaciones reales, sin archivos reales y sin datos sensibles.
