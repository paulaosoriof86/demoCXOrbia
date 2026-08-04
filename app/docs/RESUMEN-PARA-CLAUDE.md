# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-04  
**Estado frontend:** `CLAUDE_PORTABLE_V4_CORRECTION_IN_PROGRESS__NOT_INTEGRATED`

## 1. Responsabilidad de Claude

Claude trabaja únicamente sobre el paquete frontend portable `gravicentra-login-portable`.

Debe corregir acumulativamente:

- Login React presentacional;
- órbita y fidelidad visual;
- responsive real desktop/tablet/móvil;
- branding dinámico del tenant;
- banderas de todos los países recibidos por props;
- tokens CSS;
- i18n;
- accesibilidad;
- FAB portable;
- ficha shopper como especificación;
- inventario visual de marca;
- capturas y manifest de hashes.

Fuente vigente:

`PROMPT-CLAUDE-CORRECCION-LOGIN-PORTABLE-V4-20260804.md`.

## 2. Países en el Login

Las banderas representan cobertura del tenant.

Claude debe:

- recibir `countries` mediante props;
- mostrar todos los países recibidos;
- no hardcodear países;
- no usar `+N`;
- no implementar multiselect;
- no exigir selección de país;
- mantener banderas visibles y responsive.

Permisos, monedas, scopes y reglas no corresponden al paquete frontend.

## 3. Trabajo que no corresponde a Claude

No tocar ni resolver:

- GitHub o PR #7;
- Firebase Auth;
- claims o memberships;
- `CX.data`;
- HR;
- Finanzas;
- report kit;
- adapters canónicos;
- módulos legacy;
- backend;
- runtime multirol;
- deploy, freeze o producción.

## 4. Estado de integración

El paquete actual no ha sido integrado.

ChatGPT continúa en paralelo con:

- runtime multirol;
- autoridad HR dinámica;
- acceso Cliente DEV;
- bridge seguro de integración;
- gates y DEV.

El bloqueo runtime actual no modifica el alcance frontend de Claude.

## 5. Entrega esperada de Claude

Un único ZIP acumulativo con:

- archivos frontend corregidos;
- `MANIFEST.json` con path, bytes y SHA-256;
- capturas reales `390×844`, `412×915`, `768×1024` y `1440×900`;
- escenarios de 1, 2, 8 y 12 países;
- reporte de tokens;
- reporte responsive;
- resumen por archivo.

Claude no debe afirmar integración, GO, deploy ni producción.
