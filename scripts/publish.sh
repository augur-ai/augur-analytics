#!/bin/bash

# Exit on error
set -e

# Load environment variables from .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✓ Loaded credentials from .env"
else
    echo "❌ Error: .env file not found"
    echo "Please copy .env.example to .env and fill in your NPM_TOKEN"
    exit 1
fi

# Check if NPM_TOKEN is set
if [ -z "$NPM_TOKEN" ]; then
    echo "❌ Error: NPM_TOKEN not found in .env"
    echo "Please add your npm token to .env file"
    exit 1
fi

echo "🚀 Starting build and publish process..."
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
yarn clean
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
yarn install
echo ""

# Build all packages
echo "🔨 Building packages..."
yarn build
echo ""

# Run tests
echo "🧪 Running tests..."
yarn test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed! Aborting publish."
    exit 1
fi
echo "✓ All tests passed"
echo ""

# Setup npm authentication
echo "🔐 Setting up npm authentication..."
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc

# Publish core package
echo "📤 Publishing @augur/analytics-core..."
cd packages/core
npm publish --access public
cd ../..
echo "✓ @augur/analytics-core published successfully"
echo ""

# Publish react package
echo "📤 Publishing @augur/analytics-react..."
cd packages/react
npm publish --access public
cd ../..
echo "✓ @augur/analytics-react published successfully"
echo ""

echo "🎉 All packages published successfully!"
echo ""
echo "View your packages at:"
echo "  - https://www.npmjs.com/package/@augur/analytics-core"
echo "  - https://www.npmjs.com/package/@augur/analytics-react"

