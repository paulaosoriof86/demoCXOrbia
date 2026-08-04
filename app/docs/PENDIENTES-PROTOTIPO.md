# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-04  
**Estado vivo:** `SOURCE_STATIC_PASS__RUNTIME_MULTIROLE_HOLD_CLIENT_CLAIMS__LIVE_HR_660__NO_PRODUCTION`

## 1. Bloqueante real vigente

El gate source/static está en PASS. El runtime acumulativo avanzó hasta selección de identidades reales.

Bloqueante actual:

```text
CLIENT_AUTH_CLAIMS_CONTRACT_NOT_MATERIALIZED_IN_DEV
```

Evidencia sanitizada:

- cuatro registros Cliente candidatos revisados;
- tres identidades Auth existentes encontradas;
- cero identidades con claims completos `cliente/client + tenant TyA + proyecto Cinépolis`;
- cero usuarios creados;
- cero passwords cambiados;
- cero Auth writes.

Portal Cliente no se validará con identidad Staff simulada.

## 2. Hallazgo HR vivo

La HR viva contiene `660` visitas, mientras el snapshot protegido utilizado para relaciones históricas contiene `616`.

El selector dinámico comprobó:

- 616 coincidencias exactas;
- 44 visitas vivas adicionales;
- 208 relaciones shopper;
- 194 shoppers protegidos con histórico;
- Staff/Shopper credential selection PASS.

Todavía debe demostrarse mediante el gate de autoridad dinámica qué periodo corresponde a las 44 visitas adicionales. No afirmar agosto únicamente por diferencia aritmética.

## 3. Causa raíz transversal corregida

Los gates históricos congelaban:

- conteo exacto `616`;
- último periodo `2026-07`.

Eso impedía que una fuente viva creciera normalmente.

Correctivo aplicado:

- autoridad HR dinámica;
- conteos y último periodo derivados de la fuente;
- identidad estable obligatoria;
- cero duplicados obligatorios;
- paridad entre autoridad, Staff, Cliente y Shopper;
- ningún fallo desconocido se relaja.

## 4. Pendiente inmediato

1. ejecutar diagnóstico read-only agregado de claims Cliente;
2. construir plan exacto de reparación DEV con snapshot, target opaco, idempotencia y rollback;
3. obtener una sola autorización expresa para Auth/membership DEV;
4. ejecutar una única reparación;
5. repetir una sola vez runtime multirol;
6. auditar el paquete Claude corregido;
7. aplicar directamente solo con GO;
8. ejecutar gates acumulativos;
9. un único DEV si cambia `app/`;
10. `CHECKPOINT_VISUAL_PHASE_A_COMPLETA`;
11. freeze;
12. confirmar periodo nuevo, disponibles y postulaciones;
13. cutover autorizado.

## 5. Pendientes Phase A después del claims fix

- Staff/Admin: login, navegación, tres recargas y nueva pestaña;
- Cliente: login real, scope Cinépolis y panorama;
- Shopper: identidad exacta, histórico, certificación y portal;
- HR: 660 visitas vivas y periodo más reciente dinámico;
- Finanzas: modelo delegado, `localBilling=false`, regalía 0, Q60/L200;
- Reservas: fail-closed sin fuente canónica de escritura;
- reportes PDF/XLSX/PPTX;
- Login Gravicentra CX portable corregido e integrado mediante bridge seguro.

## 6. Claude frontend

Claude continúa exclusivamente con:

- Login portable;
- órbita;
- responsive;
- banderas dinámicas del tenant;
- tokens;
- i18n;
- evidencia visual.

Claude no resuelve Auth, claims, backend, HR, Finanzas, runtime o deploy.

## 7. Warnings P1/P2

- overlay A+B superseded aún cargado;
- algunas gráficas no aparecen en PDF;
- XLSX mantiene formato básico.

No son P0 demostrados.

## 8. Estado seguro

- cambios funcionales en `app/`: 0;
- Hosting deploy: 0;
- Auth/Firestore/Rules/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
