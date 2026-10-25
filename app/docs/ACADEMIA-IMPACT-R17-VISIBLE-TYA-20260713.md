# Academia — impacto corrección visible TyA R17

Fecha: 2026-07-13

## Estado

La build visible TyA R17 quedó desplegada y verificada remotamente.

- build: `tya-visible-r17-source-safe`;
- commit desplegado: `cf4c845722e2bbe2b401b2b332ff9f4d2f6cb803`;
- run deploy: `29285177647`;
- smoke remoto independiente: `29285540738`;
- 13/13 rutas críticas;
- 0 blockers, warnings o errores de consola/página.

## Aprendizaje obligatorio

Academia debe enseñar que existen tres verificaciones distintas:

1. la fuente o payload está disponible;
2. la capa de datos está conectada;
3. el usuario realmente ve los datos correctos en el módulo.

Una ruta que abre sin errores no demuestra por sí sola que la información del tenant esté correctamente presentada.

## Caso TyA

El payload contenía 14 periodos, 616 visitas y 210 shoppers, pero la build anterior podía seguir mostrando superficies demo porque el selector de origen se resolvía después del bridge. Los periodos tampoco tenían IDs independientes.

La corrección deja:

- tenant visible TyA;
- proyecto visible Cinépolis;
- 14 periodos seleccionables;
- 616 visitas vinculadas por periodo;
- 44 visitas en JUL 2026;
- 210 shoppers source-safe;
- cero proyectos demo genéricos;
- estado `Source-safe (preview) / Listo`;
- producción e importación todavía apagadas.

## Checklist que debe enseñar Academia

- confirmar ambiente y fuente;
- revisar marca, proyecto raíz y periodo activo;
- contrastar conteos globales y del periodo activo;
- verificar que no aparezcan fixtures de otro tenant;
- distinguir source-safe, materializado y producción;
- reportar diferencias con esperado/observado;
- no aprobar pagos, certificaciones o sincronizaciones por inferencia;
- reconocer que `Admin Demo` es una identidad temporal hasta Auth real;
- distinguir el periodo seleccionado del mes mostrado por un calendario navegable.

## Hallazgo para manuales

En `Mi Día`, el selector y encabezado pueden indicar JUL 2026 mientras el calendario abre visualmente en junio de 2026.

Academia/manuales deben:

- explicar el periodo operativo activo;
- explicar la navegación del calendario;
- indicar cómo confirmar qué periodo alimenta los KPIs y visitas;
- documentar el ajuste visual cuando Claude lo resuelva;
- no confundir el mes del calendario con un cambio de fuente o pérdida de datos.

## Impacto por rol

- **Admin/Operativo:** validar proyecto, periodo, KPIs y visitas.
- **Cliente:** validar resultados y sucursales dentro del contexto asignado.
- **Shopper:** validar visitas, certificación, beneficios y datos protegidos.
- **Superadmin:** distinguir ambiente DEV, source-safe y gates pendientes.

## Clasificación

- **Reusable CXOrbia:** validación visible de tenant, proyecto raíz, periodo y fuente.
- **Exclusivo cliente:** ejemplo TyA/Cinépolis.
- **Claude/prototipo:** calendario Mi Día vs periodo y futura identidad Auth.
- **Academia:** contenido completo de este documento.
- **Sin impacto Claude:** orden de scripts, adapter, workflow, proof y hashes.

## Estado seguro

Backfill documental. No modifica ni publica cursos, no activa Gemini y no ejecuta writes o producción.
