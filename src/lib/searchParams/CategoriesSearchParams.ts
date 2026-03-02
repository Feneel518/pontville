import { parseAsString } from "nuqs";

export const categoriesSelectParser = {
  section: parseAsString.withDefault(""),
};
