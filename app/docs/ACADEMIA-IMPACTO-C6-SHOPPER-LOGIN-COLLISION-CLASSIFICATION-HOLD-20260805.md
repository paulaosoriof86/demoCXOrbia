# ACADEMIA — Impacto C6 Shopper Login Collision Classification HOLD

**Fecha:** 2026-08-05  
**Clasificación:** Academia · Reusable CXOrbia

## Aprendizaje incorporado

Un login visible derivado de nombre y apellido no garantiza unicidad. La migración debe separar:

- identidad técnica (`shopperId`, Auth, claims, legacy, HR);
- login visible;
- estado operativo activo o histórico;
- alias históricos y personas distintas.

La clasificación confirmó que 39 grupos pueden operar con un perfil activo canónico y sus históricos preservados, mientras que 64 grupos contienen identidades activas distintas con el mismo login visible.

## Control de calidad

El apellido solo se aceptó cuando provenía de:

- campo explícito;
- login legacy;
- fuente técnica exacta.

No se aceptó por posición dentro de un nombre completo. Esta regla produjo un HOLD seguro para 83 perfiles activos que todavía carecen de apellido técnico verificado.

## Impacto funcional

No se modificaron cursos, certificaciones, manuales, contenidos, notificaciones ni rutas por rol. Los manuales de acceso solo deben actualizarse después de una decisión de desambiguación y un repair DEV con PASS.
