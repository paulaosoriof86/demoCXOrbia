# SOURCE LOCK — I3.8 / I3.9 HISTÓRICO

**Estado histórico:** `SUPERSEDED_DO_NOT_EXECUTE`  
**SupersededAt:** 2026-08-18 11:51 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-ROOT-CAUSE-RECOVERY-01`

Este source lock fue correcto para una etapa anterior de I3.8/I3.9, pero **ya no es una fuente operativa vigente** y no debe utilizarse para ordenar deploy, password change, login E2E, reejecutar I3.9 ni diagnosticar el loader Shopper.

El estado posterior demostrado cerró I3.9/I3.10, desplegó/verificó Firestore Rules I3.11C y aisló un blocker distinto: `I3_11C_EXPECTED_PROVIDER_LINK_NOT_IN_APPLICABLE_RUNTIME_SET`.

Fuentes operativas actuales:
- `app/docs/CXORBIA-EXECUTION-STATE.json`;
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- `app/docs/SOURCE-LOCK-CXORBIA-TYA.md`;
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.

Frontera actual:
`NEW_AUTH_REQUIRED_FOCAL_PROVIDER_IDENTITY_LINK_READONLY_ADJUDICATION_NO_WRITES`.

Regla: los source locks fechados quedan como historia de auditoría y solo vuelven a conducir ejecución si el índice canónico vigente los activa expresamente.
