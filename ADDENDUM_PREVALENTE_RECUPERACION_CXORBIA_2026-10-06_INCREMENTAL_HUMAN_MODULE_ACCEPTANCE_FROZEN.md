# ADDENDUM PREVALENTE — I3 INCREMENTAL HUMAN MODULE/BLOCK ACCEPTANCE — 2026-10-06

**ID:** `CXORBIA-I3-INCREMENTAL-HUMAN-MODULE-ACCEPTANCE-20261006`  
**Estado:** `FROZEN_PREVALENT_UNTIL_I3_GO_OR_NEWER_EXPLICIT_SUPERSESSION`  
**Iteración:** `I3 — FUNCTIONAL CLOSURE`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `recovery/cxorbia-phase-a-20260831`  
**Control HEAD antes de congelar:** `7874efb3cb5ceb8e679af89a912a4709766b6787`  
**Product source de partida:** `be4e54e92285cef24f4b4c5442383a8076df6664`  
**Producción:** `DO_NOT_TOUCH`

## 1. Cambio explícito de Paula

Este addendum supersede únicamente la regla del lock anterior que difería toda revisión humana hasta el final.

Nueva regla obligatoria:

**Cada módulo o bloque cohesivo, cuando alcance estado funcional y visual listo, debe ser probado antes de entregarse a Paula, revisado con TinyFish y luego mostrado a Paula para PASS/FAIL incremental. No se continúa al siguiente bloque como cerrado hasta recibir ese PASS.**

El PASS incremental no equivale a Gate20, Gate21, I3=GO ni autorización I4.

## 2. Qué NO cambia

Se conservan:
- una sola rama/candidata acumulativa;
- no ramas/candidatas paralelas;
- RECOVER, DO NOT REBUILD;
- no wholesale revert;
- 45 observaciones congeladas;
- MODULE_TRUTH_MATRIX V7;
- no producción antes de I3=GO + autorización I4;
- un solo artifact **certificado final** y no rebuild entre certificación final y producción.

## 3. DEV incremental vs artifact final

Para permitir validación humana temprana sin romper la regla de release:

- pueden existir materializaciones DEV **incrementales de validación** sobre la misma línea acumulativa;
- ninguna materialización incremental es artifact certificado de producción;
- cada bloque aprobado se vuelve autoridad protegida para los bloques siguientes;
- al cerrar todos los bloques se crea un único build/artifact final certificable;
- Gate20 y Gate21 sólo aplican al artifact final completo.

## 4. Gate obligatorio por módulo/bloque

Cada bloque debe recorrer:

`OWNER_PROVEN -> SOURCE_FIXED -> SOURCE_PROVEN -> DEV_BLOCK_MATERIALIZED -> TECHNICAL_E2E_PASS -> TINYFISH_PRE_HUMAN_PASS -> PAULA_HUMAN_PASS -> BLOCK_LOCKED`

Si Paula da FAIL:
- se reabre sólo ese bloque/owner;
- se clasifica con taxonomía Recovery;
- se corrige sobre la misma candidata acumulativa;
- se repiten pruebas + TinyFish + Paula;
- no se avanza como bloque cerrado.

## 5. TinyFish pre-humano obligatorio

Antes de entregar un link de revisión a Paula, TinyFish debe revisar la ruta exacta del bloque en DEV y comprobar, según aplique:

- jerarquía visual;
- legibilidad/contraste;
- tenant accent;
- tablas/modales;
- labels humanos y ausencia de tokens técnicos;
- responsive básico;
- acciones visibles;
- navegación;
- estados vacíos/error;
- flujo funcional real que pueda ejecutar;
- consistencia con el frontend aprobado y decisiones congeladas.

TinyFish no sustituye provider ACK, GitHub Actions, readback ni la aceptación humana de Paula.

## 6. Registro anti-regresión por PASS

Cada PASS de Paula genera un receipt inmutable por bloque con:
- blockId;
- módulos/surfaces;
- owner files;
- source SHA/tree;
- blobs de owners;
- DEV artifact/build/runtime/Hosting;
- pruebas técnicas y E2E;
- resultado TinyFish;
- decisión de Paula;
- fecha;
- visual markers/action inventory aceptados.

Los bloques posteriores deben fallar cerrado si degradan un receipt aprobado.

## 7. Bloques de aceptación incremental

### B1 — Identidad shopper + Mi Día / shell identity
Incluye:
- Julissa/Paula session visible owner;
- sidebar;
- saludo Mi Día;
- canonical shopper ownership;
- identidad transversal visible;
- jerarquía de Mi Día.
No toca todavía el resto de perfil funcional salvo dependencia exacta.

### B2 — Mi Perfil + Shoppers Admin
Incluye:
- edición nombre/apellido;
- país/ciudad;
- filtro país;
- banking completo para Admin autorizado;
- ficha shopper completa;
- merge modal visual preservando gobernanza exacta.

### B3 — Mis Visitas + Agendar + Check-in
Incluye:
- diseño aprobado;
- Agendar E2E;
- reprogramar;
- cámara/foto/GPS;
- Storage/provider ACK;
- recuperación/descarga de evidencia externa.

### B4 — Certificaciones
Incluye:
- carryover;
- Cinépolis existente;
- selector múltiple;
- recertificación;
- IA provider;
- exact question count;
- misma autoridad visible en Mis Visitas y Certificaciones.

### B5 — Beneficios
Incluye:
- tarjetas/jerarquía;
- tabla/histórico;
- labels;
- identidad canónica;
- verdad de pagos.

### B6 — Dashboard + Visitas / Detalle
Incluye:
- selección múltiple;
- acciones masivas/individuales;
- WA/correo según provider real;
- acciones contextuales;
- detalle rico;
- no tokens técnicos.

### B7 — Postulaciones / Asignaciones
Incluye:
- aprobar/rechazar/standby/editar/reasignar/cancelar;
- pedir acción al shopper;
- targets correctos;
- agendamientos;
- no duplicados;
- frontend aprobado.

### B8 — Finanzas
Incluye:
- Movimientos;
- CxP/CxC;
- Liquidaciones;
- pago individual;
- lotes;
- soporte;
- conciliación;
- histórico hasta julio;
- lote 02-10 para agosto + subset septiembre;
- operación viva desde 01-10.

### B9 — Transversal final
Sólo después de B1–B8 PASS:
- regresión cruzada;
- 21/21 MATCH;
- un único artifact final;
- E2E Admin/Shopper;
- Paula final short-path confirmation;
- Gate20/Gate21;
- I3=GO.

## 8. Regla de avance

Puede trabajarse técnicamente en más de un owner dentro de una misma sesión, pero **un bloque sólo se marca cerrado después de TinyFish PASS + Paula PASS**.

Paula no volverá a recibir una candidata “supuestamente completa” sin haber aprobado antes los bloques incrementales ya terminados.

## 9. Siguiente acción exacta

`B1: resolver identidad visible canónica + Mi Día/shell identity, ejecutar source proof, materializar B1 DEV, ejecutar E2E técnico + TinyFish y entregar a Paula para PASS/FAIL antes de cerrar B1.`

## 10. Mutabilidad

FROZEN. Cualquier cambio exige addendum posterior con BEFORE/AFTER, causa, evidencia y efecto.
