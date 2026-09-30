# Phase A protected read access adapter

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Avanzar backend funcional mientras Claude trabaja, creando un adaptador de politica de lectura protegida para shoppers, certificaciones, liquidaciones, lotes, auditEvents y reviewQueue.

Este bloque no conecta Firestore real, no activa Auth, no escribe datos, no conecta frontend y no toca produccion. Es un motor deterministico de autorizacion dry-run para validar la matriz antes de leer datos reales.

## Archivos agregados

- `backend/contracts/phase-a-protected-read-access-adapter-v1.json`
- `backend/config/phase-a-protected-read-access.routes.source-safe.json`
- `backend/adapters/protected-read-access-adapter.preview.mjs`
- `tools/release/tya-protected-read-access-adapter-validate.mjs`

## Por que esto no es relleno

Phase A necesita ver datos reales protegidos, pero no puede exponer PII en preview publico. Este adaptador adelanta el paso real porque define y prueba, antes de Firebase, quien puede pedir que lectura protegida.

El adaptador devuelve:

- `allowed`;
- `verdict`;
- hard fails;
- policy result;
- auditEvent source-safe.

## Recursos cubiertos

- `shopperProtectedProfile`.
- `certificationAttempts`.
- `certificationCarryovers`.
- `protectedLiquidations`.
- `protectedPaymentBatches`.
- `reviewQueue`.
- `protectedReadsAudit`.

## Personas evaluadas en dry-run

- tenantOwner.
- projectCoordinator.
- financeOperator.
- certificationOperator.
- clientBrandViewer.
- shopperEvaluator.

## Comando seguro

```bash
node tools/release/tya-protected-read-access-adapter-validate.mjs --out .tmp/protected-read-access
```

El comando no llama Firebase, no llama Firestore, no llama Auth, no escribe datos, no despliega reglas y no contiene datos sensibles.

## Reglas de acceso aplicadas

- Cliente/marca evaluada queda bloqueada para datos operativos protegidos.
- Shopper/evaluador solo puede leer su propio perfil.
- Shopper/evaluador no puede leer lotes de pago ni reviewQueue.
- Finance puede leer liquidaciones protegidas sin banco crudo.
- Certification puede leer certificaciones/carryover, no pagos completos.
- Project/country/tenant coordinacion opera segun scope.
- Toda lectura protegida genera auditEvent source-safe.

## Impacto Phase A TyA

Este bloque adelanta directamente la salida operativa porque prepara el borde que luego permitira:

- ver perfil completo de shopper solo con rol autorizado;
- conservar certificaciones presentadas;
- validar liquidaciones y estado de pago sin pago real;
- revisar conflictos en reviewQueue;
- auditar lecturas protegidas;
- aplicar scopes por tenant, pais y proyecto.

## Impacto reusable CXOrbia

El patron sirve para cualquier tenant/proyecto. No depende de nombres reales, HR especifica ni estructura unica. Las personas operativas se configuran y se traducen a rol tecnico/scope.

## Impacto Claude/prototipo

Claude debe representar esto de forma generica:

- boton/estado `requiere acceso` para perfil protegido;
- mensajes honestos `pendiente Auth`, `gate apagado`, `preview source-safe`;
- UI de permisos por persona y scope;
- cliente/marca sin acceso a datos operativos protegidos;
- shopper solo propio perfil;
- finance sin banco crudo;
- certificaciones y liquidaciones como protegidas/auditadas.

## Impacto Academia

Academia debe explicar:

- por que el preview publico no muestra perfil completo;
- quien puede leer perfiles protegidos;
- que puede ver finanzas sin banco crudo;
- que puede ver cliente/marca;
- que puede ver shopper/evaluador;
- que es auditEvent de lectura protegida;
- que es reviewQueue.

## Estado seguro

Contrato/config/adapter/script validador solamente. No Firestore real, no Auth real, no frontend, no writes, no import, no pagos, no HR writeback, no Make/Gemini, no produccion y no datos sensibles.
