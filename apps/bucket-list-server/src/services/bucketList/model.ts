import { TBucketListEntity, TBucketListModel, TBucketListTagEntity, TBucketListTagModel, TStepEntity, TStepModel } from 'bucket-list-types';
import { handleCreateOrUpdateData, handleDeleteData, handleSelectData, handleUpdateData } from '../db/db.helper.service';

const TABLE_NAME = 'bucket_lists';
const BUCKET_TAGS_TABLE = 'bucket_tags';
const BUCKET_LIST_TAGS_TABLE = 'bucket_list_tags';

export class BucketListModel {
  static generateTagsFromTitle(title: string): string[] {
    // TODO: 实现标题分析和标签生成逻辑
    // 这里返回一些演示数据
    return ['demo-tag-1', 'demo-tag-2'];
  }

  static async create(data: Omit<TBucketListEntity, 'id' | 'createdAt' | 'updatedAt' | 'steps'>) {
    const id = crypto.randomUUID();
    const generatedTags = this.generateTagsFromTitle(data.title);
    const tags = data.tags || generatedTags;

    await handleCreateOrUpdateData({
      table: TABLE_NAME,
      fields: ['id', 'title', 'description', 'category', 'creator_id', 'is_deleted', 'is_completed'],
      data: [{
        id,
        title: data.title,
        description: data.description,
        category: data.category,
        creator_id: data.creatorId,
        is_deleted: data.isDeleted,
        is_completed: data.isCompleted,
      }],
      uniqueKeys: ['id'],
    });

    // 创建或更新标签
    for (const tagName of tags) {
      const tagId = crypto.randomUUID();
      await handleCreateOrUpdateData({
        table: BUCKET_TAGS_TABLE,
        fields: ['id', 'name'],
        data: [{ id: tagId, name: tagName }],
        uniqueKeys: ['name'],
      });

      // 创建标签关联
      await handleCreateOrUpdateData({
        table: BUCKET_LIST_TAGS_TABLE,
        fields: ['id', 'bucket_list_id', 'name', 'tag_id'],
        data: [{
          id: crypto.randomUUID(),
          bucket_list_id: id,
          name: tagName,
          tag_id: tagId,
        }],
        uniqueKeys: ['bucket_list_id', 'tag_id'],
      });
    }

    return id;
  }

  static async update(id: string, data: Partial<TBucketListEntity>) {
    const updateData: Partial<TBucketListModel> = {};
    
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.category) updateData.category = data.category;
    if (data.creatorId) updateData.creator_id = data.creatorId;
    if (data.isDeleted !== undefined) updateData.is_deleted = data.isDeleted;
    if (data.isCompleted !== undefined) updateData.is_completed = data.isCompleted;

    await handleUpdateData({
      table: TABLE_NAME,
      fields: Object.keys(updateData),
      data: [updateData],
      where: [{ key: 'id', value: id, type: '=' }],
      limit: 1,
    });

    // 如果有标题更新，重新生成标签
    if (data.title || data.tags) {
      const currentBucketList = await this.findById(id);
      if (!currentBucketList) return;

      const newTags = data.tags || (data.title ? this.generateTagsFromTitle(data.title) : currentBucketList.tags || []);
      
      // 删除旧的标签关联
      await handleDeleteData({
        table: BUCKET_LIST_TAGS_TABLE,
        where: [{ key: 'bucket_list_id', value: id, type: '=' }],
      });

      // 创建新的标签关联
      for (const tagName of newTags) {
        const tagId = crypto.randomUUID();
        await handleCreateOrUpdateData({
          table: BUCKET_TAGS_TABLE,
          fields: ['id', 'name'],
          data: [{ id: tagId, name: tagName }],
          uniqueKeys: ['name'],
        });

        await handleCreateOrUpdateData({
          table: BUCKET_LIST_TAGS_TABLE,
          fields: ['id', 'bucket_list_id', 'name', 'tag_id'],
          data: [{
            id: crypto.randomUUID(),
            bucket_list_id: id,
            name: tagName,
            tag_id: tagId,
          }],
          uniqueKeys: ['bucket_list_id', 'tag_id'],
        });
      }
    }
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
    // 1. 查询 bucket list 基础信息
    const bucketListResult = await handleSelectData({
      table: TABLE_NAME,
      where: [
        { key: 'id', value: id, type: '=' },
        { key: 'is_deleted', value: false, type: '=' },
      ],
    });

    if (!bucketListResult || bucketListResult.length === 0) {
      return null;
    }

    const bucketList = this.parseToEntity(bucketListResult[0]);

    // 并行查询标签和步骤
    const [tagsResult, stepsResult] = await Promise.all([
      // 查询关联的标签
      handleSelectData({
        table: BUCKET_LIST_TAGS_TABLE,
        leftJoin: [
          {
            table: BUCKET_TAGS_TABLE,
            on: [{ leftKey: 'tag_id', rightKey: 'id' }],
          }
        ],
        where: [{ key: 'bucket_list_id', value: id, type: '=' }],
      }),
      // 查询关联的步骤
      handleSelectData({
        table: 'steps',
        where: [
          { key: 'bucket_list_id', value: id, type: '=' },
          { key: 'is_deleted', value: false, type: '=' },
        ],
      })
    ]);

