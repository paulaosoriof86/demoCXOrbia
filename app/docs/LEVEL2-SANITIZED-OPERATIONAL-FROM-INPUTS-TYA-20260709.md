# Level 2 sanitized operational from inputs TyA

Fecha: 2026-07-09  
Bloque: generador Level 2 desde Level 1 + outputs sanitizados  
Estado: creado, no conectado, seguro.

## 1. Objetivo

Crear el generador que combina un payload Level 1 de visitas sanitizadas con outputs opcionales de shoppers, certificaciones y liquidaciones para producir un payload Level 2 operacional sanitizado.

Este bloque sigue enfocado en Phase A con informacion real/sanitizada de TyA, sin copiar base vieja, sin PII y sin tocar runtime.

## 2. Archivo creado

- `tools/contracts/tya-level2-sanitized-operational-from-inputs.mjs`

## 3. Entradas

Requerida:

```bash
--level1 .tmp/tya-level1-sanitized-visits/tya-minimal-sanitized-input-level1.json
```

Opcionales:

```bash
--shoppers C:/ruta/local/shoppers-sanitizados.json
--certifications C:/ruta/local/certificaciones-sanitizadas.json
--liquidations C:/ruta/local/liquidaciones-sanitizadas.json
```

## 4. Salidas

Bajo `.tmp/tya-level2-sanitized-operational/`:

- `tya-minimal-sanitized-input-level2.json`
- `tya-level2-sanitized-operational-generation-report.json`
- `tya-level2-sanitized-operational-generation-report.md`

## 5. Comando base

Con solo Level 1:

```bash
node tools/contracts/tya-level2-sanitized-operational-from-inputs.mjs --level1 .tmp/tya-level1-sanitized-visits/tya-minimal-sanitized-input-level1.json
```

Con inputs sanitizados adicionales:

```bash
node tools/contracts/tya-level2-sanitized-operational-from-inputs.mjs --level1 .tmp/tya-level1-sanitized-visits/tya-minimal-sanitized-input-level1.json --shoppers C:/ruta/local/shoppers-sanitizados.json --certifications C:/ruta/local/certificaciones-sanitizadas.json --liquidations C:/ruta/local/liquidaciones-sanitizadas.json
```

## 6. Comportamiento si faltan inputs opcionales

Si no hay shoppers sanitizados, genera shoppers opacos desde `shopperRef` de visitas y los deja en `pending_review`.

Si no hay certificaciones sanitizadas, genera registros `pending_mapping_review` para preservar la regla de no repetir certificaciones sin mapeo.

Si no hay liquidaciones sanitizadas, genera candidatos desde visitas submitidas/control pago con montos 0 y `requiresFinanceCrosscheck=true`.

Esto evita inventar datos, pero permite preparar el control operacional.

## 7. Protecciones

Bloquea input o salida si aparece:

- DPI;
- banco;
- telefono;
- email;
- nombre shopper crudo;
- HR URL privada;
- spreadsheetFileId;
- serviceAccountJson;
- evidencia cruda;
- webhook/token;
- oldRtdbDump;
- legacyDatabaseExport.

## 8. Impacto real en Phase A / produccion

Permite preparar una vista operacional DEV preview con:

- visitas sanitizadas;
- shoppers opacos o sanitizados;
- preservacion de certificaciones;
- liquidaciones como control de pago;
- issues obligatorios.

No autoriza import, produccion, pagos ni runtime switch.

## 9. Trabajo previo recuperado

Recupera:

- Level 1 visitas sanitizadas;
- shoppers historicos como referencias, no PII;
- certificaciones ya presentadas como preservacion;
- liquidaciones de junio como control de pago;
- plataforma actual/legacy como trazabilidad, no base a copiar.

## 10. Claude/prototipo

Pendientes derivados:

- UI debe mostrar Level 2 como preview operacional, no import real.
- Shoppers opacos deben mostrarse claramente como pendientes de revision si aplica.
- Certificaciones preservadas no deben pedirse de nuevo salvo regla.
- Liquidaciones deben mostrarse como control, no pagado final.
- Academia debe explicar sanitizacion y mapeo de certificaciones/pagos.

## 11. Siguiente bloque

Actualizar el preflight local para incluir generacion y validacion Level 2 cuando exista Level 1.

## 12. Estado seguro

- Sin deploy.
- Sin produccion.
- Sin runtime switch.
- Sin modulos modificados.
- Sin import real.
- Sin Firestore writes.
- Sin HR writes.
- Sin base vieja conectada.
- Sin datos sensibles.
- Sin Make/Gemini real.
