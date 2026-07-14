# PHASE A — CHECKPOINT VIVO ÚNICO DE EJECUCIÓN TYA

Fecha de actualización: 2026-07-14  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama de integración: `docs-tya-v6-v71-audit`  
PR: `#7` draft/open/no merge

## 1. Regla de precedencia

En una iteración normal solo se revisan:

1. este checkpoint;
2. el delta de la candidata o del bloque;
3. un solo batch de validaciones focalizadas;
4. el estado actual de PR #7.

El maestro y los addenda se releen completos únicamente al abrir conversación, ante conflicto real de fuente, autorización productiva o cambio de alcance. No se relee el proyecto completo por cada ZIP.

## 2. Objetivo único vigente

Cerrar Phase A TyA con:

- V112 auditada y empalmada sobre la continuidad V111;
- HR TyA como fuente operacional;
- periodos, visitas, shoppers, certificaciones, liquidaciones y pagos correctos;
- Firebase DEV nuevo y vacío;
- conexión real por el punto único de `CX.data`;
- Auth, Storage y sincronización controladas;
- smoke semántico por rol y periodo;
- deploy productivo solo después del GO.

## 3. Baseline y carriles paralelos

### Frontend

- **Source lock vigente:** V110.
- V111 fue auditada contra V110 y contra el paquete exacto.
- Manifest V111 ejecutado literalmente con Node: 141 archivos, 0 diferencias, aggregate coincidente y exit code 0.
- JavaScript V111: `node --check` PASS.
- V111 queda como **baseline auditada de continuidad backend**, no como source lock final.
- Claude recibió un paquete V111 → V112 de solo tres gaps:
  1. separación real proyecto/periodo;
  2. Mi Día limitado al periodo activo;
  3. referencias/perfiles sin rating fuera de ranking y KPIs.
- Los puntos ya resueltos en V111 no se reabren.

### Backend

- R18A: PASS.
- R18B: PASS.
- R24 ejecutó correctamente en GitHub y permanece bloqueado solo por IAM externo de Google Cloud.
- El backend seguro puede continuar entendiendo V111 como continuidad, sin tocar sus módulos.

## 4. Estado real alcanzado y que no se reabre

- Normalización de fechas Excel/ISO existente y aplicada.
- Máquina de estados y domain mapping existentes y aplicados.
- HR source-safe: 14 periodos, 28 tabs y 616 visitas.
- R11D aplicado como un solo conflicto source-level; cero identidades inventadas.
- R14C: 196 enlaces financieros exactos aplicados.
- Cero pagos confirmados o inferidos.
- V110 source lock conservado.
- V111 auditada y utilizable para continuidad.
- Manifest V111 comprobado con Node.
- Login/título/país V111 comprobados.
- Selector cosmético y fechas literales de Mi Día V111 corregidos.
- Modal reducido de referencia protegida V111 conservado.
- Academia V111 conservada.

No se reabren:

- normalizador de fechas;
- máquina de estados;
- domain mapping;
- R11–R11D;
- R14C;
- importadores de pagos/certificaciones;
- P0 cerrados en V110;
- manifest V111;
- login/título/país V111;
- modal protegido y lecciones V111.

## 5. Bloque activo único

`R21_R23_FAST_AUDIT_AND_EMPALME_V112`

Estado actual: esperando la candidata V112 de Claude.

Al recibirla se ejecutará solamente:

1. comparación V112 contra V111;
2. contraste contra el paquete exacto V111 → V112;
3. revisión de archivos agregados, eliminados y modificados;
4. revisión de `index.html`, manifest y build lock;
5. un batch de `node --check` para JS modificados;
6. una ejecución literal de `verify-manifest.mjs`;
7. una prueba semántica focalizada de los tres gaps;
8. decisión inmediata:
   - GO y empalme;
   - bloqueo estructural;
   - máximo tres gaps concretos.

No se auditarán módulos no modificados ni se revisará el PR completo.

## 6. Metodología fast-lane obligatoria

### Para cada nueva candidata

- La última candidata auditada y usable se convierte inmediatamente en baseline de continuidad, aunque aún no sea source lock final.
- La auditoría se limita al delta inmediato y al paquete exacto enviado.
- Las validaciones se ejecutan en un solo batch local antes de tocar GitHub.
- No se espera ningún workflow ajeno al bloque.
- No se crean contratos, documentos o ramas antes de la decisión técnica.
- Si pasa, se empalma en el mismo bloque.
- Si falla, se devuelve un máximo de tres gaps con evidencia de archivo/función/prueba.
- La documentación completa —cambios backend, Claude, pendientes y Academia— se actualiza una sola vez después de la decisión, no en archivos separados durante el diagnóstico.

