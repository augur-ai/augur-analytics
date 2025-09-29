# Augur Analytics SDK

A lightweight, zero-dependency TypeScript SDK for tracking frontend events and correlating them with backend traces in Augur. Available as both a core library and React hooks.

## Packages

- **`@augur/analytics-core`** - Core SDK with zero dependencies
- **`@augur/analytics-react`** - React hooks and components

## Installation

### Core SDK Only

```bash
npm install @augur/analytics-core
```

### React Integration

```bash
npm install @augur/analytics-react @augur/analytics-core
```

## Quick Start

### Core SDK

```typescript
import { createAnalytics } from "@augur/analytics-core";

const analytics = createAnalytics({
  apiKey: "your-augur-api-key",
  endpoint: "https://augur.com",
  userId: "user123@example.com",
  debug: true,
});

// Track events
await analytics.track("button_clicked", {
  button_id: "summary-btn",
  page: "/dashboard",
});

// Track page views
await analytics.page();

// Identify users
await analytics.identify("user123@example.com", {
  name: "John Doe",
  plan: "premium",
});
```

### React Integration

```tsx
import React from "react";
import { AugurProvider, useTrack } from "@augur/analytics-react";

function App() {
  return (
    <AugurProvider
      config={{
        apiKey: "your-augur-api-key",
        endpoint: "https://augur.com",
        userId: "user123@example.com",
        debug: true,
      }}
    >
      <YourApp />
    </AugurProvider>
  );
}

function SummaryButton() {
  const track = useTrack();

  const handleClick = () => {
    track("summary_requested", {
      component: "summary_button",
      action: "click",
    });
  };

  return <button onClick={handleClick}>Get Summary</button>;
}
```

## Features

- **Zero Dependencies**: Core SDK has no external dependencies
- **Tiny Bundle**: ~3KB core, ~5KB with React
- **Session Correlation**: Automatic session ID generation and correlation
- **Auto-injection**: Automatically injects session ID into all API requests
- **Beacon API**: Reliable event delivery with fetch fallback
- **TypeScript Support**: Full type definitions
- **React Hooks**: Comprehensive React integration
- **Standard Analytics API**: Compatible with popular analytics patterns

## Core SDK API

### Methods

- `track(event, properties?)` - Track custom events
- `page(properties?)` - Track page views
- `identify(userId, traits?)` - Identify users
- `alias(newUserId, oldUserId?)` - Alias users
- `group(groupId, traits?)` - Track group associations
- `screen(screenName, properties?)` - Track screen views
- `reset()` - Reset user data
- `setUserProperties(properties)` - Set user properties
- `timing(category, variable, value, label?)` - Track timing events
- `metric(name, value, properties?)` - Track custom metrics

### Configuration

```typescript
interface AugurConfig {
  apiKey: string; // Your Augur API key
  endpoint: string; // Augur API endpoint URL
  userId?: string; // User identifier for session correlation
  sessionId?: string; // Custom session ID (auto-generated if not provided)
  debug?: boolean; // Enable debug logging (default: false)
}
```

## React Hooks

### Core Hooks

- `useAugur()` - Get analytics instance
- `useTrack()` - Track custom events
- `usePage()` - Track page views
- `useIdentify()` - Identify users
- `useAlias()` - Alias users
- `useGroup()` - Track group associations
- `useScreen()` - Track screen views
- `useReset()` - Reset user data
- `useSetUserProperties()` - Set user properties
- `useTiming()` - Track timing events
- `useMetric()` - Track custom metrics
- `useSessionId()` - Get session ID

### Advanced Hooks

- `usePageTracking()` - Auto-track page views on route changes
- `useComponentTracking(componentName, properties?)` - Track component mount/unmount
- `useInteractionTracking(eventName, debounceMs?, properties?)` - Track interactions with debouncing
- `useFormTracking(formName)` - Track form interactions

## Session Management

### Session ID Format

Session IDs follow the format: `sess-{userId}-{timestamp}-{random}`

Example: `sess-user123-1703123456789-abc123def`

### Auto-injection

The SDK automatically injects the session ID into all `fetch` requests via the `X-Augur-Session-ID` header.

### Event Properties

All events automatically include:

- `session_id`: Current session identifier
- `user_id`: User identifier (if provided)
- `timestamp`: Event timestamp in ISO format

## Backend Integration

The SDK sends events to the following Augur endpoints:

- `POST /api/v1/session-events/events` - Event ingestion

All events are stored in the `session_events` table with pg_mooncake columnstore for fast analytics.

## Bundle Size

- **Core**: ~3KB minified, ~1.2KB gzipped
- **React**: ~2KB minified, ~0.8KB gzipped
- **Total**: ~5KB minified, ~2KB gzipped
- **Dependencies**: 0 (core), React peer dependency (React package)

## Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Watch mode
npm run dev

# Test
npm test

# Clean
npm run clean
```

## Examples

See the `packages/react/example/` directory for a complete React example.

## License

MIT
