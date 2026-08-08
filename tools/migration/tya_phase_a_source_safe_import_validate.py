#!/usr/bin/env python3
from __future__ import annotations

import argparse,json,subprocess,sys,tempfile
from pathlib import Path
try:
    import openpyxl  # type: ignore
except Exception:
    openpyxl=None
HERE=Path(__file__).resolve().parent;IMPORTER=HERE/"tya_phase_a_source_safe_import.py";FIXTURES=HERE/"fixtures"

def write_xlsx(path:Path,records:list[dict],sheet:str):
    if openpyxl is None:raise RuntimeError("openpyxl unavailable")
    wb=openpyxl.Workbook();ws=wb.active;ws.title=sheet;headers=sorted({key for row in records for key in row});ws.append(headers)
    for row in records:ws.append([row.get(key) for key in headers])
    wb.save(path)

def verify(out:Path)->list[str]:
    checks=[];report=json.loads((out/"phase-a-source-safe-import-report.json").read_text())
    assert report["hrIndex"]=={"visits":3,"shoppers":3,"sourceSafe":True};checks.append("hr_index_3_visits_3_shoppers")
    assert report["financial"]["rawRecords"]==5 and report["financial"]["uniqueRecords"]==4 and report["financial"]["exactDuplicates"]==1 and report["financial"]["acceptedPaid"]==1 and report["financial"]["pendingReview"]==3;checks.append("financial_counts_expected")
    assert report["certification"]["rawRecords"]==5 and report["certification"]["uniqueRecords"]==4 and report["certification"]["exactDuplicates"]==1 and report["certification"]["carriedOver"]==1 and report["certification"]["pendingReview"]==3;checks.append("certification_counts_expected")
    assert report["reviewQueue"]==6 and report["auditEvents"]==8;checks.append("review_and_audit_counts_expected")
    financial=json.loads((out/"financial-control.source-safe.json").read_text());assert len(financial["payments"])==1;payment=financial["payments"][0]
    assert payment["visitId"]=="hr_2025-05_gt_1" and payment["paymentState"]=="paid" and payment["paidAt"]=="2025-06-20" and payment["paymentBatchId"]=="BATCH-GT-MAY-01" and payment["total"]==225 and payment["reviewRequired"] is False;checks.append("one_valid_paid_candidate")
    candidates=json.loads((out/"financial-candidates.source-safe.json").read_text());mismatch=next(x for x in candidates if x.get("visitId")=="hr_2025-05_hn_1");assert "payment_amount_mismatch" in mismatch["reviewReasons"]
    missing=next(x for x in candidates if x.get("visitId")=="hr_2026-06_gt_1");assert "confirmed_by_missing" in missing["reviewReasons"];unknown=next(x for x in candidates if x.get("visitId")=="unknown_visit");assert unknown["reviewRequired"] is True;checks.append("financial_conflicts_visible")
    cert=json.loads((out/"certification-carryover.source-safe.json").read_text());assert len(cert["certifications"])==1;carried=cert["certifications"][0];assert carried["shopperId"]=="shopper_gt_001" and carried["state"]=="carried_over" and carried["eligible"] is True;checks.append("one_valid_certification_carryover")
    certs=json.loads((out/"certification-candidates.source-safe.json").read_text());name_only=next(x for x in certs if x.get("sourceRecordId")=="cert-name-only");assert "name_only_match_disallowed" in name_only["reviewReasons"]
    pending=next(x for x in certs if x.get("shopperCode")=="TYA_HN_001");assert pending["state"]=="pending_review" and "reviewed_by_missing" in pending["reviewReasons"];checks.append("certification_conflicts_visible")
    all_text="\n".join(path.read_text() for path in out.glob("*") if path.is_file());assert "SECRET-NOT-OUTPUT" not in all_text and "hidden@example.com" not in all_text;assert "bankaccount" in json.dumps(report["financial"]["sensitiveColumnsExcluded"]) and "email" in json.dumps(report["certification"]["sensitiveColumnsExcluded"]);checks.append("sensitive_values_not_emitted")
    assert report["dryRun"] is True and report["writes"] is False and report["imported"] is False and report["production"] is False;checks.append("safe_state_locked");return checks

def run_importer(financial:Path,certifications:Path,out:Path):
    subprocess.run([sys.executable,str(IMPORTER),"--hr",str(FIXTURES/"phase-a-import-hr-index.source-safe.json"),"--financial",str(financial),"--certifications",str(certifications),"--out",str(out)],check=True,capture_output=True,text=True)

def main()->int:
    parser=argparse.ArgumentParser();parser.add_argument("--out",required=True);args=parser.parse_args();out=Path(args.out).resolve();out.mkdir(parents=True,exist_ok=True);checks=[];blockers=[]
    try:
        target=out/"json-run";run_importer(FIXTURES/"phase-a-financial-import.source-safe.json",FIXTURES/"phase-a-certification-import.source-safe.json",target);checks.extend("json:"+item for item in verify(target))
    except Exception as exc:blockers.append(f"json_run_failed:{exc}")
    try:
        if openpyxl is None:raise RuntimeError("openpyxl unavailable")
        financial=json.loads((FIXTURES/"phase-a-financial-import.source-safe.json").read_text())["payments"];certifications=json.loads((FIXTURES/"phase-a-certification-import.source-safe.json").read_text())["certifications"]
        with tempfile.TemporaryDirectory() as temp:
            temp_path=Path(temp);financial_xlsx=temp_path/"financial.xlsx";cert_xlsx=temp_path/"certifications.xlsx";write_xlsx(financial_xlsx,financial,"Pagos");write_xlsx(cert_xlsx,certifications,"Certificaciones");target=out/"xlsx-run";run_importer(financial_xlsx,cert_xlsx,target);checks.extend("xlsx:"+item for item in verify(target))
    except Exception as exc:blockers.append(f"xlsx_run_failed:{exc}")
    result={"ok":not blockers,"checks":checks,"blockers":blockers,"expected":{"financial":{"raw":5,"unique":4,"duplicates":1,"acceptedPaid":1,"pendingReview":3},"certification":{"raw":5,"unique":4,"duplicates":1,"carriedOver":1,"pendingReview":3},"reviewQueue":6,"auditEvents":8},"safeState":{"dryRun":True,"writes":False,"imported":False,"production":False,"providers":False}}
    (out/"phase-a-source-safe-import-validator.json").write_text(json.dumps(result,indent=2)+"\n");(out/"phase-a-source-safe-import-validator.md").write_text(f"# Phase A source-safe import validator\n\nVerdict: **{'PASS' if result['ok'] else 'HOLD'}**\n\nChecks: {len(checks)}\n\nBlockers: {len(blockers)}\n");print(json.dumps(result,indent=2));return 0 if result["ok"] else 1
if __name__=="__main__":raise SystemExit(main())
