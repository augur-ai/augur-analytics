# Augur Analytics - Installation Guide

## Install from GitHub

You can install Augur Analytics packages directly from GitHub without publishing to npm.

### Prerequisites

Make sure you have Node.js and npm/yarn installed.

### Installation

#### Using npm:

```bash
# Install core package
npm install github:yourusername/augur-analytics#main:packages/core

# Install React package
npm install github:yourusername/augur-analytics#main:packages/react
```

#### Using yarn:

```bash
# Install core package
yarn add github:yourusername/augur-analytics#main:packages/core

# Install React package
yarn add github:yourusername/augur-analytics#main:packages/react
```

#### Using pnpm:

```bash
# Install core package
pnpm add github:yourusername/augur-analytics#main:packages/core

# Install React package
pnpm add github:yourusername/augur-analytics#main:packages/react
```

### Add to package.json

Alternatively, add directly to your `package.json`:

```json
{
  "dependencies": {
    "@augur/analytics-core": "github:yourusername/augur-analytics#main:packages/core",
    "@augur/analytics-react": "github:yourusername/augur-analytics#main:packages/react"
  }
}
```

Then run:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Install Specific Version

#### Install from a specific tag:

```bash
npm install github:yourusername/augur-analytics#v1.0.0:packages/core
```

#### Install from a specific commit:

```bash
npm install github:yourusername/augur-analytics#abc1234:packages/core
```

#### Install from a specific branch:

```bash
npm install github:yourusername/augur-analytics#feature-branch:packages/core
```

### Private Repository

If your repository is private, you'll need to authenticate:

#### Using SSH (Recommended):

```bash
npm install git+ssh://git@github.com:yourusername/augur-analytics.git#main:packages/core
```

#### Using Personal Access Token:

```bash
npm install git+https://YOUR_TOKEN@github.com/yourusername/augur-analytics.git#main:packages/core
```

Or configure your `.npmrc`:

```
//npm.pkg.github.com/:_authToken=YOUR_TOKEN
```

## Usage

### Core Package (Vanilla JS/TS)

```typescript
import { createAnalytics } from "@augur/analytics-core";

const analytics = createAnalytics({
  apiKey: "your-api-key",
  endpoint: "https://your-backend.com/api/v1",
  feedId: "your-feed-id",
  debug: true,
});

// Track events
analytics.track("button_clicked", {
  button_name: "signup",
  // Device info is automatically added
});
```

### React Package

```typescript
import { AugurProvider, useTrack, useDeviceInfo } from "@augur/analytics-react";

function App() {
  return (
    <AugurProvider
      config={{
        apiKey: "your-api-key",
        endpoint: "https://your-backend.com/api/v1",
        feedId: "your-feed-id",
      }}
    >
      <YourApp />
    </AugurProvider>
  );
}

function YourComponent() {
  const track = useTrack();
  const deviceInfo = useDeviceInfo();

  const handleClick = () => {
    track("button_clicked", { button_name: "example" });
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

## Building from Source

If you want to build the packages locally:

```bash
# Clone the repository
git clone https://github.com/yourusername/augur-analytics.git
cd augur-analytics

# Install dependencies
yarn install

# Build all packages
yarn build

# Or build individual packages
cd packages/core && yarn build
cd packages/react && yarn build
```

## Troubleshooting

### Issue: "Cannot find module '@augur/analytics-core'"

**Solution**: Make sure the core package is built before installing the React package. The `prepare` script should handle this automatically when installing from GitHub.

### Issue: Authentication errors with private repos

**Solution**: Set up SSH keys or use a Personal Access Token. See the "Private Repository" section above.

### Issue: "Failed to resolve dependency"

**Solution**: Make sure you're using the correct repository URL and branch/tag name. Check that the `dist/` folder exists in the repository.

## Notes

- The `prepare` script automatically builds the packages when installed from GitHub
- Make sure to commit the `dist/` folders or set up CI/CD to build automatically
- For production use, consider tagging releases (e.g., `v1.0.0`) and installing from tags
