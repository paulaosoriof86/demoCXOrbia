# Matriz de trazabilidad · auditoría forense → implementación → Claude

**Fecha:** 2026-08-04  
**Objetivo:** demostrar que los hallazgos forenses no quedaron como observaciones aisladas y que cada uno tiene owner, control, estado y siguiente acción.

| Hallazgo forense | Decisión transversal | Owner | Control/gate | Estado | Siguiente acción |
|---|---|---|---|---|---|
| El árbol actual preserva C6 | No reconstruir módulos aprobados | ChatGPT | manifest final + blob gate | PASS 53/53 | mantener source lock |
| Emergent expuso una service account | No importar secretos ni package wholesale | Seguridad/Paula | rotación/revocación + secret gate | Rotación pendiente fuera del repo | revocar credencial expuesta |
| JWT Emergent sin tenant/project/country scopes | Firebase Auth sigue siendo autoridad | ChatGPT/backend | claims/RBAC fail-closed | C6 técnico preservado; cierre productivo pendiente | runtime multirol |
| Token/PII en URL y localStorage Emergent | Bridge seguro sin PII URL | ChatGPT | Auth/session gate | no integrado | diseñar bridge `/login` |
| Mongo/Firestore mirror crea doble autoridad | No usar Mongo como store Phase A | ChatGPT/backend | arquitectura/manifest | cerrado | diferir post-freeze |
| Parser Emergent cambia identidad por shopper | ID estable por fila HR | ChatGPT/backend | stable visit ID gates | preservado | runtime acumulativo |
| Liquidación Emergent simplificada | revisión, conciliación, lote y pago separados | ChatGPT/backend | finance gates | preservado | runtime Finanzas |
| Login React aporta valor visual | Integrar solo componente portable | Claude + ChatGPT | auditoría focal + bridge | HOLD v4 | corregir paquete |
| Rebranding no debe renombrar namespaces | Cambiar solo marca visible | Claude + ChatGPT | inventario visible/técnico | portable PASS; árbol no aplicado | delta visible controlado |
| Multi-país requiere 1–12+ países | chips solo para 2–3; búsqueda/multiselect para 4+ | Claude UI + ChatGPT scopes | UX + scope runtime | v4 incompleto | corregir selector |
| Evidencia móvil anterior ausente | órbita visible y login usable en móvil | Claude | capturas reales + smoke | evidencia v4 inválida | 390×844, 412×915 y tablet |
| `--gcx-navy-2` no definido | tokens sin referencias huérfanas | Claude | token static gate | FAIL focal | definir token |
| Manifest activo omitía dependencias | manifest final incluye 53 críticos | ChatGPT | source/static gate | PASS | runtime multirol |
| Overlay A+B superseded sigue cargado | no remover sin prueba de no pérdida | ChatGPT | runtime/composition gate | P1 controlado | decidir tras runtime |
| PDF pierde algunas gráficas | no bloquear si filas/scope/fuente coinciden | ChatGPT + Claude visual posterior | reportKit gate | P1 | corregir antes/fuera del cutover según impacto |
| XLSX tiene formato básico | preservar datos y mejorar presentación | ChatGPT + Claude visual posterior | reportKit gate | P2 | backlog visual |
| Credenciales históricas predecibles | activación/reset seguro | ChatGPT/backend | Auth gate | pendiente | no mostrar passwords; cerrar activación |
| `backend-dev-auth.local.js` no versionado | override DEV opcional, no autoridad | ChatGPT | source/static normalization exacta | PASS documentado | mantener gitignored |
| Scanner detectaba sus propios patrones | clasificar únicamente fixtures exactos, nunca hits desconocidos | ChatGPT | controlled runner 1.7.0 | PASS | mantener unknown hits bloqueantes |
| Candidate portable no es acumulativa | no tratar ZIP visual como candidata de producción | ChatGPT | auditoría focal | HOLD | integrar solo tras GO |
| Agosto no está en baseline 616 | reconciliar fuente real, no inventar | ChatGPT/backend | HR/runtime gate | pendiente | después del runtime acumulativo |
| Documentos/Storage sensibles | activar solo con rules/auditoría | ChatGPT/backend | Storage gate | bloqueado seguro | autorización posterior |
| Make/Gemini/pagos | mantener apagados | ChatGPT/backend | safe-state gates | PASS apagado | activar solo en bloque autorizado |

## Resultado

La auditoría forense integral no necesita repetirse en este momento. Sus hallazgos están convertidos en:

- decisiones de arquitectura;
- manifest de autoridad;
- gates;
- separaciones de responsabilidad;
- bloqueos seguros;
- tareas exactas para Claude;
- criterios de integración y producción.

Estado:

```text
FORENSIC_FINDINGS_TRANSVERSE_TRACEABILITY_ACTIVE
SOURCE_STATIC_PASS
CLAUDE_PORTABLE_V4_HOLD
RUNTIME_MULTIROLE_NEXT
NO_PRODUCTION
```
