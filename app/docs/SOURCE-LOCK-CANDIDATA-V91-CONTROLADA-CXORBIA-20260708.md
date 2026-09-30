# Source lock candidata V91 controlada CXOrbia

Fecha: 2026-07-08  
Archivo: `Prototype development request CXOrbia V91.zip`  
SHA256: `c6fe10ebcdd379a98f3cfb38065434321933cbf4fe4755df50ec8fe2f1cad6f8`  
Estado: source lock documental de candidata, no produccion.

## Decision

V91 queda como ultima candidata recibida y debe usarse como base de trabajo controlada.

No se autoriza empalme ciego porque la auditoria forense detecto blockers:

- `app/index.html` del ZIP no incluye `core/production-copy-guard.js`, que ya existe en el PR actual.
- Academia no muestra acciones administrativas visibles para borrar/archivar/duplicar/versionar cursos.
- Boton `Crear con IA` de Academia requiere verificacion funcional porque el handler parece no estar cableado.
- Quedan residuos P0 de copy honesto en modulos.
- Docs `RESUMEN-PARA-CLAUDE.md` y `PENDIENTES-PROTOTIPO.md` dentro del ZIP estan desactualizados frente al backend acumulado actual.

## Empalme permitido

El empalme debe hacerse controlado:

1. Mantener `core/production-copy-guard.js` en `app/index.html`.
2. Agregar scripts nuevos `modules/diagnostico.js` y `modules/administrabilidad.js`.
3. Integrar cambios frontend V91 solo como candidata de trabajo, no produccion.
4. No reemplazar docs vivos del repo con docs viejos del ZIP.
5. Mantener todos los documentos backend recientes y addenda vivos.
6. Documentar cada archivo actualizado.
7. Ejecutar gates despues del empalme.

## Estado NO GO para produccion

V91 no queda lista para produccion porque copy P0, Academia admin actions y guard preservation deben resolverse antes de cualquier RC real.

## Estado seguro

Sin deploy.  
Sin produccion.  
Sin merge.  
Sin import real.  
Sin pagos reales.  
Sin provider real.  
Sin datos sensibles.
