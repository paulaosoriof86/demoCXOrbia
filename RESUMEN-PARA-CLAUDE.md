# RESUMEN-PARA-CLAUDE.md

Resumen vivo para entregar a Claude/frontend sin mezclar incidencias de integración backend con mejoras reales del prototipo.

## 2026-06-30 — Continuidad RC V56 + backend DEV

### 1. Regla de trabajo

- La base visual correcta es `release/cxorbia-tya-rc-20260630`.
- Esta RC viene del prototipo V56 completo y correcto.
- No usar como base visual la rama `feat/firebase-backend-dev-config-20260627` porque está divergida.
- No modificar `/app/modules` ni reescribir lógica del frontend desde backend.
- No modificar `app/index.html` para activar backend global sin autorización final.
- El único preview backend debe ser `app/index-backend-dev.html`.
- Todo cambio debe quedar documentado en `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` e incidencias backend separadas.

### 2. Estado visual de la RC correcta

Validado por Paula en `http://127.0.0.1:4173`:

- Configuración abre.
- Planes aparecen.
- Identidad de marca abre.
- Academia abre.
- Recursos abre.
- Finanzas / Movimientos abre.
- Certificación shopper abre.
- Sidebar completo y módulos presentes.

Conclusión: la RC correcta conserva el prototipo V56 completo. Claude debe corregir sobre esta base visual, no sobre la rama backend vieja.

### 3. Estado backend DEV real

Firebase DEV:

- Proyecto: `cxorbia-backend-dev`.
- Tenant: `tya`.
- Firestore DEV configurado.
- Reglas Firestore DEV publicadas.
- Auth DEV ficticio creado/importado.
- HR histórico V4 cargado.
- `shopperBenefits` cargado.
- Lectura admin OK.
- Lectura shopper propia OK.
- Aislamiento shopper OK.
- Lectura directa de beneficio ajeno bloqueada.

Resultado validado de beneficios:

- Total beneficios: 572.
- Shoppers únicos: 188.
- GT: 441 beneficios, total 26,460.00.
- HN: 131 beneficios, total 26,200.00.
- Shopper positivo validado: `shp-b2e3d7bef69b`, 25 registros propios.

### 4. Estado del preview backend

URL usada:

```text
http://127.0.0.1:4173/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV
```

Resultado observado:

- La página abre.
- La insignia muestra backend DEV conectado.
- Pero los conteos observados fueron: proyecto `banca`, 3 proyectos, 108 visitas, 16 shoppers, 48 postulaciones y Auth pendiente.

Interpretación:

- El preview backend está cargando, pero todavía parece mostrar datos demo/localStorage, no datos TyA reales de Firestore.
- La insignia no debe considerarse evidencia suficiente de conexión real.
- Para pasar gate debe mostrar Auth OK, fuente Firestore, tenant TyA y conteos TyA reales.

### 5. Qué NO corresponde a Claude

No documentar como pendiente de prototipo lo que sea falla de integración backend/local:

- Auth pendiente en preview.
- Datos `banca` o conteos demo/localStorage durante preview backend.
- Problemas por clave DEV o archivo local no versionado.
- Errores de PowerShell causados por bloques largos/frágiles.
- Diagnóstico insuficiente del badge backend.

Eso corresponde al backend y queda separado en `INCIDENCIAS-INTEGRACION-BACKEND.md`.

### 6. Qué sí corresponde a Claude/prototipo

Claude debe corregir y profundizar los puntos de `PENDIENTES-PROTOTIPO.md`, detectados en la RC visual correcta:

1. Configuración / planes.
2. KPIs y dashboards con drill-down.
3. Finanzas profundas.
4. Adaptación TyA visible cuando backend esté activo.
5. Legal / NDA / confidencialidad.
6. Certificación / banco de preguntas.
7. Portal cliente y planes de acción.
8. Academia, manuales y cursos.
9. Recursos/documentos.
10. Importador inteligente.
11. Add-ons, integraciones y benchmarking.
12. Impresión/PDF limpia.

### 7. Próximo gate técnico antes de producción

Antes de publicar como producción operativa debe cumplirse:

1. Preview backend muestra Auth OK.
2. Fuente de datos visible: Firestore, no localStorage.
3. Tenant visible: TyA.
4. Conteos Firestore TyA correctos.
5. Admin lee datos TyA.
6. Shopper lee solo sus datos propios.
7. No aparece `banca` ni conteos demo en preview backend.
8. `app/index.html` sigue intacto hasta autorización final.
9. Documentación actualizada.
10. Validación visual final en RC correcta.

### 8. Ruta de producción realista

Publicable hoy solo como RC visual/demo controlada:

- Sí: preview visual del prototipo V56 si se etiqueta como RC/demo.
- No: producción operativa real con backend TyA hasta cerrar Auth + Firestore + tenant TyA visible.

Riesgo si se publica antes:

- La UI puede verse completa pero seguir leyendo demo/localStorage.
- Se puede confundir `Backend DEV conectado` con datos Firestore reales.
- TyA no verá aún su lógica/datos reales en pantalla.
- Se puede requerir reversa posterior.
