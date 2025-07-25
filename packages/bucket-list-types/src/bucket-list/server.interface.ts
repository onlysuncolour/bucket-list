// 数据库模型（下划线命名）
export interface TBucketListModel {
  id: string;
  title: string;
  description?: string;
  category?: string;
  created_at: Date;
  updated_at: Date;
  creator_id: string;
  is_deleted: boolean;
  is_completed: boolean;
  step_count: number;
  step_complete_count: number;
}

export interface TBucketTagModel {
  id: string;
  name: string;
}

export interface TBucketListTagModel {
  id: string;
  bucket_list_id: string;
  name: string;
  tag_id: string;
}

export interface TBucketListShareModel {
  id: string;
  bucket_list_id: string;
  creator_id: string;
  share_to_id: string;
  created_at: Date;
}

export interface TStepModel {
  id: string;
  title: string;
  description?: string;
  bucket_list_id: string;
  parent_step_id?: string;
  category?: string;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
  creator_id: string;
  is_deleted: boolean;
  is_completed: boolean;
}

export interface TCommentModel {
  id: string;
  content: string;
  bucket_list_id?: string;
  step_id?: string;
  reply_to_comment_id?: string;
  created_at: Date;
  updated_at: Date;
  creator_id: string;
  is_deleted: boolean;
}

// 业务层模型（驼峰命名）
export interface TBucketListEntity extends Omit<TBucketListModel, 'created_at' | 'updated_at' | 'creator_id' | 'is_deleted' | 'is_completed' | 'step_count' | 'step_complete_count'> {
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  isDeleted: boolean;
  isCompleted: boolean;
  tags?: TBucketListTagEntity[];
  steps?: TStepEntity[];
  stepCount: number
  stepCompleteCount: number
}

export interface TBucketListBriefEntity extends Omit<TBucketListEntity, 'steps'> {}

export interface TBucketListTagEntity extends Omit<TBucketListTagModel, 'bucket_list_id' | 'tag_id'> {
  bucketListId: string;
  tagId: string
}

export interface TStepEntity extends Omit<TStepModel, 'created_at' | 'updated_at' | 'creator_id' | 'is_deleted' | 'is_completed' | 'bucket_list_id' | 'parent_step_id'> {
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  isDeleted: boolean;
  isCompleted: boolean;
  bucketListId: string;
  parentStepId?: string;
  steps?: TStepEntity[];
}

export interface TCommentEntity extends Omit<TCommentModel, 'created_at' | 'updated_at' | 'creator_id' | 'is_deleted' | 'bucket_list_id' | 'step_id' | 'reply_to_comment_id'> {
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  isDeleted: boolean;
  bucketListId?: string;
  stepId?: string;
  replyToCommentId?: string;
}