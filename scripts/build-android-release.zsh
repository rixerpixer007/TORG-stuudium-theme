#!/bin/zsh

set -euo pipefail

project_root="${0:A:h:h}"
keystore_path="${SINU_STUUDIUM_KEYSTORE_PATH:-${HOME}/Library/Application Support/Sinu Stuudium/signing/sinu-stuudium-release.p12}"
key_alias="${SINU_STUUDIUM_KEY_ALIAS:-sinu-stuudium-release}"
keystore_password="${SINU_STUUDIUM_KEYSTORE_PASSWORD:-}"
key_password="${SINU_STUUDIUM_KEY_PASSWORD:-}"

cleanup() {
  unset keystore_password key_password
  unset SINU_STUUDIUM_KEYSTORE_PASSWORD SINU_STUUDIUM_KEY_PASSWORD
}

trap cleanup EXIT HUP INT TERM

if [[ ! -f "$keystore_path" ]]; then
  print -u2 "Android release keystore not found: $keystore_path"
  print -u2 "Set SINU_STUUDIUM_KEYSTORE_PATH if the keystore is stored elsewhere."
  exit 1
fi

if [[ -z "$keystore_password" ]]; then
  read -r -s "keystore_password?Keystore password: "
  print
fi

if [[ -z "$keystore_password" ]]; then
  print -u2 "The keystore password cannot be empty."
  exit 1
fi

if [[ -z "$key_password" ]]; then
  key_password="$keystore_password"
fi

export SINU_STUUDIUM_KEYSTORE_PATH="$keystore_path"
export SINU_STUUDIUM_KEY_ALIAS="$key_alias"
export SINU_STUUDIUM_KEYSTORE_PASSWORD="$keystore_password"
export SINU_STUUDIUM_KEY_PASSWORD="$key_password"

cd "$project_root"
npm run build:android:release:configured
