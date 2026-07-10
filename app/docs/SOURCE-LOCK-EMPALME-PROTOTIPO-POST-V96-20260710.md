# Source lock y empalme — Prototipo CXOrbia post-V96

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Decisión

La candidata recibida como `Prototype development request.zip`, posterior a V96, queda como source lock operativo actualizado para continuar empalme backend/documentación.

No se declara GO de producción real.

## Base auditada

- Candidata post-V96 contra V96 source lock.
- V96/V95/V94/V93/V92/V91 como cadena histórica de auditoría.
- Paquete FULL enviado a Claude.
- Reauditorías V92/V93/V94/V95/V96.
- Mejoras backend post-paquete.
- Reglas Phase A TyA y reusable CXOrbia.

## Resultado

La candidata cierra el P0 residual de V96 sobre permisos `CX.MOD_CAT` y fail-closed operativo para módulos administrativos actuales.

También atiende P1 de cliente multi-proyecto y copy honesto de WhatsApp/manual en varios módulos.

## P1 residual documentado

- `cli_*` sigue fuera de `CX.MOD_CAT`; no bloquea empalme porque shell cliente tiene acceso propio, pero conviene categorizar para clientBrandAdmin/clientBrandViewer futuro.
- El fallback de módulo desconocido va a `cfg`; es más seguro que `true`, pero antes de producción real conviene que desconocido sea `false` salvo allowlist explícita.
- Quedan residuos menores de copy en Soporte, Mis Visitas y label `Conectado` de HR Source.

## Estado seguro

Sin backend real conectado, sin Auth real, sin Firestore writes, sin import real, sin producción, sin pagos, sin HR writeback, sin Make/Gemini y sin datos sensibles.

## Siguiente paso

Continuar backend Phase A sobre esta candidata post-V96 como prototipo vivo, manteniendo documentación para Claude y smoke visual pendiente por rol/módulo.