# Claude package prototipo generico HR viva configurabilidad PWA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Entregar a Claude un paquete generico para el prototipo CXOrbia, sin contaminarlo con un tenant, cliente o proyecto especifico.

Este paquete reemplaza como handoff de prototipo al paquete cliente-especifico anterior. El paquete anterior sirve para el carril de migracion del cliente actual, pero no debe usarse como instruccion directa para el prototipo general.

## Regla antisesgo

Claude no debe hardcodear nombres de tenants, clientes, proyectos, paises, periodos, logos, URLs de HR, monedas, cuestionarios, certificaciones, pagos o integraciones.

Todo lo reusable debe implementarse como configuracion generica:

- tenant config;
- project config;
- period config;
- country config;
- currency config;
- brand config;
- HR/source config;
- questionnaire config;
- certification config;
- payment/liquidation config;
- integration gates.

## Lectura obligatoria

Claude debe leer:

1. `app/docs/00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA.md` para reglas de continuidad y prototipo manda.
2. `app/docs/ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md` para patron reusable.
3. `app/docs/BASELINE-AUDITADA-CONTINUIDAD-V91-INCREMENTAL-CXORBIA-20260708.md` para baseline viva.
4. `app/docs/P0-VISUAL-CONFIGURABILITY-NO-GO-TYA-20260709.md` solo como fuente de hallazgos abstractos, no para copiar nombres cliente/proyecto.
5. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-GENERICO-HR-VIVA-CONFIGURABILITY-PWA-20260709.md`.
6. `app/docs/ACADEMIA-IMPACT-GENERICO-HR-VIVA-CONFIGURABILITY-PWA-20260709.md`.
7. `app/docs/CLAUDE-PROMPT-PROTOTIPO-GENERICO-HR-VIVA-CONFIGURABILITY-PWA-20260709.md`.

## Pendientes genericos para prototipo

### Tenant / Proyecto / Periodo

- Selector de tenant o contexto SaaS debe alimentar proyectos.
- Selector de proyecto debe mostrar solo proyectos.
- Selector de periodo debe mostrar periodos del proyecto elegido.
- Sidebar y dashboard deben usar el mismo estado de periodo.
- KPIs/listas/visitas/postulaciones/shoppers/liquidaciones/finanzas filtran por periodo.
- Acumulado historico solo si el usuario elige explicitamente `Todos los periodos`.

### HR/source config

- Cada proyecto puede tener una fuente viva configurable.
- La fuente puede ser Google Sheets multihoja u otra fuente futura.
- La referencia de fuente debe mostrarse como masked/reference, no como URL privada completa.
- Los tabs/periodos detectados deben verse en configuracion.
- Nuevos proyectos deben poder crearse manualmente con esa misma estructura.

### Branding / PWA

- Logo, favicon, manifest PWA, iconos, colores, nombre visible y short_name deben venir de brand config.
- Si no hay brand config, usar fallback CXOrbia.
- No dejar favicon fijo en CXOrbia cuando hay marca de cliente.
- Login, topbar, sidebar, portal cliente y exports usan la misma marca configurada.
- PWA debe detectar dispositivo/navegador y mostrar CTA/instrucciones correctas.
- No prometer instalacion silenciosa si el navegador no la permite.

### Paises / Banderas / Monedas

- Las banderas y monedas salen de configuracion de tenant/proyecto.
- Si cambia la lista de paises, cambia la UI.
- No hardcodear paises ni banderas.

### Shoppers / datos protegidos

- Preview publico solo muestra datos source-safe.
- Perfil completo de shopper requiere Auth/roles.
- No exponer telefono, correo, DPI, banco, direccion, URL privada de fuente ni workbook crudo.

## Criterios GO prototipo

GO solo si:

- No hay nombres cliente/proyecto hardcodeados.
- Project selector no mezcla periodos.
- Period selector filtra KPIs y listas.
- Sidebar/dashboard comparten estado.
- Configuracion de proyecto permite fuente viva masked.
- Branding alimenta login/topbar/sidebar/favicon/PWA.
- Banderas salen de configuracion de paises.
- Academia explica la logica generica.
- No se prometen integraciones reales sin gate.

## NO GO prototipo

NO GO si:

- Aparecen nombres de cliente/proyecto como parte fija del prototipo.
- Periodos aparecen como proyectos.
- KPIs acumulan todo sin seleccion explicita.
- Login duplica titulo o ignora brand config.
- Favicon/PWA queda fijo en CXOrbia cuando hay marca configurada.
- Banderas estan hardcodeadas.
- Fuente viva no es configurable desde proyecto.
- Se exponen datos sensibles en preview publico.

## Estado seguro

Este paquete es para Claude/prototipo. No autoriza produccion, merge final, pagos, HR writeback, Make/Gemini live, ni datos sensibles.