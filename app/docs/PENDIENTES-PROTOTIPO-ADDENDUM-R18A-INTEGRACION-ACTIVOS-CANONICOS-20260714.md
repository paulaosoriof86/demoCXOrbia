# PENDIENTES PROTOTIPO — ADDENDUM R18A

Fecha: 2026-07-14

## P0 ya enviado a Claude en paquete V110 → V111

### Periodo canónico

- `currentProjectId` no debe seguir representando conceptualmente un periodo.
- Sidebar y Dashboard deben usar el mismo setter/estado.
- Dashboard, Visitas, Mi Día, Histórico y Finanzas deben recalcular desde el periodo activo.
- Mi Día no puede conservar mes o fechas hardcodeadas.

### Login, marca y alcance

- Un solo nombre de tenant y un título funcional distinto.
- Con y sin logo.
- Países habilitados desde configuración.
- País/alcance activo desde sesión.
- Multipaís no equivale a mostrar todas las banderas sin selección o estado.

### Shopper protegido

- Distinguir `protected_reference`, perfil operativo y perfil completo autorizado.
- No inventar rating, estado, completitud, preferencia, honorario o scoring.
- No abrir PII sin rol/fuente autorizados.

## Nuevos campos backend que el frontend debe tolerar

- `canonicalState`;
- `operationalState`;
- `questionnaireState`;
- `submissionState`;
- `liquidationState`;
- `paymentState`;
- `reviewRequired` y `reviewReasons`;
- `sourceSnapshotAt`;
- `sourceReadMode`;
- `runtimeSyncActive`;
- `dataLevel`.

## No reabrir

- P0 Academia por país cerrado en V110.
- Finanzas fail-closed cerrado en V110.
- Scores finitos, lotes multipaís/multimoneda, IDs determinísticos, responsive, Beneficios, certificaciones, cache y shell.
- Normalización y reconciliación backend.

## Pendientes posteriores al empalme V111

- Smoke semántico por dos periodos con conteos diferentes.
- Validar calendario y fechas ISO.
- Validar que submitido no aparece como liquidado/pagado.
- Validar snapshot vs runtime con copy honesto.
- Validar perfiles protegidos por rol.
