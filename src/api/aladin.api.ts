import { apiClient } from "./http";
import { EP } from "./endpoints";
import type { AladinBook } from "@/types/aladin";

export const aladinApi = {
  search(keyword: string, start = 1, maxResults = 20) : Promise<AladinBook[]> {
    return apiClient.post<AladinBook[]>(EP.aladin.search, { keyword, start, maxResults });
  },
};