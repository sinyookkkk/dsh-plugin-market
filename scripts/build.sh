#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HARNESS_DIR="${DSH_HARNESS_DIR:-$ROOT/.dsh-harness}"
TITLE="${DSH_MARKET_TITLE:-DSH Plugin Market}"
DESCRIPTION="${DSH_MARKET_DESCRIPTION:-Community DSH plugin index}"
INPUT="$ROOT/plugins.txt"
OUTPUT="$ROOT/public/index.json"
CACHE="$ROOT/.plugin-market-cache"

if [[ ! -f "$INPUT" ]]; then
  echo "missing source list: $INPUT" >&2
  exit 2
fi

if [[ ! -d "$HARNESS_DIR" ]]; then
  echo "cloning deepseek-harness into $HARNESS_DIR"
  git clone --depth 1 https://github.com/deepseek-ai/deepseek-harness.git "$HARNESS_DIR"
elif [[ "${UPDATE_DSH:-0}" == "1" ]]; then
  echo "updating $HARNESS_DIR"
  git -C "$HARNESS_DIR" pull --ff-only
fi

if [[ ! -d "$HARNESS_DIR/node_modules" ]]; then
  echo "installing dsh workspace dependencies"
  (cd "$HARNESS_DIR" && pnpm install --frozen-lockfile)
fi

mkdir -p "$(dirname "$OUTPUT")"

pnpm --dir "$HARNESS_DIR" --filter @deepseek-ai/dsh-plugin-market-generator start \
  --input "$INPUT" \
  --output "$OUTPUT" \
  --cache "$CACHE" \
  --title "$TITLE" \
  --description "$DESCRIPTION" \
  --inline-icon-bytes 32768
