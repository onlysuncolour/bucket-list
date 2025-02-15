import { NextRequest, NextResponse } from 'next/server';
import { LoginService } from '@/services/user/login.service';
import { handleResponse } from '@/services/response-handler';
import { ModuleEnum, OperationEnum } from '@/services/response-handler/constant';
import { getUuid } from '@/utils';

// POST /api/refresh
export async function POST(request: NextRequest) {
  const requestId = getUuid();
  const body = await request.json();
  const { refreshToken } = body;

  if (!refreshToken) {
    return NextResponse.json({ code: 400, message: '刷新令牌不能为空' });
  }

  const response = await handleResponse({
    promise: LoginService.refreshAccessToken(refreshToken),
    userId: 'anonymous', // 刷新令牌时用户ID未知
    requestId,
    requestInfo: {
      url: request.url,
      body
    },
    module: ModuleEnum.LOGIN,
    operation: OperationEnum.LOGIN
  });

  return NextResponse.json(response);
}