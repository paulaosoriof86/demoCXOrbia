# Handoff neto para Claude — V105 / build interno V106

## Baseline

Trabajar únicamente sobre la candidata frontend recibida. No importar R5 ni modificar backend, herramientas, workflows o datos TyA.

## Conservar

- Histórico excluye activo.
- Liquidación sin evidencia queda en preview.
- La fecha de realización no es fecha de pago.
- Acciones geo-sensibles fallan cerrado sin país.
- `pending_backend` no habilita certificación.
- La práctica no emite evento operativo.
- Dashboard no inventa las dos KPIs corregidas fuera de demo.
- Historial de estados restaurado.
- Archivo de visita con motivo y auditoría.

## Pendiente neto

1. Unificar identidad V105/V106 y entregar manifest verificable.
2. Eliminar datos sintéticos de Portal Cliente fuera de demo.
3. Sustituir la purga destructiva por aislamiento de fixtures según origen, tenant y modo.
4. Confirmar pago solo con estado, fecha, lote, fuente, actor y referencia de auditoría.
5. Beneficios exige shopper autenticado y nunca muestra liquidaciones globales.
6. Pasar contexto real a permisos y retirar tenant derivado del tema visual.
7. Completar certificación con identidades humanas y lifecycle.
8. Completar Academia según su addendum específico.
9. Corregir copy residual de integraciones y notificaciones.
10. Añadir smoke source-safe, Cliente, Academia, roles sensibles y 360/390/412.

## Academia

Se requiere scope opcional por tenant, proyecto, país, rol, módulo, paquete y nivel; vacío significa global. También se requiere reviewer/approver autenticado y distinto según política. No pedir nueva definición ni inventar cursos por país.

Preservar el contenido profundo y lifecycle existentes. Completar scopes, permisos con contexto, entidades administrables, revisión humana, rutas de aprendizaje, notificaciones y contenidos recientes.

## Plan R6 reflejado en producto

Sin conectar backend, representar: `plan_prepared`, `validated`, `pending_authorization`, `materializing`, `confirmed`, `failed`, `rollback_required`. Mostrar solo planId, hash, conteos y blockers seguros. Materialización deshabilitada mientras el gate esté HOLD.

## Entrega

Una candidata completa incremental, identidad única, reporte exacto, manifest reproducible, evidencia incluida y tabla HECHO/PARCIAL/PENDIENTE.
