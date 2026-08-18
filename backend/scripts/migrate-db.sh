#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "backend/.env not found" >&2
  exit 1
fi

npx prisma migrate deploy
npx prisma generate
