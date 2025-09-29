/**
 * Augur Analytics SDK
 * Main entry point for the Augur analytics library
 */

export { default as Analytics, createAnalytics } from "./analytics";
export type {
  AugurConfig,
  AugurEvent,
  AugurPageEvent,
  AugurIdentifyEvent,
} from "./analytics";
