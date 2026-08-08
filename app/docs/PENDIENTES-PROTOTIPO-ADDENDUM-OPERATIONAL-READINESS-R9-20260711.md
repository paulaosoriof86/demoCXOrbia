# Pendientes prototipo — addendum Operational Readiness R9

Fecha: 2026-07-11

## Nuevo pendiente reusable

Agregar en el prototipo, sin conectar proveedores, una visualización administrable de readiness por carriles:

- baseline/source-safe;
- target DEV limpio;
- pagos/certificaciones dry-run;
- smoke post-empalme.

## Reglas UX obligatorias

1. `HOLD_REQUIRED_INPUTS_OR_EVIDENCE` debe verse como bloqueo, no como error técnico genérico.
2. `READY_FOR_HUMAN_AUTHORIZATION_REVIEW` no equivale a GO de escritura.
3. Mostrar `materializationAuthorized=false` mientras no exista autorización separada.
4. No exponer rutas privadas, credenciales, IDs de usuarios, documentos, cuentas bancarias ni datos crudos.
5. Mostrar solo conteos, estado, hash/fecha de evidencia y blocker sanitizado.
6. No habilitar “Importar”, “Conectar” o “Materializar” desde el prototipo cuando R8 dev-clean continúe bloqueado.
7. Los carriles deben ser reutilizables por tenant/proyecto; no hardcodear TyA/Cinépolis.

## Pendientes previos que permanecen

- Portal Cliente source-honest;
- fixtures por procedencia/namespace;
- pago/lotes con evidencia completa;
- Beneficios por shopper autenticado;
- permisos contextuales;
- lifecycle de certificación;
- métricas financieras reales;
- copy honesto;
- manifest/smoke;
- Academia profunda y administrable.

## Validación esperada

- usuario Admin ve blockers y siguiente acción;
- coordinador/cliente/shopper no ve detalles técnicos o evidencia restringida;
- estado no cambia por interacción local simulada;
- ninguna acción ejecuta provider call o write;
- carriles se alimentan por contrato/adaptador futuro, no por lógica embebida en UI.
