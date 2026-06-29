# MIGRACION-BASE-BUENA-TYA.md

## Objetivo

Definir cuándo y cómo cargar la base buena que viene de la plataforma anterior de T&A, sin conectar esa base como backend vivo y sin contaminar el producto comercializable CXOrbia.

## Estado actual

Ya corresponde preparar y validar localmente el export limpio de T&A.

La carga operativa debe entrar por etapas:

1. Validación local del export.
2. Transformación local al modelo Firestore.
3. Carga piloto DEV limitada.
4. Validación headless y visual.
5. Carga ampliada por lotes solo si el piloto queda correcto.

No corresponde todavía:

- Cargar toda la base completa sin piloto.
- Activar adapter global.
- Publicar Hosting.
- Hacer merge.
- Tocar producción.
- Cargar archivos/evidencias.

## Gates ya completados

- `firestore.rules` publicadas en Firebase DEV.
- Usuarios DEV ficticios importados.
- Claims/customAttributes DEV validados.
- Tenant `tya` validado con estructura tenant > cuenta > proyecto > visita.
- Seed ficticio T&A validado en dry-run.
- Seed ficticio T&A cargado en Firestore DEV.
- Lectura del seed validada.
- Adapter headless validado contra Firestore DEV.
- Preview local controlado abrió sin romper UI ni mezclar producción.

## Advertencia antes de carga operativa

El preview visual controlado mostró los 3 proyectos ficticios del prototipo, no exclusivamente el seed Firestore DEV de 1 proyecto.

Por eso la carga debe iniciar con piloto DEV controlado y validación de conteos, no con carga total.

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

Además debe incluir, si existen:

```text
PROBLEMAS_DETECTADOS
REGISTROS_DESCARTADOS
METADATA_EXPORT
```

## Reglas del export

1. No inventar datos.
2. No corregir manualmente dentro del export original.
3. No mezclar datos demo con datos operativos.
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
| Shopper | identificador normalizado |
| Visita | proyecto + sucursal + país + quincena + escenario + fecha/rango |
| Postulación | visitaId + shopperId |
| Cuestionario marcado | visitaId + shopperId + fecha |
| Certificación | shopperId + proyectoId + versión |
| Liquidación | visitaId + shopperId + loteId |
| Usuario | identificador normalizado |

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

## Herramientas locales preparadas

Las herramientas quedan en `firebase/client-write-tools/` y operan con archivos locales ignorados por Git.

Validador local:

```text
validate-tya-real-export.mjs
```

Transformador local:

```text
transform-tya-real-export.mjs
```

Cargador piloto DEV:

```text
load-tya-real-pilot-firestore-dev-sdk.mjs
```

El archivo de entrada no debe subirse al repo. Debe guardarse localmente en:

```text
firebase/private-input/tya-export-real.json
```

Los reportes y transformaciones quedan localmente en:

```text
firebase/private-output/
```

## Primer piloto

El primer piloto debe limitarse a:

- 1 proyecto de T&A.
- 20 visitas máximo.
- Shoppers asociados a esas visitas.
- Sin archivos/evidencias.
- Sin campos privados no necesarios para la validación operativa.

## Señal para Paula

La señal actual es:

```text
Paula, ya podemos pedir/usar el export limpio de T&A para validación local y piloto DEV. Debe venir en JSON UTF-8 sin BOM, sin datos demo mezclados. Primero se validará localmente y luego se cargará solo un piloto controlado si lo autorizas expresamente.
```
