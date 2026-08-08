# CAMBIOS BACKEND — EMPALME DETERMINÍSTICO V110

Fecha: 2026-07-12

## Resultado comprobado

Se reconstruyó la baseline V105/build interno V106 con 67 archivos exactos y se aplicó el delta auditado V105→V110 sin reconciliación difusa. El archivo `app/core/liquidacion.js` se instaló desde transporte V110 exacto y quedó fijado por SHA-256.

Identidad final:

- 67 archivos controlados por V110: exactos por checksum;
- `app/core/finanzas-core.js`: override local protegido, SHA `97a38f96602ca50d126c35a46adb616531c6578aaec82d1cfb25d22b49ea928d`;
- `app/core/topbar.js`: override local protegido, SHA `b35a92af26b57939aef83562347ef9e02aec1966da95b43f078d66a0387f6d51`;
- `app/core/build-lock.js`: regenerado como source lock de unión repo + V110.

Los dos P0 quedan físicamente incorporados: Academia falla cerrado por país real del shopper y Finanzas valida antes de procesar pagos/lotes.

## Preservación

Se preservaron backend, contratos, HR source-safe, importadores, reviewQueue, auditEvents, R5/R6/R8/R9 y gates. No se sustituyó el árbol completo a ciegas.

## Estado seguro

Sin merge del PR, deploy, producción, importación real, Firestore/HR writes, Make/Gemini live ni pagos reales.
