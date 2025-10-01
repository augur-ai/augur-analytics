/**
 * React hooks for Augur Analytics
 */

import { useCallback, useEffect, useRef } from "react";
import { useAugurContext } from "./context";

/**
 * Main hook to access Augur Analytics instance
 */
export function useAnalytics() {
  const { analytics } = useAugurContext();
  return analytics!;
}

/**
 * Hook to track events
 */
export function useTrack() {
  const analytics = useAnalytics();

  return useCallback(
    (
      event: string,
      properties?: Record<string, any>,
      feedId?: string,
      eventName?: string,
      eventDescription?: string
    ) => {
      return analytics.track(
        event,
        properties,
        feedId,
        eventName,
        eventDescription
      );
    },
    [analytics]
  );
}

/**
 * Hook to track page views
 */
export function usePage() {
  const analytics = useAnalytics();

  return useCallback(
    (properties?: {
      path?: string;
      url?: string;
      title?: string;
      properties?: Record<string, any>;
    }) => {
      return analytics.page(properties);
    },
    [analytics]
  );
}

/**
 * Hook to identify users
 */
export function useIdentify() {
  const analytics = useAnalytics();

  return useCallback(
    (userId: string, traits?: Record<string, any>) => {
      return analytics.identify(userId, traits);
    },
    [analytics]
  );
}

/**
 * Hook to alias users
 */
export function useAlias() {
  const analytics = useAnalytics();

  return useCallback(
    (newUserId: string, oldUserId?: string) => {
      return analytics.alias(newUserId, oldUserId);
    },
    [analytics]
  );
}

/**
 * Hook to track group associations
 */
export function useGroup() {
  const analytics = useAnalytics();

  return useCallback(
    (groupId: string, traits?: Record<string, any>) => {
      return analytics.group(groupId, traits);
    },
    [analytics]
  );
}

/**
 * Hook to track screen views
 */
export function useScreen() {
  const analytics = useAnalytics();

  return useCallback(
    (screenName: string, properties?: Record<string, any>) => {
      return analytics.screen(screenName, properties);
    },
    [analytics]
  );
}

/**
 * Hook to reset user data
 */
export function useReset() {
  const analytics = useAnalytics();

  return useCallback(() => {
    return analytics.reset();
  }, [analytics]);
}

/**
 * Hook to set user properties
 */
export function useSetUserProperties() {
  const analytics = useAnalytics();

  return useCallback(
    (properties: Record<string, any>) => {
      return analytics.setUserProperties(properties);
    },
    [analytics]
  );
}

/**
 * Hook to track timing events
 */
export function useTiming() {
  const analytics = useAnalytics();

  return useCallback(
    (category: string, variable: string, value: number, label?: string) => {
      return analytics.timing(category, variable, value, label);
    },
    [analytics]
  );
}

/**
 * Hook to track custom metrics
 */
export function useMetric() {
  const analytics = useAnalytics();

  return useCallback(
    (name: string, value: number, properties?: Record<string, any>) => {
      return analytics.metric(name, value, properties);
    },
    [analytics]
  );
}

/**
 * Hook to get session ID
 */
export function useAnalyticsSessionId() {
  const analytics = useAnalytics();
  return analytics.getSessionId();
}

/**
 * Hook to get current feed ID
 */
export function useFeedId() {
  const analytics = useAnalytics();
  return analytics.getFeedId();
}

/**
 * Hook to set feed ID for all future events
 */
export function useSetFeedId() {
  const analytics = useAnalytics();

  return useCallback(
    (feedId: string) => {
      analytics.setFeedId(feedId);
    },
    [analytics]
  );
}

/**
 * Hook to track events with feed ID override
 */
export function useTrackWithFeed() {
  const analytics = useAnalytics();

  return useCallback(
    (
      event: string,
      feedId: string,
      properties?: Record<string, any>,
      eventName?: string,
      eventDescription?: string
    ) => {
      return analytics.trackWithFeed(
        event,
        feedId,
        properties,
        eventName,
        eventDescription
      );
    },
    [analytics]
  );
}

/**
 * Hook to automatically track page views on route changes
 */
export function usePageTracking() {
  const trackPage = usePage();

  useEffect(() => {
    // Track initial page view
    trackPage();

    // Track page views on popstate (back/forward navigation)
    const handlePopState = () => {
      trackPage();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [trackPage]);
}

/**
 * Hook to track component mount/unmount
 */
export function useComponentTracking(
  componentName: string,
  properties?: Record<string, any>
) {
  const track = useTrack();

  useEffect(() => {
    track("component_mounted", {
      component: componentName,
      ...properties,
    });

    return () => {
      track("component_unmounted", {
        component: componentName,
        ...properties,
      });
    };
  }, [track, componentName, properties]);
}

/**
 * Hook to track user interactions with debouncing
 */
export function useInteractionTracking(
  eventName: string,
  debounceMs: number = 300,
  properties?: Record<string, any>
) {
  const track = useTrack();
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (interactionProperties?: Record<string, any>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        track(eventName, {
          ...properties,
          ...interactionProperties,
        });
      }, debounceMs);
    },
    [track, eventName, debounceMs, properties]
  );
}

/**
 * Hook to track form interactions
 */
export function useFormTracking(formName: string) {
  const track = useTrack();

  const trackFormStart = useCallback(() => {
    track("form_started", { form: formName });
  }, [track, formName]);

  const trackFormSubmit = useCallback(() => {
    track("form_submitted", { form: formName });
  }, [track, formName]);

  const trackFormError = useCallback(
    (error: string) => {
      track("form_error", { form: formName, error });
    },
    [track, formName]
  );

  const trackFormFieldChange = useCallback(
    (fieldName: string) => {
      track("form_field_changed", { form: formName, field: fieldName });
    },
    [track, formName]
  );

  return {
    trackFormStart,
    trackFormSubmit,
    trackFormError,
    trackFormFieldChange,
  };
}

/**
 * Hook to get device information
 */
export function useDeviceInfo() {
  const analytics = useAnalytics();
  return analytics.getDeviceInfo();
}
