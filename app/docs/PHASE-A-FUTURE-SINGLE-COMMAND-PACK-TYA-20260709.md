# Phase A future single-command pack TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Dejar preparado el paquete de comando unico futuro para Paula, marcado como **NO EJECUTAR TODAVIA**, para reducir pasos manuales cuando se necesite computador y fuente local source-safe.

Este bloque no entrega un comando para ejecutar ahora. Solo deja contratado que el futuro comando debe ser un solo bloque, seguro, sin rutas alternativas y sin datos privados en chat.

## Archivos agregados

- `backend/contracts/phase-a-future-single-command-pack-v1.json`
- `tools/contracts/tya-phase-a-future-single-command-pack-validate.mjs`

## Estado

- Ready for future use: si.
- Ejecutar ahora: no.
- Requiere computador de Paula: si, cuando corresponda.
- Requiere inputs source-safe locales: si.
- Requiere instruccion explicita en ese momento: si.
- Datos privados en chat: prohibido.

## Precondiciones antes de enviar un comando a Paula

- Conversacion con continuidad o prompt de continuidad disponible.
- Repo/ruta confirmada o detectable.
- Rama `docs-tya-v6-v71-audit` confirmada.
- Contrato source-safe input builder presente.
- Contrato local builder execution control presente.
- Readiness pack presente.
- Fuente local source-safe existe o la necesidad esta clara.
- No se piden datos privados por chat.

## Que debe validar el comando futuro

- Rama Git.
- Contratos requeridos.
- Source-safe input builder contract.
- Local builder execution control contract.
- Realdata domain readiness pack contract.
- Source-safe domain mapping contract.
- CX.data DEV adapter contract.
- Accumulated readiness contract.

## Reglas del PowerShell futuro

Debe ser:

- un solo bloque;
- sin rutas alternativas;
- sin edicion manual;
- sin echo de datos crudos;
- sin portapapeles con datos privados;
- reportes solo en `.tmp`;
- sin `git add .tmp`;
- sin commit de `.tmp`;
- sin deploy;
- sin runtime;
- sin import;
- sin Firestore writes;
- sin HR writes;
- sin Make/Gemini;
- sin pagos.

## Outline futuro

1. Activar manejo estricto de errores.
2. Resolver ruta del repo.
3. Entrar al repo.
4. Confirmar rama `docs-tya-v6-v71-audit`.
5. Crear carpetas `.tmp`.
6. Ejecutar `node --check` sobre validadores.
7. Validar source-safe input builder contract.
8. Validar local builder execution control.
9. Validar realdata readiness pack contract-only.
10. Si existe input local source-safe, validar readiness pack con `--input`.
11. Imprimir resumen claro de verdict.
12. Imprimir lo que sigue bloqueado.
13. Nunca hacer `git add .tmp`.

## Inputs futuros

- `RepoPath`: ruta local del repo.
- `SourceSafeInputPath`: ruta local opcional del JSON source-safe ya construido.

Si no existe `SourceSafeInputPath`, el comando futuro debe validar contratos solamente.

## Outputs futuros esperados

- `.tmp/tya-phase-a-source-safe-input-builder-contract/phase-a-source-safe-input-builder-contract-report.json`
- `.tmp/tya-phase-a-local-builder-execution-control/phase-a-local-builder-execution-control-report.json`
- `.tmp/tya-phase-a-realdata-domain-readiness-pack/phase-a-realdata-domain-readiness-pack-report.json`
- `.tmp/tya-phase-a-single-command-summary.txt`

## Bloqueos hasta necesidad explicita

- No enviar comando ahora.
- No pedir a Paula ejecutar ahora.
- No pedir datos privados.
- No ejecutar builder sin inputs source-safe.
- No usar esto como GO runtime.
- No usar esto como GO import.

## Hard stops

- Comando enviado antes de ser necesario.
- Datos privados pedidos en chat.
- HR cruda solicitada.
- Rama/repo incorrecto.
- Validadores faltantes.
- `.tmp` commiteado.
- Runtime/adapter habilitado.
- Import/write/deploy.
- Make/Gemini.
- Pago.

## Validador

Uso tecnico futuro:

```bash
node tools/contracts/tya-phase-a-future-single-command-pack-validate.mjs --out .tmp/tya-phase-a-future-single-command-pack
```

El validador solo revisa este paquete futuro. No envia comandos y no ejecuta builder.

## Impacto Claude/prototipo

Claude no debe mostrar este paquete como datos cargados ni runtime activo. Puede representarlo como estado tecnico pendiente: `comando local preparado · no ejecutado`.

## Impacto Academia

Academia debe explicar por que se prepara un comando unico, por que no se ejecuta hasta que exista necesidad real, por que no se comparten datos privados y por que `.tmp` no se commitea.

## Estado seguro

- Sin cambios en `/app/modules` o `/app/core`.
- No se envio comando a Paula.
- Comando no ejecutado.
- Builder no ejecutado.
- Output local no commiteado.
- Adapter no habilitado.
- Sin runtime conectado.
- Sin import de dominios.
- Sin deploy.
- Sin produccion.
- Sin Firestore/Auth/Storage.
- Sin HR writes.
- Sin Make/Gemini.
- Sin correos/WhatsApp reales.
- Sin pagos reales.
- Sin import real.
- Sin datos sensibles.
