# Contrato ruteo cuestionario Phase A - CXOrbia TyA

Fecha: 2026-07-06

## Objetivo

Preparar ruteo configurable de cuestionario por tenant, proyecto y visita.

## Archivo creado

- `app/contracts/questionnaire-routing-phase-a.tya.contract.json`

## Modos soportados

- `cxorbia_internal_form`
- `tya_online`
- `external_general_link`
- `external_visit_link_from_hr`
- `manual_pending`

## Configuracion

El contrato separa configuracion de proyecto y configuracion de visita. Permite URL general, link por visita, version de formulario, columna HR, disponibilidad y vencimiento.

## Estados

- `not_configured`
- `configured_preview`
- `ready_for_assignment`
- `completed_by_shopper`
- `submitted_to_client`
- `review_required`
- `blocked`

## Regla

No prometer envio o submit real si no existe confirmacion real. Si backend o proveedor esta pendiente, se debe mostrar como pendiente.

## Seguridad

Contrato solamente. No conecta backend ni proveedores. No habilita source lock ni produccion.
