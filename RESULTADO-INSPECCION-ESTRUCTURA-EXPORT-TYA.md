# RESULTADO-INSPECCION-ESTRUCTURA-EXPORT-TYA.md

## Fecha

2026-06-28

## Resultado

La inspección local del export T&A confirmó que el archivo no viene como arrays de primer nivel. Viene como objeto con colecciones anidadas en forma de mapa por llaves.

## Llaves raíz observadas

- `tya_finance`
- `tya_noticias`
- `tya_posts`
- `tya_recursos`
- `tya_shoppers_extra`
- `tya_users`

## Conteos observados parcialmente

- `tya_posts`: 36 propiedades.
- `tya_shoppers_extra`: 284 propiedades.
- `tya_users`: 4 propiedades.
- `tya_noticias`: 31 propiedades.
- `tya_recursos`: 4 propiedades.
- `tya_finance`: 1 propiedad.

## Interpretación

El validador inicial buscaba colecciones esperadas como arrays (`shoppers`, `proyectos`, `visitas_asignadas`, etc.). Por eso reportó conteos cero aunque el export sí contiene datos.

## Acción tomada

Se agregó herramienta local:

```text
firebase/client-write-tools/normalize-tya-rtdb-export.mjs
```

Objetivo:

- Leer el export privado local.
- Convertir mapas de objetos a arrays intermedios.
- Guardar una salida normalizada local en `firebase/private-output/`.
- Permitir una nueva validación sin subir datos al repo.

## Confirmaciones

- No se escribió Firestore.
- No se hizo deploy de Hosting.
- No se hizo merge.
- No se tocó producción.
- No se modificó `/app/modules`.
