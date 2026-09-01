# Phase A GO DEV conditional request package TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge
Contrato: `backend/contracts/phase-a-go-dev-conditional-request-package-v1.json`

## Objetivo

Preparar el formato de solicitud condicional GO DEV sin pedir decision todavia.

Este bloque deja lista la pregunta exacta y las opciones validas para cuando si corresponda pedir una decision a Paula.

## Estado actual

Estado: `prepared_not_requested`.

No se pide GO DEV en este bloque.
No se pide RUN_SMOKE en este bloque.
No se pide accion manual en este bloque.
No se activa DEV.
No se conecta base.
No se importa.
No se escribe.
No se despliega.
No se produce.

## Contexto de decision

Ya existe:

- checklist GO DEV;
- paquete de decision GO DEV;
- matriz de estado GO DEV;
- paquete unico de smoke humano si llega a ser necesario;
- guardrail anti-regreso;
- ruta por carriles.

La matriz actual indica `need_local_evidence_before_ready_to_request_go_dev`, pero este bloque todavia no pide esa evidencia.

## Opciones validas futuras

Cuando corresponda pedir decision a Paula, las opciones deben ser solo:

### HOLD

No avanzar a GO DEV. Mantener preparacion o esperar.

### RUN_SMOKE

Ejecutar el paquete unico de smoke humano/consola antes de decidir GO DEV.

### GO_DEV

Autorizar trabajo DEV controlado. No equivale a produccion.

### BLOCKED

Detener y documentar bloqueo antes de cualquier trabajo DEV.

## Frase futura exacta

Cuando corresponda, la solicitud debe ser breve y unica:

```text
Paula, con la evidencia disponible, elige una opcion: HOLD, RUN_SMOKE, GO_DEV o BLOCKED.

HOLD = no avanzamos a DEV todavia.
RUN_SMOKE = ejecutas el smoke unico preparado y me devuelves el resultado.
GO_DEV = autorizas solo DEV controlado, no produccion.
BLOCKED = detenemos y documentamos el bloqueo.
```

## Que autoriza GO_DEV si se llega a elegir

Solo autoriza:

- preparar recursos backend limpios de DEV;
- conectar adapter `CX.data` en modo DEV controlado;
- correr dry-run import source-safe;
- escribir registros DEV solo si el gate lo permite;
- registrar auditEvents;
- poblar reviewQueue DEV.

## Que GO_DEV no autoriza

No autoriza:

- merge final;
- deploy produccion;
- runtime produccion;
- pagos reales;
- copiar base vieja;
- commitear datos sensibles;
- sobrescribir HR silenciosamente;
- hardcodear Cinépolis como logica global.

## Que no se debe volver a pedir

No pedir de nuevo:

- reglas HR documentadas;
- shoppers ya trabajados;
- certificaciones ya presentadas;
- regla de junio como liquidaciones/pagos;
- adapter desde cero;
- builder desde cero;
- readiness desde cero.

## Que debe estar verdadero antes de pedir esta decision

Antes de pedir la decision:

1. PR #7 open/draft/no merge.
2. Sin hard stop conocido.
3. Checklist GO DEV preparado.
4. Paquete decision GO DEV preparado.
5. Matriz estado GO DEV preparada.
6. Paquete smoke humano preparado si se requiere.
7. Politica de no pedir manual por defecto respetada.

## Impacto Phase A real

Este bloque evita ambiguedad en el momento de pedir decision. Cuando llegue el momento, Paula no recibira una lista abierta ni pasos sueltos; recibira cuatro opciones cerradas.

Tambien evita confundir GO DEV con produccion y evita que un RUN_SMOKE se convierta en reproceso amplio.

## Backend reusable

Patron reusable:

- opciones cerradas de decision;
- autorizacion por carril;
- GO DEV separado de produccion;
- smoke separado de GO DEV;
- no pedir datos ya documentados;
- no reabrir planes preparados.

## Claude/prototipo

Claude debe representar las opciones futuras como estados o decisiones separadas:

- HOLD;
- RUN_SMOKE;
- GO_DEV;
- BLOCKED.

No debe mostrar que GO DEV significa produccion o pagos reales.

## Academia

Academia debe explicar:

- que significa cada opcion;
- por que GO DEV no es produccion;
- por que RUN_SMOKE es una validacion, no un deploy;
- por que BLOCKED detiene el avance;
- por que HOLD evita decisiones prematuras.

## Necesidad de Paula

No necesito nada de Paula en este bloque.

La decision solo se pedira cuando el siguiente bloqueo real sea elegir entre HOLD, RUN_SMOKE, GO_DEV o BLOCKED.

## Estado final

Solicitud condicional GO DEV preparada, no solicitada. Sin runtime, sin base conectada, sin import, sin writes, sin deploy y sin produccion.
