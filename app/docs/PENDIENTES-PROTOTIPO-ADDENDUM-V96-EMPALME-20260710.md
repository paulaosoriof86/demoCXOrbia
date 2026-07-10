# Pendientes prototipo — addendum V96 empalme

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`

## P0 para Claude

Completar cobertura de permisos por módulo.

Hallazgo: `CX.roleCanAccess()` ya es fail-closed para roles sin matriz, pero si un módulo no tiene categoría en `CX.MOD_CAT`, todavía devuelve `true`. Eso puede exponer módulos administrativos a coordinador/aliado/custom sin permiso explícito.

Módulos a categorizar o proteger con allowlist explícita:

- `administrabilidad`
- `diagnostico`
- `hrsource`
- `saas`
- `novedades`
- `cli_*`

Validación esperada:

- Coordinador/aliado/custom no ve módulos administrativos sin permiso.
- Roles sin matriz solo ven Capacitación/Academia o allowlist segura.
- Super/admin mantienen acceso pleno.
- Cliente y shopper mantienen sus shells propios.

## P1 para Claude

1. Scope cliente multi-proyecto: si una marca tiene varios proyectos, `scopeCliente` no debe aterrizar solo en el primero; usar `scopeProjectIds` o selector restringido.
2. Barrido menor de copy operativo: conectado/vincular/enviar deben decir preparado/preview/gate si no hay backend real.
3. WhatsApp manual `wa.me`: rotular como abrir borrador manual, no envío automático.

## No pedir a Claude

- No reescribir Academia.
- No rehacer HR Source candidates.
- No rehacer scope proyecto/cliente ya logrado.
- No tocar backend/Auth/Firestore/Make/Gemini/pagos reales.
- No convertir TyA/Cinépolis en hardcode.
