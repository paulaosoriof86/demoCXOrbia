# ACADEMIA — ADDENDUM C6 SMOKE READ-ONLY IDENTITY/SCOPE STOP

**Fecha:** 2026-08-10

## Impacto académico

Este bloque aporta un caso claro de validación por capas:

1. un fallo previo de infraestructura del harness (`ENOENT` de credencial efímera) fue corregido sin tocar negocio ni identidades;
2. el nuevo smoke sí alcanzó Auth y permitió distinguir por primera vez hallazgos runtime de identidad/scope de un problema del instrumento de prueba;
3. se mantuvo un patrón fail-closed: una sola lectura provider, cero writes, STOP_RETRY al primer gate lógico fallido y cero PII exportada.

## Evidencia utilizable

- población Auth observada: 228;
- superficies Phase A source-side: 20/20;
- hallazgo terminal: 5 grupos de provider email duplicado;
- señales adicionales source-safe: 4 roles habilitados fuera de contrato, 1 Admin/Operaciones fuera de tenant scope y 1 Shopper con scope incompleto.

Estos conteos no deben convertirse en conclusiones sobre personas hasta completar la adjudicación read-only focal.

## Manuales/cursos/rutas por rol

No cambiar todavía manuales de usuario ni rutas por rol. El frontend no fue modificado y el smoke no llegó a demostrar una regresión visual. Cuando la adjudicación cierre, actualizar únicamente la parte de troubleshooting de Auth/RBAC si se confirma un defecto real.

## Patrón reusable

`SOURCE GATE -> CREDENCIAL EFÍMERA INDEPENDIENTE -> UNA LECTURA RUNTIME -> SALIDA SOURCE-SAFE -> STOP_RETRY -> ADJUDICACIÓN FOCAL`.
