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