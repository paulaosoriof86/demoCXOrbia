# PENDIENTES PROTOTIPO — C6 PR #7 mergeability PASS / SKIP13 control-plane HOLD

**Fecha:** 2026-08-06

## Cerrado

- [x] Diagnosticar la no-mergeabilidad de PR #7.
- [x] Identificar el conflicto `add/add` en `.github/workflows/cxorbia-v156-atomic-promotion.yml`.
- [x] Resolverlo determinísticamente sin rebase, force-push, nueva rama, nuevo PR ni merge.
- [x] Preservar backend, contratos, overlays, documentación y frontend acumulativo.
- [x] Verificar `mergeable=true`.
- [x] Devolver PR #7 a draft.
- [x] Deshabilitar fail-closed el request SKIP13 no consumido.

## Pendiente real bloqueante

- [ ] Conseguir un carril GitHub Actions que cree un run observable para el adjudicador SKIP13 ya auditado.
- [ ] Ejecutar exactamente una adjudicación read-only sobre los 13 fingerprints.
- [ ] Clasificar especialmente `7cc28c78de9bfda01d14` y sus dos candidatos.
- [ ] Determinar con evidencia si existe acceso efectivo no previsto.

## Condición de continuidad

No reutilizar los requests `...-01` a `...-05`. El último quedó:

```text
enabled=false
consumed=false
status=blocked_control_plane_no_run
allowedExecutions=0
```

Una futura ejecución requiere un request nuevo, exacto y observable después de reparar el control plane. No autoriza:

- merge;
- deploy;
- producción;
- lecturas HR;
- writes Auth, claims, memberships, Firestore, Rules o Storage;
- ejecución parcial del plan Auth de 340 filas.

## P1/P2 no bloqueantes

- Actualizar el texto del body de PR #7 para retirar referencias al request inicial una vez se cierre el próximo bloque observable.
- Simplificar posteriormente los triggers transitorios del workflow SKIP13 cuando exista un carril definitivo.

## Sin impacto Claude

No existen correcciones UI derivadas de este bloque.
