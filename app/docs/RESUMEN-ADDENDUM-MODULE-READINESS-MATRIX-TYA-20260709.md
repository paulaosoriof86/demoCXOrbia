# RESUMEN ADDENDUM - Module readiness matrix TyA

Fecha: 2026-07-09

## Para backend ChatGPT/Codex

Este bloque convierte los pendientes conocidos de TyA en una matriz verificable por modulo. No se debe avanzar a conexion real si falla alguno de los modulos criticos.

## Para Claude/prototipo

Claude ya esta trabajando con paquete generico. Cuando entregue candidata, auditar contra esta matriz:

- proyecto separado de periodo;
- tenant/proyecto configurable;
- HR/source enmascarado y generico;
- usuarios/personas/roles/scopes configurables;
- cursos, manuales, Academia y certificaciones configurables;
- shoppers publicos source-safe y perfiles protegidos por Auth;
- liquidaciones/pagos como preview/review sin ejecucion real;
- reviewQueue antes de resolver conflictos;
- auditEvents antes de acciones criticas;
- gates honestos para Make/Gemini/Storage/pagos/HR writeback;
- PWA/branding configurable;
- CX.data mantiene interfaz y backend entra detras de facade.

## No hacer

- No hardcodear TyA en el prototipo.
- No tratar periodo como proyecto.
- No simular Auth real.
- No prometer integraciones reales si los gates estan apagados.
- No exponer PII en preview publico.
- No pedir repetir certificaciones si hay carryover validado.

## Resultado esperado

La proxima candidata de Claude debe poder ser auditada contra modulos, no contra memoria ni observaciones sueltas.
