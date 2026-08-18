#!/usr/bin/env bash
# One-time provisioning of the Amplify Hosting app + branches for staff-portal.
#
# Prerequisite (console, one-time, can't be scripted headlessly): create the
# Amplify app and authorize the Amplify GitHub App against Bax-dev/staff-portal at
# https://console.aws.amazon.com/amplify -> New app -> Host web app -> GitHub.
# Copy the resulting App ID into APP_ID below (or export it) before running this.
set -euo pipefail

APP_ID="${APP_ID:?Set APP_ID to the Amplify app id, e.g. export APP_ID=d1a2b3c4d5}"
API_URL_STAGING="${API_URL_STAGING:?Set API_URL_STAGING, e.g. https://api-staging.example.com}"
API_URL_PRODUCTION="${API_URL_PRODUCTION:?Set API_URL_PRODUCTION, e.g. https://api.example.com}"

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
  --environment-variables NEXT_PUBLIC_API_URL="$API_URL_STAGING" \
  || aws amplify update-branch \
       --app-id "$APP_ID" \
       --branch-name staging \
       --enable-auto-build \
       --environment-variables NEXT_PUBLIC_API_URL="$API_URL_STAGING"

aws amplify create-branch \
  --app-id "$APP_ID" \
  --branch-name production \
  --stage PRODUCTION \
  --framework "Next.js - SSR" \
  --enable-auto-build \
  --environment-variables NEXT_PUBLIC_API_URL="$API_URL_PRODUCTION" \
  || aws amplify update-branch \
       --app-id "$APP_ID" \
       --branch-name production \
       --enable-auto-build \
       --environment-variables NEXT_PUBLIC_API_URL="$API_URL_PRODUCTION"

echo "Done. Push to 'staging' or 'production' to trigger a build."
