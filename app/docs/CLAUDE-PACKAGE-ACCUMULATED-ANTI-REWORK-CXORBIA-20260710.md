# Paquete acumulado anti-reproceso para Claude — prototipo CXOrbia

Fecha: 2026-07-10

## Corrección de metodología

El paquete anterior quedó supersedido porque formulaba varios P0 como si estuvieran ausentes. Eso podía inducir reimplementación o regresión.

La nueva versión obliga a clasificar cada capacidad antes de tocar código:

- `HECHA_EN_CANDIDATA`: preservar y probar.
- `HECHA_COMO_PATCH_LOCAL`: consolidar con diff mínimo.
- `PARCIAL`: completar únicamente la brecha.
- `PENDIENTE_NETO`: implementar.
- `BACKEND_ONLY`: no tocar desde el prototipo.

## Baseline

SHA-256 de la candidata actual:

`80feb7c7809d28657b5eec243aa187f678c023ecd471a9f9404e52d285bd2663`

Auditoría estructural confirmada:

- 63 scripts declarados;
- 61 scripts locales;
- 0 scripts locales faltantes;
- 48 módulos registrados;
- 48 IDs de módulo únicos;
- 0 duplicados;
- 0 errores de sintaxis JavaScript.

## Capacidades protegidas que no deben reabrirse

- arquitectura modular;
- branding y manifest por tenant;
- persistencia de proyectos;
- agrupación proyecto/periodo y aliases de compatibilidad;
- ciclo de vida básico de periodos;
- matriz de rutas fail-closed;
- personas, scopes y usuarios invitados;
- PWA base;
- Academia profunda y CRUD existente;
- revisión administrativa;
- Diagnóstico, Administrabilidad y conflictos preview.

## Pendientes netos reales

- modo de datos exclusivo `demo / source_safe_preview / connected`;
- bridge genérico en el único punto de `CX.data`;
- cero mezcla de seeds demo en modos no demo;
- retirar llamadas directas a proveedores desde navegador;
- retirar API keys/secrets de localStorage;
- permisos por acción sensible y validación final de roles personalizados;
- consolidación de patches locales en módulos canónicos;
- neutralización de datos demo operativos en finanzas, certificaciones, correo, soporte y portales cuando el modo no sea demo.

## Neutralidad

El paquete descargable contiene solo reglas y pendientes reutilizables del prototipo. No incluye nombres de clientes, proyectos reales, países concretos, reglas particulares, datos reales, URLs privadas ni secretos.

## Estado seguro

Documento de coordinación solamente. No cambia runtime, no despliega, no importa, no escribe proveedores ni activa backend real.
