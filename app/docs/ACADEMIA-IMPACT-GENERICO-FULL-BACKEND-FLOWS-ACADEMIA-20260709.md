# Academia impact generico full backend flujos academia

Fecha: 2026-07-09

## Objetivo

Actualizar Academia para que el prototipo explique los patrones genericos y replicables de backend, configuracion, fuentes, gates y operacion, sin sesgo hacia un tenant o proyecto especifico.

## Contenido obligatorio por rol

### Administrador SaaS

- Crear tenant.
- Configurar paises, monedas, marca, roles y modulos.
- Crear proyectos.
- Configurar fuentes vivas/source masked.
- Entender gates de integraciones.

### Administrador de proyecto

- Configurar proyecto.
- Detectar periodos.
- Configurar cuestionario, certificacion, reglas y pagos.
- Revisar KPIs por periodo.
- Revisar reviewQueue y auditEvents.

### Coordinacion operativa

- Gestionar postulaciones, reservas, asignaciones, cambios y conflictos.
- Entender estados source-safe vs backend real.
- Validar periodo seleccionado antes de actuar.

### Shopper/evaluador

- Diferenciar preview publico de perfil protegido.
- Entender certificacion, visitas, pagos y evidencias segun rol.

### Cliente/marca evaluada

- Ver resultados por proyecto/periodo.
- Entender datos protegidos y acceso por rol.

## Lecciones/checklists minimos

- Tenant/proyecto/periodo.
- Configuracion de fuente viva.
- Source masked y seguridad.
- KPIs por periodo.
- Branding y PWA por tenant.
- Paises/banderas/monedas configurables.
- Auth/roles y datos sensibles.
- Import dry-run/source-safe.
- ReviewQueue/auditEvents.
- Gates de Make/Gemini/pagos/writeback.
- GO/NO GO y rollback.

## Estado seguro

Academia debe explicar lo preparado y lo pendiente sin afirmar integraciones reales cuando el gate esta apagado.