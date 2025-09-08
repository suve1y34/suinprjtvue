import { apiClient } from "./http";
import { EP } from "./endpoints";
import type { User, LoginReq, LoginRes, RegisterReq  } from "@/types/user";

export const authApi = {
  // 로그인
  login(body: LoginReq): Promise<LoginRes> {
      return apiClient.post<LoginRes>(EP.auth.login, body);
  },
  // 로그아웃
  logout(): Promise<{ success: boolean }> {
      return apiClient.post<{ success: boolean }>(EP.auth.logout, {});
  },
  // 비밀번호 초기화
  resetPassword(): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(EP.auth.resetPassword, {});
  },
  // 회원가입
  register(body: RegisterReq): Promise<User> {
    return apiClient.post<User>(EP.auth.register, body);
  },
};