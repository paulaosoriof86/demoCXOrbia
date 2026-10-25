# ACADEMIA — Corrección de causa raíz Crosswalk C6

**Fecha:** 2026-08-05

## Aprendizaje reusable

Un algoritmo de desambiguación puede ser correcto y aun así producir un plan no confiable si el crosswalk de identidad pierde linaje técnico antes de clasificar.

La secuencia correcta es:

1. enlazar perfil y fuente por llave exacta;
2. propagar todas las llaves técnicas de la fuente enlazada;
3. mapear credenciales sobre el crosswalk acumulado;
4. completar nombre técnico;
5. resolver colisiones;
6. generar el plan.

En este bloque, el paso 2 faltó en el planner nuevo. El algoritmo 4/6/8 pasó sus pruebas, pero el plan provider quedó en HOLD por drift de 13 credenciales.

## Regla académica

Los gates deben comprobar no solo sintaxis y determinismo, sino paridad de población y linaje respecto a una referencia estable.

## Manuales y cursos

No actualizar todavía ejemplos de login, conteos ni capturas. Las cifras provider son provisionales hasta recuperar paridad 101/8 y revalidar con nueva autorización.

## Estado

Sin notificaciones, credenciales, datos, deploy o producción.
