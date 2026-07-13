# CXOrbia TyA — protocolo obligatorio de validación visual

Fecha: 2026-07-13

## Estado actual

La build corregida visible TyA R17 está desplegada y verificada en Firebase Hosting DEV.

- ambiente: DEV;
- URL: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r17=visible`;
- build: `tya-visible-r17-source-safe`;
- commit desplegado: `cf4c845722e2bbe2b401b2b332ff9f4d2f6cb803`;
- run deploy: `29285177647`;
- smoke remoto independiente: `29285540738`;
- decisión: `PASS_VISIBLE_TYA_DATA_R17`;
- rutas críticas: 13/13;
- errores de consola/página: 0;
- blockers/warnings: 0.

## Causa raíz corregida

El smoke anterior verificaba payload, conteos internos y carga de rutas, pero no garantizaba que una persona viera la marca TyA, el proyecto Cinépolis, los periodos separados y la ausencia de proyectos demo.

Además:

- el bridge anterior se ejecutaba antes de `core/data-source.js`;
- el selector de origen podía restaurar modo demo;
- los 14 periodos compartían el ID `cinepolis`.

Sin modificar `/app/modules` ni `/app/core`, el build ahora genera un adapter DEV después de `core/data-source.js` y distingue proyecto raíz de periodo activo.

## Contrato visible validado

- tenant: TyA;
- proyecto raíz: Cinépolis;
- 14 IDs de periodo únicos, de `cinepolis-2025-06` a `cinepolis-2026-07`;
- 616 visitas históricas;
- 44 visitas en JUL 2026;
- 210 shoppers source-safe;
- 0 proyectos Retail/Banca/Restaurantes;
- `Source-safe (preview) / ready`;
- `imported:false`;
- `production:false`.

## Regla obligatoria

Nunca se informará una revisión visual solo con una URL.

Cada revisión debe indicar:

1. URL y ambiente.
2. Build o checkpoint.
3. Perfil de ingreso.
4. Ruta o módulo.
5. Texto, conteo o estado esperado.
6. Qué todavía no es real.
7. Formato de reporte.

## Revisión visual humana habilitada

### 1. Abrir la URL exacta

`https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r17=visible`

Ambiente: **Firebase Hosting DEV**. No es producción.

### 2. Pantalla de ingreso

Antes de entrar debe verse:

- `TyA`;
- `Tenant TyA · Phase A controlada`;
- países GT y HN;
- no debe aparecer el badge `Demo comercial`.

### 3. Perfil inicial

Seleccionar:

`Administración / Coordinación`

El nombre `Admin Demo` todavía es una identidad temporal de prueba porque Auth real permanece HOLD. No debe interpretarse como usuario real ni como dato TyA.

### 4. Barra superior y menú lateral

Debe verse:

- proyecto `Cinépolis`;
- periodo `JUL 2026`;
- estado equivalente a `Source-safe (preview) · Listo`.

No debe afirmar:

- Conectado;
- Importado;
- Producción;
- Firestore materializado.

### 5. Proyectos y periodos

En el selector lateral o en `Proyectos` / `Periodos`:

- único proyecto operativo visible: `Cinépolis`;
- no deben aparecer `Proyecto Retail`, `Proyecto Banca` ni `Proyecto Restaurantes`;
- deben existir 14 periodos desde `JUN 2025` hasta `JUL 2026`;
- el periodo más reciente debe ser `JUL 2026`;
- al cambiar de periodo debe cambiar el conjunto de visitas.

### 6. Visitas

Abrir `Visitas Disponibles` o `Visitas`.

Verificar:

- periodo JUL 2026: 44 visitas;
- Guatemala: 34;
- Honduras: 10;
- histórico total al consultar Histórico/Periodos: 616;
- campos visibles: país, sucursal, quincena, franja, estado y fechas source-safe;
- junio 2026 no debe tratarse como visitas pendientes por ejecutar.

### 7. Shoppers

Abrir `Shoppers`.

Verificar:

- 210 registros source-safe;
- datos personales protegidos;
- no deben aparecer 3 shoppers inventados para completar 213;
- el gap 210/213 continúa en revisión backend.

### 8. Mi Día

Verificar que el encabezado indique `Cinépolis Julio 2026` y que los KPIs correspondan al periodo activo.

Hallazgo conocido no bloqueante:

- el calendario/cronograma puede abrir visualmente en junio de 2026 aunque el selector esté en JUL 2026;
- ya quedó documentado como P1 para Claude/prototipo;
- reportarlo como `DIFERENCIA` si se observa, no como pérdida de datos.

### 9. Rutas adicionales

El smoke automático ya validó:

- Admin: Dashboard, Proyectos, Visitas, Postulaciones, Certificación, Finanzas y Academia;
- Cliente: Dashboard y Sucursales;
- Shopper: Visitas, Certificación, Beneficios y Academia.

La revisión humana puede concentrarse en contenido y coherencia, no en abrir las 13 rutas una por una salvo que se detecte una diferencia.

## Qué todavía no aprobar como real

- Firestore materializado con las 616 visitas;
- Auth y claims reales;
- sincronización HR ↔ plataforma;
- Make;
- Gemini;
- Storage/evidencias;
- pagos ejecutados;
- 572 controles como pagos;
- 196 overlays como pagos confirmados;
- 213 certificaciones carryover como materializadas;
- producción.

## Formato de respuesta de Paula

Reportar por módulo:

- `APROBADO`;
- `DIFERENCIA: esperado / observado`;
- `ERROR: acción realizada / resultado`.

Captura solo cuando exista una diferencia o error. No se requiere evidencia manual adicional cuando el módulo esté aprobado.

## Checkpoints posteriores

1. Revisión humana de build visible TyA R17.
2. Comparación read-only / materialización Firestore DEV bajo gate.
3. Auth/roles y fuentes pendientes.
4. HR ↔ plataforma, certificaciones y liquidaciones.
5. Ensayo final antes de producción.

## Clasificación

- **Reusable CXOrbia:** protocolo de validación humana y gate sobre contenido visible.
- **Exclusivo cliente:** TyA/Cinépolis, 14 periodos, 616 visitas y 210/213 shoppers.
- **Claude/prototipo:** P1 calendario Mi Día vs periodo; identidad temporal hasta Auth.
- **Academia:** validar ambiente, fuente, proyecto, periodo, rutas y estados honestos.
- **Sin impacto Claude:** CI, adapter generado, hashes, Hosting y proof remoto.
