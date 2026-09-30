from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from .common import HRIndex

def js_envelope(name: str, value: dict[str, Any], comment: str) -> str:
    return f"/* {comment} */\nwindow.{name} = {json.dumps(value, ensure_ascii=False, indent=2)};\n"

def write_outputs(out: Path, hr: HRIndex, financial: dict | None, certification: dict | None) -> dict[str, Any]:
    out.mkdir(parents=True, exist_ok=True)
    review: list[dict[str, Any]] = []
    audits: list[dict[str, Any]] = []
    if financial:
        (out / "financial-control.source-safe.json").write_text(json.dumps(financial["envelope"], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        (out / "tya-financial-control-source-safe.js").write_text(js_envelope("CX_TYA_FINANCIAL_CONTROL_SOURCE_SAFE", financial["envelope"], "Dry-run output. Review before copying into runtime."), encoding="utf-8")
        (out / "financial-candidates.source-safe.json").write_text(json.dumps(financial["candidates"], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        review += financial["reviewQueue"]
        audits += financial["auditEvents"]
    if certification:
        (out / "certification-carryover.source-safe.json").write_text(json.dumps(certification["envelope"], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        (out / "tya-certification-carryover-source-safe.js").write_text(js_envelope("CX_TYA_CERTIFICATION_CARRYOVER_SOURCE_SAFE", certification["envelope"], "Dry-run output. Review before copying into runtime."), encoding="utf-8")
        (out / "certification-candidates.source-safe.json").write_text(json.dumps(certification["candidates"], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        review += certification["reviewQueue"]
        audits += certification["auditEvents"]
    (out / "review-queue.source-safe.json").write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (out / "audit-events.source-safe.json").write_text(json.dumps(audits, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report = {
        "schemaVersion": "1.0.0",
        "generatedAt": datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "tenantId": hr.raw.get("tenantId", "tya"),
        "projectId": hr.raw.get("projectId", "cinepolis"),
        "hrIndex": {"visits": len(hr.visits), "shoppers": len(hr.shopper_by_id), "sourceSafe": bool(hr.raw.get("sourceSafe", True))},
        "financial": financial["summary"] if financial else {"status": "not_supplied"},
        "certification": certification["summary"] if certification else {"status": "not_supplied"},
        "reviewQueue": len(review),
        "auditEvents": len(audits),
        "dryRun": True,
        "writes": False,
        "imported": False,
        "production": False,
        "providers": False,
        "safe": True,
    }
    (out / "phase-a-source-safe-import-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (out / "phase-a-source-safe-import-report.md").write_text(
        "# Phase A source-safe import dry-run\n\n"
        f"Generated: {report['generatedAt']}\n"
        f"HR index: {report['hrIndex']['visits']} visits / {report['hrIndex']['shoppers']} shoppers\n"
        f"Financial accepted paid: {report.get('financial', {}).get('acceptedPaid', 0)}\n"
        f"Certification carried over: {report.get('certification', {}).get('carriedOver', 0)}\n"
        f"Review queue: {report['reviewQueue']}\n"
        f"Audit events: {report['auditEvents']}\n\n"
        "Safe state: dry-run only; no writes, imports, providers, payments or production.\n",
        encoding="utf-8",
    )
    return report
