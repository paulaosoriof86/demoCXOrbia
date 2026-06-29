# RESULTADO-VALIDACION-HR-HISTORICO-V4-REVISAR-LIQUIDACIONES-20260629

## Resultado

La validación de solo lectura contra Firestore DEV quedó en estado `REVISAR`.

## Conteos validados

| Colección | Esperados | Encontrados | Faltantes |
|---|---:|---:|---:|
| tenant | 1 | 1 | 0 |
| clients | 1 | 1 | 0 |
| projects | 26 | 26 | 0 |
| shoppers | 188 | 188 | 0 |
| visits | 573 | 573 | 0 |
| questionnaires | 556 | 556 | 0 |
| liquidations | 524 | 255 | 269 |

## Liquidaciones faltantes por proyecto / periodo

| Proyecto | Faltantes |
|---|---:|
| cinepolis-enero-26 | 34 |
| cinepolis-febrero-26 | 34 |
| cinepolis-marzo-26 | 34 |
| cinepolis-mayo-26 | 34 |
| cinepolis-diciembre-25 | 33 |
| cinepolis-abril-26 | 33 |
| cinepolis-abril-26-hn | 10 |
| cinepolis-marzo-26-hn | 10 |
| cinepolis-diciembre-25-hn | 10 |
| cinepolis-febrero-26-hn | 10 |
| cinepolis-mayo-26-hn | 10 |
| cinepolis-enero-26-hn | 10 |
| cinepolis-noviembre-25-hn | 7 |

## Interpretación

La carga histórica HR V4 no puede declararse validada todavía porque faltan 269 documentos de `liquidations`.

El resto de colecciones sí validó completo por IDs exactos:

- tenant
- clients
- projects
- shoppers
- visits
- questionnaires

La concentración por periodos sugiere carga parcial o corte en liquidaciones durante la ejecución anterior, no una falla general de estructura de visitas/cuestionarios.

## Próximo paso recomendado

Preparar y ejecutar solo con autorización un gate complementario limitado a `liquidations` faltantes, usando el JSON HR V4 como fuente y escribiendo únicamente documentos cuyo ID no exista todavía.

Antes de escribir se debe hacer dry-run para listar conteos por proyecto y rutas que serían creadas.

## Restricciones conservadas

- No se repitió carga completa.
- No se hizo Hosting.
- No se hizo merge.
- No se tocó producción.
- No se activó adapter global.
- No se modificó `/app/modules`.

## Clasificación doble documentación

- TyA específico: faltantes de liquidaciones HR GT/HN V4 en tenant `tya`.
- CXOrbia generalizable: patrón de validación por IDs exactos y carga complementaria idempotente para migraciones parciales.
