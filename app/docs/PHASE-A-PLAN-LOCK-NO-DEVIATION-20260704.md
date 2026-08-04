# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Corrección prevalente:** 2026-08-04  
**Estado:** `SOURCE_STATIC_PASS__CLIENT_PRESTATE_RESTORED__DOMAIN_GATE_ROOT_FIX_APPLIED__FINAL_RUNTIME_RETRY_PENDING__CLOUD_V5_HOLD__NO_PRODUCTION`

## 1. Objetivo

Cerrar y poner en producción Phase A sobre una sola baseline acumulativa, preservando todo lo aprobado y probado.

Baseline:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- DEV canónico `cxorbia-backend-dev`;
- producción `tya-plataforma`, intacta hasta cutover autorizado.

## 2. Secuencia obligatoria vigente

```text
FUENTES Y APROBACIONES
→ MANIFEST FINAL
→ GATE SOURCE/STATIC
→ RUNTIME MULTIROL
→ DELTA ÚNICO SOLO SI SE DEMUESTRA
→ CLOUD FRONTEND ACUMULADO
→ APPLY_DELTA_DIRECTLY SOLO CON GO
→ GATES
→ DEV ÚNICO SI CAMBIA app/
→ CHECKPOINT VISUAL PHASE A COMPLETA
→ FREEZE
→ PERIODO NUEVO/DISPONIBLES/POSTULACIONES
→ CUTOVER
```

No dividir la aprobación en candidatas o shells parciales.

## 3. Estado alcanzado

### Autoridades

- `29_UNIQUE_PRESERVE_OR_RECONCILE_DECISIONS_CLOSED__0_RESTORE_REQUIRED`;
- RC Phase A smoke técnico y visual PASS;
- M1/Corte 1 aprobado/frozen;
- Corte 2A/V174 aprobado/frozen;
- Corte 3/V182 frozen active baseline;
- C6 entrada, HR, roles, Finanzas y Reservas preservado.

### Manifest

`MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json`.

### Source/static

PASS:

- run `30910224561`;
- artifact `8892730161`;
- 53/53 blobs;
- 111 scripts;
- cero duplicados;
- módulos y navegación multirol;
- report kit presente;
- repositorio sin delta;
- writes 0.

El estado anterior `CREATED_NOT_EXECUTED` queda superseded.

## 4. Autoridad HR

La autoridad es dinámica.

Último runtime observado:

- 15 periodos;
- 660 visitas;
- 209 shoppers.

Queda prohibido usar `616` o `2026-07` como invariantes runtime.

Se conservan:

- stable keys;
- cero duplicados;
- identidad shopper exacta;
- paridad por rol;
- periodo activo igual al último periodo de la fuente.

## 5. Acceso Cliente

La identidad Cliente canónica ya existía. El selector regresivo la omitía porque solo examinaba un bundle legacy.

Correctivos:

- resolución exacta por UID/correo interno;
- claims, membership y sign-in obligatorios;
- cero creación de usuarios;
- cero cambios/reset de contraseña;
- snapshot, idempotencia, readback y rollback.

La ejecución autorizada detectó membership ausente, lo creó temporalmente y avanzó al runtime.

Un gate posterior falló porque esperaba `CX.modules.cliente` en vez del módulo real `CX.modules.cli_dashboard`.

Rollback:

- `PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT`;
- preestado restaurado;
- membership temporal eliminado;
- claims finales sin cambio;
- producción intacta.

El gate y wrapper ya fueron corregidos en fuente. Falta una reejecución final autorizada.

## 6. Cloud frontend

V5:

`HOLD_CLOUD_V5_FRONTEND__NO_APROBADO_PARA_INTEGRACION`.

La V6 acumulativa debe incluir:

- Login y órbita refinados;
- responsive P1;
- PDF P1;
- Excel P2;
- opción visual Regional;
- copy delegado;
- Ficha Shopper presentacional;
- capturas reales y manifest completo.

Cloud no toca backend, Auth, datos, cálculos, permisos, deploy ni producción.

## 7. Phase A indispensable

### Base

- entrada por Administración/Coordinación, Cliente y Shopper;
- Firebase Auth;
- tenant/proyecto/periodo;
- claims y memberships;
- HR viva y refresh;
- `CX.data` canónico;
- navegación y permisos;
- cache/build-lock/service worker.

### Operación

- Dashboard y drilldowns;
- Mi Día/hoja de ruta;
- Proyectos, Periodos, HR e Histórico;
- Visitas, Ficha y Revisión;
- Postulaciones;
- Reservas;
- Shoppers y notificaciones.

### Shopper

- Disponibles;
- Mis Visitas;
- Reservas;
- Mi Día;
- Mi Perfil;
- cuestionario;
- certificaciones e histórico;
- documentos;
- beneficios;
- aislamiento por identidad.

### Finanzas

- Dashboard Financiero;
- liquidaciones;
- movimientos;
- costos;
- CxP/CxC;
- lotes/pagos en estado real;
- multi-país/multi-moneda;
- revisión, conciliación y pago separados;
- modelo delegado, `localBilling=false`, regalía 0, Q60 GT/L200 HN.

### Portales/reportes

- Portal Cliente;
- Portal Shopper;
- reportes Admin/Cliente/Shopper;
- PDF/XLSX/PPTX;
- branding, periodo, alcance, fuente, filas y gráficas coherentes;
- cero métricas fabricadas.

## 8. P1/P2 vivos

- overlay A+B superseded;
- algunas gráficas no aparecen en PDF;
- Excel tiene presentación básica;
- responsive parcial.

Cloud V6 recibe las deudas frontend. No reabrir autoridades funcionales sin P0 demostrado.

## 9. Gate visual

`CHECKPOINT_VISUAL_PHASE_A_COMPLETA`

Orden:

1. entrada/contexto/navegación;
2. Dashboard/hoja de ruta/Histórico/refresh;
3. Visitas/Postulaciones/Reservas;
4. Shoppers/perfiles;
5. Finanzas;
6. portales;
7. reportes/exportaciones;
8. smoke multirol, recarga y nueva pestaña.

## 10. Prohibiciones

- no candidata, rama, PR, shell, Firebase o Hosting paralelos;
- no aprobación fragmentada;
- no parche UI desde backend;
- no usuario Cliente nuevo para evitar diagnosticar la identidad existente;
- no JWT Emergent;
- no conteos/meses congelados;
- no writes fuera de autorización;
- no Make/Gemini/pagos;
- no merge/producción antes del PASS acumulativo y humano.

## 11. Siguiente bloque exacto

```text
AUTORIZACIÓN ÚNICA DE REEJECUCIÓN FINAL
→ SNAPSHOT CLIENTE
→ MEMBERSHIP IDEMPOTENTE
→ READBACK
→ RUNTIME MULTIROL CON GATE CORREGIDO
→ CONSERVAR SOLO CON PASS / ROLLBACK SI FAIL
```

En paralelo:

```text
CLOUD V6
→ AUDITORÍA FOCAL
→ APPLY_DELTA_DIRECTLY SOLO CON GO
```

Después:

```text
GATES
→ DEV ÚNICO SI CAMBIA app/
→ CHECKPOINT VISUAL
→ FREEZE
→ PERIODO NUEVO/DISPONIBLES/POSTULACIONES
→ CUTOVER
```

## 12. Estado seguro

- cambios funcionales `app/` en el bloque: 0;
- estado proveedor restaurado: sí;
- deploy: 0;
- Firestore de negocio/HR/Rules/Storage: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
