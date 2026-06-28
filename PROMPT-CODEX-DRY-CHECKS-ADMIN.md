# PROMPT-CODEX-DRY-CHECKS-ADMIN.md

Copia este prompt en Codex para ejecutar validaciones locales no sensibles.

```text
Trabaja en el repo paulaosoriof86/demoCXOrbia, rama feat/firebase-backend-dev-config-20260627.

Objetivo: ejecutar dry checks locales de admin tools, sin escribir Firebase, sin crear usuarios, sin asignar claims, sin usar credenciales, sin activar adapter y sin tocar producción.

Instrucciones:
1. No modifiques /app/modules.
2. No hagas merge.
3. No hagas deploy.
4. No uses datos reales ni credenciales reales.
5. Ejecuta:
   cd firebase/admin-tools
   npm run validate:seed
   npm run plan:claims
6. Si pasa, crea RESULTADO-DRY-CHECKS-ADMIN.md indicando salida, fecha, comandos y resultado.
7. Si falla, documenta error exacto sin corregir a ciegas.
8. Mantén CX.BACKEND.enabled=false.
```
