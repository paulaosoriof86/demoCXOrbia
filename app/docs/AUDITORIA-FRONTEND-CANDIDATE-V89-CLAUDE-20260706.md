# Auditoria frontend candidate V89 Claude - CXOrbia TyA

Fecha: 2026-07-06
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge
ZIP auditado: `Prototype development request CXOrbia V89.zip`
SHA256 ZIP: `c9a50f0c1edc1b1b7db4ebc5b17edfbf44d26d3fb9350f4f29e5f058b87fcb74`

## Decision

V89 mejora V88, pero NO queda como source lock final, NO production ready y NO backlog 100% cerrado.

Queda como candidata correctiva auditada para continuidad limitada: corrige los IDs duplicados de Academia y algunos textos puntuales, pero todavia conserva textos visibles/operativos que prometen envio, sincronizacion, Make, HR, correo o estado en vivo sin backend/gate activo.

Estado seguro confirmado por auditoria: sin deploy, sin produccion, sin import real, sin Firestore/Auth/Storage/Make/Gemini/WhatsApp/correo reales. El ZIP no incluye `tools/` ni `app/contracts/`. Si toca `app/core/automations.js`, pero eso es core frontend del prototipo, no backend real.

## Validaciones realizadas

- Estructura del ZIP: 97 archivos.
- Comparacion V88 -> V89: misma lista de archivos, sin agregados ni eliminados.
- Archivos modificados V88 -> V89: 3.
- Comparacion V86 -> V89: 4 archivos modificados acumulados.
- `node --check` sobre 61 archivos JS: OK=61, FAIL=0.
- `app/index.html`: 61 scripts. Sin faltantes locales; solo 2 dependencias externas CDN esperadas: SheetJS y Mammoth.
- Directorios backend protegidos en ZIP: `tools/` ausente y `app/contracts/` ausente.
- No se ejecuto navegador real, deploy, merge ni produccion; la validacion de consola reportada por Claude no se toma como prueba suficiente de source lock.

## Delta real V89 vs V88

Archivos modificados:

1. `app/core/automations.js`
   - Corrige `HR actualizada` / `sincronizado a la HR` a `HR: escritura preparada` / `se reflejara cuando el sync backend este activo`.

2. `app/modules/academia.js`
   - Cambia el nuevo curso de backend preparado de `a_backend` a `a_backend_prepared`.
   - Cambia la nueva ruta ops de `a_ops` a `a_ops_conflicts_route`.
   - Auditoria de IDs explicitos en Academia: sin duplicados detectados.

3. `app/modules/postulaciones.js`
   - Corrige `Nueva fecha autorizada · shopper notificado · HR sincronizada` a `Nueva fecha autorizada · notificacion preparada · HR sync pendiente backend`.
   - Corrige `Fecha original conservada · shopper notificado` a `Fecha original conservada · notificacion preparada · pendiente confirmacion`.

## Resultado por pendiente Claude

### #299 - P0 baseline correctiva de textos honestos

No queda completo.

Resuelto en V89:

- `app/core/automations.js`: HR writeback queda como escritura preparada/sync backend pendiente.
- `app/modules/postulaciones.js`: los dos textos de reprogramacion fueron corregidos.

Pendientes vivos detectados:

- `app/modules/postulaciones.js`: acciones de aprobacion aun muestran `Aprobada · WhatsApp enviado al shopper` y `Aprobada · WhatsApp enviado`.
- `app/modules/postulaciones.js`: edicion/asignacion aun muestra `Asignacion actualizada · HR sincronizada`.
- `app/modules/dashboard.js`: sigue mostrando `Correo enviado a ... (Make/Outlook)` y `WhatsApp enviado (Make)`.
- `app/modules/automatizaciones.js`: sigue mostrando `Registro de disparos (Make)`, `ultimos eventos enviados`, `Payload de prueba enviado al escenario Make` y estados equivalentes.
- `app/modules/cuestionario-shopper.js`: sigue mostrando `marca la visita como cuestionario enviado`.
- `app/core/manuales-data.js`: sigue usando `cuestionario enviado` y afirma lectura/escritura de HR viva en manuales.
- `app/modules/reservas.js`: sigue mostrando `Reserva aprobada · visita asignada · shopper notificado`.
- `app/modules/correo.js` y `app/core/topbar.js`: conservan `Correo enviado` en flujos donde debe distinguirse cuenta conectada real vs borrador/preparado.
- `app/modules/finanzas.js`, `app/modules/importador.js`, `app/modules/operacion-extra.js` y `app/modules/academia.js`: conservan residuos de `sincronizado/sincronizada/en vivo` que deben pasar a estados honestos si no hay backend real activo.

### #300 - P1 curso Academia sobre bloques backend preparados

Queda corregido en lo estructural.

- El nuevo curso `Capacidades de backend: que esta preparado` ahora usa `id:'a_backend_prepared'`.
- Ya no colisiona con `id:'a_backend'` del curso tecnico existente.
- El contenido mantiene lenguaje de `preparado / pendiente backend`.

Pendiente menor: revisar coherencia de Academia completa porque otras lecciones heredadas aun prometen notificacion automatica, Google Sheets/HR doble via, portal en vivo y pagos automaticos.

### #301 - P2 ruta operativa de ops

Queda corregido en lo estructural.

- La ruta `Equipo operativo: asignacion, conflictos y fuera de rango` ahora usa `id:'a_ops_conflicts_route'`.
- Ya no colisiona con `id:'a_ops'` del curso `Dashboard y gestion operativa`.
- La auditoria estatica indica que cada curso nuevo deberia abrir por ID unico.

Pendiente de aceptacion final: requiere validacion visual/navegador para confirmar navegacion y progreso en UI real. La validacion estatica no sustituye QA visual.

## Hallazgos que contradicen la entrega de Claude

Claude reporto `sin IDs duplicados`; esto SI se valida como correcto en Academia por auditoria estatica.

Claude reporto `textos honestos P0 pendientes corregidos`; esto NO queda completo. Corrigio algunos textos, pero dejo residuos operativos visibles en postulaciones, dashboard, automatizaciones, cuestionario shopper, reservas, correo, manuales, finanzas, importador, operacion extra y Academia.

Claude reporto `carga limpia sin errores de consola`; no se contradice, pero aqui solo se confirmo sintaxis estatica. No se ejecuto navegador real desde ChatGPT.

## Decision de empalme

- No empalmar como source lock final.
- No declarar backlog 100% cerrado.
- Puede usarse como candidata correctiva auditada para que Claude produzca una V90 ultra-corta, sin redisenar, corrigiendo solo los textos honestos residuales y coherencia documental/Academia.
- Backend seguro puede continuar en contratos/docs/validators sin activar runtime, pero no debe asumir que P0 frontend quedo cerrado.

## Impacto Phase A

Avanza parcialmente la transparencia de backend y corrige la colision de cursos, pero no cierra Phase A visual porque siguen textos que confunden `preparado/pendiente backend` con acciones reales ejecutadas.

## Impacto Academia/manuales/cursos

Academia mejora en IDs y contenido nuevo. Queda pendiente una limpieza transversal de textos heredados que aun prometen ejecucion real. Manuales internos tambien deben alinearse con la regla de estados honestos.

## Estado seguro

Solo auditoria documental. No se modifico frontend desde backend, no se activo runtime, no se escribio Firestore/HR/Storage, no se ejecuto Make/Gemini/correo/WhatsApp real, no hubo deploy, no hubo merge y no se importaron datos reales.
