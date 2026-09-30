# Resumen para Claude — carril local reutilizable

Fecha: 2026-07-17

Claude Design continúa entregando una candidata frontend completa. No necesita conectarse con Codex ni con GitHub.

El empalme físico ahora se ejecuta mediante `tools/integration/` sobre el repositorio local autenticado. Claude no debe modificar ese directorio, backend, contratos, adapters, gates, documentación técnica ni overlays de tenant.

## Regla de producto

- CXOrbia es multi-tenant y multi-proyecto.
- Ningún cliente, proyecto, país, moneda, HR, cuestionario, pago o integración puede quedar hardcodeado.
- Cinépolis es solamente el primer proyecto operativo de TyA y nunca un default global.
- Los siguientes proyectos TyA y los siguientes tenants deben crearse y configurarse desde la plataforma.

## Estado V156

V156 conserva auditoría GO. El carril está instalado, pero V156 aún requiere ejecución local, commit/push y gates antes de ser baseline activa.

## Academia

Los módulos modificados por cada candidata deben mantener sincronizados manuales, cursos, rutas por rol, certificaciones y notificaciones, segmentados por tenant y proyecto.