    bucketList.tags = tagsResult.map(row => this.parseToTagEntity(row));

    // 构建步骤层级关系
    const stepsMap = new Map<string, TStepEntity>();
    stepsResult.forEach(row => {
      const step = this.parseToStepEntity(row);
      stepsMap.set(row.id, step);
    });

    // 构建步骤层级关系
    const steps = Array.from(stepsMap.values());
    steps.forEach(step => {
      if (step.parentStepId) {
        const parentStep = stepsMap.get(step.parentStepId);
        if (parentStep) {
          parentStep.subSteps = parentStep.subSteps || [];
          parentStep.subSteps.push(step);
        }
      }
    });

    // 只返回顶层步骤
    bucketList.steps = steps.filter(step => !step.parentStepId);

    return bucketList;
  }

  static async findByCreatorId(creatorId: string): Promise<TBucketListEntity[]> {
    // 1. 查询 bucket lists 基础信息
    const bucketListsResult = await handleSelectData({
      table: TABLE_NAME,
      where: [
        { key: 'creator_id', value: creatorId, type: '=' },
        { key: 'is_deleted', value: false, type: '=' },
      ],
    });

    if (!bucketListsResult || bucketListsResult.length === 0) {
      return [];
    }

    const bucketListIds = bucketListsResult.map(row => row.id);
    const bucketListMap = new Map<string, TBucketListEntity>();

    // 初始化 bucket lists
    bucketListsResult.forEach(row => {
      const bucketList = this.parseToEntity(row);
      bucketList.tags = [];
      bucketList.steps = [];
      bucketListMap.set(row.id, bucketList);
    });

    // 并行查询标签和步骤
    const [tagsResult, stepsResult] = await Promise.all([
      // 查询关联的标签
      handleSelectData({
        table: BUCKET_LIST_TAGS_TABLE,
        leftJoin: [
          {
            table: BUCKET_TAGS_TABLE,
            on: [{ leftKey: 'tag_id', rightKey: 'id' }],
          }
        ],
        where: [{ key: 'bucket_list_id', value: bucketListIds, type: 'IN' }],
      }),
      // 查询关联的步骤
      handleSelectData({
        table: 'steps',
        where: [
          { key: 'bucket_list_id', value: bucketListIds, type: 'IN' },
          { key: 'is_deleted', value: false, type: '=' },
        ],
      })
    ]);

    // 处理标签数据
    tagsResult.forEach(row => {
      const bucketList = bucketListMap.get(row.bucket_list_id);
      if (bucketList) {
        bucketList.tags!.push(this.parseToTagEntity(row));
      }
    });

    // 按 bucket_list_id 分组处理步骤数据
    const stepsMap = new Map<string, Map<string, TStepEntity>>();
    bucketListIds.forEach(id => stepsMap.set(id, new Map<string, TStepEntity>()));

    // 处理步骤数据
    stepsResult.forEach(row => {
      const bucketStepsMap = stepsMap.get(row.bucket_list_id);
      if (bucketStepsMap) {
        const step = this.parseToStepEntity(row);
        bucketStepsMap.set(row.id, step);
      }
    });

    // 处理每个 bucket list 的步骤层级关系
    for (const [bucketListId, bucketStepsMap] of stepsMap) {
      const steps = Array.from(bucketStepsMap.values());
      steps.forEach(step => {
        if (step.parentStepId) {
          const parentStep = bucketStepsMap.get(step.parentStepId);
          if (parentStep) {
            parentStep.subSteps = parentStep.subSteps || [];
            parentStep.subSteps.push(step);
          }
        }
      });
      
      // 只设置顶层步骤
      const bucketList = bucketListMap.get(bucketListId);
      if (bucketList) {
        bucketList.steps = steps.filter(step => !step.parentStepId);
      }
    }

    return Array.from(bucketListMap.values());
  }

  private static parseToEntity(data: TBucketListModel): TBucketListEntity {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      creatorId: data.creator_id,
      isDeleted: data.is_deleted,
      isCompleted: data.is_completed,
      tags: [],
      steps: []
    };
  }

  private static parseToStepEntity(data: TStepModel): TStepEntity {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      creatorId: data.creator_id,
      isDeleted: data.is_deleted,
      isCompleted: data.is_completed,
      bucketListId: data.bucket_list_id,
      parentStepId: data.parent_step_id,
      subSteps: []
    };
  }

  private static parseToTagEntity(data: TBucketListTagModel): TBucketListTagEntity {
    return {
      id: data.id,
      name: data.name,
      tagId: data.tag_id,
      bucketListId: data.bucket_list_id
    };
  }
}