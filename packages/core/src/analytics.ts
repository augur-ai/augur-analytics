/**
 * Augur Analytics SDK - Core
 * Lightweight analytics library for session tracking and correlation
 */

export interface AugurConfig {
  apiKey: string;
  endpoint: string;
  userId?: string;
  sessionId?: string;
  debug?: boolean;
  feedId?: string; // Analytics feed ID (UUID format)
}

export interface AugurEvent {
  event: string;
  eventName?: string; // Optional event name, falls back to event if not provided
  eventDescription?: string; // Optional event description, defaults to empty string
  properties?: Record<string, any>;
  feedId?: string; // Optional feed ID override for this specific event
}

export interface AugurPageEvent {
  path?: string;
  url?: string;
  title?: string;
  properties?: Record<string, any>;
}

export interface AugurIdentifyEvent {
  userId: string;
  traits?: Record<string, any>;
}

export interface DeviceInfo {
  browser: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
  device: {
    type: "desktop" | "mobile" | "tablet";
    model?: string;
  };
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
  };
  location: {
    country?: string;
    timezone: string;
    language: string;
  };
  userAgent: string;
}

export class AugurAnalytics {
  private sessionId: string;
  private userId?: string;
  private apiKey: string;
  private endpoint: string;
  private debug: boolean;
  private feedId?: string;

  constructor(config: AugurConfig) {
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint;
    this.userId = config.userId;
    this.debug = config.debug || false;
    this.feedId = config.feedId;
    this.sessionId = config.sessionId || this.generateSessionId();

    this.log("Augur Analytics initialized", {
      sessionId: this.sessionId,
      feedId: this.feedId,
    });
    this.setupAutoInjection();
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const userId = this.userId ? this.userId.split("@")[0] : "anonymous";
    return `sess-${userId}-${timestamp}-${random}`;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get current feed ID
   */
  getFeedId(): string | undefined {
    return this.feedId;
  }

  /**
   * Set feed ID for all future events
   */
  setFeedId(feedId: string): void {
    this.feedId = feedId;
    this.log("Feed ID updated", { feedId: this.feedId });
  }

  /**
   * Track an event with a specific feed ID (overrides global feed ID)
   */
  async trackWithFeed(
    event: string,
    feedId: string,
    properties?: Record<string, any>,
    eventName?: string,
    eventDescription?: string
  ): Promise<void> {
    return this.track(event, properties, feedId, eventName, eventDescription);
  }

  /**
   * Track a custom event
   */
  async track(
    event: string,
    properties?: Record<string, any>,
    feedId?: string,
    eventName?: string,
    eventDescription?: string
  ): Promise<void> {
    const deviceInfo = this.getDeviceInfo();
    const eventData: AugurEvent = {
      event,
      eventName,
      eventDescription,
      properties: {
        ...properties,
        session_id: this.sessionId,
        user_id: this.userId,
        timestamp: new Date().toISOString(),
        device_info: deviceInfo,
      },
    };

    // Add feed ID override if provided
    if (feedId) {
      eventData.feedId = feedId;
    }

    this.log("Tracking event", eventData);

    try {
      await this.sendEvent(eventData);
    } catch (error) {
      this.log("Error tracking event", error);
      throw error;
    }
  }

  /**
   * Track page view
   */
  async page(properties?: AugurPageEvent): Promise<void> {
    const pageData = {
      path: properties?.path || window.location.pathname,
      url: properties?.url || window.location.href,
      title: properties?.title || document.title,
      ...properties,
    };

    return this.track("page_view", pageData);
  }

  /**
   * Identify user
   */
  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    this.userId = userId;
    return this.track("user_identified", {
      user_id: userId,
      traits,
    });
  }

  /**
   * Alias user (for when user changes identity)
   */
  async alias(newUserId: string, oldUserId?: string): Promise<void> {
    return this.track("user_aliased", {
      new_user_id: newUserId,
      old_user_id: oldUserId || this.userId,
    });
  }

  /**
   * Track group association
   */
  async group(groupId: string, traits?: Record<string, any>): Promise<void> {
    return this.track("group_associated", {
      group_id: groupId,
      traits,
    });
  }

