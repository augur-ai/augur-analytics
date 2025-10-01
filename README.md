# Augur Analytics SDK

Modern analytics SDK with industry-standard session management, batching, retry logic, device detection, and localStorage persistence.

## 📦 Packages

- **[@augur-ai/analytics-core](packages/core)** - Core SDK with zero dependencies
- **[@augur-ai/analytics-react](packages/react)** - React hooks for easy integration

## 🚀 Quick Start

### Installation

```bash
# Core package (vanilla JS/TS)
npm install @augur-ai/analytics-core

# React package
npm install @augur-ai/analytics-react
```

### Usage

#### Core (Vanilla JS/TS)

```typescript
import { createAnalytics } from "@augur-ai/analytics-core";

const analytics = createAnalytics({
  writeKey: "your-write-key",
  endpoint: "https://your-backend.com/api/v1",
  feedId: "your-feed-id",
  batchSize: 10, // Optional: events per batch (default: 10)
  batchTimeout: 5000, // Optional: max wait time in ms (default: 5000)
  sessionTimeout: 30 * 60 * 1000, // Optional: session timeout (default: 30 minutes)
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
import { AugurProvider, useTrack, useDeviceInfo } from "@augur-ai/analytics-react";

function App() {
  return (
    <AugurProvider
      config={{
        writeKey: "your-write-key",
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

### 🎯 Industry-Standard Session Management
- **30-minute session timeout** (configurable)
- Sessions persist across page reloads via localStorage
- Session extends with each user activity
- Matches Amplitude/Google Analytics behavior

### 🚀 Automatic Batching & Retry Logic
- Configurable batch size and timeout
- 3 retry attempts with exponential backoff
- localStorage persistence for failed events
- Smart beacon strategy with fetch fallback

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
  writeKey: string; // Required: Your write key
  endpoint: string; // Required: Backend endpoint
  userId?: string; // Optional: User identifier
  sessionId?: string; // Optional: Custom session ID
  feedId?: string; // Optional: Feed ID for multi-feed setups
  batchSize?: number; // Optional: Events per batch (default: 10)
  batchTimeout?: number; // Optional: Max wait time in ms (default: 5000)
  sessionTimeout?: number; // Optional: Session timeout in ms (default: 30 minutes)
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
useAnalytics(); // Get analytics instance
useTrack(); // Track events
usePage(); // Track page views
useIdentify(); // Identify users
useAnalyticsSessionId(); // Get session ID with persistence
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
- [npm Package - Core](https://www.npmjs.com/package/@augur-ai/analytics-core)
- [npm Package - React](https://www.npmjs.com/package/@augur-ai/analytics-react)
