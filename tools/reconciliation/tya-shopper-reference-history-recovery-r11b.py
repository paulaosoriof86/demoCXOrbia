#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path
from typing import Any

REF_RE = re.compile(r"^shopper_(?:gt|hn)_[0-9a-f]{8,64}$", re.I)
PATH_REF_RE = re.compile(r"(?:^|/)shoppers?/([^/\s\"']+)", re.I)
LIKELY_PATH_RE = re.compile(r"(shopper|materialization|protected|source[-_]?safe|candidate|firestore)", re.I)
TEXT_EXT_RE = re.compile(r"\.(json|js|mjs|md|txt)$", re.I)


def run(args: list[str], text: bool = True) -> str | bytes:
    return subprocess.check_output(args, text=text, stderr=subprocess.DEVNULL)


def parse_js_or_json(raw: str) -> Any | None:
    raw = raw.lstrip("\ufeff\x00 \t\r\n")
    try:
        return json.loads(raw)
    except Exception:
        pass
    marker = raw.find("window.CX_TYA_HR_SOURCE_SAFE")
    if marker >= 0:
        start = raw.find("{", marker)
        end = raw.rfind("}")
        if start >= 0 and end > start:
            try:
                return json.loads(raw[start : end + 1])
            except Exception:
                return None
    return None


def collect_refs(value: Any, out: set[str]) -> None:
    if isinstance(value, dict):
        for key, item in value.items():
            key_l = str(key).lower()
            if isinstance(item, str):
                candidate = item.strip()
                if REF_RE.match(candidate):
                    out.add(candidate)
                if key_l == "path" or key_l.endswith("path"):
                    m = PATH_REF_RE.search(candidate)
                    if m and REF_RE.match(m.group(1)):
                        out.add(m.group(1))
            collect_refs(item, out)
    elif isinstance(value, list):
        for item in value:
            collect_refs(item, out)
    elif isinstance(value, str):
        candidate = value.strip()
        if REF_RE.match(candidate):
            out.add(candidate)


def current_payload(path: Path) -> dict[str, Any]:
    parsed = parse_js_or_json(path.read_text(encoding="utf-8"))
    if not isinstance(parsed, dict) or parsed.get("sourceSafe") is not True:
        raise SystemExit("current payload is not source-safe")
    return parsed


def refs_from_payload(payload: dict[str, Any]) -> set[str]:
    refs: set[str] = set()
    for shopper in payload.get("shoppers", []):
        if isinstance(shopper, dict):
            ref = str(shopper.get("id") or shopper.get("shopperRefId") or "").strip()
            if REF_RE.match(ref):
                refs.add(ref)
    return refs


