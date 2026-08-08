# Phase A real data proof gate TyA

Fecha: 2026-07-09  
Bloque: prueba de datos reales antes de produccion  
Estado: gate creado, produccion bloqueada hasta evidencia real.

## 1. Motivo

Paula alerto correctamente que el objetivo es produccion real Phase A, no infraestructura abstracta.

La plataforma no puede avanzar a produccion si no existe evidencia verificable de que TyA/Cinepolis, HR, proyectos, periodos, visitas, shoppers, certificaciones y liquidaciones se estan leyendo desde fuente real o import sanitizado real.

## 2. Hallazgo critico

El archivo runtime actual `app/core/data.js` se declara explicitamente como capa mock/generica y sin marcas, proyectos ni personas reales.

Tambien `app/core/hr.js` contiene un motor HR util como patron, pero con HR externa simulada.

Por lo tanto, no se debe afirmar que la app ya esta mostrando datos reales TyA/Cinepolis.

## 3. Archivo creado

- `tools/contracts/tya-real-data-source-proof-gate.mjs`

## 4. Que valida el gate

El gate detecta si la app sigue usando marcadores demo/genericos, por ejemplo:

- Mock data layer;
- GENÉRICO;
- sin marcas, proyectos ni personas reales;
- Proyecto Retail;
- Cliente Retail demo;
- Evaluador demo;
- forms.example.com;
- HR externa simulada;
- filas HR simuladas.

Si esos marcadores existen, el resultado esperado es:

`NO_GO_REAL_DATA_NOT_PROVEN`

## 5. Evidencia requerida antes de produccion

Antes de cutover a produccion se requiere demostrar:

1. Source lock real TyA o export sanitizado real.
2. Proyecto Cinepolis creado con projectId estable.
3. Periodos/quincenas/paises/monedas configurados desde fuente real.
4. Visitas leidas desde HR con hrRowId/visitId.
5. Shoppers historicos creados o mapeados sin datos sensibles crudos.
6. Certificaciones ya presentadas conservadas.
7. Liquidaciones/pagos junio representados.
8. Smoke humano en URL real verificada.

## 6. Decision metodologica

Este gate cambia la prioridad inmediata:

- No seguir acumulando infraestructura sin prueba de datos reales.
- No pedir visualizacion hasta tener deploy real o evidencia de source real en repo/export.
- No enviar a produccion con demo data.
- Si falta fuente real/export sanitizado, pedirla de forma concreta.

## 7. Que necesito de Paula si no existe ya en repo/fuentes

Para validar TyA real, se necesita uno de estos insumos:

- export sanitizado de HR actual; o
- ZIP/archivo fuente ya aprobado con datos limpios; o
- ubicacion clara en repo/fuentes donde ya exista el export sanitizado.

No deben incluirse datos sensibles crudos como DPI, banco, NDA firmado, telefonos/correos crudos si no son estrictamente necesarios y protegidos.

## 8. Impacto Phase A

Este bloque protege el objetivo de salida operativa:

- evita enviar demo a produccion;
- evita creer que Cinepolis esta operativo sin evidencia;
- obliga a validar proyectos, periodos, visitas, shoppers, certificaciones y pagos;
- alinea infraestructura con datos reales.

## 9. Clasificacion obligatoria

- Reusable CXOrbia: si. Gate reusable para cualquier tenant antes de produccion.
- Exclusivo cliente: si. Aplica especificamente a TyA/Cinepolis Phase A.
- Claude/prototipo: si. Claude no debe entregar prototipo que parezca real si sigue en demo.
- Academia: si. Certificaciones ya presentadas deben validarse contra fuente real.
- Sin impacto Claude: no.

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
