import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  createSearchParamsCache,
} from "nuqs/server";

export const MenuStatus = ["ALL", "ACTIVE", "INACTIVE"];
export const MenuSort = ["createdAt", "name", "status"];
export const SortDir = ["asc", "desc"];

export const menuParsers = {
  q: parseAsString.withDefault(""),
  status: parseAsStringEnum(MenuStatus).withDefault("ALL"),
  sort: parseAsStringEnum(MenuSort).withDefault("createdAt"),
  dir: parseAsStringEnum(SortDir).withDefault("desc"),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
};

export const menuSearchParamsCache = createSearchParamsCache(menuParsers);

export type menuQP = Awaited<ReturnType<typeof menuSearchParamsCache.parse>>;
