"""Offline regression of the Google paired runner's exact DEV compensation."""
import importlib.util
import io
import json
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("paired", Path(__file__).with_name("cxorbia-i3-paired-google.py"))
paired = importlib.util.module_from_spec(spec)
spec.loader.exec_module(paired)
old = dict(runtimeRevision="cxorbia-live-hr-dev-00395-lnc", runtimeDigest="sha256:"+"a"*64,
           sourceSha="72874c08560addf5d0bc4a23573d65ce86481c95",
           hostingVersion="sites/cxorbia-backend-dev/versions/e9a216661b686246")
image = dict(productSource="ff9ac83ea7bbe4ad19e8faf7951ef8256be92671", digest="sha256:"+"b"*64)
run = "389c0a19-f9fd-4f7f-b0d2-4a5d16c9fe87"

class RollbackTest(unittest.TestCase):
    def setUp(self):
        self.rev = "cxorbia-live-hr-dev-00396-fixture"
        self.version = "sites/cxorbia-backend-dev/versions/synthetic"
        self.message = "CXORBIA_E10_"+run
        self.runtime_run = run
        self.percent = 100
        self.mutations = []
        self.records = []

    def http(self, request, timeout):
        self.assertIn("sites/cxorbia-backend-dev/channels/live",request.full_url)
        if request.get_method() == "POST":
            self.assertIn("versionName=sites%2Fcxorbia-backend-dev%2Fversions%2Fe9a216661b686246",request.full_url)
            self.mutations.append("hosting")
            self.version = old["hostingVersion"]
        return io.BytesIO(json.dumps({"release":{"message":self.message,"version":{"name":self.version}}}).encode())

    def cli(self, *args):
        if args[1:3] == ("auth","print-access-token"):
            return "synthetic"
        self.assertIn("--project=cxorbia-backend-dev",args)
        if args[2:4] == ("services","describe"):
            return json.dumps({"status":{"traffic":[{"revisionName":self.rev,"percent":self.percent}]}})
        if args[2:4] == ("revisions","describe"):
            previous = args[4] == old["runtimeRevision"]
            rows = [{"name":"CXORBIA_RECOVERY_SOURCE_SHA","value":old["sourceSha"] if previous else image["productSource"]},
                    {"name":"CXORBIA_E10_PAIRED_RUN","value":self.runtime_run}]
            return json.dumps({"spec":{"containers":[{"env":rows}]},"status":{"imageDigest":old["runtimeDigest"] if previous else image["digest"]}})
        if args[2:4] == ("services","update-traffic"):
            self.assertIn("--to-revisions="+old["runtimeRevision"]+"=100",args)
            self.rev = old["runtimeRevision"]
            self.mutations.append("runtime")
            return ""
        raise AssertionError(args)

    def restore(self):
        with patch.object(paired,"output",self.cli), patch("urllib.request.urlopen",self.http):
            paired.restore_e10_pair(old,image,run,lambda key,value:self.records.append((key,value)))

    def test_exact_pair_restores_and_replay_is_readonly(self):
        self.restore()
        self.restore()
        self.assertEqual(self.mutations,["hosting","runtime"])
        self.assertEqual(self.records[-1][1]["runtimeDigest"],old["runtimeDigest"])

    def test_foreign_hosting_blocks_recovery(self):
        self.message = "other"
        with self.assertRaisesRegex(RuntimeError,"FOREIGN_HOSTING"): self.restore()
        self.assertEqual(self.mutations,[])

    def test_foreign_runtime_keeps_its_traffic(self):
        self.version = old["hostingVersion"]
        self.runtime_run = "other"
        with self.assertRaisesRegex(RuntimeError,"FOREIGN_RUNTIME"): self.restore()
        self.assertEqual(self.mutations,[])

    def test_split_traffic_is_preserved(self):
        self.version = old["hostingVersion"]
        self.percent = 50
        with self.assertRaisesRegex(RuntimeError,"FOREIGN_TRAFFIC"): self.restore()
        self.assertEqual(self.mutations,[])

