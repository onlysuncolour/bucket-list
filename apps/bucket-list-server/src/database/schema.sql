-- use bucket_list;

-- 创建遗愿清单表
CREATE TABLE IF NOT EXISTS bucket_lists (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  creator_id VARCHAR(36) NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE
);

-- 创建步骤表
CREATE TABLE IF NOT EXISTS steps (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  bucket_list_id VARCHAR(36) NOT NULL,
  parent_step_id VARCHAR(36),
  category VARCHAR(100),
  tags JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  creator_id VARCHAR(36) NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (bucket_list_id) REFERENCES bucket_lists(id),
  FOREIGN KEY (parent_step_id) REFERENCES steps(id)
);

-- 创建评论表
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(36) PRIMARY KEY,
  content TEXT NOT NULL,
  bucket_list_id VARCHAR(36),
  step_id VARCHAR(36),
  reply_to_comment_id VARCHAR(36),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  creator_id VARCHAR(36) NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (bucket_list_id) REFERENCES bucket_lists(id),
  FOREIGN KEY (step_id) REFERENCES steps(id),
  FOREIGN KEY (reply_to_comment_id) REFERENCES comments(id)
);

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone_number VARCHAR(20) UNIQUE,
  apple_id VARCHAR(255) UNIQUE,
  google_id VARCHAR(255) UNIQUE,
  wechat_id VARCHAR(255) UNIQUE,
  avatar_url VARCHAR(255),
  display_name VARCHAR(100),
  device_uuid VARCHAR(255) UNIQUE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- 创建刷新令牌表
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expired_at TIMESTAMP NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建标签表
CREATE TABLE IF NOT EXISTS bucket_tags (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- 创建遗愿清单标签关联表
CREATE TABLE IF NOT EXISTS bucket_list_tags (
  id VARCHAR(36) PRIMARY KEY,
  bucket_list_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  tag_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (bucket_list_id) REFERENCES bucket_lists(id),
  FOREIGN KEY (tag_id) REFERENCES bucket_tags(id)
);

-- 创建遗愿清单分享表
CREATE TABLE IF NOT EXISTS bucket_list_shares (
  id VARCHAR(36) PRIMARY KEY,
  bucket_list_id VARCHAR(36) NOT NULL,
  creator_id VARCHAR(36) NOT NULL,
  share_to_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bucket_list_id) REFERENCES bucket_lists(id),
  FOREIGN KEY (creator_id) REFERENCES users(id),
  FOREIGN KEY (share_to_id) REFERENCES users(id)
);

ALTER TABLE bucket_lists
ADD COLUMN step_count INT NOT NULL DEFAULT 0,
ADD COLUMN completed_step_count INT NOT NULL DEFAULT 0;