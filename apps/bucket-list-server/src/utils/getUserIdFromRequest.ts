import { LoginService } from "@/services/user/login.service";
import { NextRequest } from "next/server";

// 获取用户ID的辅助函数
export function getUserIdFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.replace('Bearer ', '');
  if (!accessToken) return null;

  const tokenInfo = LoginService.getUserIdFromAccessToken(accessToken);
  return tokenInfo?.userId || null;
}