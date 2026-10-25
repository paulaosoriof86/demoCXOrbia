# ACADEMIA — C6 SKIP13 self-test harness PASS

## Aprendizaje reusable

Un módulo ESM importado no debe ejecutar comportamiento CLI basándose únicamente en `process.argv`. Si el proceso llamador comparte `--self-test`, el módulo importado puede producir side effects de salida y romper gates que esperan un único payload estructurado.

Root-fix aplicado:

```text
CLI self-test => solo si import.meta.url corresponde al entrypoint real
imported module + foreign --self-test => 0 bytes de salida
```

El patrón preserva además namespaces criptográficos no intercambiables para perfiles, candidatos Auth, perfiles multi-Auth y member provenance.