def git_object_candidates(max_bytes: int) -> list[dict[str, Any]]:
    rows = run(["git", "rev-list", "--objects", "--all"]).splitlines()
    seen: set[str] = set()
    candidates: list[dict[str, Any]] = []
    for row in rows:
        parts = row.split(" ", 1)
        sha = parts[0]
        path = parts[1] if len(parts) > 1 else ""
        if sha in seen:
            continue
        seen.add(sha)
        if path and (not LIKELY_PATH_RE.search(path) or not TEXT_EXT_RE.search(path)):
            continue
        try:
            obj_type = run(["git", "cat-file", "-t", sha]).strip()
            if obj_type != "blob":
                continue
            size = int(run(["git", "cat-file", "-s", sha]).strip())
        except Exception:
            continue
        if size <= 0 or size > max_bytes:
            continue
        try:
            raw_b = run(["git", "cat-file", "-p", sha], text=False)
            raw = raw_b.decode("utf-8")
        except Exception:
            continue
        if "shopper_" not in raw and '"shopper"' not in raw.lower() and "/shoppers/" not in raw.lower():
            continue
        refs: set[str] = set()
        parsed = parse_js_or_json(raw)
        if parsed is not None:
            collect_refs(parsed, refs)
        if not refs:
            refs.update(m.group(0) for m in re.finditer(r"shopper_(?:gt|hn)_[0-9a-f]{8,64}", raw, re.I))
        if refs:
            commit = ""
            committed_at = ""
            try:
                line = run(["git", "log", "--all", "--find-object=" + sha, "-1", "--format=%H|%cI"]).strip()
                if "|" in line:
                    commit, committed_at = line.split("|", 1)
            except Exception:
                pass
            candidates.append(
                {
                    "blobSha": sha,
                    "pathHint": path or None,
                    "size": size,
                    "referenceCount": len(refs),
                    "referenceSetSha256": hashlib.sha256(json.dumps(sorted(refs), separators=(",", ":")).encode()).hexdigest(),
                    "commit": commit or None,
                    "committedAt": committed_at or None,
                    "refs": sorted(refs),
                }
            )
    return candidates


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--current", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--target", type=int, default=213)
    ap.add_argument("--max-bytes", type=int, default=20_000_000)
    args = ap.parse_args()

    payload = current_payload(Path(args.current))
    current_refs = refs_from_payload(payload)
    if len(current_refs) != int(payload.get("counts", {}).get("shoppers", len(current_refs))):
        raise SystemExit("current shopper reference count mismatch")

    candidates = git_object_candidates(args.max_bytes)
    exact = [c for c in candidates if c["referenceCount"] == args.target]
    exact.sort(key=lambda c: (c.get("committedAt") or "", c.get("pathHint") or ""), reverse=True)
    selected = exact[0] if exact else None

    if selected:
        historical_refs = set(selected.pop("refs"))
        missing = sorted(historical_refs - current_refs)
        new = sorted(current_refs - historical_refs)
        stable = sorted(current_refs & historical_refs)
        if len(missing) == 3 and not new and len(stable) == 210:
            decision = "RECOVERED_REVIEW_REQUIRED_THREE_HISTORICAL_ONLY_REFS"
        elif not missing and not new:
            decision = "RECOVERED_PASS_NO_REFERENCE_DRIFT"
        else:
            decision = "RECOVERED_REVIEW_REQUIRED_UNEXPECTED_REFERENCE_DRIFT"
    else:
        missing, new, stable = [], [], []
        decision = "HOLD_NO_213_REFERENCE_SET_IN_REACHABLE_GIT_OBJECTS"

    ranked = sorted(candidates, key=lambda c: (abs(c["referenceCount"] - args.target), -c["referenceCount"]))[:25]
    for c in ranked:
        c.pop("refs", None)

    report = {
        "schemaVersion": "1.0.0",
        "reportId": "tya-shopper-reference-history-recovery-r11b",
        "generatedAt": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "tenantId": "tya",
        "projectId": "cinepolis",
        "decision": decision,
        "current": {
            "shopperCount": len(current_refs),
            "visitCount": int(payload.get("counts", {}).get("visits", 0)),
            "periodCount": int(payload.get("counts", {}).get("periods", 0)),
            "referenceSetSha256": hashlib.sha256(json.dumps(sorted(current_refs), separators=(",", ":")).encode()).hexdigest(),
        },
        "recoveredHistorical": selected,
        "comparison": {
            "stableCount": len(stable),
            "historicalOnlyCount": len(missing),
            "currentOnlyCount": len(new),
            "historicalOnlyRefs": missing,
            "currentOnlyRefs": new,
        },
        "search": {
            "reachableGitObjectsWithShopperRefs": len(candidates),
            "exact213Candidates": len(exact),
            "rankedCandidates": ranked,
        },
        "policy": {
            "sourceSafeOnly": True,
            "noRawNames": True,
            "noNameMatching": True,
            "noAutomaticMerge": True,
            "noAutomaticDelete": True,
            "noFixtureBackfill": True,
            "materializationHold": decision != "RECOVERED_PASS_NO_REFERENCE_DRIFT",
        },
        "safeState": {"writes": False, "imported": False, "production": False, "providers": False, "paymentsExecuted": False},
    }
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
