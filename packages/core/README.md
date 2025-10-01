# @augur-ai/analytics-core

Core analytics SDK with industry-standard session management, batching, retry logic, device detection, and localStorage persistence. Zero dependencies, works in any JavaScript environment.

## Installation

```bash
npm install @augur-ai/analytics-core
```

## Quick Start

```typescript
import { createAnalytics } from "@augur-ai/analytics-core";

const analytics = createAnalytics({
  writeKey: "your-write-key",
  endpoint: "https://your-backend.com/api/v1",
  feedId: "your-feed-id",
  sessionTimeout: 30 * 60 * 1000, // Optional: 30 minutes (default)
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

## API Reference

### Configuration

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

| Method            | Purpose                             | Parameters                                                                                           | Returns         |
| ----------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------- |
| `track()`         | Track custom events with properties | `event: string, properties?: object, feedId?: string, eventName?: string, eventDescription?: string` | `void`          |
| `page()`          | Track page views                    | `properties?: { path, url, title }`                                                                  | `void`          |
| `identify()`      | Identify users with traits          | `userId: string, traits?: object`                                                                    | `void`          |
| `alias()`         | Create user aliases                 | `newUserId: string, oldUserId?: string`                                                              | `void`          |
| `group()`         | Associate users with groups         | `groupId: string, traits?: object`                                                                   | `void`          |
| `screen()`        | Track screen views (mobile)         | `screenName: string, properties?: object`                                                            | `void`          |
| `timing()`        | Track timing events                 | `category: string, variable: string, value: number, label?: string`                                  | `void`          |
| `metric()`        | Track custom metrics                | `name: string, value: number, properties?: object`                                                   | `void`          |
| `flushQueue()`    | Manually flush event queue          | None                                                                                                 | `Promise<void>` |
| `getDeviceInfo()` | Get current device information      | None                                                                                                 | `DeviceInfo`    |
| `getSessionId()`  | Get current session ID              | None                                                                                                 | `string`        |
| `reset()`         | Reset user data and session         | None                                                                                                 | `void`          |

### Method Examples

```typescript
// Track events
analytics.track("button_clicked", { button_name: "signup" });
analytics.track(
  "purchase",
  { amount: 99.99, currency: "USD" },
  "ecommerce",
  "Purchase Completed",
  "User completed checkout"
);

// Page tracking
analytics.page({ path: "/dashboard", title: "Dashboard" });

// User management
analytics.identify("user123", { email: "user@example.com", plan: "premium" });
analytics.alias("user123", "anonymous456");
analytics.group("company456", { name: "Acme Corp", plan: "enterprise" });

// Mobile app tracking
analytics.screen("HomeScreen", { category: "navigation" });

// Performance tracking
analytics.timing("api", "response_time", 150, "user_profile");
analytics.metric("conversion_rate", 0.15, { campaign: "summer_sale" });

// Utility methods
await analytics.flushQueue();
const deviceInfo = analytics.getDeviceInfo();
const sessionId = analytics.getSessionId();
analytics.reset();
```

## Session Management

The SDK implements industry-standard session management:

```typescript
// Sessions persist for 30 minutes of inactivity
const analytics = createAnalytics({
  writeKey: "your-key",
  endpoint: "https://api.example.com",
  sessionTimeout: 30 * 60 * 1000, // 30 minutes (default)
});

// Get current session ID
const sessionId = analytics.getSessionId();
console.log(sessionId); // "sess-user123-1696180800000-a7x2k9m1p"

// Session automatically extends on each track call
analytics.track("user_activity"); // Extends session timeout
```

## Device Detection

Automatic device information is included in every event:

```typescript
const deviceInfo = analytics.getDeviceInfo();
console.log(deviceInfo);
// {
//   browser: { name: "Chrome", version: "119.0.0.0" },
//   os: { name: "macOS", version: "14.0" },
//   device: { type: "desktop" },
//   screen: { width: 1920, height: 1080, pixelRatio: 2 },
//   location: { country: "US", timezone: "America/New_York", language: "en-US" },
//   userAgent: "Mozilla/5.0..."
// }
```

## Error Handling

The SDK includes robust error handling:

```typescript
const analytics = createAnalytics({
  writeKey: "your-key",
  endpoint: "https://api.example.com",
  maxRetries: 3, // Retry failed requests 3 times
  enableLocalStorage: true, // Persist failed events
});

// Failed events are automatically:
// 1. Retried with exponential backoff
// 2. Saved to localStorage if all retries fail
// 3. Sent on next page load
```

## Bundle Size

- **Core**: ~11KB (zero dependencies)
- **Gzipped**: ~4KB

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import {
  createAnalytics,
  AugurConfig,
  DeviceInfo,
} from "@augur-ai/analytics-core";

const config: AugurConfig = {
  writeKey: "your-key",
  endpoint: "https://api.example.com",
  userId: "user123",
  debug: true,
};

const analytics = createAnalytics(config);
const deviceInfo: DeviceInfo = analytics.getDeviceInfo();
```

## License

MIT
