#!/usr/bin/env bash

set -euo pipefail

# Resolve repository and configuration paths.
DEVCONTAINER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/oh-my-posh"
ZSHRC="$HOME/.zshrc"

# Ensure Oh My Posh is already available.
if ! command -v oh-my-posh >/dev/null 2>&1; then
  echo "Error: Oh My Posh is not installed."
  exit 1
fi

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

# Add Oh My Posh initialization to Zsh (only once).
MARKER="# Oh My Posh configuration"

if ! grep -Fq "$MARKER" "$ZSHRC" 2>/dev/null; then
  THEME_ESCAPED="$(printf '%q' "$THEME_DEST")"

  cat >> "$ZSHRC" <<EOF

$MARKER
export CLADUX_OMP_CONFIG=$THEME_ESCAPED
eval "\$(oh-my-posh init zsh --config "\$CLADUX_OMP_CONFIG")"
EOF
fi

echo "Oh My Posh configured successfully."
echo "Theme: $THEME_NAME"
