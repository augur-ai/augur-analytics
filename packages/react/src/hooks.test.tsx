/**
 * Unit tests for Augur Analytics React Hooks
 */

import React from "react";
import { renderHook, act } from "@testing-library/react";
import { AugurProvider } from "./context";
import {
  useTrack,
  usePage,
  useIdentify,
  useDeviceInfo,
  useSessionId,
  useFeedId,
  useSetFeedId,
} from "./hooks";

// Mock the core analytics
jest.mock("@augur-ai/analytics-core", () => ({
  createAnalytics: jest.fn(() => ({
    track: jest.fn(),
    page: jest.fn(),
    identify: jest.fn(),
    alias: jest.fn(),
    group: jest.fn(),
    screen: jest.fn(),
    reset: jest.fn(),
    setUserProperties: jest.fn(),
    timing: jest.fn(),
    metric: jest.fn(),
    getSessionId: jest.fn(() => "test-session-id"),
    getFeedId: jest.fn(() => "test-feed-id"),
    setFeedId: jest.fn(),
    trackWithFeed: jest.fn(),
    getDeviceInfo: jest.fn(() => ({
      browser: { name: "Chrome", version: "120.0" },
      os: { name: "macOS", version: "14.0" },
      device: { type: "desktop" },
      screen: { width: 1920, height: 1080, pixelRatio: 2 },
      location: {
        country: "US",
        timezone: "America/New_York",
        language: "en-US",
      },
      userAgent: "Mozilla/5.0...",
    })),
  })),
  Analytics: class MockAnalytics {},
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AugurProvider
    config={{
      writeKey: "test-write-key",
      endpoint: "https://test.com/api/v1",
    }}
  >
    {children}
  </AugurProvider>
);

describe("React Hooks", () => {
  describe("useTrack", () => {
    it("should return track function", () => {
      const { result } = renderHook(() => useTrack(), { wrapper });
      expect(typeof result.current).toBe("function");
    });

    it("should track events", () => {
      const { result } = renderHook(() => useTrack(), { wrapper });

      act(() => {
        result.current("test_event", { data: "test" });
      });

      expect(result.current).toBeDefined();
    });
  });

  describe("usePage", () => {
    it("should return page function", () => {
      const { result } = renderHook(() => usePage(), { wrapper });
      expect(typeof result.current).toBe("function");
    });

    it("should track page views", async () => {
      const { result } = renderHook(() => usePage(), { wrapper });

      await act(async () => {
        await result.current({ path: "/test", title: "Test Page" });
      });

      expect(result.current).toBeDefined();
    });
  });

  describe("useIdentify", () => {
    it("should return identify function", () => {
      const { result } = renderHook(() => useIdentify(), { wrapper });
      expect(typeof result.current).toBe("function");
    });

    it("should identify users", async () => {
      const { result } = renderHook(() => useIdentify(), { wrapper });

      await act(async () => {
        await result.current("user-123", { name: "Test User" });
      });

      expect(result.current).toBeDefined();
    });
  });

  describe("useDeviceInfo", () => {
    it("should return device information", () => {
      const { result } = renderHook(() => useDeviceInfo(), { wrapper });

      expect(result.current).toHaveProperty("browser");
      expect(result.current).toHaveProperty("os");
      expect(result.current).toHaveProperty("device");
      expect(result.current).toHaveProperty("screen");
      expect(result.current).toHaveProperty("location");
    });

    it("should have correct browser info", () => {
      const { result } = renderHook(() => useDeviceInfo(), { wrapper });

      expect(result.current.browser.name).toBe("Chrome");
      expect(result.current.browser.version).toBe("120.0");
    });

    it("should have correct device type", () => {
      const { result } = renderHook(() => useDeviceInfo(), { wrapper });

      expect(result.current.device.type).toBe("desktop");
    });
  });

  describe("useSessionId", () => {
    it("should return session ID", () => {
      const { result } = renderHook(() => useSessionId(), { wrapper });

      expect(result.current).toBe("test-session-id");
    });
  });

  describe("useFeedId", () => {
    it("should return feed ID", () => {
      const { result } = renderHook(() => useFeedId(), { wrapper });

      expect(result.current).toBe("test-feed-id");
    });
  });

  describe("useSetFeedId", () => {
    it("should return setFeedId function", () => {
      const { result } = renderHook(() => useSetFeedId(), { wrapper });

      expect(typeof result.current).toBe("function");
    });

    it("should set feed ID", () => {
      const { result } = renderHook(() => useSetFeedId(), { wrapper });

      act(() => {
        result.current("new-feed-id");
      });

      expect(result.current).toBeDefined();
    });
  });

  describe("Provider Error Handling", () => {
    it("should throw error when hooks used outside provider", () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useTrack());
      }).toThrow("useAugur must be used within an AugurProvider");

      console.error = originalError;
    });
  });
});
