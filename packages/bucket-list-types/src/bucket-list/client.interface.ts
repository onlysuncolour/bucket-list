export interface TBucketList {
  id: string;
  title: string;
  description?: string;
  steps: TStep[];
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  isDeleted: boolean;
  isCompleted: boolean;
  stepCount: number;
  stepCompleteCount: number;
}

export interface TBucketListBrief extends Omit<TBucketList, 'steps'> {}

export interface TBucketListTag {
  id: string;
  bucketListId: string;
  name: string;
  tagId: string;
}

export interface TStep {
  id: string;
  uuid?: string
  title: string;
  description?: string;
  steps?: TStep[];
  bucketListId: string;
  parentStepId?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  isDeleted: boolean;
  isCompleted: boolean;
}

export interface TStepInit {
  title: string,
  steps: TStepInit[]
  uuid?: string;
  bucketListId?: string;
  parentStepId?: string;
  isCompleted?: boolean;

  id?: string // 不存在
}

export interface TComment {
  id: string;
  content: string;
  bucketListId?: string;
  stepId?: string;
  replyToCommentId?: string;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  isDeleted: boolean;
}