# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-30  
**STATE_SYNC_EPOCH:** `CXORBIA-20260830-F10-OPERATIONAL-AUTHORITY-REPAIR-15`  
**Estado:** `BACKEND_AUTHORITY_REPAIR_SOURCE_APPLIED__CLAUDE_NOT_YET_RELEASED`  
**NEXT:** `READONLY_GATES__PROVIDER_ROUTE_GATE__THEN_CLAUDE_CODE`

Se conserva el PASS técnico F10 previo para HR/KPIs. El pendiente actual es un defecto transversal posterior y distinto: la capa HR generaba `hr-post-*` sintéticos y algunos botones frontend conservan éxito/mutación local antes de persistencia durable.

Pendientes exactos, en orden:
1. Gate read-only del nuevo authority adapter: cero `hr-post-*` en salida canónica, `periodStats` coherente con evidencia F10, compositor idempotente y sin pérdida de postulaciones Firestore reales.
2. Completar ruta HTTP/provider real detrás de policy explícita, manteniendo writes apagados hasta autorización.
3. Probar comando sintético controlado con Auth/RBAC/idempotencia/version conflict/ACK; ningún dato HR real.
4. Validar reconciliación `platform -> pending_hr -> synced` y `hr -> pending_platform -> reflected`, con conflicto a revisión y cero dedupe por nombre.
5. Después entregar paquete focal a Claude Code para reemplazar únicamente call-sites de UI que hoy mutan memoria o muestran éxito prematuro.
6. Academia/manuales: incorporar diferencia entre postulación, asignación, sincronización pendiente, sincronización confirmada y conflicto.

No pedir nueva candidata, no rediseñar módulos, no deploy/reimport/replay por rutina, no activar Make/Gemini/pagos/HR writes.
