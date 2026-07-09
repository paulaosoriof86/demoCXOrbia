# Cambios - Phase A CX.data DEV adapter contract TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`

## Archivos agregados

- `backend/contracts/phase-a-cxdata-dev-adapter-contract-v1.json`
- `tools/contracts/tya-phase-a-cxdata-dev-adapter-contract-validate.mjs`
- `app/docs/PHASE-A-CXDATA-DEV-ADAPTER-CONTRACT-TYA-20260709.md`
- `app/docs/CLAUDE-PROTOTIPO-ADDENDUM-CXDATA-DEV-ADAPTER-TYA-20260709.md`

## Objetivo

Definir el contrato del futuro adapter DEV de `CX.data` para Phase A TyA/Cinepolis, con foco directo en datos reales/sanitizados de TyA y sin activar runtime.

## Dato real/fuente real que ayuda a operar

El contrato exige como fuente valida HR source-safe/full-flow u output sanitizado original TyA. Bloquea demo como fuente final, fixture sintetico como evidencia real y `.tmp` derivado como fuente original.

## Flujo de produccion que desbloquea

Prepara el punto donde el prototipo podra leer dominios Phase A sin romper la interfaz `CX.data`: configuracion proyecto, HR status, visitas, shoppers, postulaciones/asignaciones, certificaciones, liquidaciones/pagos junio, cuestionarios, colas y auditoria.

## Trabajo previo recuperado

Recupera lectura HR, mapeo de columnas, shoppers historicos, certificaciones preservadas, reglas junio pagos/liquidaciones, sync HR/plataforma, colas operativas y decision de no repetir Level 0/1.

## Que se descarta

- No se copia arquitectura vieja.
- No se conecta base vieja.
- No se aceptan parches UI desde backend.
- No se usa demo/fixture/`.tmp` como fuente real.
- No se tratan visitas junio como pendientes de ejecutar.

## Impacto Phase A

Alinea el futuro switch `CX.data` con datos reales/sanitizados TyA y evita que el runtime DEV se convierta en infraestructura abstracta. Mantiene writes apagados y prioriza lectura segura de la operacion real.

## Impacto backend reusable

Patron reusable para adapter DEV por tenant/proyecto: interfaz estable, fallback localStorage, fuente source-safe, dominios por Phase A y writes bloqueados hasta gate.

## Impacto TyA/Cinepolis

Cinepolis queda como proyecto configurable dentro de TyA. Se preservan reglas conocidas: HR fuente operacional, junio como pagos/liquidaciones, shoppers historicos, certificaciones ya presentadas y cuestionario configurable.

## Impacto Claude/prototipo

Se agrego addendum para que Claude muestre estados honestos: adapter apagado, source-safe pendiente, writes bloqueados, no pago real, no sync real, no demo/fixture como dato real.

## Impacto Academia

Debe explicar `CX.data`, adapter, fallback localStorage, source-safe, writes bloqueados, gates, datos reales/sanitizados vs demo y preservacion de certificaciones.

## Estado seguro

Sin cambios en `/app/modules` o `/app/core`, adapter no habilitado, sin runtime, sin switch ejecutado, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp reales, sin pagos reales, sin import real y sin datos sensibles.

## Commits

- `d4518d90d45a87bc7bfee4e3469784729344d718`
- `7bfa6dd34f9eea1c7225de22e58bffbb0d5fd1c3`
- `d690a9a44bfc6a046ae9b7683d623a5f95f05480`
- `d39a5647549aaadf703c71f5212fe185ffeb8428`
