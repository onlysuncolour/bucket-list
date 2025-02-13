import { ModuleEnum, OperationEnum } from './constant';
import { TServerCommonError, TServerResponse } from 'bucket-list-types';

// 日志记录接口
type LogLevel = 'info' | 'warn' | 'error';
interface Logger {
  log: (level: LogLevel, message: string, details?: any) => void;
}

// 默认日志记录实现
const defaultLogger: Logger = {
  log: (level: LogLevel, message: string, details?: any) => {
    const logMessage = {
      level,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
    console[level](JSON.stringify(logMessage));
  },
};

// 请求信息接口
interface RequestInfo {
  url: string;
  params?: Record<string, any>;
  body?: Record<string, any>;
}

// 响应处理配置
interface ResponseHandlerConfig {
  logger?: Logger;
}

let currentLogger = defaultLogger;

// 初始化响应处理配置
export function initializeResponseHandler(config?: ResponseHandlerConfig) {
  if (config?.logger) {
    currentLogger = config.logger;
  }
}

// 响应处理函数参数接口
interface HandleResponseParams<T> {
  promise: Promise<T> | (() => Promise<T>);
  userId: string;
  requestId: string;
  requestInfo: RequestInfo;
  module: ModuleEnum;
  operation: OperationEnum;
}

// 响应处理函数
export async function handleResponse<T>(
  params: HandleResponseParams<T>
): Promise<TServerResponse<T>> {
  const { promise, userId, requestId, requestInfo, module, operation } = params;

  try {
    // 记录请求日志
    currentLogger.log('info', `Request received`, {
      requestId,
      userId,
      module,
      operation,
      requestInfo,
    });

    // 执行异步操作
    const data = await (typeof promise === 'function' ? promise() : promise);

    // 记录成功响应日志
    currentLogger.log('info', `Request completed successfully`, {
      requestId,
      userId,
      module,
      operation,
    });

    // 返回成功响应
    return {
      code: 0,
      data,
    };
  } catch (error) {
    // 确保错误是 TServerCommonError 类型
    const serverError = error as TServerCommonError;

    // 记录错误日志
    currentLogger.log('error', `Request failed`, {
      requestId,
      userId,
      module,
      operation,
      error: serverError,
    });

    // 返回错误响应
    return {
      code: serverError.code,
      message: serverError.message,
      stackMessage: serverError.stackMessage,
    };
  }
}