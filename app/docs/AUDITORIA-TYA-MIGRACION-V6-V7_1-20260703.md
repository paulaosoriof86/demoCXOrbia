# Auditoría TyA migración V6 + V7.1 hacia CXOrbia

Fecha: 2026-07-03  
Rama base: `release/cxorbia-tya-rc-20260630`  
Alcance: auditoría de paquetes, seguridad, conteos, consistencia y preparación de importación controlada.  
Restricción: no importación, no Firestore writes, no deploy, no frontend, no `/app/modules`.

## 1. Paquetes auditados

### V6
Archivo recibido: `ENTREGA_CXORBIA_TYA_MIGRACION_V6_20260703-005828.zip`.

Contenido externo:
- `clean-package-v6-combined-rtdb-hr-20260703-004302.zip`
- `docs_control/QA_V6_COMBINADO_SIN_PII.txt`
- `docs_control/RESUMEN_CONTEOS.txt`
- `LEEME_ENTREGA.txt`
- `PROMPT_PARA_CXORBIA.txt`

Contenido del ZIP interno V6:
- `data/combined/migration_visits_master_hr.csv`
- `data/combined/migration_submitidos_master_hr.csv`
- `data/combined/migration_liquidations_base_hr.csv`
- `data/combined/migration_country_fixes.csv`
- `data/combined/migration_manifest.csv`
- documentación funcional y reportes.

### V7.1
Archivo recibido: `ENTREGA_CXORBIA_TYA_MIGRACION_V7_1_COMPLEMENTO_RTDB_20260703-023502.zip`.

Contenido RTDB físico:
- `data/rtdb_v4_base/shoppers.csv`
- `data/rtdb_v4_base/postulations.csv`
- `data/rtdb_v4_base/questionnaire_marks.csv`
- `data/rtdb_v4_base/certifications.csv`
- `data/rtdb_v4_base/notifications.csv`
- `data/rtdb_v4_base/audit_log.csv`

Contenido derivado:
- `data/derived/shopper_duplicate_candidates.csv`
- `data/derived/platform_visit_event_candidates.csv`
- `data/derived/questionnaire_status_candidates.csv`
- `data/derived/notification_trace.csv`
- `data/derived/dropped_sensitive_fields.csv`

## 2. Seguridad y ausencia de código

Resultado:
- No se detectaron extensiones de código ejecutable en V6, V6 interno ni V7.1.
- No se detectaron archivos HTML, JS, CSS, reglas Firebase, scripts, `.env`, llaves privadas ni ejecutables.
- No se detectaron patrones de secretos con escaneo de texto para API keys, tokens, webhooks, passwords o private keys.
- Los paquetes contienen CSV, TXT, MD y un ZIP interno de datos/documentación.

Hallazgo de seguridad:
- `shoppers.csv` de V7.1 incluye columna `dpi`. Es PII sensible. No debe importarse a colecciones operativas ni subirse al repo público. Si se conserva para dedupe, debe quedar en staging restringido, cifrado o descartado según decisión de negocio.

Decisión:
- No subir CSV crudos ni datos personales al repositorio. El repo es público; solo se documentan conteos y hallazgos sanitizados.

## 3. Conteos confirmados V6

| Archivo | Registros | Dictamen |
|---|---:|---|
| `migration_visits_master_hr.csv` | 617 | Fuente principal de visitas. |
| `migration_submitidos_master_hr.csv` | 528 | Fuente principal de submitidos. |
| `migration_liquidations_base_hr.csv` | 558 | Base candidata, pendiente de cruce financiero. |
| `migration_country_fixes.csv` | 3 | Trazabilidad de corrección país. |
| `migration_manifest.csv` | 9 | Manifest operativo V6. |

Validaciones V6:
- `visitKey` duplicados: 0.
- `source_tab + source_row` duplicados en visitas: 0.
- Submitidos sin visita asociada por `visitKey`: 0.
- Liquidaciones sin visita asociada por `visitKey`: 0.
- Submitidos duplicados por `visitKey`: 0.
- Liquidaciones duplicadas por `visitKey`: 0.
- Visitas con `periodo_migracion = historico`: 573.
- Visitas con `periodo_migracion = preparacion`: 44.

Estado de confianza:
- Visitas: 617 en `revisar`.
- Submitidos: 528 en `migrar`.
- Liquidaciones base: 558 en `revisar`.

## 4. Cobertura por periodo y país V6

Cobertura física HR:
- Junio 2025 a julio 2026.
- Guatemala: 34 visitas por periodo.
- Honduras: 10 visitas por periodo, excepto `JUNIO_26_HN` con 11 filas.
- Julio 2026: 44 visitas marcadas como preparación, no histórico cerrado.

Hallazgo `JUNIO_26_HN`:
- Existe una fila adicional en `source_row = 12`.
- La fila tiene campos desplazados o no operativos: sin `id_cinema`, sin quincena útil, sucursal/valores inconsistentes.
- Dictamen: no importar automáticamente. Marcar como `discardedRecord` o `review_required` hasta confirmación.

## 5. Manifest V6 revisado

`migration_manifest.csv` referencia:

