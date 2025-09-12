export type User = {
  userId: number;
  userName: string;
  email: string;
  nickname?: string;
  userPhone?: string;
  goalYearlyCount?: number;
  createdDatetime?: string;
  modifiedDatetime?: string;
};

export type UserUpdatePayload = {
  nickname?: string;
  userPhone?: string;
  goalYearlyCount?: number;
};

export type UserServerResponse = {
  userId: number;
  userEmail: string;
  userName: string;
  nickname?: string;
  userPhone?: string;
  createdDatetime?: string;
  modifiedDatetime?: string;
};

export type GoalProgress = {
  goal: number | null;
  done: number;
  progressPercent: number;
};

/* 로그인 옵션 */
export type LoginOptions = { remember?: boolean };