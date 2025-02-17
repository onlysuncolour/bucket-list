import { NextRequest, NextResponse } from 'next/server';
import { BucketListService } from '@/services/bucketList/service';
import { handleResponse } from '@/services/response-handler';
import { ModuleEnum, OperationEnum } from '@/services/response-handler/constant';
import { getUuid, getUserIdFromRequest } from '@/utils';

// POST /api/bucket-list/[id]/steps
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = getUuid();
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ code: 401, message: '未授权' });
  }

  const body = await request.json();
  const { steps } = body;

  const response = await handleResponse({
    promise: BucketListService.addSteps(params.id, userId, steps),
    userId,
    requestId,
    requestInfo: {
      url: request.url,
      body
    },
    module: ModuleEnum.BUCKET_LIST,
    operation: OperationEnum.CREATE
  });

  return NextResponse.json(response);
}

// PUT /api/bucket-list/[id]/steps
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = getUuid();
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ code: 401, message: '未授权' });
  }

  const body = await request.json();
  const { stepId, ...updateData } = body;

  if (!stepId) {
    return NextResponse.json({ code: 400, message: '步骤ID不能为空' });
  }

  const response = await handleResponse({
    promise: BucketListService.updateStep(stepId, userId, updateData),
    userId,
    requestId,
    requestInfo: {
      url: request.url,
      body
    },
    module: ModuleEnum.BUCKET_LIST,
    operation: OperationEnum.UPDATE
  });

  return NextResponse.json(response);
}

// DELETE /api/bucket-list/[id]/steps
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = getUuid();
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ code: 401, message: '未授权' });
  }

  const body = await request.json();
  const { stepIds } = body;

  if (!stepIds) {
    return NextResponse.json({ code: 400, message: '步骤ID不能为空' });
  }

  const response = await handleResponse({
    promise: BucketListService.removeSteps(stepIds, userId),
    userId,
    requestId,
    requestInfo: {
      url: request.url,
      body
    },
    module: ModuleEnum.BUCKET_LIST,
    operation: OperationEnum.DELETE
  });

  return NextResponse.json(response);
}