# Paquete acumulado genérico para Claude — prototipo CXOrbia

Fecha: 2026-07-10  
Alcance: prototipo/frontend comercializable, multi-tenant y sin contenido exclusivo de clientes o proyectos.

## Entrega preparada

Se generó un paquete descargable acumulado con:

- auditoría forense de la candidata actual;
- pendientes completos priorizados P0/P1/P2;
- modificaciones locales que deben consolidarse en módulos canónicos;
- patrones reutilizables de producto derivados de contratos backend;
- reglas multi-tenant y contrato estable `CX.data`;
- impacto transversal en Academia, manuales, rutas por rol y notificaciones;
- criterios de aceptación y pruebas;
- prompt acumulado para Claude;
- manifest de trazabilidad y hashes SHA-256.

Artifact local entregable:

- `PAQUETE-CLAUDE-PROTOTIPO-CXORBIA-ACUMULADO-20260710.zip`
- SHA-256: `f1ea011a588bd6409944e84b2cca93c48435bcc5492878e76d55953ce7f9a2c4`

## Auditoría de la candidata

- 100 archivos totales;
- 63 archivos JavaScript;
- 63 scripts cargados por `index.html`;
- 0 scripts locales faltantes;
- 0 scripts duplicados;
- 0 errores de sintaxis JavaScript;
- 48 módulos registrados y 48 IDs únicos;
- 0 IDs de módulo duplicados;
- smoke automatizado sobre seis perfiles sin hard fail;
- una advertencia pendiente de validación: alcance visible del rol personalizado.

La candidata actual se conserva como baseline viva. Los cambios posteriores al source lock fueron revisados para recuperar únicamente impactos reutilizables de producto; no se autoriza reconstrucción desde cero ni regresión a una candidata anterior.

## Hallazgos prioritarios incluidos

1. Separar de forma mutuamente excluyente los modos `demo`, `source_safe_preview` y `connected`.
2. Mantener un solo punto de binding mediante `CX.data`.
3. Evitar fallbacks demo silenciosos cuando se usa preview source-safe.
4. Retirar llamadas reales a proveedores desde módulos UI y usar adaptadores/gates.
5. Consolidar patches locales dentro de módulos canónicos, sin wrappers u observers redundantes.
6. Corregir copy en los módulos fuente y retirar el monkey patch global de cadenas.
7. Mantener separación estable entre tenant, proyecto y periodo.
8. Aplicar permisos y scopes antes de exponer datos o renderizar acciones.
9. Representar pagos, liquidaciones, conflictos, sincronizaciones e imports con estados honestos.
10. Mantener Academia profunda, editable, versionada, auditable y conectada transversalmente a cambios de módulos.

## Neutralidad verificada

El paquete descargable fue escaneado para impedir nombres de clientes, proyectos, personas, países concretos, URLs privadas, secretos y datos sensibles. El resultado fue limpio.

Toda configuración específica debe resolverse fuera del prototipo base mediante tenant/proyecto y contratos/adaptadores. Claude no debe hardcodear clientes, proyectos, países, monedas, fuentes o reglas exclusivas.

## Límites para Claude

Claude puede trabajar únicamente dentro de `app/`. No debe tocar `backend/`, `tools/`, `.github/workflows/`, reglas reales, secretos, datos reales, adapters de proveedor ni artifacts.

La entrega de Claude debe incluir candidata completa, changelog por archivo, diff de agregados/eliminados/modificados, validaciones, pendientes exactos y confirmación de neutralidad multi-tenant.

## Clasificación

- **Reusable CXOrbia:** modos de datos, `CX.data`, permisos, outbox, gates, revisión humana, versionado, rollback, PWA y Academia transversal.
- **Exclusivo cliente:** excluido del paquete.
- **Claude/prototipo:** binding genérico, consolidación de patches, copy honesto, permisos, source-safe, finanzas, conflictos y Academia.
- **Academia:** manuales, cursos, checklists, glosario, rutas por rol, notificaciones y versiones.
- **Sin impacto Claude:** secretos, runs, credenciales, infraestructura y acciones reales de proveedores.