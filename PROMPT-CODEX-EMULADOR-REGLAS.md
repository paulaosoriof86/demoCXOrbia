# PROMPT-CODEX-EMULADOR-REGLAS.md

Copia este prompt en Codex si se decide ejecutar el emulador desde allí.

```text
Trabaja en el repo paulaosoriof86/demoCXOrbia, rama feat/firebase-backend-dev-config-20260627.

Objetivo: ejecutar las pruebas locales de Firestore rules ubicadas en firebase/emulator-rules, sin publicar reglas, sin crear usuarios, sin cargar seed, sin activar adapter y sin tocar producción.

Instrucciones:
1. No modifiques /app/modules.
2. No hagas merge.
3. No hagas deploy.
4. No uses datos reales ni credenciales reales.
5. Ejecuta:
   cd firebase/emulator-rules
   npm install
   npm run test:rules
6. Si pasa, crea o actualiza RESULTADO-EMULADOR-REGLAS-FIRESTORE.md indicando salida, fecha, comandos y resultado.
7. Si falla, no corrijas reglas a ciegas. Documenta error exacto, archivo, línea probable y recomendación.
8. Actualiza CAMBIOS-BACKEND.md o crea addendum si la edición principal se bloquea.
9. Mantén CX.BACKEND.enabled=false.
10. Devuelve resumen claro de resultado y próximos gates.
```
