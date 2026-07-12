#!/usr/bin/env python3
from pathlib import Path
import re, subprocess, hashlib, base64, difflib, os, datetime

workflow = Path('.github/workflows/cxorbia-v110-selective-empalme.yml')
lines = workflow.read_text(encoding='utf-8').splitlines()
blocks = []
current_name = ''
i = 0
while i < len(lines):
    line = lines[i]
    m_name = re.match(r'^\s*- name:\s*(.+?)\s*$', line)
    if m_name:
        current_name = m_name.group(1)
    m_run = re.match(r'^(\s*)run:\s*\|\s*$', line)
    if not m_run:
        i += 1
        continue
    base = len(m_run.group(1))
    i += 1
    buf = []
    while i < len(lines):
        nxt = lines[i]
        if nxt.strip() == '':
            buf.append('')
            i += 1
            continue
        indent = len(nxt) - len(nxt.lstrip(' '))
        if indent <= base:
            break
        cut = min(len(nxt), base + 2)
        buf.append(nxt[cut:])
        i += 1
    blocks.append((current_name, '\n'.join(buf) + '\n'))

if not blocks:
    raise SystemExit('No se encontraron bloques run en el workflow selectivo')

intended_runtime_hash = 'd19e42df846d4b03f9407e856cc70e1dace6166ff3a46f17d93bda035566f0bd'
exact_parts = sorted(Path('tools/empalme/v110-selective/exact').glob('runtime-exact-*.b64'))
encoded = ''.join(p.read_text(encoding='utf-8') for p in exact_parts)
encoded = ''.join(encoded.split())
runtime_bytes = base64.b64decode(encoded, validate=True)
actual_runtime_hash = hashlib.sha256(runtime_bytes).hexdigest()
if actual_runtime_hash != intended_runtime_hash:
    raise SystemExit('Identidad del patch runtime V110 no coincide con la fuente auditada')
Path('/tmp/v110-runtime.patch').write_bytes(runtime_bytes)
trace = [f'run={os.getenv("GITHUB_RUN_ID","unknown")}', f'runtimeSha={actual_runtime_hash}', f'exactParts={len(exact_parts)}']

def norm(s):
    return re.sub(r'\s+', ' ', s.strip())

def parse_reject(path):
    raw = path.read_text(encoding='utf-8', errors='replace').splitlines()
    target = None
    hunks = []
    j = 0
    for line in raw:
        if line.startswith('+++ '):
            target = line[4:].strip().split('\t')[0]
    while j < len(raw):
        m = re.match(r'^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@', raw[j])
        if not m:
            j += 1
            continue
        old_start = int(m.group(1))
        body = []
        j += 1
        while j < len(raw) and not raw[j].startswith('@@ '):
            if raw[j].startswith('\\ No newline'):
                j += 1
                continue
            if raw[j][:1] in (' ', '+', '-'):
                body.append((raw[j][0], raw[j][1:]))
            j += 1
        hunks.append({
            'old_start': old_start,
            'old': [t for p, t in body if p in (' ', '-')],
            'new': [t for p, t in body if p in (' ', '+')],
        })
    return target, hunks

def best_span(cur, h):
    old_norm = [norm(x) for x in h['old']]
    expected = max(0, h['old_start'] - 1)
    anchors = []
    for oi, line in enumerate(old_norm):
        if len(line) < 12:
            continue
        for pos, c in enumerate(cur):
            if norm(c) == line:
                anchors.append((len(line), oi, pos))
    starts = {max(0, pos - oi) for _, oi, pos in sorted(anchors, reverse=True)[:60]}
    starts.update(range(max(0, expected - 240), min(len(cur), expected + 241)))
    best = (-1, None, None)
    base_len = max(1, len(h['old']))
    for s in starts:
        for ln in sorted(set(max(1, base_len + d) for d in range(-12, 81))):
            if s + ln > len(cur):
                continue
            cand = [norm(x) for x in cur[s:s + ln]]
            score = difflib.SequenceMatcher(None, old_norm, cand, autojunk=False).ratio()
            score += 0.03 * max(0, 1 - abs(s - expected) / 1000)
            if score > best[0]:
                best = (score, s, s + ln)
    return best

