import { NextRequest, NextResponse } from 'next/server';
import { BucketListService } from '@/services/bucketList/service';
import { LoginService } from '@/services/user/login.service';
import { handleResponse } from '@/services/response-handler';
import { ModuleEnum, OperationEnum } from '@/services/response-handler/constant';
import { getUuid } from '@/utils';

// 获取用户ID的辅助函数
function getUserIdFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.replace('Bearer ', '');
  if (!accessToken) return null;

  const tokenInfo = LoginService.getUserIdFromAccessToken(accessToken);
  return tokenInfo?.userId || null;
}

// GET /api/bucket-list
export async function GET(request: NextRequest) {
  const requestId = getUuid();
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ code: 401, message: '未授权' });
  }

  const response = await handleResponse({
    promise: BucketListService.getBucketListsByCreatorId(userId),
    userId,
    requestId,
    requestInfo: {
      url: request.url
    },
    module: ModuleEnum.BUCKET_LIST,
    operation: OperationEnum.QUERY_LIST
  });

  return NextResponse.json(response);
}

// POST /api/bucket-list
export async function POST(request: NextRequest) {
  const requestId = getUuid();
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ code: 401, message: '未授权' });
  }

  const body = await request.json();

  const response = await handleResponse({
    promise: BucketListService.createBucketList({
      ...body,
      creatorId: userId
    }, userId),
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

// PUT /api/bucket-list
export async function PUT(request: NextRequest) {
  const requestId = getUuid();
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ code: 401, message: '未授权' });
  }

  const body = await request.json();
  const { id, ...updateData } = body;

  if (!id) {
    return NextResponse.json({ code: 400, message: '清单ID不能为空' });
  }

  const response = await handleResponse({
    promise: BucketListService.updateBucketList(id, userId, updateData),
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

// DELETE /api/bucket-list
export async function DELETE(request: NextRequest) {
  const requestId = getUuid();
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ code: 401, message: '未授权' });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ code: 400, message: '清单ID不能为空' });
  }

  const response = await handleResponse({
    promise: BucketListService.deleteBucketList(id, userId),
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