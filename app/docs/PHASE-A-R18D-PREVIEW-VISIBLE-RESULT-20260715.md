# Phase A R18D — preview visible V131 con overlays existentes

Fecha: 2026-07-15

Decisión: **HOLD_FRONTEND_P0_FINANCE_PERIOD_COMPATIBILITY**

## Objetivo

Construir y validar una copia visible DEV de la baseline V131, sin modificar `app/modules` ni `app/core`, aplicando únicamente los resultados backend ya aprobados:

- R18A: HR viva canonizada;
- R18B: resultados existentes R11D/R14C/certificaciones;
- R14C: 196 controles financieros exactos y 92 casos de revisión;
- certificaciones: HOLD hasta fuente real de carryover.

## Resultado backend y de datos

La capa R18D quedó construida correctamente en copia de build y validó:

- 14 periodos únicos;
- 616 visitas;
- 44 visitas en el periodo activo JUL 2026;
- 216 shoppers protegidos;
- 196 controles financieros exactos R14C;
- los 196 continúan como `pending_financial_review`;
- 92 casos financieros preservados en revisión;
- 1 revisión shopper R11D;
- 1 revisión de fuente de certificaciones;
- 216 shoppers en HOLD de certificación;
- 0 pagos confirmados;
- 0 lotes de pago creados;
- 0 certificaciones carryover confirmadas;
- 0 solicitudes automáticas repetidas de certificación;
- `writes:false`, `imported:false`, `production:false`.

Se corrigió dentro del carril backend/CI una pérdida visual de 3 ítems causada por IDs ausentes en registros de control R14C: los 92 registros aprobados ahora reciben claves estables y únicas en la copia de build. No se recalculó R14C ni se modificó su fuente aprobada.

## Validación de módulos

- `Shoppers`: renderiza y muestra 216.
- `Certificación`: renderiza con copy honesto de pendiente de fuente, sin KPIs inventados.
- `Financiero`: bloqueado por un P0 de compatibilidad ya presente en el frontend V131.

## P0 reproducible encontrado

Error:

```text
TypeError: data.period is not a function
```

Cadena exacta:

```text
app/modules/finanzas.js
→ CX.fin.margenMoM(p,c)
→ app/core/finanzas-core.js / serieMensual(p,c)
→ this.porPais({project:()=>p, visitas:...})
→ CX.liq.forProject(data)
→ app/core/liquidacion.js requiere data.period()
```

`serieMensual()` construye un adapter parcial con `project()` y `visitas()`, pero omite `period()`. El error bloquea el render del módulo Financiero y, por regla de oro, backend no lo parchea desde un adapter ni modifica `app/core`.

## Corrección frontend focalizada requerida

Archivo único:

```text
app/core/finanzas-core.js
```

En `serieMensual(p,c)`, el objeto enviado a `porPais()` debe conservar `project()` y `visitas()` y agregar el alias compatible:

```js
period: () => p
```

No corresponde cambiar `app/core/liquidacion.js`, `app/modules/finanzas.js`, contratos backend, importadores, R11D, R14C ni la capa R18D.

## Estado del smoke

Run: `29428596675`.

Decisión automática: `FAIL_R18D_VISIBLE_OVERLAYS`, con un único blocker funcional: `module_render_error_financiero`.

Los contratos de datos, conteos, pagos y certificaciones pasaron antes de navegar al módulo Financiero.

## Siguiente paso

1. Claude corrige únicamente la compatibilidad `period()` en `app/core/finanzas-core.js` sobre V131.
2. Se recibe una candidata focalizada completa, sin cambios ajenos.
3. ChatGPT audita el delta únicamente contra V131 y empalma de forma atómica.
4. Se reejecuta R18D.
5. Si R18D pasa, se solicita autorización separada para desplegar la copia a Firebase Hosting DEV.
6. Después del deploy DEV se habilita la validación visual humana de Paula.

## Seguridad

Sin deploy, producción, Firestore/HR writes, imports, Auth/Storage, Make, Gemini ni pagos reales.