from __future__ import annotations

import hashlib, json, math, re
from collections import defaultdict
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Any

try:
    import openpyxl  # type: ignore
except Exception:
    openpyxl = None

def norm_key(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").strip().lower())

def clean(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, str):
        text = value.strip()
        return text if text else None
    return value

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def stable_hash(value: Any) -> str:
    payload = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode()).hexdigest()

def parse_amount(value: Any) -> float | None:
    value = clean(value)
    if value is None:
        return None
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if isinstance(value, float) and math.isnan(value):
            return None
        return round(float(value), 2)
    text = re.sub(r"[^0-9,.-]", "", str(value).strip().replace(" ", ""))
    if not text:
        return None
    if text.count(",") == 1 and text.count(".") == 0:
        text = text.replace(",", ".")
    elif "," in text and "." in text:
        text = text.replace(".", "").replace(",", ".") if text.rfind(",") > text.rfind(".") else text.replace(",", "")
    try:
        return round(float(text), 2)
    except ValueError:
        return None

def parse_int(value: Any) -> int | None:
    parsed = parse_amount(value)
    return int(parsed) if parsed is not None else None

def parse_date(value: Any) -> str | None:
    value = clean(value)
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, (int, float)) and openpyxl is not None:
        try:
            from openpyxl.utils.datetime import from_excel  # type: ignore
            return from_excel(value).date().isoformat()
        except Exception:
            return None
    text = str(value).strip()
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d/%m/%Y", "%d-%m-%Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(text, fmt).date().isoformat()
        except ValueError:
            pass
    return text if re.fullmatch(r"\d{4}-\d{2}-\d{2}", text) else None

def normalize_payment_state(value: Any) -> str:
    text = norm_key(value)
    if text in {"paid", "pagado", "pagada", "confirmed", "confirmado", "completed", "completado"}:
        return "paid"
    if text in {"pending", "pendiente", "review", "revision", "pendingfinancialsource"}:
        return "pending_financial_source"
    if text in {"cancelled", "canceled", "cancelado", "anulado"}:
        return "cancelled"
    return "conflict"

def normalize_cert_state(value: Any) -> str:
    text = norm_key(value)
    if text in {"certified", "certificado", "certificada", "approved", "aprobado", "aprobada", "passed", "vigente", "completed", "completado"}:
        return "presented"
    if text in {"expired", "vencido", "vencida"}:
        return "expired"
    if text in {"failed", "rejected", "reprobado", "reprobada", "rechazado", "rechazada"}:
        return "failed"
    if text in {"pending", "pendiente", "review", "revision", "pendingreview"}:
        return "pending_review"
    return "conflict"

def accepted_review(value: Any) -> bool:
    return norm_key(value) in {"accepted", "accept", "approved", "aprobado", "aprobada", "aceptado", "aceptada", "carryoveraccepted"}

@dataclass
class HRIndex:
    raw: dict[str, Any]
    visits: list[dict[str, Any]]
    shoppers: list[dict[str, Any]]
    by_visit: dict[str, dict[str, Any]]
    by_hr_row: dict[str, list[dict[str, Any]]]
    by_payment_item: dict[str, dict[str, Any]]
    shopper_by_id: dict[str, dict[str, Any]]
    shopper_by_code: dict[str, dict[str, Any]]

def read_js_assignment(path: Path) -> dict[str, Any]:
    match = re.search(r"=\s*(\{.*\})\s*;?\s*$", path.read_text(encoding="utf-8-sig"), re.S)
    if not match:
        raise ValueError(f"Could not parse JS object assignment: {path}")
    return json.loads(match.group(1))

def load_hr(path: Path) -> HRIndex:
    raw = read_js_assignment(path) if path.suffix.lower() == ".js" else json.loads(path.read_text(encoding="utf-8-sig"))
    visits = [dict(item) for item in raw.get("visits", []) if isinstance(item, dict)]
    shoppers = [dict(item) for item in raw.get("shoppers", []) if isinstance(item, dict)]
    by_visit = {str(item.get("id")): item for item in visits if item.get("id")}
    by_hr_row: dict[str, list[dict[str, Any]]] = defaultdict(list)
    by_payment_item: dict[str, dict[str, Any]] = {}
    tenant = raw.get("tenantId", "tya")
    project = raw.get("projectId", "cinepolis")
    safe = lambda value: re.sub(r"[^a-zA-Z0-9_-]+", "_", str(value or ""))
    for item in visits:
        if item.get("hrRowId"):
            by_hr_row[str(item["hrRowId"])].append(item)
        if item.get("id"):
            by_payment_item[f"payitem_{safe(tenant)}_{safe(project)}_{safe(item['id'])}"] = item
    by_id = {str(item.get("id")): item for item in shoppers if item.get("id")}
    by_code = {str(item.get("code")): item for item in shoppers if item.get("code")}
    for item in visits:
        if item.get("shopperId") and str(item["shopperId"]) not in by_id:
            by_id[str(item["shopperId"])] = {"id": item["shopperId"], "code": item.get("shopperCode")}
        if item.get("shopperCode") and str(item["shopperCode"]) not in by_code:
            by_code[str(item["shopperCode"])] = {"id": item.get("shopperId"), "code": item["shopperCode"]}
    return HRIndex(raw, visits, shoppers, by_visit, dict(by_hr_row), by_payment_item, by_id, by_code)

def expected_total(visit: dict[str, Any]) -> tuple[float | None, list[str]]:
    values = {key: parse_amount(visit.get(key)) for key in ("honorario", "boleto", "comboAmt")}
    missing = [key for key, value in values.items() if value is None]
    return (None, missing) if missing else (round(sum(value or 0 for value in values.values()), 2), [])
