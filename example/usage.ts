/**
 * Example usage of Augur Analytics SDK
 */

import { createAnalytics } from "../src/analytics";

// Initialize analytics
const analytics = createAnalytics({
  apiKey: "your-augur-api-key",
  endpoint: "https://augur.com",
  userId: "user123@example.com",
  feedId: "550e8400-e29b-41d4-a716-446655440000", // Specify the analytics feed ID
  debug: true,
});

// Example: Track button clicks
document.getElementById("summary-btn")?.addEventListener("click", () => {
  analytics.track("summary_requested", {
    button_id: "summary-btn",
    page: window.location.pathname,
    user_action: "click",
  });
});

// Example: Track form submissions
document.getElementById("contact-form")?.addEventListener("submit", (event) => {
  analytics.track("form_submitted", {
    form_id: "contact-form",
    form_type: "contact",
    page: window.location.pathname,
  });
});

// Example: Track page views
analytics.page();

// Example: Track user identification
analytics.identify("user123@example.com", {
  name: "John Doe",
  email: "user123@example.com",
  plan: "premium",
});

// Example: Track user alias (when user changes identity)
analytics.alias("new-user-id", "old-user-id");

// Example: Track group association
analytics.group("team-123", {
  team_name: "Engineering",
  role: "developer",
});

// Example: Track screen view (for mobile apps)
analytics.screen("HomeScreen", {
  screen_category: "main",
});

// Example: Track timing events
analytics.timing("api", "response_time", 150, "user_data");

// Example: Track custom metrics
analytics.metric("conversion_rate", 0.15, {
  campaign: "summer_sale",
});

// Example: Set user properties
analytics.setUserProperties({
  subscription_status: "active",
  last_login: new Date().toISOString(),
});

// Example: Reset user data
analytics.reset();

// Example: Get session ID and feed ID for debugging
const sessionId = analytics.getSessionId();
const feedId = analytics.getFeedId();
console.log("Current session ID:", sessionId);
console.log("Current feed ID:", feedId);

// Example: Switch feed ID for all future events
analytics.setFeedId("660e8400-e29b-41d4-a716-446655440001");
console.log("Switched to new feed ID");

// Example: Track event with specific feed ID override
await analytics.track(
  "special_event",
  { action: "premium_feature" },
  "770e8400-e29b-41d4-a716-446655440002" // Override feed ID
);

// Example: Use convenience method for feed-specific tracking
await analytics.trackWithFeed(
  "experiment_event",
  "880e8400-e29b-41d4-a716-446655440003",
  { variant: "A" }
);

// Example: Track custom events with error handling
async function trackCustomEvent(
  eventName: string,
  properties: Record<string, any>
) {
  try {
    await analytics.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
    });
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}

// Usage examples
trackCustomEvent("feature_used", {
  feature: "ai_summary",
  context: "dashboard",
});

trackCustomEvent("error_occurred", {
  error_type: "api_error",
  error_message: "Failed to fetch data",
  component: "summary_widget",
});
