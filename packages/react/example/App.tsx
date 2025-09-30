/**
 * Example React App using Augur Analytics
 */

import React, { useEffect } from "react";
import {
  AugurProvider,
  useTrack,
  usePage,
  useIdentify,
  usePageTracking,
  useComponentTracking,
  useFormTracking,
  useInteractionTracking,
  useFeedId,
  useSetFeedId,
  useTrackWithFeed,
  useSessionId,
} from "@augur/analytics-react";

// Example components
function SummaryButton() {
  const track = useTrack();

  const handleClick = () => {
    track("summary_requested", {
      component: "summary_button",
      action: "click",
      page: window.location.pathname,
    });
  };

  return (
    <button
      onClick={handleClick}
      style={{ padding: "10px 20px", margin: "10px" }}
    >
      Generate Summary
    </button>
  );
}

function UserProfile() {
  const identify = useIdentify();

  useEffect(() => {
    // Simulate user identification
    identify("user123@example.com", {
      name: "John Doe",
      email: "user123@example.com",
      plan: "premium",
      signup_date: "2024-01-01",
    });
  }, [identify]);

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", margin: "10px" }}>
      <h3>User Profile</h3>
      <p>User identified and tracked</p>
    </div>
  );
}

function SearchInput() {
  const trackSearch = useInteractionTracking("search_typed", 500, {
    component: "search_input",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    trackSearch({
      query: e.target.value,
      query_length: e.target.value.length,
    });
  };

  return (
    <input
      type="text"
      placeholder="Search..."
      onChange={handleChange}
      style={{ padding: "10px", margin: "10px", width: "200px" }}
    />
  );
}

function ContactForm() {
  const {
    trackFormStart,
    trackFormSubmit,
    trackFormError,
    trackFormFieldChange,
  } = useFormTracking("contact_form");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      trackFormStart();

      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

      trackFormSubmit();
      alert("Form submitted successfully!");
    } catch (error) {
      trackFormError("Submission failed");
    }
  };

  const handleFieldChange = (fieldName: string) => {
    trackFormFieldChange(fieldName);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ padding: "20px", border: "1px solid #ccc", margin: "10px" }}
    >
      <h3>Contact Form</h3>
      <div>
        <input
          type="text"
          placeholder="Name"
          onChange={() => handleFieldChange("name")}
          style={{ padding: "5px", margin: "5px", width: "200px" }}
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="Email"
          onChange={() => handleFieldChange("email")}
          style={{ padding: "5px", margin: "5px", width: "200px" }}
        />
      </div>
      <div>
        <textarea
          placeholder="Message"
          onChange={() => handleFieldChange("message")}
          style={{
            padding: "5px",
            margin: "5px",
            width: "200px",
            height: "100px",
          }}
        />
      </div>
      <button type="submit" style={{ padding: "10px 20px", margin: "10px" }}>
        Submit
      </button>
    </form>
  );
}

function TrackedComponent() {
  useComponentTracking("TrackedComponent", {
    component_type: "demo",
    version: "1.0.0",
  });

  return (
    <div
      style={{ padding: "20px", border: "1px solid #green", margin: "10px" }}
    >
      <h3>Tracked Component</h3>
      <p>This component is being tracked for mount/unmount events</p>
    </div>
  );
}

function AnalyticsInfo() {
  const feedId = useFeedId();
  const sessionId = useSessionId();

  return (
    <div style={{ padding: "20px", border: "1px solid #blue", margin: "10px" }}>
      <h3>Analytics Info</h3>
      <p>
        <strong>Feed ID:</strong> {feedId || "Not set"}
      </p>
      <p>
        <strong>Session ID:</strong> {sessionId}
      </p>
    </div>
  );
}

function FeedSwitcher() {
  const setFeedId = useSetFeedId();
  const track = useTrack();
  const feedId = useFeedId();

  const switchToMobileFeed = () => {
    setFeedId("660e8400-e29b-41d4-a716-446655440001");
    track("feed_switched", { new_feed: "mobile" });
  };

  const switchToWebFeed = () => {
    setFeedId("550e8400-e29b-41d4-a716-446655440000");
    track("feed_switched", { new_feed: "web" });
  };

  return (
    <div
      style={{ padding: "20px", border: "1px solid #green", margin: "10px" }}
    >
      <h3>Feed Switcher</h3>
      <p>Current Feed: {feedId || "Not set"}</p>
      <button onClick={switchToWebFeed} style={{ margin: "5px" }}>
        Switch to Web Feed
      </button>
      <button onClick={switchToMobileFeed} style={{ margin: "5px" }}>
        Switch to Mobile Feed
      </button>
    </div>
  );
}

function SpecialEventTracker() {
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

  return (
    <div
      style={{ padding: "20px", border: "1px solid #orange", margin: "10px" }}
    >
      <h3>Special Event Tracker</h3>
      <p>This demonstrates per-event feed overrides</p>
      <button onClick={handleSpecialAction} style={{ padding: "10px 20px" }}>
        Track Special Action
      </button>
    </div>
  );
}

function HomePage() {
  usePageTracking(); // Auto-track page views
  const track = useTrack();

  const handleCustomEvent = () => {
    track("custom_event", {
      event_type: "demo",
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Augur Analytics React Example</h1>
      <p>This page demonstrates various tracking capabilities.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <AnalyticsInfo />
        <FeedSwitcher />
        <SpecialEventTracker />
        <SummaryButton />
        <UserProfile />
        <SearchInput />
        <ContactForm />
        <TrackedComponent />

        <button onClick={handleCustomEvent} style={{ padding: "10px 20px" }}>
          Track Custom Event
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <AugurProvider
      config={{
        apiKey: "demo-api-key",
        endpoint: "http://localhost:8000", // Your Augur backend
        userId: "demo-user@example.com",
        feedId: "550e8400-e29b-41d4-a716-446655440000", // Specify the analytics feed ID
        debug: true,
      }}
    >
      <HomePage />
    </AugurProvider>
  );
}

export default App;
