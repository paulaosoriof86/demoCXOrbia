# RESUMEN-PARA-CLAUDE-SPRINT6-BACKEND-20260701.md

Sprint 6 backend preparo un puente seguro para acciones futuras.

Claude debe mantener estas reglas:

- No tocar backend.
- No tocar reglas Firestore.
- No tocar scripts Firebase.
- No activar botones reales.
- No modificar app/modules para conectar acciones finales.
- Puede mejorar UX y prototipo visual con estados mock.

El backend conserva la separacion: primero se valida en DEV, luego se autoriza UI por gate separado.