def resolve_rejects():
    reject_files = sorted(Path('.').rglob('*.rej'))
    trace.append(f'rejectFiles={len(reject_files)}')
    for rej in reject_files:
        target, hunks = parse_reject(rej)
        trace.append(f'{rej}: target={target} hunks={len(hunks)}')
        if not target or not Path(target).exists():
            raise RuntimeError('Reject sin destino válido: ' + str(rej))
        p = Path(target)
        cur = p.read_text(encoding='utf-8').splitlines()
        for idx, h in enumerate(hunks, 1):
            new_norm = [norm(x) for x in h['new'] if norm(x)]
            joined = '\n'.join(norm(x) for x in cur)
            needle = '\n'.join(new_norm)
            if needle and needle in joined:
                trace.append(f'{target} hunk {idx}: already-applied')
                continue
            score, s, e = best_span(cur, h)
            trace.append(f'{target} hunk {idx}: score={score:.4f} span={s}:{e}')
            if s is None or score < 0.25:
                raise RuntimeError(f'No se pudo ubicar {target} hunk {idx}; score={score:.3f}')
            cur[s:e] = h['new']
        p.write_text('\n'.join(cur) + '\n', encoding='utf-8')
    for q in list(Path('.').rglob('*.rej')) + list(Path('.').rglob('*.orig')):
        q.unlink(missing_ok=True)
    Path('tools/empalme/v110-selective/RESOLVER-TRACE.txt').write_text('\n'.join(trace) + '\n', encoding='utf-8')

def persist_failure(name, result, exc=None):
    if exc is not None:
        trace.append('EXCEPTION=' + repr(exc))
    stamp = datetime.datetime.utcnow().isoformat() + 'Z'
    trace_path = Path('tools/empalme/v110-selective/RESOLVER-TRACE.txt')
    trace_path.write_text('\n'.join(trace) + '\n', encoding='utf-8')
    diag = Path('tools/empalme/v110-selective/LAST-FAILURE.txt')
    diag.write_text(
        f'stamp={stamp}\nrun={os.getenv("GITHUB_RUN_ID","unknown")}\nblock={name}\n'
        f'returncode={getattr(result,"returncode",1)}\nruntimePatchSha256={actual_runtime_hash}\n\n'
        'TRACE\n' + '\n'.join(trace) + '\n\nSTDOUT\n' + getattr(result, 'stdout', '')[-30000:] +
        '\n\nSTDERR\n' + getattr(result, 'stderr', '')[-30000:] + '\n',
        encoding='utf-8'
    )
    subprocess.run(['git', 'config', 'user.name', 'github-actions[bot]'], check=True)
    subprocess.run(['git', 'config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], check=True)
    subprocess.run(['git', 'add', str(diag), str(trace_path)], check=True)
    subprocess.run(['git', 'commit', '-m', 'ci: record V110 resolver failure trace'], check=True)
    subprocess.run(['git', 'push', 'origin', 'HEAD:docs-tya-v6-v71-audit'], check=True)
    raise SystemExit(getattr(result, 'returncode', 1) or 1)

for name, script in blocks:
    script = script.replace(
        'cat tools/empalme/v110-selective/parts/runtime-part-*.patchpart > /tmp/v110-runtime.patch',
        'test -f /tmp/v110-runtime.patch'
    )
    script = script.replace('git apply --3way --check /tmp/v110-runtime.patch', 'true')
    script = script.replace('git apply --3way --check /tmp/v110-academia.patch', 'true')
    script = script.replace('git apply --3way /tmp/v110-runtime.patch', 'patch --batch --forward --fuzz=3 -p1 < /tmp/v110-runtime.patch || true')
    script = script.replace('git apply --3way /tmp/v110-academia.patch', 'patch --batch --forward --fuzz=3 -p1 < /tmp/v110-academia.patch || true')
    if name.startswith('Commit controlado'):
        subprocess.run(['git', 'rm', '-f', '.github/workflows/cxorbia-v105-v106-runtime-empalme.yml'], check=True)
    result = subprocess.run(['bash', '-lc', script], text=True, capture_output=True)
    print('BLOCK', name, 'RC', result.returncode)
    print(result.stdout)
    print(result.stderr)
    if result.returncode:
        persist_failure(name, result)
    if name.startswith('Empalmar runtime'):
        try:
            resolve_rejects()
        except Exception as exc:
            persist_failure('Resolver semántico de rejects', result, exc)
