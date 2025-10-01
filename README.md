# Augur Analytics SDK

Modern analytics SDK with batching, retry logic, device detection, and localStorage persistence.

## 📦 Packages

- **[@augur/analytics-core](packages/core)** - Core SDK with zero dependencies
- **[@augur/analytics-react](packages/react)** - React hooks for easy integration

## 🚀 Quick Start

### Installation

```bash
# Core package (vanilla JS/TS)
npm install @augur/analytics-core

# React package
npm install @augur/analytics-react
```

### Usage

#### Core (Vanilla JS/TS)

```typescript
import { createAnalytics } from "@augur/analytics-core";

const analytics = createAnalytics({
  apiKey: "your-api-key",
  endpoint: "https://your-backend.com/api/v1",
  feedId: "your-feed-id",
  batchSize: 10, // Optional: events per batch (default: 10)
  batchTimeout: 5000, // Optional: max wait time in ms (default: 5000)
  debug: true, // Optional: enable debug logging
});

// Track events - automatically batched and includes device info
analytics.track("button_clicked", {
  button_name: "signup",
  page: "/home",
});

// Manual flush if needed
analytics.flushQueue();
```

#### React

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

  return (
    <div>
      <button onClick={handleClick}>Track Event</button>
      <p>Device: {deviceInfo.device.type}</p>
      <p>Browser: {deviceInfo.browser.name}</p>
    </div>
  );
}
```

## ✨ Features

### 🎯 Automatic Batching

- Configurable batch size and timeout
- Efficient network usage
- Automatic flush on page unload

### 🔄 Retry Logic

- 3 retry attempts by default (configurable)
- Exponential backoff
- localStorage persistence for failed events

### 📱 Device Detection

- Automatic browser detection (Chrome, Firefox, Safari, Edge)
- OS detection (Windows, macOS, Linux, Android, iOS)
- Device type (desktop, mobile, tablet)
- Screen resolution and pixel ratio
- Timezone and language

### 💾 localStorage Persistence

- Failed events saved automatically
- Sent on next page load
- Prevents data loss

### 🚪 Proper Unload Handling

- Listens to `pagehide` and `visibilitychange` events
- Avoids breaking browser BFCache
- Follows best practices from [Beaconing in Practice](https://nicj.net/beaconing-in-practice/)

### 📡 Smart Beacon Strategy

- Uses `sendBeacon()` first (survives page unload)
- Falls back to `fetch` with `keepalive: true`
- Automatic fallback on failure

## 📖 API Reference

### Configuration Options

```typescript
interface AugurConfig {
  apiKey: string; // Required: Your API key
  endpoint: string; // Required: Backend endpoint
  userId?: string; // Optional: User identifier
  sessionId?: string; // Optional: Custom session ID
  feedId?: string; // Optional: Feed ID for multi-feed setups
  batchSize?: number; // Optional: Events per batch (default: 10)
  batchTimeout?: number; // Optional: Max wait time in ms (default: 5000)
  maxRetries?: number; // Optional: Max retry attempts (default: 3)
  enableLocalStorage?: boolean; // Optional: Persist failed events (default: true)
  debug?: boolean; // Optional: Enable debug logging
}
```

### Core Methods

```typescript
// Track event
analytics.track(event: string, properties?: Record<string, any>);

// Track with custom event name and description
analytics.track(
  event: string,
  properties?: Record<string, any>,
  feedId?: string,
  eventName?: string,
  eventDescription?: string
);

// Manual flush
analytics.flushQueue();

// Get device info
analytics.getDeviceInfo();

// Page view
analytics.page(properties?: { path, url, title });

// User identification
analytics.identify(userId: string, traits?: Record<string, any>);
```

### React Hooks

```typescript
useAugur(); // Get analytics instance
useTrack(); // Track events
usePage(); // Track page views
useIdentify(); // Identify users
useDeviceInfo(); // Get device information
usePageTracking(); // Auto-track page views
useComponentTracking(); // Track component lifecycle
useFormTracking(); // Track form interactions
```

## 🔧 Development

### Setup

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Watch mode
yarn dev
```

### Publishing

1. Create `.env` file:

```bash
cp .env.example .env
# Add your NPM_TOKEN
```

2. Run publish script:

```bash
yarn publish:packages
```

Or manually:

```bash
./scripts/publish.sh
```

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 📚 Resources

- [Beaconing in Practice](https://nicj.net/beaconing-in-practice/) - Best practices we follow
- [npm Package - Core](https://www.npmjs.com/package/@augur/analytics-core)
- [npm Package - React](https://www.npmjs.com/package/@augur/analytics-react)
