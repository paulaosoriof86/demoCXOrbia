# CXOrbia TyA — protocolo obligatorio de validación visual continua

Fecha original: 2026-07-13  
Última revisión: 2026-07-17, post-empalme V159  
Estado: ACTIVO Y OBLIGATORIO

## 1. Corrección metodológica

La validación visual no puede quedar únicamente para el final de una cadena extensa de backend, arquitectura o infraestructura.

Desde V159, cada bloque operativo se trabaja como un **corte vertical verificable**:

```text
FUENTE / REGLA
→ MAPPING / ADAPTER
→ GATE DE DATOS
→ RUNTIME EXACTO
→ VISUALIZACIÓN HUMANA
→ FREEZE DEL CORTE
```

Un contrato, script, dry-run, PASS de sintaxis o ausencia de errores de consola no cierra un bloque si la plataforma no muestra y opera correctamente el resultado esperado.

## 2. Definición de terminado por corte

Un corte solo queda `FROZEN` cuando existen las cinco evidencias:

1. **Fuente:** origen exacto, periodo, claves y conteos esperados.
2. **Datos:** gate reproducible sobre el mismo build/snapshot.
3. **Runtime:** módulo cargado sin fallback demo ni cambio silencioso de fuente.
4. **Visual:** contenido, navegación y reacción a cambios comprobados en pantalla.
5. **Aceptación:** Paula reporta `APROBADO`, o se registra una diferencia P1/P2 no bloqueante.

Sin evidencia visual, el estado máximo es `TECHNICAL_PASS_PENDING_VISUAL`; nunca `cerrado`, `baseline activa` ni `operativo`.

## 3. Regla para separar responsabilidades

Cuando exista una diferencia:

- gate de datos PASS + visual FAIL: revisar adapter, estado runtime, render o frontend; solo enviar a Claude si el archivo responsable es frontend;
- gate de datos FAIL + visual FAIL: corregir fuente, mapping o backend antes de tocar UI;
- datos y contenido visibles PASS + interacción FAIL: corregir flujo, selector, router o estado de módulo;
- build o fuente no coinciden: invalidar la revisión y publicar el build exacto antes de diagnosticar.

No se vuelve a enviar un paquete general a Claude sin identificar primero en qué capa está el fallo.

## 4. Checkpoints visuales vigentes

### V0 — Post-empalme de cada candidata

Momento: inmediatamente después de `APPLY_DELTA_DIRECTLY` y gates estructurales.

Objetivo: comprobar que los cambios de Claude realmente quedaron en la rama viva y que no rompieron el contrato visible.

Para V159 debe incluir:

- login/tenant TyA sin duplicados ni demo engañosa;
- proyecto y periodo separados;
- cambio de periodo con cambio real de datos;
- Dashboard, Proyectos, Periodos, Histórico y Visitas;
- rutas Admin, Shopper, Cliente y Academia;
- copy honesto de integraciones.

No se inicia el bloque Firebase/backend limpio hasta cerrar V0.

### V1 — Contexto, HR e histórico

Módulos del mismo corte:

- Dashboard Operativo;
- Proyectos;
- Periodos;
- Histórico;
- Visitas;
- HR Source/estado de fuente.

Debe demostrar:

- Cinépolis como proyecto configurable;
- 14 periodos únicos;
- 616 visitas históricas;
- 44 visitas en el periodo activo;
- 34 GT y 10 HN cuando corresponda al periodo vigente;
- MAY/JUN/JUL distintos;
- junio no tratado como visitas pendientes;
- el selector modifica realmente consultas, KPIs y filas, no solo la etiqueta.

### V2 — Ciclo shopper y operación de campo

Módulos del mismo corte:

- Visitas Disponibles;
- Postulaciones;
- Reservas/agenda;
- Mis Visitas/Mi Día;
- Shoppers;
- Certificación;
- detalle e historial de visita.

Debe demostrar:

- solo visitas elegibles en disponibles;
- asignaciones HR/plataforma sin duplicar;
- shopper correcto por llave estable;
- postulaciones del periodo activo;
- certificación presentada preservada cuando exista fuente;
- pendientes y conflictos en reviewQueue;
- ninguna identidad completada por nombre o similitud visual.

El conteo canónico de shoppers y certificaciones debe fijarse desde el source lock vigente antes de pedir revisión; no se presentarán a Paula cifras antiguas contradictorias.

### V3 — Finanzas, liquidaciones y pagos

Módulos del mismo corte:

