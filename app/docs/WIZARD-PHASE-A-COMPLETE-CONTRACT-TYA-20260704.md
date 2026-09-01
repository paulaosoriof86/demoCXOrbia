# Wizard Phase A complete contract TyA

Fecha: 2026-07-04

## Objetivo

Avanzar el pendiente vivo **Wizard Phase A completo** sin tocar frontend, sin activar runtime, sin escribir Firestore y sin conectar integraciones reales.

Este bloque define el contrato de configuracion minima que el wizard de proyecto debe poder crear o exponer para Phase A y para el prototipo SaaS comercializable.

## Archivos creados

- `app/contracts/project-wizard-phase-a.tya.contract.json`
- `tools/migration/tya-project-wizard-phase-a-validator.mjs`

## Principio

El wizard no debe crear solo un proyecto visual. Debe dejar preparado un proyecto operable de Phase A, con configuracion suficiente para HR, cuestionario, revision, submitido, certificacion, documentos, agenda, pagos e integraciones apagadas/preparadas.

No debe hard-codear TyA ni Cinepolis como unico modelo.

## Secciones minimas del wizard

1. Identidad del proyecto.
2. Pais, moneda y alcance.
3. HR / fuente operacional.
4. Origen de cuestionario.
5. Revision admin.
6. Origen de submitido.
7. Certificacion.
8. Documentos y evidencias.
9. Reglas de agenda, reprogramacion y cancelacion.
10. Pagos y liquidaciones.
11. Gates de integraciones.
12. Confirmacion/resumen.

## Campos clave por bloque

### Identidad

- `tenantId`
- `projectId`
- `name`
- `clientName`
- `status`
- `projectCode`
- `country`
- `currency`
- `timezone`
- `language`

### HR / fuente operacional

- `mode`
- `sourceType`
- `canImport`
- `syncGate`

Reglas:

- `canImport` debe seguir `false` hasta autorizacion real.
- No guardar URL cruda de HR en almacenamiento del navegador para produccion.
- `sourceRef` debe ser opaco cuando lo entregue backend.

### Cuestionario

Modos canonicos:

- `interna`
- `externo_general`
- `externo_visita`

Compatibilidad legacy:

- `externa` -> `externo_general`
- `link` -> `externo_visita`

Reglas:

- `externo_general` necesita URL de proyecto antes de ejecutar.
- `externo_visita` necesita link por visita.
- Si falta link externo, debe mostrar aviso y no caer a formulario interno.

### Revision admin

Debe exponer estados equivalentes a:

- `pending_review`
- `in_review`
- `needs_correction`
- `approved_for_submitido`
- `submitido_registered`
- `rejected`
- `hr_conflict`
- `cancelled`

Regla: cuestionario realizado no es submitido.

### Submitido

Modos canonicos:

- `hr_driven`
- `external_system`
- `platform_review`
- `manual_admin_hr_confirmed`

Para TyA/Cinepolis el default documentado es `hr_driven`, pero el prototipo comercializable debe permitir configurar el modo por proyecto.

### Certificacion

Debe soportar:

- `none`
- `internal_bank`
- `external_certification`
- `manual_review`

Reglas:

- Certificaciones historicas aprobadas deben conservarse.
- Gemini puede preparar bancos de preguntas solo con revision humana antes de publicar.

### Pagos y liquidaciones

Debe configurar:

- pais;
- moneda;
- honorarios;
- reembolsos;
- politica de liquidacion;
- estado de pago;
- reglas de estimacion de pago.

Liquidacion no debe ser elegible solo por cuestionario realizado.

### Integraciones

Gate states permitidos:

- `off`
- `prepared`
- `blocked`
- `requires_authorization`
- `preview_only`

Aplica a:

- Make;
- Gemini;
- WhatsApp;
- Storage;
- Auth;
- Firestore.

No mostrar integraciones como live si no existe autorizacion backend.

## Validador seguro

`tools/migration/tya-project-wizard-phase-a-validator.mjs` revisa:

- secciones requeridas;
- modos de cuestionario;
- modos de submitido;
- estados de gates;
- hard stops de runtime, Firestore, HR import, Make y hard-code TyA/Cinepolis.

Comando futuro de lectura local:

```bash
node tools/migration/tya-project-wizard-phase-a-validator.mjs
```

No conecta Firebase, no importa datos, no escribe Firestore y no llama integraciones.

## Impacto para Claude / prototipo comercializable

Claude debe usar este contrato para completar el wizard visible de proyecto, sin tocar backend ni activar nada real.

Pendientes UI derivados:

- exponer configuracion Phase A completa;
- mantener estados honestos de integraciones;
- conservar modos canonicos de cuestionario;
- conservar configurabilidad de revision/submitido;
- no hard-codear TyA/Cinepolis;
- documentar cada archivo tocado.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin Firestore writes reales.
- Sin Auth real activado.
- Sin HR writes reales.
- Sin Make/Gemini/WhatsApp API real.
- Sin runtime backend conectado.
- Sin cambios frontend.
