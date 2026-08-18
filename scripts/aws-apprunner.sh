#!/usr/bin/env bash
# Create App Runner API services after the GitHub connection handshake is complete.
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/backend/.aws-provisioned"

CONN_STATUS="$(aws apprunner list-connections --query "ConnectionSummaryList[?ConnectionName=='github-baxdev'].Status | [0]" --output text)"
if [[ "$CONN_STATUS" != "AVAILABLE" ]]; then
  echo "GitHub connection status is $CONN_STATUS. Authorize it at:"
  echo "https://console.aws.amazon.com/apprunner/home?region=${REGION}#/connections"
  exit 1
fi

CONN_ARN="${CONN_ARN:-$(aws apprunner list-connections --query "ConnectionSummaryList[?ConnectionName=='github-baxdev'].ConnectionArn | [0]" --output text)}"
SUBNET_A="$(aws ec2 describe-subnets --filters Name=vpc-id,Values="$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text)" Name=availability-zone,Values="${REGION}a" --query 'Subnets[0].SubnetId' --output text)"
SUBNET_B="$(aws ec2 describe-subnets --filters Name=vpc-id,Values="$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text)" Name=availability-zone,Values="${REGION}b" --query 'Subnets[0].SubnetId' --output text)"

ensure_connector() {
  local name="$1" sg="$2"
  local arn
  arn="$(aws apprunner list-vpc-connectors --query "VpcConnectors[?VpcConnectorName=='$name'].VpcConnectorArn | [0]" --output text)"
  if [[ -z "$arn" || "$arn" == "None" ]]; then
    arn="$(aws apprunner create-vpc-connector --vpc-connector-name "$name" --subnets "$SUBNET_A" "$SUBNET_B" --security-groups "$sg" --query VpcConnector.VpcConnectorArn --output text)"
  fi
  echo "$arn"
}

STAGING_CONN="$(ensure_connector smp-staging "$STAGING_API_SG")"
PROD_CONN="$(ensure_connector smp-production "$PROD_API_SG")"

runtime_env() {
  python3 - <<'PY' "$1"
import pathlib, sys
env = {}
for line in pathlib.Path(sys.argv[1]).read_text().splitlines():
    if not line or line.startswith('#') or '=' not in line:
        continue
    key, value = line.split('=', 1)
    env[key] = value
print(','.join(f'{k}={v}' for k, v in env.items()))
PY
}

create_service() {
  local name="$1" branch="$2" env_file="$3" vpc_arn="$4"
  if aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='$name'].ServiceArn | [0]" --output text | grep -vq '^None$'; then
    echo "App Runner $name already exists"
    aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='$name'].[ServiceName,ServiceUrl,Status]" --output table
    return
  fi

  local runtime
  runtime="$(runtime_env "$env_file")"

  aws apprunner create-service --cli-input-json "$(python3 - <<PY
import json, pathlib
env = {}
for line in pathlib.Path("$env_file").read_text().splitlines():
    if not line or line.startswith("#") or "=" not in line:
        continue
    k, v = line.split("=", 1)
    env[k] = v
print(json.dumps({
  "ServiceName": "$name",
  "SourceConfiguration": {
    "AuthenticationConfiguration": {"ConnectionArn": "$CONN_ARN"},
    "AutoDeploymentsEnabled": True,
    "CodeRepository": {
      "RepositoryUrl": "https://github.com/Bax-dev/staff-portal",
      "SourceCodeVersion": {"Type": "BRANCH", "Value": "$branch"},
      "SourceDirectory": "backend",
      "CodeConfiguration": {
        "ConfigurationSource": "API",
        "CodeConfigurationValues": {
          "Runtime": "NODEJS_22",
          "BuildCommand": "npm ci && npx prisma generate && npm run build",
          "StartCommand": "node dist/src/index.js",
          "Port": "4000",
          "RuntimeEnvironmentVariables": env,
        }
      }
    }
  },
  "InstanceConfiguration": {
    "Cpu": "256",
    "Memory": "512",
    "InstanceRoleArn": "$INSTANCE_ROLE_ARN"
  },
  "NetworkConfiguration": {
    "EgressConfiguration": {
      "EgressType": "VPC",
      "VpcConnectorArn": "$vpc_arn"
    }
  }
})
PY
)"
}

create_service smp-api-staging staging "$ROOT/backend/.env.staging" "$STAGING_CONN"
create_service smp-api-production production "$ROOT/backend/.env.production" "$PROD_CONN"

echo "Waiting for App Runner services..."
sleep 5
aws apprunner list-services --query 'ServiceSummaryList[?starts_with(ServiceName, `smp-api`)].[ServiceName,Status,ServiceUrl]' --output table

STAGING_URL="$(aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='smp-api-staging'].ServiceUrl | [0]" --output text)"
PROD_URL="$(aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='smp-api-production'].ServiceUrl | [0]" --output text)"

if [[ -n "$STAGING_URL" && "$STAGING_URL" != "None" ]]; then
  aws amplify update-branch --app-id "$APP_ID" --branch-name staging --environment-variables "NEXT_PUBLIC_API_URL=https://${STAGING_URL}"
fi
if [[ -n "$PROD_URL" && "$PROD_URL" != "None" ]]; then
  aws amplify update-branch --app-id "$APP_ID" --branch-name production --environment-variables "NEXT_PUBLIC_API_URL=https://${PROD_URL}"
fi

echo "Done. Set GitHub environment secrets DATABASE_URL from backend/.env.staging and backend/.env.production"
