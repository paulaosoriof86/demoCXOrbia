# Smoke humano/consola V91 - 10 minutos

Fecha: 2026-07-08  
Baseline viva: V91 incremental  
Estado: paso final antes de RC Phase A controlada, no produccion.

## 1. Contexto

Los gates automatizados ya quedaron en success sobre el ultimo head validado:

- Drift Gate;
- Predeploy Gate;
- RC Smoke Gate;
- Visual Smoke.

Este documento reduce el paso manual a una validacion corta y focalizada. No se debe abrir una auditoria nueva ni seguir agregando mejoras no bloqueantes antes de RC.

## 2. Objetivo

Confirmar en navegador real que no hay errores criticos de UI/consola antes de preparar RC Phase A controlada.

## 3. Preparacion minima

Usar una ventana nueva o recargar fuerte para evitar cache vieja.

Validar como admin.

Abrir consola del navegador solo para confirmar que no aparezcan errores JS criticos al entrar a los modulos.

No se deben tocar datos reales, no se debe cargar import real, no se debe enviar correo/WhatsApp real, no se debe activar provider real.

## 4. Checklist GO rapido

Marcar GO si todos estos puntos pasan:

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
17. Consola no muestra errores JS criticos al abrir los modulos anteriores.

## 5. NO GO inmediato

Detener y reportar solo si aparece uno de estos puntos:

- pantalla blanca;
- login/admin no abre;
- navegacion base rota;
- error JS rojo persistente que impide usar modulo;
- Academia no carga;
- acciones admin de Academia no aparecen;
- Crear con IA no abre o promete Gemini real activo;
- Diagnostico o Administrabilidad no abren;
- se ve promesa de WhatsApp/correo enviado real, HR sincronizada real, pago real, Make/Gemini/Firestore/Auth/Storage activo;
- aparece dato sensible real.

## 6. Como reportar resultado

Resultado esperado:

- `GO smoke humano V91`: si todo abre y no hay NO GO.
- `NO GO smoke humano V91`: indicar modulo y error exacto si hay bloqueo.

No se requieren capturas salvo que haya NO GO visual dificil de describir.

## 7. Decision posterior

Si el smoke humano es GO:

- preparar RC Phase A controlada;
- mantener PR draft hasta decision explicita de Paula;
- no activar produccion real sin autorizacion;
- no conectar providers reales todavia.

Si hay NO GO:

- corregir solo causa raiz puntual;
- documentar;
- repetir gates;
- volver a este smoke focalizado.

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
