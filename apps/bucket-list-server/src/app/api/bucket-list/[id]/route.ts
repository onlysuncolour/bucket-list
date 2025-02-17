import { NextRequest, NextResponse } from 'next/server';
import { BucketListService } from '@/services/bucketList/service';
import { handleResponse } from '@/services/response-handler';
import { ModuleEnum, OperationEnum } from '@/services/response-handler/constant';
import { getUuid, getUserIdFromRequest } from '@/utils';

// GET /api/bucket-list/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = getUuid();
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ code: 401, message: '未授权' });
  }

  const response = await handleResponse({
    promise: BucketListService.getBucketListById(params.id, userId),
    userId,
    requestId,
    requestInfo: {
      url: request.url
    },
    module: ModuleEnum.BUCKET_LIST,
    operation: OperationEnum.QUERY_ITEM
  });

  return NextResponse.json(response);
}

