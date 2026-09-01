# ACADEMIA — IMPACTO DE AUDITORÍA V110

Fecha: 2026-07-12

## Resultado crítico

El aislamiento de contenido por país del shopper quedó `PASS_COMPROBADO`.

Casos reproducidos:

- shopper GT: contenido GT visible, HN oculto;
- shopper HN: contenido HN visible, GT oculto;
- shopper sin país: contenido restringido oculto;
- contenido global: visible;
- invitado con `scopePaises`: respeta su scope;
- admin/super: conserva catálogo administrable.

## Impacto en métricas y rutas

La colección visible sigue siendo la base para:

- total de cursos;
- lecciones;
- avance;
- rutas;
- categorías;
- certificados.

Por tanto, el contenido fuera de país no debe contaminar KPIs del shopper.

## Regla reusable

Para usuarios shopper:

- resolver identidad y país desde el shopper;
- no usar todos los países del proyecto como fallback;
- si falta país, fail-closed para contenido restringido;
- contenido global puede permanecer visible.

Para invitados no shopper:

- usar scope explícito del usuario/invitación.

Para administración:

- distinguir catálogo administrable de contenido asignado.

## Pendientes no bloqueantes

- probar el mismo aislamiento con payload TyA source-safe R10, no solo fixture dirigido;
- verificar que notificaciones académicas y contadores futuros respeten el mismo scope;
- mantener manuales/rutas por rol, país, proyecto y tenant;
- preservar revisión humana para contenido IA.

## Decisión

Academia no genera otro paquete Claude en este bloque. El P0 se cierra y los pendientes restantes se acumulan como P1/P2.
