# PAQUETE EXCLUSIVO CLAUDE — V108 A V109

Fecha: 2026-07-12

## Propósito

Definir únicamente las correcciones de frontend/prototipo que corresponden a Claude después de la auditoría profunda de V108.

Este paquete reemplaza el paquete anterior para esta candidata. No debe mezclarse con backend, migración, infraestructura o producción.

## Base

- candidata de entrada: `Prototype development request CXOrbia V108.zip`;
- entrega esperada: `Prototype development request CXOrbia V109.zip`;
- V108 no se empalma todavía;
- preservar las mejoras V108 verificadas.

## Correcciones exclusivas de Claude

### 1. Academia

- separar acceso (`tenantId`, proyecto, país, rol) de taxonomía (`módulo`, nivel, paquete);
- conectar un contexto académico canónico para tenant/proyecto/país/rol;
- conservar KPIs sobre la misma colección visible;
- usar usuarios locales existentes con `userId` estable;
- validar creador/revisor/aprobador por ID, no por nombre;
- mantener preview deshabilitado cuando no exista una segunda identidad válida.

### 2. Finanzas/lotes

- separar lotes por tenant, proyecto, país, moneda, periodo y referencia;
- no mezclar GT/GTQ con HN/HNL;
- no usar `Math.random()` para IDs o fallbacks;
- usar ID determinístico de preview basado en la clave homogénea y los IDs ordenados incluidos;
- validar país/moneda incluso cuando exista `loteId` legado;
- enviar faltantes a revisión, sin suma silenciosa.

### 3. Portal Cliente

- aceptar solo scores numéricos finitos;
- excluir `null`, `undefined`, `NaN` e `Infinity`;
- usar un solo criterio compartido:
  - crítico `<70`;
  - atención `70–74`;
  - bueno `75–84`;
  - excelente `>=85`;
- aplicar el mismo helper en KPI, distribución, drill y capacitación.

### 4. Evidencia V109

- probar Admin, Cliente y Shopper;
- reportar únicamente pruebas ejecutadas;
- incluir capturas de Portal Cliente, Academia y lotes;
- generar manifest/build-lock/reporte/verificador V109 consistentes;
- ejecutar `node app/docs/verify-manifest.mjs` con exit code 0;
- mantener 48 módulos y cero errores de consola/página.

## Ya verificado — no reprocesar

- responsive móvil general: 15/15 sin overflow;
- caso principal de 44 sucursales sin score: 0 críticas y 44 pendientes;
- Beneficios sin fallback a otro shopper;
- copy honesto de certificaciones;
- cache demo/real;
- navegación/shell;
- mecanismo de manifest/verificador.

## Exclusiones absolutas

Claude no debe tocar ni agregar tareas de:

- `/backend`;
- `/tools`;
- `/.github`;
- Firebase, Firestore, Auth real o Storage;
- Make o Gemini;
- HR, migración o importadores;
- gates o workflows;
- deploy o producción;
- pagos reales;
- datos sensibles.

## Condición de empalme

No declarar listo para empalme mientras exista:

- curso correcto invisible por scope;
- KPI fuera de scope;
- actores comparados por nombre;
- lote multi-país o multi-moneda;
- ID aleatorio;
- umbrales de score divergentes;
- aggregate inconsistente;
- Cliente/Shopper sin prueba funcional;
- error de consola o página.