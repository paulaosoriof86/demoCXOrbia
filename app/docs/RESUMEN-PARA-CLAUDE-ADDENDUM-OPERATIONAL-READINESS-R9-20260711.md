# Resumen para Claude — addendum Operational Readiness R9

Fecha: 2026-07-11

## Base que Claude debe usar

Continuar incrementalmente sobre el paquete V105 / identidad interna V106. No volver a V103/V104 ni reconstruir lo ya preservado. El backend R5, plan R6, executor R8 y gate R9 están fuera del carril de Claude.

## Qué resolvió backend

R9 expone un modelo reutilizable de readiness con cuatro carriles:

1. baseline empalmada y datos source-safe;
2. base DEV nueva/vacía verificada read-only;
3. pagos y certificaciones validados por dry-run;
4. smoke source-safe post-empalme.

Estados permitidos:

- ready;
- pending evidence;
- pending sources;
- partial;
- blocked;
- pending smoke.

Decisión global:

- HOLD por insumos/evidencia; o
- listo para revisión humana.

Nunca debe mostrarse como importado, conectado, materializado o en producción.

## Ajuste reusable para prototipo

Cuando se incorpore visualmente, mostrar una tarjeta/matriz de readiness sin datos crudos con:

- carril;
- estado;
- conteos sanitizados;
- blocker;
- siguiente acción;
- fecha/hash de evidencia cuando exista.

El botón de materialización debe permanecer deshabilitado mientras el gate sea HOLD y aun con los cuatro carriles READY debe indicar “Solicitar revisión de autorización”, no “Importar” ni “Conectar”.

## No reabrir

- arquitectura modular;
- 14 periodos / 616 visitas / 213 shoppers;
- separación liquidación/pago;
- plan create-only;
- reviewQueue/auditEvents;
- estados honestos ya corregidos;
- puntos HECHO de la auditoría V105/V106.

## Pendientes frontend netos que siguen vigentes

R9 no sustituye los P0/P1 ya documentados de V106:

- Portal Cliente sin síntesis fuera de demo;
- aislamiento de fixtures por procedencia;
- evidencia financiera completa para pago/lote;
- Beneficios limitado al shopper autenticado;
- permisos con contexto real en call-sites;
- certificación con actores autenticados y lifecycle completo;
- métricas financieras con fuente;
- copy/manuales residuales;
- manifest interno y smoke completo;
- Academia profunda según contrato.

## No tocar

- `backend/`;
- `tools/`;
- `.github/workflows/`;
- snapshot/adapters TyA;
- Firebase/Auth/Storage/Functions;
- Make/Gemini;
- pagos reales;
- imports/materialización;
- producción.
