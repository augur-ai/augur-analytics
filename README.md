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
  feedId: "550e8400-e29b-41d4-a716-446655440000", // Optional: specify analytics feed ID
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
        feedId: "550e8400-e29b-41d4-a716-446655440000", // Optional: specify analytics feed ID
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

- `track(event, properties?, feedId?)` - Track custom events
- `trackWithFeed(event, feedId, properties?)` - Track events with specific feed ID
- `setFeedId(feedId)` - Set feed ID for all future events
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
  feedId?: string; // Analytics feed ID (UUID format)
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
- `useFeedId()` - Get current feed ID
- `useSetFeedId()` - Set feed ID for all future events
- `useTrackWithFeed()` - Track events with feed ID override

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

- `POST /analytics/events` - Event ingestion

All events are stored in the `session_events` table with pg_mooncake columnstore for fast analytics.

## Analytics Feeds

Augur Analytics supports different feeds to organize and categorize your analytics data using UUID-based feed IDs:

### Setting Feed IDs

```typescript
// Core SDK
const analytics = createAnalytics({
  apiKey: "your-api-key",
  endpoint: "https://augur.com",
  feedId: "550e8400-e29b-41d4-a716-446655440000", // Specify the feed ID
});

// React
<AugurProvider
  config={{
    apiKey: "your-api-key",
    endpoint: "https://augur.com",
    feedId: "550e8400-e29b-41d4-a716-446655440000", // Specify the feed ID
  }}
>
  <YourApp />
</AugurProvider>;
```

### Feed Benefits

- **Data Organization**: Separate analytics by platform or use case
- **Filtering**: Query and analyze specific feed data
- **Rate Limiting**: Apply different rate limits per feed
- **Retention**: Set different data retention policies per feed
- **Access Control**: Control access to specific feeds

### API Payload Structure

The SDK sends events in the following format:

```json
{
  "feed_id": "550e8400-e29b-41d4-a716-446655440000",
  "session_id": "test_session_123",
  "event_name": "button_click",
  "properties": {
    "button": "summary",
    "component": "header",
    "user_id": "user_123"
  },
  "source": "frontend"
}
```

## Feed Switching

Augur Analytics supports both app-wide feed switching and per-event feed overrides:

### App-wide Feed Switching

Change the feed ID for all future events:

```typescript
// Core SDK
const analytics = createAnalytics({
  apiKey: "your-api-key",
  endpoint: "https://augur.com",
  feedId: "550e8400-e29b-41d4-a716-446655440000", // Initial feed
});

// Switch to a different feed for all future events
analytics.setFeedId("660e8400-e29b-41d4-a716-446655440001");

// All subsequent events will use the new feed ID
await analytics.track("user_action", { action: "click" });
```

```tsx
// React
function MyComponent() {
  const setFeedId = useSetFeedId();
  const track = useTrack();

  const switchToMobileFeed = () => {
    setFeedId("660e8400-e29b-41d4-a716-446655440001");
    track("feed_switched", { new_feed: "mobile" });
  };

  return <button onClick={switchToMobileFeed}>Switch to Mobile Feed</button>;
}
```

### Per-event Feed Overrides

Override the feed ID for specific events:

```typescript
// Core SDK
const analytics = createAnalytics({
  apiKey: "your-api-key",
  endpoint: "https://augur.com",
  feedId: "550e8400-e29b-41d4-a716-446655440000", // Default feed
});

// Track event with specific feed ID override
await analytics.track(
  "special_event",
  { action: "premium_feature" },
  "660e8400-e29b-41d4-a716-446655440001" // Override feed ID
);

// Or use the convenience method
await analytics.trackWithFeed(
  "special_event",
  "660e8400-e29b-41d4-a716-446655440001",
  { action: "premium_feature" }
);
```

```tsx
// React
function SpecialComponent() {
  const trackWithFeed = useTrackWithFeed();
  const track = useTrack();

  const handleSpecialAction = () => {
    // This event goes to a specific feed
    trackWithFeed("premium_action", "660e8400-e29b-41d4-a716-446655440001", {
      feature: "advanced_analytics",
    });

    // This event goes to the default feed
    track("regular_action", { feature: "basic_analytics" });
  };

  return <button onClick={handleSpecialAction}>Special Action</button>;
}
```

### Use Cases

**Multi-tenant Applications:**

```typescript
// Switch feeds based on user organization
const switchToOrgFeed = (orgId: string) => {
  const feedId = getFeedIdForOrganization(orgId);
  analytics.setFeedId(feedId);
};
```

**A/B Testing:**

```typescript
// Send events to different feeds for A/B testing
const trackExperimentEvent = (variant: string) => {
  const feedId =
    variant === "A"
      ? "550e8400-e29b-41d4-a716-446655440000"
      : "660e8400-e29b-41d4-a716-446655440001";

  analytics.trackWithFeed("experiment_event", feedId, { variant });
};
```

**Feature Flags:**

```typescript
// Route events based on feature availability
const trackFeatureUsage = (feature: string) => {
  const feedId = isFeatureEnabled(feature)
    ? "enabled-features-feed"
    : "disabled-features-feed";

  analytics.trackWithFeed("feature_used", feedId, { feature });
};
```

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