class ReaderCutoverTest(unittest.TestCase):
    def setUp(self):
        self.new="cxorbia-live-hr-dev-00396-fixture"
        self.rows=[{"revisionName":self.new,"percent":100},{"revisionName":"old-tag","tag":"historical"}]
        self.tag_env=[]
        self.proof=dict(runId=run,stage="enabled",project=paired.project,sourceSha=image["productSource"],
                        digest=image["digest"],scenarioId=10200465,readerActive=True,writerActive=False,
                        readerPending=0,autoPurchasing=False,independentlyObserved=True,observedAtEpoch=1000,
                        remainingSharedMargin=3,availableCenticredits=39500,publicationCreditsUsed=0)
    def routes(self):
        def cmd(*args):
            if args[2]=="services": return json.dumps({"status":{"traffic":self.rows}})
            if args[4]=="old-tag": return json.dumps({"spec":{"containers":[{"env":self.tag_env}]}})
            if args[4]==old["runtimeRevision"]: return json.dumps({"spec":{"timeoutSeconds":120}})
            return json.dumps({"spec":{"containers":[{"env":[{"name":"CXORBIA_RECOVERY_SOURCE_SHA","value":image["productSource"]}]}]},
                               "status":{"imageDigest":"gcr.io/test@"+image["digest"]}})
        with patch.object(paired,"output",cmd):
            return paired.check_reader_routes(old,self.new,image)
    def receipt(self,stage="enabled",opening=True):
        result=type("result",(),{"returncode":0,"stdout":"123","stderr":""})()
        with patch("subprocess.run",return_value=result),patch.object(paired,"output",return_value=json.dumps(self.proof)),patch("time.time",return_value=1010):
            return paired.reader_stage_receipt(stage,run,image,990,opening)
    def test_exact_image_and_safe_tag_can_drain(self):
        self.assertEqual(self.routes(),120)
    def test_predecessor_or_paid_tag_denies_opening(self):
        self.tag_env=[{"name":"CXORBIA_B14_MAKE_TOOLBOX_TOKEN"}]
        with self.assertRaisesRegex(RuntimeError,"READER_TAG"):self.routes()
        self.rows[-1]["revisionName"]=old["runtimeRevision"]
        with self.assertRaisesRegex(RuntimeError,"READER_TAG"):self.routes()
    def test_split_traffic_denies_opening(self):
        self.rows[0]["percent"]=99
        with self.assertRaisesRegex(RuntimeError,"PREDECESSOR_TRAFFIC"):self.routes()
    def test_open_and_close_are_generation_bound(self):
        self.assertTrue(self.receipt()["uri"].endswith("#123"))
        self.proof.update(stage="closed",readerActive=False,availableCenticredits=30500,publicationCreditsUsed=90)
        self.assertEqual(self.receipt("closed",False)["publicationCreditsUsed"],90)
    def test_read_only_compensation_after_provider_debit_anomaly_still_requires_reader_off(self):
        self.proof.update(stage="closed-on-failure",readerActive=False,availableCenticredits=50,publicationCreditsUsed=91)
        self.assertEqual(self.receipt("closed-on-failure",False)["publicationCreditsUsed"],91)
        self.proof["readerActive"]=True
        with self.assertRaisesRegex(RuntimeError,"STAGE_READBACK"):self.receipt("closed-on-failure",False)
    def test_preflight_covers_all_three_allocations_and_shared_debits(self):
        self.proof.update(stage="funding-preflight",readerActive=False)
        self.assertEqual(self.receipt("funding-preflight",False)["availableCenticredits"],39500)
        original=dict(self.proof)
        for key,value in [("availableCenticredits",39499),("remainingSharedMargin",4),
                          ("readerActive",True),("writerActive",True),("publicationCreditsUsed",1)]:
            with self.subTest(field=key):
                self.proof={**original,key:value}
                with self.assertRaisesRegex(RuntimeError,"STAGE_READBACK_funding-preflight"):
                    self.receipt("funding-preflight",False)

    def test_old_opening_balance_cannot_use_the_preventive_margin(self):
        self.proof.update(availableCenticredits=19300)
        with self.assertRaisesRegex(RuntimeError,"STAGE_READBACK_enabled"):
            self.receipt()

    def test_missing_independent_receipt_fails_after_work_disconnect(self):
        missing=paired.subprocess.CompletedProcess([],1,stdout="",stderr="404 Not Found")
        for stage in ("funding-preflight","closed-on-failure"):
            with self.subTest(stage=stage), patch.object(paired.subprocess,"run",return_value=missing) as fetch, \
                    patch.object(paired.time,"monotonic",side_effect=[0,3,75]), patch.object(paired.time,"sleep"):
                with self.assertRaisesRegex(RuntimeError,"MAKE_STAGE_RECEIPT_"+stage):
                    paired.reader_stage_receipt(stage,run,image,990,False)
                self.assertTrue(all(call.args[0][:4]==["gcloud","storage","objects","describe"]
                                    for call in fetch.call_args_list))

    def test_wrong_or_stale_make_observation_is_rejected(self):
        original=dict(self.proof)
        for k,value in [("runId","other"),("writerActive",True),("readerPending",1),("availableCenticredits",39499),
                        ("observedAtEpoch",989),("observedAtEpoch",1011),("publicationCreditsUsed",1),("readerActive",False)]:
            with self.subTest(field=k):
                self.proof={**original,k:value}
                with self.assertRaisesRegex(RuntimeError,"STAGE_READBACK"):self.receipt()

if __name__ == "__main__":
    unittest.main()
