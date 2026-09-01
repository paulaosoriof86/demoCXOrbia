# Auditoria frontend candidate V88 Claude - CXOrbia TyA

Fecha: 2026-07-06
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge
ZIP auditado: `Prototype development request CXOrbia V88.zip`
SHA256 ZIP: `1e9d5b944ec5110fedda74aad2afddb131014582c144646c2f5472e883cab6a4`

## Decision

V88 queda como candidata correctiva auditada, pero NO queda como source lock final, NO production ready y NO backlog 100% cerrado.

Motivo principal: aunque carga limpio en validacion estatica y agrega contenido util en Academia, todavia quedan textos P0/P1 que prometen WhatsApp/correo/HR real y dos nuevos cursos de Academia fueron agregados con IDs duplicados, lo que provoca colision de navegacion/progreso.

Estado seguro confirmado por auditoria: sin deploy, sin produccion, sin import real, sin Firestore/Auth/Storage/Make/Gemini/WhatsApp/correo reales. El ZIP no incluye `tools/` ni `app/contracts/`.

## Validaciones realizadas

- Estructura del ZIP: 97 archivos.
- Comparacion contra V86/V87 equivalente documentada: misma lista de archivos, sin agregados ni eliminados.
- Archivos modificados: 4.
- `node --check` sobre 61 archivos JS: OK=61, FAIL=0.
- `app/index.html`: 61 scripts. Sin faltantes locales; solo 2 dependencias externas CDN esperadas: SheetJS y Mammoth.
- No se ejecuto navegador real ni deploy; la validacion de consola reportada por Claude no se toma como prueba suficiente de source lock.

## Delta real V88 vs V86

Archivos modificados:

1. `app/core/automations.js`
   - Cambia evento `cuestionario` de "Cuestionario enviado" a "Cuestionario realizado".
   - Conserva texto de HR writeback como `HR actualizada` y `sincronizado a la HR`, que sigue siendo problemático mientras el gate backend este apagado.

2. `app/core/liquidacion.js`
   - Ajusta comentario de estado: `cuestionario realizado/completado -> pendiente_submitir`.
   - Conserva comentario `enviado!=submitido`; no es visible, pero conviene limpiarlo por coherencia documental.

3. `app/modules/academia.js`
   - Agrega curso "Capacidades de backend: que esta preparado".
   - Agrega curso "Equipo operativo: asignacion, conflictos y fuera de rango".
   - Hallazgo critico funcional: ambos cursos usan IDs ya existentes.

4. `app/modules/postulaciones.js`
   - Corrige algunos textos de rechazo/ajuste para decir notificacion preparada o pendiente confirmacion.
   - No corrige todos los caminos de aprobacion, reprogramacion y HR sync.

## Resultado por pendiente Claude

### #299 - P0 baseline correctiva de textos honestos

No queda completo.

Resuelto parcialmente:

- `app/core/automations.js`: `Cuestionario enviado` -> `Cuestionario realizado`.
- `app/modules/postulaciones.js`: algunos rechazos y ajuste de agenda ya dicen `notificacion preparada`/`pendiente confirmacion`.

Pendientes vivos detectados:

- `app/modules/postulaciones.js`: acciones de aprobacion aun muestran `Aprobada · WhatsApp enviado al shopper` y `Aprobada · WhatsApp enviado`.
- `app/modules/postulaciones.js`: reprogramacion/fecha aun muestra `shopper notificado` y `HR sincronizada`.
- `app/modules/postulaciones.js`: editar asignacion aun muestra `Asignacion actualizada · HR sincronizada`.
- `app/modules/dashboard.js`: sigue mostrando `Correo enviado` y `WhatsApp enviado (Make)`.
- `app/core/automations.js`: `a_hr_writeback` conserva `HR actualizada` y `sincronizado a la HR`.
- `app/modules/automatizaciones.js`: conserva textos de disparos/eventos enviados a Make.
- Otros residuos heredados siguen en `cuestionario-shopper.js`, `core/manuales-data.js`, `reservas.js`, `finanzas.js`, `correo.js`, `academia.js` y textos demo/documentales visibles.

### #300 - P1 curso Academia sobre bloques backend preparados

Parcial.

Si existe el nuevo curso "Capacidades de backend: que esta preparado" y el contenido cubre communication history, ranking/scoring, versionado de reglas, release readiness y synthetic pack como preparado/pendiente backend.

Problema: fue creado con `id:'a_backend'`, que ya existia para el curso tecnico "Backend tecnico: Firebase, Gemini, Make y Storage". Esto genera colision de curso/progreso y puede volver inaccesible o ambiguo el curso tecnico existente.

### #301 - P2 ruta operativa de ops

No queda usable.

El contenido fue agregado, pero se creo tambien con `id:'a_ops'`, que ya existia para el curso "Dashboard y gestion operativa". Como el renderer abre el primer curso que coincida con `data-course`, la nueva ruta "Equipo operativo: asignacion, conflictos y fuera de rango" no queda accesible de forma confiable desde la lista. Ademas comparte progreso con el curso viejo.

## Hallazgos criticos para Claude

1. Cambiar los IDs nuevos de Academia a IDs unicos, por ejemplo:
   - `a_backend_prepared` para "Capacidades de backend: que esta preparado".
   - `a_ops_conflicts_route` para "Equipo operativo: asignacion, conflictos y fuera de rango".
2. Verificar que no existan IDs duplicados de curso ni leccion en cada audiencia.
3. Corregir todos los textos P0 restantes de `postulaciones.js`, `dashboard.js`, `automations.js`, `automatizaciones.js`, `correo.js`, `reservas.js`, `cuestionario-shopper.js`, `manuales-data.js`, `finanzas.js` y `academia.js` cuando prometan envio/sincronizacion real sin gate activo.
4. Academia debe mantener lenguaje honesto: si Make, HR, correo, WhatsApp, Gemini, Storage o pago real dependen de backend, mostrar `preparado`, `pendiente backend`, `borrador`, `fallback manual`, `preview` o `requiere confirmacion`, no `enviado`, `sincronizado`, `activo` o `en vivo`.

## Decision de empalme

- No empalmar como source lock final.
- No declarar backlog 100% cerrado.
- Puede usarse como candidata correctiva auditada para que Claude produzca una V89 ultra-corta, sin redisenar, corrigiendo solo los puntos anteriores.
- Backend seguro puede continuar en contratos/docs/validators sin activar runtime, pero no debe asumir que P0 frontend quedo cerrado.

## Impacto Phase A

Avanza parcialmente transparencia de backend en Academia, pero no cierra Phase A visual porque siguen textos que confunden `preparado/pendiente backend` con acciones reales ejecutadas.

## Impacto Academia/manuales/cursos

Academia mejora en profundidad, pero la duplicidad de IDs debe corregirse antes de aceptar. Tambien deben corregirse contradicciones heredadas en cursos que aun prometen notificacion automatica, Make activo, HR/Google Sheets doble via y portal en vivo cuando esos gates no estan activos.

## Estado seguro

Solo auditoria documental. No se modifico frontend desde backend, no se activo runtime, no se escribio Firestore/HR/Storage, no se ejecuto Make/Gemini/correo/WhatsApp real, no hubo deploy, no hubo merge y no se importaron datos reales.
