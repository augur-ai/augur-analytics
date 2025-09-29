# @augur/analytics-react

React hooks and components for the Augur Analytics SDK. Provides a seamless React integration for tracking user interactions and correlating frontend events with backend traces.

## Installation

```bash
npm install @augur/analytics-react @augur/analytics-core
```

## Quick Start

### 1. Setup Provider

Wrap your app with the `AugurProvider`:

```tsx
import React from "react";
import { AugurProvider } from "@augur/analytics-react";

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
```

### 2. Use Hooks

```tsx
import React from "react";
import { useTrack, usePage, useIdentify } from "@augur/analytics-react";

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

function UserProfile() {
  const identify = useIdentify();

  useEffect(() => {
    identify("user123@example.com", {
      name: "John Doe",
      plan: "premium",
    });
  }, [identify]);

  return <div>User Profile</div>;
}
```

## Hooks Reference

### Core Hooks

#### `useAugur()`

Get the analytics instance directly.

```tsx
const analytics = useAugur();
await analytics.track("custom_event", { data: "value" });
```

#### `useTrack()`

Track custom events.

```tsx
const track = useTrack();

// Track button clicks
const handleClick = () => {
  track("button_clicked", { button_id: "summary-btn" });
};
```

#### `usePage()`

Track page views.

```tsx
const trackPage = usePage();

// Track page view
trackPage({ path: "/dashboard", title: "Dashboard" });
```

#### `useIdentify()`

Identify users.

```tsx
const identify = useIdentify();

// Identify user
identify("user123@example.com", {
  name: "John Doe",
  plan: "premium",
});
```

### Advanced Hooks

#### `usePageTracking()`

Automatically track page views on route changes.

```tsx
function App() {
  usePageTracking(); // Automatically tracks page views
  return <Router>{/* Your routes */}</Router>;
}
```

#### `useComponentTracking(componentName, properties?)`

Track component mount/unmount events.

```tsx
function SummaryWidget() {
  useComponentTracking("SummaryWidget", {
    widget_type: "ai_summary",
  });

  return <div>Summary Widget</div>;
}
```

#### `useInteractionTracking(eventName, debounceMs?, properties?)`

Track user interactions with debouncing.

```tsx
function SearchInput() {
  const trackSearch = useInteractionTracking("search_typed", 500, {
    component: "search_input",
  });

  const handleChange = (e) => {
    trackSearch({ query: e.target.value });
  };

  return <input onChange={handleChange} />;
}
```

#### `useFormTracking(formName)`

Track form interactions.

```tsx
function ContactForm() {
  const { trackFormStart, trackFormSubmit, trackFormError } =
    useFormTracking("contact_form");

  const handleSubmit = async (data) => {
    try {
      trackFormStart();
      await submitForm(data);
      trackFormSubmit();
    } catch (error) {
      trackFormError(error.message);
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

### Utility Hooks

#### `useSessionId()`

Get the current session ID.

```tsx
function DebugInfo() {
  const sessionId = useSessionId();
  return <div>Session: {sessionId}</div>;
}
```

#### `useTiming()`

Track timing events.

```tsx
const trackTiming = useTiming();

// Track API response time
const startTime = Date.now();
const response = await fetch("/api/data");
const duration = Date.now() - startTime;
trackTiming("api", "response_time", duration, "user_data");
```

#### `useMetric()`

Track custom metrics.

```tsx
const trackMetric = useMetric();

// Track conversion rate
trackMetric("conversion_rate", 0.15, {
  campaign: "summer_sale",
});
```

## Examples

### Complete App Setup

```tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  AugurProvider,
  usePageTracking,
  useTrack,
  useIdentify,
} from "@augur/analytics-react";

function App() {
  return (
    <AugurProvider
      config={{
        apiKey: process.env.REACT_APP_AUGUR_API_KEY,
        endpoint: process.env.REACT_APP_AUGUR_ENDPOINT,
        userId: getCurrentUser()?.id,
        debug: process.env.NODE_ENV === "development",
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AugurProvider>
  );
}

function HomePage() {
  usePageTracking(); // Auto-track page views
  const track = useTrack();

  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={() => track("cta_clicked", { cta: "get_started" })}>
        Get Started
      </button>
    </div>
  );
}

function Dashboard() {
  const identify = useIdentify();
  const track = useTrack();

  useEffect(() => {
    // Identify user when they access dashboard
    identify(getCurrentUser().id, {
      plan: getCurrentUser().plan,
      last_login: new Date().toISOString(),
    });
  }, [identify]);

  return (
    <div>
      <h1>Dashboard</h1>
      <button
        onClick={() =>
          track("summary_requested", {
            component: "dashboard_summary_btn",
          })
        }
      >
        Generate Summary
      </button>
    </div>
  );
}
```

### Error Tracking

```tsx
import { useTrack } from "@augur/analytics-react";

function ErrorBoundary({ children }) {
  const track = useTrack();

  useEffect(() => {
    const handleError = (error) => {
      track("error_occurred", {
        error_type: "javascript_error",
        error_message: error.message,
        error_stack: error.stack,
        page: window.location.pathname,
      });
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, [track]);

  return children;
}
```

### Performance Tracking

```tsx
import { useTiming, useMetric } from "@augur/analytics-react";

function DataLoader() {
  const trackTiming = useTiming();
  const trackMetric = useMetric();
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const startTime = Date.now();

      try {
        const response = await fetch("/api/data");
        const result = await response.json();

        const duration = Date.now() - startTime;
        trackTiming("api", "data_load", duration, "user_data");
        trackMetric("data_load_success", 1);

        setData(result);
      } catch (error) {
        trackMetric("data_load_error", 1);
        throw error;
      }
    };

    loadData();
  }, [trackTiming, trackMetric]);

  return <div>{data ? "Data loaded" : "Loading..."}</div>;
}
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```tsx
import { AugurConfig, AugurEvent } from "@augur/analytics-react";

const config: AugurConfig = {
  apiKey: "your-key",
  endpoint: "https://augur.com",
  userId: "user123",
  debug: true,
};
```

## Bundle Size

- **Core**: ~3KB (zero dependencies)
- **React**: ~2KB (depends on core)
- **Total**: ~5KB

## License

MIT
