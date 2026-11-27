"""Run the existing paired DEV job with its verified Google image and native build identity."""
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import zipfile

import yaml

descriptor_path = "CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json"
workflow_path = ".github/workflows/cxorbia-recovery-i3-dev-certification.yml"
job_name = "vrm154-156-dev-materialization"
project = "cxorbia-backend-dev"
branch = "recovery/cxorbia-phase-a-20260831"


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def output(*args):
    return subprocess.check_output(args, text=True).strip()


def read(path):
    return json.loads(Path(path).read_text())


def write(path, value):
    Path(path).write_text(json.dumps(value, indent=2) + "\n")


def describe(build_id):
    return json.loads(output("gcloud", "builds", "describe", build_id, "--region=global",
                             "--project=" + project, "--format=json"))


def verified_image(build, config, source, tree):
    image = config["imageBuild"]
    pin = config["sourceObject"]
    expected = {"bucket": pin["bucket"], "object": pin["name"], "generation": str(pin["generation"])}
    source_object = build.get("sourceProvenance", {}).get("resolvedStorageSource", {})
    require(all(str(source_object.get(k)) == v for k, v in expected.items()), "IMAGE_STORAGE_SOURCE_CHANGED")
    require(build.get("id") == image["id"] and build.get("projectId") == project and build.get("status") == "SUCCESS"
            and build.get("serviceAccount") == config["serviceAccount"], "IMAGE_BUILD_IDENTITY")
    original = yaml.safe_load(output("git", "show", source + ":backend/runtime/hr-live-service/cloudbuild.yaml"))
    steps = build.get("steps", [])
    require(len(steps) == len(original["steps"]) == 1 and steps[0].get("status") == "SUCCESS"
            and steps[0]["name"] == original["steps"][0]["name"], "IMAGE_BUILD_STEP")
    tag = image["tag"]
    args = original["steps"][0]["args"]
    require(build["substitutions"].get("_IMAGE") == tag and steps[0]["args"] in
            (args, [arg.replace("${_IMAGE}", tag) for arg in args]), "IMAGE_BUILD_COMMAND")
    matches = [row for row in build.get("results", {}).get("images", []) if row.get("name") == tag]
    require(len(matches) == 1 and matches[0].get("digest") == image["digest"]
            and re.fullmatch(r"sha256:[a-f0-9]{64}", image["digest"]), "IMAGE_BUILD_DIGEST")
    require(output("git", "rev-parse", source + "^{tree}") == tree, "IMAGE_PRODUCT_TREE")
    return {"id": image["id"], "status": "SUCCESS", "project": project, "location": "global",
            "serviceAccount": build["serviceAccount"], "sourceObject": pin, "productSource": source,
            "productTree": tree, "tag": tag, "digest": image["digest"], "startedAt": build["startTime"],
            "completedAt": build["finishTime"]}


def preflight(git_head):
    require(output("git", "ls-remote", "origin", "refs/heads/" + branch).split()[0] == git_head,
            "SOURCE_FAILURE:CURRENT_CONTROL_CHANGED")
    # The repository is public. Use the same consumer and immutable journals for the GET-only preflight.
    script = """
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {pendingRuns,pendingExternalTypedResults} from './tools/qa/cxorbia-i3-automatic-result-consumer.mjs';
const read=p=>JSON.parse(fs.readFileSync(p));
const api=async p=>{assert(p.startsWith('/repos/paulaosoriof86/demoCXOrbia/'));const r=await fetch('https://api.github.com'+p);assert(r.ok,'GITHUB_HTTP_'+r.status);return r.json()};
const paths=execFileSync('git',['ls-tree','--name-only','-r','HEAD'],{encoding:'utf8',maxBuffer:16*1024*1024}).trim().split('\\n');
const pending=await pendingRuns({api,currentRunId:null,currentRunAttempt:1,descriptor:read(process.env.CANDIDATE_DESCRIPTOR),knownPaths:new Set(paths),readJournal:async p=>read(p)});
assert.equal(pending.length,0);assert.equal(pendingExternalTypedResults(read('CXORBIA_RECOVERY_EXECUTION_CURRENT.json').currentResultIncorporationQueue).length,0);
"""
    subprocess.run(["node", "--input-type=module", "-e", script], check=True)


