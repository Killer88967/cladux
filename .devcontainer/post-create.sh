#!/usr/bin/env bash

set -euo pipefail

# Resolve repository and configuration paths.
DEVCONTAINER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${CODESPACE_VSCODE_FOLDER:-$PWD}"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/oh-my-posh"
OMP_BIN_DIR="$HOME/.local/bin"
ZSHRC="$HOME/.zshrc"

# Install Oh My Posh if it isn't already installed.
if ! command -v oh-my-posh >/dev/null 2>&1; then
  echo "Installing Oh My Posh..."

  for dependency in curl unzip realpath dirname; do
    if ! command -v "$dependency" >/dev/null 2>&1; then
      echo "Error: Missing required dependency: $dependency"
      exit 1
    fi
  done

  mkdir -p "$OMP_BIN_DIR"

  curl -s https://ohmyposh.dev/install.sh | bash -s -- -d "$OMP_BIN_DIR"
fi

# Ensure Oh My Posh is available in this script.
export PATH="$OMP_BIN_DIR:$PATH"

if ! command -v oh-my-posh >/dev/null 2>&1; then
  echo "Error: Oh My Posh installation failed."
  exit 1
fi

# Detect the project's package manager.
PACKAGE_MANAGER=""

if [[ -f "$PROJECT_DIR/package.json" ]] && command -v node >/dev/null 2>&1; then
  PACKAGE_MANAGER="$(
    node -e '
      try {
        const pkg = require(process.argv[1]);
        const manager = pkg.packageManager || "";
        process.stdout.write(manager.split("@")[0]);
      } catch {
        process.exit(0);
      }
    ' "$PROJECT_DIR/package.json"
  )"
fi

# Fall back to detecting the package manager from lockfiles.
if [[ -z "$PACKAGE_MANAGER" ]]; then
  if [[ -f "$PROJECT_DIR/pnpm-lock.yaml" ]]; then
    PACKAGE_MANAGER="pnpm"
  elif [[ -f "$PROJECT_DIR/yarn.lock" ]]; then
    PACKAGE_MANAGER="yarn"
  elif [[ -f "$PROJECT_DIR/bun.lock" || -f "$PROJECT_DIR/bun.lockb" ]]; then
    PACKAGE_MANAGER="bun"
  elif [[ -f "$PROJECT_DIR/package-lock.json" || -f "$PROJECT_DIR/npm-shrinkwrap.json" ]]; then
    PACKAGE_MANAGER="npm"
  fi
fi

# Default to npm if no package manager was detected.
PACKAGE_MANAGER="${PACKAGE_MANAGER:-npm}"

case "$PACKAGE_MANAGER" in
  npm|pnpm|yarn|bun)
    ;;
  *)
    echo "Warning: Unknown package manager '$PACKAGE_MANAGER'. Defaulting to npm."
    PACKAGE_MANAGER="npm"
    ;;
esac

# Find the repository's OMP theme.
THEMES=("$DEVCONTAINER_DIR"/*.omp.json)

if [[ ! -f "${THEMES[0]:-}" ]] || [[ ${#THEMES[@]} -ne 1 ]]; then
  echo "Error: Expected exactly one .omp.json file in $DEVCONTAINER_DIR"
  exit 1
fi

THEME="${THEMES[0]}"
THEME_NAME="$(basename "$THEME")"
THEME_DEST="$CONFIG_DIR/$THEME_NAME"

# Copy the theme into the user's configuration directory.
mkdir -p "$CONFIG_DIR"
install -m 644 "$THEME" "$THEME_DEST"

# Configure Oh My Posh in Zsh.
touch "$ZSHRC"

MARKER="# Oh My Posh configuration"
END_MARKER="# End Oh My Posh configuration"

THEME_ESCAPED="$(printf '%q' "$THEME_DEST")"

# Remove the previous managed configuration block, if present.
if grep -Fq "$MARKER" "$ZSHRC"; then
  sed -i "/^$MARKER$/,/^$END_MARKER$/d" "$ZSHRC"
fi

# Add the current configuration.
cat >> "$ZSHRC" <<EOF

$MARKER
export PATH="$OMP_BIN_DIR:\$PATH"
export CLADUX_PM="$PACKAGE_MANAGER"
export CLADUX_OMP_CONFIG=$THEME_ESCAPED
eval "\$(oh-my-posh init zsh --config "\$CLADUX_OMP_CONFIG")"
$END_MARKER
EOF

echo "Oh My Posh configured successfully."
echo "Theme: $THEME_NAME"
echo "Package manager: $PACKAGE_MANAGER"
