# Addendum maestro - antidesvio produccion real TyA

Fecha: 2026-07-09  
Estado: obligatorio para toda continuidad CXOrbia TyA.

## 1. Motivo

Paula detecto un desvio metodologico grave: se siguio avanzando infraestructura/contratos sin mantener al frente la validacion de datos reales TyA/Cinepolis, HR, shoppers, certificaciones, visitas, periodos y liquidaciones.

Este addendum existe para evitar que el trabajo previo se pierda, que se vuelva a pedir informacion ya entregada y que se diluya el objetivo principal: salir a produccion real Phase A lo antes posible.

## 2. Regla de produccion real primero

Desde este punto, ningun bloque backend debe considerarse prioritario si no responde al camino de produccion real Phase A.

La prioridad es:

1. Recuperar y usar todo lo ya documentado sobre HR TyA/Cinepolis.
2. Probar fuente real o export sanitizado real.
3. Confirmar proyecto Cinepolis como proyecto normal, no hardcodeado.
4. Confirmar periodos/quincenas/paises/monedas.
5. Confirmar visitas desde HR y sus estados.
6. Confirmar shoppers historicos y accesos.
7. Confirmar certificaciones ya presentadas.
8. Confirmar liquidaciones/pagos junio.
9. Conectar backend real solo con gates y sin romper `CX.data`.
10. Validar visualmente en URL real antes de cutover.

## 3. No pedir de nuevo lo ya trabajado

Antes de pedir a Paula hoja de ruta, links, columnas, logicas de HR, shoppers, certificaciones, proyecto, periodos o fallas ya revisadas, se debe revisar:

- documento maestro;
- documentos recientes en `app/docs/`;
- docs HR Source / sync / migration / readiness;
- auditorias anteriores;
- handoffs anteriores;
- fuentes y archivos disponibles de la conversacion/proyecto;
- repo y PR activo.

Si despues de revisar todo sigue faltando una fuente real, se debe pedir solo el insumo puntual faltante, explicando que se reviso y no se encontro.

## 4. Trabajo previo que no se puede reiniciar

Se considera trabajo ya conocido y vinculante:

- TyA es el tenant actual.
- Cinepolis es el primer proyecto TyA, pero debe existir como proyecto normal configurable.
- La plataforma debe servir para otros proyectos TyA y otros tenants.
- La HR fue analizada por columnas y reglas.
- La HR debe permitir origen/link configurable por proyecto.
- Se revisaron problemas de lectura HR.
- Se revisaron logicas de la plataforma actual para conservar lo util y no copiar parches.
- Se trabajaron shoppers historicos, accesos, certificaciones ya presentadas y flujos de visitas.
- Junio no debe tratarse como visitas pendientes si lo pendiente son pagos/liquidaciones.
- El frontend aprobado no debe parcharse desde backend.

## 5. Regla anti-infraestructura abstracta

No seguir creando infraestructura general si no queda ligada a una de estas validaciones operativas:

- proyecto real creado/configurable;
- HR real o export sanitizado;
- visitas reales;
- shoppers reales/sanitizados;
- certificaciones reales/sanitizadas;
- liquidaciones/pagos reales/sanitizados;
- Auth/roles necesarios para operar;
- Storage/evidencias necesario para operar;
- Make/HR sync necesario para operar;
- Gemini/certificaciones con revision humana.

Todo contrato nuevo debe decir que dato real Phase A desbloquea o protege.

## 6. Gate obligatorio de datos reales antes de produccion

Produccion queda bloqueada si:

- `app/core/data.js` sigue usando data demo/generica como fuente visible final;
- no hay evidencia de source real o export sanitizado TyA;
- no se puede demostrar que Cinepolis existe como proyecto normal;
- no se puede demostrar lectura/mapping HR;
- no se puede demostrar shoppers/certificaciones/liquidaciones reales o sanitizadas;
- no hay smoke visual sobre URL real verificada.

## 7. Ruta obligatoria inmediata

El siguiente trabajo no debe ser mas infraestructura abstracta. Debe ser:

1. Inventario de documentos/repos existentes donde ya se trabajo HR TyA/Cinepolis.
2. Recuperar el ultimo source lock o export sanitizado real.
3. Probar con gate `tya-real-data-source-proof-gate.mjs` que runtime demo no puede ir a produccion.
4. Crear plan de reemplazo de demo data por fuente real/sanitizada detrás de `CX.data`.
5. Preparar dry-run real TyA si la fuente/export esta disponible.
6. Solo pedir a Paula un archivo/link si no existe en repo/fuentes.

## 8. Claude/prototipo

Claude solo debe usarse cuando el paquete sea pequeno, concreto y necesario para produccion.

No enviarle listas gigantes. Priorizar 3-5 tareas maximas:

- eliminar/ocultar demo data en runtime de salida;
- mostrar estados honestos de import/sync/pagos;
- asegurar proyecto/periodo/HR configurable;
- mostrar datos reales/sanitizados de TyA;
- no hardcodear Cinepolis.

## 9. Instruccion general propuesta para el proyecto

Agregar a las instrucciones generales:

"Antes de continuar CXOrbia TyA, verifica que el bloque avance la salida a produccion real Phase A. No pidas de nuevo HR, columnas, links, reglas, shoppers, certificaciones o logicas ya trabajadas sin revisar primero documento maestro, addenda, app/docs, repo, handoffs y fuentes disponibles. Cinepolis es el primer proyecto TyA, debe estar creado como proyecto normal configurable, no hardcodeado. Si la app sigue en data demo/generica o no hay prueba de datos reales/sanitizados TyA, bloquea produccion y trabaja primero en real-data proof/dry-run."

## 10. Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin import real.
- Sin base vieja conectada.
- Sin datos sensibles.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
