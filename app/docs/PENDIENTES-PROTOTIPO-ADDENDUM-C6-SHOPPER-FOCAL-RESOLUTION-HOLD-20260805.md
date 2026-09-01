# PENDIENTES PROTOTIPO — C6 Shopper Focal Resolution HOLD

**Fecha:** 2026-08-05

## P0 antes de cualquier Auth write

1. Clasificar 109 grupos de `nombre.apellido` repetido:
   - 94 grupos de 2 perfiles;
   - 11 grupos de 3 perfiles;
   - 3 grupos de 4 perfiles;
   - 1 grupo de 5 perfiles;
   - 238 perfiles afectados.

2. Resolver mediante claves técnicas:
   - alias históricos del mismo Shopper;
   - perfiles históricos distintos que no requieren Auth;
   - personas activas distintas con el mismo login visible.

3. Revisar 1 perfil con dos candidatos Auth.

4. Completar 3 perfiles sin apellido técnico suficiente.

5. Recalcular el plan de 340 filas después de la resolución:

```text
Actual, no ejecutable:
CREATE_AUTH=6
UPDATE_AUTH=2
NO_OP=10
HOLD=241
PRESERVE_NO_AUTH=81
```

## Resuelto y no reabrir

- Paula Staff y Paula Shopper son principals separados;
- de las dos candidatas Shopper de Paula, una es activa y la otra histórica preservada;
- `nombre.apellido / Nombre123*` sigue siendo el contrato TyA;
- membership no es requisito Shopper;
- el baseline se reconcilia por conjuntos de fingerprints, no por igualdad rígida de totales históricos;
- no deduplicar por nombre visual.

## Bloques prohibidos

No crear o modificar Auth, contraseñas, memberships, Firestore, Rules, Storage, HR, Hosting, Cloud Run, Make, Gemini, pagos, merge ni producción.
