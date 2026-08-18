#!/usr/bin/env python3
"""Set GitHub environment and repository secrets from local env files. Does not print secret values."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"

ENV_KEYS = [
    "DATABASE_URL",
    "REDIS_URL",
    "JWT_SECRET",
    "OTP_PEPPER",
    "CORS_ORIGIN",
    "S3_BUCKET",
    "AWS_REGION",
]

REPO_KEYS = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"]


def load_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    for line in path.read_text().splitlines():
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key] = value.strip().strip("'").strip('"')
    return env


def set_secret(name: str, value: str, *, environment: str | None = None) -> None:
    cmd = ["gh", "secret", "set", name]
    if environment:
        cmd.extend(["--env", environment])
    subprocess.run(cmd, input=value, text=True, check=True)


def set_variable(name: str, value: str) -> None:
    subprocess.run(["gh", "variable", "set", name, "--body", value], check=True)


def main() -> int:
    staging = load_env(BACKEND / ".env.staging")
    production = load_env(BACKEND / ".env.production")
    local = load_env(BACKEND / ".env")

    for key in ENV_KEYS:
        if key not in staging or key not in production:
            print(f"missing {key} in env files", file=sys.stderr)
            return 1
        set_secret(key, staging[key], environment="staging")
        set_secret(key, production[key], environment="production")
        print(f"set {key} on staging and production")

    for key in REPO_KEYS:
        value = local.get(key, "")
        if not value:
            print(f"skip repo secret {key}: not in backend/.env")
            continue
        set_secret(key, value)
        set_secret(key, value, environment="staging")
        set_secret(key, value, environment="production")
        print(f"set repo and environment secret {key}")

    set_variable("AMPLIFY_APP_ID", "dxv78sz375u86")
    print("set repo variable AMPLIFY_APP_ID")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
