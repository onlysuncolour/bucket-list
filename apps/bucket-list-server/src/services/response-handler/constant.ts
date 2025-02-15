// 模块枚举
export enum ModuleEnum {
  USER = 'USER',           // 用户模块
  LOGIN = 'LOGIN',
  BUCKET_LIST = 'BUCKET_LIST', // 清单模块
  STEP = 'STEP',           // 步骤模块
  COMMENT = 'COMMENT',     // 评论模块
}

// 操作类型枚举
export enum OperationEnum {
  // 查询操作
  QUERY_ITEM = 'QUERY_ITEM',   // 查询单个项目
  QUERY_LIST = 'QUERY_LIST',   // 查询列表
  
  // 修改操作
  CREATE = 'CREATE',           // 创建
  UPDATE = 'UPDATE',           // 更新
  DELETE = 'DELETE',           // 删除
  
  // 特殊操作
  LOGIN = 'LOGIN',             // 登录
  REGISTER = 'REGISTER',       // 注册
  UPLOAD = 'UPLOAD',          // 上传
  DOWNLOAD = 'DOWNLOAD',      // 下载
}