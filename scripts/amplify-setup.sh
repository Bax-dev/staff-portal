#!/usr/bin/env bash
# Update Amplify build spec and branch env vars for staff-portal.
# App ID defaults to the provisioned app in us-east-1.
set -euo pipefail

APP_ID="${APP_ID:-dxv78sz375u86}"
API_URL_STAGING="${API_URL_STAGING:-}"
API_URL_PRODUCTION="${API_URL_PRODUCTION:-}"

cd "$(dirname "$0")/.."

aws amplify update-app \
  --app-id "$APP_ID" \
  --build-spec file://amplify.yml

aws amplify create-branch \
  --app-id "$APP_ID" \
  --branch-name staging \
  --stage DEVELOPMENT \
  --framework "Next.js - SSR" \
  --enable-auto-build \
  --environment-variables API_URL="$API_URL_STAGING",NEXT_PUBLIC_API_URL="$API_URL_STAGING" \
  || aws amplify update-branch \
       --app-id "$APP_ID" \
       --branch-name staging \
       --enable-auto-build \
       --environment-variables API_URL="$API_URL_STAGING",NEXT_PUBLIC_API_URL="$API_URL_STAGING"

aws amplify create-branch \
  --app-id "$APP_ID" \
  --branch-name production \
  --stage PRODUCTION \
  --framework "Next.js - SSR" \
  --enable-auto-build \
  --environment-variables API_URL="$API_URL_PRODUCTION",NEXT_PUBLIC_API_URL="$API_URL_PRODUCTION" \
  || aws amplify update-branch \
       --app-id "$APP_ID" \
       --branch-name production \
       --enable-auto-build \
       --environment-variables API_URL="$API_URL_PRODUCTION",NEXT_PUBLIC_API_URL="$API_URL_PRODUCTION"

echo "Done. Push to 'staging' or 'production' to trigger a build."
