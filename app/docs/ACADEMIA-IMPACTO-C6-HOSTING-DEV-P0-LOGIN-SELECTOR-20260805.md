# Academia — impacto del P0 de selector de Login después de Hosting DEV

## Patrón reusable

Un cambio visual de clases CSS puede romper una integración funcional aunque los archivos, Auth y backend estén correctos. Los adaptadores DOM no deben depender de un único selector histórico cuando existe una transición acumulativa de interfaz.

Patrón recomendado:

```js
container.querySelector('.current-contract, .legacy-contract')
```

acompañado de gates que comprueben que el elemento objetivo se monta realmente después de la interacción.

## Lecciones

- paridad de archivos no equivale a funcionalidad de interacción;
- un wrapper instalado puede fallar silenciosamente si su contenedor no existe;
- un guard temprano puede comportarse correctamente y aun así dejar visible el fallo del wrapper oficial;
- las pruebas deben capturar estado antes y después del clic;
- STOP_RETRY debe impedir un segundo deploy no autorizado;
- los selectores acumulativos permiten preservar nueva UI y compatibilidad legacy sin rediseño.

## Impacto en manuales y cursos

Agregar al manual de integración frontend/backend:

- contrato de selectores DOM entre prototipo y Auth;
- verificación de montaje del formulario integrado;
- diferencia entre carga, paridad y usabilidad real;
- root fix mínimo compatible con markup nuevo y anterior;
- evidencia de una sola release y cero segundo deploy automático.

No cambian contenidos operativos, rutas por rol ni notificaciones.
