# P0 visual configurability NO GO TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Resultado de revisión visual de Paula

La HR viva multihoja ya se lee y despliega en DEV, pero la integración visual/configurable no está lista para Phase A operativa.

Resultado: `NO_GO_VISUAL_CONFIGURABILITY`.

## Hallazgos P0

1. El proyecto debe ser `Cinépolis`, no `Cinépolis Junio 2025`, `Cinépolis Julio 2026` ni variantes con periodo.
2. El selector de proyecto está mostrando periodos; debe mostrar solo proyectos.
3. El selector de periodo existe en sidebar y dashboard, pero no comparte estado correctamente.
4. Los KPIs del dashboard están acumulando todos los periodos cuando deben filtrar por el periodo seleccionado.
5. El periodo visible en texto y el periodo seleccionado pueden quedar desincronizados.
6. La URL/fuente de HR debe quedar registrada en datos de proyecto como si se hubiera creado manualmente desde plataforma.
7. El logo configurado del tenant/proyecto no se propaga al topbar ni al login.
8. El login muestra doble título y no está usando correctamente la identidad visual del cliente/tenant.
9. Las banderas del login deben derivarse de países configurados en tenant/proyecto; no deben estar hardcodeadas.
10. Shoppers aparecen como genéricos/protegidos; eso es correcto para preview público, pero la ficha completa real requiere Auth/roles backend protegido.

## Corrección conceptual obligatoria

Modelo correcto:

- Tenant: `TyA`.
- Proyecto: `Cinépolis`.
- Periodo: derivado de tabs válidos de la HR viva multihoja.
- HR source: dato de configuración del proyecto, visible como referencia protegida/masked en UI administrativa.
- Países: datos configurados del tenant/proyecto, no banderas hardcodeadas.
- Marca: configuración del tenant, aplicada a login, topbar, sidebar, portal cliente y exports.

## Archivos agregados en este bloque

- `backend/contracts/phase-a-tenant-project-config-from-platform-v1.json`
- `backend/config/tya-phase-a-platform-project-config.source-safe.json`

## Estado del contrato/config

Se registró configuración source-safe para representar que TyA y Cinépolis fueron configurados desde plataforma:

- tenant `tya`;
- proyecto `cinepolis`;
- HR source live multitab;
- spreadsheet masked;
- países GT/HN;
- monedas Q/L;
- cuestionario configurable por proyecto/visita;
- certificaciones preservadas;
- pagos controlados por gate;
- Make/Gemini/HR writeback apagados.

## Lo que NO se debe hacer

No parchar módulos UI para esconder el problema.
No hardcodear periodos en proyectos.
No hardcodear banderas.
No insertar datos personales de shoppers en JS público.
No subir URL privada completa de HR al repo.
No activar producción ni pagos.

## Lo que debe hacer Claude/prototipo

Claude debe ajustar el prototipo para consumir la configuración como fuente:

1. Project selector = proyectos solamente.
2. Period selector = periodos del proyecto seleccionado.
3. Sidebar period y dashboard period = mismo estado.
4. KPIs, listas, shoppers, postulaciones, visitas, liquidaciones y finanzas = filtrados por periodo seleccionado.
5. Identidad de marca = tenant brand config, no fixture visual.
6. Login = un solo título, logo del tenant/cliente, países desde configuración.
7. HR source visible en configuración de proyecto como referencia protegida/masked y editable por admin con gate.
8. Nuevos proyectos TyA deben poder crearse manualmente con la misma estructura.
9. Nuevos tenants deben poder crearse con países, marca, proyectos y fuentes HR propias.
10. Shopper full profile solo debe mostrarse en vista protegida con Auth/roles.

## Impacto backend reusable

Este patrón queda reusable para:

- nuevos proyectos de TyA;
- nuevos tenants;
- futuros clientes de CXOrbia;
- migraciones rápidas sin rehacer lógica por cliente;
- operación multi-proyecto y multi-país.

## Academia

Academia debe explicar:

- diferencia entre tenant, proyecto y periodo;
- cómo se configura una fuente HR;
- por qué una URL/source protegida no se expone completa en repo público;
- cómo se heredan países/banderas/monedas;
- por qué datos completos de shopper requieren Auth/roles;
- cómo validar que KPIs corresponden al periodo elegido.

## Estado seguro

No producción. No merge final. No Firestore writes. No HR writeback. No pagos. No Make/Gemini live. No datos sensibles en repo.
