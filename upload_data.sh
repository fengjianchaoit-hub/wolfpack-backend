#!/bin/bash
TOKEN="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"
REPO="fengjianchaoit-hub/wolfpack-dashboard"

# 上传 status.json
FILE="data/status.json"
SHA=$(curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/$REPO/contents/$FILE" 2>/dev/null | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sha',''))" 2>/dev/null)

CONTENT=$(python3 -c "import base64; print(base64.b64encode(open('/root/.openclaw/workspace/wolfpack_dashboard/$FILE', 'rb').read()).decode())")

echo "Uploading $FILE..."
curl -s -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO/contents/$FILE" \
  -d "{\"message\":\"Add status data\",\"content\":\"$CONTENT\",\"sha\":\"$SHA\"}" 2>/dev/null | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if 'content' in d else d.get('message','error'))"

echo "Done"