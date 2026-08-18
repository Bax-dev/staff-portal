#!/usr/bin/env bash
# Provision Amplify, S3, RDS, ElastiCache, IAM, and App Runner connection for staff-portal.
# Region: us-east-1 (current AWS CLI default). Idempotent.
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
PROJECT="smp"
ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
VPC="$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text)"
MY_IP="$(curl -s https://checkip.amazonaws.com | tr -d '[:space:]')"
REPO="https://github.com/Bax-dev/staff-portal"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_DIR="$ROOT/backend"
CREDS_FILE="$ENV_DIR/.aws-provisioned"

SUBNET_A="$(aws ec2 describe-subnets --filters Name=vpc-id,Values="$VPC" Name=availability-zone,Values="${REGION}a" --query 'Subnets[0].SubnetId' --output text)"
SUBNET_B="$(aws ec2 describe-subnets --filters Name=vpc-id,Values="$VPC" Name=availability-zone,Values="${REGION}b" --query 'Subnets[0].SubnetId' --output text)"

STAGING_BUCKET="${PROJECT}-${ACCOUNT}-staging"
PROD_BUCKET="${PROJECT}-${ACCOUNT}-production"

echo "Account=$ACCOUNT Region=$REGION VPC=$VPC IP=$MY_IP"
echo "Subnets=$SUBNET_A $SUBNET_B"

ensure_sg() {
  local name="$1"
  local desc="$2"
  local id
  id="$(aws ec2 describe-security-groups --filters Name=group-name,Values="$name" Name=vpc-id,Values="$VPC" --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || true)"
  if [[ -z "$id" || "$id" == "None" ]]; then
    id="$(aws ec2 create-security-group --group-name "$name" --description "$desc" --vpc-id "$VPC" --query GroupId --output text)"
    aws ec2 create-tags --resources "$id" --tags Key=Project,Value=staff-portal Key=Name,Value="$name"
    echo "Created SG $name $id" >&2
  else
    echo "Using SG $name $id" >&2
  fi
  printf '%s\n' "$id"
}

allow_ingress() {
  local sg="$1"
  shift
  aws ec2 authorize-security-group-ingress --group-id "$sg" "$@" >/dev/null 2>&1 || true
}

ensure_bucket() {
  local bucket="$1"
  if aws s3api head-bucket --bucket "$bucket" 2>/dev/null; then
    echo "Using bucket $bucket"
    return
  fi
  aws s3api create-bucket --bucket "$bucket" --region "$REGION"
  aws s3api put-public-access-block --bucket "$bucket" --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
  aws s3api put-bucket-encryption --bucket "$bucket" --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
  aws s3api put-bucket-cors --bucket "$bucket" --cors-configuration '{
    "CORSRules": [{
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "HEAD"],
      "AllowedOrigins": ["http://localhost:3000", "https://*.amplifyapp.com"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }]
  }'
  aws s3api put-bucket-tagging --bucket "$bucket" --tagging 'TagSet=[{Key=Project,Value=staff-portal}]'
  echo "Created bucket $bucket"
}

password() {
  openssl rand -hex 24
}

# --- IAM ---
if ! aws iam get-role --role-name smp-amplify-role >/dev/null 2>&1; then
  aws iam create-role --role-name smp-amplify-role --assume-role-policy-document "file://$ROOT/scripts/iam/amplify-trust.json"
  aws iam attach-role-policy --role-name smp-amplify-role --policy-arn arn:aws:iam::aws:policy/AdministratorAccess-Amplify
  echo "Created smp-amplify-role"
fi
AMPLIFY_ROLE_ARN="$(aws iam get-role --role-name smp-amplify-role --query Role.Arn --output text)"

if ! aws iam get-role --role-name smp-apprunner-instance >/dev/null 2>&1; then
  aws iam create-role --role-name smp-apprunner-instance --assume-role-policy-document "file://$ROOT/scripts/iam/apprunner-instance-trust.json"
  aws iam put-role-policy --role-name smp-apprunner-instance --policy-name smp-s3 --policy-document "file://$ROOT/scripts/iam/smp-s3-policy.json"
  echo "Created smp-apprunner-instance"
