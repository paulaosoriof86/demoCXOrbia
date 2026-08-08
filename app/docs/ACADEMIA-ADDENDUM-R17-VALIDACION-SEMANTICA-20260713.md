# Academia — addendum R17 validación semántica

Fecha: 2026-07-13

## Objetivo

Evitar que un usuario, auditor o equipo técnico confunda una ruta que abre con una operación correctamente conectada.

## Contenido obligatorio

### Proyecto versus periodo

- Proyecto: programa configurable, por ejemplo Cinépolis.
- Periodo: corte operativo mensual dentro del proyecto, por ejemplo JUL 2026.
- Toda la plataforma debe compartir un solo periodo activo.
- Un selector visual que no cambia `currentPeriodId` no es un selector real.

### Snapshot versus sincronización runtime

- Snapshot source-safe: fotografía generada en una fecha y servida desde Hosting.
- Lectura runtime: consulta actual al proveedor o backend al usar la plataforma.
- Sincronización: mecanismo recurrente con llaves estables, estado, auditoría y resolución de conflictos.
- `Live` no debe usarse cuando solo se generó un snapshot durante deploy.

### Estados separados

No equivalen:

1. visita asignada;
2. fecha agendada;
3. visita realizada;
4. cuestionario completado;
5. cuestionario submitido;
6. liquidación preparada/confirmada;
7. pago programado/confirmado.

Cada etapa necesita su propia evidencia y fuente. Submitido nunca demuestra liquidación o pago.

### Fechas

- valor de fuente;
- fecha normalizada ISO;
- zona horaria;
- valor inválido/ambiguo;
- reviewQueue y auditoría.

Nunca enseñar ni aceptar un serial Excel como fecha visible.

### Validación humana

El checklist debe obligar a:

- cambiar de periodo y revisar todos los módulos;
- contrastar selector, título, KPI, tabla y calendario;
- revisar estados contra HR;
- revisar fechas visibles;
- confirmar que el login no duplica tenant;
- distinguir países habilitados de país activo;
- detectar atributos ficticios en shoppers;
- registrar esperado/observado y evidencia.

## Caso TyA

La revisión R17 mostró:

- JUN y JUL simultáneos;
- calendario junio con periodo julio;
- julio vacío;
- fechas numéricas crudas;
- submitido proyectado como liquidado;
- shopper rating uniforme 4.3;
- título TyA duplicado sin logo;
- snapshot de deploy presentado como HR viva.

Este caso debe usarse como ejemplo de por qué conteos 14/616/210 y 13 rutas abiertas no bastan para aprobar una migración.

## Estado

Backfill documental. No modifica cursos publicados, no llama Gemini y no toca módulos/core.
