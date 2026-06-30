CREATE TABLE forum_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',
  post_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);