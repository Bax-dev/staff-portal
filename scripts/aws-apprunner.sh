#!/usr/bin/env bash
# Deploy the API from Docker/ECR to App Runner and point Amplify at it.
# Does not require the GitHub App Runner handshake.
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/backend/.aws-provisioned"

ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
REPO="smp-api"
IMAGE="${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com/${REPO}"
ECR_ROLE_NAME="smp-apprunner-ecr"

aws ecr describe-repositories --repository-names "$REPO" >/dev/null 2>&1 \
  || aws ecr create-repository --repository-name "$REPO" --image-scanning-configuration scanOnPush=true >/dev/null

if ! aws iam get-role --role-name "$ECR_ROLE_NAME" >/dev/null 2>&1; then
  aws iam create-role --role-name "$ECR_ROLE_NAME" --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": { "Service": "build.apprunner.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }]
  }' >/dev/null
  aws iam attach-role-policy --role-name "$ECR_ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly
  sleep 8
fi
ECR_ROLE_ARN="$(aws iam get-role --role-name "$ECR_ROLE_NAME" --query Role.Arn --output text)"

aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com"

docker build -t "${REPO}:latest" "$ROOT/backend"
docker tag "${REPO}:latest" "${IMAGE}:staging"
docker tag "${REPO}:latest" "${IMAGE}:production"
docker push "${IMAGE}:staging"
docker push "${IMAGE}:production"

DEFAULT_VPC="$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text)"
SUBNET_A="$(aws ec2 describe-subnets --filters Name=vpc-id,Values="$DEFAULT_VPC" Name=availability-zone,Values="${REGION}a" --query 'Subnets[0].SubnetId' --output text)"
SUBNET_B="$(aws ec2 describe-subnets --filters Name=vpc-id,Values="$DEFAULT_VPC" Name=availability-zone,Values="${REGION}b" --query 'Subnets[0].SubnetId' --output text)"

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

write_create_payload() {
  python3 - "$1" "$2" "$3" "$4" "$IMAGE" "$ECR_ROLE_ARN" "$INSTANCE_ROLE_ARN" <<'PY'
import json, pathlib, sys
name, tag, env_file, vpc_arn, image, ecr_role, instance_role = sys.argv[1:8]
env = {}
for line in pathlib.Path(env_file).read_text().splitlines():
    if not line or line.startswith("#") or "=" not in line:
        continue
    key, value = line.split("=", 1)
    env[key] = value.strip().strip("'").strip('"')
print(json.dumps({
  "ServiceName": name,
  "SourceConfiguration": {
    "AuthenticationConfiguration": {"AccessRoleArn": ecr_role},
    "AutoDeploymentsEnabled": True,
    "ImageRepository": {
      "ImageIdentifier": f"{image}:{tag}",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "4000",
        "RuntimeEnvironmentVariables": env,
      },
    },
  },
  "InstanceConfiguration": {
    "Cpu": "512",
    "Memory": "1024",
    "InstanceRoleArn": instance_role,
  },
  "NetworkConfiguration": {
    "EgressConfiguration": {
      "EgressType": "VPC",
      "VpcConnectorArn": vpc_arn,
    }
  }
}))
PY
}

ensure_service() {
  local name="$1" tag="$2" env_file="$3" vpc_arn="$4"
  local arn
  arn="$(aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='$name'].ServiceArn | [0]" --output text)"
  if [[ -z "$arn" || "$arn" == "None" ]]; then
    aws apprunner create-service --cli-input-json "$(write_create_payload "$name" "$tag" "$env_file" "$vpc_arn")" >/dev/null
    echo "Created App Runner $name"
    return
  fi
  aws apprunner start-deployment --service-arn "$arn" >/dev/null
  echo "Redeployed App Runner $name"
}

ensure_service smp-api-staging staging "$ROOT/backend/.env.staging" "$STAGING_CONN"
ensure_service smp-api-production production "$ROOT/backend/.env.production" "$PROD_CONN"

echo "Waiting for App Runner services..."
for name in smp-api-staging smp-api-production; do
  arn="$(aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='$name'].ServiceArn | [0]" --output text)"
  aws apprunner wait service-running --service-arn "$arn"
done

aws apprunner list-services --query 'ServiceSummaryList[?starts_with(ServiceName, `smp-api`)].[ServiceName,Status,ServiceUrl]' --output table

STAGING_URL="$(aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='smp-api-staging'].ServiceUrl | [0]" --output text)"
PROD_URL="$(aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='smp-api-production'].ServiceUrl | [0]" --output text)"

if [[ -n "$STAGING_URL" && "$STAGING_URL" != "None" ]]; then
  aws amplify update-branch --app-id "$APP_ID" --branch-name staging \
    --environment-variables "API_URL=https://${STAGING_URL}"
fi
if [[ -n "$PROD_URL" && "$PROD_URL" != "None" ]]; then
  aws amplify update-branch --app-id "$APP_ID" --branch-name production \
    --environment-variables "API_URL=https://${PROD_URL}"
fi

echo "API_URL staging=https://${STAGING_URL}"
echo "API_URL production=https://${PROD_URL}"
echo "Done. Push frontend changes so Amplify rebuilds with the same-origin API proxy."
