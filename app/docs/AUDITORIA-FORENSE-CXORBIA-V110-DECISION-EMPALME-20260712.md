# AUDITORÍA FORENSE CXORBIA V110 — DECISIÓN DE EMPALME

Fecha: 2026-07-12

## Identidad

- ZIP: `Prototype development request CXOrbia V110.zip`
- SHA-256: `1f9e30f711899af500683e7292eb8652e9e0bc4b888cd1252a5482795dbba227`
- Base inmediata comparada: V109
- Rama viva: `docs-tya-v6-v71-audit`
- PR: #7 draft/open/no merge

## Delta V109 → V110

- V109: 139 archivos.
- V110: 143 archivos.
- Agregados: 4.
- Modificados: 5.
- Sin módulos eliminados.

Archivos agregados:

- `app/docs/CHECKLIST-V110-COMPLETADO.md`
- `app/docs/MANIFEST-V110.json`
- `app/docs/REPORTE-CORRECCION-V110.md`
- `app/docs/smoke-v110/SMOKE-CRITICOS-V110.json`

Archivos modificados:

- `app/core/build-lock.js`
- `app/core/data.js`
- `app/docs/verify-manifest.mjs`
- `app/modules/academia.js`
- `app/modules/finanzas.js`

## Validación estructural

- 67 archivos JS/MJS revisados.
- 0 errores de sintaxis.
- 66 etiquetas script detectadas en `index.html`.
- 64 scripts locales.
- 0 scripts locales faltantes.
- 48 módulos cargados.

## Matriz de afirmaciones Claude

### P0 1 — Academia por país del shopper

Estado: `PASS_COMPROBADO`.

Pruebas independientes:

- Shopper GT: contexto `paises:[GT]`; ve contenido GT y no HN.
- Shopper HN: contexto `paises:[HN]`; ve contenido HN y no GT.
- Shopper sin país resoluble: `paises:[]`; no ve contenido restringido.
- Contenido global sin restricción de país: permanece visible.
- Invitado no shopper con `scopePaises:[GT]`: ve GT y no HN.
- El contenido oculto no entra en la colección visible usada por KPIs.

Conclusión: el P0 de fuga de país queda cerrado.

### P0 2 — Finanzas bloquea datos incompletos antes de procesar

Estado: `PASS_COMPROBADO`.

Se probó una selección con:

- falta país;
- falta moneda;
- falta país y moneda;
- monto `NaN`;
- monto `Infinity`;
- monto negativo;
- falta ID/visita inexistente;
- proyecto incompatible;
- una visita válida GT/GTQ;
- una visita válida HN/HNL.

Resultado:

- solo las 2 visitas válidas fueron procesadas;
- 8 entradas fueron devueltas como `reviewRequired` con motivo;
- las inválidas conservaron su estado anterior;
- las inválidas no recibieron lote ni fecha;
- las inválidas no generaron movimientos;
- las inválidas no dispararon automatización;
- GT/GTQ y HN/HNL quedaron en lotes separados.

Conclusión: el P0 de dato incompleto procesado como pago queda cerrado.

## Manifest V110

Ejecución literal:

```bash
node app/docs/verify-manifest.mjs
```

Resultado:

- 138 archivos declarados.
- 0 faltantes.
- 0 hashes distintos.
- Aggregate: `8ccd1fc0b72b03f4119f949dac322a63db277bbd1770d86212df1b0f311962d0`.
- Exit code 0.

Limitación documental P1: el árbol `app/` contiene 143 archivos y el manifest declara 138 con 3 exclusiones explícitas. Quedan dos archivos históricos omitidos sin aparecer en la lista de exclusión:

- `docs/MANIFEST-V109.json`;
- `docs/REPORTE-CORRECCION-V108.md`.

Esto no invalida los hashes de los 138 archivos declarados ni constituye P0 de runtime, pero impide llamar a este manifest inventario total del ZIP.

## Hallazgos P1/P2 que no bloquean baseline

### P1 — hardening de `payVisits()`

- país o moneda con solo espacios pueden superar la validación;
- el mismo ID repetido dentro de una llamada directa puede procesarse dos veces;
- una llamada directa posterior sobre una visita ya liquidada puede crear otro movimiento.

Mitigación actual de UI: el carrito usa IDs únicos y solo presenta liquidaciones elegibles; después de procesar, la visita deja de ser seleccionable por el flujo normal. Debe endurecerse antes de producción real/backend idempotente, pero no bloquea la baseline frontend.

### P1 — copy del lote completamente inválido

Cuando toda la selección queda en revisión, un mensaje secundario puede iniciar con `Lote registrado como pagado (preview) · 0 visita(s)`. El conteo y la revisión son honestos, pero el encabezado puede confundir. Debe ajustarse en un paquete futuro acumulado, no requiere paquete Claude inmediato.

### P2 — nombre del contrato de retorno

La instrucción solicitó separar `processed` y `reviewRequired`; la implementación retorna equivalentes `pagadas`, `detalle` y `reviewRequired`. El comportamiento funcional pasa, pero conviene normalizar el nombre al conectar backend.

## Regresiones

No se detectó regresión P0 en:

- Portal Cliente con scores finitos y bandas unificadas;
- separación de lotes completos por país/moneda;
- IDs determinísticos;
- responsive móvil ya cerrado;
- Beneficios sin fallback de shopper;
- certificaciones con copy honesto;
- cache demo/real;
- shell y navegación.

## Decisión

V110 queda como **baseline auditada de continuidad backend** y es elegible para empalme selectivo.

- No requiere otro paquete Claude.
- No se declara source lock final todavía por la limitación de cobertura del manifest y los P1/P2 descritos.
- Backend seguro puede continuar sobre V110.
- No hay deploy, producción, import real, Firebase/HR writes, Make/Gemini live ni pagos reales.

## Estado del empalme físico en repo

El runtime V110 todavía no está aplicado al árbol `app/` de la rama viva. Se preparó un workflow controlado de transferencia/empalme, pero no se ejecutó porque el conector disponible no pudo transferir automáticamente el payload binario del ZIP al repo. No se afirma un commit de runtime inexistente.

La decisión de baseline sí queda documentada; el empalme físico permanece `PREPARADO_NO_EJECUTADO` hasta disponer de un canal de transferencia verificable o un commit directo del runtime.

## Clasificación transversal

- `Reusable CXOrbia`: fail-closed por país, validación previa, lotes homogéneos, revisión de inválidos.
- `Exclusivo TyA`: prueba GT/GTQ frente a HN/HNL y operación por país del shopper.
- `Claude/prototipo`: dos P0 cerrados; P1 de copy y hardening acumulados.
- `Academia`: scope por país del shopper comprobado; revisar impacto en rutas/KPIs en el próximo smoke source-safe.
- `Sin impacto Claude`: transferencia física, manifest de empalme y gates de repo.

## Siguiente bloque exacto

1. Completar empalme físico V110 cuando exista transferencia verificable.
2. Ejecutar R10 visual source-safe sobre la baseline V110.
3. Mantener global HOLD hasta evidencia Firebase DEV read-only y fuentes sanitizadas de pagos/certificaciones.
