# ACADEMIA — Impacto C6 Shopper Identity Resolution HOLD

**Fecha:** 2026-08-05  
**Clasificación:** Academia · Reusable CXOrbia

## Aprendizaje incorporado

Una identidad puede quedar correctamente enlazada por `shopperId` y aun así ser bloqueada por un resolver de nombres demasiado restrictivo. El orden correcto es:

1. enlazar identidad por claves técnicas;
2. usar los atributos del perfil exacto ya enlazado para construir la credencial visible;
3. detectar colisiones después de esa normalización;
4. producir una sola operación primaria por perfil;
5. detenerse antes de cualquier write si queda un hold real.

## Resultado observable

- 340 perfiles revisados;
- plan de 340 filas no superpuestas;
- 21 Auth faltantes reconciliados como 13 perfiles mapeados y 8 credenciales aún sin mapear;
- 109 falsos holds detectados por defecto del resolver;
- cero writes y cero deploy.

## Impacto funcional en Academia

Ninguno. No se modificaron cursos, certificaciones, manuales, contenidos, rutas por rol ni notificaciones.

Los manuales de ingreso Shopper siguen pendientes hasta que el resolver corregido, el repair Auth DEV, el formulario único desplegado y la validación humana obtengan PASS.
