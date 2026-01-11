#!/bin/bash
# Script pour builder les frontends avec Docker
# Usage: ./build-frontends.sh [API_URL]

set -e

API_URL=${1:-"https://api.votre-domaine.com/api"}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🏗️  Build des frontends avec API_URL=${API_URL}"
echo "================================================"

# User Panel
echo ""
echo "📦 Building User Panel..."
cd "$PROJECT_DIR/user-panel"
docker run --rm \
    -v "$(pwd):/app" \
    -w /app \
    -e VITE_API_URL="$API_URL" \
    node:18-alpine \
    sh -c "npm ci && npm run build"

echo "✅ User Panel build terminé"

# Admin Panel
echo ""
echo "📦 Building Admin Panel..."
cd "$PROJECT_DIR/admin-panel"
docker run --rm \
    -v "$(pwd):/app" \
    -w /app \
    -e VITE_API_URL="$API_URL" \
    node:18-alpine \
    sh -c "npm ci && npm run build"

echo "✅ Admin Panel build terminé"

echo ""
echo "✅ Tous les frontends sont buildés avec succès !"
echo "Les fichiers sont dans:"
echo "  - $PROJECT_DIR/user-panel/dist"
echo "  - $PROJECT_DIR/admin-panel/dist"