### Para GitHub

- Una rama focalizada por bloque.
- Un workflow focalizado solo cuando aporte evidencia que no pueda obtenerse localmente.
- `concurrency` y cancelación de runs obsoletos.
- Un solo fast-forward a integración después de la decisión.
- PR #7 no se usa para diagnosticar cada iteración.

## 7. Diagnóstico de demora corregido

La demora no era necesaria para la profundidad de la auditoría. Se originó por:

1. releer y reauditar demasiado contexto en cada iteración;
2. inspeccionar más archivos que el delta real;
3. documentar antes de tener decisión técnica;
4. disparar y esperar workflows históricos del PR acumulado;
5. tratar una candidata con gaps como si no pudiera ser baseline de continuidad;
6. separar auditoría y empalme en bloques distintos aunque no hubiera bloqueo estructural.

Desde ahora la auditoría y el empalme forman un solo bloque. V111 ya queda reconocida como continuidad, por lo que el trabajo no queda detenido ni se considera perdido mientras Claude corrige V112.

## 8. Plan restante Phase A

1. `R21_R23_FAST_AUDIT_AND_EMPALME_V112`.
2. `R24_NEW_EMPTY_FIREBASE_DEV_EXTERNAL_IAM_RESOLUTION`.
3. `R25_CX_DATA_DEV_BACKEND_CONNECTION`.
4. `R26_AUTH_ROLES_STORAGE_MINIMUM`.
5. `R27_CONTROLLED_TYA_IMPORT`.
6. `R28_HR_PLATFORM_MAKE_SYNC`.
7. `R29_SEMANTIC_ROLE_PERIOD_SMOKE`.
8. `R30_PRODUCTION_GO_NO_GO`.
9. `R31_CONTROLLED_PRODUCTION_DEPLOY`.

## 9. Control de tiempo y agilidad

- Cada iteración debe cerrar una decisión o un cambio verificable.
- No se dedica una iteración solo a documentación.
- No se hace una auditoría general cuando existe un delta concreto.
- Auditoría y empalme no se separan si la candidata pasa.
- No se espera CI no relacionado.
- Mientras un carril espera una entrada externa, se mantiene preparada la siguiente acción exacta, sin abrir trabajo abstracto.
- El reporte al usuario se entrega al terminar la decisión técnica, no después de revisar todos los documentos históricos.

## 10. Cierre obligatorio de cada iteración

Toda respuesta debe incluir:

1. Plan vigente.
2. Bloque trabajado.
3. Cambios y verificación.
4. Avance Phase A.
5. Trabajo no reabierto.
6. Siguiente bloque exacto.
7. Bloqueos reales.
8. Claude/prototipo.
9. Reusable CXOrbia.
10. Exclusivo TyA/Cinépolis.
11. Academia, manuales, cursos, rutas y notificaciones.
12. Producción y gates.

El formato obligatorio no autoriza convertir cada punto en una auditoría extensa; puede cerrarse de forma breve cuando no haya cambio en un carril.

## 11. Clasificación vigente

- **Reusable CXOrbia:** baseline de continuidad, auditoría delta, validación batch, empalme inmediato, estados separados y CI focalizada.
- **Exclusivo TyA/Cinépolis:** HR, Q1/Q2, junio, GT/HN y overlays concretos.
- **Claude/prototipo:** V112 con tres gaps focalizados.
- **Academia:** conservar V111 y ajustar solo explicaciones afectadas por proyecto/periodo o score disponible.
- **Sin impacto Claude:** IAM, workflows, adapters, importadores y gates backend.

## 12. Estado de producción y gates

- PR #7: draft/open/no merge.
- Producción: HOLD.
- V110: source lock.
- V111: baseline auditada de continuidad backend.
- V112: pendiente de Claude; siguiente candidata para empalme inmediato si pasa.
- R17: evidencia NO-GO.
- Firebase DEV nuevo: bloqueado por IAM externo.
- Firestore/Auth/Storage writes: HOLD.
- Imports: HOLD.
- Make/Gemini/pagos: HOLD.
- Siguiente acción exacta: auditar y empalmar V112 en un solo bloque al recibirla.
