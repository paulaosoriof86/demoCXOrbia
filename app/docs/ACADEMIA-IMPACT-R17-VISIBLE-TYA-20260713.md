# Academia — impacto corrección visible TyA R17

Fecha: 2026-07-13

## Aprendizaje obligatorio

Academia debe enseñar que existen tres verificaciones distintas:

1. la fuente o payload está disponible;
2. la capa de datos está conectada;
3. el usuario realmente ve los datos correctos en el módulo.

Una ruta que abre sin errores no demuestra que la información del tenant esté correctamente presentada.

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
- revisar marca, proyecto y periodo;
- contrastar conteos globales y del periodo activo;
- verificar que no aparezcan fixtures de otro tenant;
- distinguir source-safe, materializado y producción;
- reportar diferencias con esperado/observado;
- no aprobar pagos, certificaciones o sincronizaciones por inferencia.

## Clasificación

- **Reusable CXOrbia:** validación visible de tenant y fuente.
- **Exclusivo cliente:** ejemplo TyA/Cinépolis.
- **Claude/prototipo:** sin implementación inmediata.
- **Academia:** contenido completo de este documento.
- **Sin impacto Claude:** orden de scripts, adapter y workflow.

## Estado

Backfill documental. No modifica ni publica cursos y no activa Gemini.
