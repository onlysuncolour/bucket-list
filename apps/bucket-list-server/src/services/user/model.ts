import { TUserEntity, TUserModel } from 'bucket-list-types';
import { handleCreateOrUpdateData, handleDeleteData, handleSelectData, handleUpdateData } from '../db/db.helper.service';

const TABLE_NAME = 'users';

export class UserModel {
  static async create(data: Omit<TUserModel, 'id' | 'created_at' | 'last_login_at' | 'is_deleted'>) {
    const id = crypto.randomUUID();
    const now = new Date();
    await handleCreateOrUpdateData({
      table: TABLE_NAME,
      fields: ['id', 'display_name', 'email', 'avatar_url', 'device_uuid', 'apple_id', 'google_id', 'phone_number', 'wechat_id', 
        'created_at',
        'last_login_at', 'is_deleted'],
      data: [{
        id,
        display_name: data.display_name,
        email: data.email,
        avatar_url: data.avatar_url,
        device_uuid: data.device_uuid,
        apple_id: data.apple_id,
        google_id: data.google_id,
        phone_number: data.phone_number,
        wechat_id: data.wechat_id,
        created_at: now,
        last_login_at: now,
        is_deleted: 0,
      }],
      uniqueKeys: ['id', 'email'],
    });
    return id;
  }

  static async update(id: string, data: Partial<Omit<UserModel, 'id' | 'created_at' | 'last_login_at' | 'is_deleted'>>) {
    await handleUpdateData({
      table: TABLE_NAME,
      fields: Object.keys(data),
      data: data,
      where: [{ key: 'id', value: id, type: '=' }],
      limit: 1,
    });
  }

  static async delete(id: string) {
    await handleUpdateData({
      table: TABLE_NAME,
      fields: ['is_deleted'],
      data: { is_deleted: true },
      where: [{ key: 'id', value: id, type: '=' }],
      limit: 1,
    });
  }

  static async hardDelete(id: string) {
    await handleDeleteData({
      table: TABLE_NAME,
      where: [{ key: 'id', value: id, type: '=' }],
      limit: 1,
    });
  }

  static async findById(id: string): Promise<TUserEntity | null> {
    const result = await handleSelectData({
      table: TABLE_NAME,
      where: [
        { key: 'id', value: id, type: '=' },
        { key: 'is_deleted', value: false, type: '=' },
      ],
      limit: 1,
    });

    if (!result || result.length === 0) {
      return null;
    }

    return this.parseToEntity(result[0]);
  }

  static async findByEmail(email: string): Promise<TUserEntity | null> {
    const result = await handleSelectData({
      table: TABLE_NAME,
      where: [
        { key: 'email', value: email, type: '=' },
        { key: 'is_deleted', value: false, type: '=' },
      ],
      limit: 1,
    });

    if (!result || result.length === 0) {
      return null;
    }

    return this.parseToEntity(result[0]);
  }

  static async findByUsername(username: string): Promise<TUserEntity | null> {
    const result = await handleSelectData({
      table: TABLE_NAME,
      where: [
        { key: 'username', value: username, type: '=' },
        { key: 'is_deleted', value: false, type: '=' },
      ],
      limit: 1,
    });

    if (!result || result.length === 0) {
      return null;
    }

    return this.parseToEntity(result[0]);
  }

  private static parseToEntity(data: any): TUserEntity {
    return {
      id: data.id,
      displayName: data.display_name,
      email: data.email,
      avatarUrl: data.avatar_url,
      deviceUuid: data.device_uuid,
      appleId: data.apple_id,
      googleId: data.google_id,
      phoneNumber: data.phone_number,
      wechatId: data.wechat_id,
      createdAt: data.created_at,
      lastLoginAt: data.last_login_at,
      isDeleted: data.is_deleted,
    };
  }
}