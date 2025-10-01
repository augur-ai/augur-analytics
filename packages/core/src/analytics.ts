/**
 * Augur Analytics SDK - Core
 * Lightweight analytics library for session tracking and correlation
 */

export interface AugurConfig {
  writeKey: string;
  endpoint: string;
  userId?: string;
  sessionId?: string;
  debug?: boolean;
  feedId?: string; // Analytics feed ID (UUID format)
  batchSize?: number; // Number of events to batch before sending (default: 10)
  batchTimeout?: number; // Time in ms to wait before sending batch (default: 5000)
  maxRetries?: number; // Max retry attempts for failed requests (default: 3)
  enableLocalStorage?: boolean; // Persist failed events to localStorage (default: true)
  sessionTimeout?: number; // Session timeout in ms (default: 30 minutes)
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
  private writeKey: string;
  private endpoint: string;
  private debug: boolean;
  private feedId?: string;
  private eventQueue: any[] = [];
  private batchSize: number;
  private batchTimeout: number;
  private batchTimer?: ReturnType<typeof setTimeout>;
  private maxRetries: number;
  private enableLocalStorage: boolean;
  private sessionTimeout: number;
  private isSending: boolean = false;
  private unloadListenersAdded: boolean = false;
  private readonly SESSION_STORAGE_KEY = "augur_session";