  /**
   * Track screen view (for mobile apps)
   */
  async screen(
    screenName: string,
    properties?: Record<string, any>
  ): Promise<void> {
    return this.track("screen_view", {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Track reset (clear user data)
   */
  async reset(): Promise<void> {
    this.userId = undefined;
    this.sessionId = this.generateSessionId();

    return this.track("user_reset", {
      new_session_id: this.sessionId,
    });
  }

  /**
   * Set user properties
   */
  async setUserProperties(properties: Record<string, any>): Promise<void> {
    return this.track("user_properties_set", {
      properties,
    });
  }

  /**
   * Track timing events
   */
  async timing(
    category: string,
    variable: string,
    value: number,
    label?: string
  ): Promise<void> {
    return this.track("timing", {
      category,
      variable,
      value,
      label,
    });
  }

  /**
   * Track custom metrics
   */
  async metric(
    name: string,
    value: number,
    properties?: Record<string, any>
  ): Promise<void> {
    return this.track("metric", {
      metric_name: name,
      metric_value: value,
      ...properties,
    });
  }

  /**
   * Send event to Augur backend
   */
  private async sendEvent(eventData: AugurEvent): Promise<void> {
    const payload: any = {
      session_id: this.sessionId,
      event_type: eventData.event,
      event_name: eventData.eventName || eventData.event, // Fallback to event_type if not provided
      event_description: eventData.eventDescription || "", // Default to empty string if not provided
      properties: eventData.properties,
      source: "frontend",
    };

    // Add feed_id - prioritize per-event override, then global feed ID
    const feedId = eventData.feedId || this.feedId;
    if (feedId) {
      payload.feed_id = feedId;
    }

    // Always send as array of events and use fetch (beacon doesn't support custom headers)
    const response = await fetch(`${this.endpoint}/analytics/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify([payload]), // Send as array
      keepalive: true,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  /**
   * Auto-inject session ID into all fetch requests
   */
  private setupAutoInjection(): void {
    const originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      headers.set("X-Augur-Session-ID", this.sessionId);

      const newInit: RequestInit = {
        ...init,
        headers,
      };

      return originalFetch(input, newInit);
    };

    this.log("Auto-injection setup complete", {
      sessionId: this.sessionId,
      feedId: this.feedId,
    });
  }

  /**
   * Get device information
   */
  getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const screen = window.screen;

    return {
      browser: this.detectBrowser(userAgent),
      os: this.detectOS(userAgent),
      device: this.detectDevice(userAgent, screen),
      screen: {
        width: screen.width,
        height: screen.height,
        pixelRatio: window.devicePixelRatio || 1,
      },
      location: {
        country: this.detectCountry(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
      },
      userAgent,
    };
  }

  /**
   * Detect browser information
   */
  private detectBrowser(userAgent: string): { name: string; version: string } {
    const browsers = [
      { name: "Chrome", regex: /Chrome\/(\d+\.\d+)/ },
      { name: "Firefox", regex: /Firefox\/(\d+\.\d+)/ },
      { name: "Safari", regex: /Version\/(\d+\.\d+).*Safari/ },
      { name: "Edge", regex: /Edg\/(\d+\.\d+)/ },
      { name: "Opera", regex: /OPR\/(\d+\.\d+)/ },
      { name: "Internet Explorer", regex: /MSIE (\d+\.\d+)/ },
    ];

    for (const browser of browsers) {
      const match = userAgent.match(browser.regex);
      if (match) {
        return { name: browser.name, version: match[1] };
      }
    }

    return { name: "Unknown", version: "Unknown" };
  }

  /**
   * Detect operating system
   */
  private detectOS(userAgent: string): { name: string; version: string } {
    const osPatterns = [
      { name: "Windows", regex: /Windows NT (\d+\.\d+)/ },
      { name: "macOS", regex: /Mac OS X (\d+[._]\d+)/ },
      { name: "Linux", regex: /Linux/ },
      { name: "Android", regex: /Android (\d+\.\d+)/ },
      { name: "iOS", regex: /OS (\d+[._]\d+).*like Mac OS X/ },
    ];

    for (const os of osPatterns) {
      const match = userAgent.match(os.regex);
      if (match) {
        return {
          name: os.name,
          version:
            os.name === "macOS" || os.name === "iOS"
              ? match[1].replace("_", ".")
              : match[1],
        };
      }
    }

    return { name: "Unknown", version: "Unknown" };
  }

  /**
   * Detect device type
   */
  private detectDevice(
    userAgent: string,
    screen: Screen
  ): { type: "desktop" | "mobile" | "tablet"; model?: string } {
    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
    const isTablet = /iPad|Android(?=.*Tablet)|Windows.*Touch/i.test(userAgent);

    if (isTablet) {
      return { type: "tablet" };
    }

    if (isMobile) {
      // Try to detect specific device models
      const deviceModels = [
        { model: "iPhone", regex: /iPhone/ },
        { model: "Samsung Galaxy", regex: /Samsung/ },
        { model: "Google Pixel", regex: /Pixel/ },
        { model: "OnePlus", regex: /OnePlus/ },
      ];

      for (const device of deviceModels) {
        if (device.regex.test(userAgent)) {
          return { type: "mobile", model: device.model };
        }
      }

      return { type: "mobile" };
    }

    return { type: "desktop" };
  }

  /**
   * Detect country (basic implementation - can be enhanced with IP geolocation)
   */
  private detectCountry(): string | undefined {
    // This is a basic implementation using timezone
    // For production, you might want to use a geolocation service
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const timezoneToCountry: Record<string, string> = {
      "America/New_York": "US",
      "America/Los_Angeles": "US",
      "America/Chicago": "US",
      "Europe/London": "GB",
      "Europe/Paris": "FR",
      "Europe/Berlin": "DE",
      "Asia/Tokyo": "JP",
      "Asia/Shanghai": "CN",
      "Asia/Kolkata": "IN",
      "Australia/Sydney": "AU",
    };

    return timezoneToCountry[timezone];
  }

  /**
   * Log debug messages
   */
  private log(message: string, data?: any): void {
    if (this.debug) {
      console.log(`[Augur Analytics] ${message}`, data);
    }
  }
}

/**
 * Create a new Augur Analytics instance
 */
export function createAnalytics(config: AugurConfig): AugurAnalytics {
  return new AugurAnalytics(config);
}

/**
 * Default export for convenience
 */
export default AugurAnalytics;
