# ACADEMIA — IMPACTO CORTE 4 HOSTING DEV PASS

Fecha: 2026-07-29

## Conceptos que deben incorporarse

1. **Hosting DEV no es producción.** El runtime se publicó únicamente en el proyecto Firebase DEV nuevo `cxorbia-tya-dev-260729-c4`.
2. **Protected smoke y validación visual son gates distintos.** El smoke técnico ya probó lectura Firestore protegida; Hosting DEV permite revisar la experiencia visible.
3. **Autorización one-shot.** El gate autorizó exactamente una ejecución Hosting-only mediante `authorizationId` y luego quedó consumido/congelado.
4. **Proof remoto.** Después del deploy se verificó un artefacto de identidad del build y el entrypoint remoto antes de declarar PASS.
5. **Least privilege y separación de writes.** El deploy no autorizó Firestore/Auth/Storage/Rules/Functions/HR/imports/Make/Gemini/pagos/producción.
6. **Build temporal.** La Firebase Web config pública se inyectó en el build de Hosting sin modificar el mapping global del repo ni persistir credenciales de usuario.
7. **Secuencia correcta:** protected smoke → Hosting DEV → validación humana → freeze → retiro IAM → siguiente corte.

## Reusable CXOrbia

Patrón reusable: `EXPLICIT AUTHORIZATION → PREFLIGHT READ-ONLY → ONE HOSTING DEPLOY → REMOTE PROOF → ANTI-REDEPLOY → HUMAN VISUAL → FREEZE`.

## Sin impacto funcional de Claude

No se modificó la lógica de módulos UI ni se generó nueva candidata frontend.
