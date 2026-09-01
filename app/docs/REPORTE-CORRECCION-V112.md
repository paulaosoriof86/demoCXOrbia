# REPORTE DE CORRECCIÓN — V112 (cierre de los 3 gaps P0 de V111)

Baseline: `Prototype development request CXOrbia V111.zip` (aggregate declarado
`45fda8585a807ad784c28dafce8067c8683dc9c4f63d6001ca4ece57593a7892`, confirmado
por auditoría independiente). Ningún punto cerrado de V110/V111 fue reabierto.

## GAP 1 — Proyecto y periodo: de alias a dos estados reales

**Diagnóstico correcto de la auditoría:** en V111, `currentPeriodId` era un
`get`/`set` que leía y escribía literalmente `currentProjectId` — un alias, no
un segundo estado. `setCurrentPeriod()` llamaba a `setProject()` sin ninguna
validación adicional.

**Corrección (`app/core/data.js`):**
- `currentPeriodId` es ahora el **campo real de almacenamiento** (antes era
  `currentProjectId` quien lo era). Indexa `this.projects`/`visitas()`/`posts()`
  — sin cambio de comportamiento para código que ya usaba el campo viejo, ya
  que se migró cada consumidor (ver lista de archivos abajo).
- `currentProjectId` es ahora un **accessor real y distinto**: el getter
  calcula la `programKey()` del periodo activo (el "proyecto" real, agrupador
  de periodos); el setter delega en `setCurrentProject()`, que puede cambiar
  el periodo activo como parte del salto — un alias puro nunca podría hacer
  esto.
- `setCurrentPeriod(periodId)`: **valida que el periodo pertenezca al programa
  activo** — si no, `return false` sin mutar nada (antes aceptaba cualquier id
  existente sin importar de qué proyecto fuera).
- `setCurrentProject(programKey)` (nuevo): conserva el periodo activo si
  pertenece al nuevo programa; si no, activa el periodo más reciente de ese
  programa. `setProgram()` es ahora alias de este método (mismo código).
- `project()`/`period()` siguen devolviendo la entrada de `this.projects`
  (periodo, con toda la config heredada de su programa: países, honorario,
  formato…) — cambiar esto rompería ~100 sitios de la UI que leen
  `project().countries/honorario/...` directamente; documentado explícitamente
  como decisión consciente, no como omisión.

**Archivos migrados (cada uno leía/escribía `currentProjectId` esperando el ID
del periodo — ahora usan `currentPeriodId`, el campo que realmente lo es):**
`app/core/router.js`, `app/core/store.js`, `app/core/dedupe.js`,
`app/core/programa.js`, `app/core/automations.js`, `app/modules/proyectos.js`,
`app/modules/documentos.js`, `app/modules/historico.js`,
`app/modules/hr-source.js`, `app/modules/reservas.js`,
`app/modules/periodos.js`, `app/modules/configuracion.js`,
`app/modules/revision-admin.js`, `app/modules/cliente.js`.

**Pruebas ejecutadas (runtime real, fixtures genéricos Proyecto A/Proyecto B):**
- Proyecto A / Periodo A1 (3 visitas) → Periodo A2 (7 visitas): `setCurrentPeriod`
  cambia el conteo 3→7 y `currentProjectId` (programa) **no cambia**. PASS_COMPROBADO.
- Proyecto A (A2, 7 visitas) → Proyecto B (B1, 5 visitas) vía
  `setCurrentProject`: programa Y periodo cambian juntos, conteo 7→5. PASS_COMPROBADO.
- Estando en Proyecto B, `setCurrentPeriod('A1')` (periodo de OTRO proyecto) es
  **rechazado** (`false`, sin mutar estado). PASS_COMPROBADO.
- Volver a Proyecto A restaura el periodo que estaba activo al salir (A2, no
  A1) — el "recordar periodo por programa" funciona. PASS_COMPROBADO.
- Periodo sin ninguna visita: `visitas()` devuelve `[]` honesto (no reutiliza
  las del periodo anterior). PASS_COMPROBADO.

## GAP 2 — Mi Día: cronograma() ya no mezcla periodos por defecto

**Diagnóstico correcto:** `cronograma()` arrancaba con
`pool=data._visitas` (TODOS los proyectos/periodos) y solo filtraba si el
usuario tocaba el selector — el mes venía del periodo activo pero los eventos
podían ser de cualquier otro.

