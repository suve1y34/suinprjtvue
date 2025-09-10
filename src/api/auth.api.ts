import { apiClient } from "./http";
import { EP } from "./endpoints";
import type { User, LoginReq, LoginRes, RegisterReq  } from "@/types/user";

export const authApi = {
  // 로그아웃
  logout(): Promise<{ success: boolean }> {
      return apiClient.post<{ success: boolean }>(EP.auth.logout, {});
  },
};