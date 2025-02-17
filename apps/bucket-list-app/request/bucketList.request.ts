import {request} from './request' ;
import meta from './meta';
import { TBucketList, TStep } from 'bucket-list-types';
const {
  prefix,
  path,
  getAllBucketList,
  createBucketList,
  updateBucketList,
  deleteBucketList,
  getBucketListById,
  completeBucketList,
  uncompleteBucketList
} = meta.bucketList

const {
  prefix: stepPrefix,
  path: stepPath,
  createSteps,
  updateSteps,
  removeSteps,
  completeStep,
  uncompleteStep,
} = meta.steps

export function fetchAllBucketList():Promise<TBucketList[]> {
  return request.request({
    prefix: `${prefix}${path}`,
    path: getAllBucketList.path,
    method: getAllBucketList.method,
  })
}

export function fetchCreateBucketList(
  body: Omit<TBucketList, "id" | "tags" | "createdAt" | "updatedAt" | "creatorId" | "isDeleted" | "isCompleted">)
  :Promise<TBucketList> {
  return request.request({
    prefix: `${prefix}${path}`,
    path: createBucketList.path,
    method: createBucketList.method,
    payload: body
  })
}

export function fetchUpdateBucketList(
  body: Omit<TBucketList, "tags" | "createdAt" | "updatedAt" | "creatorId" | "isDeleted" | "steps" | "isComplete">)
  :Promise<TBucketList> {
  return request.request({
    prefix: `${prefix}${path}`,
    path: updateBucketList.path,
    method: updateBucketList.method,
    payload: body
  })
}

export function fetchDeleteBucketList(id: string) {
  return request.request({
    prefix: `${prefix}${path}`,
    path: deleteBucketList.path,
    method: deleteBucketList.method,
    payload: {
      id
    }
  })
}

export function fetchBucketListById(id: string) {
  return request.request({
    prefix: `${prefix}${path}`,
    path: getBucketListById.path,
    method: getBucketListById.method,
    param: {
      id
    }
  })
}

export function fetchCompleteBucketList(id: string) {
  return request.request({
    prefix: `${prefix}${path}`,
    path: completeBucketList.path,
    method: completeBucketList.method,
    param: {
      id
    }
  })
}

export function fetchUncompleteBucketList(id: string) {
  return request.request({
    prefix: `${prefix}${path}`,
    path: uncompleteBucketList.path,
    method: uncompleteBucketList.method,
    param: {
      id
    }
  })
}

export function fetchCreateBucketListSteps(
  bId: string, 
  steps: Omit<TStep, 'id' | 'createdAt' | 'updatedAt' | 'creatorId' | 'isDeleted' | 'isCompleted'>[]
): Promise<TStep[]> {
  return request.request({
    prefix: `${stepPrefix}${stepPath}`,
    path: createSteps.path,
    method: createSteps.method,
    param: { bId },
    payload: {
      steps
    }
  })
}

export function fetchUpdateBucketListStep(
  bId: string,
  step: Partial<TStep>
) {
  return request.request({
    prefix: `${stepPrefix}${stepPath}`,
    path: updateSteps.path,
    method: updateSteps.method,
    param: { bId },
    payload: step
  })
}

export function fetchRemoteBucketListStep(
  bId: string,
  stepIds: string[]
) {
  return request.request({
    prefix: `${stepPrefix}${stepPath}`,
    path: updateSteps.path,
    method: updateSteps.method,
    param: { bId },
    payload: { stepIds }
  })
}

export function fetchCompleteBucketListStep(
  bId: string,
  stepId: string
) {
  return request.request({
    prefix: `${stepPrefix}${stepPath}`,
    path: completeStep.path,
    method: completeStep.method,
    param: { bId },
    payload: { id: stepId }
  })
}

export function fetchUncompleteBucketListStep(
  bId: string,
  stepId: string
) {
  return request.request({
    prefix: `${stepPrefix}${stepPath}`,
    path: uncompleteStep.path,
    method: uncompleteStep.method,
    param: { bId },
    payload: { id: stepId }
  })
}