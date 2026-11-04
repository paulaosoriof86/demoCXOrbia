import { execFileSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// A revision is not released unless it is ready and serves every DEV request.
export function inspectServingDevRevision(service) {
  const status = service?.status ?? {};
  const created = String(status.latestCreatedRevisionName ?? '');
  const ready = String(status.latestReadyRevisionName ?? '');
  const traffic = Array.isArray(status.traffic) ? status.traffic : [];
  const matching = traffic.filter((entry) => entry?.revisionName === created);
  const percentage = matching.reduce((sum, entry) => sum + Number(entry?.percent ?? 0), 0);
  return {
    ok: Boolean(created) && created === ready && matching.length === 1 && percentage === 100,
    created,
    ready,
    percentage,
  };
}

function sha256(value) {
  return String(value ?? '').match(/sha256:[a-f0-9]{64}/i)?.[0]?.toLowerCase() ?? '';
}

export function assertExactServingDigest(revision, expectedDigest) {
  const servingDigest = sha256(revision?.status?.imageDigest);
  const builtDigest = sha256(expectedDigest);
  if (!servingDigest || !builtDigest || servingDigest !== builtDigest) {
    throw new Error('DEV serving revision digest differs from the immutable image digest built by this run');
  }
}

function gcloud(args) {
  return execFileSync('gcloud', args, {
    encoding: 'utf8',
    timeout: 45000,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

async function main(argv) {
  const [service, project, region, image] = argv;
  if (![service, project, region, image].every(Boolean)) {
    throw new Error('Expected service, project, region, exact image tag');
  }
  // Cloud Run may reuse a revision when a new tag resolves to identical bytes.
  const builtDigest = gcloud(['container', 'images', 'describe', image,
    '--format=value(image_summary.digest)']).trim();
  if (!sha256(builtDigest)) throw new Error('Expected image tag has no resolved immutable SHA-256');
  gcloud(['run', 'services', 'update-traffic', service,
    '--project', project, '--region', region, '--to-latest', '--quiet']);

  let observed;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    const state = JSON.parse(gcloud(['run', 'services', 'describe', service,
      '--project', project, '--region', region, '--format=json']));
    observed = inspectServingDevRevision(state);
    if (observed.ok) {
      const revision = JSON.parse(gcloud(['run', 'revisions', 'describe', observed.created,
        '--project', project, '--region', region, '--format=json']));
      assertExactServingDigest(revision, builtDigest);
      process.stdout.write(observed.created + '\n');
      return;
    }
    if (attempt < 30) await delay(4000);
  }
  throw new Error('DEV routing not verified: latest created/ready revision lacks 100% serving traffic; ' +
    JSON.stringify(observed));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(String(error?.message ?? error) + '\n');
    process.exitCode = 1;
  });
}
