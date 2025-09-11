import { apiClient } from "./http";
import { EP } from "./endpoints";

export const authApi = {
  // 로그아웃
  logout(): Promise<{ success: boolean }> {
      return apiClient.post<{ success: boolean }>(EP.auth.logout, {});
  },
};