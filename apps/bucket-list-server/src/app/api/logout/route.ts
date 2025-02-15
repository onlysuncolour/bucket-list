import { NextRequest, NextResponse } from 'next/server';
import { LoginService } from '@/services/user/login.service';
import { handleResponse } from '@/services/response-handler';
import { ModuleEnum, OperationEnum } from '@/services/response-handler/constant';
import { getUuid } from '@/utils';

// POST /api/logout
export async function POST(request: NextRequest) {
  const requestId = getUuid();
  const body = await request.json();
  const { refreshToken } = body;

  if (!refreshToken) {
    return NextResponse.json({ code: 400, message: '刷新令牌不能为空' });
  }

  // 从请求头获取访问令牌
  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.replace('Bearer ', '');
  
  if (!accessToken) {
    return NextResponse.json({ code: 401, message: '未授权' });
  }

  // 获取用户ID
  const tokenInfo = LoginService.getUserIdFromAccessToken(accessToken);
  if (!tokenInfo) {
    return NextResponse.json({ code: 401, message: '无效的访问令牌' });
  }

  const response = await handleResponse({
    promise: LoginService.logout(refreshToken),
    userId: tokenInfo.userId,
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