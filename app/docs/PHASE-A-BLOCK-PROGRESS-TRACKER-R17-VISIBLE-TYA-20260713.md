# Tracker Phase A — R17 visible TyA

Fecha: 2026-07-13

## Estado

| Bloque | Estado | Resultado |
|---|---|---|
| V110 source lock | PASS | 1,426/1,426 |
| Diagnóstico visible | COMPLETED | orden de binding + IDs de periodos corregidos |
| Adapter build-only | PASS | posterior a `data-source.js` |
| Visible TyA smoke local/CI | PASS | 14 periodos, 616 visitas, 210 shoppers, 13/13 rutas |
| Redeploy Hosting DEV corregido | SUCCESS | run `29285177647`, commit desplegado `cf4c845722e2bbe2b401b2b332ff9f4d2f6cb803` |
| Proof remoto exacto | PASS | build `tya-visible-r17-source-safe` |
| Smoke remoto independiente | PASS | run `29285540738`, 13/13 rutas, 0 blockers |
| Revisión humana Paula | READY | checklist específico entregado en este bloque |
| Firestore materialization | HOLD | sin writes |
| Auth/claims | HOLD | sin writes |
| Producción | HOLD | no autorizada |

## Resultado remoto verificado

- login visible TyA;
- texto `Tenant TyA · Phase A controlada`;
- países GT y HN;
- sin badge `Demo comercial`;
- proyecto raíz Cinépolis;
- 14 periodos con 14 IDs únicos;
- periodo actual `cinepolis-2026-07` / JUL 2026;
- 616 visitas históricas;
- 44 visitas en el periodo actual;
- 210 shoppers source-safe;
- 0 proyectos demo Retail/Banca/Restaurantes;
- `Source-safe (preview) · Listo`;
- 13/13 rutas críticas renderizadas;
- 0 errores de consola o página;
- `imported:false` y `production:false`.

## Evidencia

### Redeploy Hosting DEV

- run: `29285177647`;
- artifact: `visible-tya-r17-hosting-redeploy-report`;
- digest: `sha256:756049ce4eb22e279b21f93a74e98e88541a262eb2937cb3141868a006acf9d4`.

### Smoke remoto independiente

- run: `29285540738`;
- artifact: `phase-a-remote-visible-tya-r17-smoke-report`;
- digest: `sha256:8b849b2248c2d277a2b8434035d4e2679818a89f7a630b0615fdd8fe1277b1f7`.

## Hallazgos visibles no bloqueantes

- El usuario de prueba todavía aparece como `Admin Demo`; Auth real continúa HOLD.
- En `Mi Día`, el selector de periodo muestra JUL 2026, pero el calendario puede abrir visualmente en junio de 2026. Se documenta para Claude/prototipo; no altera las 44 visitas del periodo activo ni el histórico.
- Los 3 shoppers faltantes del universo 213 continúan en revisión backend; no se inventan ni deduplican por nombre.

## Siguiente bloque exacto

1. Revisión humana guiada de la URL DEV corregida.
2. Registrar `APROBADO`, `DIFERENCIA` o `ERROR` por módulo.
3. Continuar R16E read-only / materialización controlada solo después de los gates correspondientes, sin asumir writes.

## Gates

- Hosting DEV visible TyA: DEPLOYED + REMOTE PASS;
- Firestore/Auth/Storage writes: HOLD;
- import/rules/Functions: HOLD;
- Make/Gemini/pagos: HOLD;
- producción: HOLD.

## Clasificación

- **Reusable CXOrbia:** gate que valida contenido visible, proyecto raíz, periodo activo y rutas por rol.
- **Exclusivo cliente:** TyA/Cinépolis, 14 periodos, 616 visitas y 210/213 shoppers.
- **Claude/prototipo:** revisar calendario de Mi Día vs periodo seleccionado; mantener copy honesto de Auth y source-safe.
- **Academia:** enseñar diferencia entre payload, binding, contenido visible y ambiente productivo.
- **Sin impacto Claude:** deploy Hosting-only, proof remoto, hashes y cleanup del workflow temporal.
