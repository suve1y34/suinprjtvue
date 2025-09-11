export type User = {
  userId: number;
  userName: string;
  email: string;
  nickname?: string;
  createdDatetime?: string;
  modifiedDatetime?: string;
};

export type UserUpdatePayload = {
  nickname?: string;
};

export type UserServerResponse = {
  userId: number;
  userEmail: string;
  userName: string;
  nickname?: string;
  createdDatetime?: string;
  modifiedDatetime?: string;
};

/* 로그인 옵션 */
export type LoginOptions = { remember?: boolean };