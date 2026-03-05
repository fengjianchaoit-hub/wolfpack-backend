#!/bin/bash
TOKEN="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"
REPO="fengjianchaoit-hub/wolfpack-dashboard"
FILE="index.html"

SHA=$(curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/$REPO/contents/$FILE" | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])" 2>/dev/null)

CONTENT=$(python3 -c "import base64; print(base64.b64encode(open('/root/.openclaw/workspace/wolfpack_dashboard/index.html', 'rb').read()).decode())")

curl -s -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$REPO/contents/$FILE" \
  -d "{\"message\":\"Use static JSON for stable loading\",\"content\":\"$CONTENT\",\"sha\":\"$SHA\"}"