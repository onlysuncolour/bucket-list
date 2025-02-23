import { TStep, TStepInit } from "bucket-list-types";

export function getBucketListCount(steps: (TStep | TStepInit)[]) {
  let stepCount = 0, stepCompleteCount = 0;
  steps.forEach(s => {
    stepCount++
    if (s.isCompleted) {
      stepCompleteCount++;
    }
    if (s.steps) {
      const { stepCount: childCount, stepCompleteCount: childCompletedCount } = getBucketListCount(s.steps);
      stepCount += childCount;
      stepCompleteCount += childCompletedCount;
    }
  })
  return {
    stepCount, stepCompleteCount
  }
}