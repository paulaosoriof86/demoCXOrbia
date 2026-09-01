# ACADEMIA — C6 SKIP13 root-fix source-gate HOLD

Aprendizaje reusable: un argumento CLI global (`--self-test`) puede ser observado también por módulos ESM importados que ejecutan lógica module-level basada en `process.argv`. Esto puede contaminar una salida estructurada aunque la sintaxis y el algoritmo bajo prueba sean correctos.

Patrón seguro:

```text
self-test de cada módulo = sin side effects importados
salida = un único documento estructurado
gate = fail-closed antes de provider
```

El bloque actual detuvo correctamente la ejecución antes de cualquier provider read.