| Archivo manifest | Fuente | Registros | Estado físico |
|---|---|---:|---|
| `migration_visits_master_hr.csv` | HR V5 | 617 | Presente en V6. |
| `migration_submitidos_master_hr.csv` | HR V5 | 528 | Presente en V6. |
| `migration_liquidations_base_hr.csv` | HR V5 | 558 | Presente en V6. |
| `migration_country_fixes.csv` | V6 normalización | 3 | Presente en V6. |
| `rtdb_v4_base/shoppers.csv` | RTDB V4 | 276 | Presente en V7.1. |
| `rtdb_v4_base/postulations.csv` | RTDB V4 | 44 | Presente en V7.1. |
| `rtdb_v4_base/questionnaire_marks.csv` | RTDB V4 | 44 | Presente en V7.1. |
| `rtdb_v4_base/certifications.csv` | RTDB V4 | 0 | Presente vacío en V7.1. |
| `rtdb_v4_base/notifications.csv` | RTDB V4 | 216 | Presente en V7.1. |

Nota:
- V7.1 no incluye físicamente `users_roles.csv`, aunque el resumen textual menciona `users_roles.csv: 0`.
- Dictamen: no bloquea si no había roles migrables, pero debe corregirse la documentación o entregar archivo vacío con encabezados en V7.2.

## 6. Conteos confirmados V7.1

| Archivo | Registros parseados | Dictamen |
|---|---:|---|
| `shoppers.csv` | 276 | Usar para candidatos shopper y dedupe, no fusión automática. |
| `postulations.csv` | 44 | Usar como trazabilidad de postulaciones. |
| `questionnaire_marks.csv` | 44 | Ver hallazgo de duplicado byte a byte. |
| `certifications.csv` | 0 | Correcto: no hay certificaciones migrables limpias. |
| `notifications.csv` | 216 | Correcto parseado con CSV robusto. |
| `audit_log.csv` | 0 | Presente vacío. |
| `notification_trace.csv` | 216 | Derivado útil, requiere resolver destinatarios. |
| `shopper_duplicate_candidates.csv` | 226 | Revisión manual obligatoria. |
| `platform_visit_event_candidates.csv` | 88 | Eventos candidatos. |
| `questionnaire_status_candidates.csv` | 44 | Estados candidatos de cuestionario. |
| `dropped_sensitive_fields.csv` | 3 | Campos sensibles declarados como bloqueados. |

Aclaración `notifications.csv`:
- El archivo tiene más líneas físicas por saltos internos en campos CSV.
- Parseado correctamente como CSV, produce 216 registros.
- No tratar las líneas físicas como registros reales.

## 7. Calidad de datos V7.1

Hallazgo crítico de codificación:
- V7.1 contiene mojibake en campos RTDB: caracteres como `├`, `┬`, `ƒ` y equivalentes.
- Afecta principalmente nombres, sucursales, mensajes y títulos de notificaciones.
- V6 HR no presenta este problema en el escaneo realizado.
- Dictamen: antes de importar RTDB, regenerar V7.2 desde fuente con UTF-8 correcto o aplicar una reparación controlada de encoding en staging. No corregir manualmente carácter por carácter.

Hallazgo `questionnaire_marks.csv`:
- `questionnaire_marks.csv` es idéntico byte a byte a `postulations.csv`.
- Mismo tamaño, mismo hash y mismo contenido.
- Dictamen: no tratarlo como fuente independiente de cuestionarios. Usarlo solo como candidato derivado desde estado de postulación/visita, o solicitar V7.2 con marcaciones reales separadas si existen.

Hallazgo destinatarios notificaciones:
- `notifications.csv` raw conserva `dest`.
- `notification_trace.csv` tiene `toUserId` y `toRole` vacíos en 216 registros.
- Dictamen: antes de importar notificaciones, crear resolver `dest -> user/shopper/admin/role`. No descartar por este motivo, pero tampoco importar como notificación viva sin destinatario canónico.

## 8. Duplicados shopper

`shopper_duplicate_candidates.csv` confirma 226 grupos/candidatos:

| Tipo | Candidatos |
|---|---:|
| Teléfono | 88 |
| Email | 26 |
| Nombre normalizado | 112 |

Hallazgos adicionales:
- `shoppers.csv` tiene `source_id` único.
- El campo `id` de shopper no es suficientemente único: se detectan duplicados.
- Dictamen: usar `source_node + source_id` como referencia de origen y crear `canonicalShopperId` solo después de revisión de duplicados.
- No fusionar automáticamente por nombre, teléfono o email.

## 9. Postulaciones y marcaciones contra HR

Validación cruzada con HR:
- Postulaciones con `visitId/visitKey` presente: 44/44.
- Postulaciones vinculables a visita HR por periodo, país, cine y quincena: 44/44.
- Marcaciones de cuestionario vinculables a visita HR por periodo, país, cine y quincena: 44/44.

Nota:
- La vinculación no se hace por igualdad directa de `visitKey`, porque HR y RTDB usan llaves distintas.
- La vinculación debe usar una tabla de equivalencia: `platformVisitKey -> hrVisitKey`.

## 10. Liquidaciones

Dictamen:
- `migration_liquidations_base_hr.csv` es base candidata, no deuda final.
- No importar como pagos ni cuentas por pagar sin cruce con Excel financiero externo.
- Debe cruzarse con submitidos, lote/pago real y archivo financiero externo antes de crear `paymentLots`, `shopperBenefits` o `financialMovements`.

## 11. Decisión de importación

No importar todavía.

Condiciones mínimas antes de cargar cualquier dato:
1. Resolver codificación de V7.1 o recibir V7.2 corregido.
2. Definir tratamiento de DPI.
3. Confirmar si `questionnaire_marks.csv` debe regenerarse o si se acepta como derivado.
4. Resolver `dest` de notificaciones a destinatarios canónicos.
5. Marcar la fila adicional `JUNIO_26_HN/source_row=12` como revisión/descarte.
6. Crear `migrationBatch` con preview, validación y rollback.
7. Ejecutar importación piloto en DEV con alcance mínimo y autorización explícita.
