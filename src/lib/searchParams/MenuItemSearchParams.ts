import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  createSearchParamsCache,
} from "nuqs/server";

export const MenuItemStatus = ["ALL", "ACTIVE", "INACTIVE"];
export const MenuItemIsAvailable = ["ALL", "AVAILABLE", "UNAVAILABLE"];
export const MenuSort = ["createdAt", "name", "status"];
export const SortDir = ["asc", "desc"];

export const menuItemParsers = {
  q: parseAsString.withDefault(""),
  status: parseAsStringEnum(MenuItemStatus).withDefault("ALL"),
  available: parseAsStringEnum(MenuItemIsAvailable).withDefault("ALL"),
  sort: parseAsStringEnum(MenuSort).withDefault("createdAt"),
  dir: parseAsStringEnum(SortDir).withDefault("desc"),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
};

export const menuItemSearchParamsCache =
  createSearchParamsCache(menuItemParsers);

export type menuItemQP = Awaited<
  ReturnType<typeof menuItemSearchParamsCache.parse>
>;
