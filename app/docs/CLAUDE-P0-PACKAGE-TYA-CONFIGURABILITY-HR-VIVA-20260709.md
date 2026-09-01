# Claude P0 package - TyA configurability + HR viva

Fecha: 2026-07-09
Prioridad: P0
Estado backend: HR viva multihoja source-safe desplegada en DEV; integración visual/configurable NO GO.

## Contexto obligatorio

No rediseñar CXOrbia desde cero. Mantener V91/baseline viva y reglas Phase A.

Tenant y proyecto correctos:

- Tenant: TyA.
- Proyecto inicial: Cinépolis.
- Periodos: derivados de la HR viva multihoja.
- HR viva: un solo Google Sheet multihoja, no archivo por mes.

## Archivos backend nuevos para consumir como contrato

- `backend/contracts/phase-a-tenant-project-config-from-platform-v1.json`
- `backend/config/tya-phase-a-platform-project-config.source-safe.json`
- `app/docs/P0-VISUAL-CONFIGURABILITY-NO-GO-TYA-20260709.md`

## P0 a corregir en prototipo

### 1. Proyecto y periodo mezclados

Actual: el selector de proyecto muestra opciones como `Cinépolis Junio 2025`, `Cinépolis Julio 2026`.

Esperado:

- Selector de proyecto: `Cinépolis` únicamente para este proyecto.
- Selector de periodo: `JUN 2025`, `JUL 2025`, ... `JUL 2026` derivados de tabs HR.
- Opción `Todos los proyectos` debe agrupar proyectos, no periodos.

### 2. Periodo desincronizado

Actual: hay periodo en sidebar y periodo en dashboard, pero no siempre cambian el mismo estado.

Esperado:

- Un solo estado global de periodo por proyecto seleccionado.
- Sidebar y dashboard reflejan el mismo periodo.
- Cambiar periodo recalcula KPIs, listas y detalle.

### 3. KPIs acumulados indebidamente

Actual: KPIs del dashboard muestran acumulado de HR cuando se selecciona un periodo.

Esperado:

- Si periodo = `JUL 2026`, KPIs solo de JUL 2026.
- Si existe modo acumulado, debe llamarse explícitamente `Histórico acumulado` o `Todos los periodos`.
- No mezclar acumulado con periodo seleccionado.

### 4. HR source como dato de proyecto

La fuente HR debe verse en configuración/proyecto como campo administrativo:

- tipo: Google Sheets live multitab;
- URL o referencia protegida/masked;
- patrón de tabs;
- países leídos;
- último sync/última lectura;
- estado de gate;
- botón de prueba/validación con resultado source-safe.

No mostrar URL privada completa en repo público ni en logs.

### 5. Identidad visual del tenant

Actual: logo configurado no se propaga al topbar/login y login tiene doble título.

Esperado:

- Logo del tenant en login/topbar/sidebar/portal cliente.
- Un solo título en login.
- Nombre TyA como tenant, no duplicado.
- Si se cambia logo desde configuración, se propaga con estado/versionado.

### 6. Banderas por países configurados

Actual: GT/HN aparecen correctos, pero debe verificarse que no estén hardcodeados.

Esperado:

- Banderas derivadas de `tenant.countries` o `project.countries`.
- Si el tenant/proyecto cambia países, cambia el login y filtros.
- Países incluyen moneda y reglas operativas.

### 7. Shoppers completos

Actual: preview público muestra `Shopper protegido`.

Esperado:

- Preview público: referencias protegidas, correcto.
- Vista admin protegida con Auth/roles: datos reales completos según permisos.
- No exponer teléfono/correo/DPI/banco en JS público.
- No simular shoppers reales si no hay Auth/roles.

## Reglas que NO deben romperse

- No tocar producción.
- No convertir Cinépolis en lógica global.
- No crear un proyecto por periodo.
- No hardcodear países/banderas.
- No meter datos sensibles en repo.
- No mostrar pagos/sync/Make/Gemini como activos si gate está apagado.
- No sobrescribir silenciosamente HR.

## Resultado esperado de Claude

Entregar una candidata donde:

1. Login muestra TyA con logo/config correcta y sin doble título.
2. Proyecto = Cinépolis.
3. Periodo cambia KPIs y listas.
4. Dashboard no acumula salvo modo histórico explícito.
5. Configuración de proyecto muestra fuente HR protegida/masked.
6. Países/banderas salen de configuración.
7. La plataforma queda lista para crear otro proyecto TyA y otro tenant sin rehacer lógica.
8. Academia explica configuración de tenant/proyecto/periodo/HR.

## Validación esperada

Smoke mínimo:

- Cambiar periodo y verificar KPIs.
- Cambiar proyecto no debe cambiar periodo salvo reset controlado.
- Ver configuración de proyecto y fuente HR.
- Ver login con logo y países desde configuración.
- Ver Shoppers sin PII en público y con nota de Auth pendiente.

## Estado seguro

Este paquete no autoriza producción, merge final, Firestore writes, HR writeback, pagos, Make ni Gemini live.
