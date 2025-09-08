export type User = {
  userId: number;
  userName: string;
  email: string;
  nickname?: string;
  createdDatetime?: string;
  modifiedDatetime?: string;
};

export type UserUpdatePayload = {
  userName?: string;
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

export type LoginReq = { email: string; password: string };
export type LoginRes = {
  accessToken: string;
  user: User;
};

export type RegisterReq = {
  email: string;
  password: string;
  userName: string;
  nickname?: string;
};

/* 로그인 옵션 */
export type LoginOptions = { remember?: boolean };