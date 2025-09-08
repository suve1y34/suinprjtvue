import { apiClient } from "./http";
import { EP } from "./endpoints";
import type { User, UserUpdatePayload, UserServerResponse } from "@/types/user";

export const usersApi = {
  getMe(): Promise<User> {
    return apiClient.get<User>(EP.users.myInfo);
  },

  async updateMe(payload: UserUpdatePayload): Promise<User> {
    const r = await apiClient.put<UserServerResponse>(EP.users.myInfo, payload);
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