fi
INSTANCE_ROLE_ARN="$(aws iam get-role --role-name smp-apprunner-instance --query Role.Arn --output text)"

# --- S3 ---
ensure_bucket "$STAGING_BUCKET"
ensure_bucket "$PROD_BUCKET"

# --- Security groups ---
STAGING_API_SG="$(ensure_sg smp-staging-api "staff-portal staging API")"
STAGING_DATA_SG="$(ensure_sg smp-staging-data "staff-portal staging data")"
PROD_API_SG="$(ensure_sg smp-production-api "staff-portal production API")"
PROD_DATA_SG="$(ensure_sg smp-production-data "staff-portal production data")"

allow_ingress "$STAGING_API_SG" --ip-permissions "IpProtocol=tcp,FromPort=4000,ToPort=4000,IpRanges=[{CidrIp=0.0.0.0/0,Description=API}]"
allow_ingress "$PROD_API_SG" --ip-permissions "IpProtocol=tcp,FromPort=4000,ToPort=4000,IpRanges=[{CidrIp=0.0.0.0/0,Description=API}]"
allow_ingress "$STAGING_DATA_SG" --ip-permissions "IpProtocol=tcp,FromPort=5432,ToPort=5432,UserIdGroupPairs=[{GroupId=$STAGING_API_SG,Description=API}],IpRanges=[{CidrIp=${MY_IP}/32,Description=Admin}]"
allow_ingress "$PROD_DATA_SG" --ip-permissions "IpProtocol=tcp,FromPort=5432,ToPort=5432,UserIdGroupPairs=[{GroupId=$PROD_API_SG,Description=API}],IpRanges=[{CidrIp=${MY_IP}/32,Description=Admin}]"
allow_ingress "$STAGING_DATA_SG" --ip-permissions "IpProtocol=tcp,FromPort=6379,ToPort=6379,UserIdGroupPairs=[{GroupId=$STAGING_API_SG,Description=API}]"
allow_ingress "$PROD_DATA_SG" --ip-permissions "IpProtocol=tcp,FromPort=6379,ToPort=6379,UserIdGroupPairs=[{GroupId=$PROD_API_SG,Description=API}]"

# --- Subnet groups ---
if ! aws rds describe-db-subnet-groups --db-subnet-group-name smp-default >/dev/null 2>&1; then
  aws rds create-db-subnet-group --db-subnet-group-name smp-default --db-subnet-group-description "staff-portal default VPC" --subnet-ids "$SUBNET_A" "$SUBNET_B"
fi
if ! aws elasticache describe-cache-subnet-groups --cache-subnet-group-name smp-default >/dev/null 2>&1; then
  aws elasticache create-cache-subnet-group --cache-subnet-group-name smp-default --cache-subnet-group-description "staff-portal default VPC" --subnet-ids "$SUBNET_A" "$SUBNET_B"
fi

