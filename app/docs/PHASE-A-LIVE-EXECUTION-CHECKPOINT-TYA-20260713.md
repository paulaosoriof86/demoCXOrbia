# PHASE A — CHECKPOINT VIVO ÚNICO DE EJECUCIÓN TYA

Fecha de actualización: 2026-07-14  
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
- periodos, visitas, shoppers, certificaciones, liquidaciones y pagos representados correctamente;
- un único estado de periodo;
- backend real por el punto único de `CX.data`;
- datos demo fuera de la fuente final;
- validación visual semántica por rol;
- gates de producción explícitos.

No se priorizan nuevos contratos, reauditorías completas ni infraestructura abstracta que no desbloquee uno de esos puntos.

## 3. Baseline y carriles activos

- Baseline frontend viva: **V110 empalmada**.
- Claude recibió paquete focalizado V110 → V111 para proyecto/periodo, marca/alcance y shoppers protegidos.
- V111 todavía no es baseline hasta auditoría forense diferencial y empalme.
- R17: evidencia NO-GO; no es baseline y no se continúa parcheando.
- Backend trabaja en paralelo sin modificar `/app/modules` ni `/app/core`.
- Producción permanece HOLD.

## 4. Estado real ya alcanzado y que no se reabre

### Activos existentes reutilizables

- Normalización de fechas Excel/ISO ya existe en importadores source-safe.
- Máquina de estados `phase-a-operational-state-machine-v1` ya existe.
- Domain mapping `phase-a-source-safe-domain-mapping-v1` ya existe.
- ReviewQueue y conflictos ya están contratados.
- V110 está empalmada físicamente.
- R10: Admin, Cliente y Shopper renderizaron 13/13 rutas sin errores de consola.
- HR source-safe: 14 periodos, 28 tabs y 616 visitas.
- Importadores pagos/certificaciones soportan JSON, CSV, XLSX y XLSM.
- R11D encapsuló la brecha shopper en revisión estable; no se deduplica por nombre.
- R14C produjo 196 enlaces financieros exactos y 51 casos en revisión.
- Materialización, rollback, auditoría y gates ya están documentados.

### Pendiente real

- Integrar esos activos existentes en la ruta que genera el payload visible.
- Retirar de la salida final `submitido → liquidada`, seriales Excel y atributos shopper inventados.
- Aplicar después, sin recalcular, los resultados R11D/certificaciones y R14C al modelo canónico.
- Recibir, auditar y empalmar V111.
- Conectar lectura runtime/backend real por `CX.data`.
- Crear o habilitar Firebase DEV nuevo y vacío.
- Activar Auth, Storage, Make, Gemini y producción solo por gates.

## 5. Bloque activo único

`R18A_INTEGRATE_EXISTING_CANONICAL_ASSETS`

Alcance permitido:

1. consumir el payload del builder HR ya existente;
2. aplicar las semánticas de fecha ya implementadas por los importadores;
3. aplicar la máquina de estados y domain mapping ya existentes;
4. normalizar fechas a ISO y enviar ambiguas a `reviewQueue`;
5. separar estados operativo, cuestionario, submitido, liquidación y pago;
6. impedir que submitido implique liquidado o pagado;
7. agregar `sourceSnapshotAt`, `sourceReadMode` y `runtimeSyncActive`;
8. retirar rating, estado, completitud, preferencia u honorario shopper inventados;
9. generar adapter source-safe canónico para build DEV;
10. verificar expresamente que R11D y R14C no fueron recalculados.

Fuera de alcance:

- rehacer normalizador;
- crear otra máquina de estados o domain mapping;
- reabrir R11–R11D;
- volver a conciliar R14/R14C;
- crear otro importador;
- tocar módulos/core desde backend;
- desplegar producción;
- ejecutar writes, imports, Make, Gemini o pagos.

## 6. Plan de trabajo restante Phase A

### A. Backend canónico y datos existentes

