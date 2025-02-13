// 前端使用的类型定义（驼峰命名）
export interface User {
  id: string;
  displayName: string;
  avatarUrl?: string;
  appleId?: string;
  googleId?: string;
  phoneNumber?: string;
  email?: string;
  wechatId?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserLoginInfo {
  appleId?: string;
  googleId?: string;
  phoneNumber?: string;
  email?: string;
  wechatId?: string;
}

export interface UserUpdateInfo {
  displayName?: string;
  avatarUrl?: string;
}