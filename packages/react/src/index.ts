/**
 * Augur Analytics React SDK
 * Main entry point for React hooks and components
 */

export { AugurProvider, useAugurContext } from "./context";
export {
  useAugur,
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
  useSessionId,
  usePageTracking,
  useComponentTracking,
  useInteractionTracking,
  useFormTracking,
} from "./hooks";

// Re-export core types
export type {
  AugurConfig,
  AugurEvent,
  AugurPageEvent,
  AugurIdentifyEvent,
} from "@augur/analytics-core";
