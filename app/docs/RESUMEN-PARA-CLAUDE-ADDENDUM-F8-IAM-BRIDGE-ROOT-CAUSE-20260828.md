# RESUMEN PARA CLAUDE — ADDENDUM F8 IAM BRIDGE ROOT CAUSE — 2026-08-28

## Frontend: NO TOCAR

Este bloque no autoriza cambios funcionales en `/app/modules`, `/app/core`, shell, login, roles, vistas ni Academia. No existe owner patch frontend derivado de F8 en este momento.

## Estado backend/control-plane

- Phase A `100/100`; Production Real Readiness `95/100`.
- F8 sigue abierto.
- El transporte GCP ya funciona con identidad DEV existente; el primer F8 real autenticó correctamente.
- El supuesto drift del adapter fue un fingerprint incorrecto congelado por F6, no una regresión del asset vivo. El asset vivo coincide con source funcional congelado/runtime congelado/rama actual.
- El manifest histórico permanece inmutable; existe errata overlay canónica para el fingerprint.
- Existe bucket GCS real same-project verificado; el executor v6 ya no confía en el default Firebase inexistente.
- Única frontera restante: cinco permisos Firestore administrativos. No existe puente IAM automático probado desde la identidad DEV.
- Paula autorizó excepcionalmente `roles/datastore.owner` temporal/condicionado a la identidad DEV existente, máximo 120 minutos, con revocación obligatoria; todavía no ha sido aplicado.
- F8 original continúa no consumido; provider writes=0.

## Gate Claude/prototipo posterior a F8

No hacer ajustes ahora. Después de F8 PASS y revocación IAM, backend ejecutará `F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION` para determinar, por evidencia, la última versión **aprobada** de cada módulo y comparar su huella con la canónica y Hosting vivo.

Esa auditoría incluirá:
- `app/modules/**`;
- `app/core/**` relevante;
- index/entrypoints/shell;
- scripts/adapters/rutas;
- referencias a versiones antiguas, módulos huérfanos y assets stale.

Solo si F8.5 encuentra una divergencia real se documentará un ajuste frontend por archivo/módulo. Hasta entonces, no anticipar ni reescribir nada.

## Academia

Sin cambio funcional en este bloque. Si F8.5 detecta que una versión aprobada de módulo o flujo no está servida, registrar entonces el impacto en manuales/cursos/rutas por rol/notificaciones antes de cualquier corrección.

## Próximo estado esperado

1. Grant humano temporal/condicionado autorizado.
2. Capability recheck read-only PASS.
3. F8 single-use successor execution.
4. Revocación del binding temporal verificada.
5. `F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`.
6. Solo después, visualización humana.