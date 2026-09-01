# ADDENDUM MAESTRO — LOCK DE ESTABILIDAD ACUMULATIVA CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE PARA TODO CAMBIO POSTERIOR  
**Objetivo:** impedir que una etapa nueva, un overlay, un deploy, una candidata o un cambio de fuente vuelva a romper funcionalidades ya aprobadas.

## 1. Regla de no regresión
Ningún bloque posterior puede reemplazar, reinterpretar o degradar un bloque `FROZEN` o `PASS` previo. Toda etapa nueva es aditiva y debe demostrar que conserva simultáneamente todos los contratos anteriores.

Si una nueva capa hace desaparecer, duplicar o alterar datos aprobados, el resultado es `P0_COMPOSITION_REGRESSION` y se bloquea cualquier avance, deploy posterior, freeze, agosto, preproducción o producción.

## 2. Arquitectura estable por ownership de datos
Cada dominio tiene una autoridad única:

1. **HR viva**: periodos, tabs detectadas, auto-mes, visitas operativas, shopper asignado en HR, fechas y evidencias de ejecución/cuestionario/submitido.
2. **Identidad/perfil protegido**: Firestore y crosswalks técnicos exactos; agrega username, password legacy materializado, PII y atributos de perfil. Nunca reemplaza HR.
3. **Finanzas/pagos**: fuente financiera canónica aprobada; autoridad para liquidaciones, beneficios, movimientos y pagos. Nunca se reconstruye desde estados visuales.
4. **Auth/RBAC**: autoridad para acceso y alcance, no para reescribir datos operativos.
5. **Plataforma-origin**: solo agrega visitas/eventos con ID técnico propio y reconciliación explícita; nunca duplica una fila HR existente.

## 3. Composición idempotente obligatoria
Todo composer/overlay debe cumplir:

`compose(base, overlay) === compose(compose(base, overlay), overlay)`

La implementación debe reconstruir siempre desde una base canónica inmutable de la revisión HR vigente, no desde arreglos ya enriquecidos.

Prohibido:
- usar `CX.data.shoppers`, `CX.data._visitas` o `CX.data._posts` ya compuestos como nueva base de otro overlay;
- append de visitas protegidas históricas si ya existe una fila HR equivalente;
- dedupe por nombre, teléfono o email;
- crecimiento de conteos por reapply, focus, poll o refresh;
- reinyectar fixtures, referencias técnicas o aliases como personas nuevas.

## 4. Identidad estable
La resolución Shopper usa únicamente evidencia técnica exacta y reversible:
- `shopperId`/`id`;
- `legacyShopperId`;
- `hrRowId`;
- `visitId`;
- `sourceTab + sourceRow`;
- crosswalk persistido y auditado.

Cuando una visita HR y una visita materializada coinciden por llave técnica exacta, esa relación puede usarse para resolver el Shopper canónico. Conflictos uno-a-muchos o muchos-a-uno pasan a HOLD; nunca se resuelven visualmente por parecido de nombre.

## 5. Refresh HR sin alterar la experiencia
El watcher puede consultar `fresh=1`, pero:
- si `revision` no cambió, no aplica snapshot ni overlay ni dispara rerender funcional;
- si cambió, actualiza una sola vez;
- conserva `currentProjectId`, `currentPeriodId`, ruta, filtros, modal abierto y posición de scroll cuando sigan siendo válidos;
- nunca recarga documento completo;
- nunca mueve la pantalla al inicio por polling.

## 6. Estado HR vivo y conteos
Los conteos de un periodo abierto deben compararse contra la HR viva de ese momento, no contra un número antiguo hardcodeado. Los periodos congelados sí conservan sus invariantes históricas.

Baseline histórica protegida hasta julio 2026:
- 14 periodos;
- 616 visitas históricas materializadas del corte;
- ningún crecimiento por reapply.

