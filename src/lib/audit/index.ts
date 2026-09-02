import type { AuditLog, PlatformEvent } from "@/lib/types";
import { seedData } from "@/lib/mock/seed";

let auditLogs = [...seedData.auditLogs];
let events = [...seedData.events];

export function getAuditLogs() {
  return auditLogs;
}

export function addAuditLog(entry: Omit<AuditLog, "id" | "timestamp">) {
  const log: AuditLog = {
    ...entry,
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  auditLogs = [log, ...auditLogs];
  return log;
}

export function getEvents() {
  return events;
}

export function addEvent(event: Omit<PlatformEvent, "id" | "timestamp">) {
  const e: PlatformEvent = {
    ...event,
    id: `event-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  events = [e, ...events.slice(0, 49)];
  return e;
}

export function resetAuditLogs() {
  auditLogs = [...seedData.auditLogs];
}

export function resetEvents() {
  events = [...seedData.events];
}
