// src/models/events.ts


export interface Event {
  id: string;
  treeId: string;
  personIds: string[]; // multiple people can share one event (e.g. marriage)
  type: EventType;     
  customType?: string; 
  title?: string;
  description?: string;
  date?: string;       // ISO 8601
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
/** Returns true if the event involves the given personId */
export const involvesPerson = (event: Event, personId: string): boolean =>
  event.personIds.includes(personId);

/** Sorts events by date (earliest first) */
export const sortEventsByDate = (events: Event[]): Event[] =>
  [...events].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

/** Filters events by type */
export const filterEventsByType = (events: Event[], type: Event["type"]): Event[] =>
  events.filter((e) => e.type === type);

/** Filter all custom events */
export const getCustomEvents = (events: Event[]): Event[] =>
  events.filter(e => e.type === "custom" && !!e.customType);

/** Count how many times each custom event type repeats */
export const countCustomEvents = (events: Event[]): Record<string, number> => {
  return events.reduce<Record<string, number>>((acc, e) => {
    if (e.type === "custom" && e.customType) {
      acc[e.customType] = (acc[e.customType] || 0) + 1;
    }
    return acc;
  }, {});
};

/** Suggest promotions: return all custom events that repeat >= minCount */
export const suggestPromotableCustomEvents = (
  events: Event[],
  minCount = 5
): string[] => {
  const counts = countCustomEvents(events);
  return Object.entries(counts)
    .filter(([_, count]) => count >= minCount)
    .map(([customType]) => customType);
};