/**
 * Augur Analytics SDK
 * Lightweight analytics library for session tracking and correlation
 */

export interface AugurConfig {
  apiKey: string;
  endpoint: string;
  userId?: string;
  sessionId?: string;
  debug?: boolean;
}

export interface AugurEvent {
  event: string;
  properties?: Record<string, any>;
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

export class AugurAnalytics {
  private sessionId: string;
  private userId?: string;
  private apiKey: string;
  private endpoint: string;
  private debug: boolean;

  constructor(config: AugurConfig) {
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint;
    this.userId = config.userId;
    this.debug = config.debug || false;
    this.sessionId = config.sessionId || this.generateSessionId();

    this.log("Augur Analytics initialized", { sessionId: this.sessionId });
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
   * Track a custom event
   */
  async track(event: string, properties?: Record<string, any>): Promise<void> {
    const eventData = {
      event,
      properties: {
        ...properties,
        session_id: this.sessionId,
        user_id: this.userId,
        timestamp: new Date().toISOString(),
      },
    };

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
    const payload = {
      session_id: this.sessionId,
      event_name: eventData.event,
      properties: eventData.properties,
      source: "frontend",
      timestamp: new Date().toISOString(),
    };

    // Use Beacon API if available, fallback to fetch
    if (navigator.sendBeacon) {
      const success = navigator.sendBeacon(
        `${this.endpoint}/api/v1/session-events/events`,
        JSON.stringify(payload)
      );

      if (!success) {
        throw new Error("Failed to send beacon");
      }
    } else {
      const response = await fetch(
        `${this.endpoint}/api/v1/session-events/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(payload),
          keepalive: true,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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

    this.log("Auto-injection setup complete");
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
