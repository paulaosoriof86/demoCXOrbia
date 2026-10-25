# Diagnóstico raíz R20 — variante de encabezado JULIO 26

Fecha: 2026-07-21
Estado: `ROOT_CAUSE_PROVEN_FIX_READY`

## Resultado

El HOLD remoto no corresponde a caché, cambio de HR, credenciales ni al mecanismo in-place. El endpoint alcanza la HR correcta, detecta `JULIO 26` y se detiene en el mapper fail-closed.

Error remoto:

```text
HTTP 503
live_hr_read_failed
R20 HR mapping HOLD: header_not_found en tab JULIO 26
```

## Evidencia directa de la HR vigente

Fuente: `HR Guatemala - Sincronizacion Google Sheets`, misma hoja configurada desde el inicio.

### JULIO 26 — Guatemala

Encabezado real:

```text
CIUDAD | DIRECCIÓN | Shopping | Franja Horaria | Formato de Cine | ...
```

Características:

- no contiene columna `País`;
- no contiene columna `ID CINEMA`;
- el país ya está codificado por el nombre del tab sin sufijo HN;
- contiene dos columnas exactas `Fecha submitido`;
- una columna duplicada puede estar vacía mientras la otra contiene evidencia;
- cuando ambas contienen valor, los valores observados coinciden.

### JULIO 26 HN

Encabezado real:

```text
País | ID CINEMA | CIUDAD | DIRECCIÓN | Shopping | ...
```

Conserva la firma completa.

## Defecto del mapper actual

`tools/hr-source/tya-build-live-hr-source-safe-r20.mjs`:

- `findHeader()` reconoce solo filas con `pais` y `shopping`;
- `isVisitRow()` exige `pais`, `shopping` e `idCinema`;
- el contrato `tya-hr-column-map-r20-v1.json` marca País e ID CINEMA como críticos sin variante contextual;
- el resolver rechazaría después las dos columnas `Fecha submitido` como ambiguas.

Por eso `JULIO 26` queda bloqueada antes de procesar visitas.

## Solución

El mapper conserva fail-closed y agrega dos variantes explícitas:

### `full_identity`

Requiere columnas de identidad completas. País e ID CINEMA se leen de la fila.

### `tab_scoped_compact`

Requiere exactamente los encabezados operativos:

- CIUDAD;
- DIRECCIÓN;
- Shopping;
- Franja Horaria;
- Quincena;
- Shopper Asignado.

Reglas:

- país derivado únicamente del patrón validado del nombre del tab;
- `ID CINEMA` permanece nulo; no se inventa ni se deriva del nombre visual;
- identidad estable mediante `hrRowId`, `sourceTab` y `sourceRow`;
- deduplicación no depende solo de Shopping;
- duplicados `Fecha submitido` se consolidan cuando solo uno tiene valor o todos coinciden;
- valores duplicados en conflicto producen HOLD crítico.

## Evidencia funcional para el gate remoto

La fila source-safe `JULIO 26!7` ya contiene fecha de cuestionario en la HR actual. Después del deploy:

- debe tener `cuestFecha` y faceta questionnaire confirmada;
- no debe seguir apareciendo dentro de `Cuest. pendiente`;
- la actualización debe reflejarse sin `location.reload()` y sin pantalla blanca.

## Paquete

`PAQUETE_EJECUCION_CODEX_CXORBIA_R20_HEADER_VARIANT_20260721.zip`

SHA-256:

`371199c7790c181dbc8077aedcc4c22286146e17f116b58d2611e68b2ab7b899`

El paquete contiene un aplicador determinista, gate de variantes y la orden exacta para Codex.

## Responsabilidades

- ChatGPT/backend: diagnóstico y corrección exacta — completado.
- Codex: aplicar, commit/push, gates y ejecutar el deploy mediante el workflow DEV ya autorizado.
- Claude: sin intervención.

## Estado seguro

Sin merge, producción, writes HR/Firestore/Auth/Storage, Make/Gemini ni pagos.