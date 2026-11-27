"""Run the commercial last-confirmed badge against the product markup in Chromium."""
import argparse
import json
import re
import subprocess
import tempfile
from html import unescape
from pathlib import Path

arg = argparse.ArgumentParser()
arg.add_argument("source", type=Path)
arg.add_argument("browser", type=Path)
args = arg.parse_args()
app = args.source / "app"
entry = (app / "index-backend-dev.html").read_text()
top = entry.index('<div class="topbar">')
depth = 0
for tag in re.finditer(r"<(/?)div(?:\s[^>]*|)>", entry[top:]):
    depth += -1 if tag[1] else 1
    if depth == 0:
        break
topbar = entry[top:top + tag.end()]
css = "\n".join((app / "styles" / sheet).read_text() for sheet in ("theme.css", "layout.css"))
owner = (app / "core/data-source.js").read_text()
proof = """
const verified = [];
const check = (ok, label) => { if (!ok) throw Error(label); verified.push(label); };
const el = document.getElementById('tbDataBadge');
const visible = () => getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0;
for (const role of ['admin','shopper','cliente']) {
  const ctx = {role, tenantId:'tenant', authenticated:true};
  const authority = {applied:true, atomicPublication:true, actorUid:'fixture', role,
                     tenantId:'tenant', projectId:'project', sourceRevision:'revision'};
  CX.backendAuth = {context:()=>ctx};
  CX.session = {hasTechAccess:()=>false};
  window.firebase = {auth:()=>({currentUser:{uid:'fixture'}})};
  window.CX_PROTECTED_AUTH_HR_AUTHORITY = authority;
  CX.data = {currentProjectId:'project', previewMeta:{sourceRevision:'revision'}};
  const ds = CX.dataSource;
  ds.mode = 'connected';
  ds.hrFreshness = {externalReadCurrent:false, sourceReadAt:'2026-11-26T18:25:20.769Z'};
  ds.renderTopbarBadge();
  const label = ds.badge().t;
  check(visible() && el.innerText.trim() === label && label.includes('2026') &&
        !CX.session.hasTechAccess(), role+' dated badge');
  for (const [object, field, value] of [
    [ctx,'authenticated',false],[authority,'actorUid','other'],[authority,'role','other'],
    [authority,'tenantId','other'],[authority,'projectId','other'],[authority,'atomicPublication',false],
    [CX.data.previewMeta,'sourceRevision','other'],[CX.data.previewMeta,'internalProjectAuthority',true],
    [ds.hrFreshness,'externalReadCurrent',true],[ds.hrFreshness,'sourceReadAt','invalid']
  ]) {
    const saved = object[field];
    object[field] = value;
    ds.renderTopbarBadge();
    check(!visible() && el.textContent === '',role+' hidden '+field);
    object[field] = saved;
    ds.renderTopbarBadge();
    check(visible() && el.innerText.trim() === label,role+' restored '+field);
  }
}
document.getElementById('proof').textContent = JSON.stringify(verified);
"""
with tempfile.TemporaryDirectory() as directory:
    root = Path(directory)
    page = root / "test.html"
    page.write_text('<!doctype html><meta charset="utf-8"><style>'+css+'</style>'+topbar+
                    '<pre id="proof"></pre><script>'+owner+'</script><script>'+proof+'</script>')
    result = subprocess.run([str(args.browser), "--headless", "--no-sandbox", "--disable-gpu",
                             "--disable-dev-shm-usage", "--disable-background-networking",
                             "--user-data-dir="+str(root/"profile"), "--dump-dom", page.as_uri()],
                            check=True, capture_output=True, text=True, timeout=45)
    match = re.search(r'<pre id="proof">(.*?)</pre>', result.stdout, re.S)
    checks = json.loads(unescape(match[1])) if match and match[1] else []
    if len(checks) != 63 or len(set(checks)) != 63:
        raise SystemExit("VISUAL_DEFECT: incomplete badge lifecycle proof")
    print(json.dumps({"cases":len(checks),"failures":0,"served":False,"roles":["admin","shopper","cliente"]}))
