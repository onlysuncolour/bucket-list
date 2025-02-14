import { TBucketListEntity } from 'bucket-list-types';
import { BucketListModel } from './model';
import { handleError } from '../error-handler';

export class BucketListService {
  static async createBucketList(data: Omit<TBucketListEntity, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const id = await BucketListModel.create(data);
      return await this.getBucketListById(id);
    } catch (error) {
      throw handleError(error as Error);
    }
  }

  static async updateBucketList(id: string, data: Partial<Omit<TBucketListEntity, 'id' | 'createdAt' | 'updatedAt'>>) {
    try {
      const existingBucketList = await this.getBucketListById(id);
      if (!existingBucketList) {
        const notFoundError = new Error('Bucket List 不存在');
        notFoundError.name = 'NotFoundError';
        throw notFoundError;
      }

      await BucketListModel.update(id, data);
      return await this.getBucketListById(id);
    } catch (error) {
      throw handleError(error as Error);
    }
  }

  static async deleteBucketList(id: string) {
    try {
      const existingBucketList = await this.getBucketListById(id);
      if (!existingBucketList) {
        const notFoundError = new Error('Bucket List 不存在');
        notFoundError.name = 'NotFoundError';
        throw notFoundError;
      }

      await BucketListModel.delete(id);
      return true;
    } catch (error) {
      throw handleError(error as Error);
    }
  }

  static async hardDeleteBucketList(id: string) {
    try {
      const existingBucketList = await this.getBucketListById(id);
      if (!existingBucketList) {
        const notFoundError = new Error('Bucket List 不存在');
        notFoundError.name = 'NotFoundError';
        throw notFoundError;
      }

      await BucketListModel.hardDelete(id);
      return true;
    } catch (error) {
      throw handleError(error as Error);
    }
  }

  static async getBucketListById(id: string): Promise<TBucketListEntity | null> {
    try {
      return await BucketListModel.findById(id);
    } catch (error) {
      throw handleError(error as Error);
    }
  }

  static async getBucketListsByCreatorId(creatorId: string): Promise<TBucketListEntity[]> {
    try {
      return await BucketListModel.findByCreatorId(creatorId);
    } catch (error) {
      throw handleError(error as Error);
    }
  }

  static async completeBucketList(id: string) {
    try {
      const existingBucketList = await this.getBucketListById(id);
      if (!existingBucketList) {
        const notFoundError = new Error('Bucket List 不存在');
        notFoundError.name = 'NotFoundError';
        throw notFoundError;
      }

      await BucketListModel.update(id, { isCompleted: true });
      return await this.getBucketListById(id);
    } catch (error) {
      throw handleError(error as Error);
    }
  }

  static async uncompleteBucketList(id: string) {
    try {
      const existingBucketList = await this.getBucketListById(id);
      if (!existingBucketList) {
        const notFoundError = new Error('Bucket List 不存在');
        notFoundError.name = 'NotFoundError';
        throw notFoundError;
      }

      await BucketListModel.update(id, { isCompleted: false });
      return await this.getBucketListById(id);
    } catch (error) {
      throw handleError(error as Error);
    }
  }
}