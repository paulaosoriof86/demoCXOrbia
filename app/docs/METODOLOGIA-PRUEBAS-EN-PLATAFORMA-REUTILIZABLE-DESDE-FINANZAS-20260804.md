# Metodología reusable de pruebas dentro de la plataforma

**Fecha:** 2026-08-04  
**Origen metodológico:** proyecto separado de migración de Finanzas Personales  
**Aplicación:** CXOrbia / TyA  
**Estado:** `DISEÑO_REUTILIZABLE_APROBADO__IMPLEMENTACION_RUNTIME_PENDIENTE_DE_AUTORIZACION`

## 1. Qué se reutiliza

Se reutiliza únicamente el patrón de validación operativa dentro de la aplicación:

1. abrir la build exacta que se desea validar;
2. ejecutar escenarios realistas desde la interfaz y los contratos normales del producto;
3. observar los cambios entre módulos;
4. registrar cada etapa como PASS, FAIL o BLOCKED;
5. mostrar la etapa exacta, snapshot y diagnóstico cuando algo falla;
6. capturar evidencia visual acumulativa;
7. retirar todos los datos de auditoría;
8. comprobar que el fingerprint final coincide con el inicial.

No se copia la lógica financiera, sus categorías, cuentas, movimientos, reglas de duplicados, rutas ni estructura de datos.

## 2. Qué problema corrige en CXOrbia

Los gates anteriores comprobaban principalmente archivos, marcadores, DOM o estados aislados. Eso permitió detectar defectos importantes, pero no demostró de manera integral que una operación real pudiera recorrer la plataforma.

El nuevo patrón debe demostrar en DEV que una persona puede:

- ingresar por el único login visible;
- abrir Hoja de Ruta, Dashboard, Visitas, Postulaciones, Shoppers y Finanzas;
- crear o simular una operación controlada mediante la interfaz;
- ver su efecto en las superficies relacionadas;
- recargar tres veces y abrir una nueva pestaña sin perder contexto;
- recibir un diagnóstico exacto cuando una etapa no se completa;
- terminar con limpieza exacta de los probes temporales.

## 3. Laboratorio visible de escenarios

La futura build DEV debe incluir un modo de auditoría no disponible en producción, activado solo por el runner controlado.

Nombre de trabajo:

`CXORBIA DEV · LABORATORIO DE ESCENARIOS`

La superficie visible debe mostrar:

- escenario activo;
- etapa actual;
- pasos completados;
- PASS, FAIL o BLOCKED por paso;
- identificadores `AUDIT-*` sanitizados;
- conteos antes y después;
- fingerprint inicial y final;
- módulo y acción donde falló;
- botón o disparador visible `Ejecutar pruebas` solo en DEV autorizado;
- timeline de ejecución;
- capturas asociadas;
- resultado de limpieza.

Esta superficie es observabilidad del test. No reemplaza los módulos normales ni crea un flujo operativo alternativo.

## 4. Datos de prueba

Los escenarios deben usar datos realistas, sintéticos y temporales:

- tenant o contexto autorizado existente;
- proyecto de auditoría o entidades marcadas `AUDIT-*`;
- shopper sintético;
- visita sintética;
- postulación sintética;
- asignación o reserva sintética;
- estados operativos y financieros de auditoría;
- evidencia sin PII ni secretos.

Reglas:

- no usar base legacy;
- no copiar datos personales reales;
- no insertar código directamente como sustituto de la operación normal;
- ejecutar mediante UI, callbacks, adapters o contratos reales de la plataforma;
- toda escritura temporal debe estar expresamente autorizada, acotada e identificada;
- limpieza exacta obligatoria;
- un fallo de limpieza es P0 del laboratorio.

## 5. Perfiles de escenarios

### 5.1 CORE_OPERATIONS_ADMIN

Recorrido mínimo:

1. login Admin/Operaciones;
2. Hoja de Ruta viva;
3. Dashboard Operativo;
4. Visitas;
5. Postulaciones;
6. ficha de postulación;
7. Shoppers;
8. Reservas y asignación;
9. Finanzas Phase A;
10. exportación visible cuando aplique.

Debe verificar:

- misma autoridad HR en todos los módulos;
- mismo periodo activo;
- ausencia de duplicados;
- navegación, render y datos por separado;
- cambios relacionados visibles en módulos dependientes.

### 5.2 SHOPPER_FULL_CYCLE

Recorrido mínimo:

1. login Shopper;
2. Mi Perfil;
3. certificaciones presentadas;
4. visitas disponibles;
5. postulación;
6. Mis Visitas;
7. reserva o agenda cuando el contrato lo permita;
8. historial;
9. beneficios/reportes y estado de pago visible.

