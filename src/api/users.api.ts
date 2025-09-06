import { apiClient } from "./http";
import type { User, UserUpdatePayload, UserServerResponse } from "@/types/user";

const endpoints = {
  myInfo: '/users/me',
};

export const usersApi = {
  async updateMe(payload: UserUpdatePayload): Promise<User> {
    const r = await apiClient.put<UserServerResponse>(endpoints.myInfo, payload);
    return {
      userId: r.userId,
      userName: r.userName,
      email: r.userEmail,
      nickname: r.nickname,
      createdDatetime: r.createdDatetime,
      modifiedDatetime: r.modifiedDatetime,
    };
  },
};