import { TStep, TStepInit } from "bucket-list-types";

export function fixSteps(steps: (TStep | TStepInit)[]): (TStep | TStepInit)[] {
  return steps
    .map(step => fixStep(step))
    .filter(step => !!step);
}

function fixStep(step: TStep | TStepInit): TStep | TStepInit | null {
  let steps = step.steps ? step.steps.map(s => fixStep(s)).filter(s => !!s) : undefined;
  if ((!steps || steps.length === 0) && !step.title) {
    return null
  }
  return {
    ...step,
    steps: steps
  }
}