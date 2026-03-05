#!/bin/bash
TOKEN="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"
REPO="fengjianchaoit-hub/wolfpack-dashboard"
FILE="index.html"

# Get current file SHA
SHA=$(curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/$REPO/contents/$FILE" | \
  grep -o '"sha":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "Current SHA: $SHA"

# Read file content and encode
CONTENT=$(base64 -w 0 /root/.openclaw/workspace/wolfpack_dashboard/index.html)

# Update file
curl -s -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$REPO/contents/$FILE" \
  -d "{\"message\":\"Rename 法师 to 狼头\",\"content\":\"$CONTENT\",\"sha\":\"$SHA\"}"

echo "Done"