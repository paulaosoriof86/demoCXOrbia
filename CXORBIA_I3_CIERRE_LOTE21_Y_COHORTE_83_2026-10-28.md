# CXOrbia I3 · Cierre verificado del lote de 21 y conciliación 139/83

**Fecha:** 28-oct-2026, noche (Guatemala). **Entorno:** DEV `cxorbia-backend-dev`, tenant `tya`, programa `cinepolis`. **Tipo:** addendum append-only al checkpoint nocturno; no reemplaza las reglas congeladas.

## Resultado de escrituras autorizadas y verificadas

- [Ejecución #40813627623](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40813627623): trabajo `strong-next21-zero-domain-sequential` **SUCCESS**. Hubo **21/21** respuestas por caso `PASS_BATCH_CANARY_PROVIDER_AND_SHOPPER_UI`, todas con `providerAck=true`, `readback=true`, `shopperUiVerified=true`, y `production=false`.
- Casos cerrados en este lote: F-011, F-012, F-013, F-020, F-021, F-022, F-026, F-028, F-030, F-031, F-037, F-039, F-040, F-042, F-044, F-047, F-050, F-051, F-056, F-059 y F-063.
- Primeros 7 casos previamente comprobados: F-001, F-048, F-003, F-004, F-006, F-007 y F-008.
- Total acumulado tras este lote: **28/83 grupos de identidad**.

## Recuento independiente posterior, no escrituras

- [Preflight #40814816315](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40814816315): ambas jobs **SUCCESS**; lectura independiente de **139 parejas humanas aprobadas**, **83 grupos** y HR revision `4fc8def718fd1504f5d76a1fbc80b6901cbf711ec2b89f4dfc3a81ecbbca517a`.
- Distribución exacta (suma 83):
  - `ALREADY_CONSOLIDATED_AND_VERIFIED`: **28**.
  - `HOLD_ALIAS_OWNED_VISITS`: **37** (requieren migración de referencias históricas con integridad y controles de roles).
  - `HOLD_MULTIPLE_HR_CANONICAL`: **11** (resolver titular canónico entre varias filas HR sin modificar la hoja de ruta externa).
  - `HOLD_KEEPER_NOT_VERIFIED`: **1** (verificar titular y acceso antes de cualquier acción).
  - `KEEPER_VERIFIED`: **6** (titular/verificación de acceso documentado, pero no se acredita que puedan atravesar los controles fuertes de los 21 casos anteriores).
- Estos 55 pendientes NO equivalen a rechazo de la aprobación de Paula. Corresponden a distintos riesgos técnicos de enlaces, referencias y conservación de acceso.
- El preflight reporta **cero escrituras** Auth/Firestore/HR y **cero merges**, por diseño de doble comprobación independiente.

## Hallazgo read-only en seis casos `KEEPER_VERIFIED`

Los códigos sin nombres personales: `F-057` (HN, otras referencias de dominio=2), `R-020` (GT, otras=1), `R-026` (GT, otras=0), `R-050` (GT, otras=1), `R-053` (GT, otras=0), `R-057` (HN, otras=14). En la hoja de Paula, `R-026` y `R-053` tienen decisión **SÍ**, pero distintas preferencias de acceso (`Técnica` y `HR`, respectivamente) y corresponden a la categoría de coincidencia por nombre con WhatsApp discrepante. El script seguro del lote fuerte exige además **mismo teléfono normalizado** y usa una ruta de titular concreta. Por lo tanto, **no se reutiliza ese script** para los casos R, ni se hace un remapeo automático. Preparar proveedor específico con controles de acceso y prueba aislada antes de escribir.

## Prevención general y disponibilidad

- Normalización NFD/minúsculas/espacios y guardia de alta manual en backend: código + 51 pruebas **PASS**, todavía SOURCE-ONLY. Bloquea alta nueva si hay colisión por nombre completo normalizado o teléfono del mismo país, para revisión humana. No elimina una cuenta existente ni decide fusiones.
- Alerta para staff por coincidencias pendientes: fuente y tests **PASS**, aún no servida.
- Oferta de shopper por país/período/proyecto activo y explicación de vacío; 4 casos sintéticos y [preflight #40814816315](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40814816315) **PASS**, fuente no desplegada. El hecho de que HR tenga dos filas marcadas disponibles globalmente no demuestra que cualquier shopper tenga ofertas hoy.

## Gates y siguientes frentes

- Matriz I3 V190 leída: `allModulesMatch=false`, solo 5 de 21 `MATCH`. **I3 HOLD / Gate20 HOLD / Gate21 HOLD / I4 sin autorización**. No publicar LIVE por un buen resultado de fusiones sin acreditar flujos funcionales.
- Siguiente intervención: fase de referencias de alias para 37 con migración protegida, revisión de canonicidad HR de 11, preflight específico de los 6, decisión para el 1 pendiente y materialización DEV de prevención y disponibilidad. Concluir verificaciones Admin/Operaciones/Shopper, recursos PDF, certificaciones, notificaciones y métricas de carga sobre un mismo artefacto.
- Prohibidos reprocesar los 28 PASS, alterar HR original o fusionar por similitud de nombre sin corroboración técnica.
