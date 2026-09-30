# SOURCE LOCK — C6 residual identity root-cause source-only

**Fecha:** 2026-08-05  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**HEAD de entrada:** `018e35b56edaf205e46ca1e818634f78bb560528`

## Alcance autorizado

Clasificar exclusivamente:

- 12 fingerprints `technical_surname_unresolved`;
- 1 fingerprint `multi_auth_tie_residual`;
- diferencia `65/142` frente a `64/141`.

Solo source, contratos, matrices y artifacts source-safe ya generados. Cero provider reads y cero operación sobre datos.

## Inputs bloqueados

```text
current provider artifact sha256=ba9a559832ee2d8003ae798ae8a40cbe7e6b7582587d32053c55f16af50b134a
stable classifier artifact sha256=4eaf9354e4ed15996237af74fcea05c5b99bc2ec97f1be063dc8d8e52f1dc95f
current report sha256=2f05b73a71c0f348ff4cdbfb4bc7391fb89011468564d8cce12973cea255cf45
current group matrix sha256=c39f53a1c40cb94d412e26c6e4933d171c488155613d2f9183e1d52445ff2f9f
current plan 340 sha256=89bdbacdf2dabbf981b4835057f0a34f3451b5fb9bf57cd1e77bf8dc57bcb749
```

## Resultado bloqueado

```text
12 surname-labelled HOLDs = NO_C6_OR_INSUFFICIENT_EVIDENCE
1 multi-Auth tie = C6_CONFIRMED
83 = 71 completed by consensus + 12 remaining
65/142 versus 64/141 = model change + rigid aggregate gate defect
readyForAuthRepair=false
partialExecutionAllowed=false
```

## Evidencia vigente

- `app/docs/evidence/CORTE6-RESIDUAL-IDENTITY-ROOT-CAUSE-SOURCE-ONLY-LATEST.json`;
- `app/docs/DIAGNOSTICO-RAIZ-C6-RESIDUAL-IDENTITY-SOURCE-ONLY-20260805.md`.

## Seguridad

Provider/Auth/password/membership/Firestore/Rules/Storage/HR writes, deploy, Make, Gemini, pagos, merge y producción: `0/false`.
