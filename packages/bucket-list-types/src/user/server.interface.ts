// 数据库模型（下划线命名）
export interface UserModel {
  id: string;
  display_name: string;
  avatar_url?: string;
  apple_id?: string;
  google_id?: string;
  phone_number?: string;
  email?: string;
  wechat_id?: string;
  created_at: Date;
  last_login_at: Date;
  is_deleted: boolean;
}

// 业务层模型（驼峰命名）
export interface UserEntity extends Omit<UserModel, 'display_name' | 'avatar_url' | 'apple_id' | 'google_id' | 'phone_number' | 'wechat_id' | 'created_at' | 'last_login_at' | 'is_deleted'> {
  displayName: string;
  avatarUrl?: string;
  appleId?: string;
  googleId?: string;
  phoneNumber?: string;
  email?: string;
  wechatId?: string;
  createdAt: Date;
  lastLoginAt: Date;
  isDeleted: boolean;
}