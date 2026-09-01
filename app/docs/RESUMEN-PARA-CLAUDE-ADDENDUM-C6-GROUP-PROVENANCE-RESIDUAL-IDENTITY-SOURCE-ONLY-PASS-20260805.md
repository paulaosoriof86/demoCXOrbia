# RESUMEN PARA CLAUDE — C6 group provenance source-only PASS

## Sin cambios frontend

No modificar `/app/modules`, `/app/core`, Login, estilos ni `CX.data`.

## Resultado backend relevante

```text
64 reference groups / 65 planner groups
+1/-0
classification=REFERENCE_UNIVERSE_MISMATCH_PROVEN
exact group cause=NOT_PROVEN_MEMBER_PROVENANCE_MISSING
suffix algorithm defect=false
```

La diferencia no debe presentarse en UI como error de usuario ni como colisión irresuelta. Es una diferencia entre universos diagnósticos: referencia explícita/técnica frente a planner post-consenso.

## Residuales

- 12 perfiles requieren evidencia autorizada de apellido; no inferir ni mostrar valores estimados.
- un empate multi-Auth requiere adjudicación source-safe; no seleccionar por antigüedad, orden o estado habilitado.
- el plan 340 continúa no ejecutable y no permite aplicación parcial.

## Academia y manuales

Documentar:

- comparación de conjuntos solo con universos equivalentes;
- vector de procedencia por miembro sin PII;
- diferencia entre defecto de comparador y defecto de asignación de sufijo.
