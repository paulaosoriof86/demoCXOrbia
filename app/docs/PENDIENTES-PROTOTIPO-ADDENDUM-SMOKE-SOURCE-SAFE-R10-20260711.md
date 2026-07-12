# PENDIENTES PROTOTIPO — addendum smoke source-safe R10

Fecha: 2026-07-11

## Regla

No se agregan correcciones frontend por intuición. El nuevo smoke R10 debe producir evidencia sobre la baseline V106 y solo sus hallazgos concretos pasan a Claude.

## Validaciones visuales obligatorias R10

### Admin

- contexto tenant/proyecto correcto;
- selector y proyecto Cinépolis visibles como configuración, no lógica global;
- Dashboard sin KPIs fabricados;
- Proyectos, Visitas, Postulaciones, Certificaciones, Finanzas y Academia renderizan;
- ninguna acción afirma sync, envío o pago real sin confirmación.

### Cliente

- shell y proyecto correctos;
- síntesis source-honest;
- estados vacíos explicables cuando la fuente no ofrece el dato;
- sin acceso a información técnica, otros tenants o shoppers.

### Shopper

- shell correcto;
- visitas y certificaciones según contexto;
- Beneficios limitado al shopper autenticado;
- no repetir certificación carryover;
- no exponer otros shoppers, lotes completos o datos financieros ajenos.

## Pendientes netos previos que permanecen

1. manifest interno V106 reproducible;
2. Portal Cliente source-honest;
3. aislamiento de fixtures por procedencia/namespace;
4. pagos/lotes con evidencia financiera completa;
5. Beneficios por shopper autenticado;
6. permisos con contexto real en call-sites;
7. certificaciones con lifecycle y actores autenticados;
8. métricas financieras con fuente;
9. copy/manuales residuales;
10. Academia profunda, editable e interactiva.

## No reabrir

- arquitectura modular;
- empalme V105/V106;
- conteos 14/616/213/572;
- proyecto Cinépolis configurable;
- separación liquidación/pago;
- estados preview/pending_backend ya corregidos;
- dashboard sin métricas inventadas;
- certificación y lotes bloqueados honestamente cuando falta backend.

## Criterio de prioridad

- P0: shell, módulo o ruta no renderiza; error de página; cruce de tenant/proyecto; exposición PII; acción falsa real.
- P1: módulo renderiza pero estado/copy/scope es incorrecto.
- P2: mejora UX, Academia o claridad sin bloqueo operativo.

## Entrega a Claude

Los hallazgos se anexan al paquete acumulado post-empalme con:

- rol;
- módulo/ruta;
- captura;
- error o copy exacto;
- impacto Phase A;
- resultado esperado;
- archivos frontend permitidos;
- prohibición de tocar backend/gates/datos reales.
