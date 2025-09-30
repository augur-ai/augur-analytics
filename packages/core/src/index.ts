/**
 * Augur Analytics Core SDK
 * Main entry point for the core analytics library
 */

export { default as Analytics, createAnalytics } from "./analytics";
export type {
  AugurConfig,
  AugurEvent,
  AugurPageEvent,
  AugurIdentifyEvent,
  DeviceInfo,
} from "./analytics";
