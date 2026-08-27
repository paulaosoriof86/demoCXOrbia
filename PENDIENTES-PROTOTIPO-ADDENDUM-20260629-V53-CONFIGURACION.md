# PENDIENTES-PROTOTIPO-ADDENDUM-20260629-V53-CONFIGURACION

## Fuente revisada

- `Prototype development request CXOrbia V53.zip`
- `CAMBIOS-PROTOTIPO.md`

## Dictamen

El prototipo V53 trae mejoras relevantes, pero el módulo de Configuración sigue incompleto para uso real y debe mantenerse como pendiente para Claude.

## Configuración no lista

Archivo principal observado:

```text
app/modules/configuracion.js
```

Pendientes:

- Configuración sigue dependiendo de memoria y localStorage en varias secciones.
- Usuarios y permisos siguen basados en estado local de demo.
- Países y monedas mutan el objeto del proyecto en pantalla.
- Marca, tema, módulos activos y NDA no quedan conectados a configuración persistente real.
- No hay conexión completa a tenant config, project config, collaborators, Auth claims, hrConfig ni financeConfig.
- La interfaz luce más completa, pero todavía no garantiza persistencia, auditoría ni permisos reales.

## Mantener para Claude

Cuando Paula pida el documento para Claude, incluir este punto como pendiente prioritario:

```text
Configuración debe reconstruirse como centro real de administración del tenant/proyecto.
No debe ser solo UI, localStorage o mutación de objetos en memoria.
Debe persistir contra backend mediante una interfaz estable, con auditoría y permisos.
```

## Elementos que sí mejoraron en V53

- P0 shopper: Mis Visitas y Mis Beneficios ya declaran filtrado por shopperId.
- IA multi-proveedor y `CX.ai.ask` aparecen como avance aplicable.
- Login white-label, PWA, favicon y chips de países mejoraron como frontend.
- Manuales en Academia aparecen como avance útil.

## Elementos que no deben tacharse todavía

- Configuración real.
- Usuarios y permisos reales.
- Persistencia backend de marca, países, plan, NDA y módulos.
- Scope real por país para coordinador/aliado.
- Importador real de Excel/HR/finanzas desde UI administrativa.
- Storage persistente para logo/evidencias.

## Restricciones

No se modificaron módulos de frontend desde backend.
No se hizo merge.
No se hizo Hosting.
No se escribió Firestore.
No se tocó producción.
