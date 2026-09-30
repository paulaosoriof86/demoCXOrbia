# Resultado operativo — Firebase DEV read-only + HR viva source-safe TyA

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## 1. Objetivo del bloque

Ejecutar, con autorización explícita de Paula, la verificación real read-only del Firebase DEV y avanzar inmediatamente con la fuente HR viva TyA ya trabajada, sin convertir el bloque en preparación documental abstracta.

## 2. Firebase DEV — resultado real

La consulta al proveedor se ejecutó en modo estrictamente read-only y produjo:

- decisión: `NONEMPTY_REVIEW_REQUIRED`;
- proyecto esperado: `cxorbia-backend-dev`;
- coincidencia de project ID: sí;
- coincidencia de dominio de service account: sí;
- usuarios Auth detectados: 17;
- email/password habilitado: sí;
- colecciones raíz Firestore detectadas: 1;
- al menos un documento Firestore detectado: sí;
- releases de reglas detectados: 1;
- listado de bases Firestore: inconcluso, error categorizado 400;
- Storage: inconcluso, `NOT_FOUND_OR_API_NOT_INITIALIZED`;
- Functions: inconcluso, `PERMISSION_DENIED`;
- estado limpio confirmado: no.

La falla del workflow fue intencional/fail-closed por entorno no vacío. El cleanup de credenciales y la carga del reporte sanitizado sí finalizaron correctamente.

## 3. Consecuencia obligatoria

`cxorbia-backend-dev` no puede considerarse la base nueva y limpia requerida para Auth/Firestore de CXOrbia.

Por tanto:

- no crear usuarios ni claims allí;
- no desplegar reglas allí;
- no importar TyA allí;
- no limpiar o borrar automáticamente los 17 usuarios ni la colección detectada;
- no asumir que esos recursos pertenecen a CXOrbia sin revisión humana;
- preparar posteriormente un Firebase backend nuevo y vacío, con autorización separada.

El Hosting DEV puede seguir utilizándose solo como superficie visual source-safe, siempre que no se conecten Auth/Firestore/Storage/Functions del proyecto no limpio.

## 4. Garantías de la consulta Firebase

- cero usuarios creados o modificados;
- cero claims escritos;
- cero campos de documentos Firestore leídos;
- cero escrituras o borrados Firestore/Storage;
- cero invocaciones Functions;
- cero deploy de reglas o Hosting;
- cero imports;
- cero acceso a producción;
- cero PII o credenciales en el reporte.

Run operativo: `29110312898`.  
Artifact sanitizado: `sha256:b6e20bb3e5046053b548382f5f6cd170afe7f79e15c0a5fdc7b7ba3db8fd0737`.

## 5. HR viva TyA — resultado source-safe corregido

Después de verificar Firebase se ejecutó la lectura real read-only de la HR multi-tab ya documentada, mediante export XLSX público de respaldo y sanitización en memoria.

Resultado final:

- veredicto: `GO_HR_LIVE_SOURCE_SAFE_READONLY`;
- periodos: 14;
- pestañas: 28;
- rango: junio 2025 a julio 2026;
- visitas válidas: 616;
- referencias shopper protegidas: 213;
- Guatemala: 476 visitas;
- Honduras: 140 visitas;
- cada periodo: GT 34 + HN 10 = 44 visitas;
- liquidada: 400;
- cuestionario: 142;
- realizada: 31;
- agendada: 36;
- fuera de rango: 7;
- PII expuesta: 0;
- Firestore writes: 0;
- HR writes: 0;
- deploy: 0;
- producción: 0.

Run final: `29110863051`.  
Artifact final: `sha256:453dc86209f911c0d7b5570fc69d4e90154ee30d68594817ce5b83f3e8884379`.

## 6. Corrección de calidad aplicada

La primera lectura detectó 617 filas porque `JUNIO 26 HN!12` era una fila resumen/footer sin `ID CINEMA`, no una visita.

Se endureció el builder para aceptar una visita únicamente cuando existen:

- país;
- shopping;
- ID Cinema.

Resultado después de la corrección:

