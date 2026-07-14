# PHASE A — CHECKPOINT VIVO ÚNICO DE EJECUCIÓN TYA

Fecha: 2026-07-13
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: `#7` draft/open/no merge

## 1. Regla de precedencia

Este archivo es el único checkpoint operativo que debe leerse en cada iteración normal.

El documento maestro y los addenda continúan siendo vinculantes, pero no se releen completos en cada iteración. Se releen solo al abrir una conversación nueva, ante conflicto real de fuente, cambio de baseline, autorización de producción o cambio de alcance.

En una iteración normal se revisa únicamente:

1. este checkpoint;
2. el diff desde el último commit del bloque;
3. el resultado del validador o smoke del bloque;
4. el estado actual de PR #7.

Está prohibido reiniciar una auditoría global, releer indiscriminadamente miles de archivos o abrir una nueva ruta documental si el siguiente bloque ya está definido aquí.

## 2. Objetivo único vigente

Cerrar Phase A TyA y llegar a una salida productiva controlada con:

- tenant TyA;
- Cinépolis como proyecto normal configurable;
- HR TyA como fuente operacional;
- periodos, visitas, shoppers, certificaciones y liquidaciones correctos;
- un único estado de periodo;
- backend real por el punto único de `CX.data`;
- datos demo fuera de la fuente final;
- validación visual semántica por rol;
- gates de producción explícitos.

No se priorizan nuevos contratos, paquetes, reauditorías completas ni infraestructura abstracta que no desbloquee uno de esos puntos.

## 3. Baseline y evidencia

- Baseline frontend viva: V110 empalmada.
- R17: evidencia NO-GO, no nueva baseline frontend.
- R17 no se continúa parcheando como solución final.
- No se crea otro prototipo desde cero.
- Backend continúa sobre V110 y sobre los contratos/datos ya trabajados.

## 4. Estado real ya alcanzado

### Cerrado o reutilizable

- V110 empalmada físicamente.
- Admin, Cliente y Shopper renderizaron 13/13 rutas sin errores de consola en R10.
- HR TyA accesible en lectura source-safe: 14 periodos, 28 tabs, 616 visitas.
- Importadores separados de pagos y certificaciones soportan JSON, CSV, XLSX y XLSM.
- Conciliación financiera R14C: 196 enlaces exactos con casos restantes en revisión.
- Contratos de `CX.data`, reviewQueue, conflictos, pagos, certificaciones, Make y datos sensibles ya existen.
- Source-safe, gates, rollback y auditoría ya están documentados; no se reabren desde cero.

### No cerrado

- Lectura runtime real de HR/backend.
- Normalización completa de fechas.
- Mapper canónico de estados TyA.
- Periodo canónico compartido en toda la UI.
- Mi Día/calendario alineado con periodo y fechas.
- Login sin título duplicado.
- País activo/banderas gobernados por configuración y alcance.
- Shoppers operativos completos sin atributos inventados.
- Firebase DEV nuevo y vacío disponible para conexión.
- Auth, Storage, Make, Gemini y producción real.

## 5. Bloque activo único

`R18_BACKEND_CANONICAL_HR_MAPPING`

Alcance permitido:

1. normalizar fechas Sheets/XLSX a ISO;
2. enviar fechas ambiguas o inválidas a `reviewQueue`;
3. separar `operationalState`, `questionnaireState`, `submissionState`, `liquidationState` y `paymentState`;
4. impedir que submitido se convierta en liquidada o pagada;
5. agregar `sourceSnapshotAt`, `sourceReadMode` y `runtimeSyncActive`;
6. eliminar rating, completitud, preferencia o estado shopper inventado en adapters source-safe;
7. producir referencia source-safe por periodo para el gate semántico.

Fuera de alcance de R18:

- crear otro paquete Claude;
- rediseñar módulos;
- reauditar V110 completa;
- reabrir R11-R17;
- crear más documentos de arquitectura general;
- desplegar producción;
- activar writes, Make, Gemini o pagos.

## 6. Plan de trabajo restante Phase A

### A. Corrección de datos y semántica

- `R18` Mapper canónico HR y fechas.
- `R19` Reconciliación estable de shoppers 210/213/215 y certificaciones conservadas.
- `R20` Overlay financiero: liquidación y pago separados, junio representado correctamente.

### B. Corrección frontend crítica sobre V110

