# ACADEMIA — Impacto C6 Shopper Focal Resolution HOLD

**Fecha:** 2026-08-05  
**Clasificación:** Academia · Reusable CXOrbia

## Aprendizaje incorporado

Una convención de login aparentemente simple puede producir colisiones reales cuando la población histórica se materializa. El orden seguro es:

1. enlazar el perfil por `shopperId` y claves técnicas;
2. derivar el login desde el perfil exacto;
3. detectar grupos repetidos;
4. separar alias históricos de personas activas distintas;
5. detenerse antes de crear Auth.

La revisión mostró 109 grupos de `nombre.apellido` repetido que afectan 238 perfiles. Esto no autoriza sufijos ni cambios de contrato: primero debe determinarse técnicamente qué registros son históricos o duplicados y cuáles representan personas distintas.

## Caso Paula

La comparación por actividad, credencial e histórico permitió distinguir un perfil Shopper activo de otro histórico sin usar el nombre como clave. Este patrón es reutilizable para identidades con varios roles o perfiles heredados.

## Impacto funcional

No se modificaron cursos, certificaciones, manuales, rutas por rol ni notificaciones. Los manuales de acceso solo deben actualizarse después del repair DEV y la validación humana.
