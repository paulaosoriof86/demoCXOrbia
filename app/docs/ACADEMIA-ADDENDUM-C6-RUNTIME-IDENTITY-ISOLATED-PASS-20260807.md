# ACADEMIA — Addendum C6 runtime identity isolated PASS

## Aprendizaje reusable

Separar la identidad de control-plane de la identidad runtime reduce superficie de riesgo. En este bloque la identidad runtime quedó demostrada con:

```text
userManagedKeys=0
directServiceAccountBindings=0
projectRoles=0
```

mientras la credencial de control-plane mantuvo únicamente la visibilidad temporal necesaria para comprobarlo.

También quedó probado que un workflow one-shot nuevo puede activarse de forma determinística instalándolo primero y disparándolo después mediante `pull_request:edited`, conservando `github.event.pull_request.head.sha` como source lock.
