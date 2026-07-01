# PENDIENTES-PROTOTIPO.md

Pendientes reales del prototipo/frontend para Claude. No incluir aquí tareas de backend, reglas Firestore, Auth DEV, loaders, seeds, helpers locales ni errores de integración local.

## Vigente desde V58

La lista vigente y más completa está en:

- `PENDIENTES-PROTOTIPO-V58.md`
- `PAQUETE-PARA-CLAUDE-PENDIENTES-PROTOTIPO-V58.md`

Claude debe trabajar sobre `Prototype development request CXOrbia V58.zip` o sobre el prototipo más reciente entregado por Paula, sin usar versiones viejas y sin revertir avances existentes.

## Prioridad P0 resumida

1. Limpiar TyA/Cinépolis de proyectos demo ajenos como Banca o Restaurantes.
2. Quitar avisos técnicos visibles en UI final: demo, Firebase, backend, beta, núcleo, diagnóstico, localStorage o similares.
3. Corregir UTF-8 real y eliminar caracteres corruptos desde origen.
4. Corregir README/preview local para no recomendar Python.
5. Consolidar NDA/confidencialidad por rol y versión, no textarea único.
6. Hacer Configuración autoadministrable.
7. Periodo dinámico, sin julio fijo.
8. HR viva por proyecto, país, periodo, quincena y franja.
9. Dashboard/KPIs con lógica correcta y drill accionable debajo de KPIs o en modal amplio.
10. Postulaciones completas, agrupables y con acciones reales.
11. Flujo shopper estable de asignación a cuestionario/beneficios.
12. Perfil shopper funcional con visitas, certificaciones, beneficios e historial.
13. Responsables, Mi Día y notificaciones bidireccionales.
14. Filtros y búsquedas funcionales en todos los módulos principales.
15. Importador genérico CXOrbia, con TyA como plantilla específica.
16. Proyectos autoadministrables, no lógica fija por cliente.

## Reglas de exclusión

No documentar aquí:

- Errores de Auth DEV.
- Fallas de carga seed.
- Reglas Firestore.
- Validadores, loaders, scripts Firebase.
- Helper local ignorado.
- Smoke tests backend.
- Preview backend DEV.

Esos temas pertenecen a documentación técnica separada del backend y no son parte del paquete que Claude debe corregir en frontend/prototipo.

## Entrega esperada de Claude

Claude debe devolver prototipo corregido con:

- Lista de archivos tocados.
- Cambios por módulo.
- Confirmación de que usó V58 o la versión más reciente.
- Confirmación de que no revirtió avances.
- Confirmación de que no tocó backend protegido.
- `CAMBIOS-PROTOTIPO.md` actualizado o creado.
- `PENDIENTES-PROTOTIPO.md` actualizado.
- Dependencias de backend claramente señaladas, sin simulaciones engañosas.
