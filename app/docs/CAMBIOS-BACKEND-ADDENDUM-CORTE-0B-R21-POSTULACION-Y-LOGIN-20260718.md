# CAMBIOS BACKEND — CORTE 0B R21

Fecha: 2026-07-18

Estado: `R21_TECHNICAL_PASS_PENDING_FRONTEND_CORRECTION_AND_NEW_DEV_AUTHORIZATION`

## Corregido

- Se separó visita sin asignar de oportunidad disponible.
- Se reconoció `P1Q` como dependencia de la ventana anterior.
- Se normalizaron `RH WK` y `RH WKND`.
- Se agregaron límites de Q1 y Q2.
- Se creó el contrato reusable de elegibilidad de postulación.
- El perfil DEV habilita todos los roles necesarios para validación y conserva Admin, Operativo y Shopper como selección inicial prevista para producción TyA.

## Evidencia julio 2026

- 44 visitas: 34 GT y 10 HN.
- 39 asignadas, 5 sin asignar, 4 disponibles y 1 bloqueada.
- La bloqueada es MC. Santa Clara Q2 por `P1Q`.
- 35 programadas, 21 realizadas, 21 cuestionarios y 14 submitidas.

## Gates

- Commit validado: `287cd0729c14ef9dfe63ce566c6bc2ff8604f2a0`.
- R18A run `29669393823`: éxito.
- Gates completos run `29669735189`: éxito.
- Artifact `8436913243`.
- Historia canónica y semántica R21: PASS.
- Proyecto/periodo, roles y overlays: PASS.

La primera ejecución falló porque el wrapper R18A dependía de fragmentos exactos del adapter y los gates aún exigían contratos R20. Se corrigieron las anclas, postcondiciones y la compatibilidad R21.

## Pendiente frontend

1. `app/core/router.js`: proyecto y periodo separados y selectores por alcance.
2. `app/modules/visita-detalle.js`: consumir el contrato de elegibilidad y no mostrar `null`.
3. `app/app.js`: login gobernado por el perfil del tenant.
4. Cliente: Academia separada de Capacitación.

## Clasificación

- Reusable: disponibilidad, dependencia, franja, ventana, postulación y configuración tenant.
- Exclusivo TyA: GT/HN, Q1/Q2 y `P1Q`.
- Claude: cuatro ajustes frontend.
- Academia: reglas de disponibilidad, rechazos y accesos.

R21 no está desplegado. El DEV vigente continúa en R20 y no fue aprobado visualmente. Sin merge ni producción.
