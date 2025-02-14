// import { v4 as uuidv4 } from 'uuid';
import { getUuid } from '@/utils';
import jwt from 'jsonwebtoken';
import { LoginModel } from './login.model';
import { TUserEntity } from 'bucket-list-types';
import { UserModel } from './model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const ACCESS_TOKEN_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 365;

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
  // 生成访问令牌
  private static generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
  }

  // 生成刷新令牌
  private static async generateRefreshToken(userId: string): Promise<string> {
    const token = getUuid();
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);

    await LoginModel.createRefreshToken(userId, token, expiredAt);
    return token;
  }

  // 生成令牌对
  private static async generateTokenPair(userId: string): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId),
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

    return this.generateAccessToken(tokenInfo.userId);
  }

  // 登出
  static async logout(refreshToken: string): Promise<boolean> {
    return LoginModel.revokeRefreshToken(refreshToken);
  }

  // 验证访问令牌
  static verifyAccessToken(accessToken: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET) as { userId: string };
      return decoded;
    } catch (error) {
      return null;
    }
  }
}