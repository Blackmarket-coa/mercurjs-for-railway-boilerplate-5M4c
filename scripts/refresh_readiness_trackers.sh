#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TODAY="$(date +%Y-%m-%d)"
NOTE="${1:-automated refresh}"

COMPLETION_TRACKER="$ROOT_DIR/docs/COMPLETION_TRACKER.md"
QA_TRACKER="$ROOT_DIR/docs/QA_WORK_TRACKER.md"

if [[ ! -f "$COMPLETION_TRACKER" || ! -f "$QA_TRACKER" ]]; then
  echo "Required tracker files not found under $ROOT_DIR/docs" >&2
  exit 1
fi

# Keep completion tracker date simple and deterministic.
sed -i -E "s/^_Last updated: [0-9]{4}-[0-9]{2}-[0-9]{2}_$/_Last updated: ${TODAY}_/" "$COMPLETION_TRACKER"

# Preserve QA tracker suffix semantics while refreshing the date.
sed -i -E "s/^_Last updated: [0-9]{4}-[0-9]{2}-[0-9]{2}( \([^)]*\))?_/\_Last updated: ${TODAY}\1_/" "$QA_TRACKER"

python - <<PY
from pathlib import Path
qa_path = Path(r"$QA_TRACKER")
text = qa_path.read_text()
entry = """- $TODAY
  - Change: Readiness tracker metadata refreshed.
  - Evidence:
    - scripts/refresh_readiness_trackers.sh
    - Note: $NOTE
  - Result: ✅.
"""
if entry not in text:
    qa_path.write_text(text.rstrip() + "\n\n" + entry)
PY

echo "Refreshed readiness trackers for $TODAY"
