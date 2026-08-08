# Auditoría forense R17 — revisión humana TyA

Fecha: 2026-07-13

## Decisión corregida

`NO_GO_VISIBLE_TYA_R17_SEMANTIC_DATA_MAPPING`

Se retira la calificación previa `DEPLOYED + REMOTE PASS` como aprobación visual/semántica. El deploy Hosting DEV fue técnicamente exitoso, pero la build no representa correctamente la operación TyA ni la HR en varias superficies visibles.

La evidencia humana prevalece sobre el smoke anterior. El smoke R17 comprobó presencia de payload, conteos, rutas, branding básico y ausencia de errores JavaScript; no comprobó sincronización entre controles, semántica de estados, normalización de fechas, calendario, fidelidad histórica ni lectura runtime de la HR.

## Hallazgos corroborados en las nueve capturas

### P0-1 — Existen tres estados de periodo independientes

En Dashboard se observó simultáneamente:

- sidebar: `JUN 2026`;
- subtítulo: `Cinépolis Junio 2026`;
- selector interno de Dashboard: `JUL 2026`;
- banner/KPIs internos: `JUL 2026`.

El periodo que realmente filtra `CX.data.visitas()` es el selector del sidebar, porque modifica `CX.data.currentProjectId`. El selector `monthSel` de Dashboard solo cambia un texto/toast y no modifica el periodo ni la fuente de datos.

Impacto: el usuario puede creer que revisa julio cuando los KPIs pertenecen a junio.

### P0-2 — Mi Día no usa el periodo canónico

Con el sidebar en `JUL 2026`, Mi Día muestra título/KPIs de julio, pero el calendario permanece en junio. Al avanzar manualmente a julio, el calendario queda vacío aunque existen 44 filas del periodo.

Causa:

- el calendario mantiene `_cgMonth='2026-06'` como estado propio;
- contiene fecha de referencia `2026-06-21` hardcodeada;
- no deriva el mes desde `CX.data.currentPeriodId`;
- las fechas serializadas como números no se convierten a ISO y no pueden agruparse por día.

### P0-3 — La aplicación no está leyendo HR en tiempo real

La HR se lee durante el workflow de build/deploy y se convierte en un archivo JavaScript estático. El navegador carga ese snapshot; no consulta Google Sheets, Firestore ni un endpoint de sincronización al abrir o cambiar periodo.

Por lo tanto, las expresiones `HR viva`, `live` o equivalentes no deben interpretarse como sincronización runtime. El estado honesto actual es `snapshot HR source-safe generado en deploy`.

### P0-4 — Mapeo de estados no representa la lógica TyA

El builder actual convierte automáticamente:

- cualquier fecha de submitido en `liquidada`;
- cualquier fecha de cuestionario en `cuestionario`;
- cualquier fecha realizada en `realizada`;
- shopper presente en `asignada`, salvo reglas parciales.

Esto mezcla etapas diferentes:

- submitido no confirma liquidación ni pago;
- cuestionario completado y submitido son hitos distintos;
- liquidación requiere fuente financiera/overlay y estado propio;
- `P x Agendar`, `P x Asignar`, `P x visita previa`, fuera de rango, Q1/Q2 y fechas derivadas necesitan el mapeo TyA ya documentado.

Consecuencia visible: todos los periodos tienen 44 filas, pero sus estados/KPIs no son confiables ni equivalen a la HR operacional.

### P0-5 — Fechas Excel crudas visibles

En Visitas aparecen valores como `45851.0`, `46215.0`, `46208.0` y `783` en la columna Agenda.

Causa: el parser XLSX devuelve el valor numérico de la celda sin interpretar estilos/fechas y el adapter lo copia directamente a la UI.

Regla requerida:

- serial Excel válido → fecha ISO normalizada;
- valor ambiguo/inválido → `reviewQueue`, nunca mostrar el número como fecha;
- conservar sourceRef y valor original solo en evidencia protegida, no en UI pública.

### P0-6 — Login duplica el nombre del tenant cuando no hay logo

Sin logo de cliente, el bloque de marca muestra `TyA` y el título principal vuelve a mostrar `TyA`. Al cargar el logo TyA, el título principal pasa a `Plataforma operativa de campo` y desaparece la duplicación.

Esto ya había sido reportado y no quedó cerrado en la build visible. La regla reusable debe ser:

- con logo: logo + un solo título funcional;
- sin logo: nombre del tenant una sola vez + título funcional, sin repetición;
- CXOrbia permanece únicamente como desarrollador/plataforma en el lugar acordado.

### P0-7 — Banderas no están gobernadas por selección activa de país

La build R17 fija `countries:['GT','HN']` en el adapter y el login presenta ambos países. Eso puede coincidir con TyA, pero no demuestra la regla reusable solicitada: las banderas deben derivarse de la configuración del tenant y del país/alcance elegido, no de un arreglo hardcodeado en una build TyA.

Debe distinguirse:

- países habilitados para el tenant/proyecto;
- país activo o alcance del usuario;
- selector de país cuando corresponda;
- branding/logos/configuración por tenant, no por parche de build.

### P0-8 — Shoppers es una proyección uniforme, no la operación completa

