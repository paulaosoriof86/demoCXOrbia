from __future__ import annotations
from collections import defaultdict
from pathlib import Path
from typing import Any
from .common import HRIndex, clean, expected_total, normalize_payment_state, parse_amount, parse_date, sha256_bytes, stable_hash
from .readers import FIN_ALIASES, field_map

def process_financial(records:list[dict[str,Any]],hr:HRIndex,source_path:Path)->dict[str,Any]:
    source_sha=sha256_bytes(source_path.read_bytes());raw_count=len(records);seen={};unique=[];duplicates=0;sensitive=set()
    for idx,row in enumerate(records,1):
        mapped,fields=field_map(row,FIN_ALIASES);sensitive.update(fields);row_hash=stable_hash({k:clean(v) for k,v in mapped.items()})
        if row_hash in seen:duplicates+=1;continue
        seen[row_hash]=idx;unique.append((idx,mapped,row_hash))
    candidates=[];review=[];audits=[];by_visit:dict[str,list[int]]=defaultdict(list)
    for idx,row,row_hash in unique:
        reasons=[];match=None;visit=None
        if row.get("visitId"):
            if str(row["visitId"]) in hr.by_visit:visit=hr.by_visit[str(row["visitId"])];match="visitId_exact"
            else:reasons.append("visit_id_not_found")
        elif row.get("paymentItemId"):
            if str(row["paymentItemId"]) in hr.by_payment_item:visit=hr.by_payment_item[str(row["paymentItemId"])];match="paymentItemId_exact"
            else:reasons.append("payment_item_id_not_found")
        elif row.get("hrRowId"):
            found=hr.by_hr_row.get(str(row["hrRowId"]),[])
            if len(found)==1:visit=found[0];match="hrRowId_exact"
            elif len(found)>1:reasons.append("hr_row_id_ambiguous")
            else:reasons.append("hr_row_id_not_found")
        else:reasons.append("stable_visit_key_missing")
        state=normalize_payment_state(row.get("paymentState"));paid_at=parse_date(row.get("paidAt"));batch=clean(row.get("batchId"));source=clean(row.get("paymentSource"));confirmed=clean(row.get("confirmedBy"));source_id=clean(row.get("sourceRecordId")) or f"row_{idx}_{row_hash[:12]}"
        provided=parse_amount(row.get("total"));parts=[parse_amount(row.get(k)) for k in ("honorario","boleto","combo")]
        if provided is None and all(x is not None for x in parts):provided=round(sum(x or 0 for x in parts),2)
        expected=None
        if visit:
            expected,missing=expected_total(visit)
            if row.get("periodKey") and str(row["periodKey"])!=str(visit.get("periodKey")):reasons.append("period_mismatch")
            if row.get("country") and str(row["country"]).upper()!=str(visit.get("pais") or visit.get("country")).upper():reasons.append("country_mismatch")
            if row.get("currency") and str(row["currency"]).upper()!=str(visit.get("currency")).upper():reasons.append("currency_mismatch")
            if expected is None:reasons.append("hr_amount_incomplete")
            elif provided is None:reasons.append("payment_amount_missing")
            elif abs(expected-provided)>0.01:reasons.append("payment_amount_mismatch")
        if state=="paid":
            if not paid_at:reasons.append("paid_at_missing_or_invalid")
            if not batch:reasons.append("payment_batch_id_missing")
            if not source:reasons.append("payment_source_missing")
            if not confirmed:reasons.append("confirmed_by_missing")
        elif state=="conflict":reasons.append("payment_state_unknown")
        audit=f"audit_fin_{source_sha[:10]}_{idx}_{row_hash[:10]}"
        c={"visitId":visit.get("id") if visit else clean(row.get("visitId")),"hrRowId":visit.get("hrRowId") if visit else clean(row.get("hrRowId")),"shopperId":visit.get("shopperId") if visit else clean(row.get("shopperId")),"shopperCode":visit.get("shopperCode") if visit else clean(row.get("shopperCode")),"periodKey":visit.get("periodKey") if visit else clean(row.get("periodKey")),"country":visit.get("pais") if visit else clean(row.get("country")),"currency":visit.get("currency") if visit else clean(row.get("currency")),"paymentState":state,"paidAt":paid_at,"paymentBatchId":batch,"paymentSource":source,"confirmedBy":confirmed,"sourceRecordId":source_id,"total":provided,"expectedTotal":expected,"matchMethod":match,"auditRef":audit,"reviewRequired":bool(reasons),"reviewReasons":sorted(set(reasons)),"sourceSafe":True,"imported":False,"production":False}
        candidates.append(c)
        if c["visitId"]:by_visit[str(c["visitId"])].append(len(candidates)-1)
        audits.append({"auditRef":audit,"domain":"financial_payment_import","sourceRecordId":source_id,"row":idx,"sourceHash":source_sha,"recordHash":row_hash,"matchMethod":match,"decision":"review_required" if reasons else "accepted_dry_run","sourceSafe":True})
    for _,indexes in by_visit.items():
        if len(indexes)>1:
            hashes={stable_hash({k:candidates[i].get(k) for k in ("paymentState","paidAt","paymentBatchId","total","paymentSource")}) for i in indexes}
            if len(hashes)>1:
                for i in indexes:candidates[i]["reviewRequired"]=True;candidates[i]["reviewReasons"]=sorted(set(candidates[i]["reviewReasons"]+["conflicting_records_for_visit"]))
    batches={}
    for c in candidates:
        if not c.get("paymentBatchId"):continue
        b=batches.setdefault(str(c["paymentBatchId"]),{"paymentBatchId":c["paymentBatchId"],"items":0,"total":0.0,"currencies":set(),"countries":set(),"reviewRequired":False,"reviewReasons":[]});b["items"]+=1;b["total"]=round(b["total"]+(c.get("total") or 0),2)
        if c.get("currency"):b["currencies"].add(c["currency"])
        if c.get("country"):b["countries"].add(c["country"])
        if c["reviewRequired"]:b["reviewRequired"]=True
    for b in batches.values():
        if len(b["currencies"])>1:b["reviewRequired"]=True;b["reviewReasons"].append("mixed_currency_batch")
        b["currencies"]=sorted(b["currencies"]);b["countries"]=sorted(b["countries"]);b["state"]="pending_review" if b["reviewRequired"] else "accepted_dry_run"
    accepted=[c for c in candidates if c["paymentState"]=="paid" and not c["reviewRequired"]]
    for c in candidates:
        if c["reviewRequired"]:review.append({"key":f"payment_import:{c.get('visitId') or c.get('sourceRecordId')}","type":"payment_import","entityId":c.get("visitId") or c.get("sourceRecordId"),"state":"pending_review","reasons":c["reviewReasons"],"sourceRef":c.get("paymentSource") or f"sha256:{source_sha}","auditRef":c["auditRef"]})
    envelope={"schemaVersion":"1.1.0","tenantId":hr.raw.get("tenantId","tya"),"projectId":hr.raw.get("projectId","cinepolis"),"cutPeriod":"2026-06","sourceStatus":"dry_run_review_required" if review else "dry_run_accepted","claims":{"paidThroughPeriod":"2026-05","paidThroughState":"documented_claim_pending_source_match","june":{"q1":"requires_item_match","q2":"requires_item_match","unknownQuincena":"review_required"}},"payments":accepted,"batches":list(batches.values()),"sourceMeta":{"fileName":source_path.name,"sha256":source_sha,"records":raw_count,"sensitiveColumnsExcluded":sorted(sensitive)},"sourceSafe":True,"imported":False,"production":False,"providerWrites":False,"rawBankData":False,"dryRun":True}
    return {"envelope":envelope,"candidates":candidates,"reviewQueue":review,"auditEvents":audits,"summary":{"rawRecords":raw_count,"uniqueRecords":len(unique),"exactDuplicates":duplicates,"acceptedPaid":len(accepted),"pendingReview":len(review),"batches":len(batches),"sensitiveColumnsExcluded":sorted(sensitive)}}
