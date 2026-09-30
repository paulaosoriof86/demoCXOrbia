# PAQUETE EXCLUSIVO PARA CLAUDE — R18D P0 FINANZAS / PERIOD COMPATIBILITY

Fecha: 2026-07-15

## Alcance obligatorio

Trabajar únicamente sobre la baseline V131 ya aceptada y empalmada.

No reiniciar auditoría, no reconstruir módulos, no rediseñar UI, no tocar backend, contratos, adapters, tools, workflows, datos source-safe, R11D, R14C, Firebase, Make, Gemini ni Academia.

Este paquete contiene **un solo P0 frontend reproducible**.

## Error exacto

Al abrir Administración → Financiero en la copia visible V131 con datos TyA source-safe:

```text
TypeError: data.period is not a function
```

Cadena reproducida por Playwright:

```text
Object.forProject        app/core/liquidacion.js
Object.porPais           app/core/finanzas-core.js
Object.serieMensual      app/core/finanzas-core.js
Object.margenMoM         app/core/finanzas-core.js
app/modules/finanzas.js
```

## Causa raíz

En `app/core/finanzas-core.js`, `CX.fin.serieMensual(p,c)` crea un adapter parcial para llamar `porPais()`:

```js
this.porPais({
  project: () => p,
  visitas: () => (CX.data._visitas || []).filter(v => v.projectId === p.id)
})
```

`porPais()` llama después a:

```js
CX.liq.forProject(data)
```

Y `app/core/liquidacion.js` usa el contrato V131:

```js
const p = data.period();
```

El adapter parcial no define `period()`, por lo que el módulo Financiero no renderiza.

## Corrección exacta permitida

Modificar únicamente:

```text
app/core/finanzas-core.js
```

En `serieMensual(p,c)`, conservar `project()` y `visitas()` y agregar:

```js
period: () => p
```

Resultado esperado equivalente:

```js
const fp = this.porPais({
  project: () => p,
  period: () => p,
  visitas: () => (CX.data._visitas || []).filter(v => v.projectId === p.id)
});
```

No cambiar la semántica general proyecto/periodo. Este alias existe únicamente porque `serieMensual()` está construyendo un adapter local que debe satisfacer los contratos consumidos por `porPais()` y `CX.liq.forProject()`.

## Archivos bloqueados

No modificar:

- `app/core/liquidacion.js`;
- `app/modules/finanzas.js`;
- otros archivos de `app/core`;
- otros archivos de `app/modules`;
- `app/index.html`, salvo actualización automática y necesaria de source lock/manifest de la candidata;
- `backend/`;
- `tools/`;
- `.github/workflows/`;
- datos TyA;
- documentación backend.

## Validaciones obligatorias

1. `node --check app/core/finanzas-core.js` debe pasar.
2. Administración → Financiero debe renderizar sin error JS.
3. Administración → Shoppers debe seguir mostrando 216 en la build source-safe.
4. Administración → Certificación debe seguir mostrando pendiente de fuente, sin aprobación inventada.
5. No debe aparecer pago confirmado, lote confirmado ni certificación confirmada sin fuente.
6. No introducir cambios visuales o funcionales ajenos.
7. Regenerar el manifest/source lock correspondiente a la nueva candidata completa.
8. Entregar el árbol completo de la candidata, no un parche aislado.

## Contratos que deben preservarse

- Baseline de origen: V131.
- 14 periodos.
- 616 visitas.
- 44 visitas JUL 2026.
- 216 shoppers protegidos.
- 196 controles financieros exactos en `pending_financial_review`.
- 92 casos financieros en revisión.
- 0 pagos confirmados.
- 0 lotes de pago.
- 0 certificaciones carryover confirmadas.
- 0 solicitudes automáticas repetidas de certificación.

## Respuesta requerida de Claude

Indicar:

- archivo modificado;
- línea/función corregida;
- confirmación de que no tocó archivos ajenos;
- resultado de sintaxis;
- resultado de render del módulo Financiero;
- versión interna de la candidata;
- manifest/source lock regenerado.

Entregar una nueva candidata completa derivada directamente de V131 con solo esta corrección focalizada.