# Submitido HR-driven configurable Phase A TyA

Fecha: 2026-07-04

## Objetivo

Avanzar el pendiente vivo **Submitido HR-driven/configurable** sin tocar frontend, sin activar runtime, sin escribir Firestore y sin llamar Make.

Este bloque complementa el contrato de revision admin funcional: cuestionario realizado, revision, submitido y liquidacion quedan separados y auditables.

## Archivos creados

- `app/contracts/submitido-hr-driven-phase-a.tya.contract.json`
- `tools/migration/tya-submitido-hr-driven-validator.mjs`

## Regla central

En TyA/Cinepolis, submitido debe ser HR-driven por defecto.

A nivel SaaS comercializable, el origen de submitido debe ser configurable por proyecto. No debe quedar hard-coded a TyA ni a Cinepolis.

## Modos canonicos

| Modo | Uso |
|---|---|
| `hr_driven` | Submitido viene de HR. Es el default para TyA/Cinepolis. |
| `external_system` | Submitido viene de una plataforma externa. |
| `platform_review` | Submitido se deriva de una revision interna del proyecto. |
| `manual_admin_hr_confirmed` | Admin confirma manualmente con referencia HR. |

## Configuracion minima por proyecto

Ruta logica:

`tenants/{tenantId}/projects/{projectId}.submitido`

Campos configurables:

- `mode`
- `sourceSystem`
- `hrFieldCandidates`
- `questionnaireCompletedFieldCandidates`
- `allowManualOverride`
- `requireAdminReviewBeforeSubmitido`
- `liquidationEligibilityMode`

## Candidatos de campos HR

Para submitido:

- `submitidoAt`
- `fechaSubmitido`
- `fecha_submitido`
- `submittedAt`
- `hrSubmitidoAt`
- `AC`
- `AB`

Para cuestionario completado:

- `questionnaireCompletedAt`
- `cuestionarioCompletadoAt`
- `fechaCuestionario`
- `fecha_cuestionario`
- `T`
- `S`

Estos nombres son candidatos documentales. La resolucion real debe venir del parser/contrato HR activo y no de coincidencia visual insegura.

## Estados canonicos de submitido

- `not_started`
- `questionnaire_completed_pending_review`
- `pending_hr_submitido`
- `submitido_registered`
- `submitido_missing_in_hr`
- `submitido_conflict`
- `manual_confirmation_required`
- `cancelled`

## Reglas funcionales

- `questionnaireCompletedAt` no basta para marcar `submitido_registered`.
- En `hr_driven`, `submitidoAt` debe venir de HR y estar ligado al mismo `tenantId`, `projectId` y `hrRowId`.
- En `manual_admin_hr_confirmed`, se exige nota admin y referencia HR.
- `submitidoAt` no debe estar en el futuro.
- `submitidoAt` no deberia ser anterior a `questionnaireCompletedAt` salvo conflicto documentado.
- Liquidacion elegible requiere `submitido_registered`, salvo excepcion admin documentada por politica del proyecto.
- No se sobrescriben conflictos HR/plataforma.
- Cada cambio debe anexar `auditTrail`.

## Conflictos

Enviar a revision si ocurre alguno:

- misma visita con dos `submitidoAt` distintos;
- fila HR pertenece a otro tenant/proyecto;
- submitido anterior a cuestionario sin nota admin;
- submitido en visita cancelada;
- shopper de submitido difiere del shopper asignado;
- fuente platform-only cuando el proyecto es `hr_driven`;
- liquidacion elegible sin `submitido_registered`.

## Validador seguro

`tools/migration/tya-submitido-hr-driven-validator.mjs` revisa:

- modos canonicos;
- campos de configuracion;
- candidatos de campos HR;
- campos requeridos del registro;
- separacion cuestionario/submitido;
- bloqueo de submitido futuro;
- hard stops de HR, Firestore y Make.

Comando futuro de lectura local:

```bash
node tools/migration/tya-submitido-hr-driven-validator.mjs
```

No conecta Firebase, no lee HR real, no escribe Firestore y no llama Make.

## Impacto para Claude / prototipo comercializable

No se modifico frontend en este bloque.

Claude debe implementar o conservar en UI:

- origen de submitido configurable por proyecto;
- estados visibles separados: cuestionario realizado, submitido, revision y liquidacion;
- mensajes honestos cuando HR/Make estan apagados;
- etiquetas adaptables por tenant/proyecto sin cambiar los modos canonicos internos.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin Firestore writes reales.
- Sin Auth real activado.
- Sin HR writes reales.
- Sin Make/Gemini/WhatsApp API real.
- Sin runtime backend conectado.
- Sin cambios frontend.