def observe_published_pair(stage, image, out):
    """Re-read the already published pair before verification, without changing traffic or Hosting."""
    import hashlib
    from urllib.request import Request, urlopen
    orig = stage["native"]
    identity = stage["identity"]
    failure = describe(orig["id"])
    require(failure["status"] == "FAILURE" and failure["projectId"] == project
            and failure["serviceAccount"] == orig["serviceAccount"]
            and failure["substitutions"]["_CXORBIA_CONTROL_SHA"] == orig["controlSha"]
            and len(failure["steps"]) == 1 and failure["steps"][0]["id"] == job_name
            and failure["steps"][0]["status"] == "FAILURE", "SOURCE_FAILURE:PRIOR_NATIVE_EXECUTION")
    for name in ("start","runtime","hosting"):
        pin = stage["checkpoints"][name]
        expected_uri = "gs://"+project+"_cloudbuild/cxorbia-i3-paired-dev/results/"+orig["id"]+"/"+name+".json"
        require(pin["uri"] == expected_uri and re.fullmatch(r"[1-9][0-9]+",str(pin["generation"])), "SOURCE_FAILURE:STAGE_URI")
        raw = subprocess.check_output(["gcloud","storage","cat",expected_uri+"#"+str(pin["generation"])])
        require(hashlib.sha256(raw).hexdigest() == pin["sha256"] and json.loads(raw) == pin["body"], "SOURCE_FAILURE:PRIOR_NATIVE_STAGE_BYTES")
    service = json.loads(output("gcloud","run","services","describe","cxorbia-live-hr-dev","--region=us-central1","--project="+project,"--format=json"))
    traffic = [row for row in service["status"]["traffic"] if row.get("percent",0)>0]
    rev = identity["runtimeRevision"]
    require(service["status"]["latestReadyRevisionName"] == rev and sum(v["percent"] for v in traffic)==100
            and all(v.get("revisionName") == rev for v in traffic), "RELEASE_COMPOSITION_FAILURE:RESUME_RUNTIME_TRAFFIC")
    revision = json.loads(output("gcloud","run","revisions","describe",rev,"--region=us-central1","--project="+project,"--format=json"))
    env = {v["name"]:v.get("value") for v in revision["spec"]["containers"][0]["env"]}
    require(env["CXORBIA_RECOVERY_SOURCE_SHA"] == identity["sourceSha"] and revision["status"]["imageDigest"].split("sha256:")[-1] == image["digest"].split("sha256:")[-1]
            and image["digest"] == identity["runtimeDigest"], "RELEASE_COMPOSITION_FAILURE:RESUME_RUNTIME_DIGEST")
    token = output("gcloud","auth","print-access-token")
    def get(url):
        with urlopen(Request(url,headers={"Authorization":"Bearer "+token}),timeout=45) as r:
            return json.load(r)
    hosting = get("https://firebasehosting.googleapis.com/v1beta1/sites/"+project+"/channels/live")
    require(hosting["release"]["name"]==identity["hostingRelease"] and hosting["release"]["version"]["name"]==identity["hostingVersion"], "RELEASE_COMPOSITION_FAILURE:RESUME_HOSTING_DRIFT")
    require(get("https://firebasehosting.googleapis.com/v1beta1/"+identity["hostingVersion"])["status"]=="FINALIZED","RELEASE_COMPOSITION_FAILURE:RESUME_HOSTING_UNFINALIZED")
    write(out/"runtime.json",service)
    write(out/"runtime-revision.json",revision)
    write(out/"hosting-before.json",hosting)
    write(out/"rules-before.json",get("https://firebaserules.googleapis.com/v1/projects/"+project+"/releases/cloud.firestore"))
    subprocess.run(["curl","-fsSL","-H","Cache-Control: no-cache","https://tya-plataforma.web.app/","-o",str(out/"production-before.html")],check=True)
    subprocess.run(["curl","-fsS",service["status"]["url"]+"/health","-o",str(out/"health.json")],check=True)
    health=read(out/"health.json")
    require(health.get("ok") is True and health.get("production") is False and health.get("hrWrites") is False, "PROVIDER_FAILURE:RESUME_HEALTH")
    os.environ.update({"DEV_REVISION":rev,"RUNTIME_DIGEST":image["digest"],"PAIR_ENV_ONLY":"true"})
    return {"mode":"EXISTING_NATIVE_STAGES_READBACK_ONLY","publicationRunId":orig["id"],"previousNativeStatus":orig["status"],
            "sourceSha":identity["sourceSha"],"sourceTree":identity["sourceTree"],"runtimeRevision":rev,
            "runtimeDigest":identity["runtimeDigest"],"hostingVersion":identity["hostingVersion"],"hostingRelease":identity["hostingRelease"],
            "builds":0,"runtimeDeploys":0,"hostingDeploys":0,"trafficChanges":0}