# --- Secrets / passwords ---
mkdir -p "$ENV_DIR"
if [[ -f "$CREDS_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$CREDS_FILE"
fi
STAGING_DB_PASS="${STAGING_DB_PASS:-$(password)}"
PROD_DB_PASS="${PROD_DB_PASS:-$(password)}"
STAGING_JWT="${STAGING_JWT:-$(password)}"
PROD_JWT="${PROD_JWT:-$(password)}"
STAGING_OTP="${STAGING_OTP:-$(password)}"
PROD_OTP="${PROD_OTP:-$(password)}"

cat > "$CREDS_FILE" <<EOF
STAGING_DB_PASS=$STAGING_DB_PASS
PROD_DB_PASS=$PROD_DB_PASS
STAGING_JWT=$STAGING_JWT
PROD_JWT=$PROD_JWT
STAGING_OTP=$STAGING_OTP
PROD_OTP=$PROD_OTP
EOF

# --- RDS ---
create_rds() {
  local id="$1" pass="$2" sg="$3" protect="$4"
  if aws rds describe-db-instances --db-instance-identifier "$id" >/dev/null 2>&1; then
    echo "RDS $id already exists"
    return
  fi
  extra=()
  if [[ "$protect" == "yes" ]]; then extra+=(--deletion-protection); else extra+=(--no-deletion-protection); fi
  aws rds create-db-instance \
    --db-instance-identifier "$id" \
    --db-instance-class db.t4g.micro \
    --engine postgres \
    --engine-version 17.9 \
    --master-username smp \
    --master-user-password "$pass" \
    --allocated-storage 20 \
    --storage-type gp3 \
    --storage-encrypted \
    --db-name staff_portal \
    --vpc-security-group-ids "$sg" \
    --db-subnet-group-name smp-default \
    --publicly-accessible \
    --backup-retention-period 7 \
    --no-multi-az \
    --tags Key=Project,Value=staff-portal \
    "${extra[@]}"
  echo "Creating RDS $id"
}

create_redis() {
  local id="$1" sg="$2"
  if aws elasticache describe-cache-clusters --cache-cluster-id "$id" >/dev/null 2>&1; then
    echo "Redis $id already exists"
    return
  fi
  aws elasticache create-cache-cluster \
    --cache-cluster-id "$id" \
    --engine redis \
    --engine-version 7.1 \
    --cache-node-type cache.t4g.micro \
    --num-cache-nodes 1 \
    --port 6379 \
    --cache-subnet-group-name smp-default \
    --security-group-ids "$sg"
  echo "Creating Redis $id"
}

create_rds smp-staging "$STAGING_DB_PASS" "$STAGING_DATA_SG" no
create_rds smp-production "$PROD_DB_PASS" "$PROD_DATA_SG" yes
create_redis smp-staging "$STAGING_DATA_SG"
create_redis smp-production "$PROD_DATA_SG"

# --- Amplify ---
APP_ID="$(aws amplify list-apps --query "apps[?name=='staff-portal'].appId | [0]" --output text)"
GH_TOKEN="$(gh auth token)"
if [[ -z "$APP_ID" || "$APP_ID" == "None" ]]; then
  APP_ID="$(aws amplify create-app \
    --name staff-portal \
    --repository "$REPO" \
    --access-token "$GH_TOKEN" \
    --platform WEB_COMPUTE \
    --iam-service-role-arn "$AMPLIFY_ROLE_ARN" \
    --query app.appId --output text)"
  echo "Created Amplify app $APP_ID"
else
  echo "Using Amplify app $APP_ID"
fi

aws amplify update-app --app-id "$APP_ID" --build-spec "file://$ROOT/amplify.yml" >/dev/null

ensure_branch() {
  local branch="$1" stage="$2"
  if aws amplify get-branch --app-id "$APP_ID" --branch-name "$branch" >/dev/null 2>&1; then
    aws amplify update-branch --app-id "$APP_ID" --branch-name "$branch" --enable-auto-build >/dev/null
  else
    aws amplify create-branch --app-id "$APP_ID" --branch-name "$branch" --stage "$stage" --framework "Next.js - SSR" --enable-auto-build >/dev/null || true
  fi
}

ensure_branch staging DEVELOPMENT
ensure_branch production PRODUCTION

# --- App Runner GitHub connection (handshake required in console) ---
CONN_ARN="$(aws apprunner list-connections --query "ConnectionSummaryList[?ConnectionName=='github-baxdev'].ConnectionArn | [0]" --output text)"
if [[ -z "$CONN_ARN" || "$CONN_ARN" == "None" ]]; then
  CONN_ARN="$(aws apprunner create-connection --connection-name github-baxdev --provider-type GITHUB --query Connection.ConnectionArn --output text)"
  echo "Created App Runner GitHub connection. Complete handshake:"
  echo "https://console.aws.amazon.com/apprunner/home?region=${REGION}#/connections"
fi

# --- Persist local connection files (gitignored) ---
cat >> "$CREDS_FILE" <<EOF
APP_ID=$APP_ID
STAGING_API_SG=$STAGING_API_SG
PROD_API_SG=$PROD_API_SG
STAGING_DATA_SG=$STAGING_DATA_SG
PROD_DATA_SG=$PROD_DATA_SG
INSTANCE_ROLE_ARN=$INSTANCE_ROLE_ARN
CONN_ARN=$CONN_ARN
STAGING_BUCKET=$STAGING_BUCKET
PROD_BUCKET=$PROD_BUCKET
EOF

echo "Waiting for RDS (this can take 10+ minutes)..."
aws rds wait db-instance-available --db-instance-identifier smp-staging
aws rds wait db-instance-available --db-instance-identifier smp-production

STAGING_DB_HOST="$(aws rds describe-db-instances --db-instance-identifier smp-staging --query 'DBInstances[0].Endpoint.Address' --output text)"
PROD_DB_HOST="$(aws rds describe-db-instances --db-instance-identifier smp-production --query 'DBInstances[0].Endpoint.Address' --output text)"

echo "Waiting for Redis..."
aws elasticache wait cache-cluster-available --cache-cluster-id smp-staging || true
aws elasticache wait cache-cluster-available --cache-cluster-id smp-production || true
STAGING_REDIS_HOST="$(aws elasticache describe-cache-clusters --cache-cluster-id smp-staging --show-cache-node-info --query 'CacheClusters[0].CacheNodes[0].Endpoint.Address' --output text)"
PROD_REDIS_HOST="$(aws elasticache describe-cache-clusters --cache-cluster-id smp-production --show-cache-node-info --query 'CacheClusters[0].CacheNodes[0].Endpoint.Address' --output text)"

write_env() {
  local file="$1" db_host="$2" db_pass="$3" redis_host="$4" jwt="$5" otp="$6" bucket="$7" cors="$8"
  cat > "$file" <<EOF
PORT=4000
NODE_ENV=production
DATABASE_URL='postgresql://smp:${db_pass}@${db_host}:5432/staff_portal?schema=public&sslmode=require'
REDIS_URL='redis://${redis_host}:6379'
JWT_SECRET='${jwt}'
OTP_PEPPER='${otp}'
OTP_TTL_SECONDS=300
OTP_LENGTH=6
PASSWORD_RESET_TTL_SECONDS=3600
CORS_ORIGIN='${cors}'
AWS_REGION='${REGION}'
S3_BUCKET='${bucket}'
S3_FORCE_PATH_STYLE=false
S3_PRESIGN_EXPIRES_SECONDS=300
EOF
}

STAGING_CORS="*"
PROD_CORS="*"
write_env "$ENV_DIR/.env.staging" "$STAGING_DB_HOST" "$STAGING_DB_PASS" "$STAGING_REDIS_HOST" "$STAGING_JWT" "$STAGING_OTP" "$STAGING_BUCKET" "$STAGING_CORS"
write_env "$ENV_DIR/.env.production" "$PROD_DB_HOST" "$PROD_DB_PASS" "$PROD_REDIS_HOST" "$PROD_JWT" "$PROD_OTP" "$PROD_BUCKET" "$PROD_CORS"

if [[ "$STAGING_REDIS_HOST" != "None" && -n "$STAGING_REDIS_HOST" ]]; then
  aws secretsmanager create-secret --name smp/staging --secret-string "file://$ENV_DIR/.env.staging" >/dev/null 2>&1 \
    || aws secretsmanager put-secret-value --secret-id smp/staging --secret-string "file://$ENV_DIR/.env.staging" >/dev/null
fi
if [[ "$PROD_REDIS_HOST" != "None" && -n "$PROD_REDIS_HOST" ]]; then
  aws secretsmanager create-secret --name smp/production --secret-string "file://$ENV_DIR/.env.production" >/dev/null 2>&1 \
    || aws secretsmanager put-secret-value --secret-id smp/production --secret-string "file://$ENV_DIR/.env.production" >/dev/null
fi

echo
echo "RDS staging: $STAGING_DB_HOST"
echo "RDS production: $PROD_DB_HOST"
echo "Redis staging: $STAGING_REDIS_HOST"
echo "Redis production: $PROD_REDIS_HOST"
echo "S3 staging: $STAGING_BUCKET"
echo "S3 production: $PROD_BUCKET"
echo "Amplify app: $APP_ID"
echo "Amplify URL staging: https://staging.${APP_ID}.amplifyapp.com"
echo "Wrote $ENV_DIR/.env.staging and $ENV_DIR/.env.production"
echo
echo "If App Runner connection is PENDING_HANDSHAKE, authorize GitHub at:"
echo "https://console.aws.amazon.com/apprunner/home?region=${REGION}#/connections"
echo "Then run: bash scripts/aws-apprunner.sh"
