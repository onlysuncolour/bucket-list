import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { TServerResponse } from 'bucket-list-types';

interface RequestConfig extends AxiosRequestConfig {
  prefix?: string;
  isStream?: boolean;
  noAccessToken?: boolean;
}

interface TokenStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Web平台的Token存储实现
class WebTokenStorage implements TokenStorage {
  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
}

// Mobile平台的Token存储实现
class MobileTokenStorage implements TokenStorage {
  async getItem(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }
}

// 根据平台选择合适的Token存储实现
const tokenStorage: TokenStorage = Platform.OS === 'web' ? new WebTokenStorage() : new MobileTokenStorage();

class Request {
  private instance: AxiosInstance;
  private isRefreshing: boolean = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.API_HOST,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      async (config) => {
        if (!(config as RequestConfig).noAccessToken) {
          const token = await this.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // 如果是401错误且不是刷新token的请求，尝试刷新token
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // 如果正在刷新，将请求加入队列
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.instance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const token = await this.refreshToken();
            if (token) {
              this.refreshSubscribers.forEach((callback) => callback(token));
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            }
          } catch (error) {
            // Token刷新失败，清除token并返回错误
            await this.clearTokens();
          } finally {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async getAccessToken(): Promise<string | null> {
    return tokenStorage.getItem('accessToken');
  }

  private async getRefreshToken(): Promise<string | null> {
    return tokenStorage.getItem('refreshToken');
  }

  async setAccessToken(token: string): Promise<void> {
    await tokenStorage.setItem('accessToken', token);
  }

  async setRefreshToken(token: string): Promise<void> {
    await tokenStorage.setItem('refreshToken', token);
  }

  private async clearTokens(): Promise<void> {
    await Promise.all([
      tokenStorage.removeItem('accessToken'),
      tokenStorage.removeItem('refreshToken')
    ]);
  }

  private async refreshToken(): Promise<string | null> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await this.instance.post('/refresh', { refreshToken }, { noAccessToken: true } as RequestConfig);
      const { accessToken } = response.data;
      await this.setAccessToken(accessToken);
      return accessToken;
    } catch (error) {
      await this.clearTokens();
      return null;
    }
  }

  private handleRequestError(error: any): never {
    let serverError: TServerResponse<any>;

    if (error.response) {
      // 服务器响应了请求，但状态码不是2xx
      const { data, status } = error.response;
      if (data && typeof data === 'object' && 'code' in data) {
        // 服务器返回了标准的错误响应格式
        serverError = data;
      } else {
        // 服务器返回了非标准格式的错误
        serverError = {
          code: status,
          message: data?.message || '服务器错误',
          stackMessage: error.stack
        };
      }
    } else if (error.request) {
      // 请求已发出，但未收到响应
      serverError = {
        code: -1,
        message: '网络错误，请检查网络连接',
        stackMessage: error.stack
      };
    } else {
      // 请求配置出错
      serverError = {
        code: -2,
        message: error.message || '请求配置错误',
        stackMessage: error.stack
      };
    }

    throw serverError;
  }

  async request<T = any>({
    path,
    prefix = '',
    method = 'GET',
    payload,
    query,
    isStream = false,
    noAccessToken = false,
    ...config
  }: {
    path: string;
    prefix?: string;
    method?: string;
    payload?: any;
    query?: Record<string, any>;
    isStream?: boolean;
    noAccessToken?: boolean;
  } & Omit<AxiosRequestConfig, 'url' | 'method' | 'data' | 'params'>): Promise<T> {
    const url = `${prefix}${path}`;
    const requestConfig: RequestConfig = {
      ...config,
      url,
      method,
      noAccessToken,
    };

    // 处理查询参数
    if (query) {
      requestConfig.params = query;
    }

    // 处理请求体
    if (payload) {
      requestConfig.data = payload;
    }

    // 处理流式请求
    if (isStream) {
      requestConfig.responseType = 'stream';
    }

    try {
      const response = await this.instance.request<TServerResponse<T>>(requestConfig);
      const serverResponse = response.data;

      if (serverResponse.code === 0) {
        return serverResponse.data as T;
      } else {
        throw serverResponse;
      }
    } catch (error) {
      this.handleRequestError(error);
    }
  }
}

export const request = new Request();