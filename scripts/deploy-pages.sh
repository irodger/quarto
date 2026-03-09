#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
REPO_URL=$(git -C "$ROOT_DIR" remote get-url origin)
TMP_DIR=$(mktemp -d /tmp/quarto-pages.XXXXXX)

cleanup() {
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT INT TERM

cd "$ROOT_DIR"
npm run build:pages

cp -R dist/. "$TMP_DIR"/

cd "$TMP_DIR"
git init
git checkout -b gh-pages
git add .
git -c user.name='Pages Deploy' -c user.email='pages@local' commit -m 'Deploy GitHub Pages'
git remote add origin "$REPO_URL"
git push --force origin gh-pages
