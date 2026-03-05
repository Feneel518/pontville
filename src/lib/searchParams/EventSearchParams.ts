import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  createSearchParamsCache,
} from "nuqs/server";

/**
 * FILTER ENUMS
 */

// Status filter (UI-level)
export const EventStatusFilter = ["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"];

// Event type filter
export const EventTypeFilter = [
  "ALL",
  "LIVE_MUSIC",
  "TRIVIA",
  "SPECIAL",
  "OTHER",
];

// Time filter (computed, not DB enum)
export const EventTimeFilter = ["ALL", "UPCOMING", "PAST"];

// Sorting
export const EventSort = ["createdAt", "startsAt", "title", "status"];

export const SortDir = ["asc", "desc"];

/**
 * PARSERS
 */

export const eventsParsers = {
  q: parseAsString.withDefault(""),

  status: parseAsStringEnum(EventStatusFilter).withDefault("ALL"),

  type: parseAsStringEnum(EventTypeFilter).withDefault("ALL"),

  time: parseAsStringEnum(EventTimeFilter).withDefault("ALL"),

  sort: parseAsStringEnum(EventSort).withDefault("startsAt"),

  dir: parseAsStringEnum(SortDir).withDefault("asc"),

  page: parseAsInteger.withDefault(1),

  pageSize: parseAsInteger.withDefault(10),
};

/**
 * SERVER CACHE
 */

export const eventsSearchParamsCache = createSearchParamsCache(eventsParsers);

/**
 * TYPE
 */

export type EventsQP = Awaited<
  ReturnType<typeof eventsSearchParamsCache.parse>
>;