- `R21` Periodo canónico único en sidebar, Dashboard, Visitas, Mi Día, Histórico y Finanzas.
- `R22` Login, branding y banderas por tenant/proyecto/alcance.
- `R23` Shoppers protegidos y perfiles operativos sin datos inventados.

Estas tareas son Claude/prototipo cuando impliquen módulos UI. Backend solo documenta contrato y validación esperada.

### C. Backend real

- `R24` Proyecto Firebase DEV nuevo/vacío o entorno equivalente autorizado.
- `R25` Conexión única `CX.data` a backend DEV manteniendo la interfaz.
- `R26` Auth/roles y Storage/evidencias mínimos de Phase A.
- `R27` Import controlado de datos TyA limpios y verificados.
- `R28` Sincronización HR/plataforma con Make y conflictos fail-closed.

### D. Salida

- `R29` Smoke semántico completo por rol y periodo.
- `R30` GO/NO-GO de producción con rollback.
- `R31` Deploy productivo controlado y verificación posterior.

No se agregan nuevos bloques salvo hallazgo que bloquee directamente uno de estos pasos. Todo bloque nuevo debe indicar qué bloque reemplaza o por qué es indispensable.

## 7. Control de tiempo y agilidad

- Cada iteración debe entregar un cambio verificable o declarar un bloqueo concreto.
- Una iteración no puede dedicarse únicamente a releer, reauditar o documentar lo ya conocido.
- Diagnóstico máximo antes de actuar: revisión del checkpoint, diff y archivos directamente afectados.
- No se revisa el PR completo de 2,000+ commits en cada bloque.
- No se genera un nuevo paquete para Claude hasta acumular un conjunto crítico real o necesitar una corrección frontend inmediata.
- Si una herramienta bloquea el trabajo, se reporta en el mismo bloque y se continúa por el siguiente carril ejecutable; no se abre una cadena indefinida de HOLD documentales.

## 8. Cierre obligatorio de cada iteración

Toda respuesta de cierre debe incluir, en este orden:

1. **Plan de trabajo vigente.**
2. **Bloque que se trabajó.**
3. **Qué cambió y cómo se verificó.**
4. **Qué parte de Phase A avanzó.**
5. **Qué ya estaba hecho y no se reabrió.**
6. **Qué sigue exactamente.**
7. **Bloqueos reales.**
8. **Documentación Claude/prototipo.**
9. **Reusable CXOrbia.**
10. **Exclusivo TyA/Cinépolis.**
11. **Impacto Academia, manuales, cursos, rutas y notificaciones.**
12. **Estado de producción y gates.**

Si falta uno de esos apartados, el bloque no se considera cerrado.

## 9. Regla para nuevas conversaciones

Al abrir una conversación nueva:

1. leer documento maestro y addenda obligatorios una sola vez;
2. leer este checkpoint;
3. verificar PR #7 y HEAD;
4. resumir en máximo diez líneas;
5. continuar desde `Bloque activo único`;
6. no crear otro diagnóstico general ni solicitar información ya documentada.

Si la conversación se acerca al límite, el prompt de continuidad debe copiar el estado de este checkpoint, el último commit, el resultado del bloque y el siguiente bloque exacto. No debe reconstruir dos meses de historia narrativa.

## 10. Clasificación obligatoria del bloque R18

- **Reusable CXOrbia:** normalizador de fechas, estados de dominio separados, metadata snapshot/runtime, reviewQueue y gate semántico.
- **Exclusivo TyA/Cinépolis:** columnas HR, Q1/Q2, visita previa, GT/HN, 44 visitas mensuales y reglas de junio.
- **Claude/prototipo:** periodo único, Mi Día, login, banderas, shoppers sin atributos ficticios y definición de KPIs.
- **Academia:** proyecto vs periodo; snapshot vs runtime; estados operativo/cuestionario/submitido/liquidación/pago; fechas normalizadas y reviewQueue.
- **Sin impacto Claude:** código interno de normalización, validadores y metadata cuando no cambien UI.

## 11. Estado al crear este checkpoint

- Producción: HOLD.
- Hosting R17: evidencia NO-GO.
- Firestore/Auth/Storage writes: HOLD.
- Imports reales: HOLD.
- Make/Gemini/pagos: HOLD.
- Siguiente acción ejecutable: `R18_BACKEND_CANONICAL_HR_MAPPING`.
