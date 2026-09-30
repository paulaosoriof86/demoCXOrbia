# Source lock y empalme — Prototipo CXOrbia V96

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Decisión

V96 queda como source lock operativo del prototipo para continuar empalme backend/documentación, condicionado a no declarar GO de producción real.

## Base auditada

- V96 contra V95, V94, V93, V92 y V91.
- Paquete FULL enviado a Claude.
- Reauditorías V92/V93/V94/V95.
- Mejoras backend post-paquete.
- Reglas Phase A TyA y reusable CXOrbia.

## Resultado

V96 cierra la mayoría de P0/P1 pendientes de V95: scope proyecto/cliente, edición usuario con proyecto/cliente, HR Source candidates con llave estable, reviewQueue con sourceRef/auditRef, copy de WhatsApp/postulaciones y automatizaciones más honesto.

## P0 residual documentado para Claude

Completar `CX.MOD_CAT`/fail-closed de permisos para módulos sin categoría: `administrabilidad`, `diagnostico`, `hrsource`, `saas`, `novedades` y `cli_*`. Roles coordinador/aliado/custom no deben ver módulos administrativos sin permiso explícito.

## Estado seguro

Sin backend real conectado, sin Auth real, sin Firestore writes, sin import real, sin producción, sin pagos, sin HR writeback, sin Make/Gemini y sin datos sensibles.

## Siguiente paso

Continuar backend Phase A sobre V96 como prototipo vivo, manteniendo documentación para Claude y smoke visual pendiente por rol/módulo.
