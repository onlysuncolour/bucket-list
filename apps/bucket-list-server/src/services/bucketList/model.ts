import { TBucketListEntity, TBucketListModel } from 'bucket-list-types';
import { handleCreateOrUpdateData, handleDeleteData, handleSelectData, handleUpdateData } from '../db/db.helper.service';

const TABLE_NAME = 'bucket_lists';

export class BucketListModel {
  static async create(data: Omit<TBucketListModel, 'id' | 'created_at' | 'updated_at'>) {
    const id = crypto.randomUUID();
    await handleCreateOrUpdateData({
      table: TABLE_NAME,
      fields: ['id', 'title', 'description', 'category', 'tags', 'creator_id', 'is_deleted', 'is_completed'],
      data: [{
        id,
        title: data.title,
        description: data.description,
        category: data.category,
        tags: JSON.stringify(data.tags),
        creator_id: data.creator_id,
        is_deleted: false,
        is_completed: false,
      }],
      uniqueKeys: ['id'],
    });
    return id;
  }

  static async update(id: string, data: Partial<Omit<TBucketListModel, 'id' | 'created_at' | 'updated_at'>>) {
    const updateData: any = { ...data };
    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags);
    }

    await handleUpdateData({
      table: TABLE_NAME,
      fields: Object.keys(updateData),
      data: [updateData],
      where: [{ key: 'id', value: id, type: '=' }],
      limit: 1,
    });
  }

  static async delete(id: string) {
    await handleUpdateData({
      table: TABLE_NAME,
      fields: ['is_deleted'],
      data: [{ is_deleted: true }],
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

  static async findById(id: string): Promise<TBucketListEntity | null> {
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

  static async findByCreatorId(creatorId: string): Promise<TBucketListEntity[]> {
    const result = await handleSelectData({
      table: TABLE_NAME,
      where: [
        { key: 'creator_id', value: creatorId, type: '=' },
        { key: 'is_deleted', value: false, type: '=' },
      ],
    });

    return result.map((item: any) => this.parseToEntity(item));
  }

  private static parseToEntity(data: any): TBucketListEntity {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags ? JSON.parse(data.tags) : undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      creatorId: data.creator_id,
      isDeleted: data.is_deleted,
      isCompleted: data.is_completed,
    };
  }
}