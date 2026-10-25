# ACADEMIA — Impacto Corte 4 · P0-C4-VIS-02

**Fecha:** 2026-07-29

## Patrón de aprendizaje reusable

Una plataforma conectada a un backend real puede estar correctamente conectada y, al mismo tiempo, no tener todavía proyectos materializados. Ese estado debe enseñarse como una condición válida: `conectado + vacío`, distinta de `error`, `demo`, `sin conexión` o `sin permisos`.

## Qué debe reflejar Academia cuando el fix cierre

- qué significa una base nueva/vacía;
- por qué 0 proyectos/visitas/shoppers/postulaciones no es un error en Corte 4;
- cómo distinguir `Firestore activo` de `datos materializados`;
- qué pantalla honesta debe ver un admin antes de Corte 5;
- por qué cambiar de rol nunca debe reutilizar visualmente el shell de otra identidad;
- checklist de validación: fuente real, cero fixtures, estado vacío estable, logout/role switch limpio.

## Impacto actual

No modificar cursos ni módulos todavía. Registrar este patrón y actualizar Academia cuando P0-C4-VIS-02 pase validación humana.
