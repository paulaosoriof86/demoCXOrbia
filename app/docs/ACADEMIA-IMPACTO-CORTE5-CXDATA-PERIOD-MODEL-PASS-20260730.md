# Academia — impacto Corte 5 CX.data modelo proyecto/periodo

Fecha: 2026-07-30

## Estado
`CORTE5_TECHNICAL_PASS__OPERATIONAL_VISUAL_PENDING`.

Este bloque no modifica UI de Academia. Registra el contenido que debe incorporarse/actualizarse en manuales, cursos, rutas y checklists cuando se cierre visualmente Corte 5.

## Aprendizajes obligatorios para Academia

### 1. Proyecto padre vs periodo
- `Cinépolis` es un proyecto configurable dentro del tenant TyA.
- Los meses/rondas viven como periodos del proyecto; no son proyectos distintos.
- Ruta canónica backend: `tenant → project → periods → visits`.
- El selector de periodo debe cambiar contexto temporal sin cambiar la identidad del proyecto padre.

### 2. Fuente persistida vs consumidor runtime
- Un readback de base correcto no garantiza por sí solo que la aplicación consuma el modelo correctamente.
- R17N tuvo 1,406/1,406 readback y provider compare PASS, pero el smoke consumidor detectó un P0 de interpretación proyecto/periodo.
- El flujo de validación que debe enseñarse es: fuente → mapping → materialización → readback → consumidor CX.data → validación visual.

### 3. Fail-closed e instrumentación
- Si el modelo observado no coincide con el modelo canónico, el corte no se congela.
- Un fallo del harness QA debe diferenciarse de un fallo runtime mediante evidencia: el primer post-fix mostró `periods=0` porque el snapshot simulado omitía la colección `periods`; el proveedor real ya había validado 14.
- No se debe corregir la fuente para hacer pasar un test; se corrige la causa real del test o runtime.

### 4. Identidad real vs source-safe
- Source-safe protege repo, logs y artefactos.
- Los roles autorizados operan con identidad real.
- 616/616 visitas del smoke tienen nombre real y shopper target existente.
- Las 208 referencias HR pueden converger a 194 perfiles canónicos únicos sin que eso sea deduplicación por nombre.

### 5. Liquidación no equivale a pago
- 572 documentos actuales son controles de liquidación.
- `paid=true` actual: 0 en este bloque.
- No enseñar ni mostrar "pagado" por inferencia.

## Rutas por rol a actualizar después de validación visual
- **Admin/Operativo:** seleccionar proyecto y periodo, leer histórico, validar identidad, distinguir control de liquidación/pago y revisar conflictos.
- **Shopper:** ver únicamente sus visitas, certificación e historial conforme identidad/rol.
- **Cliente:** consultar únicamente el alcance autorizado del proyecto/periodo.
- **Superadmin:** comprender topología tenant/proyecto/periodo y configuración reusable.

## Checklist de validación para manuales/cursos
1. ¿El proyecto visible sigue siendo Cinépolis al cambiar de mes?
2. ¿El selector contiene exactamente los periodos canónicos esperados?
3. ¿El periodo activo es un ID de periodo y no un ID de proyecto?
4. ¿Las visitas cambian por periodo sin crear proyectos mensuales?
5. ¿La identidad real se muestra solo en roles autorizados?
6. ¿La certificación histórica se conserva?
7. ¿Liquidación y pago se explican como estados diferentes?
8. ¿No aparece fallback demo/localStorage?

## Notificación futura
Cuando Corte 5 quede FROZEN, registrar como actualización de producto/manual: "Separación canónica proyecto–periodo y consumo Firestore validado". No emitir notificación real todavía.

## Clasificación
- **Reusable CXOrbia:** proyecto padre/periodo, readback vs consumidor, fail-closed, QA instrumentation.
- **Exclusivo cliente:** Cinépolis, conteos TyA.
- **Claude/prototipo:** sin cambio inmediato; solo ante P0 visual reproducible.
- **Academia:** contenido arriba.
- **Sin impacto Claude:** gates/evidencia read-only.

## Estado seguro
Documento únicamente. No deploy, producción, Auth/Storage/HR writes, pagos, Make/Gemini ni cambios runtime adicionales.
