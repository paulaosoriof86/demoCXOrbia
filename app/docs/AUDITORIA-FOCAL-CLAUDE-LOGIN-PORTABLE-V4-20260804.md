# Auditoría focal · Claude Login portable v4 · Gravicentra CX

**Fecha:** 2026-08-04  
**Paquete auditado:** `Prototype development request (20).zip`  
**SHA-256 del ZIP:** `862e415df3d3a24be09ffbd48cb74f98779a59d2a2265587969c1880b48841c9`  
**Baseline canónica:** repo `paulaosoriof86/demoCXOrbia`, rama `docs-tya-v6-v71-audit`, PR #7 draft/open/no merge  
**Decisión:** `HOLD_CLAUDE_LOGIN_PORTABLE_V4__NOT_READY_FOR_APPLY_DELTA_DIRECTLY`

## 1. Alcance y relación con la auditoría forense integral

No se abrió una segunda auditoría forense general. Esta revisión es una auditoría focal de delta contra:

- el manifest final Phase A;
- las 29 autoridades cerradas;
- la selección quirúrgica Emergent;
- `RESUMEN-PARA-CLAUDE.md`;
- `PENDIENTES-PROTOTIPO.md`;
- el contrato multi-país/multirol;
- los gates de Auth, HR, Finanzas, reportes y composición.

Una nueva auditoría forense general solo sería necesaria si:

1. cambia el árbol funcional canónico fuera de un delta autorizado;
2. aparece una fuente contradictoria con el source lock;
3. se demuestra un P0 nuevo que invalide la autoridad actual;
4. se propone sustituir Firebase/CX.data/HR/Finanzas por otra arquitectura.

Ninguna de esas condiciones ocurrió. El gate source/static acumulativo verificó 53/53 blobs críticos exactos y repositorio sin delta después de la ejecución.

## 2. Archivos del paquete

El paquete contiene 12 archivos:

- `src/Login.jsx`;
- `src/Login.css`;
- `src/gravicentra-tokens.css`;
- `src/i18n.js`;
- `src/flags.jsx`;
- `adapters/cliente-preview-button.js`;
- `docs/ESPEC-FICHA-SHOPPER.md`;
- `docs/INVENTARIO-REFERENCIAS-MARCA.md`;
- previews y harness.

No contiene backend, Auth real, adapter HR, `data.js`, módulos legacy ni deploy. Esto respeta el STOP de trabajo portable.

## 3. Hallazgos positivos

### 3.1 Rebranding portable

PASS en el paquete portable:

- producto visible `Gravicentra CX`;
- tenant/consultora separado de la marca producto;
- franja superior dinámica;
- órbita y textos ES/EN;
- inventario que preserva `window.CX`, `CX.*`, constantes `CXORBIA_*`, storage keys, IDs técnicos y rutas.

Esto no significa que el árbol canónico ya esté rebrandeado. El propio inventario declara que los cambios del árbol canónico son propuestos y no aplicados.

### 3.2 Seguridad del componente presentacional

PASS estático:

- no usa `localStorage` ni `sessionStorage`;
- no construye URLs con PII/rol;
- no contiene endpoint/Auth inventado;
- usuario `type="text"` y contraseña `type="password"`;
- entrega credenciales únicamente mediante callback;
- no muestra contraseñas de ejemplo;
- FAB usa `textContent`, Escape y focus trap.

### 3.3 Sintaxis

PASS de parseo para:

- `src/Login.jsx`;
- `src/flags.jsx`;
- `src/i18n.js`;
- `adapters/cliente-preview-button.js`.

## 4. Bloqueos de integración

### 4.1 Evidencia móvil inválida

`docs/preview-mobile.png` mide `924 × 540`, exactamente el mismo tamaño que el preview desktop. No es una captura móvil reproducible.

Por tanto, la afirmación de que el responsive móvil fue verificado no está sustentada. El CSS intenta mantener la órbita visible, pero falta evidencia real en al menos:

- `390 × 844`;
- `412 × 915`;
- tablet vertical.

