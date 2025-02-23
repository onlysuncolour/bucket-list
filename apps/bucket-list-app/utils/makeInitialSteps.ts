import { TStepInit } from "bucket-list-types";
import { getUuid } from "./uuid";

export function makeInitialSteps(
  steps: TStepInit[],
  options?: {
    parentStepId?: string;
    bucketListId?: string
  },
  uuidPrefix = '0-'
) {
  steps.forEach((step, index) => {
    step.uuid = `${uuidPrefix}${index}`;
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
      },
        `${step.uuid}-`
      )
    }
  })
  return steps
}