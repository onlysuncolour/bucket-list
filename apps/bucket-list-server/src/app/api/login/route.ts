import { NextRequest, NextResponse } from 'next/server';
import { LoginService } from '@/services/user/login.service';
import { handleResponse } from '@/services/response-handler';
import { ModuleEnum, OperationEnum } from '@/services/response-handler/constant';
import { getUuid } from '@/utils';

// POST /api/login
export async function POST(request: NextRequest) {
  const requestId = getUuid();
  const body = await request.json();
  const { deviceUuid, email, code } = body;

  let loginPromise;
  if (deviceUuid) {
    loginPromise = LoginService.loginWithDeviceUuid(deviceUuid);
  } else if (email && code) {
    loginPromise = LoginService.loginWithEmailAndCode(email, code);
  } else {
    return NextResponse.json({ code: 400, message: '无效的登录参数' });
  }

  const response = await handleResponse({
    promise: loginPromise,
    userId: 'anonymous', // 登录时用户ID未知
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