Debe verificar identidad exacta, no por nombre, y mantener datos sensibles enmascarados.

### 5.3 CROSS_MODULE_CONSISTENCY

Ejemplos de relaciones que deben comprobarse:

- una visita publicada aparece en Disponibles;
- una postulación creada aparece en Postulaciones y en la ficha correspondiente;
- una asignación retira la visita de Disponibles y la muestra en Mis Visitas;
- un cambio de estado se refleja en Dashboard y Hoja de Ruta;
- una liquidación o estado de pago se refleja sin inventar ingresos;
- HR y plataforma no duplican la misma asignación.

### 5.4 RELOAD_NEW_TAB_STABILITY

Para Admin/Operaciones y Shopper:

- tres recargas;
- una pestaña nueva;
- mismo tenant, proyecto, periodo y rol;
- mismos conteos y entidad de auditoría;
- ninguna credencial, token o PII expuesta.

### 5.5 EXPORTS_AND_VISIBLE_EVIDENCE

- PDF del reporte seleccionado;
- Excel con las mismas filas y filtros;
- capturas de módulos críticos;
- resultado del laboratorio;
- fingerprint antes/después;
- manifest con hashes de evidencia.

## 6. Máquina de estados única

Todo escenario usa la misma secuencia técnica:

```text
AUTH_READY
→ CLAIMS_READY
→ MEMBERSHIP_READY
→ DATA_READY
→ SHELL_READY
→ ROUTE_READY
→ VIEW_READY
→ DOMAIN_READY
→ SCENARIO_READY
→ SCENARIO_EXECUTED
→ CROSS_MODULE_VERIFIED
→ CLEANUP_VERIFIED
```

Cada estado debe tener condición única, timeout propio, snapshot y código de error específico.

No se permite una sola condición compuesta que oculte cuál requisito faltó.

## 7. Diagnóstico

Cada fallo debe clasificarse como:

- `PRODUCT_ACCESS_OR_CONFIGURATION`;
- `PRODUCT_DATA_AUTHORITY`;
- `PRODUCT_RUNTIME_LIFECYCLE`;
- `PRODUCT_DOMAIN`;
- `TEST_HARNESS_OR_GOVERNANCE`;
- `INFRASTRUCTURE`;
- `CLEANUP_OR_ROLLBACK`;
- `UNCLASSIFIED_REQUIRES_REVIEW`.

La evidencia debe mostrar:

- escenario;
- etapa;
- ruta;
- módulo;
- acción;
- estado esperado;
- estado observado;
- snapshot sanitizado;
- timeline;
- si hubo o no escritura;
- estado del cleanup.

## 8. Fingerprints y limpieza

Antes de ejecutar:

- conteos de entidades relevantes;
- IDs `AUDIT-*` presentes;
- hashes o fingerprints de colecciones autorizadas;
- contexto de tenant/proyecto/periodo.

Después:

- eliminación exacta de las entidades `AUDIT-*`;
- mismos conteos de baseline;
- mismos fingerprints;
- cero huérfanos;
- cero cambios fuera del scope;
- `baselineRestoredAfterCleanup=true`.

## 9. Estrategia de salida a producción

El primer corte operativo se limita a:

`ADMIN/OPERACIONES + SHOPPER`

El Portal Cliente queda como corte paralelo y no bloquea la salida inicial, siempre que el contrato `tya-phase-a-core-operations-shopper-release-slice-v1` obtenga:

1. source/static PASS;
2. runtime unificado read-only PASS;
3. escenarios dentro de la plataforma PASS;
4. cleanup exacto PASS;
5. checkpoint visual humano aprobado;
6. gate de producción y autorización expresa.

No se afirmará que Phase A Cliente está terminada hasta su validación independiente.

## 10. Seguridad

Este documento no autoriza:

- escrituras temporales;
- ejecución del laboratorio;
- deploy;
- producción;
- pagos;
- Make;
- Gemini;
- cambios Auth;
- nuevas cuentas;
- conexión con la base vieja.

La implementación y ejecución requieren un macrobloque posterior con límites, snapshots y cleanup explícitos.

## 11. Clasificación

- **Reusable CXOrbia:** laboratorio, estados, escenarios, diagnóstico, fingerprints y cleanup.
- **Exclusivo TyA:** rutas y ejemplos de Hoja de Ruta, Visitas, Postulaciones, Shoppers y Phase A financiera.
- **Cloud/prototipo:** únicamente presentación visual del laboratorio si posteriormente se solicita; Cloud no implementa backend ni ejecución.
- **Academia:** patrón de validación visible y reproducible.
- **Sin impacto producción:** diseño/documentación בלבד; no se ejecutaron escenarios ni se modificó `app/`.
