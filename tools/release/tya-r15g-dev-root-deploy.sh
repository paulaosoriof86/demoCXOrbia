#!/usr/bin/env bash
set -euo pipefail

echo "BLOCKED_RC15_M3_HISTORICAL_SOURCE_REBUILD_HOSTING_DEPLOY_INERT: RC15-CP-131 tools/release/tya-r15g-dev-root-deploy.sh" >&2
echo "Historical implementation is preserved in Git history. Manual confirmation and historical request cannot authorize deployment." >&2
exit 2