- junio 2026 volvió a 44 visitas: GT 34 + HN 10;
- total histórico quedó en 616;
- shopper refs quedaron en 213;
- desapareció el falso estado `asignada` generado por el footer.

Archivo corregido:

- `tools/hr-source/tya-build-live-hr-source-safe-static.mjs`.

Commit final de corrección exacta:

- `47a7c539944bfd1f19c785183e9ae567eb28dcc9`.

## 7. Advertencias reales de la HR

Quedaron 18 warnings no críticos, todos por ausencia de la columna `Disponible desde` en pestañas históricas de junio 2025 a febrero 2026, GT y HN.

No son filas faltantes ni errores de conteo. Deben representarse como dato histórico no disponible; no se debe inventar la fecha.

## 8. Hallazgo forense del runtime post-V96

El runtime post-V96 conserva la candidata visual, pero todavía no consume automáticamente el payload HR source-safe:

- `app/index.html` no carga `app/data/tya-hr-source-safe-periods.js`;
- `app/index.html` tampoco carga el bridge source-safe preservado;
- `app/core/data.js` continúa siendo el seed genérico de fallback;
- `modules/cert.js` mantiene métricas y nombres demo hardcodeados;
- `modules/finanzas.js` mantiene lotes y evaluadores demo hardcodeados;
- notificaciones/correo/soporte contienen ejemplos comerciales que no deben presentarse como operación TyA real.

Por ello, desplegar ahora el runtime sin un binding frontend corregido mostraría una mezcla engañosa de HR real source-safe y secciones demo. No se ejecutó deploy.

## 9. Decisión de revisión visual

La revisión visual humana continúa siendo el siguiente objetivo, pero debe hacerse después de un ajuste focalizado del prototipo, no sobre una mezcla demo/real.

Secuencia exacta:

1. entregar a Claude un paquete crítico de binding real-data, no un rediseño;
2. cargar desde el runtime el payload source-safe en el único punto de `CX.data`;
3. hacer únicos los IDs de periodo sin convertir Cinépolis en lógica global;
4. enlazar Certificaciones y Finanzas/Liquidaciones a datos source-safe o a estado honesto pendiente;
5. eliminar del carril TyA los conteos/nombres demo operativos;
6. reauditar la candidata y fijar source lock;
7. construir preview source-safe sin Auth/Firestore;
8. solicitar autorización separada para deploy Hosting DEV manual-only;
9. realizar revisión visual y operativa completa con Paula;
10. solo después continuar con identidades, Auth, claims, rules, imports y writes sobre un Firebase nuevo y limpio.

## 10. Información TyA recuperada y protegida

No se pidió nuevamente información. Se continuó con:

- HR multi-tab;
- GT/HN;
- 14 periodos;
- 616 visitas válidas;
- 213 referencias shopper protegidas;
- Q1/Q2, franjas, quincenas, fechas y estados ya documentados;
- visitas hasta junio ejecutadas;
- junio tratado como liquidaciones/pagos, no como visitas por repetir;
- certificaciones carryover como requisito vinculante;
- Cinépolis como proyecto configurable dentro de TyA;
- multi-proyecto y cuestionario configurable.

## 11. Estado seguro final

- sin merge;
- sin deploy nuevo;
- sin producción;
- sin usuarios o claims creados;
- sin reglas desplegadas;
- sin Firestore/Storage/Functions writes;
- sin import real;
- sin HR writeback;
- sin Make/Gemini activos;
- sin pagos reales;
- sin datos sensibles crudos.

## 12. Clasificación

- **Reusable CXOrbia:** clean-state fail-closed, lectura source-safe, filtro de filas válidas por llave estable, no-deletion, preview separado de backend real.
- **Exclusivo cliente:** conteos, periodos, países y reglas TyA/Cinépolis.
- **Claude/prototipo:** binding `CX.data`, Certificaciones, Finanzas/Liquidaciones, eliminación de demo operativo y estados honestos.
- **Academia:** diferencia entre source-safe, preview, importado y conectado; entorno no limpio; datos históricos faltantes sin inventar.
- **Sin impacto Claude:** run IDs, digests, credenciales temporales y detalles internos del runner.
