// 前端使用的类型定义（驼峰命名）
export interface TUser {
  id: string;
  displayName: string;
  avatarUrl?: string;
  deviceUuid?: string;
  appleId?: string;
  googleId?: string;
  phoneNumber?: string;
  email?: string;
  wechatId?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface TUserLoginInfo {
  deviceUuid?: string;
  appleId?: string;
  googleId?: string;
  phoneNumber?: string;
  email?: string;
  wechatId?: string;
}

export interface TUserUpdateInfo {
  displayName?: string;
  avatarUrl?: string;
}