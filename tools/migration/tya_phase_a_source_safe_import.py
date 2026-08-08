#!/usr/bin/env python3
"""Dry-run importer for sanitized TyA payments and certifications."""
from __future__ import annotations
import argparse,json,sys
from pathlib import Path
from source_safe_import.common import load_hr
from source_safe_import.readers import read_records
from source_safe_import.outputs import write_outputs
from source_safe_import.financial import process_financial
from source_safe_import.certification import process_certifications

def parser()->argparse.ArgumentParser:
    p=argparse.ArgumentParser(description="TyA Phase A source-safe import dry-run");p.add_argument("--hr",required=True);p.add_argument("--financial");p.add_argument("--certifications");p.add_argument("--financial-sheet");p.add_argument("--certification-sheet");p.add_argument("--out",required=True);p.add_argument("--strict",action="store_true");return p

def main(argv:list[str]|None=None)->int:
    a=parser().parse_args(argv);hr=load_hr(Path(a.hr).resolve());fin=cert=None
    if a.financial:
        path=Path(a.financial).resolve();fin=process_financial(read_records(path,"financial",a.financial_sheet),hr,path)
    if a.certifications:
        path=Path(a.certifications).resolve();cert=process_certifications(read_records(path,"certification",a.certification_sheet),hr,path)
    if not fin and not cert:raise SystemExit("At least one of --financial or --certifications is required")
    report=write_outputs(Path(a.out).resolve(),hr,fin,cert);print(json.dumps(report,ensure_ascii=False,indent=2));return 2 if a.strict and report["reviewQueue"] else 0
if __name__=="__main__":sys.exit(main())
