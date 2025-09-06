import { apiClient } from "./http";
import type { User } from "@/types/user";

type LoginReq = { email: string; password: string };
type LoginRes = {
  accessToken: string;
  user: User;
};

const endpoints = {
  login: '/auth/login',
  logout: '/auth/logout',
  resetPassword: "/auth/resetPw"
};

export const authApi = {
  login(body: LoginReq): Promise<LoginRes> {
      return apiClient.post<LoginRes>(endpoints.login, body);
  },
  logout(): Promise<{ success: boolean }> {
      return apiClient.post<{ success: boolean }>(endpoints.logout, {});
  },
  resetPassword(): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(endpoints.resetPassword, {});
  },
};