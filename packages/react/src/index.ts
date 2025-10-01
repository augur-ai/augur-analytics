/**
 * Augur Analytics React SDK
 * Main entry point for React hooks and components
 */

export { AugurProvider, useAugurContext } from "./context";
export {
  useAnalytics,
  useTrack,
  usePage,
  useIdentify,
  useAlias,
  useGroup,
  useScreen,
  useReset,
  useSetUserProperties,
  useTiming,
  useMetric,
  useAnalyticsSessionId,
  useFeedId,
  useSetFeedId,
  useTrackWithFeed,
  usePageTracking,
  useComponentTracking,
  useInteractionTracking,
  useFormTracking,
  useDeviceInfo,
} from "./hooks";

// Re-export core types
export type {
  AugurConfig,
  AugurEvent,
  AugurPageEvent,
  AugurIdentifyEvent,
  DeviceInfo,
} from "@augur-ai/analytics-core";
