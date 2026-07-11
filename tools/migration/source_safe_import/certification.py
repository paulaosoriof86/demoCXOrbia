from __future__ import annotations
from collections import defaultdict
from datetime import date
from pathlib import Path
from typing import Any
from .common import HRIndex, accepted_review, clean, normalize_cert_state, parse_amount, parse_date, parse_int, sha256_bytes, stable_hash
from .readers import CERT_ALIASES, field_map

def process_certifications(records:list[dict[str,Any]],hr:HRIndex,source_path:Path)->dict[str,Any]:
    source_sha=sha256_bytes(source_path.read_bytes());raw_count=len(records);seen=set();unique=[];duplicates=0;sensitive=set()
    for idx,row in enumerate(records,1):
        mapped,fields=field_map(row,CERT_ALIASES);sensitive.update(fields);row_hash=stable_hash({k:clean(v) for k,v in mapped.items()})
        if row_hash in seen:duplicates+=1;continue
        seen.add(row_hash);unique.append((idx,mapped,row_hash))
    candidates=[];review=[];audits=[];grouped:dict[str,list[int]]=defaultdict(list);today=date.today().isoformat()
    for idx,row,row_hash in unique:
        reasons=[];shopper=None;match=None
        if row.get("shopperId"):
            if str(row["shopperId"]) in hr.shopper_by_id:shopper=hr.shopper_by_id[str(row["shopperId"])];match="shopperId_exact"
            else:reasons.append("shopper_id_not_found")
        elif row.get("shopperCode"):
            if str(row["shopperCode"]) in hr.shopper_by_code:shopper=hr.shopper_by_code[str(row["shopperCode"])];match="shopperCode_exact"
            else:reasons.append("shopper_code_not_found")
        elif row.get("shopperName"):reasons.append("name_only_match_disallowed")
        else:reasons.append("shopper_key_missing")
        project=clean(row.get("projectId")) or hr.raw.get("projectId","cinepolis");cert=clean(row.get("certificationId")) or "cinepolis-main";state=normalize_cert_state(row.get("state"));presented=parse_date(row.get("presentedAt"));valid=parse_date(row.get("validUntil"));score=parse_amount(row.get("score"));attempts=parse_int(row.get("attempts"));source=clean(row.get("sourceRef"));source_id=clean(row.get("sourceRecordId")) or f"row_{idx}_{row_hash[:12]}";reviewed_by=clean(row.get("reviewedBy"));reviewed_at=parse_date(row.get("reviewedAt"));review_ok=accepted_review(row.get("reviewDecision"))
        if project!=hr.raw.get("projectId","cinepolis"):reasons.append("project_mismatch")
        if state=="conflict":reasons.append("certification_state_unknown")
        if not presented and state=="presented":reasons.append("presented_at_missing_or_invalid")
        if score is not None and not 0<=score<=100:reasons.append("score_out_of_range")
        if not source:reasons.append("source_ref_missing")
        if valid and valid<today:state="expired"
        carried=bool(shopper and state=="presented" and presented and source and reviewed_by and reviewed_at and review_ok and not reasons)
        if state=="presented" and not carried:
            if not reviewed_by:reasons.append("reviewed_by_missing")
            if not reviewed_at:reasons.append("reviewed_at_missing_or_invalid")
            if not review_ok:reasons.append("review_decision_not_accepted")
        audit=f"audit_cert_{source_sha[:10]}_{idx}_{row_hash[:10]}"
        c={"tenantId":hr.raw.get("tenantId","tya"),"projectId":project,"shopperId":shopper.get("id") if shopper else clean(row.get("shopperId")),"shopperCode":shopper.get("code") if shopper else clean(row.get("shopperCode")),"certificationId":cert,"state":"carried_over" if carried else state if state in {"expired","failed"} else "pending_review" if reasons else state,"eligible":carried,"score":score,"attempts":attempts,"presentedAt":presented,"validUntil":valid,"reviewedBy":reviewed_by if carried else None,"reviewedAt":reviewed_at if carried else None,"auditRef":audit,"sourceRef":source,"sourceRecordId":source_id,"matchMethod":match,"reviewRequired":not carried and state not in {"expired","failed"},"reviewReasons":sorted(set(reasons)),"sourceSafe":True,"imported":False,"production":False}
        candidates.append(c);grouped[f"{c.get('shopperId') or c.get('sourceRecordId')}|{project}|{cert}"].append(len(candidates)-1);audits.append({"auditRef":audit,"domain":"certification_carryover_import","sourceRecordId":source_id,"row":idx,"sourceHash":source_sha,"recordHash":row_hash,"matchMethod":match,"decision":"carried_over_dry_run" if carried else "review_required" if c["reviewRequired"] else c["state"],"sourceSafe":True})
    for _,indexes in grouped.items():
        if len(indexes)>1:
            hashes={stable_hash({k:candidates[i].get(k) for k in ("state","score","presentedAt","validUntil","sourceRef")}) for i in indexes}
            if len(hashes)>1:
                for i in indexes:candidates[i]["eligible"]=False;candidates[i]["state"]="pending_review";candidates[i]["reviewRequired"]=True;candidates[i]["reviewReasons"]=sorted(set(candidates[i]["reviewReasons"]+["conflicting_records_for_certification"]));candidates[i]["reviewedBy"]=None;candidates[i]["reviewedAt"]=None
    carried=[c for c in candidates if c["state"]=="carried_over" and c["eligible"] and not c["reviewRequired"]]
    for c in candidates:
        if c["reviewRequired"]:review.append({"key":f"certification_import:{c.get('shopperId') or c.get('sourceRecordId')}:{c['certificationId']}","type":"certification_import","entityId":c.get("shopperId") or c.get("sourceRecordId"),"state":"pending_review","reasons":c["reviewReasons"],"sourceRef":c.get("sourceRef") or f"sha256:{source_sha}","auditRef":c["auditRef"]})
    envelope={"schemaVersion":"1.1.0","tenantId":hr.raw.get("tenantId","tya"),"projectId":hr.raw.get("projectId","cinepolis"),"certificationId":"cinepolis-main","sourceStatus":"dry_run_review_required" if review else "dry_run_accepted","certifications":carried,"sourceMeta":{"fileName":source_path.name,"sha256":source_sha,"records":raw_count,"sensitiveColumnsExcluded":sorted(sensitive)},"sourceSafe":True,"imported":False,"production":False,"providerWrites":False,"rawEvidence":False,"dryRun":True}
    return {"envelope":envelope,"candidates":candidates,"reviewQueue":review,"auditEvents":audits,"summary":{"rawRecords":raw_count,"uniqueRecords":len(unique),"exactDuplicates":duplicates,"carriedOver":len(carried),"pendingReview":len(review),"expired":sum(1 for c in candidates if c["state"]=="expired"),"failed":sum(1 for c in candidates if c["state"]=="failed"),"sensitiveColumnsExcluded":sorted(sensitive)}}
