export interface BucketList {
  id: string;
  title: string;
  description?: string;
  steps: Step[];
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  isDeleted: boolean;
  isCompleted: boolean;
}

export interface Step {
  id: string;
  title: string;
  description?: string;
  subSteps?: Step[];
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

export interface Comment {
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