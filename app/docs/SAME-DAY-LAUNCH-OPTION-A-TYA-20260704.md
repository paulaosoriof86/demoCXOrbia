# Same-day launch Option A TyA

Fecha: 2026-07-04

## Decision

Se ajusta la estrategia a lanzamiento controlado hoy, sin esperar hardening completo.

La estimacion anterior corresponde a una salida mas robusta. Para julio y especialmente para hoy, el alcance debe ser Option A estricta: produccion controlada, estable, con gates minimos y sin prometer automatizaciones reales no activadas.

## Objetivo de hoy

Lanzar una version operativa controlada para TyA, con el prototipo V78 como baseline visual y backend minimo seguro.

## Principio de agilidad

Avanzar a produccion con el menor cambio funcional posible:

1. Mantener V78 como frontend base.
2. No reescribir modulos.
3. Activar solo lo necesario para operar.
4. Mantener lo no critico en modo preparado/demo/preview.
5. Registrar todo lo pendiente para iteracion posterior.

## Alcance minimo para hoy

### Debe estar activo

- Login/entrada operativa segun el mecanismo actual disponible.
- Navegacion V78 estable.
- Dashboard visible.
- Visitas visibles.
- Shoppers visibles.
- Postulaciones visibles.
- Documentos/instructivos visibles si ya funcionan en V78.
- Datos iniciales necesarios para operar TyA.

### Puede quedar preparado/no activo

- Make/WhatsApp real.
- Gemini real.
- Storage de evidencias robusto.
- Pagos finales automatizados.
- Multi-tenant comercial completo.
- Import completo historico si bloquea la salida.
- Runner real si no hay tiempo de validarlo.

## Riesgos aceptables para Option A

- Algunos modulos pueden operar con datos precargados/controlados mientras se termina backend completo.
- Automatizaciones quedan como preparadas o simuladas.
- Evidencias pueden gestionarse manualmente si Storage no esta listo.
- Correcciones menores de Claude pueden quedar para candidata posterior si no bloquean operacion.

## Riesgos no aceptables

- Perder navegacion.
- Romper V78.
- Mezclar datos de otra app.
- Usar base preexistente contaminada.
- Prometer WhatsApp/Make/Gemini real si no esta activo.
- Escribir datos reales sin saber donde se escriben.
- Subir informacion sensible no filtrada.

## Gates minimos antes de lanzar hoy

1. Confirmar URL/base a publicar.
2. Confirmar si se lanza como produccion controlada o staging operativo compartido.
3. Confirmar dataset minimo real para TyA.
4. Confirmar usuarios iniciales y roles.
5. Confirmar modulos visibles indispensables.
6. Confirmar mensajes que deben decir demo/preparado/preview.
7. Confirmar rollback simple.

## Informacion real que se necesita hoy

1. URL o proyecto Firebase donde quieres publicar hoy.
2. Si usaremos el hosting/repo actual o uno nuevo.
3. Usuarios iniciales: nombre, correo, rol.
4. Datos minimos para operar hoy: visitas, shoppers, proyectos, documentos.
5. Que automatizaciones quedan apagadas.
6. Que modulo seria inaceptable lanzar si no funciona.

## Decision de continuidad

Se prioriza salida hoy con Option A controlada.

El backend completo continua despues del lanzamiento, sin frenar la operacion inicial.

## Estado

- Plan documentado.
- Sin cambios frontend en este bloque.
- Sin runtime conectado en este bloque.
- Sin deploy en este bloque.
- Sin produccion ejecutada en este bloque.
- Sin escritura Firestore en este bloque.
