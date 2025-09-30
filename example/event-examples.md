# Final Event Examples

## 1. Basic Event (with automatic device info)

```json
{
  "session_id": "sess-user@example.com-1704067200000-abc123def",
  "event_type": "button_clicked",
  "event_name": "button_clicked",
  "properties": {
    "button_name": "signup_cta",
    "session_id": "sess-user@example.com-1704067200000-abc123def",
    "user_id": "user@example.com",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "device_info": {
      "browser": { "name": "Chrome", "version": "120.0.6099.109" },
      "os": { "name": "macOS", "version": "14.2.1" },
      "device": { "type": "desktop" },
      "screen": { "width": 1920, "height": 1080, "pixelRatio": 2 },
      "location": {
        "country": "US",
        "timezone": "America/New_York",
        "language": "en-US"
      },
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36..."
    }
  },
  "source": "frontend",
  "feed_id": "feed-123e4567-e89b-12d3-a456-426614174000"
}
```

## 2. Page View Event

```json
{
  "session_id": "sess-user@example.com-1704067200000-abc123def",
  "event_type": "page_view",
  "event_name": "page_view",
  "properties": {
    "path": "/dashboard",
    "url": "https://example.com/dashboard",
    "title": "Dashboard - Example App",
    "session_id": "sess-user@example.com-1704067200000-abc123def",
    "user_id": "user@example.com",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "device_info": {
      "browser": { "name": "Safari", "version": "17.2" },
      "os": { "name": "iOS", "version": "17.2" },
      "device": { "type": "mobile", "model": "iPhone" },
      "screen": { "width": 393, "height": 852, "pixelRatio": 3 },
      "location": {
        "country": "US",
        "timezone": "America/New_York",
        "language": "en-US"
      },
      "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15..."
    }
  },
  "source": "frontend",
  "feed_id": "feed-123e4567-e89b-12d3-a456-426614174000"
}
```

## 3. User Identification Event

```json
{
  "session_id": "sess-user@example.com-1704067200000-abc123def",
  "event_type": "user_identified",
  "event_name": "user_identified",
  "properties": {
    "user_id": "user@example.com",
    "traits": {
      "name": "John Doe",
      "email": "user@example.com",
      "plan": "premium"
    },
    "session_id": "sess-user@example.com-1704067200000-abc123def",
    "user_id": "user@example.com",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "device_info": {
      "browser": { "name": "Firefox", "version": "121.0" },
      "os": { "name": "Windows", "version": "10.0" },
      "device": { "type": "desktop" },
      "screen": { "width": 2560, "height": 1440, "pixelRatio": 1 },
      "location": {
        "country": "GB",
        "timezone": "Europe/London",
        "language": "en-GB"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
    }
  },
  "source": "frontend",
  "feed_id": "feed-123e4567-e89b-12d3-a456-426614174000"
}
```

## 4. Custom Event with Additional Properties

```json
{
  "session_id": "sess-user@example.com-1704067200000-abc123def",
  "event_type": "purchase_completed",
  "event_name": "purchase_completed",
  "properties": {
    "product_id": "prod_123",
    "amount": 99.99,
    "currency": "USD",
    "payment_method": "credit_card",
    "session_id": "sess-user@example.com-1704067200000-abc123def",
    "user_id": "user@example.com",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "device_info": {
      "browser": { "name": "Edge", "version": "120.0.2210.91" },
      "os": { "name": "Windows", "version": "11.0" },
      "device": { "type": "desktop" },
      "screen": { "width": 1920, "height": 1080, "pixelRatio": 1.25 },
      "location": {
        "country": "CA",
        "timezone": "America/Toronto",
        "language": "en-CA"
      },
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
    }
  },
  "source": "frontend",
  "feed_id": "feed-123e4567-e89b-12d3-a456-426614174000"
}
```

## 5. Event with Feed ID Override

```json
{
  "session_id": "sess-user@example.com-1704067200000-abc123def",
  "event_type": "special_campaign_click",
  "event_name": "special_campaign_click",
  "properties": {
    "campaign_id": "campaign_456",
    "ad_id": "ad_789",
    "session_id": "sess-user@example.com-1704067200000-abc123def",
    "user_id": "user@example.com",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "device_info": {
      "browser": { "name": "Chrome", "version": "120.0.6099.109" },
      "os": { "name": "Android", "version": "14.0" },
      "device": { "type": "mobile", "model": "Samsung Galaxy" },
      "screen": { "width": 360, "height": 800, "pixelRatio": 3 },
      "location": {
        "country": "IN",
        "timezone": "Asia/Kolkata",
        "language": "hi-IN"
      },
      "userAgent": "Mozilla/5.0 (Linux; Android 14; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
    }
  },
  "source": "frontend",
  "feed_id": "feed-campaign-456-special"
}
```

## Key Points:

1. **Every event includes device_info automatically** - No configuration needed
2. **feed_id is always included** - Either global or per-event override
3. **session_id and user_id are always included** - For correlation
4. **timestamp is always included** - ISO 8601 format
5. **source is always "frontend"** - Identifies the data source
6. **Custom properties are merged** - Your custom data + automatic data
