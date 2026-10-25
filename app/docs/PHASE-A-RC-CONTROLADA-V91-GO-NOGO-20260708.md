# Phase A RC controlada V91 - GO/NO GO

Fecha: 2026-07-08  
Baseline viva: V91 incremental  
Head evaluado antes de este documento: `da482484d1a3d084accdafbe59c941d9f8f7bb40`  
Estado: preparacion para smoke humano/consola, no produccion.

## 1. Estado actual de gates automatizados

Sobre el head `da482484d1a3d084accdafbe59c941d9f8f7bb40` quedaron en success:

- CXOrbia RC Phase A Predeploy Gate;
- CXOrbia RC Phase A Drift Gate;
- CXOrbia Phase A RC Smoke Gate;
- CXOrbia Phase A Visual Smoke.

Esto permite pasar al smoke humano/consola focalizado. No autoriza produccion por si solo.

## 2. Decision metodologica

Se acelera el cierre de empalme: V91 queda como baseline incremental operable para RC controlada si el smoke humano/consola confirma que no hay errores criticos visibles.

Ya no corresponde seguir empalmando cosmetica o mejoras no bloqueantes antes de RC. Lo pendiente que no bloquee operacion Phase A debe quedar documentado para post-RC o Claude.

## 3. GO condicional para RC Phase A controlada

Puede avanzar a RC controlada si en smoke humano/consola se confirma:

1. Login/admin abre sin pantalla blanca.
2. Navegacion base abre.
3. Dashboard abre.
4. Postulaciones abre.
5. Reservas abre.
6. Automatizaciones abre.
7. Cuestionario shopper abre.
8. Finanzas abre.
9. Academia abre.
10. Diagnostico & Readiness abre.
11. Administrabilidad abre.
12. Academia muestra acciones admin visibles: editar, duplicar, versionar, estado, archivar, auditoria/archivados.
13. Crear con IA abre modal y crea borrador preview/in_review sin Gemini real.
14. No se ve copy de envio real, sync real, pago real o provider activo.
15. Consola no muestra errores JS criticos al abrir esos modulos.

## 4. NO GO

No avanzar a RC controlada si ocurre cualquiera de estos puntos:

- pantalla blanca;
- error JS critico en consola;
- navegacion base rota;
- Academia no carga;
- acciones admin de Academia no aparecen;
- Crear con IA no abre o promete Gemini real activo;
- Diagnostico o Administrabilidad no abren;
- se ve promesa de WhatsApp/correo enviado real, HR sincronizada real, pago real, Make activo, Gemini activo, Firestore/Auth/Storage activo;
- se detecta dato sensible real en UI o repo;
- se activa provider real o import real;
- se toca produccion sin autorizacion.

## 5. Pendientes no bloqueantes para post-RC / Claude

Estos pendientes no bloquean RC controlada si el smoke humano pasa, pero deben quedar vivos:

- consolidar patches `academia-admin-actions.js` y `academia-create-ai-stable.js` dentro de `academia.js` si mejora mantenibilidad;
- profundizar Academia por rol/manual/checklist/glosario;
- acciones equivalentes para manuales/checklists/glosario, no solo cursos;
- limpieza fuente permanente de copy P0 modulo por modulo para depender menos del guard;
- hardening completo;
- conexion backend real nueva y limpia con gates;
- Auth/Firestore/Storage reales;
- Make/Gemini reales con revision humana;
- import real TyA limpio y controlado;
- pagos/liquidaciones reales con fuente validada.

## 6. Pendientes bloqueantes antes de produccion real

Antes de produccion real siguen siendo obligatorios:

- decision explicita de Paula;
- smoke humano/consola sin NO GO;
- confirmacion de que no hay providers reales activos;
- confirmar que no se suben datos sensibles;
- definir base nueva limpia;
- confirmar reglas Auth/Firestore/Storage antes de activar;
- confirmar cutover controlado;
- documentar rollback.

## 7. Clasificacion obligatoria

- Reusable CXOrbia: si. Checklist reusable para futuras RC controladas por cliente.
- Exclusivo cliente: parcial. Aplica a Phase A TyA actual, pero el patron es reusable.
- Claude/prototipo: si. Determina que queda para post-RC/Claude sin frenar salida controlada.
- Academia: si. Define GO/NO GO para Academia admin actions y Crear con IA.
- Sin impacto Claude: no. Debe quedar en paquete Claude como criterio de salida.

## 8. Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge.
- Sin import real.
- Sin pagos reales.
- Sin provider real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
- Sin datos sensibles.