- `R18A_INTEGRATE_EXISTING_CANONICAL_ASSETS`: integrar parser/estados/metadata existentes en la salida source-safe.
- `R18B_APPLY_EXISTING_R11D_R14C_AND_CERTIFICATION_OUTPUTS`: aplicar resultados ya calculados; no reconciliar de nuevo.

### B. Prototipo V111 y empalme

- `R21_CANONICAL_PERIOD_UI_V111`: un único periodo en sidebar, Dashboard, Visitas, Mi Día, Histórico y Finanzas.
- `R22_LOGIN_BRANDING_COUNTRY_SCOPE_V111`: login, marca y alcance desde configuración.
- `R23_PROTECTED_SHOPPER_PROFILE_V111`: referencias protegidas sin atributos inventados.
- Auditoría diferencial V111 contra V110 y el paquete exacto; empalme de tres vías y source lock nuevo solo si pasa.

### C. Backend real

- `R24_NEW_EMPTY_FIREBASE_DEV`.
- `R25_CX_DATA_DEV_BACKEND_CONNECTION`.
- `R26_AUTH_ROLES_STORAGE_MINIMUM`.
- `R27_CONTROLLED_TYA_IMPORT`.
- `R28_HR_PLATFORM_MAKE_SYNC`.

### D. Salida

- `R29_SEMANTIC_ROLE_PERIOD_SMOKE`.
- `R30_PRODUCTION_GO_NO_GO`.
- `R31_CONTROLLED_PRODUCTION_DEPLOY`.

No se agregan nuevos bloques salvo hallazgo que bloquee directamente uno de estos pasos. Todo bloque nuevo debe indicar qué bloque reemplaza o por qué es indispensable.

## 7. Control de tiempo y agilidad

- Cada iteración debe entregar un cambio verificable o declarar un bloqueo concreto.
- Una iteración no puede dedicarse únicamente a releer, reauditar o documentar lo conocido.
- Diagnóstico máximo normal: checkpoint, diff y archivos directamente afectados.
- No revisar el PR completo de 2,000+ commits en cada bloque.
- Mientras Claude trabaja, backend avanza por el carril ejecutable sin esperar.
- Si una herramienta bloquea un carril, se continúa por otro carril Phase A; no se abre una cadena de HOLD documentales.

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

1. leer maestro y addenda obligatorios una sola vez;
2. leer este checkpoint;
3. verificar PR #7 y HEAD;
4. resumir en máximo diez líneas;
5. continuar desde el bloque activo único;
6. no crear otro diagnóstico general ni solicitar información ya documentada.

Si la conversación se acerca al límite, el prompt de continuidad debe copiar este checkpoint, el último commit, el resultado del bloque y el siguiente bloque exacto.

## 10. Clasificación obligatoria del bloque R18A

- **Reusable CXOrbia:** integración de normalización externa, estados de dominio separados, metadata snapshot/runtime, niveles de protección y gate semántico.
- **Exclusivo TyA/Cinépolis:** columnas HR, Q1/Q2, visita previa, GT/HN y reglas de junio; no se hardcodean en el paquete Claude comercializable.
- **Claude/prototipo:** V111 para periodo único, Mi Día, login, alcance y shoppers protegidos.
- **Academia:** proyecto vs periodo; snapshot vs runtime; estados operativo/cuestionario/submitido/liquidación/pago; referencia protegida vs perfil autorizado.
- **Sin impacto Claude:** postprocesador canónico, adapter build-only, validadores y metadata interna.

## 11. Estado al actualizar este checkpoint

- Producción: HOLD.
- V110: baseline frontend.
- V111: solicitado a Claude, pendiente recepción y auditoría.
- R17: evidencia NO-GO.
- Firestore/Auth/Storage writes: HOLD.
- Imports reales: HOLD.
- Make/Gemini/pagos: HOLD.
- Siguiente acción ejecutable: `R18A_INTEGRATE_EXISTING_CANONICAL_ASSETS`.
