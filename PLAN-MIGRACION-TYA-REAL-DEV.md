# PLAN-MIGRACION-TYA-REAL-DEV.md

## Objetivo

Dejar lista la ruta segura para migrar la base buena real de T&A a Firestore DEV, sin conectar la base vieja como backend vivo, sin mezclar datos demo, sin tocar producción y sin modificar `/app/modules`.

## Estado actual

Ya se completaron los gates técnicos previos principales:

- Firestore DEV creado.
- Auth Email/Password habilitado.
- Reglas Firestore DEV publicadas.
- Usuarios DEV ficticios importados.
- Claims DEV validados.
- Jerarquía tenant > cuenta > proyecto > visita aclarada.
- Seed ficticio T&A validado y cargado en Firestore DEV.
- Lectura del seed validada.
- Adapter headless validado contra Firestore DEV.
- Preview local controlado abrió sin romper UI.

Pendiente importante:

- La validación visual del preview mostró datos ficticios del prototipo, no exclusivamente el seed Firestore DEV. Por eso el import real debe empezar como piloto DEV controlado y luego validarse visualmente otra vez.

## Regla de seguridad

La base real de T&A no se sube al repositorio.

Debe quedar solo en archivo local dentro de una carpeta ignorada por Git:

```text
firebase/private-input/tya-export-real.json
```

Los reportes y transformaciones locales con datos reales quedan en:

```text
firebase/private-output/
```

Estas carpetas están excluidas en `.gitignore`.

## Pipeline preparado

Se agregaron herramientas locales para operar el export real sin exponerlo en GitHub:

1. Validación local sin PII en consola:

```text
firebase/client-write-tools/validate-tya-real-export.mjs
```

2. Transformación local a modelo Firestore:

```text
firebase/client-write-tools/transform-tya-real-export.mjs
```

3. Carga piloto real limitada en Firestore DEV:

```text
firebase/client-write-tools/load-tya-real-pilot-firestore-dev-sdk.mjs
```

## Formato esperado del export

Archivo JSON UTF-8 sin BOM con estas colecciones cuando existan:

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
PROBLEMAS_DETECTADOS
REGISTROS_DESCARTADOS
METADATA_EXPORT
```

Si el export viene con nombres equivalentes en inglés o con algunas colecciones faltantes, el validador lo reporta y el transformador intenta mapear lo posible, pero la carga real no debe continuar si faltan shoppers, proyectos o visitas.

## Datos sensibles

No cargar en claro durante el piloto:

- Datos bancarios.
- DPI/documentos personales.
- NDA.
- Evidencias, fotos, videos o audios.
- Archivos privados.

Contactos reales:

- Por defecto el transformador omite correo/teléfono.
- Puede enmascararlos con `CXORBIA_TYA_CONTACT_MODE=mask`.
- Solo puede incluirlos en claro si Paula autoriza de forma separada `CXORBIA_TYA_INCLUDE_CONTACTS_APPROVED=YES_PAULA_INCLUDE_CONTACTS_DEV`.

## Orden seguro

### Paso 1 — colocar export real local

Colocar el archivo real aquí, sin subirlo a GitHub:

```text
firebase/private-input/tya-export-real.json
```

### Paso 2 — validar export local

Ejecutar validador. Resultado esperado:

- Conteos por colección.
- Duplicados por llave natural.
- Alertas de campos sensibles.
- Reporte local en `firebase/private-output/`.

No escribe Firestore.

### Paso 3 — transformar a modelo Firestore

Ejecutar transformación con autorización local.

Resultado esperado:

```text
firebase/private-output/tya-real-transformed-firestore.json
firebase/private-output/tya-real-transform-report.md
```

No escribe Firestore.

### Paso 4 — cargar piloto real DEV

Solo con autorización expresa de Paula.

Restricción inicial:

- 1 proyecto real.
- Máximo 20 visitas.
- Shoppers solo referenciados por esas visitas.
- Sin evidencias.
- Sin datos bancarios/documentos/NDA.
- Sin Hosting.
- Sin producción.

### Paso 5 — validar lectura y preview

Después de la carga piloto:

- Leer Firestore DEV.
- Validar conteos contra reporte transformado.
- Validar adapter headless con el proyecto real piloto.
- Validar preview local controlado.

### Paso 6 — ampliación por lotes

Solo si el piloto real DEV se ve correcto:

- Ampliar por lotes de 100 a 200 visitas.
- Validar conteos antes y después de cada lote.
- Documentar descartes y problemas.

## Lo que sigue bloqueado

Hasta autorización separada:

- No cargar toda la base real.
- No activar adapter global.
- No publicar Hosting.
- No tocar producción.
- No cargar Storage/evidencias.
- No hacer merge.

## Señal operativa para Paula

Ya se puede pedir/usar el export limpio real de T&A para validación local y piloto DEV, con estas condiciones:

```text
El export debe estar en JSON UTF-8 sin BOM, sin datos demo mezclados, y debe guardarse localmente en firebase/private-input/tya-export-real.json. Primero se validará y transformará localmente; luego se cargará solo un piloto DEV si Paula lo autoriza de forma expresa.
```
