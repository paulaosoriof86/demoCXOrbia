# RESUMEN PARA CLAUDE — C6 diagnostic-contract root fix PASS

## Sin cambios frontend

No modificar `/app/modules`, `/app/core`, Login, diseño ni `CX.data`.

## Contrato backend vigente

```text
preConsensusIncompleteActiveProfiles
completedByConsensus
remainingIncompleteActiveProfiles
pre = completed + remaining
HOLD vectors = booleans, counts and bases only
multi-Auth vector = ordinal, signals, score and margin; no UID/email/PII
group namespace = shopper-visible-login-group-v1
collision comparison = fingerprint sets, not rigid total 64
```

El plan continúa no ejecutable hasta una nueva revalidación provider autorizada. No mostrar ni inferir apellidos, logins técnicos o resolución multi-Auth en UI.

## Ajustes para Academia/manuales

- reemplazar cualquier explicación de `83 vs 12` por las tres métricas separadas;
- no fijar `64/141` ni `65/142` como baseline definitivo;
- documentar que la reconciliación futura será por conjuntos de fingerprints estables.