  constructor(config: AugurConfig) {
    this.writeKey = config.writeKey;
    this.endpoint = config.endpoint;
    this.userId = config.userId;
    this.debug = config.debug || false;
    this.feedId = config.feedId;
    this.batchSize = config.batchSize || 10;
    this.batchTimeout = config.batchTimeout || 5000;
    this.maxRetries = config.maxRetries || 3;
    this.enableLocalStorage = config.enableLocalStorage !== false;
    this.sessionTimeout = config.sessionTimeout || 30 * 60 * 1000; // Default: 30 minutes

    // Get or create session ID with persistence
    this.sessionId = config.sessionId || this.getOrCreateSession();

    this.log("Augur Analytics initialized", {
      sessionId: this.sessionId,
      feedId: this.feedId,
      batchSize: this.batchSize,
      batchTimeout: this.batchTimeout,
      sessionTimeout: this.sessionTimeout,
    });

    this.setupAutoInjection();
    this.setupUnloadHandlers();
    this.sendPersistedEvents();
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
   * Get or create a session with persistence
   * Implements industry-standard 30-minute timeout behavior
   */
  private getOrCreateSession(): string {
    if (
      !this.enableLocalStorage ||
      typeof window === "undefined" ||
      !window.localStorage
    ) {
      return this.generateSessionId();
    }

    try {
      const stored = localStorage.getItem(this.SESSION_STORAGE_KEY);

      if (stored) {
        const { sessionId, timestamp } = JSON.parse(stored);
        const now = Date.now();
        const elapsed = now - timestamp;

        // Check if session is still valid (within timeout window)
        if (elapsed < this.sessionTimeout) {
          this.log("Reusing existing session", {
            sessionId,
            ageMinutes: Math.round(elapsed / 60000),
          });
          // Update timestamp to extend session
          this.updateSessionTimestamp(sessionId);
          return sessionId;
        } else {
          this.log("Session expired", {
            sessionId,
            ageMinutes: Math.round(elapsed / 60000),
          });
        }
      }

      // Create new session
      const newSessionId = this.generateSessionId();
      this.updateSessionTimestamp(newSessionId);
      this.log("Created new session", { sessionId: newSessionId });
      return newSessionId;
    } catch (error) {
      this.log(
        "Error accessing session storage, generating new session",
        error
      );
      return this.generateSessionId();
    }
  }

  /**
   * Update session timestamp in localStorage
   * Called on initialization and on each activity (track call)
   */
  private updateSessionTimestamp(sessionId?: string): void {
    if (
      !this.enableLocalStorage ||
      typeof window === "undefined" ||
      !window.localStorage
    ) {
      return;
    }

    try {
      const sid = sessionId || this.sessionId;
      localStorage.setItem(
        this.SESSION_STORAGE_KEY,
        JSON.stringify({
          sessionId: sid,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      this.log("Error updating session timestamp", error);
    }
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
  track(
    event: string,
    properties?: Record<string, any>,
    feedId?: string,
    eventName?: string,
    eventDescription?: string
  ): void {
    // Update session timestamp on each activity (extends session timeout)
    this.updateSessionTimestamp();

    const deviceInfo = this.getDeviceInfo();

    const payload: any = {
      write_key: this.writeKey,
      session_id: this.sessionId,
      event_type: event,
      event_name: eventName || event,
      event_description: eventDescription || "",
      properties: {
        ...properties,
        session_id: this.sessionId,
        user_id: this.userId,
        timestamp: new Date().toISOString(),
        device_info: deviceInfo,
      },
      source: "frontend",
    };

    // Add feed_id - prioritize per-event override, then global feed ID
    const effectiveFeedId = feedId || this.feedId;
    if (effectiveFeedId) {
      payload.feed_id = effectiveFeedId;
    }

    this.log("Queueing event", payload);

    // Add to queue
    this.eventQueue.push(payload);

    // Check if we should send immediately
    if (this.eventQueue.length >= this.batchSize) {
      this.flushQueue();
    } else {
      // Reset batch timer
      this.resetBatchTimer();
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

    // Update localStorage with new session
    this.updateSessionTimestamp();

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
   * Reset the batch timer
   */
  private resetBatchTimer(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      this.flushQueue();
    }, this.batchTimeout);
  }

  /**
   * Flush the event queue and send to backend
   */
  flushQueue(): void {
    if (this.eventQueue.length === 0 || this.isSending) {
      return;
    }

    // Clear the batch timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];
    this.isSending = true;

    this.log(`Flushing ${eventsToSend.length} events`, eventsToSend);

    this.sendBatch(eventsToSend)
      .then(() => {
        this.log("Events sent successfully");
        this.isSending = false;
      })
      .catch((error) => {
        this.log("Error sending events", error);
        this.isSending = false;

        // Persist failed events to localStorage if enabled
        if (this.enableLocalStorage) {
          this.persistEvents(eventsToSend);
        }
      });
  }

  /**
   * Send batch of events to backend with retry logic
   */
  private async sendBatch(events: any[], retryCount = 0): Promise<void> {
    const body = events;

    try {
      // Try Beacon API first (more efficient, survives page unload)
      if (navigator.sendBeacon) {
        const headers = {
          type: "application/json",
        };
        const blob = new Blob([JSON.stringify(body)], headers);
        const success = navigator.sendBeacon(
          `${this.endpoint}/api/v1/analytics/events`,
          blob
        );

        if (success) {
          return; // Beacon sent successfully
        }
        // Fall through to fetch if beacon fails
      }

      // Fallback to fetch with keepalive
      const response = await fetch(`${this.endpoint}/api/v1/analytics/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        keepalive: true,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      // Retry logic
      if (retryCount < this.maxRetries) {
        this.log(
          `Retrying batch send (attempt ${retryCount + 1}/${this.maxRetries})`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1))
        );
        return this.sendBatch(events, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Setup unload handlers (pagehide and visibilitychange)
   * Following best practices from https://nicj.net/beaconing-in-practice/
   */
  private setupUnloadHandlers(): void {
    if (this.unloadListenersAdded) {
      return;
    }

    // Listen to pagehide event (recommended over unload/beforeunload)
    window.addEventListener("pagehide", () => {
      this.log("pagehide event - flushing queue");
      this.flushQueue();
    });

    // Listen to visibilitychange when page becomes hidden
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.log("visibilitychange (hidden) - flushing queue");
        this.flushQueue();
      }
    });

    this.unloadListenersAdded = true;
    this.log("Unload handlers setup complete");
  }

  /**
   * Persist failed events to localStorage
   */
  private persistEvents(events: any[]): void {
    try {
      const key = `augur_events_${this.sessionId}`;
      const existing = localStorage.getItem(key);
      const existingEvents = existing ? JSON.parse(existing) : [];
      const combined = [...existingEvents, ...events];

      // Limit to 100 events to avoid localStorage quota issues
      const limited = combined.slice(-100);

      localStorage.setItem(key, JSON.stringify(limited));
      this.log(`Persisted ${events.length} events to localStorage`);
    } catch (error) {
      this.log("Error persisting events to localStorage", error);
    }
  }

  /**
   * Send any persisted events from previous sessions
   */
  private sendPersistedEvents(): void {
    if (!this.enableLocalStorage) {
      return;
    }

    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith("augur_events_")
      );

      for (const key of keys) {
        const events = JSON.parse(localStorage.getItem(key) || "[]");

        if (events.length > 0) {
          this.log(`Found ${events.length} persisted events, sending...`);
          this.sendBatch(events)
            .then(() => {
              localStorage.removeItem(key);
              this.log("Persisted events sent and removed");
            })
            .catch((error) => {
              this.log("Error sending persisted events", error);
            });
        }
      }
    } catch (error) {
      this.log("Error loading persisted events", error);
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
