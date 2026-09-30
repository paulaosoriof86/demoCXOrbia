# Auditoría focal Cloud — Login portable V5

**Fecha:** 2026-08-04  
**Paquete:** `Prototype development request V5.zip`  
**SHA-256:** `c55f83fedb9263a99705f9e2cc41ade8a186fe7d9c2e675689d901de43089ed1`  
**Decisión:** `HOLD_CLOUD_V5_FRONTEND__NO_APROBADO_PARA_INTEGRACION`

## 1. Alcance

Auditoría exclusivamente frontend y presentacional del Login portable entregado por Cloud. No se auditaron ni modificaron Auth, Firebase, claims, memberships, `CX.data`, HR, Finanzas, backend, deploy ni producción.

## 2. Avances válidos que deben preservarse

- producto `Gravicentra CX` separado de la marca del tenant;
- `tenantBranding` recibido por props;
- países dinámicos, bandera y nombre en el orden recibido;
- ocho países visibles en el escenario de evidencia;
- ausencia de `+N`, multiselect o selección obligatoria de país;
- token `--gcx-navy-2` definido;
- reporte de 40 tokens usados, 48 definidos y 0 faltantes;
- ES/EN, foco, teclado, loading y error;
- README sin HEAD fijo como destino de integración;
- los once archivos enumerados por el manifest coinciden en bytes y SHA-256.

## 3. Hallazgos bloqueantes de aceptación visual

### 3.1 Órbita sobredimensionada en escritorio

El CSS usa:

```css
.gcx-body { grid-template-columns: 1.02fr .98fr; }
.gcx-stage { width: min(72vh, 540px); }
```

En escritorio la órbita domina el panel, aumenta el peso visual y deja grandes áreas vacías. La referencia Emergent mantiene una órbita más compacta, mejor jerarquía y mayor equilibrio con el formulario.

### 3.2 Encabezado transversal pesado

La franja blanca sobre ambos paneles rompe la composición dividida y repite información de marca. En desktop debe integrarse la marca producto en el panel oscuro y la identidad tenant de manera compacta en el panel del formulario, o reducir la franja común a un máximo visual aproximado de 52–60 px.

### 3.3 Formulario demasiado alto

Las tarjetas de perfil, chips, gaps, bordes y radios ocupan demasiada altura. En `1440×900` el formulario debe caber completo o casi completo sin un desplazamiento vertical prolongado.

### 3.4 Jerarquía orbital débil

El núcleo, nombre, glow, anillos, nodos y etiquetas compiten entre sí. Deben reducirse y refinarse para que la órbita acompañe el Login y no se convierta en el elemento dominante.

### 3.5 Evidencia responsive inválida

Dentro del ZIP:

- `docs/preview-desktop.png`: `924×540`;
- `docs/preview-mobile.png`: `924×540`.

La captura denominada móvil no corresponde a un viewport móvil. Además, ambas imágenes quedaron fuera de `MANIFEST.json`.

### 3.6 Residuos de trazabilidad

- comentario `Portable React Login (fidelity v4)`;
- referencia histórica `3be7763` en el inventario de marca.

Deben eliminarse y usar únicamente `TARGET_HEAD_RESOLVED_BY_CHATGPT_AT_INTEGRATION_TIME`.

## 4. Comparación visual

La referencia Emergent se usa solo como benchmark estético, no como código para copiar. Presenta:

- órbita aproximadamente de 390–430 px en desktop 1440×900;
- panel oscuro cercano al 50 %;
- marca producto integrada en el panel oscuro;
- formulario más compacto;
- países y perfiles con menor altura;
- mejor respiración, jerarquía y balance.

## 5. Pendientes frontend acumulados agregados a V6

La próxima entrega no puede limitarse al Login. Debe incluir también:

1. responsive P1 de tablas, fichas, tarjetas y modales;
2. PDF P1: exportar solo el reporte seleccionado e incluir gráficas existentes cuando correspondan;
3. Excel P2: metadatos, encabezados, filtros, anchos y formatos;
4. opción visual `Regional` en el wizard de proyectos;
5. copy correcto del modelo financiero delegado;
6. componente presentacional responsive de Ficha Shopper;
7. capturas reales y manifest completo.

## 6. Decisión

V5 mejora varios contratos visuales y técnicos de V4, pero no alcanza la calidad desktop requerida y no constituye una candidata acumulativa completa.

No aplicar archivos de V5 a `app/`. Cloud debe devolver una V6 frontend acumulativa y corregida para auditoría focal posterior.

## 7. Clasificación

- **Reusable CXOrbia:** Login white-label, países dinámicos, responsive, tokens y evidencia visual.
- **Exclusivo cliente:** contenido visual TyA Consultant usado en el preview.
- **Cloud/prototipo:** todos los cambios solicitados en este documento.
- **Academia:** actualizar materiales de white-label, responsive y accesibilidad después del GO.
- **Sin impacto backend:** esta auditoría no cambia Auth, datos, providers ni producción.