- Dashboard Financiero;
- Movimientos;
- Liquidaciones;
- Lotes;
- Beneficios del shopper.

Debe demostrar:

- honorario, boleto, combo/reembolso, total y moneda separados;
- junio como liquidaciones/pagos pendientes;
- hasta mayo pagado solo donde la fuente lo confirma;
- liquidación no equivale a pago;
- cero pagos, lotes o certificaciones inferidos;
- cambio de periodo modifica filas, KPIs y detalle;
- reviewQueue visible cuando falta fuente exacta.

### V4 — Backend limpio y `CX.data` read-only

Momento: después de conectar el provider Firestore a la base nueva y vacía y antes de habilitar writes.

Se repiten V1, V2 y V3 con una señal visible de fuente read-only.

Objetivo: probar que la misma información ya no proviene solo del payload source-safe sino del backend limpio, manteniendo los mismos conteos, reglas y flujos.

No se autoriza materialización/write si la lectura visual no coincide.

### V5 — Materialización DEV

Momento: después del import/materialización controlada autorizada.

Revisar muestras representativas GT/HN y trazabilidad por:

- tenant;
- proyecto;
- periodo;
- `visitId/hrRowId`;
- shopper;
- fuente;
- estado de revisión.

Debe haber ausencia de duplicados y cero pagos/certificaciones inventados.

### V6 — Auth, roles y alcance

Perfiles controlados:

- tenant owner/admin;
- coordinador/representante por país;
- operativo;
- finanzas;
- certificación;
- cliente admin/viewer;
- shopper.

Validar rutas, acciones, países, proyectos, datos visibles, Academia y notificaciones. Ver una ruta no equivale a autorización para ejecutar una acción.

### V7 — Sincronización, evidencias y operación completa

Casos mínimos:

- HR → plataforma;
- plataforma → HR;
- visita retirada de disponibles al asignarse;
- no duplicación al reflejarse;
- conflicto enviado a revisión;
- cuestionario configurable;
- reprogramación/cancelación;
- certificación preservada;
- liquidación de junio con estado real;
- evidencia protegida;
- pago nunca confirmado por inferencia.

### V8 — Ensayo final de producción

Corte congelado, smoke integral, rollback, trazabilidad y checklist de salida. Solo después se solicita autorización de producción.

## 5. Cómo se realiza cada revisión humana

Nunca se entrega solo una URL. Cada checkpoint debe indicar:

1. URL y ambiente.
2. Commit/build exacto.
3. Fuente visible esperada.
4. Perfil de ingreso.
5. Ruta o módulo.
6. Acción concreta que Paula debe realizar.
7. Texto, conteo y comportamiento esperado.
8. Qué todavía no está activo.
9. Formato de respuesta.

Formato:

- `APROBADO`;
- `DIFERENCIA: esperado / observado`;
- `ERROR: acción realizada / resultado`.

Captura únicamente cuando haya diferencia o error.

## 6. Frecuencia

No se pedirá revisión después de cada script. Sí se pedirá **antes de avanzar al siguiente corte operativo**.

Cadencia mínima:

1. post-empalme de cada candidata;
2. contexto/HR/histórico;
3. ciclo shopper;
4. finanzas/certificaciones;
5. backend read-only;
6. materialización;
7. Auth/roles;
8. sync/evidencias;
9. preproducción.

Cuando una candidata modifica varios cortes, se revisan únicamente los cortes afectados, pero ninguno puede quedar sin evidencia visual.

## 7. Estado actual V159

- Empalme: completado.
- Gates estructurales: completados.
- Estado: `TECHNICAL_PASS_PENDING_VISUAL` dentro de `EMPALMED_PENDING_POST_GATES`.
- Siguiente checkpoint: V0 + V1 sobre el build V159 exacto.
- La URL histórica V131/R18D no prueba V159.
- Hosting DEV V159 requiere autorización separada.

## 8. Clasificación

- Reusable CXOrbia: cortes verticales, definición de terminado y diagnóstico por capa.
- Exclusivo TyA/Cinépolis: HR, periodos, GT/HN, junio, shoppers, certificaciones y liquidaciones.
- Claude/prototipo: correcciones solo cuando el fallo quede localizado en frontend.
- Academia: documentar fuente, rol, comportamiento esperado, errores y estados de cada checkpoint.
- Sin impacto Claude: provider, materialización, Auth, rules, CI, hashes y despliegues controlados.

## 9. Estado seguro

Sin merge, producción, imports reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos salvo autorización específica del bloque correspondiente.
