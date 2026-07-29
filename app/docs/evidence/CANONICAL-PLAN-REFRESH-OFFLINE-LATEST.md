# CXOrbia — refresh offline del plan canónico Phase A

- Fecha: 2026-07-29T23:45:19.923Z
- Reutiliza los builders R6/R16D existentes; no crea una arquitectura nueva.
- Provider calls=0; writes=0; producción=false.

- Plan base: phasea_2f71daec3e68dfa1.
- Plan overlay: r16d_f471a6b486f3a269b0dd.
- Operaciones: 1415.
- Tenant: 1; proyecto padre: 1; HR import: 0; periodos: 14; shoppers: 210; visitas: 616; liquidaciones: 572; certificaciones: 0; pagos: 0.
- Ruta proyecto padre: `tenants/tya/projects/cinepolis`.

## Lectura operativa

- Este plan representa la arquitectura aprobada proyecto padre → periodos → visitas, no proyectos separados por mes/país.
- Reproduce exactamente 14 periodos / 616 visitas y 572 controles de liquidación del source lock.
- No se ejecuta contra Firestore en este gate.
- El siguiente comparador read-only debe clasificar create/update/noop/review contra `cxorbia-backend-dev` antes de autorizar cualquier write.
