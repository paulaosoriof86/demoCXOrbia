# CAMBIOS BACKEND — CORTE 0B R21 POSTULACIÓN Y LOGIN

Fecha: 2026-07-18

## Hallazgos reproducibles

1. `sin asignar` se estaba tratando como `disponible` aunque la HR no entregara una fecha válida de disponibilidad.
2. La HR usa `RH WK` y `RH WKND`, mientras el formulario frontend compara `Semana` y `Fin de semana`; por eso la franja no se validaba.
3. La ficha no tiene control de límite de quincena/ventana de medición.
4. El login DEV ocultó Cliente/Coordinador/Aliado antes de terminar la validación.
5. La configuración de accesos todavía no está expuesta desde la plataforma.

## Evidencia HR julio 2026

- 5 visitas sin shopper.
- 4 con fecha válida `Disponible a partir de`.
- 1, MC. Santa Clara Q2, contiene el token `P1Q`; no es una oportunidad publicable y depende de la visita previa.
- Fuente: HR externa Cinépolis. La arquitectura debe aplicar igual a HR externa, archivo, API o hoja creada dentro de CXOrbia.

## Archivos modificados

- `backend/config/tya-tenant-runtime-profile.source-safe.json`
  - todos los roles visibles durante validación;
  - Cliente habilitado temporalmente;
  - futuro destino de configuración: `Configuración > Tenant > Accesos y login`.
- `tools/hr-source/tya-canonical-visit-state-r20.mjs`
  - separa `unassigned` de `available`;
  - reconoce dependencia de visita previa;
  - no inventa fecha.
- `tools/hr-source/tya-reapply-canonical-state-r20.mjs`
  - normaliza franja;
  - define inicio/fin de quincena;
  - reaplica estado canónico después de overlays.
- `tools/release/tya-source-safe-binding-build-r18a.mjs`
  - consume perfil tenant para login;
  - expone `CX.data.postulationEligibility(visit, proposedDate)`;
  - expone `CX.data.availableVisits()`.
- `backend/contracts/phase-a-postulation-eligibility-r21-v1.json`
  - contrato reusable para fuentes internas y externas.

## Estado

Cambios aplicados en rama viva. No desplegados. Faltan gates, ajuste frontend localizado y autorización separada para nuevo Hosting DEV.

## Clasificación

- Reusable CXOrbia: disponibilidad, franja, ventana y login configurable.
- Exclusivo TyA/Cinépolis: Q1/Q2, token `P1Q`, GT/HN y HR actual.
- Claude/prototipo: selector proyecto/periodo, consumo del validador y Academia Cliente.
- Academia: explicar disponibilidad, franja, quincena, rechazo y configuración de login.
- Sin impacto Claude: motor, contratos y gates internos.
