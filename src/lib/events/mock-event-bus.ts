type EventCallback = (event: import("@/lib/types").PlatformEvent) => void;

const EVENT_TYPES = [
  { type: "CUSTOMER_REGISTERED", message: "New Customer Registered" },
  { type: "STORE_CREATED", message: "Store Created" },
  { type: "ORDER_PLACED", message: "Order Placed" },
  { type: "PARTNER_ACCEPTED", message: "Delivery Partner Accepted Order" },
  { type: "ORDER_DELIVERED", message: "Order Delivered" },
  { type: "PARTNER_ONLINE", message: "Delivery Partner Online" },
];

class MockEventBus {
  private listeners: Set<EventCallback> = new Set();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  subscribe(callback: EventCallback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      const template = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
      const event: import("@/lib/types").PlatformEvent = {
        id: `live-${Date.now()}`,
        type: template.type,
        message: template.message,
        entityType: template.type.includes("ORDER") ? "Order" : "Store",
        entityId: `#${Math.floor(Math.random() * 10000) + 10000}`,
        timestamp: new Date().toISOString(),
      };
      this.listeners.forEach((cb) => cb(event));
    }, 8000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const mockEventBus = typeof window !== "undefined" ? new MockEventBus() : null;
