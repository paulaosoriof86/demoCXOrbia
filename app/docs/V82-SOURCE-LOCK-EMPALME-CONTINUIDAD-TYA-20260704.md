# V82 source lock, empalme y continuidad TyA

Fecha: 2026-07-04

## Decision

Paula confirma que Claude perdio capacidad. Por continuidad y para no abrir mas reprocesos, V82 queda aceptada como **baseline viva / source lock de trabajo** para continuar el empalme y el backend Phase A.

Esto reemplaza la recomendacion anterior de pedir una V83 a Claude. Los pendientes menores detectados en la auditoria V82 pasan a gestion interna de ChatGPT/Codex/backend-prototipo, siempre documentados.

## Fuente bloqueada

- ZIP fuente: `Prototype development request CXOrbia V82.zip`.
- Candidato auditado: V82.
- Documento de auditoria: `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V82-CLAUDE-20260704.md`.
- Rama de continuidad: `docs-tya-v6-v71-audit`.
- PR: #7, draft, abierto, sin merge.

## Estado de V82

V82 queda como base de trabajo porque resolvio lo critico de V80/V81:

- wizard con enum canonico `interna`, `externo_general`, `externo_visita`;
- `qMode()` y `visitLinkField:'questionnaireLink'`;
- defaults Phase A restaurados en wizard;
- cuestionario con 5 campos de link por visita;
- revision admin con estados canonicos y estructura backend-ready parcial;
- bloqueo de `submitido_registered` sin nota en HR-driven;
- `plantilla lista` sin duplicado;
- documentacion interna V82 en `app/docs`;
- sintaxis JS validada en auditoria: `node --check` sobre 61 archivos JS con resultado `OK=61 FAIL=0`.

## Pendientes conocidos aceptados como backlog interno

Los siguientes puntos NO bloquean usar V82 como baseline viva, pero deben corregirse/documentarse en los proximos bloques:

1. `app/modules/cuestionario-shopper.js`: cambiar texto externo `marca la visita como cuestionario enviado` por `marca el cuestionario como realizado/completado`.
2. `app/modules/revision-admin.js`: cambiar `Cuestionario: enviado` por `realizado/completado`.
3. `app/modules/revision-admin.js`: agregar alias/campo `status=estado` para compatibilidad contractual.
4. `app/modules/revision-admin.js`: pasar `projectId:p.id` al guardar y preservar `hrRowId` cuando exista.
5. `app/modules/revision-admin.js`: hacer que la nota requerida para HR-driven sea explicitamente nota/referencia HR.
6. `app/modules/misvisitas.js`: cambiar comentarios/textos que digan que ya sincroniza estado/hoja de ruta; debe decir pendiente backend/preparado.
7. `app/modules/postulaciones.js`: cambiar toasts `HR sincronizada` por `se reflejara en HR cuando el sync este activo (pendiente backend)`.

## Regla desde este punto

A partir de este source lock:

- No pedir V83 a Claude.
- No volver a reprocesar V80/V81 salvo comparacion historica.
- Usar V82 como base visual/funcional para los siguientes bloques.
- Todo ajuste directo que haga ChatGPT/Codex sobre V82 debe quedar documentado en:
  - `CAMBIOS-BACKEND.md`;
  - `RESUMEN-PARA-CLAUDE.md`;
  - `PENDIENTES-PROTOTIPO.md`;
  - addendum en `app/docs` cuando aplique.
- Si se corrige un pendiente del prototipo directamente, debe documentarse tambien como mejora para el producto comercializable.

## Limites de seguridad

Este source lock no autoriza:

- deploy;
- merge;
- produccion;
- escritura Firestore real;
- Auth real;
- Make real;
- Gemini real;
- WhatsApp API real;
- Storage real;
- import real de datos;
- migracion de datos sensibles;
- conexion a base vieja.

## Siguiente bloque recomendado

1. Empalmar/aplicar V82 como base de trabajo en la rama de continuidad.
2. Corregir los pendientes menores aceptados del source lock si Paula lo autoriza o si son necesarios para evitar regresion operativa.
3. Continuar backend Phase A sobre V82: validadores import/sync, liquidaciones/pagos, HR/plataforma, y preparacion de `CX.data` adapter sin activar runtime real.

## Estado seguro

- Source lock documental creado.
- Sin deploy.
- Sin merge.
- Sin produccion.
- Sin escritura Firestore real.
- Sin Auth real.
- Sin Make/Gemini/WhatsApp API real.
- Sin runtime backend conectado.