def restore_e10_pair(prior, image, build_id, checkpoint):
    from urllib.parse import urlencode
    from urllib.request import Request, urlopen

    service = "cxorbia-live-hr-dev"
    region = "--region=us-central1"
    scope = "--project=" + project
    channel = "https://firebasehosting.googleapis.com/v1beta1/sites/" + project + "/channels/live"
    token = output("gcloud","auth","print-access-token")
    def hosting(url, body=None):
        data = None if body is None else json.dumps(body).encode()
        req = Request(url, data=data, headers={"Authorization":"Bearer "+token,"Content-Type":"application/json"})
        with urlopen(req, timeout=45) as response:
            return json.load(response)
    def traffic():
        return json.loads(output("gcloud","run","services","describe",service,region,scope,"--format=json"))["status"]["traffic"]
    def revision(name):
        return json.loads(output("gcloud","run","revisions","describe",name,region,scope,"--format=json"))
    def identity(item):
        values = {v["name"]:v.get("value") for v in item["spec"]["containers"][0]["env"]}
        return values.get("CXORBIA_RECOVERY_SOURCE_SHA"), item["status"]["imageDigest"].split("@")[-1]

    require(prior["runtimeRevision"]=="cxorbia-live-hr-dev-00395-lnc" and
            prior["hostingVersion"]=="sites/cxorbia-backend-dev/versions/e9a216661b686246" and
            identity(revision(prior["runtimeRevision"]))==(prior["sourceSha"],prior["runtimeDigest"]),
            "RELEASE_COMPOSITION_FAILURE:E10_ROLLBACK_TARGET")
    release = hosting(channel)["release"]
    if release["version"]["name"] != prior["hostingVersion"]:
        require(release.get("message")=="CXORBIA_E10_"+build_id, "RELEASE_COMPOSITION_FAILURE:FOREIGN_HOSTING")
        hosting(channel+"/releases?"+urlencode({"versionName":prior["hostingVersion"]}),
                {"message":"CXORBIA_E10_ROLLBACK_"+build_id})
    require(hosting(channel)["release"]["version"]["name"]==prior["hostingVersion"],"E10_HOSTING_ROLLBACK_READBACK")
    rows = [row for row in traffic() if row.get("percent",0)>0]
    require(len(rows)==1 and rows[0].get("percent")==100, "RELEASE_COMPOSITION_FAILURE:E10_FOREIGN_TRAFFIC")
    name = rows[0]["revisionName"]
    if name != prior["runtimeRevision"]:
        current = revision(name)
        require(identity(current)==(image["productSource"],image["digest"]) and
                any(v.get("name")=="CXORBIA_E10_PAIRED_RUN" and v.get("value")==build_id
                    for v in current["spec"]["containers"][0]["env"]), "RELEASE_COMPOSITION_FAILURE:FOREIGN_RUNTIME")
        output("gcloud","run","services","update-traffic",service,region,scope,
               "--to-revisions="+prior["runtimeRevision"]+"=100","--quiet")
    require(any(row.get("revisionName")==prior["runtimeRevision"] and row.get("percent")==100 for row in traffic()),
            "E10_RUNTIME_ROLLBACK_READBACK")
    checkpoint("e10-pair-restored",{"hostingVersion":prior["hostingVersion"],"runtimeRevision":prior["runtimeRevision"],
                                    "runtimeDigest":prior["runtimeDigest"]})


