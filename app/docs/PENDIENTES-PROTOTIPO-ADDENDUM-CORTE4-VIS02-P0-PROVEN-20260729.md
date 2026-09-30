# PENDIENTES PROTOTIPO — Corte 4 · P0-C4-VIS-02

**Prioridad:** P0  
**Bloquea:** freeze Corte 4

## P0-C4-VIS-02

`EMPTY_BACKEND_ADMIN_SHELL_CRASH_AND_STALE_ROLE_RENDER`

### Reproducción

1. Abrir Hosting DEV Corte 4 con Firestore vacío.
2. Confirmar 0 proyectos / 0 visitas / 0 shoppers / 0 postulaciones.
3. Seleccionar Administración / Coordinación.
4. El shell queda en blanco.
5. Entrar a Shopper, cerrar sesión y volver a Administración puede dejar visible el shell Shopper anterior.

### Causa

El core/router y la vista inicial presuponen un proyecto/periodo existente. El backend vacío, que es válido en Corte 4, produce `d.period() === undefined` y termina en acceso inseguro a `programKey/programBase`. El shell previo tampoco se limpia al volver al login.

### Solución de raíz esperada

- manejo core explícito de backend conectado pero vacío;
- router null-safe con `projects=[]`;
- no montar módulos dependientes de proyecto en el estado vacío;
- limpiar shell al cerrar sesión/cambiar rol;
- gate navegador multirrol sin datos.

### No hacer

- no cargar datos reales para ocultar el defecto;
- no tocar `app/modules`;
- no nueva candidata;
- no nuevo Firebase;
- no producción.
