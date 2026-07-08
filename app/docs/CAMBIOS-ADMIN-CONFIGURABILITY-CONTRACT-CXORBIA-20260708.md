# Cambios - Admin Configurability Contract CXOrbia

Fecha: 2026-07-08  
Bloque: administrabilidad completa preview-only  
Estado: documentado y seguro.

## Archivos creados

1. `tools/contracts/cxorbia-admin-configurability-contract.mjs`
   - Tipo: nuevo.
   - Proposito: contrato/validador preview-only para administrabilidad por tenant/proyecto.
   - Que valida: dominios configurables, roles, versionado, estados, auditRef, gates, NDA versionado, planes versionados, providers apagados/preparados y ausencia de datos sensibles.
   - Que bloquea: ejecucion real, escrituras reales, proveedores reales activos, import real, notificaciones reales, pagos reales, publicacion sin revision, sobrescritura silenciosa, NDA aceptado modificado silenciosamente, DPI, banco, NDA firmado, secretos/tokens/webhooks.

2. `app/docs/ADMIN-CONFIGURABILITY-CONTRACT-CXORBIA-20260708.md`
   - Tipo: nuevo.
   - Proposito: documento tecnico y funcional del contrato.
   - Contiene: alcance, reglas NDA, reglas de planes, estados, gates, impacto Phase A, impacto Claude, impacto Academia, clasificacion y estado seguro.

3. `app/docs/CAMBIOS-ADMIN-CONFIGURABILITY-CONTRACT-CXORBIA-20260708.md`
   - Tipo: nuevo.
   - Proposito: bitacora puntual de este bloque.

## Cambios aplicados

- Se agrego un contrato de administrabilidad completa sin tocar runtime.
- Se dejo establecido que NDAs y planes deben ser editables, versionados, auditables y sujetos a gate/revision.
- Se reforzo que una aceptacion NDA ya presentada no debe modificarse silenciosamente.
- Se reforzo que planes operativos, proyecto, certificacion, pagos, evidencias, automatizaciones y Academia no deben hardcodearse.
- Se dejo una base reusable CXOrbia para futuros tenants, sin asumir TyA/Cinepolis como logica global.

## Impacto frontend / Claude

Claude debe reflejar en el prototipo:

- pantallas o fichas administrables por tenant/proyecto;
- ficha de NDA con plantilla/version/vigencia/aprobacion/reaceptacion/gate;
- ficha de planes con tipo/version/vigencia/estado/roles/historial/auditRef;
- badges honestos: preparado, pendiente gate, requiere revision, no ejecutado;
- razon obligatoria en cambios criticos;
- estados visibles claros: borrador, en revision, aprobado, activo, pausado, reemplazado, archivado;
- no prometer Make/Gemini/import/pagos/notificaciones reales si el provider/gate no esta activo.

No se pide a Claude tocar backend, contracts, tools, workflows, Firestore/Auth/Storage, Make, Gemini, imports, pagos reales ni datos reales.

## Impacto Academia

Academia debe profundizar:

- configurabilidad por tenant/proyecto;
- diferencia entre plantilla NDA, version NDA, aceptacion y reaceptacion;
- inmutabilidad de aceptaciones ya presentadas;
- tipos de planes;
- estados de planes;
- gates y revision humana;
- auditRef y trazabilidad;
- prepared/preview no equivale a ejecutado;
- provider preparado no equivale a provider activo.

## Clasificacion

- Reusable CXOrbia: si. Patron de administrabilidad multi-tenant, versionado, roles, gates y auditoria.
- Exclusivo cliente: no. No se hardcodea TyA/Cinepolis.
- Claude/prototipo: si. Requiere UI administrable y copy honesto futuro.
- Academia: si. Requiere cursos/manuales profundos para NDA, planes, configuraciones y gates.
- Sin impacto Claude: parcialmente. El contrato no toca UI, pero genera pendientes claros para Claude.

## Estado seguro

- Sin cambios en `/app/modules`.
- Sin cambios en `/app/core`.
- Sin deploy.
- Sin produccion.
- Sin runtime real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes reales.
- Sin Make/Gemini real.
- Sin correos/WhatsApp reales.
- Sin pagos reales.
- Sin import real.
- Sin datos sensibles en repo.
