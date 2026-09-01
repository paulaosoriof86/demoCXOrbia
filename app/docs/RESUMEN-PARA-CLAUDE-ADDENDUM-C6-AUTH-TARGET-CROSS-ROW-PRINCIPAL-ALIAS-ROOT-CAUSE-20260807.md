# RESUMEN PARA CLAUDE — C6 AUTH TARGET CROSS-ROW PRINCIPAL ALIAS ROOT CAUSE

Fecha: 2026-08-07

Backend encontró y aisló una causa raíz de identidad. No corresponde modificar frontend.

## Hallazgo

El target `ac93...` y un peer comparten login base técnico. El PREWRITE Auth anterior permitía que un mismo principal Auth existente apareciera como único candidato de más de un profile row porque no tenía un invariant global de principal único. El resolver corregido reconstruyó la lineage exacta (`profile + visit`) y encontró cero Auth candidates target-specific para `ac93...` al excluir correctamente el principal compartido del peer.

## Para Claude

- No tocar Login/UI por este hallazgo.
- No mostrar ni hardcodear fingerprints.
- Mantener copy genérico de acceso/identidad.
- Si se documenta en Academia, explicar de forma funcional que las cuentas se enlazan por identidad técnica y scope, no por coincidencia de nombre o login visible.

## Preservado

Frontend acumulativo, CX.data, HR, shoppers, postulaciones, certificaciones, visitas, liquidaciones, Finanzas, Portal Cliente, Portal Shopper, Reservas y Academia.

## Pendiente backend

Root fix source-only del plan Auth: principal uniqueness global, re-clasificación segura del target y corrección de semántica de salt vacío legítimo. No hay tarea visual bloqueante.
