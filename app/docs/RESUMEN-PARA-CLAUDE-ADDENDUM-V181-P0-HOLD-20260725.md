# RESUMEN PARA CLAUDE — V181 P0 HOLD → V182

## Instrucción

Trabaja sobre la candidata exacta V181 y entrega una única candidata **V182 incremental**.

No reinicies módulos, no rediseñes, no cambies arquitectura y no abras otra línea de trabajo. Conserva la baseline V174 y todos los fixes válidos de V175–V181.

## Estado protegido

- 14 periodos;
- 616 visitas;
- mayo 2026: 44 visitas HR;
- 42 filas exactas;
- 2 revisiones fail-closed GT;
- 32 exactas GT;
- 10 exactas HN;
- 209 vínculos exactos;
- 207 montos canónicos;
- 0 pagos confirmados;
- 0 lotes.

## Delta real V181

Cambian realmente:

- `app/core/finanzas-core.js`;
- `app/modules/finanzas.js`;
- `app/modules/beneficios.js`.

Son idénticos a V180:

- `app/app.js`;
- `app/styles/layout.css`.

## P0 comprobado

`PENDING_CURRENCY` y `currencyOf` están declarados dentro de `CX.module('movimientos', ...)`, pero se usan desde callbacks separados.

### Lotes

```text
ReferenceError: PENDING_CURRENCY is not defined
app/modules/finanzas.js:828
```

### Liquidaciones / CxP histórica

```text
ReferenceError: currencyOf is not defined
app/modules/finanzas.js:710
```

Los callbacks de `CX.module` no comparten scope. `node --check` no detecta este error.

## Archivo funcional autorizado principal

- `app/modules/finanzas.js`.

No reescribas `finanzas-core.js`, `beneficios.js`, `app.js` ni `layout.css` si no existe un cambio funcional real.

## Corrección obligatoria

Elimina cualquier dependencia entre scopes locales de módulos.

Alternativas permitidas:

### Opción mínima recomendada

En `liquidaciones` define localmente:

```js
const PENDING_CURRENCY='pending_currency';
const currencyOf=(row)=>{
  if(row&&row.pais&&p.currency&&p.currency[row.pais]) return p.currency[row.pais];
  if(row&&row.moneda) return row.moneda;
  return PENDING_CURRENCY;
};
```

En `lotes` define localmente:

```js
const PENDING_CURRENCY='pending_currency';
```

### Opción compartida válida

Crear un helper top-level explícito que reciba `row` y `project`, y usarlo desde cada módulo. No crear un helper compartido que dependa del closure `p` de Movimientos.

## Validaciones obligatorias

1. `node --check` de cada JS modificado.
2. R26–R32 vigentes del checkout.
3. R32 debe devolver 25/25 PASS.
4. Harness de Lotes: el callback debe renderizar con fixtures sin ReferenceError.
5. Harness de CxP histórica: `Incluir CxP de meses anteriores` debe ejecutarse con una fila GT sin ReferenceError.
6. No modificar backend, tools, contracts, adapters, HR, `CX.data`, Firebase, Make, Gemini, pagos, lotes reales ni importadores.
7. Confirmar 0 pagos y 0 lotes reales.

## Evidencia requerida en V182

- lista real de archivos modificados;
- manifest y SHA-256;
- `node --check`;
- reportes R26–R32;
- salida del harness de Lotes;
- salida del harness de CxP histórica;
- confirmación de que `app.js` y estilos no fueron reescritos si no cambiaron;
- confirmación de 0 pagos y 0 lotes.

## Límite final

No crear R33.

Cuando R26–R32 vigentes pasen y no exista otro P0 reproducible de fuente, corresponde `APPLY_DELTA_DIRECTLY`.

Los conteos TyA, móvil, host autorizado/no autorizado y PDF/XLSX abiertos se validan post-apply sobre el mismo build.
