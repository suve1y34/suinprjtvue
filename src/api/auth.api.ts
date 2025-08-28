import { apiClient } from "./http";

type LoginReq = { email: string; password: string };
type LoginRes = {
  accessToken: string;
  user: { userId: number; userName: string; email: string; nickname?: string; };
};

const endpoints = {
  login: '/auth/login',
  logout: '/auth/logout',
};

export const authApi = {
  login(body: LoginReq): Promise<LoginRes> {
      return apiClient.post<LoginRes>(endpoints.login, body);
  },
  logout(): Promise<{ success: boolean }> {
      return apiClient.post<{ success: boolean }>(endpoints.logout, {});
  },
};