# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `C6_SHOPPER_ROOT_FIX_REMOTE_PASS__FINANCE_CANONICAL_PRECEDENCE_STOP_RETRY`

## 1. P0 Shopper anterior — cerrado

El P0:

`SHOPPER NEW TAB RESTORES AUTH AND HR BASE BUT DOES NOT APPLY PROTECTED AUTHORITY`

quedó corregido y comprobado remotamente en el Hosting DEV vigente:

- autoridad protegida aplicada;
- identidad exacta;
- 14 periodos;
- 616 visitas;
- 208 shoppers;
- `ownVisits=1`;
- tres recargas estables;
- nueva pestaña estable.

No reabrir login/Shopper sin una regresión reproducible nueva.

## 2. PASS acumulado actual

- source lock exacto del HEAD autorizado;
- gate estático acumulativo;
- gate estático root fix nueva pestaña;
- un deploy Hosting DEV exitoso;
- paridad remota;
- endpoint HR vivo;
- Staff;
- Shopper;
- Cliente existente con alcance exclusivo `cinepolis`.

## 3. Bloqueante actual

`PROJECT_FINANCIAL_CONFIGURATION_METADATA_NOT_MATERIALIZED_IN_CANONICAL_PROJECTS_BEFORE_NORMALIZATION`

El runtime mantiene dos verdades:

- objetos canónicos: directo, facturación local, regalía 10;
- configuración vigente: delegado, coordinación, regalía 0.

Esto bloquea el cierre de Finanzas y, por orden del gate combinado, la validación final de dominio, Portal Cliente, Portal Shopper y Reservas.

## 4. Correctivo backend focalizado

Archivo principal:

`app/adapters/tya-c6-unified-human-runtime-v1.js`

Debe:

1. resolver projectConfig por llaves técnicas, nunca por nombre visual;
2. aplicar delegado/coordination/regalía 0 a cada periodo canónico correspondiente antes de `normalizeAll()`;
3. conservar Q60 GT y L200 HN como obligación al shopper, no como ingreso;
4. mantener comisión y reparto como configuración requerida, sin inventar valores;
5. agregar gate que compare configuración, `d.period()`, `d.project()` y salida financiera.

## 5. Pendiente de validación después del source fix

Primero, sin deploy:

- sintaxis;
- gate de consistencia financiera;
- gate acumulativo;
- smoke local/read-only;
- documentación.

Solo con PASS source-only:

- autorización nueva para un único deploy DEV;
- paridad remota;
- Staff/Shopper/Cliente;
- dominio/Finanzas/portales/Reservas;
- validación humana;
- freeze C6.

## 6. Pendientes Claude/prototipo no bloqueantes del root fix

### `app/modules/proyecto-wizard.js`

- agregar `Regional`;
- conservar directo/delegado;
- mostrar regalías exclusivamente para facturación local.

### `app/modules/finanzas.js`

- explicar comisión de coordinación y distribución configurable;
- mostrar revisión cuando falte fuente exacta.

### `app/app.js`

- preservar UI aprobada y entrada humana única;
- no reimplementar Auth, reconciliación o precedencia financiera desde UI.

## 7. Prohibiciones

- no segunda candidata, rama, PR, Firebase, Hosting o workflow paralelo;
- no parche visual para ocultar la contradicción financiera;
- no hardcodear Cinépolis por nombre;
- no regalías globales;
- no usar honorario Shopper como ingreso;
- no segundo deploy bajo la autorización consumida;
- no producción antes del PASS acumulativo y aprobación humana.

## 8. P1/P2 posteriores al freeze

- PDF con gráficas;
- Excel con formato;
- exportaciones transversales;
- copy final de fuentes/estados;
- visualización de comisión/reparto;
- optimización de carga;
- review queue y certificaciones.

## 9. Agosto

Agosto solo debe aparecer cuando exista en HR. No se crea por la fecha del sistema. Su activación operativa ocurre después del freeze C6.
