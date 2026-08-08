# Hosting preview y cutover final V91

Fecha: 2026-07-08  
Baseline viva: V91 incremental  
Estado: preview autorizado, produccion/cutover final pendiente de GO explicito.

## 1. Aclaracion importante

La plataforma final debe quedar en el hosting actual operativo:

`https://tya-plataforma.web.app`

Ese dominio debe reemplazar la plataforma actual cuando Paula autorice produccion/cutover final.

## 2. Lo que se autoriza ahora

Paula autorizo desplegar como preview si ya es el momento apropiado.

El despliegue autorizado ahora es solo:

- Hosting preview o DEV controlado;
- sin produccion final;
- sin Firestore real;
- sin Auth real;
- sin Storage real;
- sin HR writes;
- sin import real;
- sin pagos reales;
- sin Make/Gemini reales.

## 3. Donde NO validar todavia

No usar como validacion V91 final:

`https://tya-plataforma.web.app`

Si esa URL muestra la app actual, eso no prueba que V91 ya este desplegada. Esa URL queda reservada para el cutover final.

## 4. Donde validar preview

El workflow autorizado usa Firebase Hosting preview channel:

- proyecto: `cxorbia-backend-dev`;
- target: `cxorbia-dev`;
- channelId: `rc-phase-a`;
- expiracion: 7 dias.

La URL exacta del preview debe tomarse del resultado del workflow de GitHub Actions/Firebase Hosting, no inventarse manualmente.

## 5. Que validar en el preview

Validar como admin:

1. Login/admin abre sin pantalla blanca.
2. Navegacion lateral/topbar responde.
3. Dashboard abre.
4. Postulaciones abre.
5. Reservas abre.
6. Automatizaciones abre.
7. Cuestionario shopper abre.
8. Finanzas abre.
9. Academia abre.
10. Diagnostico & Readiness abre.
11. Administrabilidad abre.
12. Academia muestra acciones visibles en cursos: editar, duplicar, versionar, estado, archivar.
13. Academia muestra Auditoria y Archivados.
14. Crear con IA abre modal.
15. Crear con IA deja claro que Gemini real no esta activo y crea borrador preview/in_review.
16. No aparece copy visible de envio real, sync real, pago real o provider activo.
17. Consola no muestra errores JS criticos al abrir esos modulos.

## 6. Cutover final

El cutover final a `https://tya-plataforma.web.app` solo puede ocurrir cuando:

- preview/smoke humano sea GO;
- Paula de GO explicito de produccion;
- este documentado rollback;
- este confirmado que no hay providers reales activos accidentalmente;
- no existan NO GO criticos.

## 7. Estado seguro

- Sin produccion final.
- Sin merge final.
- Sin import real.
- Sin pagos reales.
- Sin provider real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
- Sin datos sensibles.
