# AI question bank Phase A TyA

Fecha: 2026-07-04

## Proposito

Definir el alcance de Gemini para apoyar la generacion del banco de preguntas por proyecto en Phase A.

## Requerimiento

Gemini queda dentro de Phase A para generar borradores de bancos de preguntas por proyecto, con revision humana antes de publicar.

## Reglas

1. No pedir nueva prueba a shoppers que ya la presentaron y aprobaron, salvo regla expresa del proyecto.
2. Conservar historial por shopper y por proyecto.
3. Separar bancos de preguntas por `projectId`.
4. Generar preguntas desde instructivo y reglas operativas.
5. Mantener revision humana antes de publicar banco definitivo.
6. No enviar informacion sensible innecesaria a IA.
7. No guardar prompts con datos sensibles.

## Datos necesarios

- Lista de shoppers con prueba aprobada.
- Resultado historico disponible.
- Proyecto asociado.
- Instructivo vigente por proyecto.
- Reglas especificas de cada proyecto.
- Numero de preguntas requerido.
- Criterio de aprobacion.

## Estados propuestos

- `approved_existing`
- `test_required`
- `question_bank_draft`
- `question_bank_reviewed`
- `question_bank_active`

## Alcance Phase A

- Generar banco inicial con Gemini.
- Marcar shoppers que ya aprobaron.
- Evitar repetir prueba innecesaria.
- Dejar trazabilidad por proyecto.

## Estado

- Contrato documental.
- Sin llamada real a Gemini en este bloque.
- Sin runtime conectado.
- Sin deploy ejecutado.
- Sin escritura Firestore en este bloque.