Cuando aparezcan meses nuevos, el crecimiento válido solo puede venir de una nueva fuente/periodo identificado o de plataforma-origin reconciliado; `uniqueVisitKeys == visitCount` debe mantenerse.

## 7. Estados HR
La máquina canónica de estados es una sola para todos los consumidores. Dashboard, Visitas, Shopper, histórico, comparativos y Finanzas no pueden volver a inferir estados por su cuenta.

`cuestionario completado` y `submitido` permanecen separados. Ningún bloque futuro puede reabrir o reinterpretar esta semántica sin evidencia de fuente y modificación explícita del contrato canónico.

## 8. Golden regression gate obligatorio antes de cada etapa/deploy
Antes de cerrar o desplegar cualquier etapa posterior debe pasar una sola suite acumulativa que verifique:

- HR viva/auto-mes y revisión estable;
- cero crecimiento después de 3 reaplicaciones consecutivas;
- visita única por llave técnica;
- Shopper único por identidad canónica exacta;
- histórico por Shopper consistente antes/después de refresh;
- periodos anteriores preservados;
- estados canónicos iguales en Dashboard, Visitas e histórico;
- comparativo histórico conserva periodos anteriores;
- Beneficios y Finanzas conservan fuente canónica;
- portal Shopper y Admin leen la misma identidad canónica;
- `/app/modules/*` sin cambios desde backend salvo P0 frontend expresamente autorizado;
- provider/data writes en cero salvo gate exacto autorizado.

Un PASS parcial no habilita la siguiente etapa.

## 9. Lock de transición de etapas
No se avanza de Corte 6 a agosto, ni de agosto a preproducción/producción, mientras exista una regresión acumulativa abierta.

Cada nueva etapa debe declarar:
- qué añade;
- qué slices previos consume solo en lectura;
- qué invariantes previos conserva;
- evidencia de regression gate acumulativo.

## 10. Prototipo/Claude
El mismo lock aplica al prototipo comercializable:
- una candidata nueva no puede reintroducir fixtures, estados antiguos, source fallbacks ni perder funcionalidades ya aprobadas;
- Claude recibe la matriz de invariantes protegidos y no debe reconstruir lógica HR/identidad/finanzas en módulos;
- cambios UI futuros deben consumir el read model estable sin reinterpretar fuente.

## 11. P0 actual que origina este lock
La visual acumulativa de Corte 6 mostró:
- estado transitorio 88 visitas antes de estabilizar en 44;
- badge con 1,232 visitas y 546 shoppers;
- movimiento de scroll por refresh;
- identidades Shopper repetidas;
- perfil/credenciales/histórico no asociados a una única identidad;
- comparativo histórico incompleto;
- estados que cambian entre primer render y refresh.

Causa estructural demostrada: el overlay usa arreglos ya compuestos como base de la siguiente reaplicación y puede anexar historia protegida sobre HR ya existente.

## 12. Siguiente corrección obligatoria
Antes de otro deploy:
1. convertir la composición en idempotente con baseline HR inmutable por revisión;
2. resolver visitas protegidas contra HR por llaves técnicas exactas y prohibir append histórico duplicado;
3. construir crosswalk Shopper por evidencia técnica exacta;
4. preservar estado UI durante refresh;
5. ejecutar regression gate acumulativo de 3 reaplicaciones + periodos históricos + perfiles + beneficios + finanzas;
6. documentar resultados y solo entonces solicitar un único deploy DEV.

## 13. Clasificación
- **Reusable CXOrbia:** ownership de slices, composer idempotente, crosswalk técnico, golden regression gate, preservación de UI state.
- **Exclusivo TyA:** HR Cinépolis y conciliación de identidades actuales.
- **Claude/prototipo:** consumir read model estable; no reimplementar reglas de datos.
- **Academia:** explicar precedencia de fuentes, no-regresión y comportamiento de refresh.
- **Sin impacto proveedor:** este addendum no autoriza deploy, Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos, merge ni producción.
