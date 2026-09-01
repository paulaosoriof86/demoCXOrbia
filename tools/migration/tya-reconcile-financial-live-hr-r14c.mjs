#!/usr/bin/env node
/*
 * F10 compatibility entrypoint only.
 *
 * Historical controlled-runner profiles still reference this path. The
 * canonical reconciliation implementation lives in:
 *   tools/reconciliation/tya-financial-workbook-live-hr-reconcile-r14c.mjs
 *
 * Keep this file logic-free so the financial reconciliation has exactly one
 * implementation. process.argv is intentionally preserved; the canonical
 * reconciler owns argument parsing and its source-safe default financial input.
 */
import '../reconciliation/tya-financial-workbook-live-hr-reconcile-r14c.mjs';