La evidencia debe mostrar franja, órbita completa, formulario utilizable y cero solapamientos.

### 4.2 Selector multi-país no cumple el contrato

El README afirma que con más de tres países aparece `Todos los países`, pero `Login.jsx`:

- mantiene un único estado escalar `country`;
- renderiza todos los países como chips;
- no implementa `Todos mis países`;
- no implementa `+N`;
- no implementa búsqueda;
- no implementa multiselección;
- no implementa recientes, regiones, vistas guardadas ni comparación máxima de tres.

Con 10–12 países se vuelve extenso y no cumple la arquitectura multi-país aprobada.

### 4.3 Token CSS indefinido

`Login.css` consume `--gcx-navy-2` en:

- logo tenant;
- icono del rol Admin.

`gravicentra-tokens.css` no define ese token. Debe definirse o sustituirse por un token existente. No se acepta fallback silencioso.

### 4.4 Baseline obsoleta en README

El README fija HEAD `3be7763`, pero la rama viva ya avanzó. Un paquete portable no debe fijar un HEAD histórico como si fuera el destino de integración. Debe declarar:

`TARGET_HEAD_RESOLVED_BY_CHATGPT_AT_INTEGRATION_TIME`.

### 4.5 No es una candidata acumulativa completa

El propio README indica que no es candidata. No contiene:

- ruta React canónica;
- bridge Firebase Auth;
- no-flash/single-login;
- logout y revocación;
- integración con claims/scopes;
- carga desde `index-backend-dev.html`;
- build-lock/service worker;
- gates runtime;
- rebranding visible del árbol canónico.

Por ello no puede empalmarse como candidata completa ni sustituir el frontend actual.

## 5. Cobertura contra el trabajo permitido a Claude

| Entregable Claude | Estado |
|---|---|
| Login React presentacional | Entregado |
| Tokens CSS | Entregado con token indefinido |
| i18n ES/EN | Entregado |
| Órbita y branding | Entregado; evidencia móvil pendiente |
| FAB comercial | Entregado portable |
| Selector multi-país | Incompleto frente al contrato aprobado |
| Mockup ficha shopper | Entregado como especificación, no implementación |
| Inventario de rebranding visible | Entregado como propuesta, no aplicado |

## 6. Asuntos que no corresponden a Claude

Permanecen bajo responsabilidad de ChatGPT/backend/integración:

- Firebase Auth y claims;
- safe bridge de sesión;
- scopes tenant/proyecto/país;
- `CX.data` y adapters;
- HR viva;
- Finanzas y pagos;
- report kit;
- overlay A+B superseded;
- runtime multirol;
- agosto/disponibles/postulaciones;
- deploy DEV, freeze y producción.

No se debe pedir a Claude que resuelva esos puntos dentro del paquete visual.

## 7. Decisión de empalme

```text
HOLD_CLAUDE_LOGIN_PORTABLE_V4__NOT_READY_FOR_APPLY_DELTA_DIRECTLY
```

No existe autorización técnica para copiarlo al árbol canónico mientras persistan:

1. evidencia móvil inválida;
2. selector multi-país incompleto;
3. token CSS indefinido;
4. baseline obsoleta;
5. ausencia del contrato de integración seguro.

No se aplicó ningún archivo del paquete a `app/`.

## 8. Siguiente acción exacta

Claude debe devolver un delta portable corregido, sin tocar GitHub, con:

- token CSS completo;
- selector 1 / 2–3 / 4–12+ países;
- capturas reales desktop/tablet/móvil;
- prueba de órbita visible y formulario usable;
- README sin HEAD fijo;
- manifest de archivos y hashes.

Después ChatGPT hará una única auditoría de delta y, únicamente con GO y sin P0, integrará el componente mediante el bridge Firebase/Auth canónico y ejecutará gates antes de DEV.

## 9. Estado seguro

- archivos funcionales `app/` modificados por esta auditoría: 0;
- deploy: 0;
- provider writes: 0;
- merge: false;
- producción: intacta.
