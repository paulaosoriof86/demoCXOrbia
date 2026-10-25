from __future__ import annotations

import csv, json
from pathlib import Path
from typing import Any, Iterable

from .common import clean, norm_key, openpyxl

FIN_ALIASES = {
    "visitId": ["visitid", "visitaid", "extid", "idvisita", "visit_key"],
    "hrRowId": ["hrrowid", "hrrow", "rowid", "source_row_id", "fila_hr"],
    "paymentItemId": ["paymentitemid", "payment_item_id", "itemid"],
    "batchId": ["batchid", "paymentbatchid", "loteid", "lote", "batch"],
    "periodKey": ["periodkey", "periodo", "mes", "period"],
    "shopperId": ["shopperid", "evaluadorid", "shopper_id"],
    "shopperCode": ["shoppercode", "codigo", "codigo_shopper", "shopper_code"],
    "country": ["country", "pais"],
    "currency": ["currency", "moneda"],
    "honorario": ["honorario", "fee"],
    "boleto": ["boleto", "ticket", "ticket_reimbursement"],
    "combo": ["combo", "comboamt", "combo_amount"],
    "total": ["total", "monto", "amount", "paymentamount"],
    "paymentState": ["paymentstate", "payment_status", "estado", "status"],
    "paidAt": ["paidat", "fechapago", "paymentdate", "fecha_pago"],
    "paymentSource": ["paymentsource", "source", "sourceref", "fuente"],
    "sourceRecordId": ["sourcerecordid", "source_record_id", "recordid", "idregistro"],
    "confirmedBy": ["confirmedby", "confirmadopor", "actorref", "confirmed_by"],
}
CERT_ALIASES = {
    "shopperId": ["shopperid", "evaluadorid", "shopper_id"],
    "shopperCode": ["shoppercode", "codigo", "codigo_shopper", "shopper_code"],
    "shopperName": ["shoppername", "nombre", "evaluador", "shopper"],
    "projectId": ["projectid", "proyectoid", "proyecto"],
    "certificationId": ["certificationid", "certificacionid", "certificacion", "courseid"],
    "score": ["score", "puntaje", "porcentaje", "resultado"],
    "presentedAt": ["presentedat", "fecha", "fechapresentada", "completedat"],
    "validUntil": ["validuntil", "vigencia", "vence", "fecha_vencimiento"],
    "state": ["state", "estado", "status"],
    "attempts": ["attempts", "intentos"],
    "sourceRef": ["sourceref", "source", "fuente"],
    "sourceRecordId": ["sourcerecordid", "source_record_id", "recordid", "idregistro"],
    "reviewedBy": ["reviewedby", "revisadopor", "reviewer", "reviewed_by"],
    "reviewedAt": ["reviewedat", "fecharevision", "reviewed_at"],
    "reviewDecision": ["reviewdecision", "decision", "review_decision"],
}

def _contract_sensitive_names() -> set[str]:
    root = Path(__file__).resolve().parents[3]
    names: set[str] = set()
    for relative in (
        "backend/contracts/phase-a-financial-payment-import-source-safe-v1.json",
        "backend/contracts/phase-a-certification-carryover-import-source-safe-v1.json",
    ):
        path = root / relative
        if not path.exists():
            continue
        contract = json.loads(path.read_text(encoding="utf-8"))
        names.update(norm_key(value) for value in contract.get("security", {}).get("sensitiveColumnsExcluded", []))
    return names

def read_json_records(path: Path, keys: Iterable[str]) -> list[dict[str, Any]]:
    value = json.loads(path.read_text(encoding="utf-8-sig"))
    if isinstance(value, list):
        return [dict(item) for item in value if isinstance(item, dict)]
    if isinstance(value, dict):
        for key in keys:
            if isinstance(value.get(key), list):
                return [dict(item) for item in value[key] if isinstance(item, dict)]
        if isinstance(value.get("records"), list):
            return [dict(item) for item in value["records"] if isinstance(item, dict)]
    raise ValueError(f"No records array found in {path}")

def read_xlsx_records(path: Path, sheet: str | None, aliases: dict[str, list[str]]) -> list[dict[str, Any]]:
    if openpyxl is None:
        raise RuntimeError("openpyxl is required for XLSX input")
    workbook = openpyxl.load_workbook(path, read_only=True, data_only=True)
    worksheet = workbook[sheet] if sheet else workbook[workbook.sheetnames[0]]
    rows = list(worksheet.iter_rows(values_only=True))
    alias_keys = {alias for values in aliases.values() for alias in values}
    header_index = None
    for index, row in enumerate(rows[:25]):
        if sum(1 for cell in row if norm_key(cell) in alias_keys) >= 2:
            header_index = index
            break
    if header_index is None:
        raise ValueError(f"Could not detect a header row in {path}:{worksheet.title}")
    headers = [str(value or "").strip() for value in rows[header_index]]
    result = []
    for values in rows[header_index + 1:]:
        if any(clean(value) is not None for value in values):
            result.append({headers[index]: values[index] if index < len(values) else None for index in range(len(headers)) if headers[index]})
    return result

def read_records(path: Path, kind: str, sheet: str | None = None) -> list[dict[str, Any]]:
    suffix = path.suffix.lower()
    aliases = FIN_ALIASES if kind == "financial" else CERT_ALIASES
    if suffix == ".json":
        return read_json_records(path, ["payments", "certifications"])
    if suffix in {".csv", ".txt"}:
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            return [dict(row) for row in csv.DictReader(handle)]
    if suffix in {".xlsx", ".xlsm"}:
        return read_xlsx_records(path, sheet, aliases)
    raise ValueError(f"Unsupported input format: {path.suffix}")

def field_map(row: dict[str, Any], aliases: dict[str, list[str]]) -> tuple[dict[str, Any], list[str]]:
    normalized = {norm_key(key): value for key, value in row.items()}
    mapped: dict[str, Any] = {}
    for canonical, names in aliases.items():
        for alias in names:
            if alias in normalized and clean(normalized[alias]) is not None:
                mapped[canonical] = clean(normalized[alias])
                break
    protected_names = _contract_sensitive_names()
    excluded = sorted({norm_key(key) for key in row if any(name and name in norm_key(key) for name in protected_names)})
    return mapped, excluded
