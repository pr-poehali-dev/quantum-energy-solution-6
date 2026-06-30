CREATE TABLE forum_categories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  topic_count INT DEFAULT 0,
  post_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE forum_topics (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES forum_categories(id),
  user_id INT REFERENCES forum_users(id),
  title VARCHAR(255) NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  is_info BOOLEAN DEFAULT FALSE,
  reply_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  last_post_at TIMESTAMP DEFAULT NOW(),
  last_post_user_id INT REFERENCES forum_users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE forum_posts (
  id SERIAL PRIMARY KEY,
  topic_id INT REFERENCES forum_topics(id),
  user_id INT REFERENCES forum_users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);