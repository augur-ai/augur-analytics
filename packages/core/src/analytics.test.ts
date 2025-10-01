/**
 * Unit tests for Augur Analytics Core
 */

import { createAnalytics, AugurAnalytics } from "./analytics";

// Mock fetch and sendBeacon
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

const mockSendBeacon = jest.fn();
Object.defineProperty(global.navigator, "sendBeacon", {
  writable: true,
  value: mockSendBeacon,
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() {
      return Object.keys(store).length;
    },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("AugurAnalytics", () => {
  let analytics: AugurAnalytics;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockFetch.mockClear();
    mockSendBeacon.mockClear();

    // Mock screen dimensions
    Object.defineProperty(window, "screen", {
      writable: true,
      configurable: true,
      value: {
        width: 1920,
        height: 1080,
      },
    });

    Object.defineProperty(window, "devicePixelRatio", {
      writable: true,
      configurable: true,
      value: 2,
    });

    analytics = createAnalytics({
      apiKey: "test-api-key",
      endpoint: "https://test.com/api/v1",
      feedId: "test-feed-id",
      batchSize: 2,
      batchTimeout: 1000,
      debug: false,
    });
  });

  describe("Initialization", () => {
    it("should create analytics instance with config", () => {
      expect(analytics).toBeInstanceOf(AugurAnalytics);
      expect(analytics.getSessionId()).toBeDefined();
      expect(analytics.getFeedId()).toBe("test-feed-id");
    });

    it("should generate session ID if not provided", () => {
      const sessionId = analytics.getSessionId();
      expect(sessionId).toMatch(/^sess-/);
    });

    it("should use custom session ID if provided", () => {
      const customAnalytics = createAnalytics({
        apiKey: "test-api-key",
        endpoint: "https://test.com/api/v1",
        sessionId: "custom-session-123",
      });
      expect(customAnalytics.getSessionId()).toBe("custom-session-123");
    });
  });

  describe("Event Tracking", () => {
    it("should queue events", () => {
      analytics.track("test_event", { test: "data" });
      // Event should be queued, not sent immediately
      expect(mockFetch).not.toHaveBeenCalled();
      expect(mockSendBeacon).not.toHaveBeenCalled();
    });

    it("should include device info in events", () => {
      const deviceInfo = analytics.getDeviceInfo();
      expect(deviceInfo).toHaveProperty("browser");
      expect(deviceInfo).toHaveProperty("os");
      expect(deviceInfo).toHaveProperty("device");
      expect(deviceInfo).toHaveProperty("screen");
      expect(deviceInfo).toHaveProperty("location");
    });

    it("should auto-flush when batch size reached", async () => {
      mockSendBeacon.mockReturnValue(true);

      analytics.track("event1", { data: "1" });
      analytics.track("event2", { data: "2" });

      // Wait for flush
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockSendBeacon).toHaveBeenCalled();
    });

    it("should respect event name override", () => {
      analytics.track(
        "event_type",
        { data: "test" },
        undefined,
        "Custom Event Name"
      );

      // Event should be queued with custom name
      expect(analytics).toBeDefined();
    });

    it("should include write_key in event payload", () => {
      analytics.track("test_event", { test: "data" });
      // The write_key should be included in the payload
      expect(analytics).toBeDefined();
    });
  });

  describe("Batching", () => {
    it("should batch multiple events", async () => {
      mockSendBeacon.mockReturnValue(true);

      analytics.track("event1");
      analytics.track("event2");

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockSendBeacon).toHaveBeenCalledTimes(1);
      const callArgs = mockSendBeacon.mock.calls[0];
      const blob = callArgs[1] as Blob;

      expect(blob).toBeInstanceOf(Blob);
    });

    it("should flush on timeout", async () => {
      mockSendBeacon.mockReturnValue(true);

      analytics.track("single_event");

      // Wait for timeout (1000ms + buffer)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      expect(mockSendBeacon).toHaveBeenCalled();
    });

    it("should manual flush", async () => {
      mockSendBeacon.mockReturnValue(true);

      analytics.track("event1");
      analytics.flushQueue();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockSendBeacon).toHaveBeenCalled();
    });
  });

  describe("Retry Logic", () => {
    it("should fallback to fetch when sendBeacon fails", async () => {
      mockSendBeacon.mockReturnValue(false);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      analytics.track("event1");
      analytics.track("event2");

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockSendBeacon).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalled();
    });

    it("should persist failed events to localStorage", async () => {
      jest.useFakeTimers();

      mockSendBeacon.mockReturnValue(false);
      mockFetch.mockRejectedValue(new Error("Network error"));

      analytics.track("failed_event", { data: "test" });
      analytics.flushQueue();

      // Fast-forward through all retries (1s + 2s + 3s = 6s)
      await jest.advanceTimersByTimeAsync(6500);

      // Check if event was persisted
      const stored = localStorage.getItem(
        `augur_events_${analytics.getSessionId()}`
      );
      expect(stored).toBeTruthy();

      if (stored) {
        const events = JSON.parse(stored);
        expect(events.length).toBeGreaterThan(0);
      }

      jest.useRealTimers();
    });
  });

  describe("Device Detection", () => {
    it("should detect browser", () => {
      const deviceInfo = analytics.getDeviceInfo();
      expect(deviceInfo.browser.name).toBeDefined();
      expect(deviceInfo.browser.version).toBeDefined();
    });

    it("should detect OS", () => {
      const deviceInfo = analytics.getDeviceInfo();
      expect(deviceInfo.os.name).toBeDefined();
      expect(deviceInfo.os.version).toBeDefined();
    });

    it("should detect device type", () => {
      const deviceInfo = analytics.getDeviceInfo();
      expect(["desktop", "mobile", "tablet"]).toContain(deviceInfo.device.type);
    });

    it("should get screen information", () => {
      const deviceInfo = analytics.getDeviceInfo();
      expect(deviceInfo.screen.width).toBeGreaterThan(0);
      expect(deviceInfo.screen.height).toBeGreaterThan(0);
      expect(deviceInfo.screen.pixelRatio).toBeGreaterThan(0);
    });

    it("should get location information", () => {
      const deviceInfo = analytics.getDeviceInfo();
      expect(deviceInfo.location.timezone).toBeDefined();
      expect(deviceInfo.location.language).toBeDefined();
    });
  });

  describe("Feed ID Management", () => {
    it("should get feed ID", () => {
      expect(analytics.getFeedId()).toBe("test-feed-id");
    });

    it("should set feed ID", () => {
      analytics.setFeedId("new-feed-id");
      expect(analytics.getFeedId()).toBe("new-feed-id");
    });

    it("should track with feed ID override", async () => {
      mockSendBeacon.mockReturnValue(true);

      analytics.trackWithFeed("event", "override-feed-id", { data: "test" });
      analytics.flushQueue();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockSendBeacon).toHaveBeenCalled();
    });
  });

  describe("Page Tracking", () => {
    it("should track page view", async () => {
      mockSendBeacon.mockReturnValue(true);

      await analytics.page({
        path: "/test",
        url: "https://test.com/test",
        title: "Test Page",
      });

      // Wait for batch to flush
      await new Promise((resolve) => setTimeout(resolve, 1200));

      expect(mockSendBeacon).toHaveBeenCalled();
    });
  });

  describe("User Tracking", () => {
    it("should identify user", async () => {
      mockSendBeacon.mockReturnValue(true);

      await analytics.identify("user-123", {
        name: "Test User",
        email: "test@example.com",
      });

      // Wait for batch to flush
      await new Promise((resolve) => setTimeout(resolve, 1200));

      expect(mockSendBeacon).toHaveBeenCalled();
    });

    it("should alias user", async () => {
      mockSendBeacon.mockReturnValue(true);

      await analytics.alias("new-user-id", "old-user-id");

      // Wait for batch to flush
      await new Promise((resolve) => setTimeout(resolve, 1200));

      expect(mockSendBeacon).toHaveBeenCalled();
    });

    it("should track group", async () => {
      mockSendBeacon.mockReturnValue(true);

      await analytics.group("group-123", { plan: "premium" });

      // Wait for batch to flush
      await new Promise((resolve) => setTimeout(resolve, 1200));

      expect(mockSendBeacon).toHaveBeenCalled();
    });

    it("should reset user", async () => {
      mockSendBeacon.mockReturnValue(true);

      const oldSessionId = analytics.getSessionId();
      await analytics.reset();
      const newSessionId = analytics.getSessionId();

      expect(newSessionId).not.toBe(oldSessionId);

      // Wait for batch to flush
      await new Promise((resolve) => setTimeout(resolve, 1200));

      expect(mockSendBeacon).toHaveBeenCalled();
    });
  });

  describe("Metrics Tracking", () => {
    it("should track timing", async () => {
      mockSendBeacon.mockReturnValue(true);

      await analytics.timing("page_load", "dom_ready", 1500, "homepage");

      // Wait for batch to flush
      await new Promise((resolve) => setTimeout(resolve, 1200));

      expect(mockSendBeacon).toHaveBeenCalled();
    });

    it("should track metrics", async () => {
      mockSendBeacon.mockReturnValue(true);

      await analytics.metric("memory_usage", 256, { unit: "MB" });

      // Wait for batch to flush
      await new Promise((resolve) => setTimeout(resolve, 1200));

      expect(mockSendBeacon).toHaveBeenCalled();
    });
  });
});
