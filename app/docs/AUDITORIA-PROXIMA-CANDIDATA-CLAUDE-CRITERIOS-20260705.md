# Auditoria proxima candidata Claude - Criterios post V87

Fecha: 2026-07-05

## Objetivo

Definir criterios estrictos para auditar la proxima candidata que entregue Claude despues del P0.

## Punto de partida

- V87 no tuvo delta real contra V86.
- V87 sigue bloqueada por P0 de honestidad operativa.
- Ninguna candidata nueva debe empalmarse sin auditoria forense.

## Checklist forense obligatorio

### 1. Comparacion estructural

- Extraer ZIP candidata.
- Contar archivos totales en `/app`.
- Comparar contra baseline inmediata.
- Listar agregados.
- Listar eliminados.
- Listar modificados.
- Confirmar si existe delta real.

### 2. Validacion index.html

- Listar scripts locales.
- Confirmar que todos existen.
- Confirmar 0 duplicados.
- Confirmar 0 rutas huerfanas.
- Confirmar externos esperados.

### 3. Validacion JS

- Ejecutar `node --check` en JS modificados.
- Si hay duda, ejecutar en todos los JS.
- Confirmar 0 fallas.

### 4. Busqueda P0

Buscar apariciones operativas de:

- `WhatsApp enviado`
- `Correo enviado`
- `HR sincronizada`
- `Sincronía automática`
- `sincroniza la HR externa`
- `mueve la liquidación`
- `Cuestionario enviado`

Cualquier aparicion residual debe clasificarse como:

- corregida;
- documental/no operativa;
- P0 vivo;
- requiere revision manual.

### 5. Proteccion backend

Confirmar que Claude no modifico:

- `app/contracts/**`
- `tools/migration/**`
- gates;
- providers;
- backend docs salvo que se le haya pedido.

### 6. Seguridad y produccion

Confirmar que la candidata no declara ni activa:

- production ready;
- source lock;
- deploy;
- merge;
- import real;
- Firestore writes;
- Storage writes;
- HR writes;
- Make real;
- Gemini real;
- correo real;
- WhatsApp real;
- pagos reales.

### 7. Decision

Despues de auditoria, clasificar:

- `critical_blocker`: si P0 sigue vivo o hay regresion/sintaxis/rutas.
- `candidate_for_empalme`: si corrige P0 y no introduce riesgos.
- `no_real_delta`: si vuelve a entregar ZIP sin cambios.
- `manual_review_required`: si el delta es ambiguo.

## Resultado esperado

No empalmar ni declarar source lock hasta que la auditoria confirme correccion P0 real, sin regresiones y sin activaciones reales.
