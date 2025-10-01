# @augur-ai/analytics-react

React hooks and components for the Augur Analytics SDK. Provides a seamless React integration for tracking user interactions and correlating frontend events with backend traces.

## Installation

```bash
npm install @augur-ai/analytics-react
```

## Quick Start

### 1. Setup Provider

Wrap your app with the `AugurProvider`:

```tsx
import React from "react";
import { AugurProvider } from "@augur-ai/analytics-react";

function App() {
  return (
    <AugurProvider
      config={{
        writeKey: "your-augur-write-key",
        endpoint: "https://augur.com/api/v1",
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
import { useTrack, usePage, useIdentify } from "@augur-ai/analytics-react";

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

| Hook                      | Purpose                                    | Returns                                        | Auto-cleanup |
| ------------------------- | ------------------------------------------ | ---------------------------------------------- | ------------ |
| `useAnalytics()`          | Get analytics instance for manual tracking | `AugurAnalytics`                               | ❌           |
| `useTrack()`              | Track events with automatic cleanup        | `(event: string, properties?: object) => void` | ✅           |
| `usePage()`               | Track page views with automatic cleanup    | `(properties?: object) => void`                | ✅           |
| `useIdentify()`           | Identify users with automatic cleanup      | `(userId: string, traits?: object) => void`    | ✅           |
| `useAnalyticsSessionId()` | Get current session ID                     | `string`                                       | ❌           |

#### Hook Examples

```tsx
// useAnalytics() - Manual control
const analytics = useAnalytics();
const handleComplexEvent = () => {
  analytics.track(
    "purchase",
    { amount: 99.99 },
    "ecommerce",
    "Purchase Completed",
    "User completed checkout"
  );
  analytics.timing("checkout", "duration", 1200);
  analytics.metric("conversion_rate", 0.15);
};

// useTrack() - Event tracking
const track = useTrack();
const handleClick = () => {
  track("button_clicked", { button_id: "summary-btn" });
};

// usePage() - Page views
const trackPage = usePage();
trackPage({ path: "/dashboard", title: "Dashboard" });

// useIdentify() - User identification
const identify = useIdentify();
identify("user123@example.com", {
  name: "John Doe",
  plan: "premium",
});

// useAnalyticsSessionId() - Session management
const sessionId = useAnalyticsSessionId();
console.log("Current session:", sessionId); // "sess-user123-1696180800000-a7x2k9m1p"
```

### Advanced Hooks

| Hook                       | Purpose                                 | Parameters                                                    | Auto-cleanup |
| -------------------------- | --------------------------------------- | ------------------------------------------------------------- | ------------ |
| `usePageTracking()`        | Auto-track page views on route changes  | None                                                          | ✅           |
| `useComponentTracking()`   | Track component mount/unmount events    | `componentName: string, properties?: object`                  | ✅           |
| `useInteractionTracking()` | Track user interactions with debouncing | `eventName: string, debounceMs?: number, properties?: object` | ✅           |
| `useFormTracking()`        | Track form interactions                 | `formName: string`                                            | ✅           |
| `useTiming()`              | Track timing events                     | None                                                          | ✅           |
| `useMetric()`              | Track custom metrics                    | None                                                          | ✅           |

#### Advanced Hook Examples

```tsx
// usePageTracking() - Auto page tracking
function App() {
  usePageTracking(); // Automatically tracks page views
  return <Router>{/* Your routes */}</Router>;
}

// useComponentTracking() - Component lifecycle
function SummaryWidget() {
  useComponentTracking("SummaryWidget", {
    widget_type: "ai_summary",
  });
  return <div>Summary Widget</div>;
}

// useInteractionTracking() - Debounced interactions
function SearchInput() {
  const trackSearch = useInteractionTracking("search_typed", 500, {
    component: "search_input",
  });

  const handleChange = (e) => {
    trackSearch({ query: e.target.value });
  };

  return <input onChange={handleChange} />;
}

// useFormTracking() - Form interactions
function ContactForm() {
  const trackForm = useFormTracking("contact_form");

  const handleSubmit = (formData) => {
    trackForm("form_submitted", { fields: Object.keys(formData) });
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}

// useTiming() - Performance tracking
const trackTiming = useTiming();
const fetchData = async () => {
  const start = Date.now();
  const data = await api.getData();
  trackTiming("api", "response_time", Date.now() - start, "user_profile");
};

// useMetric() - Custom metrics
const trackMetric = useMetric();
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
        writeKey: process.env.REACT_APP_AUGUR_WRITE_KEY,
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
import { useTrack } from "@augur-ai/analytics-react";

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
import { useTiming, useMetric } from "@augur-ai/analytics-react";

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
import { AugurConfig, AugurEvent } from "@augur-ai/analytics-react";

const config: AugurConfig = {
  writeKey: "your-key",
  endpoint: "https://augur.com/api/v1",
  userId: "user123",
  debug: true,
};
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

- Automatic browser, OS, and device type detection
- Screen resolution and pixel ratio
- Timezone and language detection

## Bundle Size

- **Core**: ~11KB (zero dependencies)
- **React**: ~8KB (depends on core)
- **Total**: ~19KB

## License

MIT
