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
}

export interface TStep {
  id: string;
  title: string;
  description?: string;
  subSteps?: TStep[];
  bucketListId: string;
  parentStepId?: string;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  isDeleted: boolean;
  isCompleted: boolean;
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