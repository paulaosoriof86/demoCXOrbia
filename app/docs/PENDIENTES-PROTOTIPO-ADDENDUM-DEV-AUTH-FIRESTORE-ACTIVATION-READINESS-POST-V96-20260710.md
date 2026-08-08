# Pendientes prototipo — Addendum DEV Auth/Firestore readiness post-V96

Fecha: 2026-07-10

## Decisión

El backend cerró la coherencia documental de roles/personas/scopes necesaria para preparar Auth/Firestore DEV. Esto no activa Auth ni Firestore y no agrega tareas de backend a Claude.

## P1 visual/UX para Claude

1. Categorizar o allowlistear explícitamente los módulos cliente `cli_*`.
2. Hacer fail-closed absoluto para módulo desconocido: `false` salvo allowlist explícita.
3. Mantener cliente multi-proyecto y proyecto activo dentro del cliente.
4. Barrer copy residual:
   - Soporte: WhatsApp/Make como borrador o pendiente backend;
   - Mis Visitas: evidencias por WhatsApp Web/manual;
   - HR Source: `Conectado por backend` cuando corresponda.
5. Smoke por rol:
   - admin/tenant owner;
   - coordinador/aliado/custom con mapeo explícito;
   - cliente admin/viewer limitado a proyectos autorizados;
   - shopper limitado a su propio ámbito.

## Comportamiento esperado en UI

- Persona visible y rol técnico no deben confundirse.
- Cliente no debe ver Shoppers protegidos, reviewQueue operativa, pagos por lotes internos ni administración del tenant.
- Shopper solo ve perfil/visitas/certificaciones/beneficios propios.
- Rol/persona/custom sin mapeo explícito debe mostrar acceso denegado, no fallback administrativo.
- Auth/Firestore debe mostrarse como pendiente o gate apagado hasta evidencia backend real.

## No pedir a Claude rehacer

- contratos Auth/RBAC;
- reglas Firestore;
- seeds source-safe;
- adapters/validators;
- protected candidates;
- datos reales/import;
- providers/integraciones.

## Estado seguro

Documento de prototipo únicamente. No modifica frontend, runtime ni producción.
