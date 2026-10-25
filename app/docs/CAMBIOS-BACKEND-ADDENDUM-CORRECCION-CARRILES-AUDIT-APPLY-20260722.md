# CAMBIOS BACKEND — Corrección de carriles Audit / Apply

Fecha: 2026-07-22  
Estado: `ROOT_CAUSE_CORRECTED_V174_AUDITED_GO`

## Causa raíz

El addendum anterior exigía `REPO_CHECKOUT_AVAILABLE=true` antes de iniciar la auditoría y obligaba a realizar recepción, auditoría y aplicación en el mismo checkout. Esto confundía dos capacidades distintas y generaba falsos `EXECUTION_LANE_NOT_READY` cuando sí existían:

- bytes reales y extraídos de la candidata;
- Node/Python/hashes/gates locales;
- lectura autoritativa de PR, HEAD y archivos por el conector GitHub.

## Corrección aplicada

Se reemplazó bajo el mismo nombre el documento canónico:

- `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`.

Ahora separa:

- `AUDIT_LANE_READY`: no requiere checkout local si existen bytes, runtime y lectura autoritativa de rama;
- `APPLY_LANE_READY`: exige aplicación atómica autenticada, commit/push y HEAD verificables;
- `AUDITED_GO_APPLY_LANE_PENDING`: preserva una auditoría GO sin pedir otra candidata ni repetir el análisis.

## Candidata V174

Se auditó la candidata ya recibida:

- ZIP SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`;
- `HEAD_BEFORE`: `91924ff34d377fff6601cebe6d59b269a2c00834`;
- decisión: `AUDITED_GO_APPLY_LANE_PENDING`;
- P0: ninguno;
- P1/P2: integridad V156 obsoleta, logo real PPT no demostrado, nombre impreciso de hashes y mojibake histórico.

Source lock:

- `app/docs/AUDITORIA-CANDIDATA-V174-CORTE2A-SOURCE-LOCK-20260722.md`.

## Evidencia resumida

- 68/68 archivos JS/MJS pasan `node --check`;
- cero scripts locales faltantes;
- cero secretos detectados;
- cero BOM;
- Corte 2A estático PASS preservando overlays de rama;
- no se demostró regresión P0 de M1.

## Clasificación

- **Reusable CXOrbia:** separación Audit/Apply y preservación de auditoría por SHA/source lock.
- **Exclusivo cliente:** aplicación posterior a rama TyA.
- **Claude/prototipo:** candidata V174 auditada.
- **Academia:** sin cambio de contenidos en esta corrección metodológica.
- **Sin impacto Claude:** checkout, commit, push, deploy y smoke.

## Estado seguro

No se empalmó la candidata todavía. Sin merge, producción, writes, Make/Gemini ni pagos.
