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

if __name__ == "__main__":
    unittest.main()
