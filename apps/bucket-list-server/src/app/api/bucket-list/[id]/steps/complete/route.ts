import { BucketListService } from "@/services/bucketList/service";
import { handleResponse } from "@/services/response-handler";
import { ModuleEnum, OperationEnum } from "@/services/response-handler/constant";
import { getUserIdFromRequest, getUuid } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/bucket-list/[id]/steps/complete
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = getUuid();
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ code: 401, message: '未授权' });
  }

  const body = await request.json();
  const { stepIds } = body;

  const response = await handleResponse({
    promise: BucketListService.completeStep(stepIds, userId, true),
    userId,
    requestId,
    requestInfo: {
      url: request.url
    },
    module: ModuleEnum.STEP,
    operation: OperationEnum.UPDATE
  });

  return NextResponse.json(response);
}