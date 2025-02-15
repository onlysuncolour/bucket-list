import { LoginModel } from './login.model';
import { TUserEntity } from 'bucket-list-types';
import { UserModel } from './model';
import { getUuid } from '@/utils';

export interface LoginResponse {
  user: TUserEntity;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class LoginService {
  // 生成刷新令牌
  private static async generateRefreshToken(userId: string): Promise<string> {
    const token = getUuid();
    const expiredAt = LoginModel.calculateRefreshTokenExpiry();
    await LoginModel.createRefreshToken(userId, token, expiredAt);
    return token;
  }

  // 生成令牌对
  private static async generateTokenPair(userId: string): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      LoginModel.generateAccessToken(userId),
      this.generateRefreshToken(userId)
    ]);

    return { accessToken, refreshToken };
  }

  // 通过设备 UUID 登录
  static async loginWithDeviceUuid(deviceUuid: string): Promise<LoginResponse | null> {
    let user = await LoginModel.getUserByDeviceUuid(deviceUuid);

    if (!user) {
      // 如果用户不存在，创建新用户
      const userId = await UserModel.create({
        device_uuid: deviceUuid,
        display_name: `用户${deviceUuid.slice(0, 6)}`,
      });
      user = await UserModel.findById(userId);
      if (!user) return null;
    }

    await LoginModel.updateLastLoginAt(user.id);
    const tokens = await this.generateTokenPair(user.id);

    return {
      user,
      ...tokens
    };
  }

  // 通过邮箱和验证码登录
  static async loginWithEmailAndCode(email: string, code: string): Promise<LoginResponse | null> {
    // 注意：这里需要实现验证码的验证逻辑
    // const isValidCode = await verifyEmailCode(email, code);
    // if (!isValidCode) {
    //   return null;
    // }

    let user = await LoginModel.getUserByEmail(email);

    if (!user) {
      // 如果用户不存在，创建新用户
      const userId = await UserModel.create({
        email,
        display_name: `用户${email.split('@')[0]}`,
      });
      user = await UserModel.findById(userId);
      if (!user) return null;
    }

    await LoginModel.updateLastLoginAt(user.id);
    const tokens = await this.generateTokenPair(user.id);

    return {
      user,
      ...tokens
    };
  }

  // 刷新访问令牌
  static async refreshAccessToken(refreshToken: string): Promise<string | null> {
    const tokenInfo = await LoginModel.getRefreshTokenByToken(refreshToken);
    if (!tokenInfo) {
      return null;
    }

    return LoginModel.generateAccessToken(tokenInfo.userId);
  }

  // 登出
  static async logout(refreshToken: string): Promise<boolean> {
    return LoginModel.revokeRefreshToken(refreshToken);
  }

  // 验证访问令牌
  static getUserIdFromAccessToken(accessToken: string): { userId: string } | null {
    return LoginModel.verifyAccessToken(accessToken);
  }
  // 通过刷新令牌获取用户信息
  static async getUserByRefreshToken(refreshToken: string): Promise<TUserEntity | null> {
    const tokenInfo = await LoginModel.getRefreshTokenByToken(refreshToken);
    if (!tokenInfo) {
      return null;
    }

    return UserModel.findById(tokenInfo.userId);
  }
}