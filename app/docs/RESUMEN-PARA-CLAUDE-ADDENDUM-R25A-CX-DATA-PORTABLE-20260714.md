# RESUMEN PARA CLAUDE — ADDENDUM R25A

Fecha: 2026-07-14

Claude no debe implementar este adapter ni tocar backend.

El prototipo comercializable debe tolerar estos conceptos ya contratados:

- hidratación antes de mostrar modo conectado;
- tenant, proyecto y periodo separados;
- snapshot frente a runtime;
- error de proveedor sin fallback demo;
- write gate en HOLD;
- referencias shopper protegidas;
- estados loading, bloqueado, degradado y error.

El paquete V114 → V115 ya contiene estos patrones. No se agrega una tarea nueva ni se amplía el paquete mientras Claude trabaja.
