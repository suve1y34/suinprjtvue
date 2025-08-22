import { apiClient } from "./http";
import type { AladinBook } from "@/types/aladin";

const endpoints = {
    search: '/api/search/aladin',
};

export const aladinApi = {
    search(keyword: string, start = 1, maxResults = 20) : Promise<AladinBook[]> {
        return apiClient.post<AladinBook[]>(endpoints.search, { keyword, start, maxResults });
    },
};