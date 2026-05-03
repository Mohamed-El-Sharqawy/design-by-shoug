import { t } from "elysia";

export const SearchQuery = t.Object({
  q: t.String({ minLength: 1 }),
});
