# MIGRACION-BASE-BUENA-TYA.md

## Objetivo

Definir cuándo y cómo cargar la base de datos buena que viene de la plataforma anterior de T&A, sin conectar esa base como backend vivo y sin contaminar el producto comercializable CXOrbia.

## Estado actual

Todavía NO corresponde cargar la base buena real.

Razón:

- El adapter Firestore está creado pero desactivado.
- Las reglas Firestore deben validarse primero.
- Falta crear usuarios DEV y claims de prueba.
- Falta probar el seed piloto ficticio.
- Storage está pendiente por Blaze.
- Producción `tya-plataforma.web.app` no se toca.

## Cuándo avisar a Paula para cargar la base buena

Avisar cuando se cumplan todos estos puntos:

1. `firestore.rules` validadas en DEV por rol.
2. Usuarios DEV creados con claims correctos.
3. Tenant `tya` validado.
4. Proyecto piloto `tya-piloto` cargado con datos ficticios.
5. Adapter probado con `CX.BACKEND.enabled = true` solo en DEV o preview controlado.
6. Dashboard, visitas, shoppers, postulaciones y beneficios renderizan con datos piloto.
7. No hay errores de asincronía en módulos.
8. Se documentaron pendientes en `PENDIENTES-PROTOTIPO.md`.
9. Paula autoriza explícitamente iniciar export limpio de la plataforma anterior.

Hasta que esos puntos estén cumplidos, NO cargar base real.

## Qué debe traer el export limpio

El export debe venir en JSON, UTF-8, sin BOM, con estructura clara y sin datos demo mezclados.

Colecciones esperadas:

```text
shoppers
visitas_asignadas
visitas_realizadas
cuestionarios_marcados
certificaciones_aprobadas
clientes
proyectos
liquidaciones
pagos_lotes
notificaciones
usuarios
```

Además debe incluir:

```text
PROBLEMAS_DETECTADOS
REGISTROS_DESCARTADOS
METADATA_EXPORT
```

## Reglas del export

1. No inventar datos.
2. No corregir manualmente dentro del export original.
3. No mezclar datos demo con datos reales.
4. No conectar directo a la base anterior.
5. Mantener una copia intacta del JSON original.
6. Crear una copia transformada para Firestore.
7. Deduplicar por llaves naturales.
8. Cargar primero un subconjunto piloto.
9. Validar totales antes y después de importar.
10. Documentar descartes y problemas.

## Llaves naturales sugeridas

| Entidad | Llave sugerida |
|---|---|
| Shopper | email normalizado o teléfono normalizado + país |
| Visita | proyecto + sucursal + país + quincena + escenario + fecha/rango |
| Postulación | visitaId + shopperId |
| Cuestionario marcado | visitaId + shopperId + fecha |
| Certificación | shopperId + proyectoId + versión |
| Liquidación | visitaId + shopperId + loteId |
| Usuario | email normalizado |

## Orden de migración recomendado

1. Copia intacta del export original.
2. Auditoría de estructura y encoding UTF-8.
3. Conteo por colección.
4. Detección de duplicados.
5. Separación de registros descartados.
6. Transformación a modelo `/tenants/tya`.
7. Carga piloto reducida.
8. Validación visual en CXOrbia DEV.
9. Carga ampliada por lotes.
10. Validación final contra totales de origen.

## Primer piloto con base buena

Cuando llegue el momento, el primer piloto real debe limitarse a:

- 1 proyecto real de T&A.
- 10 shoppers reales o anonimizados según autorización.
- 20 visitas máximo.
- Sin evidencias pesadas.
- Sin datos bancarios reales, salvo que ya esté definido cifrado.
- Sin NDA ni documentos privados hasta activar Storage y reglas privadas.

## Datos sensibles

No cargar en claro:

- datos bancarios
- documentos personales
- NDA
- evidencias privadas
- teléfonos/correos si el entorno no está asegurado

Estos campos deben cifrarse, omitirse o mantenerse fuera del piloto hasta tener la capa segura.

## Señal para Paula

Cuando estemos listos, el aviso debe decir:

```text
Paula, ya estamos listas para pedir/cargar el export limpio de la base buena de T&A.
Debe venir en JSON UTF-8, sin datos demo mezclados, y primero lo cargaremos como piloto controlado.
```

Antes de esa señal, continuar solo con preparación, validación y documentación.
