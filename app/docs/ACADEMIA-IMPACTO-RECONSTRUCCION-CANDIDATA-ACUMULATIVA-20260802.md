# ACADEMIA — IMPACTO DE LA RECONSTRUCCIÓN DE CANDIDATA ACUMULATIVA

**Fecha original:** 2026-08-02  
**Corrección prevalente:** 2026-08-03  
**Estado:** `DOCUMENTED_NON_BLOCKING__PHASE_A_COMPLETE_RECONSTRUCTION_ACTIVE__VISUAL_PENDING`

## 1. Regla

Academia debe reflejar únicamente el build Phase A completo que Paula apruebe visualmente.

La revisión A+B centrada en CRM/Comercial/Marketing quedó anulada. Academia no debe aprender ni documentar una secuencia que deje para después Operación, Visitas, Reservas, Finanzas, Reportes o perfiles.

Academia continúa sin bloquear la salida operativa salvo P0 demostrado.

## 2. Build actual

`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

Clasificación:

`TECHNICAL_COMPARISON_BUILD__NOT_FINAL_PHASE_A_CANDIDATE`.

No actualizar cursos/manuales con base exclusiva en este build ni presentarlo como freeze final.

## 3. Alcance que debe corresponder al build aprobado

### Base y roles

- entrada directa por Administración/Coordinación, Portal Cliente y Shopper/Evaluador;
- tenant, proyecto y periodo;
- HR viva y actualización in-place;
- navegación/permisos por rol;
- fuente y estados honestos.

### Operación

- Dashboard Operativo y drilldowns;
- Mi Día/hoja de ruta;
- Histórico;
- Visitas, ficha y Revisión;
- Postulaciones;
- Reservas;
- Shoppers.

### Shopper/perfiles

- Disponibles;
- Mis Visitas;
- Reservas;
- Mi Perfil;
- cuestionario;
- certificaciones presentadas e histórico;
- documentos;
- beneficios;
- reportes Shopper.

### Finanzas

- Dashboard Financiero;
- Liquidaciones;
- Movimientos;
- Costos;
- CxP/CxC;
- lotes/pagos en su estado real;
- revisión financiera, conciliación y pago como conceptos distintos;
- multi-país/multi-moneda;
- modelo delegado, localBilling false y regalía 0.

### Portales y reportes

- Portal Cliente y Portal Shopper;
- Reportes Admin/Cliente/Shopper;
- PDF/XLSX/PPTX;
- periodo, alcance, fuente, filas, branding y gráficas;
- ausencia de métricas, NPS, porcentajes, responsables o hallazgos fabricados.

## 4. Autoridades históricas

Los contenidos deberán reconocer que ya existieron:

- RC Phase A smoke técnico y visual/consola PASS;
- M1/Corte 1 frozen/aprobado;
- Corte 2A/V174 frozen/aprobado;
- Corte 3/V182 frozen active baseline;
- C6 técnico multirol y dominio/Finanzas/Reservas PASS.

La reconstrucción actual recupera la composición aprobada; no reinicia funcionalmente la plataforma.

## 5. Actualizaciones posteriores al Checkpoint Visual Phase A completa

Por módulo:

- build y manifest exactos;
- audiencia/rol;
- ruta real;
- fuente y alcance;
- pasos operativos;
- estados y gates;
- errores frecuentes;
- troubleshooting;
- notificaciones;
- separación entre manual y curso.

Temas obligatorios:

- HR como autoridad operacional;
- identidad Shopper exacta;
- fuente real vs `Pendiente de fuente`;
- revisión financiera vs conciliación vs pago;
- rollover de periodo;
- reportes por rol;
- integraciones apagadas hasta autorización.

## 6. Módulos posteriores

CRM Ops Leads, Clientes comerciales, Comercial y Marketing se documentarán en su bloque posterior. No deben desplazar los contenidos Phase A ni aparecer como requisito previo para el freeze actual.

## 7. Estado actual

- `app/modules/academia.js`: sin cambios funcionales en este bloque;
- cursos/manuales: preservados;
- actualización de contenido: pendiente de `FINAL_HUMAN_VISUAL_APPROVED`;
- deploy/provider writes: 0.

## 8. Clasificación

- **Reusable CXOrbia:** cursos vinculados a build, rol, fuente y gates.
- **Exclusivo cliente:** TyA/Cinépolis, HR, GT/HN y configuración financiera.
- **Claude/prototipo:** UX y rutas que deben coincidir con el build aprobado.
- **Academia:** impacto completo documentado, aplicación diferida.
- **Sin impacto Claude:** SHAs, manifests y evidencia técnica.
