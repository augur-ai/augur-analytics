# Publishing to npm

## Prerequisites

1. **Create npm account**: https://www.npmjs.com/signup
2. **Login to npm CLI**:
   ```bash
   npm login
   ```

## Publishing Steps

### 1. Build All Packages

```bash
# From root directory
yarn build
```

### 2. Test Locally (Optional but Recommended)

Test packages locally before publishing:

```bash
# In core package
cd packages/core
npm pack

# In react package
cd packages/react
npm pack
```

This creates `.tgz` files you can test in another project:

```bash
npm install /path/to/augur-analytics-core-0.0.2.tgz
```

### 3. Publish Core Package First

```bash
cd packages/core
npm publish
```

### 4. Publish React Package

```bash
cd packages/react
npm publish
```

## Version Management

### Updating Versions

Use npm version commands:

```bash
# Patch version (0.0.2 -> 0.0.3)
npm version patch

# Minor version (0.0.2 -> 0.1.0)
npm version minor

# Major version (0.0.2 -> 1.0.0)
npm version major
```

### Publishing New Versions

1. Update version in both packages:

   ```bash
   cd packages/core
   npm version patch

   cd packages/react
   # Update @augur/analytics-core version in dependencies first!
   npm version patch
   ```

2. Commit version changes:

   ```bash
   git add .
   git commit -m "Release v0.0.3"
   git tag v0.0.3
   git push && git push --tags
   ```

3. Publish:
   ```bash
   cd packages/core && npm publish
   cd packages/react && npm publish
   ```

## Installation for Users

Once published, users can install via npm:

```bash
# Core package
npm install @augur/analytics-core

# React package
npm install @augur/analytics-react
```

## Scoped Packages (@augur/...)

The `@augur` scope means:

- Packages are namespaced under your organization
- Prevents naming conflicts
- Requires `publishConfig.access: "public"` to be publicly available

## Troubleshooting

### Permission Denied

If you get permission errors:

```bash
npm login
# Make sure you're logged in with the correct account
```

### Package Already Exists

If the name is taken:

- Change the scope: `@your-org/analytics-core`
- Or change the package name entirely

### Publishing Fails

Check:

- Are you logged in? `npm whoami`
- Is the version unique? Check package.json
- Is the package built? Check dist/ folder exists
- Is publishConfig set correctly?

## Best Practices

1. **Always build before publishing**:

   ```bash
   npm run build
   ```

2. **Test in a real project first**:

   - Use `npm pack` and test the .tgz file
   - Or publish to npm with a beta tag first:
     ```bash
     npm publish --tag beta
     ```

3. **Use Semantic Versioning**:

   - Patch (0.0.x): Bug fixes
   - Minor (0.x.0): New features, backward compatible
   - Major (x.0.0): Breaking changes

4. **Update dependencies**:
   - When publishing core, update the version in react's package.json

## CI/CD Publishing (Optional)

Add to GitHub Actions workflow:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          registry-url: "https://registry.npmjs.org"

      - run: yarn install
      - run: yarn build

      - name: Publish core
        run: cd packages/core && npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Publish react
        run: cd packages/react && npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Quick Reference

```bash
# One-time setup
npm login

# For each release
cd packages/core
npm version patch
npm publish

cd packages/react
# Update @augur/analytics-core version in dependencies!
npm version patch
npm publish

# Commit and tag
git add .
git commit -m "Release vX.X.X"
git tag vX.X.X
git push && git push --tags
```
