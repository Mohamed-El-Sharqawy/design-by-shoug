import Elysia from "elysia";
import { SearchService } from "./service";
import { SearchQuery } from "./model";

export const searchRoutes = new Elysia({
  prefix: "/search",
  tags: ["Search"],
}).get(
  "/",
  async ({ query }) => {
    const results = await SearchService.search(query.q);
    return { success: true, data: results };
  },
  {
    query: SearchQuery,
    detail: {
      summary: "Search products and collections",
      description: "Search across products and collections by name",
    },
  }
);
