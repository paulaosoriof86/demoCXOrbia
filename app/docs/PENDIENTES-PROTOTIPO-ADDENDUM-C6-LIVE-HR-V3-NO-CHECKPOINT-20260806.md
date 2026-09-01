# PENDIENTES PROTOTIPO — Addendum C6 request HR viva v3 sin checkpoint

## P0 único actual

El request v3 autorizado fue emitido, pero no publicó el primer checkpoint de control-plane.

```text
requestCommit=d62dbae9b10b0650c2940f4b2bf7d456cb34fc83
firstCheckpointObserved=false
providerReadConsumption=UNKNOWN_NO_CHECKPOINT_EVIDENCE
STOP_RETRY=true
```

## Pendiente exacto

1. Diagnosticar read-only por qué GitHub Actions no publicó `WORKFLOW_STARTED_PROVIDER_READS_0`.
2. No modificar el request actual.
3. No emitir segundo trigger.
4. No consultar HR nuevamente.
5. Solo con prueba reproducible de que no se alcanzó la frontera provider, solicitar autorización fresca.
6. Después, confirmar `2026-08`, tabs GT/HN, mutación histórica y una sola `sourceRevision` transversal.

## Protegido

- identidades Shopper `HOLD=0` y SKIP13;
- frontend acumulativo;
- Login y `CX.data`;
- Finanzas, Liquidaciones, Portal Cliente, Portal Shopper y Reservas;
- PR #7 draft/open/no merge;
- producción intacta.

## P1/P2

PDF con gráficas, presentación Excel y mejoras visuales permanecen documentados; no sustituyen el P0 de control-plane HR viva.
