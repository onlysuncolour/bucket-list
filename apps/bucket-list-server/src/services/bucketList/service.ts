import { TBucketListEntity, TStepEntity } from 'bucket-list-types';
import { BucketListModel } from './model';
import { handleError } from '../error-handler';

export class BucketListService {
  private static async validateBucketListExists(id: string): Promise<void> {
    const exists = await BucketListModel.validateExist(id);
    if (!exists) {
      const notFoundError = new Error('Bucket List 不存在');
      notFoundError.name = 'NotFoundError';
      throw notFoundError;
    }
  }

  static async createBucketList(data: Omit<TBucketListEntity, 'id' | 'createdAt' | 'updatedAt'>, userId: string) {
    try {
      const id = await BucketListModel.create(data);
      return await this.getBucketListById(id, userId);
    } catch (error) {
      throw handleError(error as Error);
    }
  }

  static async updateBucketList(id: string, userId: string, data: Partial<Omit<TBucketListEntity, 'id' | 'createdAt' | 'updatedAt'>>) {
    try {
      await this.validateBucketListExists(id);
      await BucketListModel.update(id, userId, data);
      return await this.getBucketListById(id, userId);
    } catch (error) {
      throw handleError(error as Error);
    }
  }

  static async deleteBucketList(id: string, userId: string) {
    try {
      await this.validateBucketListExists(id);
      await BucketListModel.delete(id, userId);
      return true;
    } catch (error) {
      throw handleError(error as Error);
    }
  }

  static async hardDeleteBucketList(id: string, userId: string) {
    try {
      await this.validateBucketListExists(id);
      await BucketListModel.hardDelete(id, userId);
      return true;
    } catch (error) {
      throw handleError(error as Error);
    }
  }

  static async getBucketListById(id: string, userId: string): Promise<TBucketListEntity | null> {
    try {
      return await BucketListModel.findById(id, userId);
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

  static async completeBucketList(id: string, userId: string) {
    try {
      await this.validateBucketListExists(id);
      await BucketListModel.update(id, userId, { isCompleted: true });
      return await this.getBucketListById(id, userId);
    } catch (error) {
      throw handleError(error as Error);
    }
  }

  static async uncompleteBucketList(id: string, userId: string) {
    try {
      await this.validateBucketListExists(id);
      await BucketListModel.update(id, userId, { isCompleted: false });
      return await this.getBucketListById(id, userId);
    } catch (error) {
      throw handleError(error as Error);
    }
  }

  // 步骤管理相关服务
  static async updateStep(stepId: string, userId: string, data: Partial<TStepEntity>) {
    try {
      await BucketListModel.updateStep(stepId, userId, data);
      return true;
    } catch (error) {
      throw handleError(error as Error);
    }
  }

  static async removeSteps(stepIds: string | string[], userId: string) {
    try {
      await BucketListModel.removeSteps(stepIds, userId);
      return true;
    } catch (error) {
      throw handleError(error as Error);
    }
  }

  static async addSteps(parentId: string, userId: string, steps: Omit<TStepEntity, 'id' | 'createdAt' | 'updatedAt' | 'bucketListId'>[]) {
    try {
      await BucketListModel.addSteps(parentId, userId, steps);
      return true;
    } catch (error) {
      throw handleError(error as Error);
    }
  }

  static async completeStep(stepId: string, userId: string, isCompleted: boolean = true) {
    try {
      await BucketListModel.completeStep(stepId, userId, isCompleted);
      return true;
    } catch (error) {
      throw handleError(error as Error);
    }
  }
}