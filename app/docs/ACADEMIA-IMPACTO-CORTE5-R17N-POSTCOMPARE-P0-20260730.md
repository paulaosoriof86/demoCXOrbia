# Academia — impacto Corte 5 R17N post-compare y P0 de periodos

Fecha: 2026-07-30

## Estado
`R17N MATERIALIZED + PROVIDER/IDENTITY PASS + P0_C5_CXDATA_PERIOD_MODEL_MISMATCH`.

## Contenido que Academia debe incorporar cuando el runtime quede corregido

### Proyecto padre vs periodo
- `cinepolis` es el proyecto padre configurable.
- Los meses/rondas son periodos y viven bajo el proyecto, no deben modelarse como proyectos independientes.
- La navegación y los indicadores deben explicar claramente qué cambia al seleccionar proyecto y qué cambia al seleccionar periodo.

### Fuente y validación
- La materialización puede tener readback perfecto y aun así requerir smoke del adapter consumidor.
- En este bloque Firestore quedó correcto: 14 periodos /616 visitas /572 controles /77 certificaciones.
- El smoke encontró que CX.data consumía 30 project docs como periodos; esto demuestra por qué el post-compare funcional es obligatorio.

### Identidad
- 208 referencias HR no implican 208 personas únicas.
- El crosswalk exacto actual resuelve esas 208 refs a 194 perfiles canónicos únicos.
- Nunca deduplicar por nombre; usar llaves/evidencia estable y enviar ambigüedad a revisión.
- Roles autorizados deben ver identidad real; source-safe protege repo/log/evidencia, no anonimiza el producto final.

### Finanzas
- 572 controles de liquidación materializados no equivalen a 572 pagos.
- En el bloque actual `paid=true` es 0; pagos/lotes permanecen fuera del gate.

### Seguridad / errores frecuentes
Checklist futuro:
1. Confirmar proyecto padre correcto.
2. Confirmar que el selector de periodo consume la subcolección canónica.
3. Confirmar 14 periodos y que el periodo activo pertenece a ese set.
4. Confirmar 616 visitas sin fallback demo.
5. Confirmar identidad real según RBAC.
6. Confirmar que liquidación no se presenta como pago.
7. Si provider/readback PASS pero UI no coincide, revisar adapter antes de alterar datos.

## Segmentación por rol
- Superadmin/Admin/Operativo: proyecto, periodo, fuente, identidad, conflictos y estado financiero.
- Shopper: periodo/visitas propias, identidad propia, certificaciones y liquidaciones permitidas.
- Cliente: periodo e histórico autorizado; nunca detalles PII shopper fuera de scope.

## Estado seguro
Documento únicamente. No cambia runtime, datos, Auth, Storage, HR, deploy, merge ni producción.
