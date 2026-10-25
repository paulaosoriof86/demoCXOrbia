# ACADEMIA — Impacto C6 request HR viva v3 sin checkpoint

## Contenido que debe incorporarse

1. Diferenciar `workflow solicitado` de `workflow observado`.
2. Registrar fronteras previas a una integración externa:
   - inicio con provider reads cero;
   - entrada a frontera provider;
   - secuencia provider completada;
   - estado final.
3. Aplicar fail-closed cuando no existe siquiera el primer checkpoint.
4. No inferir consumo cero ni consumo realizado por ausencia de logs.
5. No repetir una integración hasta conocer el checkpoint exacto o recibir nueva autorización.

## Caso TyA

```text
requestCommit=d62dbae9b10b0650c2940f4b2bf7d456cb34fc83
firstCheckpointObserved=false
providerReadConsumption=UNKNOWN_NO_CHECKPOINT_EVIDENCE
STOP_RETRY=true
```

## Rutas por rol y manuales

- Administración/Operaciones: explicar estado `fuente viva pendiente de ejecución observable`.
- Soporte técnico: revisar Actions/control-plane antes de reintentar.
- Auditoría: conservar commit exacto, autorización y ausencia de checkpoints.
- Claude/prototipo: no presentar `2026-08` como confirmado.

## Seguridad

Sin provider writes, datos, Auth, deploy, merge o producción.
