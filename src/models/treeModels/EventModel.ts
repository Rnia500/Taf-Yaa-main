// src/models/eventModel.ts
import { generateId } from "../../utils/personUtils/idGenerator"; 

export interface Event {
  id: string;
  treeId: string;
  personIds: string[]; // multiple people can share one event (e.g. marriage)
  type: EventType;
  customType?: string;
  title?: string;
  description?: string;
  date?: string; // ISO 8601
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export type EventType =
  | "birth"
  | "death"
  | "marriage"
  | "divorce"
  | "graduation"
  | "custom";

// --- Factory ---
export const createEvent = (data: {
  treeId: string;
  personIds: string[];
  type: EventType;
  customType?: string;
  title?: string;
  description?: string;
  date?: string;
  location?: string;
}): Event => {
  const now = new Date().toISOString();
  return {
    id: generateId("event"),
    treeId: data.treeId,
    personIds: data.personIds,
    type: data.type,
    customType: data.customType,
    title: data.title,
    description: data.description,
    date: data.date,
    location: data.location,
    createdAt: now,
    updatedAt: now,
  };
};

// --- Helpers ---
/** Returns the displayable label for an event */
export const getEventLabel = (event: Event): string => {
  if (event.type === "custom" && event.customType) {
    return event.customType;
  }
  return EVENT_TYPE_LABELS[event.type] ?? event.type;
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  birth: "Birth",
  death: "Death",
  marriage: "Marriage",
  divorce: "Divorce",
  graduation: "Graduation",
  custom: "Custom Event",
};

export const involvesPerson = (event: Event, personId: string): boolean =>
  event.personIds.includes(personId);

export const sortEventsByDate = (events: Event[]): Event[] =>
  [...events].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

export const filterEventsByType = (
  events: Event[],
  type: Event["type"]
): Event[] => events.filter((e) => e.type === type);

export const getCustomEvents = (events: Event[]): Event[] =>
  events.filter((e) => e.type === "custom" && !!e.customType);

export const countCustomEvents = (events: Event[]): Record<string, number> => {
  return events.reduce<Record<string, number>>((acc, e) => {
    if (e.type === "custom" && e.customType) {
      acc[e.customType] = (acc[e.customType] || 0) + 1;
    }
    return acc;
  }, {});
};

export const suggestPromotableCustomEvents = (
  events: Event[],
  minCount = 5
): string[] => {
  const counts = countCustomEvents(events);
  return Object.entries(counts)
    .filter(([_, count]) => count >= minCount)
    .map(([customType]) => customType);
};
