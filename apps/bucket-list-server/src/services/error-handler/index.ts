import {TServerCommonError} from 'bucket-list-types'

// 错误类型枚举
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',      // 参数验证错误
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR', // 认证错误
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',   // 授权错误
  BUSINESS_ERROR = 'BUSINESS_ERROR',           // 业务逻辑错误
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',         // 资源未找到
  REQUEST_ERROR = 'REQUEST_ERROR',             // 请求错误（默认错误类型）
  INTERNAL_ERROR = 'INTERNAL_ERROR',           // 内部服务器错误
}



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

// 错误处理配置
interface ErrorHandlerConfig {
  logger?: Logger;
}

let currentLogger = defaultLogger;

// 初始化错误处理配置
export function initializeErrorHandler(config?: ErrorHandlerConfig) {
  if (config?.logger) {
    currentLogger = config.logger;
  }
}

// 获取错误类型
function getErrorType(error: Error): ErrorType {
  // 可以根据错误实例的类型或属性来判断错误类型
  // 这里提供一个简单的示例实现
  if (error.name === 'ValidationError') {
    return ErrorType.VALIDATION_ERROR;
  }
  if (error.name === 'AuthenticationError') {
    return ErrorType.AUTHENTICATION_ERROR;
  }
  if (error.name === 'AuthorizationError') {
    return ErrorType.AUTHORIZATION_ERROR;
  }
  if (error.name === 'NotFoundError') {
    return ErrorType.NOT_FOUND_ERROR;
  }
  if (error.name === 'BusinessError') {
    return ErrorType.BUSINESS_ERROR;
  }
  if (error instanceof TypeError || error instanceof ReferenceError) {
    return ErrorType.INTERNAL_ERROR;
  }
  
  // 默认为请求错误
  return ErrorType.REQUEST_ERROR;
}

// 处理错误并返回统一的错误响应
export function handleError(error: Error): TServerCommonError {
  const errorType = getErrorType(error);
  
  // 记录错误日志
  currentLogger.log(
    'error',
    `[${errorType}] ${error.message}`,
    {
      stack: error.stack,
      name: error.name,
    }
  );

  // 根据错误类型设置适当的 HTTP 状态码
  let statusCode = 500;
  switch (errorType) {
    case ErrorType.VALIDATION_ERROR:
      statusCode = 400;
      break;
    case ErrorType.AUTHENTICATION_ERROR:
      statusCode = 401;
      break;
    case ErrorType.AUTHORIZATION_ERROR:
      statusCode = 403;
      break;
    case ErrorType.NOT_FOUND_ERROR:
      statusCode = 404;
      break;
    case ErrorType.BUSINESS_ERROR:
      statusCode = 422;
      break;
    case ErrorType.REQUEST_ERROR:
      statusCode = 400;
      break;
    case ErrorType.INTERNAL_ERROR:
      statusCode = 500;
      break;
  }

  return {
    code: statusCode,
    message: error.message,
    stackMessage: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };
}