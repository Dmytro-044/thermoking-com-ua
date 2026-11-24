#!/usr/bin/env bash
# Збирає тестову версію сайту й викладає її як Cloudflare Worker.
# Потрібні: hugo, python3, curl, CLOUDFLARE_API_TOKEN (Workers Scripts: Edit), CLOUDFLARE_ACCOUNT_ID.
set -euo pipefail
NAME="${WORKER_NAME:-thermoking-com-ua-test}"
TMP="$(mktemp -d)"
HUGO_PARAMS_NOINDEX=true hugo --gc --minify --cleanDestinationDir
python3 scripts/build_worker.py public "$TMP/worker.js"
echo '{"main_module":"worker.js","compatibility_date":"2026-11-01"}' > "$TMP/metadata.json"
curl -sS --fail-with-body -X PUT \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${NAME}" \
  -F "metadata=@$TMP/metadata.json;type=application/json" \
  -F "worker.js=@$TMP/worker.js;type=application/javascript+module" > /dev/null
echo "Опубліковано: https://${NAME}.thermoking-com-ua.workers.dev"
