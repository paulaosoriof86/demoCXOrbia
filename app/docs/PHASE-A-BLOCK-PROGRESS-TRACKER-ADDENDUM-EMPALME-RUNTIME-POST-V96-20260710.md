# Tracker Phase A — addendum empalme runtime post-V96

Fecha: 2026-07-10

## Bloque

`Empalme controlado del runtime source lock post-V96`.

## Estado

**Completado y técnicamente validado.**

No equivale a merge, deploy, producción ni activación Auth/Firestore.

## Hecho

- autorización explícita de Paula registrada;
- source lock post-V96 aplicado en rama activa;
- 37 archivos runtime empalmados;
- 27 archivos adicionales preservados;
- gate criptográfico 67/67;
- sintaxis JS 91/91;
- scripts index 61, sin faltantes/duplicados;
- módulos activos 49, sin duplicados;
- semántica post-V96 9/9;
- smoke visual de seis roles;
- predeploy safe-only;
- drift gate fijado al runtime validado;
- deploy DEV conservado manual-only;
- cambios, Claude, pendientes y Academia documentados.

## Parte Phase A atendida

- identidad correcta del frontend antes de conectar backend;
- permisos y multi-proyecto post-V96 preservados;
- base segura para Auth/Firestore DEV limpio;
- protección de HR, shoppers, certificaciones carryover y liquidaciones junio;
- continuidad del punto único futuro `CX.data`;
- antirreproceso: no regresar a V96/V95 ni reabrir Level 0/1.

## Datos/fuentes TyA

No se solicitaron ni escribieron datos nuevos. Se conservaron los contratos y fuentes source-safe ya preparados para:

- HR operacional;
- shoppers históricos;
- certificaciones presentadas;
- visitas ejecutadas hasta junio;
- liquidaciones/pagos de junio;
- tenant TyA y proyecto Cinépolis configurable.

## Conectado

- runtime post-V96 en rama;
- gates estáticos/CI;
- SHA runtime validado.

## Preview/preparado

- Auth/RBAC/claims;
- Firestore schema/rules draft;
- protected reads;
- HR source-safe candidates;
- reviewQueue/auditEvents;
- CX.data adapter/switch;
- outbox/Make/Gemini/Storage;
- import dry-run.

## Bloqueado

- usuarios Auth reales;
- claims reales;
- Firestore real;
- rules deploy;
- imports/writes;
- runtime switch;
- HR writeback;
- providers;
- pagos;
- merge/deploy/producción.

## Advertencias no bloqueantes del empalme

- 36 coincidencias de copy a revisar P1;
- 27 archivos adicionales a consolidar/reubicar;
- smoke focalizado por ruta/acción para coordinador, aliado y custom antes de claims reales;
- revisión de `Admin del proyecto` contra matriz funcional.

## Clasificación

- **Reusable CXOrbia:** empalme determinístico, source-lock gate, drift, deploy manual-only.
- **Exclusivo cliente:** reglas/datos source-safe TyA/Cinépolis.
- **Claude/prototipo:** P1 permisos/copy/extras.
- **Academia:** rutas, manuales, cursos y notificaciones por rol.
- **Sin impacto Claude:** validadores, hashes y CI interno.

## Siguiente bloque exacto

`Auth/Firestore DEV limpio — preactivación focalizada por permisos`:

1. resolver con documentos/matriz vigente el alcance de coordinador, aliado y custom;
2. ejecutar validador por ruta/acción, no solo visual;
3. preparar identidad/configuración externa del Firebase DEV nuevo y vacío;
4. mantener todos los providers y writes apagados;
5. no crear usuarios, claims ni desplegar reglas sin autorización explícita separada.

## Necesidad de Paula

No se necesitan HR, shoppers, certificaciones, liquidaciones ni otros datos.

Solo será necesaria confirmación funcional si la matriz vigente no determina de forma inequívoca el alcance de `Admin del proyecto` para coordinador/aliado antes de crear claims reales.
