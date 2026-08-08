# ACADEMIA — Impacto Corte 4 bootstrap DEV read-only

Fecha: 2026-07-29

Academia debe enseñar explícitamente que estos estados no son equivalentes:

1. bloque autorizado por responsable;
2. identidad del proyecto verificada;
3. credencial válida;
4. permisos IAM suficientes;
5. API requerida habilitada;
6. ubicación Firestore seleccionada;
7. base Firestore creada;
8. Auth inicializado;
9. Rules desplegadas;
10. lectura `CX.data` activa;
11. materialización/escritura posterior.

El preflight de este corte demostró un caso real: existía autorización y credencial de lectura válida, pero faltaban 10 permisos de escritura, Firestore API estaba deshabilitada y no existía ubicación definida; por seguridad se ejecutaron cero provider writes.

Debe incorporarse el principio de mínimo privilegio temporal: elevar solo para el gate autorizado y retirar después, regresando el runner a lectura cuando corresponda.

Sin cambios de UI/Academia runtime todavía; esta nota alimenta manuales/cursos cuando se consolide el módulo.
