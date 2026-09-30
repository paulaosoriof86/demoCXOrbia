# Academia · impacto de source/static PASS y Login Gravicentra CX

**Fecha:** 2026-08-04

## Impacto actual

No se modificaron:

- cursos;
- contenidos;
- evaluaciones;
- certificaciones históricas/presentadas;
- rutas de aprendizaje;
- notificaciones reales.

El gate source/static confirmó que el módulo `academia.js`, su registro y las rutas por rol permanecen presentes dentro de la composición canónica.

## Impacto futuro del Login portable

Cuando el Login Gravicentra CX sea corregido e integrado:

- el acceso a Academia debe depender del mismo Firebase Auth y claims canónicos;
- no debe crear una segunda identidad;
- no debe reiniciar certificaciones ya presentadas;
- la selección visual de país no concede permisos;
- las rutas se derivan de tenant/persona/proyecto/país;
- Shopper conserva su historial y certificación;
- Admin conserva revisión y trazabilidad;
- Cliente solo accede a rutas autorizadas.

## Rebranding

En materiales visibles nuevos se usará `Gravicentra CX` como producto. Los namespaces técnicos `CX`, `CXORBIA_*`, IDs, storage keys y contratos no se renombran.

La marca tenant/consultora permanece configurable y separada del producto.

## Pendiente Claude

El paquete v4 no se integra todavía. Debe corregir:

- evidencia móvil real;
- selector multi-país;
- token CSS indefinido;
- README portable sin HEAD histórico.

## Gate Academia posterior

Después de integrar un Login GO se debe verificar:

1. Admin abre Academia y rutas de gestión;
2. Shopper abre aprendizaje/certificación sin pérdida histórica;
3. Cliente ve únicamente contenidos autorizados;
4. recarga y nueva pestaña conservan identidad;
5. cambio visual de país no amplía permisos;
6. cero datos demo/fabricados;
7. cero reinicio de certificaciones.

## Estado

`NO_ACADEMIA_FUNCTIONAL_CHANGE__FUTURE_LOGIN_INTEGRATION_GATE_REQUIRED`.