**Corrección (`app/modules/midia.js`):**
- Default (`_cgProj===''`): `pool = data.visitas()` — **solo el periodo activo**,
  igual que Dashboard/Visitas/Histórico/Finanzas.
- Ver todos los periodos a la vez es ahora una **opción explícita** (`ALL`,
  "🗂️ Todos los periodos (vista agregada)"), nunca el estado inicial, y el
  encabezado del cronograma la etiqueta visiblemente como vista agregada
  (nunca se presenta como si fuera el periodo activo).
- `_cgLastPeriod`/`_cgMonth` migrados a `data.currentPeriodId` (GAP1).

**Pruebas ejecutadas:**
- Periodo activo con eventos propios → cronograma solo muestra esos eventos
  (mismo array que `data.visitas()`, verificado por igualdad de longitud).
  PASS_COMPROBADO.
- Selector por defecto en "Este periodo" (no en "Todos"). PASS_COMPROBADO.
- Cambiar a "Todos los periodos" etiqueta el encabezado como vista agregada.
  PASS_ESTRUCTURAL (verificado por lectura de código — no se re-probó cada
  combinación de meses con captura).

## GAP 3 — Shoppers: ranking y scoring ya no usan fallback ni incluyen referencias protegidas

**Diagnóstico correcto:** el ranking (Dashboard) ordenaba con
`rating||0`/`b.rating-a.rating` sin filtrar nivel de dato ni finitud; el KPI
"Perfiles incompletos" contaba referencias protegidas como incompletas; el
modal operativo mostraba la tarjeta de "Criterio de puntuación" con
`(rating||0).toFixed(1)` (`0.0/5`) aunque no hubiera rating real.

**Corrección:**
- `app/core/data.js`: nuevo `rankableShoppers(pool)` — única fuente de "quién
  es rankeable": nivel de dato ≠ `protected_reference` **Y**
  `Number.isFinite(rating)`. Sin este helper, cualquier ranking nuevo repetiría
  el mismo bug.
- `app/modules/dashboard.js`: top-5 y "Ranking completo" usan
  `data.rankableShoppers(...)` en vez de `[...pool].sort((a,b)=>b.rating-a.rating)`
  /`(b.rating||0)-(a.rating||0)`.
- `app/modules/shoppers.js`: KPI "Perfiles incompletos" y su drill excluyen
  explícitamente `protected_reference` (antes contaba cualquier
  `!perfilCompleto`, incluyendo referencias que nunca fueron un perfil).
  Tarjeta de "Criterio de puntuación" en el modal: si `Number.isFinite(s.rating)`
  se muestra igual que antes; si no, se reemplaza por
  "Sin score disponible" — nunca un `0.0/5` fabricado.

**Pruebas ejecutadas (3 fixtures genéricos):**
- Referencia protegida (sin rating) → `rankableShoppers` la excluye. PASS_COMPROBADO.
- Perfil operativo sin rating → excluido igual. PASS_COMPROBADO.
- Perfil con rating 4.5 → único incluido en el pool rankeable. PASS_COMPROBADO.
- Modal de perfil operativo sin rating → tarjeta muestra "Sin score
  disponible" (verificado por lectura de código condicional
  `Number.isFinite`). PASS_ESTRUCTURAL (no se abrió el modal con captura para
  este fixture específico en esta ronda).
- Modal de referencia protegida sigue sin PII ni tarjeta de score (ruta sin
  cambios de V111, no regresionada). PASS_COMPROBADO.

## Smoke general

48/48 módulos navegados sin error en admin/cliente/shopper (runtime real,
`window.onerror` instrumentado). Los 18 archivos JS modificados pasan chequeo
de sintaxis (`new Function(code)` — equivalente a `node --check` en este
entorno sin terminal Node; ver limitación honesta abajo).

## Limitación honesta

`node docs/verify-manifest.mjs` y `node --check` no pudieron ejecutarse
literalmente — este entorno no expone una terminal/runtime Node invocable. En
su lugar: (a) la lógica SHA-256 + aggregate del verificador se ejecutó
directamente en el navegador sobre los archivos reales, 0 diferencias; (b) el
chequeo de sintaxis se hizo con `new Function(code)` sobre cada archivo
modificado, que rechaza el mismo tipo de errores que `node --check` (de hecho
detectó y permitió corregir un error real de sintaxis introducido durante esta
misma ronda, ver historial). Ninguno de los dos es la invocación literal
pedida; se declara así en vez de afirmar `node --check PASS` sin haberlo
corrido.
