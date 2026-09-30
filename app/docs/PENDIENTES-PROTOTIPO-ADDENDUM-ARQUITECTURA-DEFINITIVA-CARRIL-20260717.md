# Pendientes prototipo - arquitectura definitiva del carril

Fecha: 2026-07-17

## Cerrado
- Diagnostico raiz del bloqueo de empalmes.
- Carril local deterministico basado en el patron probado de Orbit.
- Contrato de arquitectura definitivo.
- Validador de arquitectura.
- Preflight vinculado al contrato.
- Multi-tenant y multi-proyecto con seleccion explicita.
- Cinepolis protegido como proyecto no-default.

## Pendiente inmediato
1. Sincronizar el checkout local con el HEAD vigente de `docs-tya-v6-v71-audit`.
2. Colocar en `incoming/` el ZIP V156 y su plan auditado.
3. Ejecutar el carril local.
4. Verificar commit, push, manifest, build-lock y registro.
5. Ejecutar gates y smoke aplicables por tenant/proyecto.
6. Actualizar Phase A, Claude y Academia con el resultado real.

## Regla
No se crea otra metodologia ni se usa el conector GitHub para transportar la candidata completa. Un cambio de arquitectura requiere P0 demostrado y autorizacion expresa de Paula.

## Estado seguro
V156 sigue sin empalme fisico. Sin merge, deploy, produccion, import real, writes o proveedores live.
