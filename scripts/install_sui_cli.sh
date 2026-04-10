#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="${SUI_VERSION:-mainnet-v1.69.2}"
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
    Linux) PLATFORM="ubuntu" ;;
    Darwin) PLATFORM="macos" ;;
    *)
        echo "Unsupported OS: $OS" >&2
        exit 1
        ;;
esac

case "$ARCH" in
    x86_64|amd64) TARGET_ARCH="x86_64" ;;
    arm64|aarch64) TARGET_ARCH="aarch64" ;;
    *)
        echo "Unsupported architecture: $ARCH" >&2
        exit 1
        ;;
esac

ARCHIVE="sui-${VERSION}-${PLATFORM}-${TARGET_ARCH}.tgz"
URL="https://github.com/MystenLabs/sui/releases/download/${VERSION}/${ARCHIVE}"
TARGET_DIR="$ROOT_DIR/.tools/sui"
TMP_ARCHIVE="$(mktemp)"

trap 'rm -f "$TMP_ARCHIVE"' EXIT

mkdir -p "$TARGET_DIR"

echo "Downloading $URL"
curl -L "$URL" -o "$TMP_ARCHIVE"
tar -xzf "$TMP_ARCHIVE" -C "$TARGET_DIR"

echo "Installed Sui CLI to $TARGET_DIR"
"$TARGET_DIR/sui" --version
