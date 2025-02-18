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

  private static async updateTags(bucketListId: string, tags: string[]) {
    // 删除旧的标签关联
    await handleDeleteData({
      table: BUCKET_LIST_TAGS_TABLE,
      where: [{ key: 'bucket_list_id', value: bucketListId, type: '=' }],
    });

    // 创建新的标签关联
    for (const tagName of tags) {
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
          bucket_list_id: bucketListId,
          name: tagName,
          tag_id: tagId,
        }],
        uniqueKeys: ['bucket_list_id', 'tag_id'],
      });
    }
  }

  static async updateStep(stepId: string, userId: string, data: Partial<TStepEntity>) {
    // 验证用户访问权限
    const step = await handleSelectData({
      table: 'steps',
      where: [
        { key: 'id', value: stepId, type: '=' },
        { key: 'is_deleted', value: false, type: '=' },
      ],
      limit: 1,
    });

    if (!step || step.length === 0) {
      const error = new Error('步骤不存在');
      error.name = 'NotFoundError';
      throw error;
    }

    const { hasAccess } = await this.validateUserAccess(step[0].bucket_list_id, userId);
    if (!hasAccess) {
      const error = new Error('没有权限修改此步骤');
      error.name = 'PermissionError';
      throw error;
    }

    const updateData: Partial<TStepModel> = {};
    
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.category) updateData.category = data.category;
    if (data.tags) updateData.tags = data.tags;
    if (data.isDeleted !== undefined) updateData.is_deleted = data.isDeleted;
    if (data.isCompleted !== undefined) updateData.is_completed = data.isCompleted;

    await handleUpdateData({
      table: 'steps',
      fields: Object.keys(updateData),
      data: updateData,
      where: [{ key: 'id', value: stepId, type: '=' }],
      limit: 1,
    });
  }

  static async removeSteps(stepIds: string | string[], userId: string) {
    const ids = Array.isArray(stepIds) ? stepIds : [stepIds];
    
    // 获取所有要删除的步骤信息
    const steps = await handleSelectData({
      table: 'steps',
      where: [
        { key: 'id', value: ids, type: 'IN' },
        { key: 'is_deleted', value: false, type: '=' },
      ],
    });

    if (!steps || steps.length === 0) {
      return;
    }

    // 验证用户权限
    const bucketListId = steps[0].bucket_list_id;
    const { hasAccess } = await this.validateUserAccess(bucketListId, userId);
    if (!hasAccess) {
      const error = new Error('没有权限删除这些步骤');
      error.name = 'PermissionError';
      throw error;
    }

    // 递归获取所有子步骤
    const allStepIds = new Set(ids);
    let currentIds = ids;

    while (currentIds.length > 0) {
      const subSteps = await handleSelectData({
        table: 'steps',
        where: [
          { key: 'parent_step_id', value: currentIds, type: 'IN' },
          { key: 'is_deleted', value: false, type: '=' },
        ],
      });

      if (!subSteps || subSteps.length === 0) {
        break;
      }

      currentIds = subSteps.map(step => step.id);
      currentIds.forEach(id => allStepIds.add(id));
    }

    // 标记所有步骤为已删除
    await handleUpdateData({
      table: 'steps',
      fields: ['is_deleted'],
      data: { is_deleted: true },
      where: [{ key: 'id', value: Array.from(allStepIds), type: 'IN' }],
    });
  }

  static async addSteps(parentId: string, userId: string, steps: Omit<TStepEntity, 'id' | 'createdAt' | 'updatedAt' | 'bucketListId' | 'parentStepId'>[]) {
    // 判断父节点类型（bucket list 或 step）
    let bucketListId: string;
    let parentStepId: string | undefined;

    const parentStep = await handleSelectData({
      table: 'steps',
      where: [
        { key: 'id', value: parentId, type: '=' },
        { key: 'is_deleted', value: false, type: '=' },
      ],
      limit: 1,
    });

    if (parentStep && parentStep.length > 0) {
      // 父节点是步骤
      bucketListId = parentStep[0].bucket_list_id;
      parentStepId = parentId;
    } else {
      // 父节点是 bucket list
      bucketListId = parentId;
      const bucketListExists = await this.validateExist(bucketListId);
      if (!bucketListExists) {
        const error = new Error('遗愿清单不存在');
        error.name = 'NotFoundError';
        throw error;
      }
    }

    // 验证用户权限
    const { hasAccess } = await this.validateUserAccess(bucketListId, userId);
    if (!hasAccess) {
      const error = new Error('没有权限添加步骤');
      error.name = 'PermissionError';
      throw error;
    }

    // 创建新步骤
    for (const step of steps) {
      const stepId = crypto.randomUUID();
      await handleCreateOrUpdateData({
        table: 'steps',
        fields: ['id', 'title', 'description', 'bucket_list_id', 'parent_step_id', 'category', 'tags', 'creator_id', 'is_deleted', 'is_completed'],
        data: [{
          id: stepId,
          title: step.title,
          description: step.description,
          bucket_list_id: bucketListId,
          parent_step_id: parentStepId,
          category: step.category,
          tags: step.tags,
          creator_id: userId,
          is_deleted: false,
          is_completed: step.isCompleted || false,
        }],
        uniqueKeys: ['id'],
      });

      // 递归处理子步骤
      if (step.subSteps && step.subSteps.length > 0) {
        await this.addSteps(stepId, userId, step.subSteps);
      }
    }
  }

  static async completeStep(stepId: string, userId: string, isCompleted: boolean = true) {
    // 验证步骤存在
    const step = await handleSelectData({
      table: 'steps',
      where: [
        { key: 'id', value: stepId, type: '=' },
        { key: 'is_deleted', value: false, type: '=' },
      ],
      limit: 1,
    });

    if (!step || step.length === 0) {
      const error = new Error('步骤不存在');
      error.name = 'NotFoundError';
      throw error;
    }

    // 验证用户权限
    const { hasAccess } = await this.validateUserAccess(step[0].bucket_list_id, userId);
    if (!hasAccess) {
      const error = new Error('没有权限修改此步骤');
      error.name = 'PermissionError';
      throw error;
    }

    // 更新步骤完成状态
    await handleUpdateData({
      table: 'steps',
      fields: ['is_completed'],
      data: { is_completed: isCompleted },
      where: [{ key: 'id', value: stepId, type: '=' }],
      limit: 1,
    });
  }

  private static async updateSteps(bucketListId: string, steps: Omit<TStepEntity, 'createdAt' | 'updatedAt' | 'bucketListId'>[] = []) {
    // 这个方法暂时没用了。
    // 获取当前所有的步骤
    const currentSteps = await handleSelectData({
      table: 'steps',
      where: [
        { key: 'bucket_list_id', value: bucketListId, type: '=' },
        { key: 'is_deleted', value: false, type: '=' },
      ],
    });

    // 标记所有现有步骤为已删除
    if (currentSteps.length > 0) {
      await handleUpdateData({
        table: 'steps',
        fields: ['is_deleted'],
        data: { is_deleted: true },
        where: [{ key: 'bucket_list_id', value: bucketListId, type: '=' }],
      });
    }

    // 创建或更新步骤
    for (const step of steps) {
      const stepId = step.id || crypto.randomUUID();
      await handleCreateOrUpdateData({
        table: 'steps',
        fields: ['id', 'title', 'description', 'bucket_list_id', 'parent_step_id', 'category', 'tags', 'creator_id', 'is_deleted', 'is_completed'],
        data: [{
          id: stepId,
          title: step.title,
          description: step.description,
          bucket_list_id: bucketListId,
          parent_step_id: step.parentStepId,
          category: step.category,
          tags: step.tags,
          creator_id: step.creatorId,
          is_deleted: false,
          is_completed: step.isCompleted,
        }],
        uniqueKeys: ['id'],
      });

      // 递归处理子步骤
      if (step.subSteps && step.subSteps.length > 0) {
        const subSteps = step.subSteps.map(subStep => ({
          ...subStep,
          parentStepId: stepId,
        }));
        await this.updateSteps(bucketListId, subSteps);
      }
    }
  }

  static async create(data: Omit<TBucketListEntity, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = crypto.randomUUID();
    const generatedTags = this.generateTagsFromTitle(data.title);
    const tags = data.tags?.map(tag => tag.name) || generatedTags;

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

    // 更新标签
    await this.updateTags(id, tags);

    // 更新步骤
    if (data.steps && data.steps.length > 0) {
      await this.updateSteps(id, data.steps);
    }

    return id;
  }

  static async update(id: string, userId: string, data: Partial<TBucketListEntity>) {
    // 验证用户是否为创建者
    const { isCreator } = await this.validateUserAccess(id, userId);
    if (!isCreator) {
      const error = new Error('没有权限修改此遗愿清单');
      error.name = 'PermissionError';
      throw error;
    }
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
      data: updateData,
      where: [{ key: 'id', value: id, type: '=' }],
      limit: 1,
    });

    // 处理标签更新
    if (data.title || data.tags) {
      const currentBucketList = await this.findById(id, userId);
      if (!currentBucketList) return;

      let newTags: string[] = [];
      if (data.tags) {
        newTags = data.tags.map(tag => tag.name);
      } else if (data.title) {
        const generatedTags = this.generateTagsFromTitle(data.title);
        const currentTags = currentBucketList.tags?.map(tag => tag.name) || [];
        // 只有当生成的标签与当前标签不同时才更新
        if (JSON.stringify(generatedTags.sort()) !== JSON.stringify(currentTags.sort())) {
          newTags = generatedTags;
        } else {
          newTags = currentTags;
        }
      }

      if (newTags.length > 0) {
        await this.updateTags(id, newTags);
      }
    }

    // 处理步骤更新
    // if (data.steps) {
    //   await this.updateSteps(id, data.steps);
    // }
    // 不再在此处更新步骤，步骤的更新应该由专门的步骤管理方法处理
  }

  static async delete(id: string, userId: string) {
    // 验证用户是否为创建者
    const { isCreator } = await this.validateUserAccess(id, userId);
    if (!isCreator) {
      const error = new Error('没有权限删除此遗愿清单');
      error.name = 'PermissionError';
      throw error;
    }
    await handleUpdateData({
      table: TABLE_NAME,
      fields: ['is_deleted'],
      data: { is_deleted: true },
      where: [{ key: 'id', value: id, type: '=' }],
      limit: 1,
    });
  }

  static async hardDelete(id: string, userId: string) {
    // 验证用户是否为创建者
    const { isCreator } = await this.validateUserAccess(id, userId);
    if (!isCreator) {
      const error = new Error('没有权限删除此遗愿清单');
      error.name = 'PermissionError';
      throw error;
    }
    await handleDeleteData({
      table: TABLE_NAME,
      where: [{ key: 'id', value: id, type: '=' }],
      limit: 1,
    });
  }

  private static async validateUserAccess(bucketListId: string, userId: string): Promise<{ hasAccess: boolean; isCreator: boolean }> {
    // 查询 bucket list 基础信息
    const bucketList = await handleSelectData({
      table: TABLE_NAME,
      where: [
        { key: 'id', value: bucketListId, type: '=' },
        { key: 'is_deleted', value: false, type: '=' },
      ],
      limit: 1,
    });

    if (!bucketList || bucketList.length === 0) {
      return { hasAccess: false, isCreator: false };
    }

    const isCreator = bucketList[0].creator_id === userId;

    if (isCreator) {
      return { hasAccess: true, isCreator: true };
    }

    // 检查是否被分享
    const shareResult = await handleSelectData({
      table: 'bucket_list_shares',
      where: [
        { key: 'bucket_list_id', value: bucketListId, type: '=' },
        { key: 'share_to_id', value: userId, type: '=' },
      ],
      limit: 1,
    });

    return { hasAccess: shareResult && shareResult.length > 0, isCreator: false };
  }

  static async findById(id: string, userId: string): Promise<TBucketListEntity | null> {
    // 验证用户访问权限
    const { hasAccess } = await this.validateUserAccess(id, userId);
    if (!hasAccess) {
      return null;
    }
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

  static async validateExist(id: string): Promise<boolean> {
    const result = await handleSelectData({
      table: TABLE_NAME,
      where: [
        { key: 'id', value: id, type: '=' },
        { key: 'is_deleted', value: false, type: '=' },
      ],
      limit: 1,
    });

    return result && result.length > 0;
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