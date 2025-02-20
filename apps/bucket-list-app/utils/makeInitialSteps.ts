import { TStepInit } from "bucket-list-types";
import { getUuid } from "./uuid";

export function makeInitialSteps(
  steps: TStepInit[],
  options?: {
    parentStepId?: string;
    bucketListId?: string
  }
) {

  steps.forEach(step => {
    step.uuid = getUuid();
    step.isCompleted = false;
    if (options?.parentStepId) {
      step.parentStepId = options.parentStepId;
    }
    if (options?.bucketListId) {
      step.bucketListId = options.bucketListId;
    }
    if (step.steps) {
      makeInitialSteps(step.steps, {
        // parentStepId: step.uuid,
        bucketListId: options?.bucketListId
      })
    }
  })
  return steps
}