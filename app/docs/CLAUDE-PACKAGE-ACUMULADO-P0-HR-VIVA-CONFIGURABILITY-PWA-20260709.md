# Claude package acumulado P0 HR viva configurabilidad PWA TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Entregar a Claude un paquete acumulado completo para corregir la ultima candidata/prototipo sin perder lo trabajado por backend, HR viva, configurabilidad, Academia, reglas replicables, PWA y branding.

Claude debe leer este documento junto con los archivos listados en la seccion `Lectura obligatoria`. No debe trabajar con un solo archivo ni reiniciar metodologia.

## Estado actual sintetico

- DEV URL: `https://cxorbia-backend-dev.web.app`.
- HR viva multihoja lee y despliega datos source-safe.
- Estado visual/configurabilidad: `NO_GO_VISUAL_CONFIGURABILITY`.
- Produccion no autorizada.
- Merge final no autorizado.
- Firestore/Auth/Storage reales no activos.
- HR writeback no activo.
- Make/Gemini/pagos reales no activos.
- Shoppers completos no deben exponerse en JS publico.

## Lectura obligatoria para Claude

Claude debe leer en este orden:

1. `app/docs/00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA.md`.
2. `app/docs/ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`.
3. `app/docs/ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`.
4. `app/docs/BASELINE-AUDITADA-CONTINUIDAD-V91-INCREMENTAL-CXORBIA-20260708.md`.
5. `app/docs/P0-VISUAL-CONFIGURABILITY-NO-GO-TYA-20260709.md`.
6. `app/docs/CLAUDE-P0-PACKAGE-TYA-CONFIGURABILITY-HR-VIVA-20260709.md`.
7. `app/docs/P0-HR-VIVA-MULTITAB-SOURCE-SAFE-DEPLOYED-TYA-20260709.md`.
8. `backend/config/tya-phase-a-platform-project-config.source-safe.json`.
9. `backend/contracts/phase-a-tenant-project-config-from-platform-v1.json`.
10. `app/docs/RESUMEN-ADDENDUM-P0-CONFIGURABILITY-HR-VIVA-TYA-20260709.md`.
11. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-HR-VIVA-CONFIGURABILITY-PWA-20260709.md`.
12. `app/docs/ACADEMIA-IMPACT-HR-VIVA-CONFIGURABILITY-PWA-20260709.md`.
13. `app/docs/CLAUDE-PROMPT-P0-HR-VIVA-CONFIGURABILITY-PWA-20260709.md`.

## Reglas que Claude debe respetar

- Usar la ultima candidata/baseline viva, no versiones anteriores por memoria.
- No reescribir arquitectura ni desmontar modulos aprobados.
- No parchar UI para esconder errores de modelo.
- No hardcodear TyA, Cinépolis, GT, HN, banderas, periodos, logo o HR en componentes visuales.
- Tenant, proyecto, periodo, paises, moneda, branding, HR source, reglas, cuestionario, certificacion, pagos e integraciones deben venir de configuracion.
- Proyecto `Cinépolis` no debe convertirse en `Cinépolis Junio 2025` o `Cinépolis Julio 2026`.
- Periodos se derivan de la HR viva multihoja del proyecto seleccionado.
- Selector de proyecto muestra proyectos. Selector de periodo muestra periodos. Ambos comparten estado con sidebar/dashboard.
- KPIs, listas, postulaciones, visitas, shoppers, liquidaciones y finanzas filtran por periodo seleccionado.
- Login debe tener un solo titulo y usar logo/brand del tenant/cliente configurado.
- Favicon e iconos PWA deben usar el branding del tenant/cliente con fallback CXOrbia.
- PWA debe detectar dispositivo/navegador y mostrar instalacion guiada; no prometer instalacion silenciosa si el navegador no lo permite.
- Banderas del login y del UI salen de paises configurados del tenant/proyecto.
- Shoppers completos requieren Auth/roles; en preview publico solo referencias protegidas/source-safe.
- No exponer URL completa privada de HR ni workbook crudo en repo/UI publica.

## P0 que Claude debe corregir

### 1. Tenant/proyecto/periodo

Estado correcto:

- Tenant: `TyA`.
- Proyecto: `Cinépolis`.
- Periodo: tabs validos de HR viva (`JUNIO 25`, `JUNIO 25 HN`, ..., `JULIO 26`, `JULIO 26 HN`).
- Proyecto selector: proyectos solamente.
- Period selector: periodos del proyecto.
- Sidebar period y dashboard period: mismo estado.

### 2. KPIs por periodo

Los KPIs no deben acumular todos los periodos salvo que el usuario elija explicitamente `Todos los periodos`.

Por defecto debe mostrar el periodo seleccionado.

### 3. Configuracion de proyecto visible

El proyecto debe mostrar como configuracion editable/controlada:

- nombre del proyecto;
- paises;
- monedas;
- HR source tipo Google Sheets live multitab;
- spreadsheet masked/reference, no URL completa privada;
- tabs detectados;
- reglas de visita/agendamiento/reprogramacion/cancelacion;
- cuestionario por proyecto/visita;
- certificacion asociada;
- pagos/liquidaciones con gate;
- integraciones HR/Make/Gemini apagadas hasta GO.

Esto debe verse como si el proyecto hubiera sido creado manualmente desde plataforma.

### 4. Branding, logo, favicon y PWA

- Logo del tenant/cliente se usa en login, topbar, sidebar, portal cliente y PWA.
- Favicon debe ser el del cliente/tenant cuando exista.
- Manifest PWA debe apuntar a iconos del cliente/tenant o assets generados desde brand config.
- Instalacion PWA debe detectar tipo de dispositivo/navegador y mostrar CTA correcta.
- En navegadores compatibles, usar evento instalable cuando exista; si no, instrucciones especificas por dispositivo.
- No dejar logo CXOrbia como unico favicon cuando hay marca de cliente.
- No duplicar titulo del login.

### 5. Academia

Academia debe tener contenido actualizado sobre:

- diferencia tenant/proyecto/periodo;
- configuracion de HR viva;
- por que HR source queda masked;
- paises/banderas/monedas desde configuracion;
- PWA, favicon, iconos y branding por tenant;
- diferencia preview publico vs Auth/roles;
- datos completos de shopper solo en vista protegida;
- lectura de KPIs por periodo;
- GO/NO GO visual.

### 6. Replicable CXOrbia

Todo debe quedar reusable para:

- nuevos proyectos TyA;
- nuevos tenants;
- futuros clientes CXOrbia;
- otras HR multihoja;
- otros paises y monedas;
- otros cuestionarios y certificaciones.

## Criterios de aceptacion

GO solo si:

- TyA aparece como tenant.
- Cinépolis aparece como proyecto unico.
- Periodos aparecen en selector de periodo, no como proyectos.
- KPIs cambian correctamente por periodo.
- Sidebar/dashboard comparten periodo.
- Configuracion de proyecto muestra HR source masked y editable con gate.
- Logo/brand configurado aparece en login/topbar/sidebar/PWA.
- Favicon/PWA icon usan cliente/tenant con fallback seguro.
- Banderas salen de paises configurados.
- No hay datos personales reales de shoppers en preview publico.
- Academia incluye los temas anteriores.
- No se rompen modulos existentes.

NO GO si:

- el proyecto sigue mezclado con periodo;
- periodos no cambian KPIs;
- los KPIs acumulan todo sin seleccion explicita;
- login tiene doble titulo;
- favicon/PWA sigue fijo en CXOrbia cuando hay logo cliente;
- banderas estan hardcodeadas;
- HR source no es dato visible/configurable del proyecto;
- se exponen shoppers reales sin Auth/roles;
- se promete Make/Gemini/pagos/import/produccion sin gate.

## Estado seguro

Este paquete es handoff documental. No autoriza produccion, merge final, pagos, writeback HR, Make/Gemini live ni exposicion de datos sensibles.
