# PENDIENTES PROTOTIPO — C6 diagnostic v2 provider HOLD

## Pendientes reales

1. **12 apellidos no demostrados:** primer nombre y semilla de contraseña completos; apellido sin candidato explícito, login técnico, consenso ni base permitida.
2. **Un multi-Auth empatado:** dos candidatos con score `5016`, margen `0` y señales idénticas.
3. **Un grupo añadido:** fingerprint `ebbcc231fcf415cbaf77`, dos identidades activas, un keeper y un sufijo de cuatro caracteres; falta vector de procedencia de miembros para explicar por qué aparece en planner y no en referencia.

## Correctivo mínimo siguiente

Source-only, sin provider read:

- añadir al group matrix conteos de miembros por `sourceSafeSurnameBasis` y estado pre/post consenso;
- añadir fingerprints de miembros con namespace estable, sin identidad cruda;
- producir matriz de pertenencia del grupo añadido;
- clasificar si el `+1/-0` es efecto legítimo de consenso o defecto de reglas;
- proponer el mecanismo no operativo para obtener evidencia de apellido de los 12 y resolver el empate multi-Auth, sin escribir datos.

## Prohibiciones

No reejecutar provider, no aplicar parcialmente el plan 340, no modificar Auth, contraseñas, memberships, Firestore, Rules, Storage, HR, deploy, Make, Gemini, pagos, merge ni producción.
