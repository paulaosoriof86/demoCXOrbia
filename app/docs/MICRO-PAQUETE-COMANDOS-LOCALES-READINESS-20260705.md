# Micro-paquete comandos locales readiness - CXOrbia TyA

Fecha: 2026-07-05

## Objetivo

Dejar preparado un paquete minimo de comandos para ejecutar solo cuando sea necesario validar localmente el readiness Phase A.

## Importante para Paula

No ejecutar ahora.

Yo avisare explicitamente cuando toque ejecutar. Por ahora este documento solo deja listo el paquete para reducir pasos manuales cuando sea necesario.

## Cuándo se ejecuta

Ejecutar solo si se cumple una de estas condiciones:

1. Se necesita validar el repo local antes de un siguiente bloque tecnico.
2. Codex pide evidencia local del readiness.
3. Ya se decidio hacer prueba local segura sin produccion.
4. Yo te digo claramente: `Paula, ahora si ejecuta este bloque`.

## Cuándo NO se ejecuta

No ejecutar si:

- estamos esperando candidata Claude P0;
- no hay repo local abierto;
- no se ha confirmado la carpeta correcta;
- se pretende hacer deploy, merge, produccion o import real;
- hay duda sobre la rama local.

## Carpeta esperada

Ejecutar desde la raiz del repo local `demoCXOrbia` o carpeta equivalente donde existan `app/` y `tools/`.

Antes de correr comandos, confirmar que estas en la carpeta correcta.

## Bloque de diagnostico inicial

```powershell
pwd
git branch --show-current
git status --short
```

## Bloque readiness seguro

```powershell
node tools/migration/tya-local-readiness-consistency-check.mjs
node tools/migration/tya-local-readiness-preflight.mjs
node tools/migration/tya-phase-a-local-readiness-runbook.mjs
```

## Qué devolver despues de ejecutar

No pegar archivos completos. Compartir solo:

- branch mostrada;
- si `git status --short` salio limpio o que archivos aparecen;
- estado final de cada comando;
- exit code si aparece;
- nombre de carpeta de salida si el runbook la reporta;
- cualquier warning sin datos sensibles.

## Qué no devolver

No pegar:

- credenciales;
- tokens;
- datos crudos TyA;
- informacion bancaria;
- payloads externos;
- correos o telefonos sin sanitizar;
- contenido completo de diagnosticos locales.

## Despues de ejecutar

Aplicar:

- `app/docs/CHECKLIST-SALIDAS-LOCALES-READINESS-20260705.md`
- `app/docs/TEMPLATE-REPORTE-LOCAL-READINESS-20260705.md`

## Regla final

Estos comandos no hacen produccion, deploy, merge, import real ni escrituras reales. Si algun resultado sugiere lo contrario, detenerse y revisar.
