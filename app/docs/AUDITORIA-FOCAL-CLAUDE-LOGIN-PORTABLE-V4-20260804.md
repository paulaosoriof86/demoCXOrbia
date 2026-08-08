# Auditoría focal · Claude Login portable v4 · Gravicentra CX

**Fecha:** 2026-08-04  
**Paquete auditado:** `Prototype development request (20).zip`  
**SHA-256 del ZIP:** `862e415df3d3a24be09ffbd48cb74f98779a59d2a2265587969c1880b48841c9`  
**Baseline canónica:** repo `paulaosoriof86/demoCXOrbia`, rama `docs-tya-v6-v71-audit`, PR #7 draft/open/no merge  
**Decisión:** `HOLD_CLAUDE_LOGIN_PORTABLE_V4__NOT_READY_FOR_APPLY_DELTA_DIRECTLY`

## 1. Alcance

Esta es una auditoría focal del paquete frontend portable. No se abrió una segunda auditoría forense general.

El árbol canónico continúa preservado y el gate source/static confirmó 53/53 blobs críticos exactos.

## 2. Archivos del paquete

El paquete contiene:

- `src/Login.jsx`;
- `src/Login.css`;
- `src/gravicentra-tokens.css`;
- `src/i18n.js`;
- `src/flags.jsx`;
- `adapters/cliente-preview-button.js`;
- `docs/ESPEC-FICHA-SHOPPER.md`;
- `docs/INVENTARIO-REFERENCIAS-MARCA.md`;
- previews y harness.

No contiene backend, Auth real, adapter HR, `data.js`, módulos legacy ni deploy.

## 3. Hallazgos positivos

### Rebranding portable

PASS:

- producto visible `Gravicentra CX`;
- tenant/consultora separado de la marca producto;
- franja superior dinámica;
- órbita y textos ES/EN;
- inventario que preserva identificadores técnicos.

Esto no significa que el árbol canónico ya esté rebrandeado.

### Seguridad presentacional

PASS estático:

- no usa `localStorage` ni `sessionStorage`;
- no construye URLs con PII/rol;
- no contiene endpoint o Auth inventado;
- usuario `type="text"` y contraseña `type="password"`;
- entrega datos únicamente mediante callback;
- no muestra contraseñas de ejemplo;
- FAB usa `textContent`, Escape y focus trap.

### Sintaxis

PASS de parseo para:

- `src/Login.jsx`;
- `src/flags.jsx`;
- `src/i18n.js`;
- `adapters/cliente-preview-button.js`.

## 4. Bloqueos de integración

### 4.1 Evidencia móvil inválida

`docs/preview-mobile.png` mide `924 × 540`, igual que el preview desktop. No demuestra un viewport móvil real.

Se requiere evidencia real en:

- `390 × 844`;
- `412 × 915`;
- tablet vertical;
- desktop.

La evidencia debe mostrar franja, órbita, banderas, formulario utilizable y cero solapamientos.

### 4.2 Banderas del tenant

Corrección de criterio:

- las banderas del Login representan los países configurados para el tenant;
- deben recibirse dinámicamente mediante `props`;
- deben mostrarse todas;
- no deben hardcodearse;
- no deben convertirse en selector operativo, multiselect, permisos ni scopes;
- no corresponde exigir `+N`, búsqueda o `Todos mis países` en el Login.

El paquete debe demostrar comportamiento responsive con tenants de 1, 2, 8 y 12 países.

### 4.3 Token CSS indefinido

`Login.css` consume `--gcx-navy-2`, pero `gravicentra-tokens.css` no lo define.

Debe definirse o sustituirse por un token existente y agregarse una comprobación de tokens usados/definidos.

### 4.4 Baseline obsoleta en README

El README fija un HEAD histórico. Un paquete portable no decide el destino de integración.

Debe usar:

`TARGET_HEAD_RESOLVED_BY_CHATGPT_AT_INTEGRATION_TIME`.

### 4.5 No es candidata acumulativa completa

El paquete es frontend portable. No contiene ruta canónica, integración de sesión ni conexión con el entrypoint actual.

Eso no es trabajo de Claude; será resuelto por ChatGPT durante el empalme.

Por tanto, el paquete no puede sustituir directamente el frontend actual.

## 5. Cobertura del trabajo frontend

| Entregable frontend | Estado |
|---|---|
| Login React presentacional | Entregado |
| Tokens CSS | Entregado con token indefinido |
| i18n ES/EN | Entregado |
| Órbita y branding | Entregado; evidencia móvil pendiente |
| FAB comercial | Entregado portable |
| Banderas del tenant | Deben quedar dinámicas y responsive |
| Mockup ficha shopper | Entregado como especificación |
| Inventario de rebranding visible | Entregado como propuesta, no aplicado |

## 6. Separación de responsabilidades

### Claude

- diseño y código frontend portable;
- responsive;
- órbita;
- branding;
- banderas dinámicas;
- tokens;
- i18n;
- accesibilidad;
- previews y pruebas visuales.

### ChatGPT

- integración con la plataforma;
- autenticación;
- permisos;
- datos;
- backend;
- runtime;
- DEV, freeze y producción.

Claude no debe resolver ni documentar técnicamente esos componentes de integración.

## 7. Decisión de empalme

```text
HOLD_CLAUDE_LOGIN_PORTABLE_V4__NOT_READY_FOR_APPLY_DELTA_DIRECTLY
```

Persisten:

1. evidencia móvil inválida;
2. banderas todavía no demostradas como dinámicas y responsive;
3. token CSS indefinido;
4. README con HEAD histórico;
5. falta del paquete corregido con manifest de hashes.

No se aplicó ningún archivo del paquete a `app/`.

## 8. Siguiente acción exacta

Claude debe devolver un único paquete frontend corregido con:

- órbita visible en móvil;
- todas las banderas del tenant visibles;
- tokens completos;
- capturas reales desktop/tablet/móvil;
- README sin HEAD fijo;
- manifest de archivos y hashes.

Después ChatGPT realizará una única auditoría del delta y, únicamente con GO y sin P0, integrará el componente a la plataforma canónica.

## 9. Estado seguro

- archivos funcionales `app/` modificados por esta auditoría: 0;
- deploy: 0;
- provider writes: 0;
- merge: false;
- producción: intacta.
