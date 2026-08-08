# CAMBIOS BACKEND — V161C VALIDACIÓN VISUAL CON OBSERVACIONES

Fecha: 2026-07-19
Estado: `PENDING_EXPLICIT_APPROVAL`

## Ejecutado

- Se registró la revisión visual de Paula sobre login, Cliente, Operativo, Shopper, Academia, postulación, reservas, perfil, finanzas, liquidaciones y lotes.
- No se modificó frontend ni backend operativo.
- Se clasificaron 0 P0, P1 no bloqueantes y P2 documentales/UX.
- Se preservó V161C/R21, source lock, Hosting DEV, smoke remoto y V131 como rollback.

## Hallazgos documentados

- Manuales superficiales tipo curso: P2, Claude/Academia.
- Reportes sin funcionar: P1, Corte 1.
- Reservas listando todas las sucursales: P1, Corte 2.
- Perfil shopper con `null`, código y copy técnico: P1 UX; datos reales requieren backend protegido + Auth/RBAC.
- Honorarios y modelo local/delegado/regional: P1, Corte 3.
- Regalías solo para proyectos locales configurados: P1, Corte 3.
- Flujo liquidación → cruce → lote → pago necesita claridad: P1, Corte 3.
- Copy `Q1/Q2`: P2; conservar regla, reemplazar jerga.

## Clasificación

- Reusable CXOrbia: reservas elegibles, modelo financiero por proyecto, flujo de lotes y perfiles protegidos.
- Exclusivo TyA: reglas Cinépolis, honorarios y aplicación local de regalías.
- Claude/prototipo: manuales, reportes UI, copy de postulación y perfil shopper.
- Academia: manual profundo distinto de curso y rutas por rol.
- Sin impacto Claude: source-safe, Auth protegido futuro y estados financieros fail-closed.

## Próximo paso

Aprobación explícita de Paula con observaciones no bloqueantes y freeze de Corte 0B. Luego inicia Corte 1.
