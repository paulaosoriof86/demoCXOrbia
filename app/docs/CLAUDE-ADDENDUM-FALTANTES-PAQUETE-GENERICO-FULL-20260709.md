# Claude addendum faltantes paquete generico full

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Resultado de auditoria del paquete enviado

El paquete `CLAUDE_PACKAGE_CXORBIA_PROTOTIPO_GENERICO_FULL_BACKEND_FLUJOS_ACADEMIA_20260709.zip` es util como base generica, pero no era absolutamente completo acumulado.

Debe enviarse este addendum a Claude junto con el paquete ya enviado.

## Faltantes que deben agregarse al trabajo de Claude

### 1. Auditoria forense previa obligatoria

Antes de modificar, Claude debe auditar la candidata actual contra la baseline viva y contra el paquete:

- archivos agregados/eliminados/modificados;
- scripts en `index.html`;
- `app/sw.js` y cache PWA;
- `manifest`/favicon/iconos;
- rutas duplicadas o huerfanas;
- modulos que prometen integraciones reales;
- regresiones de tenant/proyecto/periodo;
- textos residuales de demo;
- compatibilidad mobile/PWA.

Claude no debe implementar sin esta auditoria.

### 2. Alcance correcto de Claude vs backend

Claude debe trabajar prototipo/UI y documentacion visual. No debe mover backend real ni cambiar contratos de import o Firebase salvo que sea solo para dejar UI preparada.

Debe documentar todo en:

- pendientes de prototipo;
- resumen para backend;
- cambios locales;
- Academia;
- QA/NO GO.

### 3. Configuracion completa desde plataforma

El prototipo debe permitir crear manualmente:

- tenant;
- proyecto dentro de tenant;
- paises;
- monedas;
- branding;
- favicon/PWA;
- fuente viva/source;
- cuestionario;
- certificacion;
- reglas de agendamiento/reprogramacion/cancelacion;
- reglas de visita;
- pagos/liquidaciones;
- integraciones y gates;
- permisos/roles.

No basta con mostrar datos ya cargados.

### 4. Estado unico tenant/proyecto/periodo

Debe existir una fuente unica de estado para:

- tenant seleccionado;
- proyecto seleccionado;
- periodo seleccionado;
- opcion `Todos los periodos`.

Ese estado debe alimentar sidebar, dashboard, KPIs, visitas, postulaciones, shoppers, liquidaciones, finanzas, Academia, reportes y exports.

### 5. Periodos como entidad, no texto visual

Los periodos deben ser entidad/config derivada de source o creada manualmente. Deben tener:

- id estable;
- label visible;
- fecha inicio/fin si aplica;
- paises incluidos;
- fuente/tabs origen;
- estado de lectura;
- conteos source-safe;
- audit.

No deben existir como variantes del nombre del proyecto.

### 6. HR/source viva como configuracion administrable

La fuente viva debe quedar visible en configuracion del proyecto como masked/reference, con:

- tipo de fuente;
- referencia protegida;
- tabs/periodos detectados;
- ultimo read/sync;
- estado;
- warnings;
- gate;
- accion de refrescar preview/source-safe;
- accion de dry-run import.

### 7. PWA completa por tenant/cliente

Ademas de favicon y manifest, Claude debe revisar:

- `beforeinstallprompt` cuando aplique;
- instrucciones iOS/Android/Desktop cuando no aplique prompt;
- cache busting de iconos y manifest;
- service worker no debe conservar marca anterior;
- theme_color/background_color desde brand config;
- splash/icono instalable desde marca;
- fallback CXOrbia solo si no hay marca configurada.

### 8. Branding completo

Brand config debe aplicar a:

- login;
- topbar;
- sidebar;
- favicon;
- manifest PWA;
- portal cliente;
- exports/reportes;
- pantalla de instalacion PWA;
- emails/templates preview si existen.

El login no debe tener doble titulo.

### 9. Banderas/paises/monedas

Banderas, paises y monedas deben salir de configuracion. Si se agrega o elimina pais, la UI cambia.

No hardcodear GT/HN ni ninguna bandera.

### 10. Shoppers y datos protegidos

El prototipo debe mostrar claramente estados:

- preview publico source-safe;
- vista protegida requiere Auth/roles;
- perfil completo pendiente backend protegido;
- datos sensibles no expuestos.

No debe simular shoppers reales con nombres genericos que parezcan finales.

### 11. Flujos Phase A como configurables genericos

Los flujos de operacion deben existir como reglas configurables:

- publicacion de visitas;
- postulacion;
- reserva;
- asignacion;
- reprogramacion;
- cancelacion;
- realizada;
- cuestionario completado;
- revision/submitido;
- liquidacion candidata;
- lote de pago;
- movimiento financiero;
- notificacion/outbox;
- conflicto a reviewQueue.

### 12. Copy honesto y gates

Todo texto debe distinguir:

- preview;
- preparado;
- pendiente backend;
- gate apagado;
- requiere revision humana;
- activo DEV;
- activo produccion.

No prometer pagos, Make, Gemini, writeback, import definitivo ni envio real si no estan activos.

### 13. Academia mas profunda

Academia debe quedar por rol y por accion, no solo como tarjetas:

- administrador SaaS;
- administrador de tenant;
- administrador de proyecto;
- coordinacion operativa;
- shopper;
- cliente;
- tecnico/backoffice.

Debe incluir manuales, checklists, glosario, rutas de aprendizaje, errores frecuentes, GO/NO GO y seguridad de datos.

### 14. QA minimo que Claude debe devolver

Claude debe entregar una matriz de validacion:

- login/branding;
- tenant/proyecto/periodo;
- source config;
- KPIs por periodo;
- shoppers source-safe/protegido;
- liquidaciones/pagos gate-off;
- integraciones gate-off;
- PWA/favicon/install;
- Academia;
- mobile/desktop.

### 15. Documentacion de cierre obligatoria

Claude debe actualizar o crear:

- `PENDIENTES-PROTOTIPO...`;
- `RESUMEN-PARA-CLAUDE...` o addendum equivalente;
- `CAMBIOS...`;
- `ACADEMIA...`;
- `QA...`.

Si no documenta, el cambio se considera incompleto.

## Instruccion para Claude

Usa el paquete enviado como base, pero este addendum es obligatorio. Si el paquete y este addendum difieren, este addendum manda para evitar sesgo, omisiones y regresiones.

## Estado seguro

Este addendum no autoriza produccion, merge final, pagos reales, writeback, Make/Gemini live, import definitivo ni exposicion de datos sensibles.
