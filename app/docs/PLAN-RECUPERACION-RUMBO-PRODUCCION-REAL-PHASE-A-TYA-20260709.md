# Plan de recuperacion de rumbo - Produccion real Phase A TyA

Fecha: 2026-07-09  
Estado: plan obligatorio de recuperacion despues de desvio detectado.

## 1. Diagnostico

Se avanzo mucho en infraestructura segura, contratos y adapters preview, pero el objetivo urgente es produccion real Phase A. El riesgo es seguir construyendo capas backend sin demostrar que la plataforma visual y operativa esta leyendo TyA/Cinepolis real o sanitizado.

El runtime actual contiene data demo/generica en `app/core/data.js` y HR simulada en `app/core/hr.js`. Esto bloquea produccion hasta que se demuestre fuente real o export sanitizado.

## 2. Principio rector

Desde este punto, cada bloque debe responder a una pregunta de produccion:

> Que falta para que Paula pueda ver y operar TyA/Cinepolis real en plataforma, con HR, shoppers, certificaciones, visitas, postulaciones y pagos/liquidaciones Phase A?

Si un bloque no responde eso, no es prioritario.

## 3. Recuperacion inmediata

### Paso 1 - Inventario de continuidad ya trabajada

Buscar y leer en `app/docs/`, handoffs y documentos recientes:

- HR Source;
- HR/platform sync;
- migration readiness;
- historical import;
- shopper reference/review;
- certification preservation;
- Phase A expanded must-haves;
- today production cutover reality;
- source locks de candidatas;
- docs de V6/V7.1/V78/V91;
- cualquier referencia a Cinépolis/Cinepolis/TyA/JUN26/GT/HN.

Resultado esperado: lista de documentos fuente, que contienen y que falta.

### Paso 2 - Probar datos reales disponibles

Ejecutar o mantener el gate conceptual:

- `tools/contracts/tya-real-data-source-proof-gate.mjs`.

Resultado esperado:

- si la app sigue demo: `NO_GO_REAL_DATA_NOT_PROVEN`;
- si existe fuente real/sanitizada: documentar path, periodo, conteos y mapping.

### Paso 3 - Recuperar fuente real/sanitizada sin pedir de nuevo a Paula

Antes de pedir archivo a Paula, revisar:

- uploads/fuentes disponibles;
- repo;
- documentos previos;
- handoffs;
- archivos locales disponibles si el entorno los expone.

Solo si no aparece, pedir el minimo insumo puntual.

### Paso 4 - Confirmar proyecto Cinepolis como proyecto normal

Validar/documentar:

- tenantId TyA;
- projectId Cinepolis estable;
- paises GT/HN;
- moneda GTQ/HNL segun proyecto;
- periodos/quincenas;
- origen/link HR configurable;
- origen cuestionario configurable;
- reglas agendamiento/reprogramacion/cancelacion;
- pagos/liquidaciones;
- certificacion vinculada a proyecto;
- documentos/instructivos del proyecto.

### Paso 5 - Dry-run real HR import

Crear dry-run que produzca conteos seguros:

- filas HR leidas;
- visitas por pais/quincena/estado;
- asignaciones;
- shoppers historicos mapeados;
- certificaciones existentes conservadas;
- liquidaciones junio/pagos pendientes;
- conflictos;
- campos bloqueados por sensibilidad.

No debe escribir Firestore ni subir datos crudos.

### Paso 6 - Conectar visualizacion controlada

Solo despues del dry-run real/sanitizado:

- conectar `CX.data` en un unico punto controlado o crear preview real-data no destructivo;
- validar modulos principales;
- pedir visualizacion a Paula solo si hay URL real verificada o paquete local claro.

### Paso 7 - Produccion controlada

Produccion requiere:

- GO de Paula;
- URL DEV/preview verificada;
- smoke humano;
- rollback;
- sin demo data como fuente final;
- sin NO GO critico;
- reglas/secrets/config protegidos.

## 4. Informacion que falta si no aparece en repo/fuentes

No pedir hoja de ruta completa de cero. Solo pedir:

- export sanitizado actual de HR; o
- source lock real ya aprobado; o
- link/origen exacto si no esta documentado/accesible.

## 5. Cambios de metodologia obligatorios

- No mas infraestructura abstracta sin real-data proof.
- No mas URLs no verificadas.
- No mas pedir datos ya trabajados.
- No mas avances que no indiquen impacto directo en produccion Phase A.
- Cada respuesta debe cerrar con: que hice, impacto, bloqueo, que sigue, si necesito algo de Paula.

## 6. Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin import real.
- Sin base vieja conectada.
- Sin datos sensibles.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