def main():
    require(not os.environ.get("GITHUB_ACTIONS") and not os.environ.get("GITHUB_RUN_ID"), "AMBIGUOUS_EXECUTOR")
    head = output("git", "rev-parse", "HEAD")
    d = read(descriptor_path)
    q = d["pendingDevSuccessor"]
    config = q["pairedCloudBuild"]
    partial = q.get("publicationReadback")
    if partial:
        require(partial.get("verifiedMappingReadback"),"MAPPING_FAILURE:EXACT_ORIGINAL_HEADER_READBACK_PENDING")
    source, tree = d["productSourceSha"], d["productTreeAuthority"]
    require(q["sourceSha"] == source and q["sourceTree"] == tree and q["production"] is False
            and not q["devPublished"] and q["scope"] == "RUNTIME_AND_HOSTING"
            and d["status"] == "HOLD_I3_GTHN_PENDING_DEV" and q.get("hrPeriodWindowRequired") is not True,
            "SOURCE_FAILURE:GOOGLE_PAIRED_SCOPE")
    build_id = os.environ["CXORBIA_PAIRED_BUILD_ID"]
    native = describe(build_id)
    require(native["status"] == "WORKING" and native["projectId"] == project
            and native["serviceAccount"] == config["serviceAccount"] and native["substitutions"]["_CXORBIA_CONTROL_SHA"] == head
            and native["substitutions"]["_CXORBIA_REQUEST_BLOB"] == output("git","rev-parse","HEAD:"+descriptor_path)
            and native["substitutions"]["_CXORBIA_PREDECESSOR_BLOB"] == d["postDeployRunSeal"]["receiptBlob"]
            and native["substitutions"]["_CXORBIA_SOURCE_SHA"] == source and native["substitutions"]["_CXORBIA_SOURCE_TREE"] == tree,
            "SOURCE_FAILURE:NATIVE_WORKER_BINDING")
    workflow = yaml.safe_load(Path(workflow_path).read_text())
    job = workflow["jobs"][job_name]
    steps = job["steps"]
    environment = os.environ
    work = str(Path.cwd())
    temp = tempfile.mkdtemp(prefix="cxorbia-i3-pair-")
    env_file = Path(temp) / "job-env"
    env_file.touch()
    environment.update({k:str(v) for k,v in workflow["env"].items()})
    environment.update({"FOCAL_SOURCE":source,"FOCAL_TREE":tree,"ACTIVE_STATUS":d["status"],
                        "PAIR_ENV_ONLY":"false","FOCAL_OUT":job["env"]["FOCAL_OUT"],"RUNNER_TEMP":temp,
                        "GITHUB_ENV":str(env_file),"GITHUB_WORKSPACE":work,
                        "GITHUB_REPOSITORY":"paulaosoriof86/demoCXOrbia"})
    out = Path(environment["FOCAL_OUT"])
    out.mkdir(parents=True, exist_ok=True)
    def run_step(index):
        script = steps[index]["run"]
        if index == 13:
            require(script.count("$GITHUB_RUN_ID") == 1,"SOURCE_FAILURE:CACHE_BUSTER")
            script = script.replace("$GITHUB_RUN_ID","$CXORBIA_PAIRED_BUILD_ID")
        subprocess.run(["bash","-c",script],check=True)
        for line in env_file.read_text().splitlines():
            k,v = line.split("=",1)
            require(k in {"PAIR_ASSET_FILES","SOURCE_DIR","DEV_REVISION","RUNTIME_DIGEST",
                          "HOSTING_RELEASE_NAME","HOSTING_VERSION_NAME","HR_REVISION"},"UNKNOWN_JOB_OUTPUT")
            environment[k] = v
    preflight(head)
    # C3 proves both the historical source tree and ancestry of its audit control.
    # A depth-one download supplies the object but cannot alone establish ancestry.
    c3=d["currentC3PreterminalAudit"]
    pins=[c3["sourceSha"],c3["controlHeadAtAudit"]]
    for pin in pins:
        require(re.fullmatch(r"[a-f0-9]{40}",pin),"SOURCE_FAILURE:C3_AUTHORITY_SHA")
        if subprocess.run(["git","cat-file","-e",pin+"^{commit}"],stderr=subprocess.DEVNULL).returncode:
            subprocess.run(["git","fetch","--no-tags","--depth=1","-q","origin",pin],check=True)
    if subprocess.run(["git","merge-base","--is-ancestor",pins[1],head],stderr=subprocess.DEVNULL).returncode:
        import datetime
        earliest=min(int(output("git","show","-s","--format=%ct",pin)) for pin in pins)-86400
        since=datetime.datetime.fromtimestamp(earliest,datetime.timezone.utc).isoformat()
        subprocess.run(["git","fetch","--no-tags","--shallow-since="+since,"-q","origin",head],check=True)
    subprocess.run(["git","merge-base","--is-ancestor",pins[1],head],check=True)
    subprocess.run(["node","tools/qa/cxorbia-i3-canonical-candidate-authority-guard.mjs"],check=True)
    image = verified_image(describe(config["imageBuild"]["id"]),config,source,tree)
    def checkpoint(stage, details):
        record={"stage":stage,"executionProvider":"GOOGLE_CLOUD_BUILD","executionId":build_id,
                "sourceSha":source,"sourceTree":tree,"imageBuildId":image["id"],"digest":image["digest"],**details}
        file=out/(stage+".json")
        write(file,record)
        uri="gs://cxorbia-backend-dev_cloudbuild/cxorbia-i3-paired-dev/results/"+build_id+"/"+file.name
        subprocess.run(["gcloud","storage","cp","--if-generation-match=0",str(file),uri],check=True)
    checkpoint("start",{"predecessorReceipt":d["postDeployRunSeal"]["receiptBlob"]})
    # A partial publication binds an existing native pair. Verify its stages and never re-enter its mutation steps.
    resume = None
    if partial:
        repair = partial.get("verifiedMappingReadback")
        require(repair and re.fullmatch(r"docs/checkpoints/[A-Z0-9_]+[.]json", repair["path"])
                and output("git","rev-parse","HEAD:"+repair["path"])==repair["gitBlob"],
                "MAPPING_FAILURE:EXACT_ORIGINAL_HEADER_READBACK_PENDING")
        from datetime import datetime as NativeTime
        header = read(repair["path"])
        fail_pin = partial["failureReceipt"]
        require(output("git","rev-parse","HEAD:"+fail_pin["path"])==fail_pin["gitBlob"],"SOURCE_FAILURE:RESUME_FAILURE_RECEIPT")
        failure = read(fail_pin["path"])
        target = failure["affected"]
        require(header.get("pairedExecution")==partial.get("failedBuildId") and
                header.get("sourceSha")==source and
                all(header.get(k)==target[k] for k in ["tenantId","projectId","countryCode","periodId","cell"]) and
                header.get("value")==target["expected"] and header.get("bindingFingerprint")==target["bindingFingerprint"] and
                header.get("independentReadback") is True and header.get("production") is False and
                header.get("verifiedBy") and header.get("evidenceReference") and header.get("observedAt") and
                NativeTime.fromisoformat(header["observedAt"].replace("Z","+00:00")) >
                NativeTime.fromisoformat(failure["observedAt"].replace("Z","+00:00")), "MAPPING_FAILURE:ORIGINAL_HEADER_READBACK_SCOPE")
        ref = partial["stageReceipt"]
        require(output("git","rev-parse","HEAD:"+ref["path"])==ref["gitBlob"],"SOURCE_FAILURE:RESUME_RECEIPT")
        stage = read(ref["path"])
        require(stage["identity"]["sourceSha"]==source and stage["identity"]["sourceTree"]==tree
                and stage["native"]["id"]!=build_id and stage["identity"]["runtimeDigest"]==image["digest"],
                "SOURCE_FAILURE:RESUME_SOURCE")
        resume = observe_published_pair(stage,image,out)
        resume["stageReceipt"] = ref
        resume["failureReceipt"] = partial["failureReceipt"]
        resume["verifiedMappingReadback"] = repair
    for index in ((3,4,8) if resume else (3,4,7,8,9)):
        run_step(index)
    require("modules/cliente-extra.js" in environment["PAIR_ASSET_FILES"].split(),"PDF_OWNER_NOT_IN_SERVED_INVENTORY")
    source_dir = Path(environment["SOURCE_DIR"])
    require((source_dir/"backend/runtime/hr-live-service/cloudbuild.yaml").read_bytes() ==
            Path("/workspace/backend/runtime/hr-live-service/cloudbuild.yaml").read_bytes(),"NATIVE_IMAGE_SOURCE_CHANGED")
    sites=json.loads(output(str(Path(work)/"node_modules/.bin/firebase"), "hosting:sites:list",
                            "--project",project,"--json","--non-interactive"))
    require(sites.get("status")=="success" and "sites/"+project in json.dumps(sites.get("result")),"HOSTING_TARGET_UNAVAILABLE")
    preflight(head)
    digest_uri = "gcr.io/"+project+"/cxorbia-live-hr-dev@"+image["digest"]
    (out/"image-uri.txt").write_text(digest_uri+"\n")
    write(out/"build.json",{"sourceSha":source,"sourceTree":tree,"imageTag":digest_uri,
                           "requestedTag":image["tag"],"builds":0 if resume else 1,"production":False,"imageBuildId":image["id"]})
    write(out/"build-resume.json",image)
    focal_rules = source == "7f78a8fac2ea366860cf41211f8ebc894f7837e6"
    def rules(action):
        subprocess.run(["node","tools/release/cxorbia-corte6-firestore-rules-deploy.mjs","--i3-paired",action],check=True)
    runtime_exposure_possible = bool(resume)
    try:
        if focal_rules:
            subprocess.run(["node","tools/qa/cxorbia-i3-paired-hr-identity.mjs","--preflight",build_id],
                           env={**os.environ,"HOSTING_URL":"https://cxorbia-backend-dev.web.app",
                                "CXORBIA_PAIRED_BUILD_ID":build_id},check=True,stdout=subprocess.DEVNULL)
            rules("apply")
        if not resume:
            if focal_rules:
                checkpoint("runtime-transition-intent", {"imageDigest": image["digest"]})
                runtime_exposure_possible = True
            run_step(12)
        require(environment["RUNTIME_DIGEST"] == image["digest"],"RELEASE_COMPOSITION_FAILURE:RUNTIME_BUILD_MISMATCH")
        if not resume:
            checkpoint("runtime",{"revision":environment["DEV_REVISION"],"trafficPercent":100})
        run_step(13)
        if resume:
            require(environment["HOSTING_VERSION_NAME"]==resume["hostingVersion"] and environment["HOSTING_RELEASE_NAME"]==resume["hostingRelease"],
                    "RELEASE_COMPOSITION_FAILURE:RESUME_ASSET_INVENTORY_DRIFT")
        else:
            checkpoint("hosting",{"version":environment["HOSTING_VERSION_NAME"],"release":environment["HOSTING_RELEASE_NAME"]})
        try:
            run_step(14)
        except subprocess.CalledProcessError:
            failure = out / "strict-hr-failure.json"
            if failure.is_file():
                evidence = read(failure)
                require(evidence["runId"] == build_id, "SOURCE_FAILURE:STRICT_HR_FAILURE_ID")
                checkpoint("strict-hr-probe-failure", {"probeEvidence": evidence})
                uri = "gs://cxorbia-backend-dev_cloudbuild/cxorbia-i3-paired-dev/results/" + build_id + "/strict-hr-probe-failure.json"
                require(json.loads(output("gcloud", "storage", "cat", uri)) == read(out / "strict-hr-probe-failure.json"),
                        "PERSISTENCE_FAILURE:STRICT_HR_FAILURE_READBACK")
            raise
        run_step(15)
        identity={"executionProvider":"GOOGLE_CLOUD_BUILD","runId":build_id,"runAttempt":1}
        result=read(out/"result.json")
        result.update(identity)
        if resume:
            result.update({"builds":0,"hostingDeploys":0,"runtimeDeploys":0,"publishedStageRecovery":resume})
        write(out/"result.json",result)
        run_step(16)
        hr=read(out/"hr-after/result.json")
        require(all(hr.get(k)==v for k,v in identity.items()),"SOURCE_FAILURE:GOOGLE_HR_IDENTITY")
        files=["result.json","hr-after/result.json","build-resume.json"]
        if (out/"mailbox-environment-readback.json").is_file():
            files.append("mailbox-environment-readback.json")
        if focal_rules:
            files.extend(["e10-rules-readback.json","e08-key-binding.json"])
        with zipfile.ZipFile("/workspace/paired-evidence.zip","w",zipfile.ZIP_DEFLATED) as archive:
            for name in files:
                archive.write(out/name,name)
        print("CXORBIA_PAIRED_DEV_VERIFIED",build_id,source,image["digest"],flush=True)
    except Exception:
        # Never restore weaker predecessor rules while successor UIs or traffic remain active.
        if focal_rules and (out/"e10-rules-created.json").is_file():
            restore_e10_pair(d["currentMaterialization"], image, build_id, checkpoint)
            if runtime_exposure_possible:
                checkpoint("e10-rules-retained", {"reason":"POSSIBLE_E10_RUNTIME_EXPOSURE",
                    "targetRulesRetained":True,"predecessorPairRestored":True})
            else:
                rules("rollback")
        raise



if __name__ == "__main__":
    main()
