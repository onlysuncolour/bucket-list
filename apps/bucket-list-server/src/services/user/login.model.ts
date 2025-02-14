import { handleSelectData, handleInsertData, handleUpdateData } from '../db/db.helper.service';
import { getUuid } from '@/utils';

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiredAt: Date;
  revoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class LoginModel {
  // 创建刷新令牌
  static async createRefreshToken(userId: string, token: string, expiredAt: Date): Promise<RefreshToken> {
    const id = getUuid();
    await handleInsertData({
      table: 'refresh_tokens',
      fields: ['id', 'user_id', 'token', 'expired_at'],
      data: [{ id, user_id: userId, token, expired_at: expiredAt }]
    });
    
    return {
      id,
      userId,
      token,
      expiredAt,
      revoked: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // 通过令牌获取刷新令牌信息
  static async getRefreshTokenByToken(token: string): Promise<RefreshToken | null> {
    const rows = await handleSelectData({
      table: 'refresh_tokens',
      where: [
        { key: 'token', value: token, type: '=' },
        { key: 'revoked', value: false, type: '=' },
        { key: 'expired_at', value: new Date(), type: '>' }
      ]
    });

    if (!rows || rows.length === 0) {
      return null;
    }

    const row = rows[0] as any;
    return {
      id: row.id,
      userId: row.user_id,
      token: row.token,
      expiredAt: new Date(row.expired_at),
      revoked: row.revoked === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  // 撤销刷新令牌
  static async revokeRefreshToken(token: string): Promise<boolean> {
    await handleUpdateData({
      table: 'refresh_tokens',
      fields: ['revoked'],
      data: [{ revoked: true }],
      where: [{ key: 'token', value: token, type: '=' }]
    });

    return true;
  }

  // 通过设备 UUID 获取用户
  static async getUserByDeviceUuid(deviceUuid: string) {
    const rows = await handleSelectData({
      table: 'users',
      where: [
        { key: 'device_uuid', value: deviceUuid, type: '=' },
        { key: 'is_deleted', value: false, type: '=' }
      ]
    });

    if (!rows || rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  // 通过邮箱获取用户
  static async getUserByEmail(email: string) {
    const rows = await handleSelectData({
      table: 'users',
      where: [
        { key: 'email', value: email, type: '=' },
        { key: 'is_deleted', value: false, type: '=' }
      ]
    });

    if (!rows || rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  // 更新用户最后登录时间
  static async updateLastLoginAt(userId: string): Promise<void> {
    await handleUpdateData({
      table: 'users',
      fields: ['last_login_at'],
      data: [{ last_login_at: new Date() }],
      where: [{ key: 'id', value: userId, type: '=' }]
    });
  }
}