Se muestran 210 referencias, pero todas aparecen con:

- nombre `Shopper protegido`;
- rating `4.3`;
- estado activo;
- perfil completo;
- honorario estándar.

El rating `4.3` está fijado por el adapter. Los demás atributos visibles no prueban que se hayan leído desde HR/Auth/perfil/certificaciones.

Esto es válido como referencia protegida para conteo, pero no como base operacional completa. Debe mostrarse honestamente como `referencia protegida / datos operativos pendientes`, sin inventar score, completitud, preferencia ni estado.

### P1-1 — KPIs de Visitas se superponen y pueden inducir a error

En julio aparecen simultáneamente `44 asignadas`, `2 realizadas`, `2 disponibles` y `10 fuera de rango`. `Asignadas` cuenta cualquier fila con shopper, por lo que incluye realizadas/fuera de rango y no es una fase exclusiva.

Debe decidirse y documentarse si las tarjetas son:

- fases exclusivas del estado actual, o
- atributos acumulativos.

La etiqueta y el drill deben coincidir con esa definición.

### P1-2 — Identidad `Admin Demo`

Sigue apareciendo `Admin Demo`. Es coherente únicamente como identidad temporal de preview. No puede sobrevivir al bloque Auth real ni usarse como evidencia de usuario/rol TyA.

## Causa raíz transversal

Se construyó un adapter para hacer visible el snapshot sin modificar el source lock V110. Ese adapter resolvió branding, 14 IDs de periodo y conteos, pero no resolvió la semántica completa de la operación.

Además, los smoke tests anteriores tenían una cobertura insuficiente:

- verificaban que una ruta renderizara;
- buscaban texto TyA/Cinépolis;
- verificaban 14/616/210;
- no cambiaban realmente de periodo y contrastaban todos los módulos;
- no inspeccionaban fechas, estados o calendario;
- no detectaban el título duplicado;
- no distinguían snapshot de sincronización runtime;
- no contrastaban submitido, liquidación y pago.

El artifact de smoke incluso capturó en su texto tanto `TyA ... TyA` en login como `Cinépolis Julio 2026` junto a `Junio de 2026` en Mi Día, pero no tenía aserciones para declararlo blocker.

## Corrección de metodología

No se volverá a considerar PASS por conteos o rutas. El gate semántico obligatorio debe probar:

1. un único `currentPeriodId` compartido;
2. cambio de periodo real desde cada control visible;
3. Dashboard, Visitas, Mi Día, Histórico y Finanzas alineados;
4. fechas ISO válidas y ausencia de seriales Excel;
5. distribución de estados contra una referencia HR source-safe por periodo;
6. separación `operationalState`, `questionnaireState`, `submissionState`, `liquidationState` y `paymentState`;
7. calendario poblado para el periodo seleccionado;
8. login sin título duplicado;
9. países derivados de tenant/proyecto/alcance;
10. shoppers sin atributos ficticios;
11. declaración explícita de snapshot versus sincronización runtime;
12. junio 2026 ejecutado, con pendiente financiero, no visitas pendientes.

## Carril backend reusable

- normalizador de fechas Sheets/XLSX con timezone y reviewQueue;
- mapper canónico de ciclo de visita separado de finanzas;
- snapshot metadata: `sourceSnapshotAt`, `sourceReadMode`, `runtimeSyncActive`;
- contrato único de periodo activo;
- gate semántico fail-closed;
- no afirmar liquidación/pago por submitido;
- no inventar rating/completitud/preferencia de shopper.

## Carril exclusivo TyA

- reglas Q1/Q2 y visita previa;
- columnas y estados HR TyA;
- GT/HN, monedas y 44 visitas mensuales;
- junio 2026 como ejecución cerrada y pagos pendientes;
- shoppers históricos/certificaciones conservados;
- Cinépolis como proyecto configurable, no lógica global.

## Carril Claude/prototipo

P0 acumulado — no crear otro prototipo desde cero:

- consolidar un único selector/estado de periodo en sidebar y módulos;
- enlazar o retirar el selector cosmético de Dashboard;
- hacer que Mi Día derive mes/eventos del periodo canónico;
- corregir login sin título duplicado con y sin logo;
- gobernar banderas por configuración/alcance;
- representar referencia shopper protegida sin atributos inventados;
- definir tarjetas exclusivas o acumulativas;
- mantener módulos/core limpios, sin llamadas de proveedor.

## Academia

Debe explicar:

- proyecto versus periodo;
- snapshot versus sincronización runtime;
- estado operativo versus cuestionario/submitido/liquidación/pago;
- fecha fuente, fecha normalizada y reviewQueue;
- validación visual semántica, no solo ruta renderizada;
- países habilitados versus alcance activo;
- referencia protegida versus perfil operativo completo.

## Estado seguro

- URL DEV queda disponible únicamente como evidencia NO-GO;
- sin cambios en `/app/modules` ni `/app/core`;
- sin Firestore/Auth/Storage/HR writes;
- sin imports, rules, Functions, Make, Gemini, pagos o producción;
- PR #7 permanece draft/open/no merge;
- no se autoriza otro deploy en este bloque.
