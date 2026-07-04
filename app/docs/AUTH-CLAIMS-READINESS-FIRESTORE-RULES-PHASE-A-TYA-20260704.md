# Auth claims readiness Firestore rules Phase A TyA

Fecha: 2026-07-04

## Objetivo

Preparar el readiness de claims Auth contra el borrador documental de reglas Firestore DEV/staging, sin activar Auth real, sin conectar runtime backend y sin escribir Firestore.

Este bloque atiende el pendiente vivo: **Readiness de reglas/claims Auth**.

## Archivos creados

- `app/contracts/auth-claims-phase-a.tya.contract.json`
- `tools/migration/tya-auth-claims-readiness-validator.mjs`

## Archivos revisados como base

- `app/contracts/firestore-dev-staging.rules.draft`
- `app/docs/FIRESTORE-DEV-STAGING-RULES-DRAFT-PHASE-A-TYA-20260704.md`
- `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`

## Estado del bloque

- Estado: `review_required`.
- No es blocker para seguir documentando Phase A.
- Sí es blocker para emitir claims reales, activar Auth DEV real o validar reglas en emulator con usuarios reales.

## Claims canonicos propuestos

Para Phase A se deja documentado este set minimo:

| Claim | Uso |
|---|---|
| `tenantId` | Aislamiento tenant TyA y futuros tenants. |
| `role` | Rol canonico de acceso. |
| `projectId` | Scope de proyecto unico o compatibilidad simple. |
| `projectIds` | Scope multi-proyecto recomendado. |
| `shopperId` | Scope propio de shopper cuando aplica. |

Roles canonicos del contrato:

- `super`
- `admin`
- `ops`
- `shopper`
- `cliente`

## Hallazgo principal

El borrador actual de reglas Firestore usa `coordinador` como rol operativo de escritura/admin, mientras el modelo Phase A tambien maneja `ops` como rol canonico esperado.

Decision requerida antes de Auth DEV real:

- O se adopta `ops` como rol canonico y `coordinador` queda como alias legacy/transicional.
- O se adopta `coordinador` como rol canonico y se documenta el cambio contra el modelo de roles.

Por ahora el contrato deja `coordinador` como alias transicional hacia `ops`, solo para readiness documental. No se emitieron claims reales.

## Lectura tecnica del borrador de reglas

El borrador ya contempla:

- `tenantId` por ruta y claim;
- `projectId` / `projectIds` para scope de proyecto;
- `role` para permisos administrativos;
- `shopperId` para lectura self-scope de shopper;
- bloqueo de campos sensibles crudos;
- deletes bloqueados por defecto;
- `syncEvents` append-only.

Puntos a decidir antes de emulator/Auth DEV:

1. Nombre canonico final del rol operativo: `ops` vs `coordinador`.
2. Si `admin` y `super` pueden operar sin `projectIds` explicitos o si deben traer scope completo para auditoria SaaS.
3. Scope exacto de `cliente` por coleccion antes de permitir lecturas reales.
4. Permisos futuros de shopper para postulacion, agenda, visita realizada y cuestionario, porque hoy el borrador esta conservador y no debe activar escritura real.
5. Politica final de campos sensibles para contactos, pagos, NDA y datos bancarios.

## Validador seguro creado

`tools/migration/tya-auth-claims-readiness-validator.mjs` revisa localmente:

- claims esperados vs referencias del draft de reglas;
- roles canonicos vs roles encontrados en reglas;
- aliases transicionales;
- guardas de campos sensibles;
- deletes bloqueados;
- `syncEvents` append-only.

El script no importa datos, no conecta Firebase, no escribe Firestore y no activa Auth. Su salida esperada es JSON de readiness.

## Comando futuro seguro

Cuando se tenga el repo local actualizado, se puede ejecutar solo como lectura local:

```bash
node tools/migration/tya-auth-claims-readiness-validator.mjs
```

No debe confundirse con autorizacion de Auth real ni con publicacion de reglas.

## Impacto en Phase A

Este bloque reduce riesgo antes de conectar Auth porque deja claro que las reglas dependen de claims estables y que hay una decision pendiente de nomenclatura de rol operativo.

No cambia frontend, no cambia V79 y no habilita runtime.

## Impacto para Claude

No hay cambio visual requerido en este bloque.

Si Claude toca roles visibles en UI, debe respetar la decision futura de rol canonico y no inventar un rol nuevo ni mezclar `ops`/`coordinador` sin documentarlo.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin Firestore writes reales.
- Sin Auth real activado.
- Sin runtime backend conectado.
- Sin Make/Gemini/WhatsApp API real.
- Sin cambios frontend.
