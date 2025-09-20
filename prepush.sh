#!/bin/bash
# prepush.sh: Lint, fix, build, and only push if all succeed
set -e

echo "Running lint:fix..."
npm run lint:fix

echo "Running lint..."
npm run lint

echo "Building project..."
npm run build

echo "All checks passed. Pushing to origin..."
git push origin HEAD
