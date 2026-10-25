# Claude package prototipo generico full backend flujos academia

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Entregar a Claude un paquete generico completo para el prototipo CXOrbia, sin contaminarlo con un tenant, cliente o proyecto especifico, pero si incluyendo todo lo replicable trabajado en backend, reglas, flujos, configuracion, Academia, PWA y branding.

Este paquete reemplaza como handoff de prototipo al paquete generico corto y al paquete cliente-especifico. El paquete cliente-especifico queda solo para el carril de migracion del cliente actual y no debe usarse como instruccion directa del prototipo general.

## Regla antisesgo

Claude no debe hardcodear nombres de tenants, clientes, proyectos, paises, periodos, logos, URLs de fuentes, monedas, cuestionarios, certificaciones, pagos o integraciones.

Todo debe provenir de configuracion generica y reusable.

## Capas que debe contemplar el prototipo

1. Tenant config.
2. Project config.
3. Period config.
4. Country/currency config.
5. Brand/PWA config.
6. HR/source config.
7. Questionnaire config.
8. Certification config.
9. Visit lifecycle config.
10. Assignment/reservation/postulation config.
11. Shopper profile config.
12. Settlement/payment config.
13. Notification templates/outbox config.
14. Integration gates config.
15. Auth/roles/permissions config.
16. Audit/reviewQueue config.

## Backend replicable acumulado que Claude debe reflejar

Aunque Claude trabaje prototipo/UI, debe reflejar estos contratos backend como estados configurables, no como promesas reales:

- base nueva y limpia por tenant/proyecto;
- `CX.data` mantiene interfaz estable y cambia por un unico punto de switch;
- adapters backend preparados pero no activados sin gate;
- HR/source viva multihoja o fuente equivalente configurada por proyecto;
- import historico primero dry-run/source-safe;
- datos sensibles excluidos de preview publico;
- datos completos solo con Auth/roles;
- reviewQueue para conflictos;
- auditEvents para acciones y cambios de reglas;
- assignment sync con llaves estables, no dedupe visual;
- Make/Gemini/proveedores solo con gate;
- pagos/liquidaciones con estado y gate, no pago real en preview;
- rollback/disable path visible;
- GO/NO GO por carril.

## Flujos operativos genericos que deben existir en prototipo

- Crear tenant.
- Configurar tenant: paises, monedas, marca, roles, modulos, integraciones.
- Crear proyecto dentro del tenant.
- Configurar fuente viva del proyecto como referencia masked.
- Detectar/administrar periodos del proyecto.
- Configurar cuestionario por proyecto o visita.
- Configurar certificacion asociada.
- Configurar reglas de agendamiento, reprogramacion, cancelacion y restriccion.
- Gestionar postulaciones, reservas, asignaciones y conflictos.
- Ver visitas y KPIs por periodo.
- Ver shoppers source-safe en preview y completo solo con Auth/roles.
- Administrar liquidaciones/lotes/pagos con gates.
- Configurar notificaciones y outbox.
- Configurar integraciones con gates apagados hasta autorizacion.
- Ver readiness, diagnostico, reviewQueue y auditEvents.

## P0 visual/configurable acumulado

- Project selector muestra proyectos, no periodos.
- Period selector muestra periodos del proyecto seleccionado.
- Sidebar period y dashboard period comparten estado.
- KPIs/listas/visitas/postulaciones/shoppers/liquidaciones/finanzas filtran por periodo.
- Acumulado historico solo si el usuario elige explicitamente `Todos los periodos`.
- HR/source visible en configuracion del proyecto como masked/reference.
- Branding alimenta login, topbar, sidebar, portal cliente, exports, favicon y PWA.
- PWA detecta dispositivo/navegador y muestra CTA/instrucciones correctas.
- Banderas y monedas salen de paises configurados.
- Login tiene un solo titulo.
- No se exponen datos sensibles en preview publico.

## Academia generica obligatoria

Academia debe explicar por rol y con checklists:

- tenant vs proyecto vs periodo;
- configuracion de tenant;
- configuracion de proyecto;
- fuente viva/multihoja o equivalente;
- source masked y seguridad;
- periodos y KPIs;
- branding, favicon y PWA;
- paises, banderas y monedas;
- preview publico vs Auth/roles;
- shoppers completos protegidos;
- import dry-run/source-safe;
- reviewQueue y auditEvents;
- gates de Make/Gemini/pagos/writeback;
- GO/NO GO y rollback.

## Criterios GO para Claude

GO solo si:

- no quedan nombres cliente/proyecto hardcodeados;
- project selector no mezcla periodos;
- period selector filtra datos;
- sidebar/dashboard comparten estado;
- configuracion de proyecto muestra source masked;
- modelo permite nuevos tenants y proyectos manuales;
- branding/favicons/PWA salen de configuracion;
- banderas/monedas salen de configuracion;
- Academia queda actualizada;
- integraciones/pagos/imports se muestran como gate-off si no estan activos;
- preview publico no expone datos sensibles.

## NO GO para Claude

NO GO si:

- aparecen nombres reales como parte fija del prototipo;
- periodos aparecen como proyectos;
- KPIs acumulan todo sin seleccion explicita;
- login duplica titulo o ignora brand config;
- favicon/PWA queda fijo cuando hay marca configurada;
- banderas estan hardcodeadas;
- fuente viva no es configurable desde proyecto;
- se exponen datos sensibles en preview publico;
- se prometen integraciones reales sin gate;
- no se actualiza Academia.

## Estado seguro

Este paquete es para Claude/prototipo. No autoriza produccion, merge final, pagos, writeback, Make/Gemini live, import real definitivo ni exposicion de datos sensibles.